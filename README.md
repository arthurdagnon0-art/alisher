# 🚀 Alisher USMANOV Investment Platform

Plateforme d'investissement complète avec backend Supabase, système VIP, staking et parrainage multi-niveaux.

## 📋 Fonctionnalités

### 👤 **Gestion Utilisateurs**
- ✅ Inscription avec OTP automatique
- ✅ Connexion sécurisée
- ✅ Profils utilisateur complets
- ✅ Système de parrainage à 3 niveaux (11%, 2%, 1%)
- ✅ Gestion des pays (8 pays supportés)

### 💰 **Système d'Investissement**
- ✅ **VIP Packages** : 5 niveaux (VIP0 à VIP4)
- ✅ **Staking Plans** : 6 plans (3 à 60 jours)
- ✅ Revenus quotidiens automatiques
- ✅ Calculs de commissions en temps réel

### 💳 **Transactions**
- ✅ Dépôts multi-méthodes (Mobile Money + USDT)
- ✅ Retraits sécurisés avec mot de passe transaction
- ✅ Système d'approbation admin
- ✅ Historique complet

### 🛡️ **Administration**
- ✅ Dashboard complet avec statistiques
- ✅ Gestion utilisateurs avancée
- ✅ Approbation transactions
- ✅ Configuration plateforme
- ✅ Rapports financiers

## 🗄️ **Base de Données**

### **Tables Principales**
```sql
- users (utilisateurs avec parrainage)
- vip_packages (packages VIP)
- staking_plans (plans de staking)
- vip_investments (investissements VIP)
- staking_investments (investissements staking)
- transactions (historique complet)
- daily_earnings (revenus quotidiens)
- referral_bonuses (commissions parrainage)
- bank_cards (informations paiement)
- platform_settings (configuration)
- admin_users (administrateurs)
```

## 🚀 **Installation**

### **1. Cloner le Projet**
```bash
git clone <repository-url>
cd alisher-investment-platform
```

### **2. Installer les Dépendances**
```bash
npm install
```

### **3. Configuration Supabase**
1. Créer un projet Supabase
2. Copier `.env.example` vers `.env`
3. Configurer les variables d'environnement :
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **4. Migrations Base de Données**
```bash
# Exécuter les migrations dans l'ordre :
# 001_create_users_table.sql
# 002_create_investment_tables.sql
# 003_create_transactions_table.sql
# 004_create_earnings_and_referrals.sql
# 005_create_platform_settings.sql
# 006_insert_initial_data.sql
```

### **5. Démarrer l'Application**
```bash
npm run dev
```

## 🔧 **Jobs Automatisés**

### **Revenus Quotidiens** (00:01)
- Calcul automatique des revenus VIP (illimités)
- Calcul des revenus staking (jusqu'à échéance)
- Mise à jour des soldes utilisateurs

### **Vérification Staking** (00:30)
- Vérification des échéances
- Remboursement du capital
- Finalisation des investissements

### **Nettoyage** (Dimanche 02:00)
- Suppression des anciennes données
- Optimisation de la base

## 👨‍💼 **Interface Admin**

### **Accès**
- URL : `/admin`
- Email : `admin@alisher-investment.com`
- Mot de passe : `Admin123!` (à changer)

### **Fonctionnalités**
- 📊 Dashboard avec statistiques temps réel
- 👥 Gestion complète des utilisateurs
- 💳 Approbation des transactions
- ⚙️ Configuration de la plateforme
- 📈 Rapports financiers détaillés

## 💰 **Système Financier**

### **VIP Packages**
| Niveau | Montant Min | Montant Max | Taux Quotidien |
|--------|-------------|-------------|----------------|
| VIP0   | 3,000       | 70,000      | 5.0%          |
| VIP1   | 75,000      | 200,000     | 7.0%          |
| VIP2   | 205,000     | 500,000     | 9.0%          |
| VIP3   | 505,000     | 1,000,000   | 11.0%         |
| VIP4   | 1,005,000   | 5,000,000   | 13.0%         |

### **Staking Plans**
| Plan      | Durée | Taux Quotidien | Min Amount |
|-----------|-------|----------------|------------|
| 3 jours   | 3j    | 5.0%          | 3,000      |
| 7 jours   | 7j    | 8.0%          | 3,000      |
| 15 jours  | 15j   | 11.0%         | 3,000      |
| 30 jours  | 30j   | 13.0%         | 3,000      |
| 45 jours  | 45j   | 17.0%         | 3,000      |
| 60 jours  | 60j   | 20.0%         | 3,000      |

### **Commissions Parrainage**
- **Niveau 1** : 11% des investissements
- **Niveau 2** : 2% des investissements
- **Niveau 3** : 1% des investissements

## 🔒 **Sécurité**

### **Authentification**
- Mots de passe hashés (bcrypt)
- OTP pour actions sensibles
- Sessions sécurisées
- Rate limiting

### **Base de Données**
- Row Level Security (RLS)
- Policies granulaires
- Audit trail complet
- Sauvegarde automatique

## 📱 **Méthodes de Paiement**

### **Mobile Money**
- 🟠 Orange Money
- 🔵 MTN Mobile Money
- 🟡 Moov Money
- 🌊 Wave
- 📱 Celtis (Bénin)

### **Crypto**
- ₿ USDT (TRC-20)
- Taux : 1 USDT = 600 FCFA

## 🌍 **Pays Supportés**
- 🇧🇯 Bénin (+229)
- 🇹🇬 Togo (+228)
- 🇨🇮 Côte d'Ivoire (+225)
- 🇨🇲 Cameroun (+237)
- 🇸🇳 Sénégal (+221)
- 🇧🇫 Burkina Faso (+226)
- 🇬🇦 Gabon (+241)
- 🇨🇩 RDC (+243)

## 📊 **API Endpoints**

### **Authentification**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
```

### **Investissements**
```
GET /api/investments/vip-packages
GET /api/investments/staking-plans
POST /api/investments/vip/create
POST /api/investments/staking/create
```

### **Transactions**
```
POST /api/transactions/deposit
POST /api/transactions/withdraw
GET /api/transactions/user/:userId
```

### **Admin**
```
POST /api/admin/login
GET /api/admin/dashboard-stats
GET /api/admin/users
PUT /api/admin/transactions/:id/approve
```

## 🚀 **Déploiement**

### **Frontend**
- Hébergement : Netlify/Vercel
- Build : `npm run build`
- Variables d'environnement configurées

### **Backend**
- Base de données : Supabase
- Jobs : Cron jobs configurés
- Monitoring : Logs et alertes

## 📞 **Support**

- **Email** : support@alisher-investment.com
- **Telegram** : Canal officiel
- **Heures** : 08:00 - 18:00 (GMT+1)

---

**© 2024 Alisher USMANOV Investment Platform - Tous droits réservés**