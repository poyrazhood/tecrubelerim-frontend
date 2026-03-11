/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-satoshi)', 'system-ui', 'sans-serif'],
        display: ['var(--font-clash)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
        trust: {
          a: '#22C55E',
          b: '#84CC16',
          c: '#EAB308',
          d: '#F97316',
          f: '#EF4444',
        },
        surface: {
          DEFAULT: '#0C0C0F',
          1: '#111114',
          2: '#18181C',
          3: '#1F1F24',
          4: '#26262C',
          5: '#2E2E35',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%':   { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-scale': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        'slide-in': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop': {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.18)' },
          '70%':  { transform: 'scale(0.92)' },
          '100%': { transform: 'scale(1)' },
        },
        'bounce-in': {
          '0%':   { opacity: '0', transform: 'scale(0.3)' },
          '50%':  { opacity: '1', transform: 'scale(1.08)' },
          '70%':  { transform: 'scale(0.96)' },
          '100%': { transform: 'scale(1)' },
        },
        'count-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ping-once': {
          '0%':   { transform: 'scale(1)', opacity: '1' },
          '80%':  { transform: 'scale(2.2)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%':      { transform: 'rotate(-8deg)' },
          '40%':      { transform: 'rotate(8deg)' },
          '60%':      { transform: 'rotate(-4deg)' },
          '80%':      { transform: 'rotate(4deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(99,102,241,0.3)' },
          '50%':      { boxShadow: '0 0 24px rgba(99,102,241,0.7)' },
        },
        'number-tick': {
          '0%':   { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'checkmark': {
          '0%':   { strokeDashoffset: '30' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'fade-up':       'fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'fade-down':     'fade-down 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':       'fade-in 0.3s ease-out both',
        'fade-in-scale': 'fade-in-scale 0.4s cubic-bezier(0.16,1,0.3,1) both',
        shimmer:         'shimmer 2s linear infinite',
        pulse:           'pulse 2s ease-in-out infinite',
        'slide-in':      'slide-in 0.3s ease-out',
        'slide-up':      'slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'pop':           'pop 0.4s cubic-bezier(0.16,1,0.3,1)',
        'bounce-in':     'bounce-in 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'count-up':      'count-up 0.3s ease-out both',
        'ping-once':     'ping-once 0.6s ease-out forwards',
        'wiggle':        'wiggle 0.5s ease-in-out',
        'float':         'float 3s ease-in-out infinite',
        'glow-pulse':    'glow-pulse 2s ease-in-out infinite',
        'number-tick':   'number-tick 0.25s ease-out both',
      },
    },
  },
  plugins: [],
}
