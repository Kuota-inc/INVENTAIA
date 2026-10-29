/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  corePlugins: {
    preflight: false,
  },
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/kuota-landing/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        kuota: {
          dodger: '#0391FD',
          crayola: '#2F7AEF',
          palesky: '#CBE5FE',
          deepnavy: '#00235C',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'navy-hard': '0 4px 0 0 #00235C',
        'navy-hard-lg': '0 8px 0 0 #00235C',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatCard: {
          '0%, 100%': { transform: 'translate3d(0, 0px, 0)' },
          '50%': { transform: 'translate3d(0, -7px, 0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out',
        floatCard: 'floatCard 5.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
