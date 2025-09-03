import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface BalanceDetailsPageProps {
  onBack: () => void;
}

interface Transaction {
  id: string;
  type: 'recharge' | 'retrait';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export const BalanceDetailsPage: React.FC<BalanceDetailsPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('tous');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTransactions([]);
      setIsLoading(false);
    };
    loadData();
  }, [activeTab]);

  const tabs = [
    { id: 'tous', label: 'Tous' },
    { id: 'recharger', label: 'Recharger' },
    { id: 'retrait', label: 'Retrait' }
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
          <h1 className="text-xl font-bold flex-1 text-center">Détails du solde</h1>
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

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {isLoading ? (
          <div className="text-center animate-fadeInUp">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        ) : (
          <div className="text-center animate-fadeInUp delay-300">
            {/* Empty State Illustration */}
            <div className="relative mb-8">
              <div className="w-32 h-32 relative animate-float">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-400 rounded-xl transform rotate-12 shadow-lg"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-500 rounded-xl transform -rotate-6 shadow-lg"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-xl flex items-center justify-center">
                  <div className="text-white text-4xl animate-bounce">📊</div>
                </div>
              </div>
              
              {/* Floating particles */}
              <div className="absolute -top-4 -left-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute -top-2 -right-6 w-2 h-2 bg-green-400 rounded-full animate-pulse delay-500"></div>
              <div className="absolute -bottom-4 -right-2 w-4 h-4 bg-purple-400 rounded-full animate-bounce delay-700"></div>
            </div>

            <h3 className="text-xl font-bold text-gray-600 mb-2">Aucun enregistrement</h3>
            <p className="text-gray-400 mb-6">No more</p>
            
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Actualiser</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};