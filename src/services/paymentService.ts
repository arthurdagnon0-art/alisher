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

      // Créditer le solde utilisateur
      const { error: balanceError } = await supabase
        .from('users')
        .rpc('increment_user_balance', {
          user_id: submission.user_id,
          amount: submission.amount,
          balance_type: 'deposit'
        });

      if (balanceError) throw balanceError;

      // Mettre à jour le timestamp
      const { error: timestampError } = await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', submission.user_id);


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
}