import React, { useState } from 'react';
import { AdminApp } from './components/admin/AdminApp';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { SetupAccountPage } from './components/SetupAccountPage';
import { Dashboard } from './components/Dashboard';
import { InvestmentsList } from './components/InvestmentsList';
import { InvitePage } from './components/InvitePage';
import { AccountPage } from './components/AccountPage';
import { BilletPage } from './components/BilletPage';
import { RechargePage } from './components/RechargePage';
import { WithdrawPage } from './components/WithdrawPage';
import { PaymentPage } from './components/PaymentPage';
import { BankCardPage } from './components/BankCardPage';
import { TeamPage } from './components/TeamPage';
import { ProductsPage } from './components/ProductsPage';
import { VIPLevelsPage } from './components/VIPLevelsPage';
import { HelpCenterPage } from './components/HelpCenterPage';
import { BottomNavigation } from './components/BottomNavigation';
import { ProductProgressPage } from './components/ProductProgressPage';
import { AboutUsPage } from './components/AboutUsPage';
import { SettingsPage } from './components/SettingsPage';
import { BalanceDetailsPage } from './components/BalanceDetailsPage';
import { TelegramPage } from './components/TelegramPage';
import { supabase } from './lib/supabase';

function App() {
  // Vérifier si on est sur la route admin
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  // Récupérer le code de parrainage depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const invitationCode = urlParams.get('invitation_code') || '';
  
  if (isAdminRoute) {
    return <AdminApp />;
  }

  const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSetupAccount, setShowSetupAccount] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleRegister = async (phone: string, password: string, name: string, inviteCode: string, otp: string, country: string) => {
    try {
      await register(phone, password, name, inviteCode, otp, country);
      // Vérifier si l'utilisateur a besoin de configurer son mot de passe de transaction
      const tempUser = localStorage.getItem('tempUser');
      if (tempUser) {
        setShowSetupAccount(true);
      }
    } catch (error) {
      console.error('Erreur inscription:', error);
      // L'erreur sera gérée par le composant RegisterForm
    }
  };

  const handleSetupComplete = (transactionPassword: string, nickname: string) => {
    // Récupérer l'utilisateur temporaire et finaliser l'inscription
    const tempUser = localStorage.getItem('tempUser');
    if (tempUser) {
      const userData = JSON.parse(tempUser);
      const updatedUser = {
        ...userData,
        name: nickname,
        transaction_password_hash: true // Indiquer que le mot de passe est configuré
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.removeItem('tempUser');
      // Forcer le rechargement de la page pour actualiser l'état d'authentification
      window.location.reload();
    }
    setShowSetupAccount(false);
  };

  // Fonction pour rafraîchir les données utilisateur globalement
  const refreshUserData = async () => {
    if (!user?.id) return;
    
    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && updatedUser) {
        const formattedUser = {
          id: updatedUser.id,
          phone: updatedUser.phone,
          email: updatedUser.email,
          name: updatedUser.name,
          country: updatedUser.country,
          balance_deposit: updatedUser.balance_deposit || 0,
          balance_withdrawal: updatedUser.balance_withdrawal || 0,
          total_invested: updatedUser.total_invested || 0,
          referral_code: updatedUser.referral_code,
          referred_by: updatedUser.referred_by,
          is_active: updatedUser.is_active,
          is_blocked: updatedUser.is_blocked,
          created_at: updatedUser.created_at,
        };
        
        localStorage.setItem('user', JSON.stringify(formattedUser));
        // Forcer le rechargement pour mettre à jour tous les composants
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement global:', error);
    }
  };

  // Rafraîchir automatiquement toutes les 60 secondes si authentifié
  React.useEffect(() => {
    if (isAuthenticated && user?.id) {
      const interval = setInterval(refreshUserData, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated) {
    if (showSetupAccount) {
      return (
        <SetupAccountPage onComplete={handleSetupComplete} />
      );
    }
    
    return isRegistering ? (
      <RegisterForm
        onRegister={handleRegister}
        onSwitchToLogin={() => setIsRegistering(false)}
        initialInviteCode={invitationCode}
      />
    ) : (
      <LoginForm
        onLogin={login}
        onSwitchToRegister={() => setIsRegistering(true)}
      />
    );
  }

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    if (page === 'dashboard') setActiveTab('home');
    if (page === 'investments') setActiveTab('invest');
    if (page === 'invite') setActiveTab('invite');
    if (page === 'billet') setActiveTab('billet');
    if (page === 'account') setActiveTab('account');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} onNavigate={handleNavigation} />;
      case 'investments':
        return <InvestmentsList user={user} onBack={() => handleNavigation('dashboard')} />;
      case 'invite':
        return <InvitePage user={user} onBack={() => handleNavigation('dashboard')} />;
      case 'billet':
        return <BilletPage user={user} onBack={() => handleNavigation('dashboard')} />;
      case 'account':
        return <AccountPage user={user} onLogout={logout} onNavigate={handleNavigation} onBack={() => handleNavigation('dashboard')} />;
      case 'recharge':
        return <RechargePage user={user} onBack={() => handleNavigation('dashboard')} />;
      case 'withdraw':
        return <WithdrawPage user={user} onBack={() => handleNavigation('dashboard')} />;
      case 'bankcard':
        return <BankCardPage onBack={() => handleNavigation('account')} />;
      case 'team':
        return <TeamPage user={user} onBack={() => handleNavigation('account')} />;
      case 'products':
        return <ProductsPage onBack={() => handleNavigation('account')} />;
      case 'product-progress':
        return <ProductProgressPage onBack={() => handleNavigation('account')} />;
      case 'vip':
        return <VIPLevelsPage onBack={() => handleNavigation('account')} />;
      case 'help':
        return <HelpCenterPage onBack={() => handleNavigation('account')} />;
      case 'about':
        return <AboutUsPage onBack={() => handleNavigation('account')} />;
      case 'settings':
        return <SettingsPage user={user} onBack={() => handleNavigation('account')} />;
      case 'balance-details':
        return <BalanceDetailsPage onBack={() => handleNavigation('account')} />;
      case 'telegram':
        return <TelegramPage onBack={() => handleNavigation('account')} />;
      default:
        return <Dashboard user={user} onNavigate={handleNavigation} />;
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard user={user} onNavigate={handleNavigation} />;
      case 'invest':
        return <InvestmentsList />;
      case 'invite':
        return <InvitePage user={user} />;
      case 'billet':
        return <BilletPage user={user} />;
      case 'account':
        return <AccountPage user={user} onLogout={logout} onNavigate={handleNavigation} />;
      default:
        return <Dashboard user={user} onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="relative">
      {!['dashboard', 'investments', 'invite', 'billet', 'account'].includes(currentPage) ? (
        renderCurrentPage()
      ) : (
        renderActiveTab()
      )}
      {['dashboard', 'investments', 'invite', 'billet', 'account'].includes(currentPage) && (
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}

export default App;