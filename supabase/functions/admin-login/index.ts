import { createClient } from 'npm:@supabase/supabase-js@2';
import { compare } from 'npm:bcryptjs@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface AdminLoginRequest {
  email: string;
  password: string;
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

    const { email, password }: AdminLoginRequest = await req.json();

    // Récupérer l'administrateur
    const { data: admins, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true);

    if (error || !admins || admins.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Administrateur non trouvé ou inactif'
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
    }

    const admin = admins[0];

    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await compare(password, admin.password_hash);
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Mot de passe incorrect'
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
    }

    // Mettre à jour la dernière connexion
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        },
        message: 'Connexion admin réussie'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );

  } catch (error: any) {
    console.error('Erreur dans admin-login:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur lors de la connexion admin'
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