import React, { useState } from 'react';
import { ArrowLeft, Camera, User, Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';

interface SettingsPageProps {
  user: any;
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onBack }) => {
  const [nickname, setNickname] = useState(user?.name || '');
  const [email, setEmail] = useState('');
  const [showTransactionPassword, setShowTransactionPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveInfo = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-slideInRight">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="mr-3 p-2 hover:bg-blue-500 rounded-full transition-all duration-300 transform hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">Setting Info</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Photo Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-cyan-400 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white font-bold text-xs leading-tight text-center font-gothic">Alisher<br/>USMANOV</span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Cliquez pour changer la photo</h3>
              <p className="text-sm text-gray-500">
                Il est recommandé de télécharger des images en 1:1 de plus de 100px
              </p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp delay-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                Pseudonyme
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:bg-gray-100"
              />
            </div>

            <button
              onClick={handleSaveInfo}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enregistrement...</span>
                </div>
              ) : (
                'Enregistrer les informations'
              )}
            </button>
          </div>
        </div>

        {/* Password Settings */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp delay-200">
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Mot de passe de transaction</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowTransactionPassword(!showTransactionPassword)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {showTransactionPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
                <span className="text-gray-400">&gt;</span>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Mot de passe de transaction</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
                <span className="text-gray-400">&gt;</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};