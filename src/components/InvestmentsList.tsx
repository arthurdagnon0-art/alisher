import React, { useState } from 'react';
import { useEffect } from 'react';
import { Zap, ArrowLeft, Crown } from 'lucide-react';
import { InvestmentService } from '../services/investmentService';
import { supabase } from '../lib/supabase';

interface InvestmentsListProps {
  onBack?: () => void;
  user?: any;
}

export const InvestmentsList: React.FC<InvestmentsListProps> = ({ onBack, user }) => {
  const [selectedFilter, setSelectedFilter] = useState('fixe1');
  const [activeTab, setActiveTab] = useState('vip');
  const [vipPackages, setVipPackages] = useState<any[]>([]);
  const [stakingPlans, setStakingPlans] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [userInvestments, setUserInvestments] = useState<any>({ vip: [], staking: [] });
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // État pour l'utilisateur avec données à jour
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    loadInvestmentData();
    if (user?.id) {
      loadUserInvestments();
    }
    // Charger les données utilisateur à jour
    loadCurrentUser();
  }, []);

  // Recharger les investissements quand currentUser change
  useEffect(() => {
    if (currentUser?.id) {
      loadUserInvestments();
    }
  }, [currentUser?.id]);

  const loadCurrentUser = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
        console.log('👤 Utilisateur chargé dans InvestmentsList:', userData);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
      }
    }
  };

  const loadInvestmentData = async () => {
    setIsLoadingData(true);
    try {
      // Charger les packages VIP
      const vipResult = await InvestmentService.getVIPPackages();
      if (vipResult.success) {
        setVipPackages(vipResult.data);
      }

      // Charger les plans de staking
      const stakingResult = await InvestmentService.getStakingPlans();
      if (stakingResult.success) {
        setStakingPlans(stakingResult.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadUserInvestments = async () => {
    if (!user?.id) return;
    
    try {
      const result = await InvestmentService.getUserInvestments(user.id);
      if (result.success) {
        setUserInvestments(result.data);
        console.log('📊 Investissements chargés:', result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des investissements utilisateur:', error);
    }
  };

  const hasActiveVIP = () => {
    const hasVIP = userInvestments.vip.some((investment: any) => investment.status === 'active');
    console.log('🔍 Vérification VIP actif:', { 
      vipInvestments: userInvestments.vip, 
      hasActiveVIP: hasVIP 
    });
    return hasVIP;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const handleInvest = async (packageData: any, type: 'vip' | 'staking') => {
    // Vérifier si l'utilisateur a un VIP actif avant d'autoriser le staking
    if (type === 'staking' && !hasActiveVIP()) {
      setError('You must activate a VIP first.');
      return;
    }
    
    setSelectedPackage({ ...packageData, type });
    setShowInvestModal(true);
  };

  const confirmInvestment = async () => {
    if (!investAmount || !selectedPackage || !currentUser) {
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

    // Debug: Afficher les valeurs pour diagnostic
    console.log('💰 Vérification investissement:', {
      amount,
      currentUserBalance: currentUser?.balance_deposit,
      selectedPackage: selectedPackage.name,
      type: selectedPackage.type
    });

    if (amount > (currentUser?.balance_deposit || 0)) {
      setError('Solde insuffisant');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let result;
      if (selectedPackage.type === 'vip') {
        result = await InvestmentService.createVIPInvestment(currentUser.id, selectedPackage.id, amount);
      } else {
        result = await InvestmentService.createStakingInvestment(currentUser.id, selectedPackage.id, amount);
      }

      if (result.success) {
        alert(`Investissement ${selectedPackage.type.toUpperCase()} créé avec succès !`);
        setShowInvestModal(false);
        setInvestAmount('');
        setSelectedPackage(null);
        // Actualiser les données utilisateur
        // Recharger les données utilisateur depuis la base
        await refreshUserData();
        // Recharger les investissements après mise à jour
        await loadUserInvestments();
        
        // Si c'est un investissement VIP, mettre à jour immédiatement l'état local
        if (selectedPackage.type === 'vip') {
          // Ajouter l'investissement VIP à l'état local pour débloquer immédiatement le staking
          setUserInvestments(prev => ({
            ...prev,
            vip: [...prev.vip, {
              id: result.data.id,
              status: 'active',
              package_name: selectedPackage.name,
              amount: amount,
              daily_earnings: (amount * selectedPackage.daily_rate) / 100,
              total_earned: 0,
              created_at: new Date().toISOString()
            }]
          }));
          console.log('✅ VIP ajouté localement - Staking maintenant disponible');
        }
      } else {
        setError(result.error || 'Erreur lors de l\'investissement');
        console.error('❌ Erreur investissement:', result.error);
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'investissement');
      console.error('❌ Exception investissement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!currentUser?.id) return;
    
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
        // Déclencher un événement global pour mettre à jour les autres composants
        window.dispatchEvent(new CustomEvent('refreshUserData'));
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setError(''); // Clear any previous errors
  };

  const filters = [
    { id: 'VIPs', label: 'VIPs', icon: '📊', src: 'https://i.postimg.cc/SKC9pmqt/vip-icon-1.png', vip:'vip' },
    { id: 'STAKINGS', label: 'STAKINGS', icon: '📈', src: 'https://i.postimg.cc/sDH7YnwK/invest-active.png', vip:'staking' }

  ];

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-gothic-italic">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center">
          {onBack && (
            <button 
              onClick={onBack} 
              className="mr-2 xxs:mr-3 p-1 xxs:p-2 hover:bg-blue-500 rounded-full transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 xxs:w-6 xxs:h-6" />
            </button>
          )}
          <h1 className="text-sm xxs:text-xl font-bold flex-1 text-center">Liste des Investissements</h1>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-10 xxs:w-12 xs:w-14 sm:w-16 md:w-20 bg-white shadow-sm border-r border-gray-200 text-sm">
          <div className="py-1 xxs:py-2 xs:py-3 sm:py-4">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleTabChange(filter.vip)}
                className={`w-full p-1 xxs:p-2 xs:p-3 mb-1 xxs:mb-2 flex flex-col items-center text-[7px] xxs:text-[8px] xs:text-[10px] sm:text-xs transition-all duration-300 ${
                  selectedFilter === filter.id
                    ? 'bg-blue-100 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="text-xs xxs:text-sm xs:text-base mb-0.5 xxs:mb-1">
                  <img src={filter.src} className="w-3 h-3 xxs:w-4 xxs:h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </span>
                <span className="font-medium leading-tight text-center">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-50 text-xs">
          {selectedFilter !== 'activite' ? (
            <>
              {/* Tab Navigation */}
              <div className="bg-white text-sm border-b border-gray-200 px-1 xxs:px-2 xs:px-3 sm:px-4 pt-2 xxs:pt-3 xs:pt-4">
                <div className="flex">
                  <button
                    onClick={() => handleTabChange('vip')}
                    className={`flex-1 py-2 xxs:py-3 font-medium text-xs xxs:text-sm xs:text-base rounded-l-lg transition-all duration-300 ${
                      activeTab === 'vip'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-r border-gray-300'
                    }`}
                  >
                    VIP Packs
                  </button>
                  <button
                    onClick={() => handleTabChange('staking')}
                    className={`flex-1 py-2 xxs:py-3 font-medium text-xs xxs:text-sm xs:text-base rounded-r-lg transition-all duration-300 ${
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
              <div className="p-1 xxs:p-2 xs:p-3 sm:p-4 space-y-2 xxs:space-y-3 xs:space-y-4 pb-24 texte-xs mb-28">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}

                {activeTab === 'vip' && vipPackages.map((vip, index) => (
                  <div key={vip.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 xxs:p-3 xs:p-4 animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-start space-x-2 xxs:space-x-3 xs:space-x-4">
                      {/* Logo */}
                      <div className="w-7 h-7 xxs:w-8 xxs:h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-[5px] xxs:text-[6px] xs:text-[7px] sm:text-[8px] leading-tight text-center font-gothic">Alisher<br/>USMANOV</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1 xxs:mb-2 xs:mb-3">
                          <h3 className="font-bold text-gray-900 text-xs xxs:text-sm xs:text-base sm:text-lg">{vip.name}</h3>
                          <span className="bg-yellow-100 text-yellow-800 px-1 xxs:px-2 py-0.5 xxs:py-1 rounded text-[8px] xxs:text-[10px] xs:text-xs font-bold flex items-center">
                            <Crown className="w-2 h-2 xxs:w-2.5 xxs:h-2.5 xs:w-3 xs:h-3 mr-0.5 xxs:mr-1" />
                            <span className="font-gothic-italic">{vip.name}</span>
                          </span>
                        </div>

                        {/* Compact Stats */}
                        <div className="space-y-0.5 xxs:space-y-1 xs:space-y-2 mb-1 xxs:mb-2 xs:mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] xxs:text-xs xs:text-sm text-gray-600">Taux:</span>
                            <span className="text-[10px] xxs:text-xs xs:text-sm text-green-600 font-bold">{vip.daily_rate}%/jour</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] xxs:text-xs xs:text-sm text-gray-600">Durée:</span>
                            <span className="text-[10px] xxs:text-xs xs:text-sm text-orange-600 font-medium">Illimitée</span>
                          </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="flex items-center justify-between">
                          <div className="text-blue-600 font-bold text-[10px] xxs:text-xs xs:text-sm sm:text-base">
                            FCFA {formatAmount(vip.min_amount)}
                            <div className="text-[8px] xxs:text-[10px] xs:text-xs text-gray-500">à {formatAmount(vip.max_amount)}</div>
                          </div>
                          <button 
                            onClick={() => handleInvest({
                              ...vip,
                              title: `Titres à revenu fixe - ${vip.name}`
                            }, 'vip')}
                            className="bg-blue-600 text-white px-2 xxs:px-3 xs:px-4 sm:px-6 py-1 xxs:py-1.5 xs:py-2 rounded-full font-bold text-[10px] xxs:text-xs xs:text-sm hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center"
                          >
                            <Zap className="w-2.5 h-2.5 xxs:w-3 xxs:h-3 xs:w-4 xs:h-4 mr-0.5 xxs:mr-1" />
                            Investir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {activeTab === 'staking' && stakingPlans.map((plan, index) => (
                  <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 xxs:p-3 xs:p-4 animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                    {!hasActiveVIP() && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-red-600 text-sm font-medium">You must activate a VIP first.</p>
                      </div>
                    )}
                    <div className="flex items-start space-x-2 xxs:space-x-3 xs:space-x-4">
                      {/* Logo */}
                      <div className="w-7 h-7 xxs:w-8 xxs:h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-[5px] xxs:text-[6px] xs:text-[7px] sm:text-[8px] leading-tight text-center font-gothic">Alisher<br/>USMANOV</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1 xxs:mb-2 xs:mb-3">
                          <h3 className="font-bold text-gray-900 text-xs xxs:text-sm xs:text-base sm:text-lg">{plan.name}</h3>
                          <span className="bg-green-100 text-green-800 px-1 xxs:px-2 py-0.5 xxs:py-1 rounded text-[8px] xxs:text-[10px] xs:text-xs font-bold">
                            {plan.duration_days}J
                          </span>
                        </div>

                        {/* Compact Stats */}
                        <div className="space-y-0.5 xxs:space-y-1 xs:space-y-2 mb-1 xxs:mb-2 xs:mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] xxs:text-xs xs:text-sm text-gray-600">Taux:</span>
                            <span className="text-[10px] xxs:text-xs xs:text-sm text-green-600 font-bold">{plan.daily_rate}%/jour</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] xxs:text-xs xs:text-sm text-gray-600">Durée:</span>
                            <span className="text-[10px] xxs:text-xs xs:text-sm text-blue-600 font-medium">{plan.duration_days} jours</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] xxs:text-xs xs:text-sm text-gray-600">Total:</span>
                            <span className="text-[10px] xxs:text-xs xs:text-sm text-purple-600 font-bold">
                              {(plan.daily_rate * plan.duration_days).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="flex items-center justify-between">
                          <div className="text-blue-600 font-bold text-[10px] xxs:text-xs xs:text-sm sm:text-base">
                           Commence par FCFA {formatAmount(plan.min_amount)}
                          </div>
                          <button 
                            onClick={() => handleInvest(plan, 'staking')}
                            disabled={!hasActiveVIP()}
                            className={`px-2 xxs:px-3 xs:px-4 sm:px-6 py-1 xxs:py-1.5 xs:py-2 rounded-full font-bold text-[10px] xxs:text-xs xs:text-sm transition-all duration-300 transform flex items-center ${
                              hasActiveVIP() 
                                ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <Zap className="w-2.5 h-2.5 xxs:w-3 xxs:h-3 xs:w-4 xs:h-4 mr-0.5 xxs:mr-1" />
                            Staker
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Page Activité */
            <div className="p-2 xxs:p-3 xs:p-4 pb-24">
              <div className="text-center py-12">
                <div className="w-16 h-16 xxs:w-18 xxs:h-18 xs:w-20 xs:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl xxs:text-3xl">📊</span>
                </div>
                <h3 className="text-base xxs:text-lg font-bold text-gray-600 mb-2">Aucune activité</h3>
                <p className="text-sm xxs:text-base text-gray-500">Vos investissements apparaîtront ici</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInvestModal(false);
              setError('');
              setInvestAmount('');
            }
          }}
        >
          <div className="w-full sm:w-auto sm:min-w-[400px] sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
            {/* Header avec logo et titre */}
            <div className="flex items-center space-x-3 p-4 xxs:p-5 xs:p-6 border-b border-gray-100">
              <div className="w-10 h-10 xxs:w-12 xxs:h-12 bg-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-[8px] leading-tight text-center font-gothic">Alisher<br/>USMANOV</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base xxs:text-lg">{selectedPackage?.name}</h3>
                <span className="bg-yellow-100 text-yellow-800 px-1.5 xxs:px-2 py-0.5 xxs:py-1 rounded text-[10px] xxs:text-xs font-bold flex items-center w-fit">
                  <Crown className="w-2.5 h-2.5 xxs:w-3 xxs:h-3 mr-0.5 xxs:mr-1" />
                  {selectedPackage?.type === 'vip' ? selectedPackage?.name : `${selectedPackage?.duration_days}J`}
                </span>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-4 xxs:p-5 xs:p-6 space-y-4 xxs:space-y-5 xs:space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 xxs:p-3">
                  <p className="text-red-600 text-xs xxs:text-sm">{error}</p>
                </div>
              )}

              {/* Informations détaillées */}
              <div className="space-y-2 xxs:space-y-3 xs:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs xxs:text-sm text-gray-600">Prix Unitaire</span>
                  <span className="font-bold text-blue-600 text-xs xxs:text-sm">FCFA{formatAmount(selectedPackage?.min_amount || 0)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs xxs:text-sm text-gray-600">Revenu</span>
                  <span className="font-bold text-green-600 text-xs xxs:text-sm">{selectedPackage?.daily_rate?.toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs xxs:text-sm text-gray-600">Revenu Quotidien</span>
                  <span className="font-bold text-green-600 text-xs xxs:text-sm">
                    FCFA{investAmount ? formatAmount(Math.round((parseFloat(investAmount) * (selectedPackage?.daily_rate || 0)) / 100)) : formatAmount(Math.round((selectedPackage?.min_amount || 0) * (selectedPackage?.daily_rate || 0) / 100))}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs xxs:text-sm text-gray-600">Revenu Total</span>
                  <span className="font-bold text-purple-600 text-xs xxs:text-sm">
                    {selectedPackage?.type === 'vip' ? (
                      <span className="text-orange-600">Illimité</span>
                    ) : (
                      `FCFA${investAmount 
                        ? formatAmount(Math.round((parseFloat(investAmount) * (selectedPackage?.daily_rate || 0) * (selectedPackage?.duration_days || 1)) / 100))
                        : formatAmount(Math.round((selectedPackage?.min_amount || 0) * (selectedPackage?.daily_rate || 0) * (selectedPackage?.duration_days || 1) / 100))
                      }`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs xxs:text-sm text-gray-600">Durée</span>
                  <span className="font-bold text-gray-900 text-xs xxs:text-sm">
                    {selectedPackage?.type === 'vip' ? (
                      <span className="text-orange-600">∞</span>
                    ) : (
                      `${selectedPackage?.duration_days} jours`
                    )}
                  </span>
                </div>
              </div>

              {/* Sélecteur de quantité */}
              <div className="bg-gray-50 rounded-lg p-3 xxs:p-4">
                <div className="flex justify-between items-center mb-2 xxs:mb-3">
                  <span className="text-xs xxs:text-sm text-gray-600">Part à Acheter</span>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => {
                        const current = parseFloat(investAmount) || selectedPackage?.min_amount || 0;
                        const increment = selectedPackage?.min_amount || 1000;
                        const newAmount = Math.max(selectedPackage?.min_amount || 0, current - increment);
                        setInvestAmount(newAmount.toString());
                      }}
                      className="w-7 h-7 xxs:w-8 xxs:h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors text-sm xxs:text-base"
                    >
                      -
                    </button>
                    <span className="font-bold text-base xxs:text-lg min-w-[30px] xxs:min-w-[40px] text-center">
                      {investAmount ? Math.round(parseFloat(investAmount) / (selectedPackage?.min_amount || 1)) : 1}
                    </span>
                    <button 
                      onClick={() => {
                        const current = parseFloat(investAmount) || selectedPackage?.min_amount || 0;
                        const increment = selectedPackage?.min_amount || 1000;
                        const newAmount = current + increment;
                        if (selectedPackage?.type === 'vip' && selectedPackage?.max_amount && newAmount <= selectedPackage.max_amount) {
                          setInvestAmount(newAmount.toString());
                        } else if (selectedPackage?.type === 'staking') {
                          setInvestAmount(newAmount.toString());
                        }
                      }}
                      className="w-7 h-7 xxs:w-8 xxs:h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors text-sm xxs:text-base"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Montant à payer */}
              <div className="bg-blue-50 rounded-lg p-3 xxs:p-4">
                <div className="flex justify-between items-center mb-2 xxs:mb-3">
                  <span className="text-xs xxs:text-sm text-gray-600">Montant à Payer</span>
                  <span className="font-bold text-blue-600 text-base xxs:text-lg xs:text-xl">
                    FCFA{formatAmount(parseFloat(investAmount) || selectedPackage?.min_amount || 0)}
                  </span>
                </div>
                <input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  placeholder={`Min: ${formatAmount(selectedPackage?.min_amount || 0)}`}
                  className="w-full px-3 py-2 xxs:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2 text-sm xxs:text-base"
                />
              </div>

              {/* Revenu total attendu */}
              <div className="bg-green-50 rounded-lg p-3 xxs:p-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs xxs:text-sm text-gray-600">Revenu Total Attendu</span>
                  <span className="font-bold text-green-600 text-base xxs:text-lg xs:text-xl">
                    {selectedPackage?.type === 'vip' ? (
                      <span className="text-orange-600">Illimité</span>
                    ) : (
                      `FCFA${formatAmount(Math.round(((parseFloat(investAmount) || selectedPackage?.min_amount || 0) * (selectedPackage?.daily_rate || 0) * (selectedPackage?.duration_days || 1)) / 100))}`
                    )}
                  </span>
                </div>
                {selectedPackage?.type === 'staking' && (
                  <p className="text-[10px] xxs:text-xs text-gray-500 mt-1 xxs:mt-2">
                    Capital remboursé à l'échéance + revenus quotidiens
                  </p>
                )}
              </div>

              {/* Durée pour staking */}
              {selectedPackage?.type === 'staking' && (
                <div className="bg-purple-50 rounded-lg p-3 xxs:p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs xxs:text-sm text-gray-600">Durée de Blocage</span>
                    <span className="font-bold text-purple-600 text-base xxs:text-lg xs:text-xl">
                      {selectedPackage?.duration_days} Jours
                    </span>
                  </div>
                  <p className="text-[10px] xxs:text-xs text-gray-500 mt-1 xxs:mt-2">
                    Fonds bloqués jusqu'à l'échéance
                  </p>
                </div>
              )}

              {/* Solde disponible */}
              <div className="bg-yellow-50 rounded-lg p-2 xxs:p-3 border-l-4 border-yellow-400">
                <div className="text-xs xxs:text-sm">
                  <p className="text-gray-700">
                    <strong>Solde disponible:</strong> 
                    <span className={`ml-2 font-bold ${
                     (currentUser?.balance_deposit || 0) >= (parseFloat(investAmount) || selectedPackage?.min_amount || 0)
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                     FCFA{formatAmount(currentUser?.balance_deposit || 0)}
                    </span>
                  </p>
                  {(currentUser?.balance_deposit || 0) < (parseFloat(investAmount) || selectedPackage?.min_amount || 0) && (
                    <p className="text-red-600 text-[10px] xxs:text-xs mt-1">⚠️ Solde insuffisant</p>
                  )}
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="p-4 xxs:p-5 xs:p-6 border-t border-gray-100 bg-gray-50">
              <button
                onClick={confirmInvestment}
                disabled={isLoading || (currentUser?.balance_deposit || 0) < (parseFloat(investAmount) || selectedPackage?.min_amount || 0)}
                className="w-full bg-blue-600 text-white py-3 xxs:py-4 rounded-xl font-bold text-base xxs:text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-3"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Traitement...</span>
                  </div>
                ) : (
                  (currentUser?.balance_deposit || 0) < (parseFloat(investAmount) || selectedPackage?.min_amount || 0) ? 
                    'Solde insuffisant' :
                    (selectedPackage?.type === 'vip' ? 'Investir Maintenant' : 'Staker Maintenant')
                )}
              </button>
              
              <button
                onClick={() => {
                  setShowInvestModal(false);
                  setError('');
                  setInvestAmount('');
                }}
                className="w-full bg-gray-200 text-gray-800 py-2 xxs:py-3 rounded-xl font-medium hover:bg-gray-300 transition-all duration-300 text-sm xxs:text-base"
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