import React, { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';

interface TelegramPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramPopup: React.FC<TelegramPopupProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`bg-white rounded-2xl w-full max-w-sm relative shadow-2xl transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        
        {/* Header avec icône Telegram */}
        <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-8 text-center">
          {/* Icône Telegram centrée */}
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <Send className="w-10 h-10 text-white transform rotate-45" />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="px-8 py-8 text-center">
          <h3 className="font-bold text-gray-900 text-2xl mb-6 leading-tight">
            Diffusion d'Informations<br />Officielles
          </h3>
          
          <p className="text-gray-600 leading-relaxed mb-8">
            Suivez notre canal officiel Telegram pour obtenir les dernières nouvelles et informations sur les avantages.
          </p>
          
          {/* Bouton d'action principal */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-5 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Suivre Maintenant
          </button>
        </div>

        {/* Bouton de fermeture centré en bas */}
        <button
          onClick={onClose}
          className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-600 bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};