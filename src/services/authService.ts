import { supabase } from '../lib/supabase';
import { User } from '../types';
import bcrypt from 'bcryptjs';

// Stockage temporaire des OTP côté frontend
interface OTPStorage {
  phone: string;
  code: string;
  type: string;
  expiresAt: number;
}

class OTPManager {
  private static otps: Map<string, OTPStorage> = new Map();

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static storeOTP(phone: string, code: string, type: string): void {
    const key = `${phone}-${type}`;
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes
    
    this.otps.set(key, {
      phone,
      code,
      type,
      expiresAt
    });

    // Auto-cleanup après expiration
    setTimeout(() => {
      this.otps.delete(key);
    }, 5 * 60 * 1000);
  }

  static verifyOTP(phone: string, code: string, type: string): boolean {
    const key = `${phone}-${type}`;
    const stored = this.otps.get(key);

    if (!stored) {
      return false;
    }

    if (Date.now() > stored.expiresAt) {
      this.otps.delete(key);
      return false;
    }

    if (stored.code !== code) {
      return false;
    }

    // Supprimer l'OTP après utilisation
    this.otps.delete(key);
    return true;
  }
}

export class AuthService {
  // Inscription d'un nouvel utilisateur
  static async register(userData: {
    phone: string;
    password: string;
    name: string;
    country: string;
    referralCode?: string;
  }) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', userData.phone)
        .single();

      if (existingUser) {
        throw new Error('Un utilisateur avec ce numéro existe déjà');
      }

      // Générer le code de parrainage unique
      const referralCode = this.generateReferralCode();
      
      // Trouver le parrain si code fourni
      let referredBy = null;
      if (userData.referralCode) {
        const { data: referrer } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', userData.referralCode)
          .single();
        
        if (referrer) {
          referredBy = referrer.id;
        }
      }

      // Hacher le mot de passe de manière sécurisée
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Créer l'utilisateur
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          phone: userData.phone,
          name: userData.name,
          country: userData.country,
          password_hash: hashedPassword,
          referral_code: referralCode,
          referred_by: referredBy,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        user: this.formatUser(newUser),
        message: 'Inscription réussie'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'inscription'
      };
    }
  }

  // Connexion utilisateur
  static async login(phone: string, password: string) {
    try {
      // Récupérer l'utilisateur
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .limit(1);

      if (error) {
        throw new Error('Erreur lors de la récupération des données');
      }

      if (!users || users.length === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      const user = users[0];

      // Vérifier si l'utilisateur est actif
      if (!user.is_active || user.is_blocked) {
        throw new Error('Compte désactivé ou bloqué');
      }

      // Vérifier le mot de passe avec bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Mot de passe incorrect');
      }

      // Mettre à jour la dernière connexion
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      return {
        success: true,
        user: this.formatUser(user),
        message: 'Connexion réussie'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la connexion'
      };
    }
  }

  // Vérifier le mot de passe de transaction
  static async verifyTransactionPassword(userId: string, password: string) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('transaction_password_hash')
        .eq('id', userId)
        .single();

      if (error || !user || !user.transaction_password_hash) {
        throw new Error('Mot de passe de transaction non configuré');
      }

      // Vérifier le mot de passe de transaction avec bcrypt
      const isValid = await bcrypt.compare(password, user.transaction_password_hash);
      return {
        success: true,
        isValid,
        message: isValid ? 'Mot de passe valide' : 'Mot de passe incorrect'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la vérification'
      };
    }
  }

  // Mettre à jour le profil utilisateur
  static async updateProfile(userId: string, updates: {
    name?: string;
    email?: string;
    transactionPassword?: string;
  }) {
    try {
      const updateData: any = {};

      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.transactionPassword) {
        updateData.transaction_password_hash = await bcrypt.hash(updates.transactionPassword, 10);
      }

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        user: this.formatUser(data),
        message: 'Profil mis à jour avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour'
      };
    }
  }

  // Générer un code de parrainage unique
  private static generateReferralCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Formater les données utilisateur
  private static formatUser(userData: any): User {
    return {
      id: userData.id,
      phone: userData.phone,
      email: userData.email,
      name: userData.name,
      country: userData.country,
      balance_deposit: userData.balance_deposit || 0,
      balance_withdrawal: userData.balance_withdrawal || 0,
      total_invested: userData.total_invested || 0,
      referral_code: userData.referral_code,
      referred_by: userData.referred_by,
      is_active: userData.is_active,
      is_blocked: userData.is_blocked,
      created_at: userData.created_at,
    };
  }

  // Envoyer OTP (simulation côté frontend)
  static async sendOTP(phone: string) {
    try {
      // Générer et stocker l'OTP
      const otp = OTPManager.generateOTP();
      OTPManager.storeOTP(phone, otp, 'registration');
      
      // Simulation d'envoi SMS
      console.log(`📱 SMS simulé vers ${phone}: Votre code Alisher USMANOV: ${otp}`);
      
      // En production, ici vous appelleriez votre service SMS
      // await sendSMSViaProvider(phone, `Votre code Alisher USMANOV: ${otp}`);
      
      return {
        success: true,
        message: 'Code de vérification envoyé avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi du code'
      };
    }
  }

  // Vérifier OTP côté frontend
  static async verifyOTP(phone: string, otp: string) {
    try {
      const isValid = OTPManager.verifyOTP(phone, otp, 'registration');
      
      return {
        success: isValid,
        error: isValid ? null : 'Code de vérification incorrect ou expiré'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la vérification du code'
      };
    }
  }

  // Envoyer OTP pour retrait
  static async sendWithdrawalOTP(phone: string) {
    try {
      const otp = OTPManager.generateOTP();
      OTPManager.storeOTP(phone, otp, 'withdrawal');
      
      console.log(`📱 SMS retrait simulé vers ${phone}: Code de retrait: ${otp}`);
      
      return {
        success: true,
        message: 'Code de retrait envoyé avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi du code de retrait'
      };
    }
  }

  // Vérifier OTP de retrait
  static async verifyWithdrawalOTP(phone: string, otp: string) {
    try {
      const isValid = OTPManager.verifyOTP(phone, otp, 'withdrawal');
      
      return {
        success: isValid,
        error: isValid ? null : 'Code de retrait incorrect ou expiré'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la vérification du code de retrait'
      };
    }
  }
}
    
    // En production, intégrer avec un service SMS réel
    console.log(`OTP pour ${phone}: ${otp}`);
    
    return {
      success: true,
      otp, // En production, ne pas retourner l'OTP
      message: 'OTP envoyé avec succès'
    };
  }

  // Vérifier OTP (simulation)
  static async verifyOTP(phone: string, otp: string) {
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          phone,
          code: otp,
          type: 'registration'
        }
      });

      if (error) throw error;

      return {
        success: data.valid,
        message: data.valid ? 'OTP vérifié avec succès' : 'Code de vérification incorrect'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la vérification de l\'OTP'
      };
    }
  }
}