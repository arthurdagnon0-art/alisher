# 🔧 Configuration des Variables d'Environnement

## 📋 Variables Requises pour la Production

### **1. 🗄️ Supabase (Obligatoire)**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Comment obtenir :**
1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Aller dans **Settings > API**
4. Copier les clés

### **2. 📱 SMS Provider (Obligatoire pour OTP)**

#### **Option A : Twilio (Recommandé)**
```env
SMS_PROVIDER=twilio
SMS_API_URL=https://api.twilio.com/2010-04-01
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Configuration :**
1. Créer un compte [Twilio](https://www.twilio.com)
2. Acheter un numéro de téléphone
3. Récupérer Account SID et Auth Token

#### **Option B : AWS SNS**
```env
SMS_PROVIDER=aws
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

#### **Option C : Provider Local Africain**
```env
SMS_PROVIDER=local
SMS_API_URL=https://api.your-local-provider.com
SMS_API_KEY=your_api_key
```

### **3. 💳 Providers de Paiement**

#### **🟠 Orange Money**
```env
ORANGE_API_URL=https://api.orange.com/orange-money-webpay/dev/v1
ORANGE_CLIENT_ID=your_client_id
ORANGE_CLIENT_SECRET=your_client_secret
ORANGE_MERCHANT_KEY=your_merchant_key
```

#### **🔵 MTN Mobile Money**
```env
MTN_API_URL=https://sandbox.momodeveloper.mtn.com
MTN_USER_ID=your_user_id
MTN_API_KEY=your_api_key
MTN_SUBSCRIPTION_KEY=your_subscription_key
```

#### **🟡 Moov Money**
```env
MOOV_API_URL=https://api.moov-africa.com
MOOV_API_KEY=your_api_key
MOOV_MERCHANT_ID=your_merchant_id
```

#### **🌊 Wave**
```env
WAVE_API_URL=https://api.wave.com
WAVE_API_KEY=your_api_key
WAVE_MERCHANT_ID=your_merchant_id
```

### **4. 🪙 USDT/Crypto**
```env
USDT_WALLET_ADDRESS=TTetqLeWRGyg9NzGJ8xQFt7AtgBfaTBEAc
TRON_API_KEY=your_tron_api_key
TRON_NETWORK=mainnet
```

### **5. 🔗 Webhooks**
```env
WEBHOOK_SECRET=your_super_secret_webhook_key
PAYMENT_WEBHOOK_URL=https://your-project.supabase.co/functions/v1/handle-payment-webhook
```

## 🚀 **Configuration Supabase**

### **1. Variables d'Environnement dans Supabase**
1. Aller dans **Settings > Environment Variables**
2. Ajouter toutes les variables (sauf celles avec `VITE_`)

### **2. Secrets pour Edge Functions**
```bash
# Dans le dashboard Supabase, section Edge Functions
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SMS_API_URL=https://api.twilio.com/2010-04-01
SMS_API_KEY=your_sms_api_key
ORANGE_CLIENT_SECRET=your_orange_secret
MTN_API_KEY=your_mtn_key
WEBHOOK_SECRET=your_webhook_secret
```

## 🔧 **Configuration Locale**

### **1. Copier le fichier d'exemple**
```bash
cp .env.example .env
```

### **2. Remplir les valeurs**
```env
# Remplacer "your_xxx" par les vraies valeurs
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚠️ **Sécurité**

### **1. Variables Sensibles**
- **JAMAIS** commiter le fichier `.env`
- **Utiliser** des secrets différents pour dev/prod
- **Rotation** régulière des clés API

### **2. Validation**
- **Vérifier** toutes les variables au démarrage
- **Logs** sans exposer les secrets
- **Monitoring** des accès API

## 🧪 **Test de Configuration**

### **1. Vérification Supabase**
```javascript
// Test dans la console navigateur
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
// Ne doit PAS afficher les clés secrètes
```

### **2. Test SMS**
```bash
# Appeler l'edge function de test
curl -X POST https://your-project.supabase.co/functions/v1/send-sms-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+22912345678", "country": "BJ", "type": "registration"}'
```

### **3. Test Paiements**
```bash
# Test webhook
curl -X POST https://your-project.supabase.co/functions/v1/handle-payment-webhook \
  -H "Content-Type: application/json" \
  -d '{"transaction_id": "test", "status": "success"}'
```

## 📞 **Support Providers**

### **SMS Providers Recommandés pour l'Afrique**
- **Twilio** : Global, fiable
- **Africa's Talking** : Spécialisé Afrique
- **Nexmo/Vonage** : Bonne couverture
- **Local providers** : Moins cher, couverture locale

### **Mobile Money Contacts**
- **Orange** : [developer.orange.com](https://developer.orange.com)
- **MTN** : [momodeveloper.mtn.com](https://momodeveloper.mtn.com)
- **Moov** : Contact commercial local
- **Wave** : [developer.wave.com](https://developer.wave.com)

Une fois ces variables configurées, l'authentification Supabase sera opérationnelle ! Voulez-vous que je continue avec l'intégration des paiements ?