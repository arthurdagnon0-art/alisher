import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Info } from 'lucide-react';
import { PaymentService } from '../services/paymentService';
import { DepositInfoPage } from './DepositInfoPage';
import { DepositSubmissionPage } from './DepositSubmissionPage';

interface RechargePageProps {
  user: any | null;
  onBack: () => void;
}

export const RechargePage: React.FC<RechargePageProps> = ({ user, onBack }) => {
  const [amount, setAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<'select' | 'info' | 'submit'>('select');
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const result = await PaymentService.getActivePaymentMethods(user?.country);
      if (result.success) {
        setPaymentMethods(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement des méthodes de paiement');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors du chargement des méthodes de paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!amount || !selectedMethodId) {
      setError('Veuillez sélectionner un montant et une méthode de paiement');
      return;
    }

    const method = paymentMethods.find(m => m.id === selectedMethodId);
    if (!method) {
      setError('Méthode de paiement non trouvée');
      return;
    }

    if (parseFloat(amount) < method.min_deposit) {
      setError(`Montant minimum: ${method.min_deposit.toLocaleString()} ${method.name.includes('USDT') ? 'USDT' : 'FCFA'}`);
      return;
    }

    // Afficher le modal de chargement
    setShowLoadingModal(true);
    
    // Simuler un délai de chargement puis continuer
    setTimeout(() => {
      setShowLoadingModal(false);
      setSelectedMethod(method);
      setCurrentStep('info');
    }, 2000); // 2 secondes de chargement
  };

  const handleProceedToSubmission = () => {
    setCurrentStep('submit');
  };

  const handleSubmissionComplete = () => {
    // Retourner au dashboard après soumission
    onBack();
  };

  // Étape 2: Informations de dépôt
  if (currentStep === 'info') {
    return (
      <DepositInfoPage
        paymentMethod={selectedMethod}
        amount={amount}
        onBack={() => setCurrentStep('select')}
        onContinue={handleProceedToSubmission}
      />
    );
  }

  // Étape 3: Soumission du formulaire
  if (currentStep === 'submit') {
    return (
      <DepositSubmissionPage
        user={user}
        paymentMethod={selectedMethod}
        amount={amount}
        onBack={() => setCurrentStep('info')}
        onComplete={handleSubmissionComplete}
      />
    );
  }

  // Étape 1: Sélection montant et méthode
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">Recharger</h1>
        </div>
        
        <div className="mt-4">
          <p className="text-sm opacity-90">Solde Actuel</p>
          <p className="text-2xl font-bold">FCFA{user?.balance_deposit?.toLocaleString() || '0'}</p>
        </div>
      </div>

      <div className="p-2 xxs:p-3 xs:p-4 space-y-4 xxs:space-y-5 xs:space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Montant */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
            Montant du Rechargement
          </h3>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Entrez le montant"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
          />
          
          {/* Montants rapides */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Montants rapides</h4>
            <div className="grid grid-cols-4 gap-3">
              {[1000, 2000, 3000, 5000].map((suggestedAmount) => (
                <button
                  key={suggestedAmount}
                  onClick={() => setAmount(suggestedAmount.toString())}
                  className={`py-3 px-2 rounded-full border-2 text-sm font-medium transition-all duration-300 ${
                    amount === suggestedAmount.toString()
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {suggestedAmount.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3 mt-3">
              {[10000, 20000, 30000, 50000].map((suggestedAmount) => (
                <button
                  key={suggestedAmount}
                  onClick={() => setAmount(suggestedAmount.toString())}
                  className={`py-3 px-2 rounded-full border-2 text-sm font-medium transition-all duration-300 ${
                    amount === suggestedAmount.toString()
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {suggestedAmount.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3 mt-3">
              {[100000, 300000, 500000, 1000000].map((suggestedAmount) => (
                <button
                  key={suggestedAmount}
                  onClick={() => setAmount(suggestedAmount.toString())}
                  className={`py-3 px-2 rounded-full border-2 text-sm font-medium transition-all duration-300 ${
                    amount === suggestedAmount.toString()
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {suggestedAmount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Méthodes de Paiement */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Méthodes de Paiement Disponibles</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label 
                  key={method.id} 
                  className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethodId === method.id}
                    onChange={(e) => setSelectedMethodId(e.target.value)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{method.name}</span>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Min: {method.min_deposit.toLocaleString()} {method.name.includes('USDT') ? 'USDT' : 'FCFA'}
                        </div>
                        {method.deposit_fee > 0 && (
                          <div className="text-xs text-orange-600">
                            Frais: {method.deposit_fee}%
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Compte: {method.account_name}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Information */}
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-blue-800 font-semibold mb-2">Processus de Dépôt</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>1. Sélectionnez le montant et la méthode de paiement</p>
                <p>2. Consultez les informations de dépôt</p>
                <p>3. Effectuez le paiement vers le compte indiqué</p>
                <p>4. Soumettez votre preuve de paiement</p>
                <p>5. Attendez l'approbation de l'administrateur</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton Continuer */}
        <button
          onClick={handleContinue}
          disabled={!amount || !selectedMethodId || isLoading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Continuer
        </button>
      </div>

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 mx-4 max-w-sm w-full text-center animate-slideUp">
            {/* Loading Animation */}
            <div className="relative mb-6">
              <div className="w-16 h-16 mx-auto">
                {/* Outer spinning ring */}
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                
                {/* Inner dots */}
                <div className="absolute inset-4 flex items-center justify-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">Redirection en cours</h3>
            <p className="text-gray-600 text-sm">
              Préparation de votre demande de dépôt...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};