import React, { useState } from 'react';
import { ArrowLeft, Package, Filter } from 'lucide-react';

interface ProductsPageProps {
  onBack: () => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('tous');

  const tabs = [
    { id: 'tous', label: 'Tous' },
    { id: 'normal', label: 'Normal' },
    { id: 'termine', label: 'Terminé' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 animate-slideInRight">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="mr-3 p-2 hover:bg-blue-500 rounded-full transition-all duration-300 transform hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">Mon produit</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 shadow-sm animate-fadeInDown">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fadeInUp delay-300">
        <div className="relative mb-8">
          {/* Animated 3D Box */}
          <div className="w-32 h-32 relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-green-400 rounded-xl transform rotate-12 shadow-lg"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-green-500 rounded-xl transform -rotate-6 shadow-lg"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-xl flex items-center justify-center">
              <Package className="w-16 h-16 text-white" />
            </div>
          </div>
          
          {/* Floating particles */}
          <div className="absolute -top-4 -left-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute -top-2 -right-6 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-500"></div>
          <div className="absolute -bottom-4 -right-2 w-4 h-4 bg-purple-400 rounded-full animate-bounce delay-700"></div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-500 mb-6">Vous n'avez pas encore d'investissements actifs</p>
          
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Commencer à investir
          </button>
        </div>
      </div>
    </div>
  );
};