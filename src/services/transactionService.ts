import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

export class TransactionService {
  // Créer une demande de dépôt
  static async createDeposit(userId: string, amount: number, method: string, reference?: string) {
    try {
      // Vérifier les paramètres de la plateforme
      const { data: minDepositSetting } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'min_deposit')
        .single();

      const minDeposit = minDepositSetting?.value || 3000;

      if (amount < minDeposit) {
        throw new Error(`Montant minimum de dépôt: ${minDeposit} FCFA`);
      }

      // Créer la transaction
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'deposit',
          method,
          amount,
          status: 'pending',
          reference: reference || `DEP-${Date.now()}`
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: transaction,
        message: 'Demande de dépôt créée avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la création du dépôt'
      };
    }
  }

  // Créer une demande de retrait
  static async createWithdrawal(userId: string, amount: number, method: string, transactionPassword: string, originalAmount?: number) {
    try {
      // Récupérer l'utilisateur
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance_withdrawal')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new Error('Utilisateur non trouvé');
      }

      const minWithdrawal = 1000;
      const feeRate = 10;

      // Vérifier le montant minimum
      if (amount < minWithdrawal) {
        throw new Error(`Montant minimum de retrait: ${minWithdrawal} FCFA`);
      }

      // Calculer les frais
      const fees = (amount * feeRate) / 100;
      const totalAmount = amount + fees;

      // Vérifier le solde
      if (user.balance_withdrawal < totalAmount) {
        throw new Error('Solde insuffisant (frais inclus)');
      }

      // Créer la transaction
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'withdrawal',
          method,
          amount,
          fees,
          status: 'pending',
          reference: `WTH-${Date.now()}`,
          admin_notes: originalAmount ? `Montant original: ${originalAmount} ${method.toUpperCase()}` : null
        })
        .select()
        .single();

      if (error) throw error;

      // Déduire immédiatement du solde (sera restauré si rejeté)
      await supabase
        .from('users')
        .update({
          balance_withdrawal: user.balance_withdrawal - totalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      console.log(`💰 Retrait créé: ${amount} FCFA débité du solde utilisateur ${userId}`);

      return {
        success: true,
        data: transaction,
        message: 'Demande de retrait créée avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la création du retrait'
      };
    }
  }

  // Récupérer les transactions d'un utilisateur
  static async getUserTransactions(userId: string, type?: string, limit = 50) {
    try {
      console.log('🔍 Chargement des transactions pour utilisateur:', userId, 'type:', type);
      
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log('✅ Transactions chargées:', data?.length || 0);
      return {
        success: true,
        data: data || [],
        message: 'Transactions récupérées avec succès'
      };
    } catch (error: any) {
      console.error('❌ Erreur chargement transactions:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des transactions'
      };
    }
  }

  // Approuver une transaction (admin)
  static async approveTransaction(transactionId: string, adminNotes?: string) {
    try {
      // Récupérer la transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (transactionError || !transaction) {
        throw new Error('Transaction non trouvée');
      }

      // Approuver la transaction
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          processed_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      // Si c'est un dépôt, créditer le solde
      if (transaction.type === 'deposit') {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('balance_deposit')
          .eq('id', transaction.user_id)
          .single();

        if (userError) throw userError;

        await supabase
          .from('users')
          .update({
            balance_deposit: (user.balance_deposit || 0) + transaction.amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.user_id);
      }

      return {
        success: true,
        message: 'Transaction approuvée avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'approbation'
      };
    }
  }

  // Rejeter une transaction (admin) avec remboursement
  static async rejectTransaction(transactionId: string, adminNotes?: string) {
    try {
      // Récupérer la transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (transactionError || !transaction) {
        throw new Error('Transaction non trouvée');
      }

      // Rejeter la transaction
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          processed_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      // Si c'est un retrait rejeté, rembourser le solde
      if (transaction.type === 'withdrawal') {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('balance_withdrawal')
          .eq('id', transaction.user_id)
          .single();

        if (userError) throw userError;

        const refundAmount = transaction.amount + (transaction.fees || 0);
        
        await supabase
          .from('users')
          .update({
            balance_withdrawal: (user.balance_withdrawal || 0) + refundAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.user_id);

        console.log(`💰 Retrait rejeté: ${refundAmount} FCFA remboursé à l'utilisateur ${transaction.user_id}`);
      }

      return {
        success: true,
        message: 'Transaction rejetée avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors du rejet'
      };
    }
  }

  // Récupérer les statistiques des transactions
  static async getTransactionStats(userId?: string) {
    try {
      let baseQuery = supabase.from('transactions').select('type, amount, status');
      
      if (userId) {
        baseQuery = baseQuery.eq('user_id', userId);
      }

      const { data, error } = await baseQuery;

      if (error) throw error;

      const stats = {
        total_deposits: 0,
        total_withdrawals: 0,
        pending_deposits: 0,
        pending_withdrawals: 0,
        approved_deposits: 0,
        approved_withdrawals: 0,
        total_transactions: data?.length || 0
      };

      data?.forEach(transaction => {
        if (transaction.type === 'deposit') {
          stats.total_deposits += transaction.amount;
          if (transaction.status === 'pending') stats.pending_deposits += transaction.amount;
          if (transaction.status === 'approved') stats.approved_deposits += transaction.amount;
        } else if (transaction.type === 'withdrawal') {
          stats.total_withdrawals += transaction.amount;
          if (transaction.status === 'pending') stats.pending_withdrawals += transaction.amount;
          if (transaction.status === 'approved') stats.approved_withdrawals += transaction.amount;
        }
      });

      return {
        success: true,
        data: stats,
        message: 'Statistiques récupérées avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des statistiques'
      };
    }
  }
}