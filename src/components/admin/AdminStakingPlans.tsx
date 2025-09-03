import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Clock, Zap } from 'lucide-react';
import { supabaseAdmin } from '../../lib/supabase';

interface StakingPlan {
  id: string;
  name: string;
  duration_days: number;
  daily_rate: number;
  min_amount: number;
  is_active: boolean;
  created_at: string;
}

interface AdminStakingPlansProps {
  onBack: () => void;
}

export const AdminStakingPlans: React.FC<AdminStakingPlansProps> = ({ onBack }) => {
  const [plans, setPlans] = useState<StakingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StakingPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration_days: '',
    daily_rate: '',
    min_amount: '',
    is_active: true
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('staking_plans')
        .select('*')
        .order('duration_days', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des plans staking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      duration_days: '',
      daily_rate: '',
      min_amount: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (plan: StakingPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      duration_days: plan.duration_days.toString(),
      daily_rate: plan.daily_rate.toString(),
      min_amount: plan.min_amount.toString(),
      is_active: plan.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const planData = {
        name: formData.name,
        duration_days: parseInt(formData.duration_days),
        daily_rate: parseFloat(formData.daily_rate),
        min_amount: parseFloat(formData.min_amount),
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingPlan) {
        // Mise à jour
        const { error } = await supabaseAdmin
          .from('staking_plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabaseAdmin
          .from('staking_plans')
          .insert({
            ...planData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      setShowModal(false);
      loadPlans();
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plan de staking ?')) {
      return;
    }

    try {
      const { error } = await supabaseAdmin
        .from('staking_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPlans();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabaseAdmin
        .from('staking_plans')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      loadPlans();
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
            <h1 className="text-2xl font-bold text-gray-900">Plans de Staking</h1>
            <p className="text-gray-600">Gérer les plans d'investissement à durée fixe</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Plan</span>
        </button>
      </div>

      {/* Plans List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durée
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Taux Quotidien
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant Min
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
            {plans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                      <div className="text-sm text-gray-500">Plan de Staking</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-sm text-gray-900">{plan.duration_days} jours</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">
                    {plan.daily_rate}% / jour
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {plan.min_amount.toLocaleString()} FCFA
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleStatus(plan.id, plan.is_active)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                      plan.is_active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {plan.is_active ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
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
              {editingPlan ? 'Modifier Plan Staking' : 'Nouveau Plan Staking'}
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Plan
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Plan 30 jours"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (jours)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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
              </div>

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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Plan actif
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
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Sauvegarde...' : editingPlan ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};