/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Athiran Design System — Apple-inspired
        primary: {
          DEFAULT: '#0071E3',
          hover: '#0077ED',
          light: '#E8F1FD',
          dark: '#005BB5',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#F5F5F7',
          inset: '#F2F2F2',
          overlay: '#FAFAFA',
        },
        border: {
          DEFAULT: '#D2D2D7',
          subtle: '#E8E8ED',
          strong: '#B0B0B7',
        },
        content: {
          primary: '#1D1D1F',
          secondary: '#6E6E73',
          tertiary: '#AEAEB2',
          disabled: '#C7C7CC',
          inverse: '#FFFFFF',
        },
        status: {
          success: '#34C759',
          'success-bg': '#E8F8ED',
          warning: '#FF9500',
          'warning-bg': '#FFF5E6',
          danger: '#FF3B30',
          'danger-bg': '#FFF0EF',
          info: '#007AFF',
          'info-bg': '#E8F3FF',
        },
        lead: {
          hot: '#FF3B30',
          'hot-bg': '#FFF0EF',
          warm: '#FF9500',
          'warm-bg': '#FFF5E6',
          cold: '#007AFF',
          'cold-bg': '#E8F3FF',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '16px' }],
        xs: ['12px', { lineHeight: '18px' }],
        sm: ['13px', { lineHeight: '20px' }],
        base: ['14px', { lineHeight: '22px' }],
        md: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '30px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
        '4xl': ['32px', { lineHeight: '40px' }],
      },
      spacing: {
        4.5: '18px',
        13: '52px',
        15: '60px',
        18: '72px',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        '2xs': '0 1px 2px rgba(0,0,0,0.04)',
        xs: '0 1px 2px rgba(0,0,0,0.05)',
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        DEFAULT: '0 2px 8px rgba(0,0,0,0.09)',
        md: '0 4px 12px rgba(0,0,0,0.10)',
        lg: '0 8px 32px rgba(0,0,0,0.12)',
        xl: '0 16px 48px rgba(0,0,0,0.14)',
        focus: '0 0 0 3px rgba(0, 113, 227, 0.25)',
      },
      height: {
        input: '36px',
        'input-md': '40px',
        'input-lg': '44px',
        header: '60px',
      },
      width: {
        sidebar: '240px',
        'sidebar-collapsed': '64px',
      },
      zIndex: {
        sidebar: '40',
        header: '50',
        modal: '100',
        toast: '200',
        tooltip: '300',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        skeleton: 'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateX(-8px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        slideUp: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        skeleton: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
    },
  },
  plugins: [],
}

