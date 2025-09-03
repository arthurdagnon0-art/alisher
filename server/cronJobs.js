const cron = require('node-cron');
const { supabaseAdmin } = require('../src/lib/supabase');

// Job pour calculer les revenus quotidiens - Tous les jours à 00:01
cron.schedule('1 0 * * *', async () => {
  console.log('🚀 Démarrage du calcul des revenus quotidiens...');
  
  try {
    await calculateDailyEarnings();
    console.log('✅ Calcul des revenus quotidiens terminé');
  } catch (error) {
    console.error('❌ Erreur lors du calcul des revenus:', error);
  }
});

// Job pour vérifier les investissements staking arrivés à échéance - Tous les jours à 00:30
cron.schedule('30 0 * * *', async () => {
  console.log('🚀 Vérification des investissements staking...');
  
  try {
    await checkStakingMaturity();
    console.log('✅ Vérification des investissements staking terminée');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification staking:', error);
  }
});

// Job pour nettoyer les anciennes données - Tous les dimanches à 02:00
cron.schedule('0 2 * * 0', async () => {
  console.log('🚀 Nettoyage des anciennes données...');
  
  try {
    await cleanupOldData();
    console.log('✅ Nettoyage terminé');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
});

// Fonction pour calculer les revenus quotidiens
async function calculateDailyEarnings() {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Récupérer tous les investissements VIP actifs
    const { data: vipInvestments, error: vipError } = await supabaseAdmin
      .from('vip_investments')
      .select('*')
      .eq('status', 'active');

    if (vipError) throw vipError;

    // Traiter chaque investissement VIP
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

        // Mettre à jour le total gagné et le solde de retrait
        await supabaseAdmin
          .from('vip_investments')
          .update({
            total_earned: investment.total_earned + investment.daily_earnings,
            updated_at: new Date().toISOString()
          })
          .eq('id', investment.id);

        await supabaseAdmin
          .from('users')
          .update({
            balance_withdrawal: supabaseAdmin.sql`balance_withdrawal + ${investment.daily_earnings}`,
            total_earned: supabaseAdmin.sql`total_earned + ${investment.daily_earnings}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', investment.user_id);

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

        console.log(`💰 Revenu VIP calculé: ${investment.daily_earnings} FCFA pour l'utilisateur ${investment.user_id}`);
      }
    }

    // Récupérer tous les investissements staking actifs
    const { data: stakingInvestments, error: stakingError } = await supabaseAdmin
      .from('staking_investments')
      .select('*')
      .eq('status', 'active');

    if (stakingError) throw stakingError;

    // Traiter chaque investissement staking
    for (const investment of stakingInvestments || []) {
      const unlockDate = new Date(investment.unlock_date);
      const now = new Date();

      // Vérifier si l'investissement n'est pas encore arrivé à échéance
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

          // Mettre à jour le total gagné et le solde de retrait
          await supabaseAdmin
            .from('staking_investments')
            .update({
              total_earned: investment.total_earned + investment.daily_earnings,
              updated_at: new Date().toISOString()
            })
            .eq('id', investment.id);

          await supabaseAdmin
            .from('users')
            .update({
              balance_withdrawal: supabaseAdmin.sql`balance_withdrawal + ${investment.daily_earnings}`,
              total_earned: supabaseAdmin.sql`total_earned + ${investment.daily_earnings}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', investment.user_id);

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

          console.log(`💰 Revenu Staking calculé: ${investment.daily_earnings} FCFA pour l'utilisateur ${investment.user_id}`);
        }
      }
    }

    console.log(`✅ Revenus quotidiens calculés pour ${(vipInvestments?.length || 0) + (stakingInvestments?.length || 0)} investissements`);
  } catch (error) {
    console.error('❌ Erreur dans calculateDailyEarnings:', error);
    throw error;
  }
}

// Fonction pour vérifier les investissements staking arrivés à échéance
async function checkStakingMaturity() {
  try {
    const now = new Date().toISOString();

    // Récupérer les investissements staking arrivés à échéance
    const { data: maturedInvestments, error } = await supabaseAdmin
      .from('staking_investments')
      .select('*')
      .eq('status', 'active')
      .lte('unlock_date', now);

    if (error) throw error;

    for (const investment of maturedInvestments || []) {
      // Marquer l'investissement comme terminé
      await supabaseAdmin
        .from('staking_investments')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', investment.id);

      // Rembourser le capital initial au solde de retrait
      await supabaseAdmin
        .from('users')
        .update({
          balance_withdrawal: supabaseAdmin.sql`balance_withdrawal + ${investment.amount}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', investment.user_id);

      // Créer la transaction de remboursement
      await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: investment.user_id,
          type: 'earning',
          amount: investment.amount,
          status: 'completed',
          reference: `STAKE-REFUND-${investment.id.substring(0, 8)}`
        });

      console.log(`🎯 Investissement staking terminé: ${investment.amount} FCFA remboursé à l'utilisateur ${investment.user_id}`);
    }

    console.log(`✅ ${maturedInvestments?.length || 0} investissements staking traités`);
  } catch (error) {
    console.error('❌ Erreur dans checkStakingMaturity:', error);
    throw error;
  }
}

// Fonction pour nettoyer les anciennes données
async function cleanupOldData() {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const cutoffDate = sixMonthsAgo.toISOString();

    // Supprimer les anciennes transactions terminées (plus de 6 mois)
    const { error: transactionError } = await supabaseAdmin
      .from('transactions')
      .delete()
      .in('status', ['completed', 'rejected'])
      .lt('created_at', cutoffDate);

    if (transactionError) throw transactionError;

    // Supprimer les anciens revenus quotidiens (plus de 6 mois)
    const { error: earningsError } = await supabaseAdmin
      .from('daily_earnings')
      .delete()
      .lt('created_at', cutoffDate);

    if (earningsError) throw earningsError;

    console.log('✅ Nettoyage des données anciennes terminé');
  } catch (error) {
    console.error('❌ Erreur dans cleanupOldData:', error);
    throw error;
  }
}

module.exports = {
  calculateDailyEarnings,
  checkStakingMaturity,
  cleanupOldData
};