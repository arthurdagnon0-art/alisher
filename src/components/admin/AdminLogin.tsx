import React, { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { AdminService } from '../../services/adminService';

interface AdminLoginProps {
  onLogin: (admin: any) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@alisher-investment.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const result = await AdminService.adminLogin(email, password);
      
      if (result.success) {
        onLogin(result.admin);
      } else {
        setError(result.error || 'Erreur de connexion');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Administration</h2>
          <p className="text-sm opacity-90">Alisher USMANOV Investment</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Email Administrateur
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                placeholder="admin@alisher-investment.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Mot de Passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 pr-12"
                  placeholder="Entrez votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                'Se Connecter'
              )}
            </button>
          </form>

          {/* Identifiants de test */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-800 mb-1">Identifiants de Test</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Email:</strong> admin@alisher-investment.com<br/>
                  <strong>Mot de passe:</strong> Admin123!<br/>
                  <span className="text-blue-600">⚠️ Authentification temporaire (sans Supabase)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};