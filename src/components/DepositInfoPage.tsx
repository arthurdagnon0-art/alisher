import React from 'react';
import { ArrowLeft, Copy, AlertCircle, CreditCard, User, Hash } from 'lucide-react';

interface DepositInfoPageProps {
  paymentMethod: any;
  amount: string;
  onBack: () => void;
  onContinue: () => void;
}

export const DepositInfoPage: React.FC<DepositInfoPageProps> = ({
  paymentMethod,
  amount,
  onBack,
  onContinue
}) => {
  const handleCopyNumber = () => {
    navigator.clipboard.writeText(paymentMethod.deposit_number);
    alert('Numéro copié !');
  };

  const handleCopyName = () => {
    navigator.clipboard.writeText(paymentMethod.account_name);
    alert('Nom du compte copié !');
  };

  const fees = (parseFloat(amount) * paymentMethod.deposit_fee) / 100;
  const totalAmount = parseFloat(amount) + fees;

  return (
    <div className="min-h-screen bg-gray-50 font-gothic-italic">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="mr-3 p-2 hover:bg-blue-500 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">Informations de Dépôt</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Méthode Sélectionnée */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{paymentMethod.name}</h2>
            <p className="text-gray-600">Effectuez votre paiement vers ce compte</p>
          </div>

          {/* Informations de Paiement */}
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Hash className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Numéro de Dépôt</p>
                    <p className="text-lg font-bold text-gray-900">{paymentMethod.deposit_number}</p>
                  </div>
                </div>
                <button
                  onClick={handleCopyNumber}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Copier
                </button>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Nom du Compte</p>
                    <p className="text-lg font-bold text-gray-900">{paymentMethod.account_name}</p>
                  </div>
                </div>
                <button
                  onClick={handleCopyName}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Copier
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Détails du Montant */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="font-bold text-gray-900 mb-4">Détails du Paiement</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Montant à Déposer</span>
              <span className="font-bold text-blue-600 text-lg">
                {parseFloat(amount).toLocaleString()} {paymentMethod.name.includes('USDT') ? 'USDT' : 'FCFA'}
              </span>
            </div>
            
            {fees > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Frais ({paymentMethod.deposit_fee}%)</span>
                <span className="font-medium text-orange-600">
                  {fees.toLocaleString()} {paymentMethod.name.includes('USDT') ? 'USDT' : 'FCFA'}
                </span>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">Total à Payer</span>
                <span className="font-bold text-green-600 text-xl">
                  {totalAmount.toLocaleString()} {paymentMethod.name.includes('USDT') ? 'USDT' : 'FCFA'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="text-orange-800 font-semibold mb-2">Instructions Importantes</h4>
              <div className="text-sm text-orange-700 space-y-2">
                <p>1. <strong>Effectuez le paiement</strong> vers le numéro et nom de compte ci-dessus</p>
                <p>2. <strong>Montant exact</strong> : Payez exactement {totalAmount.toLocaleString()} {paymentMethod.name.includes('USDT') ? 'USDT' : 'FCFA'}</p>
                <p>3. <strong>Conservez la preuve</strong> : Gardez votre reçu de transaction</p>
                <p>4. <strong>Soumettez rapidement</strong> : Soumettez votre demande dans les 30 minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'Action */}
        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            J'ai Effectué le Paiement
          </button>
          
          <button
            onClick={onBack}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};