export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string;
          email: string | null;
          name: string;
          country: string;
          password_hash: string;
          transaction_password_hash: string | null;
          balance_deposit: number;
          balance_withdrawal: number;
          total_invested: number;
          total_earned: number;
          referral_code: string;
          referred_by: string | null;
          vip_level: number;
          is_active: boolean;
          is_blocked: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          email?: string | null;
          name: string;
          country: string;
          password_hash: string;
          transaction_password_hash?: string | null;
          balance_deposit?: number;
          balance_withdrawal?: number;
          total_invested?: number;
          total_earned?: number;
          referral_code: string;
          referred_by?: string | null;
          vip_level?: number;
          is_active?: boolean;
          is_blocked?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          email?: string | null;
          name?: string;
          country?: string;
          password_hash?: string;
          transaction_password_hash?: string | null;
          balance_deposit?: number;
          balance_withdrawal?: number;
          total_invested?: number;
          total_earned?: number;
          referral_code?: string;
          referred_by?: string | null;
          vip_level?: number;
          is_active?: boolean;
          is_blocked?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vip_packages: {
        Row: {
          id: string;
          name: string;
          min_amount: number;
          max_amount: number;
          daily_rate: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          min_amount: number;
          max_amount: number;
          daily_rate: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          min_amount?: number;
          max_amount?: number;
          daily_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      staking_plans: {
        Row: {
          id: string;
          name: string;
          duration_days: number;
          daily_rate: number;
          min_amount: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          duration_days: number;
          daily_rate: number;
          min_amount: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          duration_days?: number;
          daily_rate?: number;
          min_amount?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      vip_investments: {
        Row: {
          id: string;
          user_id: string;
          package_id: string;
          package_name: string;
          amount: number;
          daily_earnings: number;
          total_earned: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          package_id: string;
          package_name: string;
          amount: number;
          daily_earnings: number;
          total_earned?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          package_id?: string;
          package_name?: string;
          amount?: number;
          daily_earnings?: number;
          total_earned?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      staking_investments: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          plan_name: string;
          amount: number;
          daily_earnings: number;
          total_earned: number;
          unlock_date: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          plan_name: string;
          amount: number;
          daily_earnings: number;
          total_earned?: number;
          unlock_date: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          plan_name?: string;
          amount?: number;
          daily_earnings?: number;
          total_earned?: number;
          unlock_date?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          method: string | null;
          amount: number;
          fees: number;
          status: string;
          reference: string | null;
          admin_notes: string | null;
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          method?: string | null;
          amount: number;
          fees?: number;
          status?: string;
          reference?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          method?: string | null;
          amount?: number;
          fees?: number;
          status?: string;
          reference?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
      };
      daily_earnings: {
        Row: {
          id: string;
          user_id: string;
          investment_id: string;
          investment_type: string;
          amount: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          investment_id: string;
          investment_type: string;
          amount: number;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          investment_id?: string;
          investment_type?: string;
          amount?: number;
          date?: string;
          created_at?: string;
        };
      };
      referral_bonuses: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          referred_name: string;
          level: number;
          amount: number;
          percentage: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id: string;
          referred_name: string;
          level: number;
          amount: number;
          percentage: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referred_id?: string;
          referred_name?: string;
          level?: number;
          amount?: number;
          percentage?: number;
          created_at?: string;
        };
      };
      bank_cards: {
        Row: {
          id: string;
          user_id: string;
          wallet_type: string;
          card_holder_name: string;
          card_number: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_type: string;
          card_holder_name: string;
          card_number: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallet_type?: string;
          card_holder_name?: string;
          card_number?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          images: any | null;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          images?: any | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          images?: any | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      platform_settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: any;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: any;
          description?: string | null;
          updated_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string;
          role: string;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          name: string;
          role?: string;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          name?: string;
          role?: string;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}