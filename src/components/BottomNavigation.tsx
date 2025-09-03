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
    <div
      className="
        fixed sm:static
        bottom-0 left-0 right-0 sm:top-0 sm:left-0 sm:h-screen sm:w-20
        bg-white border-t sm:border-t-0 sm:border-r border-gray-200
        z-50 shadow-lg flex sm:flex-col
      "
    >
      <div className="flex sm:flex-col items-center justify-around sm:justify-start py-1 sm:py-4 w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center sm:w-full py-1 sm:py-3 px-1 sm:px-2 transition-colors duration-200
                ${isActive ? 'text-blue-600 bg-blue-50 sm:border-r-2 sm:border-blue-600' : 'text-gray-400 hover:bg-gray-50'}
              `}
            >
              <tab.icon
                className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-[10px] sm:text-xs leading-tight ${
                  isActive ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
