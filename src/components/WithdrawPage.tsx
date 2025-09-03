import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, X } from 'lucide-react';
import { platformSettings } from '../data/investments';
import { TransactionService } from '../services/transactionService';

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
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWithdraw = () => {
    if (!amount || !password || !beneficiaryName) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount < platformSettings.min_withdrawal) {
      setError(`Montant minimum: ${platformSettings.min_withdrawal.toLocaleString()} FCFA`);
      return;
    }

    const fees = (withdrawAmount * platformSettings.withdrawal_fee_rate) / 100;
    const totalAmount = withdrawAmount + fees;

    if (totalAmount > user.balance_withdrawal) {
      setError('Solde insuffisant (frais inclus)');
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
      const result = await TransactionService.createWithdrawal(
        user.id,
        parseFloat(amount),
        payType.toLowerCase(),
        password
      );

      if (result.success) {
        alert('Demande de retrait créée avec succès ! Elle sera traitée dans les heures ouvrables.');
        onBack();
      } else {
        if (result.error?.includes('portefeuille')) {
          setShowSystemAlert(true);
        } else {
          setError(result.error || 'Erreur lors de la création du retrait');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la création du retrait');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkWallet = () => {
    setShowSystemAlert(false);
    // Rediriger vers la page de liaison de portefeuille
    onBack(); // Pour l'instant, retourner en arrière
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
          <p className="text-sm opacity-90">Solde</p>
          <p className="text-2xl font-bold">FCFA{user?.balance_withdrawal?.toLocaleString() || '0'}</p>
        </div>
      </div>

      <div className="p-2 xxs:p-3 xs:p-4 space-y-4 xxs:space-y-5 xs:space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Beneficiary Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💳</span>
            </div>
            <div className="flex-1">
              <p className="text-sm opacity-90">Nom du titulaire</p>
              <input
                type="text"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                placeholder="Entrez le nom du bénéficiaire"
                className="bg-transparent border-b border-white border-opacity-50 text-white placeholder-white placeholder-opacity-70 py-1 w-full focus:outline-none focus:border-opacity-100"
              />
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Montant</h3>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-600 font-medium"
          />
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
            <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm">
              Historique &gt;
            </button>
          </div>
        </div>

        {/* Pay Type */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Pay Type</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payType"
                value="FCFA"
                checked={payType === 'FCFA'}
                onChange={(e) => setPayType(e.target.value)}
                className="w-5 h-5 text-green-600"
              />
              <span className="text-gray-700 font-medium">FCFA</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payType"
                value="USDT"
                checked={payType === 'USDT'}
                onChange={(e) => setPayType(e.target.value)}
                className="w-5 h-5 text-green-600"
              />
              <span className="text-gray-700 font-medium">USDT</span>
            </label>
          </div>
        </div>

        {/* Explanations */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-blue-600 font-semibold mb-4">Explications</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>1. <strong>Horaires :</strong> Retraits de {platformSettings.withdrawal_hours.start}h à {platformSettings.withdrawal_hours.end}h (heure du Bénin)</p>
            <p>2. <strong>Montant :</strong> Minimum FCFA {platformSettings.min_withdrawal.toLocaleString()}</p>
            <p>3. Pour faciliter le règlement financier, vous ne pouvez demander un retrait que 1 fois par jour</p>
            <p>4. <strong>Frais :</strong> {platformSettings.withdrawal_fee_rate}% du montant retiré</p>
            <p>5. <strong>USDT :</strong> Minimum {platformSettings.min_usdt_withdrawal} USDT (1 USDT = {platformSettings.usdt_exchange_rate} FCFA)</p>
          </div>
          <div className="flex justify-end mt-4">
            <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm">
              Historique &gt;
            </button>
          </div>
        </div>

        {/* Withdraw Button */}
        <button
          onClick={handleWithdraw}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
        >
          {isLoading ? 'Traitement...' : 'Demander un retrait'}
        </button>
      </div>

      {/* System Alert Modal */}
      {showSystemAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm animate-slideUp">
            <button
              onClick={() => setShowSystemAlert(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-lg mb-4">
                Avertissement du système
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Vous n'avez pas encore lié votre numéro de portefeuille mobile, veuillez lier votre numéro de portefeuille mobile d'abord
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
                  Lier le portefeuille
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};