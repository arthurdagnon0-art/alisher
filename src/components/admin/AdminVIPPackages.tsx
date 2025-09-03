import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Crown, DollarSign } from 'lucide-react';
import { supabaseAdmin } from '../../lib/supabase';

interface VIPPackage {
  id: string;
  name: string;
  min_amount: number;
  max_amount: number;
  daily_rate: number;
  is_active: boolean;
  created_at: string;
}

interface AdminVIPPackagesProps {
  onBack: () => void;
}

export const AdminVIPPackages: React.FC<AdminVIPPackagesProps> = ({ onBack }) => {
  const [packages, setPackages] = useState<VIPPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<VIPPackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    min_amount: '',
    max_amount: '',
    daily_rate: '',
    is_active: true
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('vip_packages')
        .select('*')
        .order('min_amount', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des packages VIP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      min_amount: '',
      max_amount: '',
      daily_rate: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (pkg: VIPPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      min_amount: pkg.min_amount.toString(),
      max_amount: pkg.max_amount.toString(),
      daily_rate: pkg.daily_rate.toString(),
      is_active: pkg.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const packageData = {
        name: formData.name,
        min_amount: parseFloat(formData.min_amount),
        max_amount: parseFloat(formData.max_amount),
        daily_rate: parseFloat(formData.daily_rate),
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingPackage) {
        // Mise à jour
        const { error } = await supabaseAdmin
          .from('vip_packages')
          .update(packageData)
          .eq('id', editingPackage.id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabaseAdmin
          .from('vip_packages')
          .insert({
            ...packageData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      setShowModal(false);
      loadPackages();
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce package VIP ?')) {
      return;
    }

    try {
      const { error } = await supabaseAdmin
        .from('vip_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPackages();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabaseAdmin
        .from('vip_packages')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      loadPackages();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Packages VIP</h1>
            <p className="text-gray-600">Gérer les niveaux d'investissement VIP</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Package</span>
        </button>
      </div>

      {/* Packages List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Package
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant Min/Max
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Taux Quotidien
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
            {packages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <Crown className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                      <div className="text-sm text-gray-500">Package VIP</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {pkg.min_amount.toLocaleString()} - {pkg.max_amount.toLocaleString()} FCFA
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">
                    {pkg.daily_rate}% / jour
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleStatus(pkg.id, pkg.is_active)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                      pkg.is_active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {pkg.is_active ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingPackage ? 'Modifier Package VIP' : 'Nouveau Package VIP'}
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Package
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VIP0, VIP1, etc."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant Minimum (FCFA)
                  </label>
                  <input
                    type="number"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant Maximum (FCFA)
                  </label>
                  <input
                    type="number"
                    value={formData.max_amount}
                    onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux Quotidien (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.daily_rate}
                  onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Package actif
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Sauvegarde...' : editingPackage ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};