import { supabase } from '../lib/supabase';
import { VIPPackage, StakingPlan, VIPInvestment, StakingInvestment } from '../types';
import { BalanceUtils } from '../utils/balanceUtils';

export class InvestmentService {
  // Récupérer tous les packages VIP actifs
  static async getVIPPackages() {
    try {
      const { data, error } = await supabase
        .from('vip_packages')
        .select('*')
        .eq('is_active', true)
        .order('min_amount', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Packages VIP récupérés avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des packages VIP'
      };
    }
  }

  // Récupérer tous les plans de staking actifs
  static async getStakingPlans() {
    try {
      const { data, error } = await supabase
        .from('staking_plans')
        .select('*')
        .eq('is_active', true)
        .order('duration_days', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Plans de staking récupérés avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des plans de staking'
      };
    }
  }

  // Créer un investissement VIP
  static async createVIPInvestment(userId: string, packageId: string, amount: number) {
    try {
      // Vérifier le package VIP
      const { data: vipPackage, error: packageError } = await supabase
        .from('vip_packages')
        .select('*')
        .eq('id', packageId)
        .eq('is_active', true)
        .single();

      if (packageError || !vipPackage) {
        throw new Error('Package VIP non trouvé ou inactif');
      }

      // Vérifier les montants
      if (amount < vipPackage.min_amount || amount > vipPackage.max_amount) {
        throw new Error(`Montant doit être entre ${vipPackage.min_amount} et ${vipPackage.max_amount} FCFA`);
      }

      // Vérifier le solde utilisateur
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance_deposit, balance_withdrawal, total_invested')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new Error('Utilisateur non trouvé');
      }

      console.log('💰 Vérification solde VIP:', {
        userId,
        amount,
        balance_deposit: user.balance_deposit,
        balance_withdrawal: user.balance_withdrawal,
        totalAvailable: BalanceUtils.getTotalAvailableBalance(user),
        total_invested: user.total_invested
      });

      // Le solde disponible pour investissement = balance_deposit + balance_withdrawal (solde total)
      const availableBalance = BalanceUtils.getTotalAvailableBalance(user);
      const investmentAmount = Number(amount);

      if (availableBalance < investmentAmount) {
        throw new Error('Solde insuffisant');
      }

      // Calculer les revenus quotidiens
      const dailyEarnings = (amount * vipPackage.daily_rate) / 100;

      // Créer l'investissement
      const { data: investment, error: investmentError } = await supabase
        .from('vip_investments')
        .insert({
          user_id: userId,
          package_id: packageId,
          package_name: vipPackage.name,
          amount,
          daily_earnings: dailyEarnings,
        })
        .select()
        .single();

      if (investmentError) throw investmentError;

      // Déduire intelligemment du solde total
      // Priorité: balance_withdrawal puis balance_deposit
      const balanceWithdrawal = Number(user.balance_withdrawal) || 0;
      const balanceDeposit = Number(user.balance_deposit) || 0;
      
      let newBalanceWithdrawal = balanceWithdrawal;
      let newBalanceDeposit = balanceDeposit;
      
      if (balanceWithdrawal >= investmentAmount) {
        // Déduire uniquement du balance_withdrawal
        newBalanceWithdrawal = balanceWithdrawal - investmentAmount;
      } else {
        // Déduire tout le balance_withdrawal et le reste du balance_deposit
        const remaining = investmentAmount - balanceWithdrawal;
        newBalanceWithdrawal = 0;
        newBalanceDeposit = balanceDeposit - remaining;
      }
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          balance_deposit: newBalanceDeposit,
          balance_withdrawal: newBalanceWithdrawal,
          total_invested: (Number(user.total_invested) || 0) + investmentAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Créer la transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'investment',
          amount,
          status: 'completed',
          reference: `VIP-${investment.id.substring(0, 8)}`
        });


      return {
        success: true,
        data: investment,
        message: 'Investissement VIP créé avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la création de l\'investissement VIP'
      };
    }
  }

  // Créer un investissement staking
  static async createStakingInvestment(userId: string, planId: string, amount: number) {
    try {
      // Vérifier le plan de staking
      const { data: stakingPlan, error: planError } = await supabase
        .from('staking_plans')
        .select('*')
        .eq('id', planId)
        .eq('is_active', true)
        .single();

      if (planError || !stakingPlan) {
        throw new Error('Plan de staking non trouvé ou inactif');
      }

      // Vérifier le montant minimum
      if (amount < stakingPlan.min_amount) {
        throw new Error(`Montant minimum: ${stakingPlan.min_amount} FCFA`);
      }

      // Vérifier le solde utilisateur
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance_deposit, balance_withdrawal, total_invested')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Le solde disponible pour staking = balance_deposit + balance_withdrawal (solde total)
      const availableBalance = BalanceUtils.getTotalAvailableBalance(user);
      
      if (availableBalance < amount) {
        throw new Error(`Solde disponible insuffisant. Disponible: FCFA${BalanceUtils.formatBalance(availableBalance)}, Requis: FCFA${BalanceUtils.formatBalance(amount)}`);
      }

      // Calculer les revenus quotidiens et la date de déblocage
      const dailyEarnings = (amount * stakingPlan.daily_rate) / 100;
      const unlockDate = new Date();
      unlockDate.setDate(unlockDate.getDate() + stakingPlan.duration_days);

      // Créer l'investissement
      const { data: investment, error: investmentError } = await supabase
        .from('staking_investments')
        .insert({
          user_id: userId,
          plan_id: planId,
          plan_name: stakingPlan.name,
          amount,
          daily_earnings: dailyEarnings,
          unlock_date: unlockDate.toISOString(),
        })
        .select()
        .single();

      if (investmentError) throw investmentError;

      // Déduire intelligemment du solde total
      // Priorité: balance_withdrawal puis balance_deposit
      const balanceWithdrawal = Number(user.balance_withdrawal) || 0;
      const balanceDeposit = Number(user.balance_deposit) || 0;
      
      let newBalanceWithdrawal = balanceWithdrawal;
      let newBalanceDeposit = balanceDeposit;
      
      if (balanceWithdrawal >= amount) {
        // Déduire uniquement du balance_withdrawal
        newBalanceWithdrawal = balanceWithdrawal - amount;
      } else {
        // Déduire tout le balance_withdrawal et le reste du balance_deposit
        const remaining = amount - balanceWithdrawal;
        newBalanceWithdrawal = 0;
        newBalanceDeposit = balanceDeposit - remaining;
      }
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          balance_deposit: newBalanceDeposit,
          balance_withdrawal: newBalanceWithdrawal,
          total_invested: (Number(user.total_invested) || 0) + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Créer la transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'investment',
          amount,
          status: 'completed',
          reference: `STAKE-${investment.id.substring(0, 8)}`
        });


      return {
        success: true,
        data: investment,
        message: 'Investissement staking créé avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la création de l\'investissement staking'
      };
    }
  }

  // Récupérer les investissements d'un utilisateur
  static async getUserInvestments(userId: string) {
    try {
      // Récupérer les investissements VIP
      const { data: vipInvestments, error: vipError } = await supabase
        .from('vip_investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (vipError) throw vipError;

      // Récupérer les investissements staking
      const { data: stakingInvestments, error: stakingError } = await supabase
        .from('staking_investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (stakingError) throw stakingError;

      return {
        success: true,
        data: {
          vip: vipInvestments || [],
          staking: stakingInvestments || []
        },
        message: 'Investissements récupérés avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des investissements'
      };
    }
  }

  // Traiter les commissions de parrainage
  private static async processReferralCommissions(userId: string, amount: number) {
    try {
      // Récupérer l'utilisateur avec son parrain
      const { data: user } = await supabase
        .from('users')
        .select('name, referred_by')
        .eq('id', userId)
        .single();

      if (!user?.referred_by) {
        return; // Pas de parrain
      }

      const rates = { level1: 11, level2: 2, level3: 1 };

      // Niveau 1
      await this.createReferralBonus(user.referred_by, userId, user.name, amount, rates.level1, 1);

      // Niveau 2
      const { data: level1Referrer } = await supabase
        .from('users')
        .select('referred_by')
        .eq('id', user.referred_by)
        .single();

      if (level1Referrer?.referred_by) {
        await this.createReferralBonus(level1Referrer.referred_by, userId, user.name, amount, rates.level2, 2);
      }

      // Niveau 3
      if (level1Referrer?.referred_by) {
        const { data: level2Referrer } = await supabase
          .from('users')
          .select('referred_by')
          .eq('id', level1Referrer.referred_by)
          .single();

        if (level2Referrer?.referred_by) {
          await this.createReferralBonus(level2Referrer.referred_by, userId, user.name, amount, rates.level3, 3);
        }
      }
    } catch (error) {
      console.error('Erreur lors du traitement des commissions:', error);
    }
  }

  // Créer une commission de parrainage
  private static async createReferralBonus(
    referrerId: string,
    referredId: string,
    referredName: string,
    investmentAmount: number,
    percentage: number,
    level: number
  ) {
    const bonusAmount = (investmentAmount * percentage) / 100;

    console.log(`💸 Création commission: ${bonusAmount} FCFA pour le niveau ${level}`);

    // Créer la commission
    await supabase
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
    await supabase
      .from('users')
      .update({
        balance_withdrawal: supabase.rpc('increment_balance', {
          user_id: referrerId,
          amount: bonusAmount,
          balance_type: 'withdrawal'
        }),
        updated_at: new Date().toISOString()
      })
      .eq('id', referrerId);

    // Créer la transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: referrerId,
        type: 'referral',
        amount: bonusAmount,
        status: 'completed',
        reference: `REF-L${level}-${referredId.substring(0, 8)}`
      });
  }
}