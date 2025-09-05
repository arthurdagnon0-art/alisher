export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  country: string;
  balance_deposit: number;
  balance_withdrawal: number;
  total_invested: number;
  total_earned: number;
  referral_code: string;
  referred_by?: string;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
}

export interface VIPPackage {
  id: string;
  name: string;
  min_amount: number;
  max_amount: number;
  daily_rate: number;
  is_active: boolean;
}

export interface StakingPlan {
  id: string;
  name: string;
  duration_days: number;
  daily_rate: number;
  min_amount: number;
  is_active: boolean;
}

export interface VIPInvestment {
  id: string;
  user_id: string;
  package_id: string;
  package_name: string;
  amount: number;
  daily_earnings: number;
  total_earned: number;
  status: 'active' | 'paused';
  created_at: string;
}

export interface StakingInvestment {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  daily_earnings: number;
  total_earned: number;
  unlock_date: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'earning' | 'referral';
  method?: 'moov' | 'mtn' | 'orange' | 'wave' | 'celtis' | 'usdt';
  amount: number;
  fees: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reference?: string;
  admin_notes?: string;
  created_at: string;
  processed_at?: string;
}

export interface DailyEarning {
  id: string;
  user_id: string;
  investment_id: string;
  investment_type: 'vip' | 'staking';
  amount: number;
  date: string;
  created_at: string;
}

export interface ReferralBonus {
  id: string;
  referrer_id: string;
  referred_id: string;
  referred_name: string;
  level: 1 | 2 | 3;
  amount: number;
  percentage: number;
  created_at: string;
}

export interface ReferralTeam {
  level: number;
  users: Array<{
    id: string;
    name: string;
    phone: string;
    total_invested: number;
    created_at: string;
  }>;
  total_users: number;
  total_invested: number;
  total_bonuses: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  country: string;
  deposit_number: string;
  account_name: string;
  min_deposit: number;
  deposit_fee: number;
  withdrawal_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepositSubmission {
  id: string;
  transaction_id: string;
  user_id: string;
  payment_method_id: string;
  user_deposit_number: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AdminStats {
  total_users: number;
  total_deposits: number;
  total_withdrawals: number;
  total_investments: number;
  pending_transactions: number;
  active_vip_investments: number;
  active_staking_investments: number;
}