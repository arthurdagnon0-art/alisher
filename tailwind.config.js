/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'gothic': ['Gothic A1', 'sans-serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-out',
        'fadeInUp': 'fadeInUp 0.6s ease-out',
        'fadeInDown': 'fadeInDown 0.6s ease-out',
        'fadeInLeft': 'fadeInLeft 0.6s ease-out',
        'fadeInRight': 'fadeInRight 0.6s ease-out',
        'slideInRight': 'slideInRight 0.5s ease-out',
        'slideInLeft': 'slideInLeft 0.5s ease-out',
        'slideUp': 'slideUp 0.4s ease-out',
        'slideDown': 'slideDown 0.4s ease-out',
        'wiggle': 'wiggle 1s ease-in-out',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'scaleIn': 'scaleIn 0.5s ease-out',
        'ripple': 'ripple 0.6s linear',
      },
      screens: {
        'xxs': '280px',    // Galaxy Fold, très petits écrans
        'xs': '320px',     // iPhone SE, petits écrans
        'sm': '375px',     // iPhone standard
        'md': '414px',     // iPhone Plus
        'md-land': {'raw': '(min-width: 568px) and (orientation: landscape)'},
        'lg': '768px',     // Tablettes
        'xl': '1024px',
        '2xl': '1280px',
        'fold': {'raw': '(max-width: 280px)'},                              // Galaxy Fold spécifique
        'narrow': {'raw': '(max-width: 320px) and (max-height: 568px)'},    // Écrans étroits
        'tiny': {'raw': '(max-width: 280px) and (max-height: 653px)'},      // Très petits écrans
        'compact': {'raw': '(max-width: 375px) and (max-height: 667px)'},   // iPhone SE, écrans compacts
      },
    },
  },
  plugins: [],
};