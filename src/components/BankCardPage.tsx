import React, { useState } from 'react';
import { ArrowLeft, CreditCard, User, Hash, DollarSign, Lock, ChevronDown } from 'lucide-react';
import { BankCardService } from '../services/bankCardService';
import { AuthService } from '../services/authService';

interface BankCardPageProps {
  user?: any;
  onBack: () => void;
}

export const BankCardPage: React.FC<BankCardPageProps> = ({ user, onBack }) => {
  const [selectedWallet, setSelectedWallet] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [usdtAddress, setUsdtAddress] = useState('');
  const [transactionPassword, setTransactionPassword] = useState('');
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userBankCards, setUserBankCards] = useState<any[]>([]);

  // Charger les cartes existantes
  React.useEffect(() => {
    loadUserBankCards();
  }, [user?.id]);

  const loadUserBankCards = async () => {
    if (!user?.id) return;
    
    try {
      const result = await BankCardService.getUserBankCards(user.id);
      if (result.success) {
        setUserBankCards(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cartes:', error);
    }
  };

  const walletOptions = [
    'Orange Money',
    'MTN Mobile Money',
    'Moov Money',
    'Wave',
    'Celtis'
  ];

  const handleSaveBankCard = async () => {
    if (!selectedWallet || !cardHolderName || !cardNumber || !transactionPassword) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
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
      const result = await BankCardService.createBankCard(
        user.id,
        selectedWallet.toLowerCase().replace(/\s+/g, '_'),
        cardHolderName,
        cardNumber
      );

      if (result.success) {
        setSuccess('Carte bancaire ajoutée avec succès !');
        // Réinitialiser le formulaire
        setSelectedWallet('');
        setCardHolderName('');
        setCardNumber('');
        setTransactionPassword('');
        // Recharger les cartes
        await loadUserBankCards();
        
        // Retourner à la page précédente après 2 secondes
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        setError(result.error || 'Erreur lors de l\'ajout de la carte');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'ajout de la carte');
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-xl font-bold flex-1 text-center">Bank Card Info</h1>
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
        {userBankCards.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg animate-fadeInUp">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Mes Cartes Bancaires
            </h3>
            <div className="space-y-3">
              {userBankCards.map((card, index) => (
                <div key={card.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{card.wallet_type.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-gray-600">{card.card_holder_name}</p>
                      <p className="text-sm text-gray-500 font-mono">{card.card_number}</p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                      Actif
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wallet Selection */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
            Portefeuille
          </label>
          <div className="relative">
            <button
              onClick={() => setShowWalletDropdown(!showWalletDropdown)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-left flex items-center justify-between hover:bg-gray-100 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            >
              <span className="text-gray-500">
                {selectedWallet || 'Veuillez sélectionner un portefeuille'}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showWalletDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showWalletDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10 animate-slideDown">
                {walletOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedWallet(option);
                      setShowWalletDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
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

        {/* Card Number */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp delay-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Hash className="w-5 h-5 mr-2 text-blue-600" />
            Numéro de Carte
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="Numéro de portefeuille mobile"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:bg-gray-100"
          />
        </div>

        {/* USDT TRC-20 */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp delay-300">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
            USDT TRC-20
          </label>
          <input
            type="text"
            value={usdtAddress}
            onChange={(e) => setUsdtAddress(e.target.value)}
            placeholder="Adresse USDT TRC-20 (optionnel)"
            className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-blue-600 font-medium"
          />
        </div>

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
            Entrez votre mot de passe de transaction pour sécuriser l'ajout de cette carte
          </p>
        </div>

        {/* Add Mobile Wallet Button */}
        <button 
          onClick={handleSaveBankCard}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl animate-fadeInUp delay-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Enregistrement...</span>
            </div>
          ) : (
            'Ajouter un portefeuille mobile'
          )}
        </button>

        {/* Explanation */}
        <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-400 animate-fadeInUp delay-600">
          <h3 className="text-blue-600 font-semibold mb-3">Explication</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>1. Vous pouvez uniquement ajouter un portefeuille de transfert mobile pour les retraits.</p>
            <p>2. Veuillez vous assurer que le numéro de portefeuille de transfert mobile est correct et fonctionnel.</p>
          </div>
        </div>
      </div>
    </div>
  );
};