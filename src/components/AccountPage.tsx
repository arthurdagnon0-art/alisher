import React from 'react';
import { AnimatedCard } from './AnimatedCard';
import { GradientButton } from './GradientButton';
import { Settings, RotateCcw, CreditCard, CircleDollarSign, ListOrdered, Users, TrendingUp, Gem, BadgeAlert, Send, ChevronRight } from 'lucide-react';

interface AccountPageProps {
  user: any;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onBack: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ user, onLogout, onNavigate, onBack }) => {
  return (
    <div className="min-h-screen font-gothic-italic bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{user?.name || 'Utilisateur'}</h2>
            <p className="text-sm text-gray-500">{user?.phone ? `${user.phone.substring(0, 3)}****${user.phone.slice(-3)}` : 'Non défini'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <RotateCcw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* VIP Status */}
      <div className="px-2 xxs:px-3 xs:px-4 mt-4">
        <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white overflow-hidden" style = 
        {{backgroundImage:'url(https://i.postimg.cc/nL4XPTYy/vip-bg.png)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
         }}>
        
          {/* Animated background particles */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-2 left-4 w-2 h-2 bg-white bg-opacity-30 rounded-full animate-ping"></div>
            <div className="absolute top-8 right-8 w-3 h-3 bg-yellow-300 bg-opacity-50 rounded-full animate-pulse delay-500"></div>
            <div className="absolute bottom-4 left-8 w-1 h-1 bg-white bg-opacity-40 rounded-full animate-bounce delay-700"></div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs animate-pulse">VIP 0</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-heartbeat shadow-lg">
              <span className="text-yellow-900 font-gothic-italic text-lg">V0</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative cursor-pointer" onClick={() => onNavigate('vip')}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">NIVEAU VIP</span>
              <img src={'https://i.postimg.cc/5tf1SFb3/lv0.png'} width={60}/>
            </div>
            <div className="w-full bg-white bg-opacity-70 rounded-full h-2 mb-2 hover:bg-opacity-40 transition-all duration-300">
              <div className="bg-white h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <p className="text-sm opacity-90">Progression actuelle 0 / 2000.00</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-2 xxs:px-3 xs:px-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onNavigate('recharge')}
            className="bg-white rounded-lg p-3 xxs:p-4 shadow-sm flex items-center space-x-2 xxs:space-x-3 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-fadeInLeft"
          >
            <div className="w-6 h-6 xxs:w-7 xxs:h-7 xs:w-8 xs:h-8 bg-orange-100 rounded flex items-center justify-center">
              <span className="text-orange-600"><CreditCard /></span>
            </div>
            <span className="font-medium text-gray-800 text-sm xxs:text-base">Recharge</span>
            <ChevronRight className="w-3 h-3 xxs:w-4 xxs:h-4 text-gray-400 ml-auto" />
          </button>
          
          <button 
            onClick={() => onNavigate('withdraw')}
            className="bg-white rounded-lg p-3 xxs:p-4 shadow-sm flex items-center space-x-2 xxs:space-x-3 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-fadeInRight"
          >
            <div className="w-6 h-6 xxs:w-7 xxs:h-7 xs:w-8 xs:h-8 bg-blue-100 rounded flex items-center justify-center">
              <span className="text-blue-600"><CircleDollarSign/></span>
            </div>
            <span className="font-medium text-gray-800 text-sm xxs:text-base">Retrait</span>
            <ChevronRight className="w-3 h-3 xxs:w-4 xxs:h-4 text-gray-400 ml-auto" />
          </button>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="px-2 xxs:px-3 xs:px-4 mt-6">
        <div className="grid grid-cols-4 gap-2 xxs:gap-3 xs:gap-4 mb-6 animate-fadeInUp delay-300">
          <button 
            onClick={() => onNavigate('products')}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 xxs:w-11 xxs:h-11 xs:w-12 xs:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-1 xxs:mb-2 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
              <span className="text-blue-600 "><ListOrdered/></span>
            </div>
            <span className="text-[10px] xxs:text-xs text-gray-600 text-center group-hover:text-blue-600 transition-colors duration-300 leading-tight">Mes Produits</span>
          </button>
          
          <button 
            onClick={() => onNavigate('balance-details')}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 xxs:w-11 xxs:h-11 xs:w-12 xs:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-1 xxs:mb-2 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
              <span className="text-purple-600"><CircleDollarSign /></span>
            </div>
            <span className="text-[10px] xxs:text-xs text-gray-600 text-center group-hover:text-purple-600 transition-colors duration-300 leading-tight">Mon Solde</span>
          </button>
          
          <button 
            onClick={() => onNavigate('team')}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 xxs:w-11 xxs:h-11 xs:w-12 xs:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-1 xxs:mb-2 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
              <span className="text-green-600"><Users/></span>
            </div>
            <span className="text-[10px] xxs:text-xs text-gray-600 text-center group-hover:text-green-600 transition-colors duration-300 leading-tight">Mon Équipe</span>
          </button>
          
          <button 
            onClick={() => onNavigate('bankcard')}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 xxs:w-11 xxs:h-11 xs:w-12 xs:h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-1 xxs:mb-2 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
              <span className="text-yellow-600"><CreditCard /></span>
            </div>
            <span className="text-[10px] xxs:text-xs text-gray-600 text-center group-hover:text-yellow-600 transition-colors duration-300 leading-tight">Carte Bancaire</span>
          </button>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="px-2 xxs:px-3 xs:px-4">
        <AnimatedCard className="p-4 mb-4" hoverEffect="glow" delay={300}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Revenus
            </h3>
            <button 
              onClick={() => onNavigate('balance-details')}
              className="text-blue-600 text-sm flex items-center hover:text-blue-800 transition-colors"
            >
              Détails des Revenus &gt;
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center transform hover:scale-105 transition-all duration-300">
              <p className="text-sm text-gray-600 mb-1">Solde de Recharge</p>
              <p className="text-xl font-bold text-blue-600 animate-pulse">FCFA0.00</p>
            </div>
            <div className="text-center transform hover:scale-105 transition-all duration-300">
              <p className="text-sm text-gray-600 mb-1">Solde de Retrait</p>
              <p className="text-xl font-bold text-green-600 animate-pulse delay-200">FCFA0.00</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center transform hover:scale-105 transition-all duration-300">
              <p className="text-sm text-gray-600 mb-1">Revenu Produit</p>
              <p className="text-lg font-bold text-blue-600 animate-pulse delay-300">FCFA0.00</p>
            </div>
            <div className="text-center transform hover:scale-105 transition-all duration-300">
              <p className="text-sm text-gray-600 mb-1">Commission</p>
              <p className="text-lg font-bold text-purple-600 animate-pulse delay-400">FCFA0.00</p>
            </div>
            <div className="text-center transform hover:scale-105 transition-all duration-300">
              <p className="text-sm text-gray-600 mb-1">Nombre de Commandes</p>
              <p className="text-lg font-bold text-orange-600 animate-pulse delay-500">0</p>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Services Section */}
      <div className="px-2 xxs:px-3 xs:px-4">
        <h3 className="font-semibold text-gray-900 mb-4">Plus de services</h3>
        
        <div className="grid grid-cols-4 gap-2 xxs:gap-3 xs:gap-4 mb-6 animate-fadeInUp delay-400">
          <button 
            onClick={() => onNavigate('vip')}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 xxs:w-11 xxs:h-11 xs:w-12 xs:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-1 xxs:mb-2 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
              <span className="text-purple-600"><Gem/></span>
            </div>
            <span className="text-[10px] xxs:text-xs text-gray-600 text-center group-hover:text-purple-600 transition-colors duration-300 leading-tight">VIP</span>
          </button>
          
          <button 
            onClick={() => onNavigate('help')}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 xxs:w-11 xxs:h-11 xs:w-12 xs:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-1 xxs:mb-2 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
              <span className="text-blue-600"><BadgeAlert/></span>
            </div>
            <span className="text-[10px] xxs:text-xs text-gray-600 text-center group-hover:text-blue-600 transition-colors duration-300 leading-tight">Centre d'Aide</span>
          </button>
          
          <button 
            onClick={() => onNavigate('about')}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 xxs:w-11 xxs:h-11 xs:w-12 xs:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-1 xxs:mb-2 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
              <span className="text-green-600">📄</span>
            </div>
            <span className="text-[10px] xxs:text-xs text-gray-600 text-center group-hover:text-green-600 transition-colors duration-300 leading-tight">À Propos de Nous</span>
          </button>
          
          <button 
            onClick={() => onNavigate('telegram')}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 xxs:w-11 xxs:h-11 xs:w-12 xs:h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-1 xxs:mb-2 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
              <span className="text-cyan-600"><Send/></span>
            </div>
            <span className="text-[10px] xxs:text-xs text-gray-600 text-center group-hover:text-cyan-600 transition-colors duration-300 leading-tight">Telegram</span>
          </button>
        </div>

        <div className="flex justify-center mb-8 animate-fadeInUp delay-500">
          <button 
            onClick={() => onNavigate('settings')}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 xxs:w-11 xxs:h-11 xs:w-12 xs:h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-1 xxs:mb-2 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg">
              <span className="text-gray-600"><Settings/></span>
            </div>
            <span className="text-[10px] xxs:text-xs text-gray-600 text-center group-hover:text-gray-800 transition-colors duration-300 leading-tight">Paramètres</span>
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-2 xxs:px-3 xs:px-4 pb-6">
        <button
          onClick={onLogout}
          className="w-full bg-red-500 text-white py-3 xxs:py-4 rounded-lg font-medium hover:bg-red-600 transition-colors duration-300 transform hover:scale-105 animate-fadeInUp delay-600 text-sm xxs:text-base"
        >
          🔓 Déconnexion
        </button>
      </div>
    </div>
  );
};