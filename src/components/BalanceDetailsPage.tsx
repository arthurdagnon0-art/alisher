import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { TransactionService } from '../services/transactionService';

interface BalanceDetailsPageProps {
  onBack: () => void;
  user?: any;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'earning' | 'referral';
  method?: string;
  amount: number;
  fees: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reference?: string;
  admin_notes?: string;
  created_at: string;
  processed_at?: string;
}

export const BalanceDetailsPage: React.FC<BalanceDetailsPageProps> = ({ onBack, user }) => {
  const [activeTab, setActiveTab] = useState('tous');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(user);

  // Récupérer les données utilisateur depuis localStorage si pas fourni
  useEffect(() => {
    if (!currentUser) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setCurrentUser(userData);
        } catch (error) {
          console.error('Erreur parsing user data:', error);
        }
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.id) {
      loadTransactions();
    }
  }, [activeTab, currentUser?.id]);

  const loadTransactions = async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      let typeFilter;
      if (activeTab === 'recharger') typeFilter = 'deposit';
      else if (activeTab === 'retrait') typeFilter = 'withdrawal';
      
      const result = await TransactionService.getUserTransactions(currentUser.id, typeFilter, 100);
      
      if (result.success) {
        setTransactions(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement des transactions');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors du chargement des transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'withdrawal':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'investment':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'earning':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case 'referral':
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'approved':
        return 'Approuvé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Dépôt';
      case 'withdrawal':
        return 'Retrait';
      case 'investment':
        return 'Investissement';
      case 'earning':
        return 'Revenus';
      case 'referral':
        return 'Commission';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const tabs = [
    { id: 'tous', label: 'Tous' },
    { id: 'recharger', label: 'Recharger' },
    { id: 'retrait', label: 'Retrait' }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'tous') return true;
    if (activeTab === 'recharger') return ['deposit', 'earning', 'referral'].includes(transaction.type);
    if (activeTab === 'retrait') return transaction.type === 'withdrawal';
    return true;
  });

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
          <h1 className="text-xl font-bold flex-1 text-center">Mon Solde</h1>
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
      <div className="p-2 xxs:p-3 xs:p-4 pb-20 xxs:pb-24">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 xxs:p-4 mb-3 xxs:mb-4">
            <p className="text-red-600 text-xs xxs:text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 xxs:py-12 animate-fadeInUp">
            <div className="w-12 h-12 xxs:w-16 xxs:h-16 border-3 xxs:border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3 xxs:mb-4"></div>
            <p className="text-gray-600 text-sm xxs:text-base">Chargement des transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8 xxs:py-12 animate-fadeInUp delay-300">
            {/* Empty State Illustration */}
            <div className="relative mb-4 xxs:mb-6 xs:mb-8 flex justify-center">
              <div className="w-20 h-20 xxs:w-24 xxs:h-24 xs:w-32 xs:h-32 relative animate-float">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-400 rounded-xl transform rotate-12 shadow-lg"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-500 rounded-xl transform -rotate-6 shadow-lg"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-xl flex items-center justify-center">
                  <div className="text-white text-2xl xxs:text-3xl xs:text-4xl animate-bounce">📊</div>
                </div>
              </div>
              
              {/* Floating particles */}
              <div className="absolute -top-2 xxs:-top-4 -left-2 xxs:-left-4 w-2 h-2 xxs:w-3 xxs:h-3 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute -top-1 xxs:-top-2 -right-3 xxs:-right-6 w-1.5 h-1.5 xxs:w-2 xxs:h-2 bg-green-400 rounded-full animate-pulse delay-500"></div>
              <div className="absolute -bottom-2 xxs:-bottom-4 -right-1 xxs:-right-2 w-3 h-3 xxs:w-4 xxs:h-4 bg-purple-400 rounded-full animate-bounce delay-700"></div>
            </div>

            <div className="px-4 xxs:px-6">
              <h3 className="text-lg xxs:text-xl font-bold text-gray-600 mb-2">Aucun enregistrement</h3>
              <p className="text-sm xxs:text-base text-gray-400 mb-4 xxs:mb-6 leading-relaxed">
                {activeTab === 'tous' ? 'Aucune transaction trouvée' :
                 activeTab === 'recharger' ? 'Aucun dépôt ou revenu trouvé' :
                 'Aucun retrait trouvé'}
              </p>
            </div>
            
            <button 
              onClick={loadTransactions}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 xxs:px-6 xs:px-8 py-2 xxs:py-3 rounded-lg xxs:rounded-xl font-medium xxs:font-semibold text-sm xxs:text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-1 xxs:space-x-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4 xxs:w-5 xxs:h-5" />
              <span>Actualiser</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 xxs:space-y-3">
            {filteredTransactions.map((transaction, index) => (
              <div 
                key={transaction.id} 
                className="bg-white rounded-lg p-3 xxs:p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 xxs:space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 xxs:w-10 xxs:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {getTransactionIcon(transaction)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 text-sm xxs:text-base truncate">{getTypeText(transaction.type)}</p>
                        {getStatusIcon(transaction.status)}
                      </div>
                      <p className="text-xs xxs:text-sm text-gray-500 truncate">
                        {transaction.method && `${transaction.method.toUpperCase()} • `}
                        {formatDate(transaction.created_at).date} à {formatDate(transaction.created_at).time}
                      </p>
                      {transaction.reference && (
                        <p className="text-[10px] xxs:text-xs text-gray-400 font-mono truncate">Réf: {transaction.reference}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className={`font-bold text-base xxs:text-lg ${
                      ['deposit', 'earning', 'referral'].includes(transaction.type) 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {['deposit', 'earning', 'referral'].includes(transaction.type) ? '+' : '-'}
                      <span className="hidden xxs:inline">FCFA</span><span className="xxs:hidden">F</span>{transaction.amount.toLocaleString()}
                    </p>
                    {transaction.fees > 0 && (
                      <p className="text-[10px] xxs:text-xs text-orange-600">
                        Frais: {transaction.fees.toLocaleString()}<span className="hidden xxs:inline"> FCFA</span>
                      </p>
                    )}
                    <div className="flex items-center justify-end space-x-0.5 xxs:space-x-1 mt-1">
                      {getStatusIcon(transaction.status)}
                      <span className={`text-xs font-medium ${
                        transaction.status === 'completed' || transaction.status === 'approved' ? 'text-green-600' :
                        transaction.status === 'pending' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {getStatusText(transaction.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {transaction.admin_notes && (
                  <div className="mt-2 xxs:mt-3 p-2 xxs:p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-blue-700">
                      <strong>Note admin:</strong> {transaction.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};