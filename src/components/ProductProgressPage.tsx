import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Clock, Zap, Crown, Calendar } from 'lucide-react';

interface ProductProgressPageProps {
  onBack: () => void;
}

interface VIPInvestment {
  id: string;
  title: string;
  vipLevel: string;
  amount: number;
  dailyEarnings: number;
  totalEarned: number;
  totalPossible: number;
  status: 'active' | 'paused' | 'completed';
  startDate: string;
  progress: number;
}

interface StakingInvestment {
  id: string;
  title: string;
  amount: number;
  dailyEarnings: number;
  totalEarned: number;
  totalPossible: number;
  duration: number;
  daysLeft: number;
  status: 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  progress: number;
}

export const ProductProgressPage: React.FC<ProductProgressPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('vip');

  // Données d'exemple pour les investissements VIP
  const vipInvestments: VIPInvestment[] = [];

  // Données d'exemple pour les investissements Staking
  const stakingInvestments: StakingInvestment[] = [];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
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
          <h1 className="text-xl font-bold flex-1 text-center">Mes Produits</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm">
        <div className="flex">
          <button
            onClick={() => setActiveTab('vip')}
            className={`flex-1 py-4 font-semibold transition-all duration-300 ${
              activeTab === 'vip'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            VIP Investissements
          </button>
          <button
            onClick={() => setActiveTab('staking')}
            className={`flex-1 py-4 font-semibold transition-all duration-300 ${
              activeTab === 'staking'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Staking
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'vip' && (
          <>
            {vipInvestments.length > 0 ? (
              vipInvestments.map((investment, index) => (
                <div 
                  key={investment.id} 
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-cyan-400 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-[8px] leading-tight text-center font-gothic">Alisher<br/>USMANOV</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{investment.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold flex items-center">
                            <Crown className="w-3 h-3 mr-1" />
                            {investment.vipLevel}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            investment.status === 'active' ? 'bg-green-100 text-green-800' :
                            investment.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {investment.status === 'active' ? 'Actif' : 
                             investment.status === 'paused' ? 'Pausé' : 'Terminé'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progression</span>
                      <span>{investment.progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${investment.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Montant Investi</p>
                      <p className="text-lg font-bold text-blue-600">FCFA {formatAmount(investment.amount)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Revenus Quotidiens</p>
                      <p className="text-lg font-bold text-green-600">FCFA {formatAmount(investment.dailyEarnings)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Total Gagné</p>
                      <p className="text-lg font-bold text-purple-600">FCFA {formatAmount(investment.totalEarned)}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Potentiel Total</p>
                      <p className="text-lg font-bold text-orange-600">FCFA {formatAmount(investment.totalPossible)}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      <p>Démarré le {formatDate(investment.startDate)}</p>
                    </div>
                    <div className="flex space-x-2">
                      {investment.status === 'active' && (
                        <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors">
                          Pause
                        </button>
                      )}
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Détails
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-600 mb-2">Aucun investissement VIP</h3>
                <p className="text-gray-500 mb-4">Commencez à investir dans nos packs VIP</p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Voir les VIP Packs
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'staking' && (
          <>
            {stakingInvestments.length > 0 ? (
              stakingInvestments.map((investment, index) => (
                <div 
                  key={investment.id} 
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-cyan-400 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-[8px] leading-tight text-center font-gothic">Alisher<br/>USMANOV</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{investment.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {investment.duration}J
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            investment.status === 'active' ? 'bg-green-100 text-green-800' :
                            investment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {investment.status === 'active' ? 'Actif' : 
                             investment.status === 'completed' ? 'Terminé' : 'Annulé'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Clock className="w-6 h-6 text-blue-500" />
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progression</span>
                      <span>{investment.progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          investment.status === 'completed' 
                            ? 'bg-gradient-to-r from-green-500 to-blue-500'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}
                        style={{ width: `${investment.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Time Info */}
                  {investment.status === 'active' && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">Temps restant</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">{investment.daysLeft} jours</span>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Montant Staké</p>
                      <p className="text-lg font-bold text-blue-600">FCFA {formatAmount(investment.amount)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Revenus Quotidiens</p>
                      <p className="text-lg font-bold text-green-600">FCFA {formatAmount(investment.dailyEarnings)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Total Gagné</p>
                      <p className="text-lg font-bold text-purple-600">FCFA {formatAmount(investment.totalEarned)}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Total à Maturité</p>
                      <p className="text-lg font-bold text-orange-600">FCFA {formatAmount(investment.totalPossible)}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      <p>Du {formatDate(investment.startDate)} au {formatDate(investment.endDate)}</p>
                    </div>
                    <div className="flex space-x-2">
                      {investment.status === 'active' && investment.daysLeft > 0 && (
                        <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                          Annuler
                        </button>
                      )}
                      {investment.status === 'completed' && (
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                          Récupérer
                        </button>
                      )}
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Détails
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-600 mb-2">Aucun staking actif</h3>
                <p className="text-gray-500 mb-4">Commencez à staker avec nos plans</p>
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Voir les Plans Staking
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};