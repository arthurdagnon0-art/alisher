import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue-600',
  text = 'Chargement...'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 animate-fadeInUp">
      <div className="relative mb-4">
        {/* Main spinner */}
        <div className={`${sizeClasses[size]} border-4 border-${color} border-t-transparent rounded-full animate-spin`}></div>
        
        {/* Inner spinner */}
        <div className={`absolute inset-2 border-2 border-${color} border-opacity-30 border-b-transparent rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        
        {/* Center dot */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-${color} rounded-full animate-pulse`}></div>
      </div>
      
      {text && (
        <p className="text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};