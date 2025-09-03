import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ReferralRequest {
  user_id: string;
  investment_amount: number;
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

    const { user_id, investment_amount }: ReferralRequest = await req.json();

    // Récupérer les taux de commission
    const { data: settings } = await supabaseAdmin
      .from('platform_settings')
      .select('value')
      .eq('key', 'referral_rates')
      .single();

    const rates = settings?.value || { level1: 11, level2: 2, level3: 1 };

    // Récupérer l'utilisateur avec son parrain
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('name, referred_by')
      .eq('id', user_id)
      .single();

    if (!user?.referred_by) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Aucun parrain trouvé',
          processed: 0
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
    }

    let processedBonuses = 0;

    // Niveau 1
    await createReferralBonus(
      supabaseAdmin,
      user.referred_by, 
      user_id, 
      user.name, 
      investment_amount, 
      rates.level1, 
      1
    );
    processedBonuses++;

    // Niveau 2
    const { data: level1Referrer } = await supabaseAdmin
      .from('users')
      .select('referred_by')
      .eq('id', user.referred_by)
      .single();

    if (level1Referrer?.referred_by) {
      await createReferralBonus(
        supabaseAdmin,
        level1Referrer.referred_by, 
        user_id, 
        user.name, 
        investment_amount, 
        rates.level2, 
        2
      );
      processedBonuses++;
    }

    // Niveau 3
    if (level1Referrer?.referred_by) {
      const { data: level2Referrer } = await supabaseAdmin
        .from('users')
        .select('referred_by')
        .eq('id', level1Referrer.referred_by)
        .single();

      if (level2Referrer?.referred_by) {
        await createReferralBonus(
          supabaseAdmin,
          level2Referrer.referred_by, 
          user_id, 
          user.name, 
          investment_amount, 
          rates.level3, 
          3
        );
        processedBonuses++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Commissions de parrainage traitées avec succès',
        processed: processedBonuses
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );

  } catch (error: any) {
    console.error('Erreur dans process-referral-bonuses:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur lors du traitement des commissions'
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

// Fonction pour créer une commission de parrainage
async function createReferralBonus(
  supabaseAdmin: any,
  referrerId: string,
  referredId: string,
  referredName: string,
  investmentAmount: number,
  percentage: number,
  level: number
) {
  const bonusAmount = (investmentAmount * percentage) / 100;

  // Créer la commission
  await supabaseAdmin
    .from('referral_bonuses')
    .insert({
      referrer_id: referrerId,
      referred_id: referredId,
      referred_name: referredName,
      level,
      amount: bonusAmount,
      percentage
    });

  // Ajouter au solde de retrait du parrain
  await supabaseAdmin.rpc('update_user_balance', {
    user_id: referrerId,
    amount: bonusAmount,
    balance_type: 'withdrawal'
  });

  // Créer la transaction
  await supabaseAdmin
    .from('transactions')
    .insert({
      user_id: referrerId,
      type: 'referral',
      amount: bonusAmount,
      status: 'completed',
      reference: `REF-L${level}-${referredId.substring(0, 8)}`
    });
}