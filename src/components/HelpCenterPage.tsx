import React from 'react';
import { ArrowLeft, MessageCircle, Clock, Send, Bot, Phone } from 'lucide-react';

interface HelpCenterPageProps {
  onBack: () => void;
}

export const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 animate-slideInRight">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="mr-3 p-2 hover:bg-blue-500 rounded-full transition-all duration-300 transform hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">Centre d'aide</h1>
        </div>
      </div>

      {/* Service Header */}
      <div className="bg-blue-600 text-white px-4 pb-8">
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Bot className="w-8 h-8 mr-3 animate-bounce" />
            Centre de service
          </h2>
          <p className="text-sm opacity-90 leading-relaxed">
            Nous vous accompagnons tout au long du chemin lorsque vous en avez besoin
          </p>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10 space-y-6">
        {/* Deposit Issue Card */}
        <div className="bg-white rounded-xl p-6 shadow-xl animate-fadeInUp delay-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Votre dépôt n'a pas encore été reçu ?</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Après avoir réussi à charger votre compte, si le solde n'a pas été crédité sur votre compte, veuillez fournir les informations ici et notre personnel de service client vous aidera à les traiter !
              </p>
            </div>
          </div>
        </div>

        {/* Online Service Card */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-6 text-white shadow-xl animate-fadeInUp delay-200 hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-bounce">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2">Service en ligne</h3>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <p className="text-sm opacity-90">Heures de travail : 08:00:00 - 18:00:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-xl animate-fadeInUp delay-300 hover:scale-105 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-pulse">
              <Send className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2">Telegram</h3>
              <p className="text-sm opacity-90 leading-relaxed">
                Suivez notre canal officiel Telegram pour obtenir les dernières nouvelles d'événements et recevoir des avantages de la boîte au trésor
              </p>
            </div>
          </div>
        </div>

        {/* Charles Schwab Branding */}
        <div className="flex justify-end animate-fadeInUp delay-500">
          <div className="w-16 h-16 bg-cyan-400 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-12">
            <span className="text-white font-bold text-[8px] leading-tight text-center font-gothic">Alisher<br/>USMANOV</span>
          </div>
        </div>
      </div>
    </div>
  );
};