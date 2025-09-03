import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface VerifyOTPRequest {
  phone: string;
  code: string;
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
    // Vérifier les variables d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Variables d\'environnement manquantes:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey
      });
      
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Configuration serveur incomplète'
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

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    const { phone, code, type }: VerifyOTPRequest = await req.json();

    console.log('Vérification OTP pour:', { phone, type, code: code ? '***' : 'manquant' });

    // Récupérer l'OTP le plus récent pour ce numéro et ce type
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('type', type)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('Résultat recherche OTP:', { 
      found: !!otpRecord, 
      error: otpError?.message,
      expired: otpRecord ? new Date(otpRecord.expires_at) < new Date() : null
    });

    if (otpError || !otpRecord) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Code de vérification expiré ou introuvable'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
    }

    // Vérifier le code
    if (otpRecord.code !== code) {
      console.log('Code incorrect:', { expected: otpRecord.code, received: code });
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Code de vérification incorrect'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
    }

    // Marquer l'OTP comme utilisé
    const { error: updateError } = await supabaseAdmin
      .from('otp_codes')
      .update({ is_used: true })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error('Erreur mise à jour OTP:', updateError);
    }

    console.log('OTP vérifié avec succès pour:', phone);

    return new Response(
      JSON.stringify({ 
        valid: true, 
        message: 'Code de vérification valide'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );

  } catch (error: any) {
    console.error('Erreur dans verify-otp:', error);
    
    return new Response(
      JSON.stringify({ 
        valid: false, 
        message: 'Erreur serveur lors de la vérification'
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