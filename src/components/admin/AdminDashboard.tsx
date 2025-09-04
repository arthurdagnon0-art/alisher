import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Eye,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AdminService } from '../../services/adminService';
import { TransactionService } from '../../services/transactionService';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Charger les statistiques
      const statsResult = await AdminService.getDashboardStats();
      if (statsResult.success) {
        setStats(statsResult.data);
      }

      // Charger les transactions en attente
      const pendingResult = await AdminService.getPendingTransactions();
      if (pendingResult.success) {
        setPendingTransactions(pendingResult.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTransaction = async (transactionId: string) => {
    const result = await TransactionService.approveTransaction(transactionId, 'Approuvé depuis le dashboard');
    if (result.success) {
      alert('Transaction approuvée avec succès !');
      loadDashboardData(); // Recharger les données
    } else {
      alert('Erreur: ' + result.error);
    }
  };

  const handleRejectTransaction = async (transactionId: string) => {
    const result = await TransactionService.rejectTransaction(transactionId, 'Rejeté depuis le dashboard');
    if (result.success) {
      alert('Transaction rejetée avec succès !');
      loadDashboardData(); // Recharger les données
    } else {
      alert('Erreur: ' + result.error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrateur</h1>
        <p className="text-gray-600">Plateforme Alisher USMANOV Investment</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+{stats?.users?.new_today || 0}</span>
            <span className="text-gray-600 ml-1">aujourd'hui</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dépôts Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats?.transactions?.total_deposits || 0).toLocaleString()} FCFA
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">
              +{(stats?.transactions?.today_deposits || 0).toLocaleString()} FCFA
            </span>
            <span className="text-gray-600 ml-1">aujourd'hui</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Investissements</p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats?.investments?.total_vip || 0) + (stats?.investments?.total_staking || 0)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-purple-600 font-medium">
              {(stats?.investments?.total_vip_amount || 0).toLocaleString()} FCFA
            </span>
            <span className="text-gray-600 ml-1">total investi</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-gray-900">{pendingTransactions.length}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600 font-medium">
              {stats?.transactions?.pending_deposits || 0} dépôts
            </span>
            <span className="text-gray-600 ml-1">• {stats?.transactions?.pending_withdrawals || 0} retraits</span>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => onNavigate('users')}
          className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gestion Utilisateurs</h3>
              <p className="text-gray-600 text-sm">Voir et gérer tous les utilisateurs</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('transactions')}
          className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
              <p className="text-gray-600 text-sm">Approuver dépôts et retraits</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('vip-packages')}
          className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Packages VIP</h3>
              <p className="text-gray-600 text-sm">Gérer les niveaux VIP</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('payment-methods')}
          className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Méthodes de Paiement</h3>
              <p className="text-gray-600 text-sm">Gérer les comptes de dépôt</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('deposit-submissions')}
          className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Demandes de Dépôt</h3>
              <p className="text-gray-600 text-sm">Approuver les dépôts utilisateurs</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => onNavigate('staking-plans')}
          className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Plans Staking</h3>
              <p className="text-gray-600 text-sm">Gérer les plans de staking</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Paramètres</h3>
              <p className="text-gray-600 text-sm">Configuration de la plateforme</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </button>
      </div>

      {/* Transactions en attente */}
      {pendingTransactions.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transactions en Attente</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingTransactions.slice(0, 10).map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.users?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.users?.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'deposit' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.amount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveTransaction(transaction.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRejectTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onNavigate(`transaction/${transaction.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};