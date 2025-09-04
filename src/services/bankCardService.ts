import { supabase } from '../lib/supabase';

export class BankCardService {
  // Créer une nouvelle carte bancaire/portefeuille mobile
  static async createBankCard(
    userId: string,
    walletType: string,
    cardHolderName: string,
    cardNumber: string
  ) {
    try {
      // Vérifier si l'utilisateur a déjà une carte de ce type
      const { data: existingCard } = await supabase
        .from('bank_cards')
        .select('id')
        .eq('user_id', userId)
        .eq('wallet_type', walletType)
        .eq('is_active', true)
        .maybeSingle();

      if (existingCard) {
        throw new Error('Vous avez déjà une carte active pour ce type de portefeuille');
      }

      // Créer la nouvelle carte
      const { data: newCard, error } = await supabase
        .from('bank_cards')
        .insert({
          user_id: userId,
          wallet_type: walletType,
          card_holder_name: cardHolderName,
          card_number: cardNumber,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: newCard,
        message: 'Carte bancaire ajoutée avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'ajout de la carte bancaire'
      };
    }
  }

  // Récupérer les cartes d'un utilisateur
  static async getUserBankCards(userId: string) {
    try {
      const { data, error } = await supabase
        .from('bank_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Cartes bancaires récupérées avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des cartes'
      };
    }
  }

  // Mettre à jour une carte bancaire
  static async updateBankCard(
    cardId: string,
    updates: {
      card_holder_name?: string;
      card_number?: string;
      is_active?: boolean;
    }
  ) {
    try {
      const { data, error } = await supabase
        .from('bank_cards')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', cardId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Carte bancaire mise à jour avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour de la carte'
      };
    }
  }

  // Supprimer une carte bancaire (désactiver)
  static async deleteBankCard(cardId: string) {
    try {
      const { error } = await supabase
        .from('bank_cards')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', cardId);

      if (error) throw error;

      return {
        success: true,
        message: 'Carte bancaire supprimée avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la suppression de la carte'
      };
    }
  }
}