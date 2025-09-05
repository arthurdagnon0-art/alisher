import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, AlertCircle, CheckCircle } from 'lucide-react';
import { PaymentService } from '../services/paymentService';

interface USDTPaymentPageProps {
  amount: string; // Montant en FCFA
  usdtAmount: string; // Montant converti en USDT
  paymentMethod: any;
  user: any;
  onBack: () => void;
  onComplete: () => void;
}

export const USDTPaymentPage: React.FC<USDTPaymentPageProps> = ({ 
  amount, 
  usdtAmount, 
  paymentMethod, 
  user, 
  onBack, 
  onComplete 
}) => {
  const [timeLeft, setTimeLeft] = useState(13 * 60); // 13 minutes en secondes
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userTxId, setUserTxId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')} : 00`;
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(paymentMethod.deposit_number);
    alert('Adresse USDT copiée !');
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(usdtAmount);
    alert('Montant USDT copié !');
  };

  const handleSubmitPayment = async () => {
    if (!userTxId.trim()) {
      setError('Veuillez entrer l\'ID de transaction');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await PaymentService.submitDeposit(
        user.id,
        paymentMethod.id,
        parseFloat(amount), // Montant en FCFA
        'USDT_WALLET', // Numéro utilisateur (pas applicable pour USDT)
        userTxId.trim()
      );

      if (result.success) {
        setShowSuccess(true);
        
        // Rediriger après 3 secondes
        setTimeout(() => {
          onComplete();
        }, 3000);
      } else {
        setError(result.error || 'Erreur lors de la soumission');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Paiement Soumis !</h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Votre paiement USDT a été soumis avec succès. L'administrateur va vérifier votre transaction.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-blue-700">
              <p><strong>Montant:</strong> {usdtAmount} USDT</p>
              <p><strong>Équivalent:</strong> {parseFloat(amount).toLocaleString()} FCFA</p>
              <p><strong>ID Transaction:</strong> {userTxId}</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            Redirection automatique vers le dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 relative">
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 p-2 hover:bg-green-500 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => setShowLanguageModal(true)}
            className="border border-white px-3 py-1 rounded text-sm hover:bg-green-500 transition-colors"
          >
            EN FRANÇAIS ⇄
          </button>
        </div>
        
        <h1 className="text-xl font-bold text-center mt-8">Scan to pay (USDT_TRC20)</h1>
      </div>

      <div className="p-6 text-center">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Amount */}
        <div className="mb-6">
          <div className="text-4xl font-bold text-green-600 mb-2 flex items-center justify-center space-x-2">
            <span>{usdtAmount}</span>
            <span className="text-lg">USDT_TRC20</span>
            <button 
              onClick={handleCopyAmount}
              className="text-blue-600 text-sm ml-2 hover:text-blue-800 transition-colors"
            >
              copy
            </button>
          </div>
          <p className="text-gray-600 text-sm">
            Équivalent: {parseFloat(amount).toLocaleString()} FCFA
          </p>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Remaining payment time</p>
          <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-red-600'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <p className="text-orange-500 mb-8">Please pay the order amount in time</p>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center relative shadow-lg">
            {/* QR Code Pattern */}
            <div className="w-56 h-56 bg-black relative">
              {/* QR Code squares pattern */}
              <div className="absolute inset-0 grid grid-cols-8 gap-1 p-2">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${
                      Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                    } rounded-sm`}
                  />
                ))}
              </div>
              {/* Center logo */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">B$</span>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2 break-all font-mono">
            {paymentMethod.deposit_number}
          </p>
          <button 
            onClick={handleCopyAddress}
            className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
          >
            copy
          </button>
        </div>

        {/* Transaction ID Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
            ID de Transaction (après paiement)
          </label>
          <input
            type="text"
            value={userTxId}
            onChange={(e) => setUserTxId(e.target.value)}
            placeholder="Entrez l'ID de votre transaction USDT"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <p className="text-xs text-gray-500 mt-1 text-left">
            Entrez l'ID de transaction fourni par votre wallet après le paiement
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitPayment}
          disabled={isSubmitting || !userTxId.trim()}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-6"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Soumission...</span>
            </div>
          ) : (
            'Confirmer le Paiement'
          )}
        </button>

        {/* Warning */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 text-left">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-700 font-medium">Kind tips</span>
          </div>
          <div className="text-sm text-red-700 space-y-2">
            <p>1. Use all wallets that support TRC-20 for payment</p>
            <p>2. Send exactly <strong>{usdtAmount} USDT</strong> to the address above</p>
            <p>3. Confirm that the payment is successful and wait patiently for 1 to 3 minutes</p>
            <p>4. Enter your transaction ID and submit for verification</p>
            <p>5. If not received within 5 minutes, contact customer service</p>
          </div>
        </div>

        {/* Conversion Info */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-left">
          <div className="text-sm text-blue-700">
            <p><strong>Conversion Rate:</strong> 1 USDT = 600 FCFA</p>
            <p><strong>Amount to Pay:</strong> {usdtAmount} USDT</p>
            <p><strong>Equivalent:</strong> {parseFloat(amount).toLocaleString()} FCFA</p>
          </div>
        </div>
      </div>

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <h3 className="font-bold text-gray-900">Select Language</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded">
                EN FRANÇAIS ⇄
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded">
                ENGLISH ⇄
              </button>
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="w-full mt-4 bg-gray-200 text-gray-800 py-2 rounded"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};