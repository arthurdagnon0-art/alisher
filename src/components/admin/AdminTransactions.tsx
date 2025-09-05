import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import { AdminService } from '../../services/adminService';
import { TransactionService } from '../../services/transactionService';

interface AdminTransactionsProps {
  onBack: () => void;
}

export const AdminTransactions: React.FC<AdminTransactionsProps> = ({ onBack }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const result = await AdminService.getPendingTransactions(
        filter === 'all' ? undefined : filter as 'deposit' | 'withdrawal'
      );

      if (result.success) {
        setTransactions(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (transactionId: string) => {
    try {
      const result = await TransactionService.approveTransaction(transactionId);
      if (result.success) {
        alert('Transaction approuvée avec succès !');
      } else {
        alert('Erreur: ' + result.error);
      }
      loadTransactions();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const handleReject = async (transactionId: string) => {
    try {
      const notes = prompt('Notes de rejet (optionnel):');
      const result = await TransactionService.rejectTransaction(transactionId);
      if (result.success) {
        alert('Transaction rejetée avec succès !');
      } else {
        alert('Erreur: ' + result.error);
      }
      loadTransactions();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Transactions</h1>
            <p className="text-gray-600">Approuver ou rejeter les dépôts et retraits</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          {[
            { id: 'pending', label: 'En Attente' },
            { id: 'deposit', label: 'Dépôts' },
            { id: 'withdrawal', label: 'Retraits' },
            { id: 'all', label: 'Toutes' }
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === filterOption.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
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
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.users?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.users?.phone}
                      </div>
                      {/* Afficher la carte bancaire pour les retraits */}
                      {transaction.type === 'withdrawal' && transaction.bank_card && (
                        <div className="text-xs text-blue-600 mt-1 p-2 bg-blue-50 rounded">
                          <p><strong>Carte:</strong> {transaction.bank_card.wallet_type.replace('_', ' ').toUpperCase()}</p>
                          <p><strong>Titulaire:</strong> {transaction.bank_card.card_holder_name}</p>
                          <p><strong>Numéro:</strong> {transaction.bank_card.card_number}</p>
                        </div>
                      )}
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
                    {transaction.fees > 0 && (
                      <div className="text-xs text-gray-500">
                        Frais: {transaction.fees.toLocaleString()} FCFA
                      </div>
                    )}
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
                        onClick={() => handleApprove(transaction.id)}
                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                        title="Approuver"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(transaction.id)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                        title="Rejeter"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title="Voir détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};