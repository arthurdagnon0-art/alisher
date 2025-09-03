import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PhoneInput } from './PhoneInput';
import { supportedCountries } from '../data/investments';

interface LoginFormProps {
  onLogin: (phone: string, password: string) => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('BJ');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    if (!phone || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onLogin(phone, password);
    } catch (error: any) {
      setError(error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-4 xxs:py-6 xs:py-8 sm:py-12 px-2 xxs:px-4 sm:px-6 lg:px-8 font-gothic-italic">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-2 xxs:px-0">
        <h2 className="text-center text-xl xxs:text-2xl font-bold text-gray-900 mb-1 xxs:mb-2">
          Bienvenue sur Hope's Invest
        </h2>
        <p className="text-center text-sm xxs:text-base text-gray-600 mb-4 xxs:mb-6 xs:mb-8">
          Connectez-vous à votre compte
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-2 xxs:px-0">
        <div className="bg-white py-4 xxs:py-6 xs:py-8 px-3 xxs:px-4 xs:px-6 sm:px-8 lg:px-10 shadow rounded-lg">
          <div className="space-y-4 xxs:space-y-5 xs:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 xxs:p-4">
                <p className="text-red-600 text-xs xxs:text-sm">{error}</p>
              </div>
            )}

            <PhoneInput
              value={phone}
              onChange={setPhone}
              selectedCountry={selectedCountry}
              onCountryChange={setSelectedCountry}
              placeholder="288639"
            />

            <div>
              <label className="block text-xs xxs:text-sm font-medium text-gray-700 mb-2">
                Mot de Passe de Connexion
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 xxs:py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm xxs:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 xxs:w-5 xxs:h-5" /> : <Eye className="w-4 h-4 xxs:w-5 xxs:h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 xxs:py-4 px-4 rounded-lg font-medium text-sm xxs:text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 xxs:w-5 xxs:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                'Se Connecter Maintenant'
              )}
            </button>

            <div className="text-center">
              <span className="text-gray-600 text-xs xxs:text-sm">
                Vous n'avez pas de compte ?{' '}
              </span>
              <button
                onClick={onSwitchToRegister}
                className="text-blue-600 font-medium text-xs xxs:text-sm hover:underline"
              >
                Inscrivez-vous
              </button>
            </div>

            {/* Aide à la connexion */}
            <div className="mt-4 xxs:mt-6 p-3 xxs:p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-start space-x-3">
                <div className="w-4 h-4 xxs:w-5 xxs:h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-[10px] xxs:text-xs">ℹ</span>
                </div>
                <div>
                  <h4 className="text-xs xxs:text-sm font-semibold text-blue-800 mb-1">Aide à la Connexion</h4>
                  <p className="text-[10px] xxs:text-xs text-blue-700 leading-relaxed">
                    Utilisez le numéro de téléphone et le mot de passe que vous avez créés lors de votre inscription.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};