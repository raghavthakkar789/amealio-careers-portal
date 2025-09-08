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
        // Core neutrals (dark UI)
        'bg-900': '#0B0F16', // app background
        'bg-850': '#0F1420', // page background
        'bg-800': '#121826', // surface / cards
        'border': '#22293A', // subtle lines
        'text-high': '#E8ECF1', // primary text
        'text-mid': '#B5BECC', // secondary text
        'text-dim': '#8B94A5', // muted/placeholder
        
        // Purple scale (primary)
        purple: {
          50: '#F7F2FF',
          100: '#EDE3FF',
          200: '#DAC7FF',
          300: '#C3A5FF',
          400: '#A97DFE',
          500: '#8B5CF6', // core brand
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#3B0F8E',
        },
        
        // Supporting accents
        indigo: '#6366F1', // links/secondary actions
        fuchsia: '#D946EF', // highlights/badges
        teal: '#14B8A6', // success alt / accent chips
        emerald: '#10B981', // success
        amber: '#F59E0B', // warning
        rose: '#F43F5E', // error
        
        // Semantic tokens
        background: '#0B0F16',
        'background-soft': '#121826',
        'background-page': '#0F1420',
        'text-primary': '#E8ECF1',
        'text-secondary': '#B5BECC',
        'text-muted': '#8B94A5',
        'primary': '#8B5CF6',
        'primary-hover': '#7C3AED',
        'primary-foreground': '#FFFFFF',
        'link': '#A97DFE',
        'link-hover': '#7C3AED',
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#F43F5E',
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
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #3D1E94 0%, #7B3EF0 100%)',
        'dark-gradient': 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        'card-gradient': 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
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
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
