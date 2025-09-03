import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SMSRequest {
  phone: string;
  country: string;
  type: 'registration' | 'login' | 'withdrawal';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { phone, country, type }: SMSRequest = await req.json();

    // Générer un code OTP à 6 chiffres
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Stocker l'OTP en base avec expiration (5 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await supabaseAdmin
      .from('otp_codes')
      .insert({
        phone,
        code: otp,
        type,
        expires_at: expiresAt.toISOString(),
        is_used: false
      });

    // Formater le message selon le type
    let message = '';
    switch (type) {
      case 'registration':
        message = `Votre code de vérification Alisher USMANOV Investment: ${otp}. Valide 5 minutes.`;
        break;
      case 'login':
        message = `Code de connexion Alisher USMANOV: ${otp}. Ne le partagez pas.`;
        break;
      case 'withdrawal':
        message = `Code de retrait Alisher USMANOV: ${otp}. Sécurisez vos fonds.`;
        break;
    }

    // En production, intégrer avec un vrai service SMS
    // Exemple avec Twilio, AWS SNS, ou un provider local
    const smsResult = await sendSMS(phone, message, country);

    if (!smsResult.success) {
      throw new Error('Échec de l\'envoi du SMS');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP envoyé avec succès',
        expires_in: 300 // 5 minutes en secondes
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );

  } catch (error: any) {
    console.error('Erreur dans send-sms-otp:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur lors de l\'envoi de l\'OTP'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
});

// Fonction pour envoyer le SMS (à adapter selon le provider)
async function sendSMS(phone: string, message: string, country: string) {
  try {
    // Exemple d'intégration avec un service SMS
    // À remplacer par votre provider SMS réel
    
    const smsApiUrl = Deno.env.get('SMS_API_URL');
    const smsApiKey = Deno.env.get('SMS_API_KEY');

    if (!smsApiUrl || !smsApiKey) {
      // Mode développement - simuler l'envoi
      console.log(`SMS simulé vers ${phone}: ${message}`);
      return { success: true };
    }

    // Exemple d'appel API SMS
    const response = await fetch(smsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${smsApiKey}`
      },
      body: JSON.stringify({
        to: phone,
        message: message,
        country: country
      })
    });

    if (!response.ok) {
      throw new Error('Erreur API SMS');
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur envoi SMS:', error);
    return { success: false, error: error.message };
  }
}