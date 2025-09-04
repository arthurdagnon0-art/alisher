import React, { useState } from 'react';
import { Lock, User, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '../services/authService';

interface SetupAccountPageProps {
  onComplete: (transactionPassword: string, nickname: string) => void;
}

export const SetupAccountPage: React.FC<SetupAccountPageProps> = ({ onComplete }) => {
  const [transactionPassword, setTransactionPassword] = useState('');
  const [confirmTransactionPassword, setConfirmTransactionPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!transactionPassword) {
      newErrors.transactionPassword = 'Le mot de passe de transaction est requis';
    } else if (transactionPassword.length < 6) {
      newErrors.transactionPassword = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!confirmTransactionPassword) {
      newErrors.confirmTransactionPassword = 'Veuillez confirmer le mot de passe';
    } else if (transactionPassword !== confirmTransactionPassword) {
      newErrors.confirmTransactionPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!nickname.trim()) {
      newErrors.nickname = 'Le pseudo est requis';
    } else if (nickname.trim().length < 2) {
      newErrors.nickname = 'Le pseudo doit contenir au moins 2 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      saveTransactionPassword();
    }
  };

  const saveTransactionPassword = async () => {
    setIsLoading(true);
    try {
      // Récupérer l'utilisateur temporaire
      const tempUser = localStorage.getItem('tempUser');
      if (!tempUser) {
        throw new Error('Session expirée');
      }

      const userData = JSON.parse(tempUser);
      
      // Mettre à jour le profil avec le mot de passe de transaction
      const result = await AuthService.updateProfile(userData.id, {
        name: nickname.trim(),
        transactionPassword: transactionPassword
      });

      if (result.success) {
        onComplete(transactionPassword, nickname.trim());
      } else {
        setErrors({ general: result.error || 'Erreur lors de la sauvegarde' });
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Erreur lors de la configuration' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Configuration du Compte</h2>
          <p className="text-sm opacity-90">Dernière étape pour sécuriser votre compte</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Transaction Password */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-blue-600" />
                Mot de Passe de Transaction
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={transactionPassword}
                  onChange={(e) => setTransactionPassword(e.target.value)}
                  placeholder="Créer un mot de passe sécurisé"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                    errors.transactionPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.transactionPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.transactionPassword}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Ce mot de passe sera requis pour tous vos retraits
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Confirmer le Mot de Passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmTransactionPassword}
                  onChange={(e) => setConfirmTransactionPassword(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                    errors.confirmTransactionPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmTransactionPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmTransactionPassword}</p>
              )}
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Pseudo
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Choisissez votre pseudo"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                errors.nickname ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.nickname && (
              <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Ce nom sera affiché sur votre profil
            </p>
          </div>

          {/* Security Info */}
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-800 mb-1">Sécurité Renforcée</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Votre mot de passe de transaction protège vos retraits. 
                  Gardez-le secret et ne le partagez jamais.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Configuration...</span>
              </div>
            ) : (
              'Finaliser mon Compte'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};