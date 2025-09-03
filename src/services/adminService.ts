import { supabase, supabaseAdmin } from '../lib/supabase';

export class AdminService {
  // Connexion admin
  static async adminLogin(email: string, password: string) {
    try {
      // Authentification admin directe (temporaire jusqu'à configuration Supabase)
      if (email === 'admin@alisher-investment.com' && password === 'Admin123!') {
        const adminData = {
          id: 'admin-1',
          email: 'admin@alisher-investment.com',
          name: 'Administrateur',
          role: 'admin'
        };
        
        return {
          success: true,
          admin: adminData,
          message: 'Connexion admin réussie'
        };
      } else {
        throw new Error('Email ou mot de passe incorrect');
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la connexion admin'
      };
    }
  }

  // Statistiques du dashboard admin
  static async getDashboardStats() {
    try {
      // Statistiques des utilisateurs
      const { data: userStats } = await supabaseAdmin
        .from('users')
        .select('id, is_active, is_blocked, created_at');

      // Statistiques des transactions
      const { data: transactionStats } = await supabaseAdmin
        .from('transactions')
        .select('type, amount, status, created_at');

      // Statistiques des investissements
      const { data: vipInvestments } = await supabaseAdmin
        .from('vip_investments')
        .select('amount, status, created_at');

      const { data: stakingInvestments } = await supabaseAdmin
        .from('staking_investments')
        .select('amount, status, created_at');

      // Calculer les statistiques
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().substring(0, 7);

      const stats = {
        users: {
          total: userStats?.length || 0,
          active: userStats?.filter(u => u.is_active && !u.is_blocked).length || 0,
          blocked: userStats?.filter(u => u.is_blocked).length || 0,
          new_today: userStats?.filter(u => u.created_at.startsWith(today)).length || 0,
          new_this_month: userStats?.filter(u => u.created_at.startsWith(thisMonth)).length || 0
        },
        transactions: {
          total: transactionStats?.length || 0,
          pending_deposits: transactionStats?.filter(t => t.type === 'deposit' && t.status === 'pending').length || 0,
          pending_withdrawals: transactionStats?.filter(t => t.type === 'withdrawal' && t.status === 'pending').length || 0,
          total_deposits: transactionStats?.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0) || 0,
          total_withdrawals: transactionStats?.filter(t => t.type === 'withdrawal' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0) || 0,
          today_deposits: transactionStats?.filter(t => t.type === 'deposit' && t.created_at.startsWith(today)).reduce((sum, t) => sum + t.amount, 0) || 0,
          today_withdrawals: transactionStats?.filter(t => t.type === 'withdrawal' && t.created_at.startsWith(today)).reduce((sum, t) => sum + t.amount, 0) || 0
        },
        investments: {
          total_vip: vipInvestments?.length || 0,
          total_staking: stakingInvestments?.length || 0,
          active_vip: vipInvestments?.filter(i => i.status === 'active').length || 0,
          active_staking: stakingInvestments?.filter(i => i.status === 'active').length || 0,
          total_vip_amount: vipInvestments?.reduce((sum, i) => sum + i.amount, 0) || 0,
          total_staking_amount: stakingInvestments?.reduce((sum, i) => sum + i.amount, 0) || 0,
          today_investments: [...(vipInvestments || []), ...(stakingInvestments || [])]
            .filter(i => i.created_at.startsWith(today)).length || 0
        }
      };

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

  // Récupérer tous les utilisateurs avec filtres
  static async getUsers(filters: {
    search?: string;
    country?: string;
    is_active?: boolean;
    is_blocked?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
    try {
      const { search, country, is_active, is_blocked, page = 1, limit = 50 } = filters;
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from('users')
        .select(`
          id, phone, email, name, country, balance_deposit, balance_withdrawal,
          total_invested, total_earned, referral_code, vip_level, is_active,
          is_blocked, last_login, created_at
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (country) {
        query = query.eq('country', country);
      }

      if (typeof is_active === 'boolean') {
        query = query.eq('is_active', is_active);
      }

      if (typeof is_blocked === 'boolean') {
        query = query.eq('is_blocked', is_blocked);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        },
        message: 'Utilisateurs récupérés avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des utilisateurs'
      };
    }
  }

  // Récupérer les détails d'un utilisateur
  static async getUserDetails(userId: string) {
    try {
      // Informations utilisateur
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Transactions récentes
      const { data: transactions } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Investissements VIP
      const { data: vipInvestments } = await supabaseAdmin
        .from('vip_investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Investissements Staking
      const { data: stakingInvestments } = await supabaseAdmin
        .from('staking_investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Commissions de parrainage
      const { data: referralBonuses } = await supabaseAdmin
        .from('referral_bonuses')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      // Équipe (utilisateurs parrainés)
      const { data: referredUsers } = await supabaseAdmin
        .from('users')
        .select('id, name, phone, total_invested, created_at')
        .eq('referred_by', userId)
        .order('created_at', { ascending: false });

      return {
        success: true,
        data: {
          user,
          transactions: transactions || [],
          vip_investments: vipInvestments || [],
          staking_investments: stakingInvestments || [],
          referral_bonuses: referralBonuses || [],
          referred_users: referredUsers || []
        },
        message: 'Détails utilisateur récupérés avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des détails'
      };
    }
  }

  // Mettre à jour un utilisateur
  static async updateUser(userId: string, updates: {
    name?: string;
    email?: string;
    balance_deposit?: number;
    balance_withdrawal?: number;
    is_active?: boolean;
    is_blocked?: boolean;
    vip_level?: number;
  }) {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Utilisateur mis à jour avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour'
      };
    }
  }

  // Récupérer les transactions en attente
  static async getPendingTransactions(type?: 'deposit' | 'withdrawal') {
    try {
      let query = supabaseAdmin
        .from('transactions')
        .select(`
          id, user_id, type, method, amount, fees, reference, created_at,
          users!inner(name, phone)
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

  // Gérer les paramètres de la plateforme
  static async updatePlatformSetting(key: string, value: any, description?: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('platform_settings')
        .upsert({
          key,
          value,
          description,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Paramètre mis à jour avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour du paramètre'
      };
    }
  }

  // Récupérer tous les paramètres
  static async getPlatformSettings() {
    try {
      const { data, error } = await supabaseAdmin
        .from('platform_settings')
        .select('*')
        .order('key', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Paramètres récupérés avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des paramètres'
      };
    }
  }

  // Créer un rapport financier
  static async generateFinancialReport(startDate: string, endDate: string) {
    try {
      // Transactions dans la période
      const { data: transactions } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      // Investissements dans la période
      const { data: vipInvestments } = await supabaseAdmin
        .from('vip_investments')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data: stakingInvestments } = await supabaseAdmin
        .from('staking_investments')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      // Revenus quotidiens dans la période
      const { data: dailyEarnings } = await supabaseAdmin
        .from('daily_earnings')
        .select('*')
        .gte('date', startDate.split('T')[0])
        .lte('date', endDate.split('T')[0]);

      // Calculer les totaux
      const report = {
        period: { start: startDate, end: endDate },
        transactions: {
          total_deposits: transactions?.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0) || 0,
          total_withdrawals: transactions?.filter(t => t.type === 'withdrawal' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0) || 0,
          pending_deposits: transactions?.filter(t => t.type === 'deposit' && t.status === 'pending').reduce((sum, t) => sum + t.amount, 0) || 0,
          pending_withdrawals: transactions?.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((sum, t) => sum + t.amount, 0) || 0,
          count: transactions?.length || 0
        },
        investments: {
          total_vip_amount: vipInvestments?.reduce((sum, i) => sum + i.amount, 0) || 0,
          total_staking_amount: stakingInvestments?.reduce((sum, i) => sum + i.amount, 0) || 0,
          vip_count: vipInvestments?.length || 0,
          staking_count: stakingInvestments?.length || 0
        },
        earnings: {
          total_paid: dailyEarnings?.reduce((sum, e) => sum + e.amount, 0) || 0,
          count: dailyEarnings?.length || 0
        }
      };

      return {
        success: true,
        data: report,
        message: 'Rapport généré avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la génération du rapport'
      };
    }
  }
}