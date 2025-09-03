import React, { useState } from 'react';
import { PhoneInput } from './PhoneInput';
import { supportedCountries } from '../data/investments';

interface LoginFormProps {
  onLogin: (phone: string, otp: string) => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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
      // Simulation d'une connexion
      await new Promise(resolve => setTimeout(resolve, 1500));
      onLogin(phone, '123456'); // OTP simulé
    } catch (error) {
      setError('Erreur de connexion');
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
          </div>
        </div>
      </div>
    </div>
  );
};