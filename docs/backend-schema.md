# Schéma Backend Complet - Plateforme d'Investissement Alisher USMANOV

## 🗄️ Base de Données (PostgreSQL)

### 👤 Table `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  name VARCHAR(100) NOT NULL,
  country VARCHAR(2) NOT NULL, -- Code pays (BJ, TG, CI, etc.)
  password_hash VARCHAR(255) NOT NULL,
  transaction_password_hash VARCHAR(255),
  balance_deposit DECIMAL(15,2) DEFAULT 0,
  balance_withdrawal DECIMAL(15,2) DEFAULT 0,
  total_invested DECIMAL(15,2) DEFAULT 0,
  total_earned DECIMAL(15,2) DEFAULT 0,
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  referred_by UUID REFERENCES users(id),
  vip_level INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_blocked BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);
```

### 💰 Table `vip_packages`
```sql
CREATE TABLE vip_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- VIP0, VIP1, VIP2, etc.
  min_amount DECIMAL(15,2) NOT NULL,
  max_amount DECIMAL(15,2) NOT NULL,
  daily_rate DECIMAL(5,2) NOT NULL, -- Pourcentage quotidien
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### ⏰ Table `staking_plans`
```sql
CREATE TABLE staking_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  duration_days INTEGER NOT NULL,
  daily_rate DECIMAL(5,2) NOT NULL,
  min_amount DECIMAL(15,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 📈 Table `vip_investments`
```sql
CREATE TABLE vip_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  package_id UUID NOT NULL REFERENCES vip_packages(id),
  package_name VARCHAR(50) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  daily_earnings DECIMAL(15,2) NOT NULL,
  total_earned DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- active, paused, cancelled
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vip_investments_user_id ON vip_investments(user_id);
CREATE INDEX idx_vip_investments_status ON vip_investments(status);
```

### 🔒 Table `staking_investments`
```sql
CREATE TABLE staking_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id UUID NOT NULL REFERENCES staking_plans(id),
  plan_name VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  daily_earnings DECIMAL(15,2) NOT NULL,
  total_earned DECIMAL(15,2) DEFAULT 0,
  unlock_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_staking_investments_user_id ON staking_investments(user_id);
CREATE INDEX idx_staking_investments_unlock_date ON staking_investments(unlock_date);
```

### 💳 Table `transactions`
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL, -- deposit, withdrawal, investment, earning, referral
  method VARCHAR(20), -- moov, mtn, orange, wave, celtis, usdt
  amount DECIMAL(15,2) NOT NULL,
  fees DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, completed
  reference VARCHAR(100),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
```

### 📊 Table `daily_earnings`
```sql
CREATE TABLE daily_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  investment_id UUID NOT NULL,
  investment_type VARCHAR(20) NOT NULL, -- vip, staking
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_daily_earnings_user_id ON daily_earnings(user_id);
CREATE INDEX idx_daily_earnings_date ON daily_earnings(date);
CREATE UNIQUE INDEX idx_daily_earnings_unique ON daily_earnings(investment_id, date);
```

### 👥 Table `referral_bonuses`
```sql
CREATE TABLE referral_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_id UUID NOT NULL REFERENCES users(id),
  referred_name VARCHAR(100) NOT NULL,
  level INTEGER NOT NULL, -- 1, 2, 3
  amount DECIMAL(15,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_referral_bonuses_referrer_id ON referral_bonuses(referrer_id);
```

### 🏦 Table `bank_cards`
```sql
CREATE TABLE bank_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  wallet_type VARCHAR(20) NOT NULL, -- orange, mtn, moov, wave, celtis
  card_holder_name VARCHAR(100) NOT NULL,
  card_number VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bank_cards_user_id ON bank_cards(user_id);
```

### 📝 Table `blog_posts`
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  images JSONB, -- Array d'URLs d'images
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### ⚙️ Table `platform_settings`
```sql
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Données initiales
INSERT INTO platform_settings (key, value, description) VALUES
('min_deposit', '3000', 'Montant minimum de dépôt en FCFA'),
('min_withdrawal', '1000', 'Montant minimum de retrait en FCFA'),
('withdrawal_fee_rate', '10', 'Taux de frais de retrait en pourcentage'),
('usdt_exchange_rate', '600', 'Taux de change USDT vers FCFA'),
('referral_rates', '{"level1": 11, "level2": 2, "level3": 1}', 'Taux de commission par niveau'),
('withdrawal_hours', '{"start": 8, "end": 17}', 'Heures de traitement des retraits');
```

## 🚀 API Routes (Node.js + Express)

### 🔐 Authentication
```javascript
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/logout
// POST /api/auth/verify-otp
// POST /api/auth/resend-otp
```

### 👤 User Management
```javascript
// GET /api/user/profile
// PUT /api/user/profile
// PUT /api/user/password
// PUT /api/user/transaction-password
// GET /api/user/balance
// GET /api/user/stats
```

### 💰 Investments
```javascript
// GET /api/investments/vip-packages
// GET /api/investments/staking-plans
// POST /api/investments/vip/create
// POST /api/investments/staking/create
// GET /api/investments/user/:userId
// PUT /api/investments/:id/pause
// PUT /api/investments/:id/resume
// DELETE /api/investments/:id/cancel
```

### 💳 Transactions
```javascript
// POST /api/transactions/deposit
// POST /api/transactions/withdraw
// GET /api/transactions/user/:userId
// GET /api/transactions/:id/status
// PUT /api/transactions/:id/approve (Admin)
// PUT /api/transactions/:id/reject (Admin)
```

### 👥 Referrals
```javascript
// GET /api/referrals/team/:userId
// GET /api/referrals/bonuses/:userId
// GET /api/referrals/stats/:userId
```

### 🏦 Bank Cards
```javascript
// GET /api/bank-cards/user/:userId
// POST /api/bank-cards/create
// PUT /api/bank-cards/:id
// DELETE /api/bank-cards/:id
```

### 📝 Blog
```javascript
// GET /api/blog/posts
// POST /api/blog/posts/create
// PUT /api/blog/posts/:id/approve (Admin)
// DELETE /api/blog/posts/:id (Admin)
```

## 🔧 Jobs Automatisés (Cron Jobs)

### 📊 Calcul des Revenus Quotidiens
```javascript
// Tous les jours à 00:01
async function calculateDailyEarnings() {
  // VIP Investments
  const vipInvestments = await getActiveVipInvestments();
  for (const investment of vipInvestments) {
    await createDailyEarning(investment);
    await updateUserBalance(investment.user_id, investment.daily_earnings);
  }
  
  // Staking Investments
  const stakingInvestments = await getActiveStakingInvestments();
  for (const investment of stakingInvestments) {
    if (new Date() <= investment.unlock_date) {
      await createDailyEarning(investment);
      await updateUserBalance(investment.user_id, investment.daily_earnings);
    } else {
      await completeStakingInvestment(investment.id);
    }
  }
}
```

### 💰 Traitement des Commissions de Parrainage
```javascript
// Lors de chaque investissement
async function processReferralCommissions(userId, investmentAmount) {
  const user = await getUserWithReferrer(userId);
  if (!user.referred_by) return;
  
  const rates = await getReferralRates();
  
  // Niveau 1
  await createReferralBonus(user.referred_by, userId, investmentAmount, rates.level1, 1);
  
  // Niveau 2
  const level2Referrer = await getReferrer(user.referred_by);
  if (level2Referrer) {
    await createReferralBonus(level2Referrer.id, userId, investmentAmount, rates.level2, 2);
  }
  
  // Niveau 3
  const level3Referrer = await getReferrer(level2Referrer?.id);
  if (level3Referrer) {
    await createReferralBonus(level3Referrer.id, userId, investmentAmount, rates.level3, 3);
  }
}
```

## 🛡️ Interface Admin

### 📊 Dashboard Admin
```javascript
// Statistiques principales
- Nombre total d'utilisateurs
- Dépôts en attente
- Retraits en attente  
- Investissements actifs
- Revenus générés aujourd'hui
- Commissions de parrainage
```

### 👥 Gestion des Utilisateurs
```javascript
// Fonctionnalités
- Liste des utilisateurs avec filtres
- Détails utilisateur complets
- Bloquer/Débloquer utilisateur
- Modifier les soldes manuellement
- Historique des transactions
- Arbre de parrainage
```

### 💳 Gestion des Transactions
```javascript
// Dépôts
- Liste des dépôts en attente
- Approuver/Rejeter avec notes
- Historique complet

// Retraits  
- Liste des retraits en attente
- Vérification des informations bancaires
- Traitement par lot
- Rapports de paiement
```

### 📈 Gestion des Investissements
```javascript
// VIP Packages
- Créer/Modifier/Désactiver
- Statistiques par package
- Utilisateurs par niveau VIP

// Staking Plans
- Créer/Modifier/Désactiver  
- Statistiques par plan
- Investissements arrivant à échéance
```

### ⚙️ Configuration Plateforme
```javascript
// Paramètres
- Montants minimum/maximum
- Taux de change USDT
- Frais de retrait
- Heures de traitement
- Taux de commission parrainage
- Messages système
```

### 📊 Rapports et Analytics
```javascript
// Rapports financiers
- Revenus par période
- Dépôts/Retraits par méthode
- Performance des investissements
- Commissions de parrainage
- Export Excel/PDF
```

## 🔒 Sécurité

### 🛡️ Authentification
- JWT tokens avec refresh
- OTP par SMS pour actions sensibles
- Rate limiting sur les APIs
- Validation stricte des données

### 💰 Transactions
- Double vérification pour retraits
- Logs complets de toutes les actions
- Détection de fraude automatique
- Sauvegarde quotidienne des données

### 🔐 Données Sensibles
- Chiffrement des mots de passe (bcrypt)
- Chiffrement des données bancaires
- Audit trail complet
- Accès admin avec 2FA

## 🚀 Déploiement

### 🐳 Docker Configuration
```dockerfile
# API Backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 🗄️ Base de Données
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: alisher_investment
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
      
  api:
    build: .
    environment:
      DATABASE_URL: postgresql://admin:${DB_PASSWORD}@postgres:5432/alisher_investment
      REDIS_URL: redis://redis:6379
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
```

Ce schéma backend complet couvre tous les aspects de la plateforme d'investissement !