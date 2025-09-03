import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface FloatingAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}

interface FloatingActionButtonProps {
  actions: FloatingAction[];
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-6 z-40 font-gothic-italic">
      {/* Action buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-slideInRight">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 animate-fadeInRight"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="bg-black bg-opacity-75 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                {action.label}
              </span>
              <button
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110`}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        {isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <Plus className="w-8 h-8 text-white" />
        )}
      </button>
    </div>
  );
};