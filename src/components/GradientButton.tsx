import React, { useState } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  className = ''
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
    secondary: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
    success: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    warning: 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
    danger: 'from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`
        relative overflow-hidden
        bg-gradient-to-r ${variants[variant]}
        text-white font-semibold rounded-xl
        ${sizes[size]}
        transition-all duration-300 ease-out
        transform hover:scale-105 hover:shadow-xl
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${isPressed ? 'scale-95' : ''}
        ${className}
      `}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* Content */}
      <div className="relative flex items-center justify-center space-x-2">
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          Icon && <Icon className="w-5 h-5" />
        )}
        <span>{children}</span>
      </div>
      
      {/* Ripple effect */}
      {isPressed && (
        <div className="absolute inset-0 bg-white opacity-30 rounded-xl animate-ripple"></div>
      )}
    </button>
  );
};