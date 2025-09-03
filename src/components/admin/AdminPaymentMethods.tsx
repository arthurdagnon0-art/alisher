import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, CreditCard, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { supportedCountries } from '../../data/investments';

interface PaymentMethod {
  id: string;
  name: string;
  country: string;
  deposit_number: string;
  account_name: string;
  min_deposit: number;
  deposit_fee: number;
  withdrawal_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminPaymentMethodsProps {
  onBack: () => void;
}

export const AdminPaymentMethods: React.FC<AdminPaymentMethodsProps> = ({ onBack }) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    deposit_number: '',
    account_name: '',
    min_deposit: '3000',
    deposit_fee: '0',
    withdrawal_enabled: true,
    is_active: true
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setMethods(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des méthodes de paiement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMethod(null);
    setFormData({
      name: '',
      deposit_number: '',
      account_name: '',
      min_deposit: '3000',
      deposit_fee: '0',
      withdrawal_enabled: true,
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      deposit_number: method.deposit_number,
      account_name: method.account_name,
      min_deposit: method.min_deposit.toString(),
      deposit_fee: method.deposit_fee.toString(),
      withdrawal_enabled: method.withdrawal_enabled,
      is_active: method.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const methodData = {
        name: formData.name,
        country: formData.country,
        deposit_number: formData.deposit_number,
        account_name: formData.account_name,
        min_deposit: parseFloat(formData.min_deposit),
        deposit_fee: parseFloat(formData.deposit_fee),
        withdrawal_enabled: formData.withdrawal_enabled,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingMethod) {
        // Mise à jour
        const { error } = await supabase
          .from('payment_methods')
          .update(methodData)
          .eq('id', editingMethod.id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from('payment_methods')
          .insert({
            ...methodData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      setShowModal(false);
      loadPaymentMethods();
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPaymentMethods();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const toggleStatus = async (id: string, field: 'is_active' | 'withdrawal_enabled', currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ 
          [field]: !currentValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      loadPaymentMethods();
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
            <h1 className="text-2xl font-bold text-gray-900">Méthodes de Paiement</h1>
            <p className="text-gray-600">Gérer les méthodes de dépôt et retrait</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle Méthode</span>
        </button>
      </div>

      {/* Methods List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {methods.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune méthode de paiement</h3>
            <p className="text-gray-500 mb-4">Créez votre première méthode de paiement</p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Créer une méthode
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Informations de Dépôt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paramètres
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
              {methods.map((method) => (
                <tr key={method.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{method.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900 font-medium">{method.account_name}</div>
                      <div className="text-gray-500 font-mono">{method.deposit_number}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900">Min: {method.min_deposit.toLocaleString()} FCFA</div>
                      <div className="text-gray-500">Frais: {method.deposit_fee}%</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => toggleStatus(method.id, 'is_active', method.is_active)}
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                          method.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {method.is_active ? <ToggleRight className="w-3 h-3 mr-1" /> : <ToggleLeft className="w-3 h-3 mr-1" />}
                        {method.is_active ? 'Actif' : 'Inactif'}
                      </button>
                      <button
                        onClick={() => toggleStatus(method.id, 'withdrawal_enabled', method.withdrawal_enabled)}
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                          method.withdrawal_enabled
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {method.withdrawal_enabled ? 'Retrait OK' : 'Dépôt seul'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(method)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(method.id)}
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
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingMethod ? 'Modifier Méthode de Paiement' : 'Nouvelle Méthode de Paiement'}
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la Méthode
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Orange Money, MTN, etc."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un pays</option>
                  {supportedCountries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {supportedCountries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de Dépôt
                  </label>
                  <input
                    type="text"
                    value={formData.deposit_number}
                    onChange={(e) => setFormData({ ...formData, deposit_number: e.target.value })}
                    placeholder="22912345678"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du Compte
                  </label>
                  <input
                    type="text"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    placeholder="ALISHER USMANOV"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant Minimum (FCFA)
                  </label>
                  <input
                    type="number"
                    value={formData.min_deposit}
                    onChange={(e) => setFormData({ ...formData, min_deposit: e.target.value })}
                    placeholder="3000"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frais de Dépôt (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.deposit_fee}
                    onChange={(e) => setFormData({ ...formData, deposit_fee: e.target.value })}
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="withdrawal_enabled"
                    checked={formData.withdrawal_enabled}
                    onChange={(e) => setFormData({ ...formData, withdrawal_enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="withdrawal_enabled" className="ml-2 text-sm text-gray-700">
                    Validité pour retrait
                  </label>
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
                    Méthode active
                  </label>
                </div>
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
                  {isSubmitting ? 'Sauvegarde...' : editingMethod ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};