import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Eye, UserCheck, UserX } from 'lucide-react';
import { AdminService } from '../../services/adminService';

interface AdminUsersProps {
  onBack: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ onBack }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    is_active: '',
    is_blocked: ''
  });

  useEffect(() => {
    loadUsers();
  }, [searchTerm, filters]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = await AdminService.getUsers({
        search: searchTerm,
        country: filters.country || undefined,
        is_active: filters.is_active ? filters.is_active === 'true' : undefined,
        is_blocked: filters.is_blocked ? filters.is_blocked === 'true' : undefined
      });

      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, field: 'is_active' | 'is_blocked', currentValue: boolean) => {
    try {
      const result = await AdminService.updateUser(userId, {
        [field]: !currentValue
      });

      if (result.success) {
        loadUsers();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-gray-600">Gérer tous les utilisateurs de la plateforme</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filters.country}
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous les pays</option>
            <option value="BJ">Bénin</option>
            <option value="TG">Togo</option>
            <option value="CI">Côte d'Ivoire</option>
            <option value="CM">Cameroun</option>
          </select>

          <select
            value={filters.is_active}
            onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </select>

          <select
            value={filters.is_blocked}
            onChange={(e) => setFilters({ ...filters, is_blocked: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous</option>
            <option value="false">Non bloqués</option>
            <option value="true">Bloqués</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
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
                  Pays
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Soldes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Investi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                      <div className="text-xs text-gray-400">Code: {user.referral_code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-green-600">Dépôt: {user.balance_deposit?.toLocaleString()} FCFA</div>
                      <div className="text-blue-600">Retrait: {user.balance_withdrawal?.toLocaleString()} FCFA</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                    {user.total_invested?.toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      {user.is_blocked && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Bloqué
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleUserStatus(user.id, 'is_active', user.is_active)}
                        className={`p-1 rounded hover:bg-opacity-20 ${
                          user.is_active ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'
                        }`}
                        title={user.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
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