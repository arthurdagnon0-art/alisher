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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { phone, code, type }: VerifyOTPRequest = await req.json();

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

    if (otpError || !otpRecord) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Code de vérification expiré ou introuvable'
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
    }

    // Vérifier le code
    if (otpRecord.code !== code) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Code de vérification incorrect'
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
    }

    // Marquer l'OTP comme utilisé
    await supabaseAdmin
      .from('otp_codes')
      .update({ is_used: true })
      .eq('id', otpRecord.id);

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
        error: error.message || 'Erreur lors de la vérification'
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