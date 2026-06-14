import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: '#050505',
        graphite: '#121212',
        steel: '#2A2A2A',
        electric: '#007AFF',
        cyber: '#00FF94',
        ink: '#17211d',
        mint: '#11a36a',
        saffron: '#e2a316',
        ocean: '#1c77c3'
      },
      backgroundImage: {
        'premium-gradient': 'radial-gradient(circle at center, #1a1a1a 0%, #050505 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        glow: {
          'from': { boxShadow: '0 0 5px #007AFF, 0 0 10px #007AFF' },
          'to': { boxShadow: '0 0 20px #007AFF, 0 0 30px #007AFF' }
        }
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
} satisfies Config;
