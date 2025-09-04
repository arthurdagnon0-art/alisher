/*
  # Créer le bucket de stockage pour les images de blog

  1. Nouveau Bucket
    - `blog-images` pour stocker les images des posts
    - Accès public en lecture
    - Upload restreint aux utilisateurs authentifiés

  2. Sécurité
    - RLS activé sur le bucket
    - Policies pour upload et lecture
*/

-- Créer le bucket pour les images de blog
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Users can upload their own images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'blog-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre la lecture publique
CREATE POLICY "Public can view blog images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Politique pour permettre la suppression par le propriétaire
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'blog-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);