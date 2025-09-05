import React, { useState, useEffect } from 'react';
import { Crown, TrendingUp } from 'lucide-react';
import { InvestmentService } from '../services/investmentService';

interface VIPStatusCardProps {
  user: any;
  onNavigate: (page: string) => void;
}

interface VIPLevel {
  level: number;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyRate: number;
  icon: string;
}

const vipLevels: VIPLevel[] = [
  { level: 0, name: 'VIP0', minAmount: 3000, maxAmount: 70000, dailyRate: 5.0, icon: 'https://i.postimg.cc/5tf1SFb3/lv0.png' },
  { level: 1, name: 'VIP1', minAmount: 75000, maxAmount: 200000, dailyRate: 7.0, icon: 'https://i.postimg.cc/90JTN1Vm/lv1.png' },
  { level: 2, name: 'VIP2', minAmount: 205000, maxAmount: 500000, dailyRate: 9.0, icon: 'https://i.postimg.cc/RhMKRykp/lv2.png' },
  { level: 3, name: 'VIP3', minAmount: 505000, maxAmount: 1000000, dailyRate: 11.0, icon: 'https://i.postimg.cc/xCVKkct2/lv3.png' },
  { level: 4, name: 'VIP4', minAmount: 1005000, maxAmount: 5000000, dailyRate: 13.0, icon: 'https://i.postimg.cc/xCVKkct2/lv3.png' }
];

export const VIPStatusCard: React.FC<VIPStatusCardProps> = ({ user, onNavigate }) => {
  const [userInvestments, setUserInvestments] = useState<any>({ vip: [], staking: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserInvestments();
  }, [user?.id]);

  const loadUserInvestments = async () => {
    if (!user?.id) return;
    
    try {
      const result = await InvestmentService.getUserInvestments(user.id);
      if (result.success) {
        setUserInvestments(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des investissements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer le niveau VIP actuel basé sur le total investi
  const getCurrentVIPLevel = () => {
    const totalInvested = user?.total_invested || 0;
    
    // Trouver le niveau VIP le plus élevé atteint
    for (let i = vipLevels.length - 1; i >= 0; i--) {
      if (totalInvested >= vipLevels[i].minAmount) {
        return vipLevels[i];
      }
    }
    
    return vipLevels[0]; // VIP0 par défaut
  };

  // Calculer la progression vers le niveau suivant
  const getProgressToNextLevel = () => {
    const totalInvested = user?.total_invested || 0;
    const currentLevel = getCurrentVIPLevel();
    
    // Si c'est le niveau maximum, progression à 100%
    if (currentLevel.level === vipLevels.length - 1) {
      return {
        progress: 100,
        nextLevelAmount: currentLevel.maxAmount,
        currentAmount: totalInvested,
        isMaxLevel: true
      };
    }
    
    const nextLevel = vipLevels[currentLevel.level + 1];
    const progress = Math.min((totalInvested / nextLevel.minAmount) * 100, 100);
    
    return {
      progress,
      nextLevelAmount: nextLevel.minAmount,
      currentAmount: totalInvested,
      isMaxLevel: false,
      nextLevel
    };
  };

  // Vérifier si l'utilisateur a des investissements VIP actifs
  const hasActiveVIP = () => {
    return userInvestments.vip.some((investment: any) => investment.status === 'active');
  };

  const currentVIPLevel = getCurrentVIPLevel();
  const progressData = getProgressToNextLevel();

  return (
    <div 
      className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      style={{
        backgroundImage: 'url(https://i.postimg.cc/nL4XPTYy/vip-bg.png)', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={() => onNavigate('vip')}
    >
      {/* Animated background particles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-2 left-4 w-2 h-2 bg-white bg-opacity-30 rounded-full animate-ping"></div>
        <div className="absolute top-8 right-8 w-3 h-3 bg-yellow-300 bg-opacity-50 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-4 left-8 w-1 h-1 bg-white bg-opacity-40 rounded-full animate-bounce delay-700"></div>
      </div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              hasActiveVIP() 
                ? 'bg-green-400 bg-opacity-90 text-green-900' 
                : 'bg-white bg-opacity-20 text-white'
            }`}>
              {currentVIPLevel.name}
            </span>
            {hasActiveVIP() && (
              <span className="bg-green-400 bg-opacity-90 text-green-900 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                ACTIF
              </span>
            )}
          </div>
          {!progressData.isMaxLevel && (
            <div className="text-xs opacity-90">
              Prochain niveau: {progressData.nextLevel?.name}
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-heartbeat shadow-lg">
          <img src={currentVIPLevel.icon} alt={currentVIPLevel.name} className="w-8 h-8" />
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">NIVEAU VIP</span>
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold">{currentVIPLevel.name}</span>
          </div>
        </div>
        <div className="w-full bg-white bg-opacity-30 rounded-full h-3 mb-2 hover:bg-opacity-40 transition-all duration-300">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg"
            style={{ width: `${progressData.progress}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs opacity-90">
          <span>
            Progression actuelle: {progressData.currentAmount.toLocaleString()} FCFA
          </span>
          {!progressData.isMaxLevel && (
            <span>
              / {progressData.nextLevelAmount.toLocaleString()} FCFA
            </span>
          )}
        </div>
        
        {/* Revenus quotidiens actuels */}
        {hasActiveVIP() && (
          <div className="mt-3 pt-3 border-t border-white border-opacity-30">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-90">Revenus quotidiens</span>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-sm font-bold text-green-400">
                  {currentVIPLevel.dailyRate}% / jour
                </span>
              </div>
            </div>
          </div>
        )}
        
        {progressData.isMaxLevel && (
          <div className="mt-2 text-center">
            <span className="bg-yellow-400 bg-opacity-90 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              🏆 NIVEAU MAXIMUM ATTEINT
            </span>
          </div>
        )}
      </div>
    </div>
  );
};