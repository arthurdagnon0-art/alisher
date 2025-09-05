import React, { useState } from 'react';
import { CreditCard, ArrowDownCircle, Users, MessageCircle, Send, X, Settings, RotateCcw, TrendingUp } from 'lucide-react';
import { AnimatedCard } from './AnimatedCard';
import { GradientButton } from './GradientButton';
import { FloatingActionButton } from './FloatingActionButton'; 
import { LoadingSpinner } from './LoadingSpinner';
import { TelegramPopup } from './TelegramPopup';
import { platformSettings } from '../data/investments';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  user: any;
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [showTelegramPopup, setShowTelegramPopup] = useState(true);
  const [currentUser, setCurrentUser] = useState(user);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mettre à jour les données utilisateur depuis localStorage
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
      }
    }
  }, []);

  // Charger les commissions de parrainage
  const [totalCommission, setTotalCommission] = React.useState(0);
  const [isLoadingCommission, setIsLoadingCommission] = React.useState(true);

  React.useEffect(() => {
    loadCommissionData();
  }, [currentUser?.id]);

  const loadCommissionData = async () => {
    if (!currentUser?.id) return;
    
    setIsLoadingCommission(true);
    try {
      const { data: commissions, error } = await supabase
        .from('referral_bonuses')
        .select('amount')
        .eq('referrer_id', currentUser.id);

      if (!error && commissions) {
        const total = commissions.reduce((sum, c) => sum + c.amount, 0);
        setTotalCommission(total);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commissions:', error);
    } finally {
      setIsLoadingCommission(false);
    }
  };
  // Fonction pour rafraîchir les données utilisateur
  const refreshUserData = async () => {
    if (!currentUser?.id) return;
    
    setIsRefreshing(true);
    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (!error && updatedUser) {
        const formattedUser = {
          id: updatedUser.id,
          phone: updatedUser.phone,
          email: updatedUser.email,
          name: updatedUser.name,
          country: updatedUser.country,
          balance_deposit: updatedUser.balance_deposit || 0,
          balance_withdrawal: updatedUser.balance_withdrawal || 0,
          total_invested: updatedUser.total_invested || 0,
          referral_code: updatedUser.referral_code,
          referred_by: updatedUser.referred_by,
          is_active: updatedUser.is_active,
          is_blocked: updatedUser.is_blocked,
          created_at: updatedUser.created_at,
        };
        
        setCurrentUser(formattedUser);
        localStorage.setItem('user', JSON.stringify(formattedUser));
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Rafraîchir automatiquement toutes les 30 secondes
  // Actualisation automatique supprimée pour améliorer les performances

  const floatingActions = [ 
    {
      icon: <CreditCard className="w-6 h-6 text-white" />,
      label: 'Recharge rapide',
      onClick: () => onNavigate('recharge'),
      color: 'bg-blue-500'
    },
    {
      icon: <Users className="w-6 h-6 text-white" />,
      label: 'Inviter des amis',
      onClick: () => onNavigate('invite'),
      color: 'bg-purple-500'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      label: 'Investir maintenant',
      onClick: () => onNavigate('investments'),
      color: 'bg-green-500'
    }
  ];

  const quickActions = [
    { 
      icon: CreditCard, 
      label: 'Recharger', 
      color: 'from-blue-500 to-cyan-500', 
      action: () => onNavigate('recharge')
    },
    { 
      icon: ArrowDownCircle, 
      label: 'Retirer', 
      color: 'from-green-500 to-emerald-500', 
      action: () => onNavigate('withdraw')
    },
    { 
      icon: Users, 
      label: 'Équipe', 
      color: 'from-purple-500 to-pink-500', 
      action: () => onNavigate('team')
    },
    { 
      icon: MessageCircle, 
      label: 'Ordonné', 
      color: 'from-orange-500 to-red-500', 
      action: () => onNavigate('products')
    },
    { 
      icon: Send, 
      label: 'Telegram', 
      color: 'from-cyan-500 to-blue-500', 
      action: () => setShowTelegramModal(true)
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-gothic-italic">
      {/* Header */}
      <div className="bg-white p-2 xxs:p-3 xs:p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 xxs:w-9 xxs:h-9 xs:w-10 xs:h-10 bg-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-[6px] xxs:text-[7px] xs:text-[8px] leading-tight text-center font-gothic">Alisher<br/>USMANOV</span>
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm xxs:text-base">{user?.name || 'Utilisateur'}</p>
            <p className="text-xs xxs:text-sm text-gray-500">{user?.phone ? `${user.phone.substring(0, 3)}****${user.phone.slice(-3)}` : 'Non défini'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 xxs:space-x-2">
          <button className="p-1 xxs:p-2 hover:bg-gray-100 rounded-full">
            <Settings className="w-4 h-4 xxs:w-5 xxs:h-5 text-gray-600" />
          </button>
          <button 
            onClick={refreshUserData}
            disabled={isRefreshing}
            className="p-1 xxs:p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 xxs:w-5 xxs:h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Balance Section */}
      <div className="px-2 xxs:px-3 xs:px-4 mt-2 xxs:mt-3 xs:mt-4">
        <AnimatedCard className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative overflow-hidden" hoverEffect="glow">
          <div className="text-center mb-3 xxs:mb-4">
            <p className="text-xs xxs:text-sm opacity-90 mb-1 xxs:mb-2">Solde Disponible</p>
            <p className="text-xl xxs:text-2xl xs:text-3xl font-bold">
              FCFA{(currentUser?.balance_withdrawal || 0).toLocaleString()}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 xxs:gap-3 xs:gap-4">
            <div className="text-center">
              <p className="text-xs xxs:text-sm opacity-90 mb-1">Total Investi</p>
              <p className="text-base xxs:text-lg xs:text-xl font-bold">FCFA{currentUser?.total_invested?.toLocaleString() || '0'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs xxs:text-sm opacity-90 mb-1">Solde Disponible</p>
              <p className="text-base xxs:text-lg xs:text-xl font-bold">FCFA{currentUser?.balance_withdrawal?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Quick Actions */}
      <div className="px-2 xxs:px-3 xs:px-4 mt-4 xxs:mt-5 xs:mt-6">
        <div className="bg-white rounded-lg p-2 xxs:p-3 xs:p-4 shadow-sm">
          <div className="grid grid-cols-3 xxs:grid-cols-4 xs:grid-cols-5 gap-2 xxs:gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex flex-col items-center group animate-fadeInUp"
                style={{ animationDelay: `${index * 100 + 300}ms` }}
              >
                <div className={`w-10 h-10 xxs:w-11 xxs:h-11 xs:w-12 xs:h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-1 xxs:mb-2 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <action.icon className="w-4 h-4 xxs:w-5 xxs:h-5 xs:w-6 xs:h-6 text-white" />
                </div>
                <span className="text-[10px] xxs:text-xs text-gray-600 text-center group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Investment Banner */}
      <div className="px-4 mt-6">
        <div 
          onClick={() => onNavigate('investments')}
          className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fadeInUp delay-400"
        >
          <div className="flex items-center mb-4">
            <TrendingUp className="w-8 h-8 mr-3" />
            <h3 className="font-bold text-xl">Investissements Disponibles</h3>
          </div>
          <p className="text-sm opacity-90 mb-4">
            Choisissez entre nos packs VIP ou nos plans de staking pour maximiser vos revenus
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <p className="text-xs opacity-80 mb-1">VIP PACKS</p>
              <p className="font-bold">5% - 11%</p>
              <p className="text-xs opacity-80">par jour</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <p className="text-xs opacity-80 mb-1">STAKING</p>
              <p className="font-bold">5% - 20%</p>
              <p className="text-xs opacity-80">par jour</p>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Stats */}
      <div className="px-4 mt-6 pb-24">
        <AnimatedCard className="p-4" hoverEffect="glow" delay={300}>
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="font-bold text-gray-900">Mes Investissements</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600">FCFA{currentUser?.total_invested?.toLocaleString() || '0'}</p>
              <p className="text-xs text-gray-600">Total Investi</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">0</p>
              <p className="text-xs text-gray-600">VIP Actifs</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-orange-600">
                {isLoadingCommission ? '...' : `FCFA${totalCommission.toLocaleString()}`}
              </p>
              <p className="text-xs text-gray-600">Commission</p>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Telegram Modal */}
      {showTelegramModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTelegramModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative animate-slideUp shadow-2xl">
            <button
              onClick={() => setShowTelegramModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-300 hover:scale-110"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                <Send className="w-10 h-10 text-white transform rotate-45" />
              </div>
              <h3 className="font-bold text-gray-900 text-xl mb-4 leading-tight">
                Diffusion d'Informations Officielles
              </h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Suivez notre canal officiel Telegram pour obtenir les dernières nouvelles et informations sur les avantages.
              </p>
              
              <button
                onClick={() => setShowTelegramModal(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold text-base hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Suivre Maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton actions={floatingActions} />

      {/* Telegram Popup */}
      <TelegramPopup 
        isOpen={showTelegramPopup}
        onClose={() => setShowTelegramPopup(false)}
      />
    </div>
  );
};