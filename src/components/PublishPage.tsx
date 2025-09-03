import React, { useState } from 'react';
import { ArrowLeft, Image, Upload, Gift } from 'lucide-react';

interface PublishPageProps {
  onBack: () => void;
  onPublish: (content: string, images: string[]) => void;
}

export const PublishPage: React.FC<PublishPageProps> = ({ onBack, onPublish }) => {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Simulate image upload
      const newImages = Array.from(files).map((file, index) => 
        `https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?auto=compress&cs=tinysrgb&w=400`
      );
      setSelectedImages([...selectedImages, ...newImages]);
    }
  };

  const handlePublish = () => {
    if (content.trim()) {
      onPublish(content, selectedImages);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

        {/* Photo Upload */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Télécharger des photos</h3>
          
          <div className="grid grid-cols-3 gap-3">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            
            {selectedImages.length < 9 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300">
                <Image className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Ajouter</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
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