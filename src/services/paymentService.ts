import { supabase } from '../lib/supabase';
import { PaymentMethod } from '../types';

export class PaymentService {
  // Récupérer toutes les méthodes de paiement actives
  static async getActivePaymentMethods(userCountry?: string) {
    try {
      let query = supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      // Filtrer par pays si fourni
      if (userCountry) {
        query = query.eq('country', userCountry);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Méthodes de paiement récupérées avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des méthodes de paiement'
      };
    }
  }

  // Créer une soumission de dépôt
  static async submitDeposit(
    userId: string,
    paymentMethodId: string,
    amount: number,
    userDepositNumber: string,
    transactionId: string
  ) {
    try {
      // Vérifier la méthode de paiement
      const { data: paymentMethod, error: methodError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', paymentMethodId)
        .eq('is_active', true)
        .single();

      if (methodError || !paymentMethod) {
        throw new Error('Méthode de paiement non trouvée ou inactive');
      }

      // Vérifier le montant minimum
      if (amount < paymentMethod.min_deposit) {
        throw new Error(`Montant minimum: ${paymentMethod.min_deposit.toLocaleString()} ${paymentMethod.name.includes('USDT') ? 'USDT' : 'FCFA'}`);
      }

      // Calculer les frais
      const fees = (amount * paymentMethod.deposit_fee) / 100;

      // Créer la transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'deposit',
          method: paymentMethod.name.toLowerCase().replace(/\s+/g, '_'),
          amount,
          fees,
          status: 'pending',
          reference: transactionId
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Créer la soumission de dépôt
      const { data: submission, error: submissionError } = await supabase
        .from('deposit_submissions')
        .insert({
          transaction_id: transaction.id,
          user_id: userId,
          payment_method_id: paymentMethodId,
          user_deposit_number: userDepositNumber,
          amount,
          transaction_reference: transactionId,
          status: 'pending'
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      return {
        success: true,
        data: {
          transaction,
          submission
        },
        message: 'Demande de dépôt soumise avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la soumission du dépôt'
      };
    }
  }

  // Récupérer les soumissions de dépôt en attente (pour admin)
  static async getPendingDeposits() {
    try {
      const { data, error } = await supabase
        .from('deposit_submissions')
        .select(`
          *,
          users!inner(name, phone),
          payment_methods!inner(name, deposit_number, account_name),
          transactions!inner(reference, created_at)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Soumissions de dépôt récupérées avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des soumissions'
      };
    }
  }

  // Approuver une soumission de dépôt (admin)
  static async approveDeposit(submissionId: string, adminNotes?: string) {
    try {
      // Récupérer la soumission
      const { data: submission, error: submissionError } = await supabase
        .from('deposit_submissions')
        .select(`
          *,
          transactions!inner(*)
        `)
        .eq('id', submissionId)
        .single();

      if (submissionError || !submission) {
        throw new Error('Soumission non trouvée');
      }

      // Approuver la transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          processed_at: new Date().toISOString()
        })
        .eq('id', submission.transaction_id);

      if (transactionError) throw transactionError;

      // Mettre à jour la soumission
      const { error: submissionUpdateError } = await supabase
        .from('deposit_submissions')
        .update({
          status: 'approved'
        })
        .eq('id', submissionId);

      if (submissionUpdateError) throw submissionUpdateError;

      // Récupérer le solde actuel et le mettre à jour
      const { data: currentUser, error: getUserError } = await supabase
        .from('users')
        .select('balance_deposit')
        .eq('id', submission.user_id)
        .single();

      if (getUserError) throw getUserError;

      // Créditer le solde utilisateur
      const { error: balanceError } = await supabase
        .from('users')
        .update({
          balance_deposit: (currentUser.balance_deposit || 0) + submission.amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', submission.user_id);

      if (balanceError) throw balanceError;


      // Vérifier si c'est le premier dépôt approuvé de cet utilisateur
      const { data: previousDeposits, error: depositCheckError } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', submission.user_id)
        .eq('type', 'deposit')
        .eq('status', 'approved');

      if (depositCheckError) throw depositCheckError;

      // Si c'est le premier dépôt, traiter les commissions de parrainage
      if (!previousDeposits || previousDeposits.length === 0) {
        await this.processFirstDepositReferralCommissions(submission.user_id, submission.amount);
      }

      return {
        success: true,
        message: 'Dépôt approuvé et solde crédité avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'approbation du dépôt'
      };
    }
  }

  // Rejeter une soumission de dépôt (admin)
  static async rejectDeposit(submissionId: string, adminNotes?: string) {
    try {
      // Récupérer la soumission
      const { data: submission, error: submissionError } = await supabase
        .from('deposit_submissions')
        .select('transaction_id')
        .eq('id', submissionId)
        .single();

      if (submissionError || !submission) {
        throw new Error('Soumission non trouvée');
      }

      // Rejeter la transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          processed_at: new Date().toISOString()
        })
        .eq('id', submission.transaction_id);

      if (transactionError) throw transactionError;

      // Mettre à jour la soumission
      const { error: submissionUpdateError } = await supabase
        .from('deposit_submissions')
        .update({
          status: 'rejected'
        })
        .eq('id', submissionId);

      if (submissionUpdateError) throw submissionUpdateError;

      return {
        success: true,
        message: 'Dépôt rejeté avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors du rejet du dépôt'
      };
    }
  }

  // Traiter les commissions de parrainage pour le premier dépôt uniquement
  private static async processFirstDepositReferralCommissions(userId: string, amount: number) {
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
      console.error('Erreur lors du traitement des commissions de premier dépôt:', error);
    }
  }

  // Créer une commission de parrainage
  private static async createReferralBonus(
    referrerId: string,
    referredId: string,
    referredName: string,
    depositAmount: number,
    percentage: number,
    level: number
  ) {
    const bonusAmount = (depositAmount * percentage) / 100;

    console.log(`💸 Commission premier dépôt: ${bonusAmount} FCFA pour le niveau ${level}`);

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
        balance_withdrawal: supabase.sql`COALESCE(balance_withdrawal, 0) + ${bonusAmount}`,
        total_earned: supabase.sql`COALESCE(total_earned, 0) + ${bonusAmount}`,
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
        reference: `REF-FIRST-L${level}-${referredId.substring(0, 8)}`
      });
  }
}