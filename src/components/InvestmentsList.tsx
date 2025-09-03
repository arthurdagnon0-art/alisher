import React, { useState, useEffect } from 'react';
import { Zap, ArrowLeft, Crown } from 'lucide-react';
import { InvestmentService } from '../services/investmentService';

interface InvestmentsListProps {
  onBack?: () => void;
  user?: any;
}

export const InvestmentsList: React.FC<InvestmentsListProps> = ({ onBack, user }) => {
  const [selectedFilter, setSelectedFilter] = useState('VIPs');
  const [activeTab, setActiveTab] = useState('vip');
  const [vipPackages, setVipPackages] = useState<any[]>([]);
  const [stakingPlans, setStakingPlans] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvestmentData();
  }, []);

  const loadInvestmentData = async () => {
    setIsLoadingData(true);
    try {
      const vipResult = await InvestmentService.getVIPPackages();
      if (vipResult.success) setVipPackages(vipResult.data);

      const stakingResult = await InvestmentService.getStakingPlans();
      if (stakingResult.success) setStakingPlans(stakingResult.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const formatAmount = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount);

  const handleInvest = (pkg: any, type: 'vip' | 'staking') => {
    setSelectedPackage({ ...pkg, type });
    setShowInvestModal(true);
  };

  const confirmInvestment = async () => {
    if (!investAmount || !selectedPackage || !user) {
      setError('Informations manquantes');
      return;
    }
    const amount = parseFloat(investAmount);

    if (amount < selectedPackage.min_amount) {
      setError(`Montant minimum: ${selectedPackage.min_amount.toLocaleString()} FCFA`);
      return;
    }
    if (selectedPackage.type === 'vip' && amount > selectedPackage.max_amount) {
      setError(`Montant maximum: ${selectedPackage.max_amount.toLocaleString()} FCFA`);
      return;
    }
    if (amount > user.balance_deposit) {
      setError('Solde insuffisant');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let result;
      if (selectedPackage.type === 'vip') {
        result = await InvestmentService.createVIPInvestment(user.id, selectedPackage.id, amount);
      } else {
        result = await InvestmentService.createStakingInvestment(user.id, selectedPackage.id, amount);
      }

      if (result.success) {
        alert(`Investissement ${selectedPackage.type.toUpperCase()} créé avec succès !`);
        setShowInvestModal(false);
        setInvestAmount('');
        window.location.reload();
      } else {
        setError(result.error || 'Erreur lors de l\'investissement');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'investissement');
    } finally {
      setIsLoading(false);
    }
  };

  const filters = [
    { id: 'VIPs', label: 'VIPs', src: 'https://i.postimg.cc/SKC9pmqt/vip-icon-1.png' },
    { id: 'STAKINGS', label: 'STAKINGS', src: 'https://i.postimg.cc/sDH7YnwK/invest-active.png' }
  ];

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-gothic-italic flex flex-col sm:flex-row">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg fixed top-0 left-0 right-0 z-40 sm:static">
        <div className="flex items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-2 p-2 hover:bg-blue-500 rounded-full transition-all"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
          <h1 className="text-lg sm:text-xl font-bold flex-1 text-center">Liste des Investissements</h1>
        </div>
      </div>

      {/* Sidebar (en bas sur mobile, à gauche sur desktop) */}
      <div className="w-full sm:w-20 bg-white shadow-sm border-t sm:border-t-0 sm:border-r border-gray-200 flex sm:flex-col justify-around sm:justify-start fixed bottom-0 sm:static z-40">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`flex-1 sm:w-full p-2 sm:p-3 flex flex-col items-center text-xs sm:text-sm ${
              selectedFilter === filter.id
                ? 'bg-blue-100 text-blue-600 sm:border-r-2 sm:border-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <img src={filter.src} className="w-6 h-6 mb-1" alt={filter.label} />
            <span className="hidden xxs:block">{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 pt-16 sm:pt-0 pb-20 sm:pb-0">
        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-2 sm:px-4 pt-3 sm:pt-4 sticky top-14 sm:top-0 z-30">
          <div className="flex">
            <button
              onClick={() => setActiveTab('vip')}
              className={`flex-1 py-2 sm:py-3 font-medium text-sm sm:text-base rounded-l-lg ${
                activeTab === 'vip'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-r'
              }`}
            >
              VIP Packs
            </button>
            <button
              onClick={() => setActiveTab('staking')}
              className={`flex-1 py-2 sm:py-3 font-medium text-sm sm:text-base rounded-r-lg ${
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
        <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
          {activeTab === 'vip' &&
            vipPackages.map((vip, i) => (
              <div key={vip.id} className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-400 rounded-lg flex items-center justify-center">
                    <span className="text-white text-[7px] sm:text-[8px] font-bold text-center">Alisher<br />USMANOV</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-lg">{vip.name}</h3>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold flex items-center">
                        <Crown className="w-3 h-3 mr-1" />
                        {vip.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span className="text-gray-600">Taux:</span>
                      <span className="text-green-600 font-bold">{vip.daily_rate}%/jour</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm mb-3">
                      <span className="text-gray-600">Durée:</span>
                      <span className="text-orange-600 font-medium">Illimitée</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-blue-600 font-bold text-xs sm:text-base">
                        FCFA {formatAmount(vip.min_amount)}
                        <div className="text-gray-500 text-[10px]">à {formatAmount(vip.max_amount)}</div>
                      </div>
                      <button
                        onClick={() => handleInvest(vip, 'vip')}
                        className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex items-center hover:bg-blue-700"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Investir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {activeTab === 'staking' &&
            stakingPlans.map((plan, i) => (
              <div key={plan.id} className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-400 rounded-lg flex items-center justify-center">
                    <span className="text-white text-[7px] sm:text-[8px] font-bold text-center">Alisher<br />USMANOV</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-lg">{plan.name}</h3>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                        {plan.duration_days}J
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Taux:</span>
                      <span className="text-green-600 font-bold">{plan.daily_rate}%/jour</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm mb-3">
                      <span className="text-gray-600">Durée:</span>
                      <span className="text-blue-600 font-medium">{plan.duration_days} jours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-blue-600 font-bold text-xs sm:text-base">
                        FCFA {formatAmount(plan.min_amount)}
                      </div>
                      <button
                        onClick={() => handleInvest(plan, 'staking')}
                        className="bg-green-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex items-center hover:bg-green-700"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Staker
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal investissement */}
      {showInvestModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInvestModal(false);
              setError('');
              setInvestAmount('');
            }
          }}
        >
          <div className="w-full sm:w-auto sm:min-w-[400px] sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* header modal */}
            <div className="flex items-center space-x-3 p-4 border-b">
              <div className="w-12 h-12 bg-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-[8px] text-center">Alisher<br />USMANOV</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedPackage?.name}</h3>
              </div>
            </div>

            {/* contenu modal */}
            <div className="p-4 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Montant à Payer</span>
                <span className="font-bold text-blue-600 text-lg">
                  FCFA{formatAmount(parseFloat(investAmount) || selectedPackage?.min_amount || 0)}
                </span>
              </div>
              <input
                type="number"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                placeholder={`Min: ${formatAmount(selectedPackage?.min_amount || 0)}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* actions */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={confirmInvestment}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 mb-3"
              >
                {isLoading ? 'Traitement...' : selectedPackage?.type === 'vip' ? 'Investir Maintenant' : 'Staker Maintenant'}
              </button>
              <button
                onClick={() => setShowInvestModal(false)}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
