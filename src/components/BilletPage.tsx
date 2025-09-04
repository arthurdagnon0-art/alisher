import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, MessageCircle, Heart, Share2 } from 'lucide-react';
import { PublishPage } from './PublishPage';
import { RewardsModal } from './RewardsModal';
import { BlogService } from '../services/blogService';

interface BilletPageProps {
  user: any;
  onBack?: () => void;
}

export const BilletPage: React.FC<BilletPageProps> = ({ user, onBack }) => {
  const [showPublishPage, setShowPublishPage] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger tous les posts au montage du composant
  React.useEffect(() => {
    loadAllPosts();
  }, []);

  const loadAllPosts = async () => {
    setIsLoading(true);
    try {
      const result = await BlogService.getAllPosts();
      if (result.success) {
        setPosts(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement des posts');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors du chargement des posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (content: string, images: string[]) => {
    try {
      const result = await BlogService.createPost(user?.id, content, images);
      
      if (result.success) {
        // Afficher le message de succès avec bonus
        alert(result.message);
        
        // Recharger les posts pour afficher le nouveau
        await loadAllPosts();
        
        // Mettre à jour le solde utilisateur localement
        if (user && result.data?.bonus) {
          const updatedUser = {
            ...user,
            balance_withdrawal: (user.balance_withdrawal || 0) + result.data.bonus,
            total_earned: (user.total_earned || 0) + result.data.bonus
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } else {
        alert(result.error || 'Erreur lors de la publication');
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la publication');
    }
  };

  if (showPublishPage) {
    return (
      <PublishPage
        onBack={() => setShowPublishPage(false)}
        onPublish={handlePublish}
      />
    );
  }

  return (
    <div className="min-h-screen bg-blue-600 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center">
          {onBack && (
            <button onClick={onBack} className="mr-3">
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold flex-1 text-center">Blog</h1>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setShowPublishPage(true)}
            className="bg-blue-500 bg-opacity-60 text-white rounded-lg p-4 flex items-center justify-between hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-white">📝</span>
              </div>
              <div className="text-left">
                <p className="font-medium">Publier</p>
                <p className="text-sm opacity-90">Aller publier</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>

          <button className="bg-orange-500 bg-opacity-60 text-white rounded-lg p-4 flex items-center justify-between hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-white">📋</span>
              </div>
              <div className="text-left">
                <p className="font-medium">Règles</p>
                <p className="text-sm opacity-90">Explication des règles</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Posts Section */}
      <div className="px-4 mt-6 space-y-4 pb-24">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-600 mb-2">Aucun post publié</h3>
            <p className="text-gray-500 mb-4">Soyez le premier à partager votre expérience !</p>
            <button
              onClick={() => setShowPublishPage(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Publier Maintenant
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg p-4 shadow-sm animate-slideIn hover:shadow-md transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{post.users?.name?.charAt(0) || 'U'}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{post.users?.name || 'Utilisateur'}</p>
                  <p className="text-sm text-gray-500">
                    {post.users?.phone ? `${post.users.phone.substring(0, 3)}****${post.users.phone.slice(-3)}` : 'Téléphone masqué'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleDateString('fr-FR')} à {new Date(post.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            
              <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>
            
              {/* Screenshots */}
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {post.images.map((image: string, index: number) => (
                    <div key={index} className="bg-gray-900 rounded-lg aspect-[3/4] overflow-hidden relative group">
                      <img 
                        src={image} 
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50"></div>
                      <div className="absolute bottom-2 left-2 text-white text-xs z-10">
                        <div className="mb-1">📱</div>
                        <div>Screenshot {index + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">J'aime</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">Commenter</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Partager</span>
                  </button>
                </div>
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  +100 FCFA
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rewards Section */}
      <div className="px-4 mt-6">
        <div 
          onClick={() => setShowRewardsModal(true)}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-2xl">🎁</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">Récompenses Spéciales!</p>
              <p className="text-sm opacity-90">Partagez vos captures pour gagner</p>
            </div>
          </div>
        </div>
      </div>

      <RewardsModal 
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
      />
    </div>
  );
};