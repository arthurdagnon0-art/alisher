import React, { useState } from 'react';
import { ArrowLeft, CreditCard, User, Hash, DollarSign, Lock, ChevronDown, Edit, Trash2, RefreshCw } from 'lucide-react';
import { BankCardService } from '../services/bankCardService';
import { AuthService } from '../services/authService';
import { PaymentService } from '../services/paymentService';
import { platformSettings } from '../data/investments';

interface BankCardPageProps {
  user?: any;
  onBack: () => void;
}

export const BankCardPage: React.FC<BankCardPageProps> = ({ user, onBack }) => {
  const [selectedWallet, setSelectedWallet] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [usdtAddress, setUsdtAddress] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [transactionPassword, setTransactionPassword] = useState('');
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userBankCards, setUserBankCards] = useState<any[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<any[]>([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);

  // Charger les cartes existantes et les portefeuilles disponibles
  React.useEffect(() => {
    loadUserBankCards();
    loadAvailableWallets();
  }, [user?.id]);

  const loadUserBankCards = async () => {
    if (!user?.id) return;
    
    setIsLoadingCards(true);
    try {
      const result = await BankCardService.getUserBankCards(user.id);
      if (result.success) {
        setUserBankCards(result.data);
        // Si l'utilisateur a déjà une carte, pré-remplir le formulaire pour modification
        if (result.data.length > 0) {
          const card = result.data[0];
          setCardHolderName(card.card_holder_name);
          setCardNumber(card.card_number);
          setSelectedWallet(card.wallet_type);
          setEditingCard(card);
          
          // Si c'est une adresse USDT, la mettre dans le champ USDT
          if (card.wallet_type.toLowerCase().includes('usdt')) {
            setUsdtAddress(card.card_number);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cartes:', error);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const loadAvailableWallets = async () => {
    setIsLoadingWallets(true);
    try {
      // Charger les méthodes de paiement depuis le backend
      const result = await PaymentService.getActivePaymentMethods(user?.country);
      if (result.success) {
        setAvailableWallets(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des portefeuilles:', error);
    } finally {
      setIsLoadingWallets(false);
    }
  };

  // Conversion automatique USDT vers FCFA
  const getUsdtToFcfaConversion = () => {
    if (!usdtAmount) return '';
    const fcfaAmount = parseFloat(usdtAmount) * platformSettings.usdt_exchange_rate;
    return fcfaAmount.toLocaleString();
  };

  // Conversion automatique FCFA vers USDT
  const getFcfaToUsdtConversion = () => {
    if (!cardNumber) return '';
    const amount = parseFloat(cardNumber);
    if (isNaN(amount)) return '';
    const usdtAmount = amount / platformSettings.usdt_exchange_rate;
    return usdtAmount.toFixed(4);
  };

  const handleSaveBankCard = async () => {
    if (!selectedWallet || !cardHolderName || !transactionPassword) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Déterminer le numéro de carte à utiliser
    let finalCardNumber = cardNumber;
    const selectedWalletData = availableWallets.find(w => w.id === selectedWallet);
    
    if (selectedWalletData?.name.toLowerCase().includes('usdt')) {
      if (!usdtAddress) {
        setError('Veuillez entrer votre adresse USDT');
        return;
      }
      finalCardNumber = usdtAddress;
    } else {
      if (!cardNumber) {
        setError('Veuillez entrer le numéro de portefeuille');
        return;
      }
    }

    if (!user?.id) {
      setError('Erreur utilisateur. Veuillez vous reconnecter.');
      return;
    }

    // Vérifier le mot de passe de transaction
    const passwordResult = await AuthService.verifyTransactionPassword(user.id, transactionPassword);
    if (!passwordResult.success) {
      setError('Erreur lors de la vérification du mot de passe de transaction');
      return;
    }

    if (!passwordResult.isValid) {
      setError('Mot de passe de transaction incorrect');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;
      
      if (editingCard) {
        // Modifier la carte existante
        result = await BankCardService.updateBankCard(editingCard.id, {
          card_holder_name: cardHolderName,
          card_number: finalCardNumber
        });
      } else {
        // Créer une nouvelle carte
        result = await BankCardService.createBankCard(
          user.id,
          selectedWalletData?.name.toLowerCase().replace(/\s+/g, '_') || selectedWallet,
          cardHolderName,
          finalCardNumber
        );
      }

      if (result.success) {
        setSuccess(editingCard ? 'Carte bancaire modifiée avec succès !' : 'Carte bancaire ajoutée avec succès !');
        // Réinitialiser le formulaire
        if (!editingCard) {
          setSelectedWallet('');
          setCardHolderName('');
          setCardNumber('');
          setUsdtAddress('');
          setUsdtAmount('');
        }
        setTransactionPassword('');
        setShowForm(false);
        // Recharger les cartes
        await loadUserBankCards();
      } else {
        setError(result.error || 'Erreur lors de la sauvegarde de la carte');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la sauvegarde de la carte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte bancaire ?')) {
      return;
    }

    try {
      const result = await BankCardService.deleteBankCard(cardId);
      if (result.success) {
        setSuccess('Carte bancaire supprimée avec succès !');
        setEditingCard(null);
        setShowForm(false);
        // Réinitialiser le formulaire
        setSelectedWallet('');
        setCardHolderName('');
        setCardNumber('');
        setUsdtAddress('');
        setUsdtAmount('');
        await loadUserBankCards();
      } else {
        setError(result.error || 'Erreur lors de la suppression');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleEditCard = (card: any) => {
    setEditingCard(card);
    setCardHolderName(card.card_holder_name);
    setSelectedWallet(card.wallet_type);
    
    // Si c'est une adresse USDT, la mettre dans le champ USDT
    if (card.wallet_type.toLowerCase().includes('usdt')) {
      setUsdtAddress(card.card_number);
      setCardNumber('');
    } else {
      setCardNumber(card.card_number);
      setUsdtAddress('');
    }
    
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingCard(null);
    setSelectedWallet('');
    setCardHolderName('');
    setCardNumber('');
    setUsdtAddress('');
    setUsdtAmount('');
    setTransactionPassword('');
    setShowForm(true);
  };

  const selectedWalletData = availableWallets.find(w => w.id === selectedWallet);
  const isUsdtWallet = selectedWalletData?.name.toLowerCase().includes('usdt');

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
          <h1 className="text-xl font-bold flex-1 text-center">Bank Card Info</h1>
          <button 
            onClick={loadAvailableWallets}
            disabled={isLoadingWallets}
            className="p-2 hover:bg-blue-500 rounded-full transition-all duration-300"
          >
            <RefreshCw className={`w-5 h-5 ${isLoadingWallets ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        {/* Cartes Existantes */}
        {!isLoadingCards && userBankCards.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg animate-fadeInUp">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Ma Carte Bancaire
            </h3>
            <div className="space-y-3">
              {userBankCards.map((card, index) => (
                <div key={card.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-400">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{card.wallet_type.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-gray-600">{card.card_holder_name}</p>
                      <p className="text-sm text-gray-500 font-mono break-all">{card.card_number}</p>
                      {card.wallet_type.toLowerCase().includes('usdt') && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <p className="text-blue-600 font-medium">
                            Adresse USDT TRC-20 configurée
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCard(card)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton Ajouter/Modifier */}
        {!showForm && (
          <button
            onClick={handleAddNew}
            disabled={userBankCards.length > 0}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {userBankCards.length > 0 ? 'Une seule carte autorisée' : 'Ajouter une Carte Bancaire'}
          </button>
        )}

        {/* Formulaire */}
        {showForm && (
          <>
            {/* Wallet Selection */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                Portefeuille
                {isLoadingWallets && (
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin text-blue-600" />
                )}
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  disabled={isLoadingWallets}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-left flex items-center justify-between hover:bg-gray-100 transition-all duration-300 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <span className="text-gray-500">
                    {selectedWalletData?.name || 'Veuillez sélectionner un portefeuille'}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showWalletDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showWalletDropdown && !isLoadingWallets && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10 animate-slideDown max-h-60 overflow-y-auto">
                    {availableWallets.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Aucun portefeuille disponible pour votre pays
                      </div>
                    ) : (
                      availableWallets.map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={() => {
                            setSelectedWallet(wallet.id);
                            setShowWalletDropdown(false);
                            // Réinitialiser les champs selon le type
                            if (wallet.name.toLowerCase().includes('usdt')) {
                              setCardNumber('');
                            } else {
                              setUsdtAddress('');
                              setUsdtAmount('');
                            }
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{wallet.name}</span>
                            <span className="text-xs text-gray-500">
                              Min: {wallet.min_deposit.toLocaleString()} {wallet.name.includes('USDT') ? 'USDT' : 'FCFA'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {wallet.account_name}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              {selectedWalletData && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700">
                    <p><strong>Compte:</strong> {selectedWalletData.account_name}</p>
                    <p><strong>Numéro:</strong> {selectedWalletData.deposit_number}</p>
                    {selectedWalletData.deposit_fee > 0 && (
                      <p><strong>Frais:</strong> {selectedWalletData.deposit_fee}%</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Card Holder Name */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp delay-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Nom du Titulaire de la Carte
              </label>
              <input
                type="text"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                placeholder="Nom du titulaire du compte"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:bg-gray-100"
              />
            </div>

            {/* Card Number ou USDT Address */}
            {!isUsdtWallet ? (
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp delay-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Hash className="w-5 h-5 mr-2 text-blue-600" />
                  Numéro de Portefeuille
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Numéro de portefeuille mobile"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:bg-gray-100"
                />
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp delay-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
                  Adresse USDT TRC-20
                </label>
                <input
                  type="text"
                  value={usdtAddress}
                  onChange={(e) => setUsdtAddress(e.target.value)}
                  placeholder="Votre adresse USDT TRC-20"
                  className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-orange-700 font-mono text-sm"
                />
                <p className="text-xs text-orange-600 mt-2">
                  ⚠️ Assurez-vous que l'adresse est correcte (réseau TRC-20 uniquement)
                </p>
              </div>
            )}

            {/* USDT Conversion Tool */}
            {isUsdtWallet && (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 shadow-lg border-l-4 border-orange-400 animate-fadeInUp delay-300">
                <h4 className="font-bold text-orange-800 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Convertisseur USDT ⇄ FCFA
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant USDT
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={usdtAmount}
                      onChange={(e) => setUsdtAmount(e.target.value)}
                      placeholder="0.0000"
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                    />
                    {usdtAmount && (
                      <p className="text-xs text-orange-600 mt-1">
                        = {getUsdtToFcfaConversion()} FCFA
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Équivalent FCFA
                    </label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                      {usdtAmount ? getUsdtToFcfaConversion() : '0'} FCFA
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Taux: 1 USDT = {platformSettings.usdt_exchange_rate} FCFA
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Password */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp delay-400">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-blue-600" />
                Mot de Passe de Transaction
              </label>
              <input
                type="password"
                value={transactionPassword}
                onChange={(e) => setTransactionPassword(e.target.value)}
                placeholder="Entrez votre mot de passe de transaction"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-2">
                Entrez votre mot de passe de transaction pour sécuriser cette opération
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setError('');
                  setSuccess('');
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveBankCard}
                disabled={isLoading || isLoadingWallets}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enregistrement...</span>
                  </div>
                ) : (
                  editingCard ? 'Modifier la Carte' : 'Ajouter la Carte'
                )}
              </button>
            </div>
          </>
        )}

        {/* Explanation */}
        <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-400 animate-fadeInUp delay-600">
          <h3 className="text-blue-600 font-semibold mb-3">Explication</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>1. Vous pouvez ajouter <strong>une seule carte bancaire</strong> pour les retraits.</p>
            <p>2. Vous pouvez <strong>modifier ou supprimer</strong> votre carte à tout moment.</p>
            <p>3. Les portefeuilles disponibles sont <strong>gérés par l'administrateur</strong>.</p>
            <p>4. Pour USDT, utilisez uniquement des <strong>adresses TRC-20</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};