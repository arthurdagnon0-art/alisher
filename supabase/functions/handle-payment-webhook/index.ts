import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface PaymentWebhook {
  transaction_id: string;
  amount: number;
  status: 'success' | 'failed';
  method: string;
  reference: string;
  user_phone?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData: PaymentWebhook = await req.json();

    // Trouver la transaction correspondante
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('reference', webhookData.reference)
      .eq('status', 'pending')
      .single();

    if (transactionError || !transaction) {
      throw new Error('Transaction non trouvée ou déjà traitée');
    }

    if (webhookData.status === 'success') {
      // Approuver la transaction
      await supabaseAdmin
        .from('transactions')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          admin_notes: 'Approuvé automatiquement via webhook'
        })
        .eq('id', transaction.id);

      // Si c'est un dépôt, créditer le solde
      if (transaction.type === 'deposit') {
        await supabaseAdmin.rpc('update_user_balance', {
          user_id: transaction.user_id,
          amount: transaction.amount,
          balance_type: 'deposit'
        });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Transaction approuvée automatiquement',
          transaction_id: transaction.id
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
    } else {
      // Rejeter la transaction
      await supabaseAdmin
        .from('transactions')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          admin_notes: 'Rejeté automatiquement - paiement échoué'
        })
        .eq('id', transaction.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Transaction rejetée automatiquement',
          transaction_id: transaction.id
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
    }

  } catch (error: any) {
    console.error('Erreur dans handle-payment-webhook:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur lors du traitement du webhook'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
});