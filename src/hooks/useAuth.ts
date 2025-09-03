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
      
      // Vérifier l'OTP avant l'inscription
      const { data: otpData, error: otpError } = await supabase.functions.invoke('verify-otp', {
        body: {
          phone: `${country === 'BJ' ? '+229' : 
                   country === 'TG' ? '+228' :
                   country === 'CI' ? '+225' :
                   country === 'CM' ? '+237' :
                   country === 'SN' ? '+221' :
                   country === 'BF' ? '+226' :
                   country === 'GA' ? '+241' :
                   country === 'CD' ? '+243' : '+229'}${phone}`,
          code: otp,
          type: 'registration'
        }
      });

      if (otpError || !otpData.valid) {
        throw new Error('Code de vérification invalide ou expiré');
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

      // Sauvegarder la session localement
      localStorage.setItem('user', JSON.stringify(result.user));
      setUser(result.user);
      setIsAuthenticated(true);
      
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