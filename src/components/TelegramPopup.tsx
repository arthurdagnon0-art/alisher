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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 xxs:p-3 xs:p-4"
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
        <div className="relative bg-blue-500 rounded-t-2xl p-4 xxs:p-6 xs:p-8 text-center">
          {/* Icône Telegram centrée */}
          <div className="w-12 h-12 xxs:w-14 xxs:h-14 xs:w-16 xs:h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Send className="w-6 h-6 xxs:w-7 xxs:h-7 xs:w-8 xs:h-8 text-white transform rotate-45" />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="px-4 xxs:px-5 xs:px-6 py-4 xxs:py-5 xs:py-6 text-center">
          <h3 className="font-bold text-gray-900 text-base xxs:text-lg mb-3 xxs:mb-4 leading-tight">
            Diffusion d'Informations<br />Officielles
          </h3>
          
          <p className="text-gray-600 text-xs xxs:text-sm leading-relaxed mb-4 xxs:mb-5 xs:mb-6">
            Suivez notre canal officiel Telegram pour obtenir les dernières nouvelles et informations sur les avantages.
          </p>
          
          {/* Bouton d'action principal */}
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-2 xxs:py-3 rounded-xl font-medium text-sm xxs:text-base hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 mb-3 xxs:mb-4"
          >
            Suivre Maintenant
          </button>
        </div>

        {/* Bouton de fermeture en bas à droite, en dehors du popup */}
        <button
          onClick={onClose}
          className="absolute -bottom-10 xxs:-bottom-12 left-1/2 transform -translate-x-1/2 w-8 h-8 xxs:w-10 xxs:h-10 bg-gray-600 bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200"
        >
          <X className="w-4 h-4 xxs:w-5 xxs:h-5 text-white" />
        </button>
      </div>
    </div>
  );
};