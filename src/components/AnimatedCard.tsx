import React, { useState } from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'rotate';
  delay?: number;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = '', 
  hoverEffect = 'lift',
  delay = 0,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getHoverClasses = () => {
    switch (hoverEffect) {
      case 'lift':
        return 'hover:transform hover:-translate-y-2 hover:shadow-2xl';
      case 'glow':
        return 'hover:shadow-glow hover:shadow-2xl';
      case 'scale':
        return 'hover:scale-105 hover:shadow-xl';
      case 'rotate':
        return 'hover:rotate-1 hover:scale-105 hover:shadow-xl';
      default:
        return 'hover:shadow-lg';
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg transition-all duration-500 ease-out animate-fadeInUp ${getHoverClasses()} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Ripple effect */}
      {isHovered && (
        <div className="absolute inset-0 bg-blue-600 opacity-5 rounded-xl animate-ripple pointer-events-none"></div>
      )}
      
      {children}
    </div>
  );
};