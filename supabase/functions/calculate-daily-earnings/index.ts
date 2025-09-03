import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

    const today = new Date().toISOString().split('T')[0];

    // Calculer les revenus VIP
    const { data: vipInvestments, error: vipError } = await supabaseAdmin
      .from('vip_investments')
      .select('*')
      .eq('status', 'active');

    if (vipError) throw vipError;

    for (const investment of vipInvestments || []) {
      // Vérifier si les revenus ont déjà été calculés aujourd'hui
      const { data: existingEarning } = await supabaseAdmin
        .from('daily_earnings')
        .select('id')
        .eq('investment_id', investment.id)
        .eq('date', today)
        .single();

      if (!existingEarning) {
        // Créer le revenu quotidien
        await supabaseAdmin
          .from('daily_earnings')
          .insert({
            user_id: investment.user_id,
            investment_id: investment.id,
            investment_type: 'vip',
            amount: investment.daily_earnings,
            date: today
          });

        // Mettre à jour le total gagné
        await supabaseAdmin
          .from('vip_investments')
          .update({
            total_earned: investment.total_earned + investment.daily_earnings,
            updated_at: new Date().toISOString()
          })
          .eq('id', investment.id);

        // Mettre à jour le solde utilisateur
        await supabaseAdmin.rpc('update_user_balance', {
          user_id: investment.user_id,
          amount: investment.daily_earnings,
          balance_type: 'withdrawal'
        });

        // Créer la transaction
        await supabaseAdmin
          .from('transactions')
          .insert({
            user_id: investment.user_id,
            type: 'earning',
            amount: investment.daily_earnings,
            status: 'completed',
            reference: `VIP-EARN-${investment.id.substring(0, 8)}`
          });
      }
    }

    // Calculer les revenus Staking
    const { data: stakingInvestments, error: stakingError } = await supabaseAdmin
      .from('staking_investments')
      .select('*')
      .eq('status', 'active');

    if (stakingError) throw stakingError;

    for (const investment of stakingInvestments || []) {
      const unlockDate = new Date(investment.unlock_date);
      const now = new Date();

      if (now <= unlockDate) {
        // Vérifier si les revenus ont déjà été calculés aujourd'hui
        const { data: existingEarning } = await supabaseAdmin
          .from('daily_earnings')
          .select('id')
          .eq('investment_id', investment.id)
          .eq('date', today)
          .single();

        if (!existingEarning) {
          // Créer le revenu quotidien
          await supabaseAdmin
            .from('daily_earnings')
            .insert({
              user_id: investment.user_id,
              investment_id: investment.id,
              investment_type: 'staking',
              amount: investment.daily_earnings,
              date: today
            });

          // Mettre à jour le total gagné
          await supabaseAdmin
            .from('staking_investments')
            .update({
              total_earned: investment.total_earned + investment.daily_earnings,
              updated_at: new Date().toISOString()
            })
            .eq('id', investment.id);

          // Mettre à jour le solde utilisateur
          await supabaseAdmin.rpc('update_user_balance', {
            user_id: investment.user_id,
            amount: investment.daily_earnings,
            balance_type: 'withdrawal'
          });

          // Créer la transaction
          await supabaseAdmin
            .from('transactions')
            .insert({
              user_id: investment.user_id,
              type: 'earning',
              amount: investment.daily_earnings,
              status: 'completed',
              reference: `STAKE-EARN-${investment.id.substring(0, 8)}`
            });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Revenus quotidiens calculés avec succès',
        processed: {
          vip: vipInvestments?.length || 0,
          staking: stakingInvestments?.length || 0
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );

  } catch (error: any) {
    console.error('Erreur dans calculate-daily-earnings:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur lors du calcul des revenus'
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