import React, { useState } from 'react';
import { PhoneInput } from './PhoneInput';
import { supportedCountries } from '../data/investments';
import { supabase } from '../lib/supabase';
import {EyeOff, Eye} from 'lucide-react'

interface RegisterFormProps {
  onRegister: (phone: string, password: string, name: string, inviteCode: string, otp: string, country: string) => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin }) => {
  const [phone, setPhone] = useState('');
   const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('BJ');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Envoyer le code de vérification
  const sendVerificationCode = async () => {
    if (!phone || !selectedCountry) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setSendingOtp(true);
    setError('');

    try {
      // Simulation d'envoi
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Générer le code de vérification automatiquement
      const newVerificationCode = generateVerificationCode();
      setVerificationCode(newVerificationCode);

      setCountdown(110); // 110 secondes avant de pouvoir regénérer
      
      // Décompte
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleRegister = async () => {
    if (!phone || !password || !name || !verificationCode) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onRegister(phone, password, name, referralCode, verificationCode, selectedCountry);
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 sm:px-6 lg:px-8 font-gothic-italic">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
        <p className="text-sm text-yellow-700">
          Vous devez vous assurer que votre numéro de téléphone est correct. Pour retirer
          funds, you need to collect an OTP verification code on your phone
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
          Bienvenue sur Hope's Invest
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Inscrivez-vous à votre compte
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
              placeholder="Veuillez entrer votre numéro de téléphone"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de Passe de Connexion
              </label>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de Passe de Connexion"
                  className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setVisible(!visible)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {visible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pseudo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom complet"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code de Parrainage (Optionnel)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Entrez le code de parrainage (optionnel)"
              />

            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Code de Vérification
                </label>
                {countdown > 0 && (
                  <span className="text-sm text-orange-600 font-medium">
                    Renvoyer dans {countdown}s
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={verificationCode}
                  readOnly
                  className={`flex-1 px-3 py-2 border rounded-lg font-mono text-lg font-bold ${
                    verificationCode 
                      ? 'bg-blue-50 border-blue-200 text-blue-600' 
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                  placeholder="Code à 6 chiffres..."
                />
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={sendingOtp || countdown > 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
                >
                  {sendingOtp ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : countdown > 0 ? (
                    `${countdown}s`
                  ) : verificationCode ? (
                    'Renvoyer'
                  ) : (
                    'Envoyer'
                  )}
                </button>
              </div>
              {verificationCode && (
                <p className="text-xs text-blue-600 mt-1">✓ Code envoyé automatiquement</p>
              )}
            </div>


            <button
              onClick={handleRegister}
              disabled={isLoading || !verificationCode}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Inscription...</span>
                </div>
              ) : (
                'S\'inscrire Maintenant'
              )}
            </button>

            <div className="text-center">
              <span className="text-gray-600 text-sm">
                Vous avez déjà un compte ?{' '}
              </span>
              <button
                onClick={onSwitchToLogin}
                className="text-blue-600 font-medium text-sm hover:underline"
              >
                Se Connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};