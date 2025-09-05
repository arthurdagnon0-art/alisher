import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, X, AlertCircle, CreditCard, DollarSign } from 'lucide-react';
import { platformSettings } from '../data/investments';
import { TransactionService } from '../services/transactionService';
import { BankCardService } from '../services/bankCardService';
import { AuthService } from '../services/authService';
import { supabase } from '../lib/supabase';

interface WithdrawPageProps {
  user: any;
  onBack: () => void;
}

export const WithdrawPage: React.FC<WithdrawPageProps> = ({ user, onBack }) => {
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [payType, setPayType] = useState('FCFA');
  const [showSystemAlert, setShowSystemAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userBankCards, setUserBankCards] = useState<any[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [hasTodayWithdrawal, setHasTodayWithdrawal] = useState(false);
  const [isCheckingWithdrawals, setIsCheckingWithdrawals] = useState(true);
  const [currentUser, setCurrentUser] = useState(user);

  React.useEffect(() => {
    loadUserBankCards();
    checkTodayWithdrawals();
    // Mettre à jour les données utilisateur depuis localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
      }
    }
  }, [user?.id]);

  const loadUserBankCards = async () => {
    if (!user?.id) return;
    
    setIsLoadingCards(true);
    try {
      const result = await BankCardService.getUserBankCards(user.id);
      if (result.success) {
        setUserBankCards(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cartes:', error);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const checkTodayWithdrawals = async () => {
    if (!user?.id) return;
    
    setIsCheckingWithdrawals(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: todayWithdrawals, error } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'withdrawal')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      if (!error && todayWithdrawals && todayWithdrawals.length > 0) {
        setHasTodayWithdrawal(true);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des retraits:', error);
    } finally {
      setIsCheckingWithdrawals(false);
    }
  };

  // Calculer le solde retirable réel
  const getWithdrawableBalance = (userData: any) => {
    // Le solde retirable = balance_withdrawal (commissions + bonus + revenus)
    return userData?.balance_withdrawal || 0;
  };

  const handleWithdraw = async () => {
    // Vérifier la limite quotidienne côté frontend
    if (hasTodayWithdrawal) {
      setError('Vous avez déjà effectué un retrait aujourd\'hui. Un seul retrait par jour est autorisé.');
      return;
    }

    if (!amount || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    // Vérifier si l'utilisateur a des cartes bancaires
    if (userBankCards.length === 0) {
      setShowSystemAlert(true);
      return;
    }

    // Vérifier le mot de passe de transaction
    const passwordResult = await AuthService.verifyTransactionPassword(user.id, password);
    if (!passwordResult.success || !passwordResult.isValid) {
      setError('Mot de passe de transaction incorrect');
      return;
    }

    let withdrawAmount = parseFloat(amount);
    let finalAmount = withdrawAmount; // Montant en FCFA pour la base de données
    let originalAmount = withdrawAmount; // Montant original saisi par l'utilisateur
    
    // Conversion USDT vers FCFA si nécessaire
    if (payType === 'USDT') {
      if (withdrawAmount < platformSettings.min_usdt_withdrawal) {
        setError(`Montant minimum USDT: ${platformSettings.min_usdt_withdrawal} USDT`);
        return;
      }
      // Convertir USDT en FCFA pour la vérification du solde
      finalAmount = withdrawAmount * platformSettings.usdt_exchange_rate;
      originalAmount = withdrawAmount; // Garder le montant USDT original
    } else {
      if (withdrawAmount < platformSettings.min_withdrawal) {
        setError(`Montant minimum: ${platformSettings.min_withdrawal.toLocaleString()} FCFA`);
        return;
      }
      originalAmount = withdrawAmount; // Montant FCFA
    }

    const fees = (finalAmount * platformSettings.withdrawal_fee_rate) / 100;
    const totalAmount = finalAmount + fees;

    const withdrawableBalance = getWithdrawableBalance(currentUser);
    
    console.log('💰 Vérification solde retrait:', {
      withdrawableBalance,
      finalAmount,
      fees,
      totalAmount,
      userBalanceWithdrawal: currentUser?.balance_withdrawal
    });

    if (totalAmount > withdrawableBalance) {
      setError(`Solde retirable insuffisant. Disponible: ${withdrawableBalance.toLocaleString()} FCFA, Requis: ${totalAmount.toLocaleString()} FCFA (frais inclus)`);
      return;
    }

    // Vérifier les heures de retrait
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour < platformSettings.withdrawal_hours.start || currentHour >= platformSettings.withdrawal_hours.end) {
      setError(`Retraits autorisés de ${platformSettings.withdrawal_hours.start}h à ${platformSettings.withdrawal_hours.end}h`);
      return;
    }

    processWithdrawal();
  };

  const processWithdrawal = async () => {
    setIsLoading(true);
    setError('');

    try {
      let withdrawAmount = parseFloat(amount);
      let finalAmount = withdrawAmount;
      
      // Conversion USDT vers FCFA
      if (payType === 'USDT') {
        finalAmount = withdrawAmount * platformSettings.usdt_exchange_rate;
      }

      const result = await TransactionService.createWithdrawal(
        user.id,
        finalAmount, // Montant en FCFA pour la base de données
        payType.toLowerCase(),
        password,
        payType === 'USDT' ? withdrawAmount : undefined // Montant original USDT si applicable
      );

      if (result.success) {
        alert(`Demande de retrait créée avec succès ! ${payType === 'USDT' ? `${withdrawAmount} USDT (${finalAmount.toLocaleString()} FCFA)` : `${finalAmount.toLocaleString()} FCFA`} sera traité dans les heures ouvrables.`);
        // Déclencher un rafraîchissement des données utilisateur
        window.dispatchEvent(new CustomEvent('refreshUserData'));
        
        // Mettre à jour immédiatement l'état local pour refléter la déduction
        // Attendre un peu puis rafraîchir les données depuis la base
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('refreshUserData'));
        }, 1000);
        
        // Marquer qu'un retrait a été effectué aujourd'hui
        setHasTodayWithdrawal(true);
        onBack();
      } else {
        setError(result.error || 'Erreur lors de la création du retrait');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la création du retrait');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkWallet = () => {
    setShowSystemAlert(false);
    // Rediriger vers la page de carte bancaire
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'bankcard' }));
    onBack();
  };

  const handleHistoryClick = () => {
    // Rediriger vers les détails du solde
    onBack();
    // Utiliser setTimeout pour s'assurer que la navigation se fait après le retour
    setTimeout(() => {
      window.location.hash = '#balance-details';
    }, 100);
  };

  // Calculer l'équivalent en temps réel
  const getConvertedAmount = () => {
    if (!amount) return '';
    const inputAmount = parseFloat(amount);
    if (payType === 'USDT') {
      return `≈ ${(inputAmount * platformSettings.usdt_exchange_rate).toLocaleString()} FCFA`;
    } else {
      return `≈ ${(inputAmount / platformSettings.usdt_exchange_rate).toFixed(4)} USDT`;
    }
  };

  const getMinAmount = () => {
    return payType === 'USDT' 
      ? `${platformSettings.min_usdt_withdrawal} USDT`
      : `${platformSettings.min_withdrawal.toLocaleString()} FCFA`;
  };

  const getAvailableBalance = () => {
    const balance = getWithdrawableBalance(currentUser);
    if (payType === 'USDT') {
      return `${(balance / platformSettings.usdt_exchange_rate).toFixed(4)} USDT (${balance.toLocaleString()} FCFA)`;
    }
    return `${balance.toLocaleString()} FCFA`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">withdraw</h1>
        </div>
        
        <div className="mt-4">
          <p className="text-sm opacity-90">Solde Disponible</p>
          <p className="text-2xl font-bold">FCFA{getWithdrawableBalance(currentUser).toLocaleString()}</p>
        </div>
      </div>

      <div className="p-2 xxs:p-3 xs:p-4 space-y-4 xxs:space-y-5 xs:space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Daily Limit Warning */}
        {hasTodayWithdrawal && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 border-l-4 border-orange-400">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="text-orange-800 font-semibold mb-1">Limite Quotidienne Atteinte</h4>
                <p className="text-sm text-orange-700">
                  Vous avez déjà effectué un retrait aujourd'hui. Revenez demain pour effectuer un nouveau retrait.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bank Card Info */}
        {userBankCards.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-400">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Carte Bancaire Enregistrée
            </h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900">{userBankCards[0].wallet_type.replace('_', ' ').toUpperCase()}</p>
              <p className="text-sm text-gray-600">{userBankCards[0].card_holder_name}</p>
              <p className="text-sm text-gray-500 font-mono">{userBankCards[0].card_number}</p>
            </div>
          </div>
        )}

        {/* Amount */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Montant</h3>
          <div className="space-y-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Minimum: ${getMinAmount()}`}
              className="w-full px-3 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-600 font-medium"
            />
            {amount && (
              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <p className="font-medium">Solde retirable: FCFA {getWithdrawableBalance(currentUser).toLocaleString()}</p>
                <p className="text-xs text-orange-600 mt-1">
                  Frais de retrait: {platformSettings.withdrawal_fee_rate}% = FCFA {amount ? Math.round((parseFloat(amount) * (payType === 'USDT' ? platformSettings.usdt_exchange_rate : 1) * platformSettings.withdrawal_fee_rate) / 100).toLocaleString() : '0'}
                </p>
                <p className="font-medium">Conversion: {getConvertedAmount()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Taux: 1 USDT = {platformSettings.usdt_exchange_rate} FCFA
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Password */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Mot de passe de transaction</h3>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full px-3 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex justify-end mt-2">
            <button 
              onClick={handleHistoryClick}
              className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Historique &gt;
            </button>
          </div>
        </div>

        {/* Pay Type */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Pay Type</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
              <input
                type="radio"
                name="payType"
                value="FCFA"
                checked={payType === 'FCFA'}
                onChange={(e) => setPayType(e.target.value)}
                className="w-5 h-5 text-green-600"
              />
              <div className="flex-1">
                <span className="text-gray-700 font-medium">FCFA</span>
                <p className="text-xs text-gray-500">Retrait en Francs CFA</p>
              </div>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
              <input
                type="radio"
                name="payType"
                value="USDT"
                checked={payType === 'USDT'}
                onChange={(e) => setPayType(e.target.value)}
                className="w-5 h-5 text-green-600"
              />
              <div className="flex-1">
                <span className="text-gray-700 font-medium">USDT (TRC-20)</span>
                <p className="text-xs text-gray-500">Retrait en crypto-monnaie</p>
              </div>
            </label>
          </div>
        </div>

        {/* Explanations */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-blue-600 font-semibold mb-4">Explications</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>1. <strong>Limite quotidienne :</strong> Un seul retrait par jour autorisé</p>
            <p>2. <strong>Horaires :</strong> Retraits de {platformSettings.withdrawal_hours.start}h à {platformSettings.withdrawal_hours.end}h (heure du Bénin)</p>
            <p>3. <strong>Montant FCFA :</strong> Minimum {platformSettings.min_withdrawal.toLocaleString()} FCFA</p>
            <p>4. <strong>Montant USDT :</strong> Minimum {platformSettings.min_usdt_withdrawal} USDT</p>
            <p>5. <strong>Frais :</strong> {platformSettings.withdrawal_fee_rate}% du montant retiré</p>
            <p>6. <strong>Conversion :</strong> 1 USDT = {platformSettings.usdt_exchange_rate} FCFA</p>
            <p>7. <strong>Important :</strong> Le montant sera débité immédiatement, remboursé si rejeté</p>
          </div>
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleHistoryClick}
              className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Historique &gt;
            </button>
          </div>
        </div>

        {/* Withdraw Button */}
        <button
          onClick={handleWithdraw}
          disabled={isLoading || isLoadingCards || isCheckingWithdrawals || hasTodayWithdrawal}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
        >
          {isLoading ? 'Traitement...' : 
           isCheckingWithdrawals ? 'Vérification...' :
           hasTodayWithdrawal ? 'Retrait déjà effectué aujourd\'hui' :
           `Demander un retrait ${payType}`}
        </button>
      </div>

      {/* System Alert Modal */}
      {showSystemAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm animate-slideUp">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-4">
                Avertissement du système
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Vous n'avez pas encore ajouté de carte bancaire. Veuillez d'abord ajouter vos informations de carte bancaire pour effectuer des retraits.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSystemAlert(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleLinkWallet}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium"
                >
                  Ajouter une Carte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};