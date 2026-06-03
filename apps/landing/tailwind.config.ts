import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#c8a882',
        'primary-hover': '#b8976e',
        'primary-light': '#f6f1eb',
        surface: '#f9f6f0',
        muted: '#f0ebe4',
        danger: '#c27b6b',
        positive: 'var(--color-positive)',
        negative: 'var(--color-negative)',
        faction: { fe: '#d4a04a', fo: '#7a9ca8', ve: '#8b5a4a', vo: '#6b7a5c' },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"SF Mono"', '"Fira Code"', '"Roboto Mono"', 'monospace'],
      },
      borderRadius: { card: '16px', btn: '12px', input: '8px' },
      animation: {
        'fade-up': 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
