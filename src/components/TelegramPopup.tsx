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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`bg-white rounded-2xl w-full max-w-xs sm:max-w-sm md:max-w-md relative shadow-2xl transform transition-all duration-300 mx-4 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        
        {/* Header avec icône Telegram */}
        <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-6 sm:p-8 text-center">
          {/* Icône Telegram centrée */}
          <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <Send className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white transform rotate-45" />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="px-6 sm:px-8 py-6 sm:py-8 text-center">
          <h3 className="font-bold text-gray-900 text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 leading-tight">
            Diffusion d'Informations<br />Officielles
          </h3>
          
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 px-2">
            Suivez notre canal officiel Telegram pour obtenir les dernières nouvelles et informations sur les avantages.
          </p>
          
          {/* Bouton d'action principal */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 sm:py-5 rounded-xl font-semibold text-base sm:text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-4 sm:mb-6"
          >
            Suivre Maintenant
          </button>
        </div>

        {/* Bouton de fermeture centré en bas */}
        <button
          onClick={onClose}
          className="absolute -bottom-12 sm:-bottom-14 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
      </div>
    </div>
  );
};