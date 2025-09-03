import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Eye, Clock, User, Hash } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminDepositSubmissionsProps {
  onBack: () => void;
}

export const AdminDepositSubmissions: React.FC<AdminDepositSubmissionsProps> = ({ onBack }) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('deposit_submissions')
        .select(`
          *,
          users!inner(name, phone),
          payment_methods!inner(name, deposit_number, account_name),
          transactions!inner(reference, created_at)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des soumissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (submission: any) => {
    setSelectedSubmission(submission);
    setAdminNotes('');
    setShowDetailModal(true);
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;

    setIsProcessing(true);
    try {
      // Approuver la transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          processed_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.transaction_id);

      if (transactionError) throw transactionError;

      // Mettre à jour la soumission
      const { error: submissionError } = await supabase
        .from('deposit_submissions')
        .update({
          status: 'approved'
        })
        .eq('id', selectedSubmission.id);

      if (submissionError) throw submissionError;

      // Créditer le solde utilisateur
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance_deposit')
        .eq('id', selectedSubmission.user_id)
        .single();

      if (userError) throw userError;

      const { error: balanceError } = await supabase
        .from('users')
        .update({
          balance_deposit: (user.balance_deposit || 0) + selectedSubmission.amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.user_id);

      if (balanceError) throw balanceError;

      alert('Dépôt approuvé et solde crédité avec succès !');
      setShowDetailModal(false);
      loadSubmissions();
    } catch (error: any) {
      alert('Erreur lors de l\'approbation: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;

    setIsProcessing(true);
    try {
      // Rejeter la transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          processed_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.transaction_id);

      if (transactionError) throw transactionError;

      // Mettre à jour la soumission
      const { error: submissionError } = await supabase
        .from('deposit_submissions')
        .update({
          status: 'rejected'
        })
        .eq('id', selectedSubmission.id);

      if (submissionError) throw submissionError;

      alert('Dépôt rejeté avec succès !');
      setShowDetailModal(false);
      loadSubmissions();
    } catch (error: any) {
      alert('Erreur lors du rejet: ' + error.message);
    } finally {
      setIsProcessing(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Demandes de Dépôt</h1>
            <p className="text-gray-600">Approuver ou rejeter les demandes de dépôt</p>
          </div>
        </div>
        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
          {submissions.length} en attente
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande en attente</h3>
            <p className="text-gray-500">Toutes les demandes de dépôt ont été traitées</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro Utilisateur
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
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {submission.users?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.users?.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {submission.payment_methods?.name}
                      </div>
                      <div className="text-sm text-gray-500 font-mono">
                        {submission.payment_methods?.deposit_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-blue-600">
                      {submission.amount.toLocaleString()} FCFA
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {submission.user_deposit_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(submission.created_at).toLocaleDateString('fr-FR')}
                    <div className="text-xs text-gray-400">
                      {new Date(submission.created_at).toLocaleTimeString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(submission)}
                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                      title="Voir détails et traiter"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Détails de la Demande de Dépôt</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Informations Utilisateur */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Informations Utilisateur
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nom:</span>
                    <span className="font-medium">{selectedSubmission.users?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Téléphone:</span>
                    <span className="font-medium">{selectedSubmission.users?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Numéro de Dépôt:</span>
                    <span className="font-mono font-medium">{selectedSubmission.user_deposit_number}</span>
                  </div>
                </div>
              </div>

              {/* Informations de Paiement */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Hash className="w-5 h-5 mr-2 text-green-600" />
                  Informations de Paiement
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Méthode:</span>
                    <span className="font-medium">{selectedSubmission.payment_methods?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compte Destinataire:</span>
                    <span className="font-medium">{selectedSubmission.payment_methods?.account_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Numéro Destinataire:</span>
                    <span className="font-mono font-medium">{selectedSubmission.payment_methods?.deposit_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant:</span>
                    <span className="font-bold text-blue-600">
                      {selectedSubmission.amount.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Admin */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes Administrateur (Optionnel)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ajouter des notes sur cette transaction..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <XCircle className="w-5 h-5" />
                <span>{isProcessing ? 'Traitement...' : 'Rejeter'}</span>
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{isProcessing ? 'Traitement...' : 'Approuver'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};