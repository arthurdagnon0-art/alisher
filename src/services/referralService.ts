import { supabase } from '../lib/supabase';

export class ReferralService {
  // Récupérer les statistiques de l'équipe de parrainage
  static async getTeamStats(userId: string) {
    try {
      // Récupérer tous les utilisateurs parrainés directement (niveau 1)
      const { data: level1Users, error: level1Error } = await supabase
        .from('users')
        .select('id, name, phone, total_invested, is_active, created_at')
        .eq('referred_by', userId);

      if (level1Error) throw level1Error;

      // Récupérer les utilisateurs de niveau 2
      const level1Ids = level1Users?.map(u => u.id) || [];
      let level2Users: any[] = [];
      if (level1Ids.length > 0) {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, phone, total_invested, is_active, created_at')
          .in('referred_by', level1Ids);
        
        if (!error) level2Users = data || [];
      }

      // Récupérer les utilisateurs de niveau 3
      const level2Ids = level2Users?.map(u => u.id) || [];
      let level3Users: any[] = [];
      if (level2Ids.length > 0) {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, phone, total_invested, is_active, created_at')
          .in('referred_by', level2Ids);
        
        if (!error) level3Users = data || [];
      }

      // Récupérer les commissions totales
      const { data: commissions, error: commissionError } = await supabase
        .from('referral_bonuses')
        .select('amount')
        .eq('referrer_id', userId);

      if (commissionError) throw commissionError;

      const totalCommission = commissions?.reduce((sum, c) => sum + c.amount, 0) || 0;

      const stats = {
        level1: {
          count: level1Users?.length || 0,
          active: level1Users?.filter(u => u.is_active).length || 0,
          total_invested: level1Users?.reduce((sum, u) => sum + (u.total_invested || 0), 0) || 0,
          users: level1Users || []
        },
        level2: {
          count: level2Users?.length || 0,
          active: level2Users?.filter(u => u.is_active).length || 0,
          total_invested: level2Users?.reduce((sum, u) => sum + (u.total_invested || 0), 0) || 0,
          users: level2Users || []
        },
        level3: {
          count: level3Users?.length || 0,
          active: level3Users?.filter(u => u.is_active).length || 0,
          total_invested: level3Users?.reduce((sum, u) => sum + (u.total_invested || 0), 0) || 0,
          users: level3Users || []
        },
        total_commission: totalCommission
      };

      return {
        success: true,
        data: stats,
        message: 'Statistiques équipe récupérées avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des statistiques équipe'
      };
    }
  }

  // Récupérer l'historique des commissions
  static async getCommissionHistory(userId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('referral_bonuses')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Historique des commissions récupéré avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération de l\'historique'
      };
    }
  }

  // Récupérer les détails d'un niveau spécifique
  static async getLevelDetails(userId: string, level: 1 | 2 | 3) {
    try {
      let query;
      
      if (level === 1) {
        // Niveau 1: utilisateurs parrainés directement
        query = supabase
          .from('users')
          .select('id, name, phone, total_invested, is_active, created_at')
          .eq('referred_by', userId);
      } else {
        // Pour les niveaux 2 et 3, on doit faire des requêtes en cascade
        const { data: level1Users } = await supabase
          .from('users')
          .select('id')
          .eq('referred_by', userId);

        if (!level1Users || level1Users.length === 0) {
          return {
            success: true,
            data: [],
            message: 'Aucun utilisateur trouvé pour ce niveau'
          };
        }

        const level1Ids = level1Users.map(u => u.id);

        if (level === 2) {
          query = supabase
            .from('users')
            .select('id, name, phone, total_invested, is_active, created_at')
            .in('referred_by', level1Ids);
        } else {
          // Niveau 3
          const { data: level2Users } = await supabase
            .from('users')
            .select('id')
            .in('referred_by', level1Ids);

          if (!level2Users || level2Users.length === 0) {
            return {
              success: true,
              data: [],
              message: 'Aucun utilisateur trouvé pour ce niveau'
            };
          }

          const level2Ids = level2Users.map(u => u.id);
          query = supabase
            .from('users')
            .select('id, name, phone, total_invested, is_active, created_at')
            .in('referred_by', level2Ids);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: `Détails niveau ${level} récupérés avec succès`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des détails'
      };
    }
  }
}