import React from 'react';
import { ArrowLeft, Send, Users, Bell, MessageCircle } from 'lucide-react';

interface TelegramPageProps {
  onBack: () => void;
}

export const TelegramPage: React.FC<TelegramPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 to-blue-600 animate-slideInRight">
      {/* Header */}
      <div className="bg-cyan-500 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="mr-3 p-2 hover:bg-cyan-400 rounded-full transition-all duration-300 transform hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">Telegram</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Main Telegram Card */}
        <div className="bg-white rounded-xl p-6 shadow-xl animate-fadeInUp hover:shadow-2xl transition-all duration-300">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shadow-lg">
              <Send className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Diffusion d'Informations Officielles
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Suivez notre canal officiel Telegram pour obtenir les dernières nouvelles et informations sur les avantages.
            </p>
          </div>

          <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Suivre Maintenant
          </button>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-lg animate-fadeInLeft delay-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Notifications en temps réel</h3>
                <p className="text-sm text-gray-600">Recevez les dernières mises à jour instantanément</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg animate-fadeInRight delay-300 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center animate-pulse delay-300">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Communauté active</h3>
                <p className="text-sm text-gray-600">Rejoignez notre communauté d'investisseurs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg animate-fadeInLeft delay-400 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center animate-pulse delay-500">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Support 24/7</h3>
                <p className="text-sm text-gray-600">Assistance client disponible à tout moment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};