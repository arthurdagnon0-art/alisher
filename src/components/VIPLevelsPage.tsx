import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface VIPLevelsPageProps {
  onBack: () => void;
}

export const VIPLevelsPage: React.FC<VIPLevelsPageProps> = ({ onBack }) => {
  const vipLevels = [
    
    { level: 'V1', amount: '3000.00',amount_final:'70000.00', bgColor: 'bg-blue-200', textColor: 'text-blue-600', src:'https://i.postimg.cc/mgZdx1ZS/icon-1.png' },
    { level: 'V2', amount: '35000.00', bgColor: 'bg-blue-200', textColor: 'text-blue-600', src:'https://i.postimg.cc/nLC0r8Dj/icon-2.png' },
    { level: 'V3', amount: '150000.00', bgColor: 'bg-yellow-200', textColor: 'text-yellow-700', src:'https://i.postimg.cc/RVLPbLmF/icon-3.png' },
    { level: 'V4', amount: '450000.00', bgColor: 'bg-purple-200', textColor: 'text-purple-600', src:'https://i.postimg.cc/h4xZVq3V/icon-4.png' },
    { level: 'V5', amount: '1500000.00', bgColor: 'bg-green-200', textColor: 'text-green-600', src:'https://i.postimg.cc/dtYHBSzp/icon-5.png' },
    { level: 'V6', amount: '3500000.00', bgColor: 'bg-red-200', textColor: 'text-red-600', src:'https://i.postimg.cc/7hgB4gTK/icon-6.png' },
  ];

  return (
    <div className="min-h-screen bg-white font-gothic-italic text-xs">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="mr-3 p-2 hover:bg-blue-500 rounded-full transition-all duration-300 transform hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center tracking-wide">Niveau VIP</h1>
        </div>
      </div>

      {/* Content with individual cards */}
<div className="p-4 pt-8 space-y-6">
  {vipLevels.map((vip, index) => (
    <div
      key={vip.level}
      className="bg-white rounded-3xl p-6 mx-2 shadow-xl animate-fadeInUp hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center space-x-5">
        {/* VIP Level Icon */}
        <div className={`w-20 h-20 ${vip.bgColor} rounded-2xl flex items-center justify-center shadow-lg`}>
          <span className={`text-3xl font-black ${vip.textColor} tracking-tight font-gothic-italic`}>
            <img src = {vip.src} />
          </span>
        </div>

        {/* VIP Description */}
        <div className="flex-1">
          <p className="text-gray-800 text-lg leading-relaxed" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: '400' }}>
            Ce niveau de VIP nécessite un montant minimum d'investissement de{' '}
            <span className={`text-3xl font-gothic-italic ${vip.textColor} tracking-tight`}>
              {/* Contenu du span manquant ici, à remplir selon le besoin */}
              {vip.amount} {/* Exemple si tu veux afficher un montant */}
            </span>
          </p>
        </div>
      </div>
    </div>
  ))}
</div>

    </div>
  );
};