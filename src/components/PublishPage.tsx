import React, { useState } from 'react';
import { ArrowLeft, Image, Upload, Gift } from 'lucide-react';
import { ImageService } from '../services/imageService';

interface PublishPageProps {
  onBack: () => void;
  onPublish: (content: string, images: string[]) => void;
  user: any;
}

export const PublishPage: React.FC<PublishPageProps> = ({ onBack, onPublish, user }) => {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [currentUser, setCurrentUser] = useState(user);

  // Récupérer les données utilisateur depuis localStorage
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
        console.log('👤 Utilisateur récupéré:', userData);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
      }
    }
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Vérifier que l'utilisateur est connecté
      if (!currentUser?.id) {
        setUploadError('Erreur: Données utilisateur non trouvées. Veuillez vous reconnecter.');
        console.error('❌ User ID manquant:', { user, currentUser });
        return;
      }

      console.log('📤 Début upload pour utilisateur:', currentUser.id);
      setIsUploading(true);
      setUploadError('');
      
      try {
        // Uploader les vraies images vers Supabase Storage
        const result = await ImageService.uploadMultipleImages(files, currentUser.id);
        
        if (result.success && result.urls) {
          setSelectedImages([...selectedImages, ...result.urls]);
          console.log('✅ Images uploadées:', result.urls);
        } else {
          setUploadError(result.error || 'Erreur lors de l\'upload');
          console.error('❌ Erreur upload:', result.error);
        }
      } catch (error: any) {
        setUploadError(error.message || 'Erreur lors de l\'upload');
        console.error('❌ Exception upload:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = selectedImages[index];
    
    // Supprimer de Supabase Storage
    await ImageService.deleteImage(imageUrl);
    
    // Supprimer de la liste locale
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };
  const handlePublish = () => {
    if (content.trim()) {
      onPublish(content, selectedImages);
    }
  };

  // Debug: Afficher les infos utilisateur
  console.log('🔍 Debug PublishPage:', { 
    userProp: user, 
    currentUser, 
    hasUserId: !!currentUser?.id 
  });

  return (
    <div className="min-h-screen bg-gray-50 mb-28">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Publier</h1>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Content Input */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Contenu</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Veuillez entrer le contenu"
            rows={6}
            className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        

        {/* Publish Button */}
        <div className="space-y-4">
          {/* Bonus Info */}
          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
            <div className="flex items-center space-x-3">
              <Gift className="w-6 h-6 text-green-600 animate-bounce" />
              <div>
                <h4 className="text-green-800 font-semibold">Bonus de Publication</h4>
                <p className="text-sm text-green-700">
                  Recevez automatiquement <strong>100 FCFA</strong> pour chaque post publié !
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handlePublish}
            disabled={!content.trim()}
            className="w-full bg-green-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            <span>Publier & Gagner 100 FCFA</span>
            <Gift className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};