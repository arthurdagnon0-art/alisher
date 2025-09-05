import { useState, useEffect } from 'react';
import { User } from '../types';
import { AuthService } from '../services/authService';
import { supabase } from '../lib/supabase';

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

    // Écouter les événements de rafraîchissement
    const handleRefreshUserData = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          if (userData.id) {
            console.log('🔄 Rafraîchissement des données utilisateur pour:', userData.id);
            
            const { data: updatedUser, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', userData.id)
              .single();

            if (!error && updatedUser) {
              const formattedUser = {
                id: updatedUser.id,
                phone: updatedUser.phone,
                email: updatedUser.email,
                name: updatedUser.name,
                country: updatedUser.country,
                balance_deposit: updatedUser.balance_deposit || 0,
                balance_withdrawal: updatedUser.balance_withdrawal || 0,
                total_invested: updatedUser.total_invested || 0,
                total_earned: updatedUser.total_earned || 0,
                referral_code: updatedUser.referral_code,
                referred_by: updatedUser.referred_by,
                vip_level: updatedUser.vip_level || 0,
                is_active: updatedUser.is_active,
                is_blocked: updatedUser.is_blocked,
                created_at: updatedUser.created_at,
                updated_at: updatedUser.updated_at
              };
              
              console.log('✅ Données utilisateur mises à jour:', {
                balance_deposit: formattedUser.balance_deposit,
                balance_withdrawal: formattedUser.balance_withdrawal,
                total_invested: formattedUser.total_invested
              });
              
              setUser(formattedUser);
              localStorage.setItem('user', JSON.stringify(formattedUser));
              
              // Déclencher une mise à jour de l'interface
              window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: formattedUser }));
            }
          }
        } catch (error) {
          console.error('Erreur lors du rafraîchissement:', error);
        }
      }
    };

    window.addEventListener('refreshUserData', handleRefreshUserData);
    return () => window.removeEventListener('refreshUserData', handleRefreshUserData);
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