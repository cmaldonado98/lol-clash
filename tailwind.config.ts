import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'hextech-black':    '#010A13',
        'hextech-blue':     '#0AC8B9',
        'hextech-blue-bright': '#1BE1D3',
        'hextech-gold':     '#C8AA6E',
        'hextech-gold-light': '#F0E6D3',
        'hextech-gold-dark': '#785A28',
        'hextech-gray':     '#A09B8C',
        'hextech-gray-dark': '#3C3C41',
        'hextech-navy':     '#0A1628',
        'hextech-void':     '#000507',
      },

      fontFamily: {
        beaufort: ['var(--font-beaufort)', 'Georgia', 'serif'],
        spiegel:  ['var(--font-spiegel)',  'Arial',   'sans-serif'],
      },

      boxShadow: {
        'glow-blue':    '0 0 15px rgba(10,200,185,.5), 0 0 30px rgba(10,200,185,.25), 0 0 60px rgba(10,200,185,.1)',
        'glow-blue-sm': '0 0 8px  rgba(10,200,185,.6), 0 0 16px rgba(10,200,185,.3)',
        'glow-gold':    '0 0 15px rgba(200,170,110,.4), 0 0 30px rgba(200,170,110,.2), 0 0 60px rgba(200,170,110,.08)',
        'glow-gold-sm': '0 0 8px  rgba(200,170,110,.5), 0 0 16px rgba(200,170,110,.25)',
      },

      backgroundImage: {
        'hextech-gradient': 'linear-gradient(180deg, #091428 0%, #010A13 50%, #000507 100%)',
        'gold-gradient':    'linear-gradient(135deg, #C8AA6E 0%, #785A28 50%, #C8AA6E 100%)',
        'blue-gradient':    'linear-gradient(135deg, #0AC8B9 0%, #0596A6 100%)',
        'card-gradient':    'linear-gradient(180deg, rgba(10,22,40,.97) 0%, rgba(1,10,19,.99) 100%)',
        'panel-gradient':   'linear-gradient(180deg, #0A1628 0%, #060D1A 100%)',
      },

      keyframes: {
        breatheBlue: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(10,200,185,.2), 0 0 20px rgba(10,200,185,.1)' },
          '50%':      { boxShadow: '0 0 25px rgba(10,200,185,.5), 0 0 50px rgba(10,200,185,.25)' },
        },
        breatheGold: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(200,170,110,.2), 0 0 20px rgba(200,170,110,.1)' },
          '50%':      { boxShadow: '0 0 25px rgba(200,170,110,.4), 0 0 50px rgba(200,170,110,.2)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0'  },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        particleDrift: {
          '0%':   { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '20%':  { opacity: '1' },
          '80%':  { opacity: '1' },
          '100%': { transform: 'translateY(-120px) translateX(30px)', opacity: '0' },
        },
      },

      animation: {
        'breathe-blue': 'breatheBlue 3s ease-in-out infinite',
        'breathe-gold': 'breatheGold 3s ease-in-out infinite',
        'shimmer':      'shimmer 3s linear infinite',
        'float':        'float 4s ease-in-out infinite',
        'fade-in-up':   'fadeInUp .6s ease-out forwards',
        'particle':     'particleDrift 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
