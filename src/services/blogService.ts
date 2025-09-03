import { supabase } from '../lib/supabase';

export class BlogService {
  // Créer un nouveau post avec bonus automatique
  static async createPost(userId: string, content: string, images: string[] = []) {
    try {
      // Créer le post
      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .insert({
          user_id: userId,
          content,
          images,
          is_approved: true // Auto-approuvé pour l'instant
        })
        .select()
        .single();

      if (postError) throw postError;

      // Ajouter le bonus de 100 FCFA au solde de retrait
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance_withdrawal, name')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const bonusAmount = 100;
      
      // Mettre à jour le solde
      const { error: updateError } = await supabase
        .from('users')
        .update({
          balance_withdrawal: (user.balance_withdrawal || 0) + bonusAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Créer la transaction de bonus
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'earning',
          amount: bonusAmount,
          status: 'completed',
          reference: `BLOG-BONUS-${post.id.substring(0, 8)}`,
          admin_notes: 'Bonus automatique pour publication de post'
        });

      return {
        success: true,
        data: {
          post,
          bonus: bonusAmount
        },
        message: `Post publié avec succès ! Bonus de ${bonusAmount} FCFA ajouté à votre solde.`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la publication du post'
      };
    }
  }

  // Récupérer tous les posts approuvés (visibles pour tous)
  static async getAllPosts(limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          content,
          images,
          created_at,
          users!inner(name, phone)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Posts récupérés avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des posts'
      };
    }
  }

  // Récupérer les posts d'un utilisateur spécifique
  static async getUserPosts(userId: string) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Posts utilisateur récupérés avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la récupération des posts utilisateur'
      };
    }
  }

  // Supprimer un post (admin ou propriétaire)
  static async deletePost(postId: string, userId?: string) {
    try {
      let query = supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      // Si userId fourni, vérifier que c'est le propriétaire
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;

      if (error) throw error;

      return {
        success: true,
        message: 'Post supprimé avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la suppression du post'
      };
    }
  }

  // Approuver/Désapprouver un post (admin)
  static async moderatePost(postId: string, isApproved: boolean, adminNotes?: string) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          is_approved: isApproved,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;

      return {
        success: true,
        message: `Post ${isApproved ? 'approuvé' : 'désapprouvé'} avec succès`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la modération du post'
      };
    }
  }
}