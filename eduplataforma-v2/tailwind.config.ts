import type { Config } from 'tailwindcss'
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1a6fa8', light: '#3b9ed9', bg: '#e8f4fd' },
        mint:    { DEFAULT: '#2db88a', light: '#a8e6d4', bg: '#e4f7f1' },
        amber:   { DEFAULT: '#e8a020', light: '#fde8a0', bg: '#fff8e6' },
        violet:  { DEFAULT: '#6c5ce7', light: '#9b8ef0', bg: '#f0edff' },
        danger:  { DEFAULT: '#e05050', bg: '#fff0f0' },
        surface: '#f2f6fb',
        card:    '#ffffff',
        text: {
          DEFAULT: '#0d1b2a',
          muted:   '#3d4f62',
          light:   '#718096',
        },
        border: 'rgba(0,0,0,0.08)',
        'dark-surface': '#131c28',
        'dark-card':    '#1e2a3a',
        'dark-card2':   '#1a2535',
        'dark-text':    '#e2eaf4',
        'dark-muted':   '#94a8bc',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px', md: '12px', lg: '16px', xl: '20px',
      },
      boxShadow: {
        card:  '0 2px 16px rgba(0,0,0,0.06)',
        hover: '0 6px 32px rgba(0,0,0,0.10)',
        modal: '0 24px 80px rgba(0,0,0,0.25)',
        topbar:'0 1px 12px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config
