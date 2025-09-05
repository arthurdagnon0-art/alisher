import React, { useState } from 'react';
import { ArrowLeft, CreditCard, User, Hash, DollarSign, Lock, ChevronDown, Edit, Trash2 } from 'lucide-react';
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
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  // Charger les cartes existantes
  React.useEffect(() => {
    loadUserBankCards();
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
          setSelectedWallet(card.wallet_type.replace('_', ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
          setEditingCard(card);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cartes:', error);
    } finally {
      setIsLoadingCards(false);
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
      let result;
      
      if (editingCard) {
        // Modifier la carte existante
        result = await BankCardService.updateBankCard(editingCard.id, {
          card_holder_name: cardHolderName,
          card_number: cardNumber
        });
      } else {
        // Créer une nouvelle carte
        result = await BankCardService.createBankCard(
          user.id,
          selectedWallet.toLowerCase().replace(/\s+/g, '_'),
          cardHolderName,
          cardNumber
        );
      }

      if (result.success) {
        setSuccess(editingCard ? 'Carte bancaire modifiée avec succès !' : 'Carte bancaire ajoutée avec succès !');
        // Réinitialiser le formulaire
        if (!editingCard) {
          setSelectedWallet('');
          setCardHolderName('');
          setCardNumber('');
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
    setCardNumber(card.card_number);
    setSelectedWallet(card.wallet_type.replace('_', ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingCard(null);
    setSelectedWallet('');
    setCardHolderName('');
    setCardNumber('');
    setTransactionPassword('');
    setShowForm(true);
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
                      <p className="text-sm text-gray-500 font-mono">{card.card_number}</p>
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
                disabled={isLoading}
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
            <p>3. Veuillez vous assurer que le numéro de portefeuille est <strong>correct et fonctionnel</strong>.</p>
            <p>4. Cette carte sera visible par l'administrateur lors de la validation de vos retraits.</p>
          </div>
        </div>
      </div>
    </div>
  );
};