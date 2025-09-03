import React from 'react';
import { Home, TrendingUp, Users, CreditCard, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'invest', label: 'Investir', icon: TrendingUp },
    { id: 'invite', label: 'Invite', icon: Users },
    { id: 'billet', label: 'Billet', icon: CreditCard },
    { id: 'account', label: 'Compte', icon: User },
  ];

  return (
    <div className="fixed text-serif bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom shadow-lg">
      <div className="flex items-center justify-around py-1 xxs:py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-1 xxs:py-2 px-1 xxs:px-2 xs:px-3 transition-colors duration-200 min-w-0 ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <tab.icon className={`w-5 h-5 xxs:w-6 xxs:h-6 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`text-[10px] xxs:text-xs leading-tight ${isActive ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};