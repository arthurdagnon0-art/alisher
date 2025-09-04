import { supabase } from '../lib/supabase';

export class ImageService {
  // Uploader une image vers Supabase Storage
  static async uploadImage(file: File, userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Vérifier que userId est fourni et valide
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw new Error('ID utilisateur requis pour l\'upload');
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('L\'image ne doit pas dépasser 5MB');
      }

      // Générer un nom unique pour le fichier
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Uploader vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName);

      return {
        success: true,
        url: publicUrl
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'upload de l\'image'
      };
    }
  }

  // Uploader plusieurs images
  static async uploadMultipleImages(files: FileList, userId: string): Promise<{ success: boolean; urls?: string[]; error?: string }> {
    try {
      const uploadPromises = Array.from(files).map(file => this.uploadImage(file, userId));
      const results = await Promise.all(uploadPromises);

      // Vérifier si toutes les uploads ont réussi
      const failedUploads = results.filter(result => !result.success);
      if (failedUploads.length > 0) {
        throw new Error(`Échec de l'upload de ${failedUploads.length} image(s)`);
      }

      const urls = results.map(result => result.url!);

      return {
        success: true,
        urls
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'upload des images'
      };
    }
  }

  // Supprimer une image
  static async deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Extraire le chemin du fichier depuis l'URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const userId = urlParts[urlParts.length - 2];
      const filePath = `${userId}/${fileName}`;

      const { error } = await supabase.storage
        .from('blog-images')
        .remove([filePath]);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la suppression de l\'image'
      };
    }
  }
}