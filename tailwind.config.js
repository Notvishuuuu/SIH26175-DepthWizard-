/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#050308',
          900: '#0a0714',
          850: '#0e0a1c',
          800: '#131025'
        },
        violet: {
          950: '#1c0e3d',
          900: '#2a1454',
          700: '#4c2394',
          500: '#7c3fd8',
          400: '#9d63f0'
        },
        indigo: {
          600: '#3b2d8f',
          500: '#4f3bb8',
          400: '#6c5ad4'
        },
        cyan: {
          400: '#5ee6e0',
          300: '#8ff2ec'
        },
        ember: {
          400: '#f0a45e',
          300: '#f7c98a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(124, 63, 216, 0.45)',
        'glow-cyan': '0 0 30px -6px rgba(94, 230, 224, 0.35)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
}
