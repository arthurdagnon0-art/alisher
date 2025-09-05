import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Filter, Crown, Clock, TrendingUp, Zap, Calendar, DollarSign } from 'lucide-react';
import { InvestmentService } from '../services/investmentService';

interface ProductsPageProps {
  onBack: () => void;
  user?: any;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onBack, user }) => {
  const [activeTab, setActiveTab] = useState('tous');
  const [userInvestments, setUserInvestments] = useState<any>({ vip: [], staking: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'tous', label: 'Tous' },
    { id: 'normal', label: 'Normal' },
    { id: 'termine', label: 'Terminé' }
  ];

  useEffect(() => {
    loadUserInvestments();
  }, [user?.id]);

  const loadUserInvestments = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await InvestmentService.getUserInvestments(user.id);
      if (result.success) {
        setUserInvestments(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement des investissements');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors du chargement des investissements');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getFilteredInvestments = () => {
    const allInvestments = [
      ...userInvestments.vip.map((inv: any) => ({ ...inv, type: 'vip' })),
      ...userInvestments.staking.map((inv: any) => ({ ...inv, type: 'staking' }))
    ];

    switch (activeTab) {
      case 'normal':
        return allInvestments.filter(inv => inv.status === 'active');
      case 'termine':
        return allInvestments.filter(inv => inv.status === 'completed');
      default:
        return allInvestments;
    }
  };

  const filteredInvestments = getFilteredInvestments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'completed':
        return 'Terminé';
      case 'paused':
        return 'Pausé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const calculateProgress = (investment: any) => {
    if (investment.type === 'vip') {
      // Pour VIP, pas de progression car illimité
      return 100;
    } else {
      // Pour staking, calculer la progression basée sur la date
      const startDate = new Date(investment.created_at);
      const endDate = new Date(investment.unlock_date);
      const now = new Date();
      
      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsed = now.getTime() - startDate.getTime();
      
      return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    }
  };

  const getDaysLeft = (unlockDate: string) => {
    const now = new Date();
    const unlock = new Date(unlockDate);
    const diffTime = unlock.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-slideInRight">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="mr-3 p-2 hover:bg-blue-500 rounded-full transition-all duration-300 transform hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">Mon produit</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 shadow-sm animate-fadeInDown">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredInvestments.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fadeInUp delay-300">
            <div className="relative mb-8">
              {/* Animated 3D Box */}
              <div className="w-32 h-32 relative animate-float">
                <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-green-400 rounded-xl transform rotate-12 shadow-lg"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-green-500 rounded-xl transform -rotate-6 shadow-lg"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-xl flex items-center justify-center">
                  <Package className="w-16 h-16 text-white" />
                </div>
              </div>
              
              {/* Floating particles */}
              <div className="absolute -top-4 -left-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute -top-2 -right-6 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-500"></div>
              <div className="absolute -bottom-4 -right-2 w-4 h-4 bg-purple-400 rounded-full animate-bounce delay-700"></div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {activeTab === 'tous' ? 'Aucun produit trouvé' :
                 activeTab === 'normal' ? 'Aucun investissement actif' :
                 'Aucun investissement terminé'}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'tous' ? 'Vous n\'avez pas encore d\'investissements' :
                 activeTab === 'normal' ? 'Vous n\'avez pas d\'investissements actifs' :
                 'Vous n\'avez pas d\'investissements terminés'}
              </p>
              
              <button 
                onClick={() => window.location.hash = '#investments'}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Commencer à investir
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvestments.map((investment, index) => (
              <div 
                key={investment.id} 
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-cyan-400 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-[8px] leading-tight text-center font-gothic">
                        Alisher<br/>USMANOV
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {investment.type === 'vip' ? investment.package_name : investment.plan_name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {investment.type === 'vip' ? (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold flex items-center">
                            <Crown className="w-3 h-3 mr-1" />
                            {investment.package_name}
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {getDaysLeft(investment.unlock_date)}J restants
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(investment.status)}`}>
                          {getStatusText(investment.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {investment.type === 'vip' ? (
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  ) : (
                    <Zap className="w-6 h-6 text-blue-500" />
                  )}
                </div>

                {/* Progress Bar pour Staking */}
                {investment.type === 'staking' && investment.status === 'active' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progression</span>
                      <span>{calculateProgress(investment).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${calculateProgress(investment)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Montant Investi</p>
                    <p className="text-lg font-bold text-blue-600">FCFA {formatAmount(investment.amount)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Revenus Quotidiens</p>
                    <p className="text-lg font-bold text-green-600">FCFA {formatAmount(investment.daily_earnings)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Total Gagné</p>
                    <p className="text-lg font-bold text-purple-600">FCFA {formatAmount(investment.total_earned || 0)}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">
                      {investment.type === 'vip' ? 'Revenus Illimités' : 'Total Possible'}
                    </p>
                    <p className="text-lg font-bold text-orange-600">
                      {investment.type === 'vip' ? (
                        <span className="text-orange-600">∞</span>
                      ) : (
                        `FCFA ${formatAmount(investment.amount + (investment.daily_earnings * getDaysFromDuration(investment.plan_name)))}`
                      )}
                    </p>
                  </div>
                </div>

                {/* Type-specific Info */}
                {investment.type === 'staking' && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">
                          {investment.status === 'active' ? 'Temps restant' : 'Durée totale'}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        {investment.status === 'active' ? 
                          `${getDaysLeft(investment.unlock_date)} jours` :
                          `${getDaysFromDuration(investment.plan_name)} jours`
                        }
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <p>Début: {formatDate(investment.created_at)}</p>
                      <p>Fin: {formatDate(investment.unlock_date)}</p>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    <p>Créé le {formatDate(investment.created_at)}</p>
                    <p className="text-xs">ID: {investment.id.substring(0, 8)}...</p>
                  </div>
                  <div className="flex space-x-2">
                    {investment.status === 'active' && investment.type === 'vip' && (
                      <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors">
                        Pause
                      </button>
                    )}
                    {investment.status === 'completed' && investment.type === 'staking' && (
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                        Récupéré
                      </button>
                    )}
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Fonction utilitaire pour extraire la durée depuis le nom du plan
function getDaysFromDuration(planName: string): number {
  const match = planName.match(/(\d+)\s*jours?/i);
  return match ? parseInt(match[1]) : 0;
}