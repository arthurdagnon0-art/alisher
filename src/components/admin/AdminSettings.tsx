import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import { AdminService } from '../../services/adminService';

interface AdminSettingsProps {
  onBack: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await AdminService.getPlatformSettings();
      if (result.success) {
        const settingsObj = result.data.reduce((acc: any, setting: any) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        setSettings(settingsObj);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Sauvegarder chaque paramètre
      for (const [key, value] of Object.entries(settings)) {
        await AdminService.updatePlatformSetting(key, value);
      }
      setSuccess('Paramètres sauvegardés avec succès');
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Paramètres de la Plateforme</h1>
            <p className="text-gray-600">Configurer les paramètres globaux</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {/* Settings Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Montants */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            Montants
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dépôt Minimum (FCFA)
              </label>
              <input
                type="number"
                value={settings.min_deposit || ''}
                onChange={(e) => setSettings({ ...settings, min_deposit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retrait Minimum (FCFA)
              </label>
              <input
                type="number"
                value={settings.min_withdrawal || ''}
                onChange={(e) => setSettings({ ...settings, min_withdrawal: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frais de Retrait (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.withdrawal_fee_rate || ''}
                onChange={(e) => setSettings({ ...settings, withdrawal_fee_rate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Crypto */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Configuration Crypto
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taux USDT (FCFA)
              </label>
              <input
                type="number"
                value={settings.usdt_exchange_rate || ''}
                onChange={(e) => setSettings({ ...settings, usdt_exchange_rate: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};