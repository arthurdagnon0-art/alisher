import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

export class TransactionService {
  // Créer une demande de dépôt avec conversion USDT
  static async createDeposit(userId: string, amount: number, method: string, reference?: string, originalAmount?: number, currency?: string) {
    try {
      // Vérifier les paramètres de la plateforme
      const { data: minDepositSetting } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'min_deposit')
        .single();

      const minDeposit = minDepositSetting?.value || 3000;

      // Pour USDT, vérifier le minimum en USDT puis convertir
      if (currency === 'USDT') {
        const minUsdtDeposit = 5; // Minimum USDT
        if ((originalAmount || 0) < minUsdtDeposit) {
          throw new Error(`Montant minimum de dépôt: ${minUsdtDeposit} USDT`);
        }
        // Le montant est déjà converti en FCFA
      } else {
        if (amount < minDeposit) {
          throw new Error(`Montant minimum de dépôt: ${minDeposit} FCFA`);
        }
      }

      // Créer la transaction avec les détails de conversion
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'deposit',
          method,
          amount, // Montant en FCFA
          status: 'pending',
          reference: reference || `DEP-${Date.now()}`,
          admin_notes: currency === 'USDT' ? `Montant original: ${originalAmount} USDT (converti à ${amount} FCFA)` : null
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

  // Créer une demande de retrait avec débit immédiat
  static async createWithdrawal(userId: string, amount: number, method: string, transactionPassword: string, originalAmount?: number, currency?: string) {
    try {
      // Vérifier si l'utilisateur a déjà fait un retrait aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const { data: todayWithdrawals, error: withdrawalCheckError } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'withdrawal')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      if (withdrawalCheckError) throw withdrawalCheckError;

      if (todayWithdrawals && todayWithdrawals.length > 0) {
        throw new Error('Vous avez déjà effectué un retrait aujourd\'hui. Un seul retrait par jour est autorisé.');
      }

      // Récupérer l'utilisateur et sa carte bancaire
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          balance_withdrawal,
          bank_cards(id, wallet_type, card_holder_name, card_number)
        `)
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier qu'une carte bancaire est configurée
      if (!user.bank_cards || user.bank_cards.length === 0) {
        throw new Error('Aucune carte bancaire configurée. Veuillez d\'abord ajouter vos informations bancaires.');
      }

      const minWithdrawal = currency === 'USDT' ? 8 : 1000; // 8 USDT ou 1000 FCFA
      const feeRate = 10;

      // Vérifier le montant minimum
      if (currency === 'USDT') {
        if ((originalAmount || 0) < minWithdrawal) {
          throw new Error(`Montant minimum de retrait: ${minWithdrawal} USDT`);
        }
      } else {
        if (amount < minWithdrawal) {
          throw new Error(`Montant minimum de retrait: ${minWithdrawal} FCFA`);
        }
      }

      // Calculer les frais (toujours en FCFA)
      const fees = (amount * feeRate) / 100;
      const totalAmount = amount + fees;

      const withdrawableBalance = Number(user.balance_withdrawal) || 0;
      
      console.log('💰 Vérification solde backend:', {
        userId,
        amount,
        fees,
        totalAmount,
        withdrawableBalance,
        userBalanceWithdrawal: user.balance_withdrawal
      });
      
      // Vérifier le solde disponible (en FCFA)
      if (withdrawableBalance < totalAmount) {
        throw new Error(`Solde retirable insuffisant. Disponible: ${withdrawableBalance.toLocaleString()} FCFA, Requis: ${totalAmount.toLocaleString()} FCFA (frais inclus)`);
      }

      // Créer la transaction
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'withdrawal',
          method,
          amount, // Montant en FCFA
          fees,
          status: 'pending',
          reference: `WTH-${Date.now()}`,
          admin_notes: currency === 'USDT' ? `Montant original: ${originalAmount} USDT (converti à ${amount} FCFA)` : null
        })
        .select()
        .single();

      if (error) throw error;

      // Déduire immédiatement du solde de retrait avec SQL pour éviter les problèmes de concurrence
      const { error: updateError } = await supabase
        .from('users')
        .update({
          balance_withdrawal: supabase.sql`COALESCE(balance_withdrawal, 0) - ${totalAmount}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      console.log(`💰 Retrait créé: ${totalAmount} FCFA débité du solde utilisateur ${userId}`);

      return {
        success: true,
        data: transaction,
        message: `Demande de retrait créée avec succès ! ${currency === 'USDT' ? `${originalAmount} USDT` : `${amount.toLocaleString()} FCFA`} sera traité dans les heures ouvrables.`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la création du retrait'
      };
    }
  }

  // Récupérer les transactions d'un utilisateur avec les cartes bancaires
  static async getUserTransactions(userId: string, type?: string, limit = 50) {
    try {
      console.log('🔍 Chargement des transactions pour utilisateur:', userId, 'type:', type);
      
      let query = supabase
        .from('transactions')
        .select(`
          *,
          users!inner(
            bank_cards(wallet_type, card_holder_name, card_number)
          )
        `)
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
        const { error: balanceError } = await supabase
          .from('users')
          .update({
            balance_deposit: supabase.sql`COALESCE(balance_deposit, 0) + ${transaction.amount}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.user_id);

        if (balanceError) throw balanceError;

        console.log(`💰 Dépôt approuvé: ${transaction.amount} FCFA ajouté au solde de dépôt pour l'utilisateur ${transaction.user_id}`);
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
        const refundAmount = transaction.amount + (transaction.fees || 0);
        
        // Rembourser au balance_withdrawal avec SQL pour éviter les problèmes de concurrence
        const { error: refundError } = await supabase
          .from('users')
          .update({
            balance_withdrawal: supabase.sql`COALESCE(balance_withdrawal, 0) + ${refundAmount}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.user_id);

        if (refundError) throw refundError;

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

  // Récupérer les transactions en attente pour l'admin avec cartes bancaires
  static async getPendingTransactions(type?: 'deposit' | 'withdrawal') {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          users!inner(
            name, 
            phone,
            bank_cards(wallet_type, card_holder_name, card_number)
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Transactions en attente récupérées avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des transactions'
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