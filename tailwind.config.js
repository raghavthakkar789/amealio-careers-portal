/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core neutrals (light UI)
        'bg-900': '#FFFFFF', // app background
        'bg-850': '#F8FAFC', // page background
        'bg-800': '#FFFFFF', // surface / cards
        'border': '#E2E8F0', // subtle lines
        'text-high': '#1E293B', // primary text
        'text-mid': '#475569', // secondary text
        'text-dim': '#64748B', // muted/placeholder
        
        // Purple scale (primary) - refined for light mode
        purple: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7', // core brand - adjusted for better contrast
          600: '#9333EA',
          700: '#7C3AED',
          800: '#6B21A8',
          900: '#581C87',
        },
        
         // Supporting accents - adjusted for light mode
         indigo: {
           100: '#E0E7FF',
           200: '#C7D2FE',
           500: '#4F46E5',
           600: '#4338CA',
           700: '#3730A3',
         },
         emerald: {
           100: '#D1FAE5',
           200: '#A7F3D0',
           500: '#059669',
           600: '#047857',
           700: '#065F46',
         },
         amber: {
           100: '#FEF3C7',
           200: '#FDE68A',
           500: '#D97706',
           600: '#B45309',
           700: '#92400E',
         },
         rose: {
           100: '#FFE4E6',
           200: '#FECDD3',
           500: '#DC2626',
           600: '#B91C1C',
           700: '#991B1B',
         },
         fuchsia: '#C026D3', // highlights/badges
         teal: '#0D9488', // success alt / accent chips
        
        // Semantic tokens
        background: '#FFFFFF',
        'background-soft': '#F8FAFC',
        'background-page': '#F1F5F9',
        'text-primary': '#1E293B',
        'text-secondary': '#475569',
        'text-muted': '#64748B',
        'primary': '#A855F7',
        'primary-hover': '#9333EA',
        'primary-foreground': '#FFFFFF',
        'link': '#7C3AED',
        'link-hover': '#6D28D9',
        'success': '#059669',
        'warning': '#D97706',
        'error': '#DC2626',
      },
      fontFamily: {
        sans: ['Mulish', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'section-title': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'caption': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'button': ['14px', { lineHeight: '20px', fontWeight: '500' }],
      },
      borderRadius: {
        'xl': '12px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'soft': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'large': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
        'light-gradient': 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
        'card-gradient': 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        'hero-gradient': 'linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #6D28D9 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
          '70%': { transform: 'translate3d(0, -4px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}


