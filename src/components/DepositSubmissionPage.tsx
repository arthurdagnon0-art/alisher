import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle, Hash, User, AlertCircle, CreditCard } from 'lucide-react';
import { PaymentService } from '../services/paymentService';

interface DepositSubmissionPageProps {
  user: any;
  paymentMethod: any;
  amount: string;
  onBack: () => void;
  onComplete: () => void;
}

export const DepositSubmissionPage: React.FC<DepositSubmissionPageProps> = ({
  user,
  paymentMethod,
  amount,
  onBack,
  onComplete
}) => {
  const [userDepositNumber, setUserDepositNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!userDepositNumber.trim() || !transactionId.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!user?.id) {
      setError('Erreur utilisateur. Veuillez vous reconnecter.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await PaymentService.submitDeposit(
        user.id,
        paymentMethod.id,
        parseFloat(amount),
        userDepositNumber.trim(),
        transactionId.trim()
      );

      if (result.success) {
        setShowSuccess(true);
        
        // Mettre à jour les données utilisateur dans localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            // Déclencher un rafraîchissement immédiat des données
            window.dispatchEvent(new CustomEvent('refreshUserData'));
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (error) {
            console.error('Erreur mise à jour localStorage:', error);
          }
        }
        
        // Rediriger vers le dashboard après 3 secondes
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-gothic-italic">
        <div className="bg-white rounded-xl p-8 shadow-xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Demande Soumise !</h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Votre demande de dépôt a été soumise avec succès. 
            L'administrateur va vérifier votre paiement et approuver votre dépôt.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-blue-700">
              <p><strong>Montant:</strong> {parseFloat(amount).toLocaleString()} {paymentMethod.name.includes('USDT') ? 'USDT' : 'FCFA'}</p>
              <p><strong>Méthode:</strong> {paymentMethod.name}</p>
              <p><strong>Statut:</strong> En attente d'approbation</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            Redirection automatique vers le dashboard...
          </p>
          
          <button
            onClick={onComplete}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Retourner au Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-gothic-italic">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="mr-3 p-2 hover:bg-green-500 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">Soumettre le Dépôt</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Récapitulatif */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="font-bold text-gray-900 mb-4">Récapitulatif du Dépôt</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Méthode de Paiement</span>
              <span className="font-medium text-gray-900">{paymentMethod.name}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Montant</span>
              <span className="font-bold text-blue-600 text-lg">
                {parseFloat(amount).toLocaleString()} {paymentMethod.name.includes('USDT') ? 'USDT' : 'FCFA'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Compte Destinataire</span>
              <span className="font-medium text-gray-900">{paymentMethod.account_name}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Numéro de Dépôt</span>
              <span className="font-mono text-gray-900">{paymentMethod.deposit_number}</span>
            </div>
          </div>
        </div>

        {/* Formulaire de Soumission */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <Send className="w-5 h-5 mr-2 text-green-600" />
            Confirmer Votre Paiement
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                Votre Numéro de Dépôt
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={userDepositNumber}
                onChange={(e) => setUserDepositNumber(e.target.value)}
                placeholder="Entrez le numéro depuis lequel vous avez payé"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
              />
              <p className="text-xs text-gray-500 mt-2">
                Ce numéro sera utilisé pour vérifier votre paiement
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Hash className="w-4 h-4 mr-2 text-green-600" />
                ID de Transaction
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Entrez l'ID de transaction de votre paiement"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
              />
              <p className="text-xs text-gray-500 mt-2">
                L'ID de transaction fourni par votre opérateur mobile
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Votre Nom</p>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Avertissement */}
        <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-yellow-800 font-semibold mb-2">Vérification Importante</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• Assurez-vous d'avoir payé le montant exact</p>
                <p>• Vérifiez que le numéro de dépôt est correct</p>
                <p>• Votre demande sera vérifiée par l'administrateur</p>
                <p>• Le crédit sera effectué après approbation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de Soumission */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !userDepositNumber.trim() || !transactionId.trim()}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Soumission en cours...</span>
            </div>
          ) : (
            'Soumettre ma Demande de Dépôt'
          )}
        </button>
      </div>
    </div>
  );
};