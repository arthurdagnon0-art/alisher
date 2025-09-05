import { VIPPackage, StakingPlan } from '../types';

export const vipPackages: VIPPackage[] = [
  {
    id: '1',
    name: 'VIP1',
    min_amount: 3000,
    max_amount: 70000,
    daily_rate: 5.0,
    is_active: true,
  },
  {
    id: '2',
    name: 'VIP2',
    min_amount: 75000,
    max_amount: 200000,
    daily_rate: 7.0,
    is_active: true,
  },
  {
    id: '3',
    name: 'VIP3',
    min_amount: 205000,
    max_amount: 500000,
    daily_rate: 9.0,
    is_active: true,
  },
  {
    id: '4',
    name: 'VIP4',
    min_amount: 505000,
    max_amount: 1000000,
    daily_rate: 11.0,
    is_active: true,
  },
  {
    id: '5',
    name: 'VIP5',
    min_amount: 1005000,
    max_amount: 5000000,
    daily_rate: 13.0,
    is_active: true,
  },
];

export const stakingPlans: StakingPlan[] = [
  {
    id: '1',
    name: 'Plan 3 jours',
    duration_days: 3,
    daily_rate: 5.0,
    min_amount: 3000,
    is_active: true,
  },
  {
    id: '2',
    name: 'Plan 7 jours',
    duration_days: 7,
    daily_rate: 8.0,
    min_amount: 3000,
    is_active: true,
  },
  {
    id: '3',
    name: 'Plan 15 jours',
    duration_days: 15,
    daily_rate: 11.0,
    min_amount: 3000,
    is_active: true,
  },
  {
    id: '4',
    name: 'Plan 30 jours',
    duration_days: 30,
    daily_rate: 13.0,
    min_amount: 3000,
    is_active: true,
  },
  {
    id: '5',
    name: 'Plan 45 jours',
    duration_days: 45,
    daily_rate: 17.0,
    min_amount: 3000,
    is_active: true,
  },
  {
    id: '6',
    name: 'Plan 60 jours',
    duration_days: 60,
    daily_rate: 20.0,
    min_amount: 3000,
    is_active: true,
  },
];

export const paymentMethods = [
  { id: 'moov', name: 'Moov Money', countries: ['BJ', 'TG', 'CI', 'BF'] },
  { id: 'mtn', name: 'MTN Mobile Money', countries: ['BJ', 'TG', 'CI', 'CM', 'GH'] },
  { id: 'orange', name: 'Orange Money', countries: ['BJ', 'TG', 'CI', 'CM', 'SN', 'BF'] },
  { id: 'wave', name: 'Wave', countries: ['BJ', 'TG', 'CI', 'SN'] },
  { id: 'celtis', name: 'Celtis', countries: ['BJ'] },
  { id: 'usdt', name: 'USDT (Crypto)', countries: ['ALL'] },
];

export const supportedCountries = [
  { code: 'BJ', name: 'Bénin', flag: '🇧🇯' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'CD', name: 'RDC', flag: '🇨🇩' },
];

export const referralRates = {
  level1: 11,
  level2: 2,
  level3: 1,
};

export const platformSettings = {
  min_deposit: 3000,
  min_withdrawal: 1000,
  withdrawal_fee_rate: 10,
  usdt_exchange_rate: 600,
  min_usdt_deposit: 5, 
  min_usdt_withdrawal: 8,
  withdrawal_hours: {
    start: 8,
    end: 17,
    timezone: 'Africa/Porto-Novo'
  }
};