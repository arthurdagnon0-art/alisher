import { useState, useEffect } from 'react';
import { User } from '../types';
import { AuthService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier la session locale
    const checkLocalSession = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Erreur lors du parsing de la session locale:', error);
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    checkLocalSession();
  }, []);

  const login = async (phone: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const result = await AuthService.login(phone, password);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Sauvegarder la session localement
      localStorage.setItem('user', JSON.stringify(result.user));
      setUser(result.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      throw new Error(error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    phone: string, 
    password: string, 
    name: string, 
    inviteCode: string, 
    otp: string, 
    country: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Vérifier l'OTP côté frontend
      const phoneCountryCodes = {
        'BJ': '+229', 'TG': '+228', 'CI': '+225', 'CM': '+237',
        'SN': '+221', 'BF': '+226', 'GA': '+241', 'CD': '+243'
      };
      const fullPhone = `${phoneCountryCodes[country] || '+229'}${phone}`;
      
      const otpResult = await AuthService.verifyOTP(fullPhone, otp);
      if (!otpResult.success) {
        throw new Error(otpResult.error || 'Code de vérification invalide');
      }

      const result = await AuthService.register({
        phone,
        password,
        name,
        country,
        referralCode: inviteCode
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Si l'utilisateur a besoin de configurer son mot de passe de transaction
      if (result.needsTransactionPassword) {
        // Sauvegarder temporairement pour la configuration
        localStorage.setItem('tempUser', JSON.stringify(result.user));
        // Ne pas marquer comme authentifié pour forcer la configuration
      } else {
        // Sauvegarder la session localement
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
        setIsAuthenticated(true);
      }
      
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      throw new Error(error.message || 'Erreur d\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
};