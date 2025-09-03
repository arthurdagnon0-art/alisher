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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-gothic-italic">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
          Bienvenue sur Hope's Invest
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Connectez-vous à votre compte
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de Passe de Connexion
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                'Se Connecter Maintenant'
              )}
            </button>

            <div className="text-center">
              <span className="text-gray-600 text-sm">
                Vous n'avez pas de compte ?{' '}
              </span>
              <button
                onClick={onSwitchToRegister}
                className="text-blue-600 font-medium text-sm hover:underline"
              >
                Inscrivez-vous
              </button>
            </div>

            {/* Identifiants de test */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs">ℹ</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">Identifiants de Test</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <strong>Téléphone:</strong> N'importe quel numéro enregistré<br/>
                    <strong>Mot de passe:</strong> password123<br/>
                    <span className="text-blue-600">⚠️ Authentification temporaire pour les tests</span>
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