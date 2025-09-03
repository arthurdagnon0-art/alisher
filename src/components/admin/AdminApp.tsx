import React, { useState } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './AdminUsers';
import { AdminTransactions } from './AdminTransactions';
import { AdminVIPPackages } from './AdminVIPPackages';
import { AdminStakingPlans } from './AdminStakingPlans';
import { AdminPaymentMethods } from './AdminPaymentMethods';
import { AdminDepositSubmissions } from './AdminDepositSubmissions';
import { AdminSettings } from './AdminSettings';

export const AdminApp: React.FC = () => {
  const [admin, setAdmin] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = (adminData: any) => {
    setAdmin(adminData);
    localStorage.setItem('admin', JSON.stringify(adminData));
  };

  const handleLogout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
    setCurrentPage('dashboard');
  };

  // Vérifier la session admin au chargement
  React.useEffect(() => {
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        localStorage.removeItem('admin');
      }
    }
  }, []);

  if (!admin) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard onNavigate={setCurrentPage} />;
      case 'users':
        return <AdminUsers onBack={() => setCurrentPage('dashboard')} />;
      case 'transactions':
        return <AdminTransactions onBack={() => setCurrentPage('dashboard')} />;
      case 'vip-packages':
        return <AdminVIPPackages onBack={() => setCurrentPage('dashboard')} />;
      case 'staking-plans':
        return <AdminStakingPlans onBack={() => setCurrentPage('dashboard')} />;
      case 'payment-methods':
        return <AdminPaymentMethods onBack={() => setCurrentPage('dashboard')} />;
      case 'deposit-submissions':
        return <AdminDepositSubmissions onBack={() => setCurrentPage('dashboard')} />;
      case 'settings':
        return <AdminSettings onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <AdminDashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-[8px] leading-tight text-center font-gothic">Alisher<br/>USMANOV</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Administration</h1>
                <p className="text-sm text-gray-500">Plateforme d'Investissement</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Connecté en tant que <strong>{admin.name}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'users', label: 'Utilisateurs' },
              { id: 'transactions', label: 'Transactions' },
              { id: 'vip-packages', label: 'Packages VIP' },
              { id: 'staking-plans', label: 'Plans Staking' },
              { id: 'payment-methods', label: 'Méthodes Paiement' },
              { id: 'deposit-submissions', label: 'Demandes Dépôt' },
              { id: 'settings', label: 'Paramètres' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentPage === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderCurrentPage()}
      </main>
    </div>
  );
};