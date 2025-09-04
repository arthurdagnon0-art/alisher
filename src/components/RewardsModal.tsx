import React from 'react';
import { X, Gift } from 'lucide-react';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg p-6 w-full max-w-md animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
        
        <div className="text-center">
          {/* Gift Icon with Animation */}
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
              <Gift className="w-12 h-12 text-white" />
            </div>
            {/* Floating coins */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-300 rounded-full animate-pulse delay-300"></div>
          </div>
          
          <h3 className="font-bold text-gray-900 text-xl mb-4">
            Partagez vos messages de rétraits succès pour gagner des récompenses en fiat
          </h3>
          
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Envoyez le message reçu par l'Opérateur lors de votre rétrait reçu et gagner entre 100F et 200.000F
          </p>
          
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Okay!
          </button>
        </div>
      </div>
    </div>
  );
};