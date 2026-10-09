/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oasis: {
          bg: '#2C332C',
          dark: '#232A23',
          card: '#1E241E',
          panel: '#39413A',
          sage: '#787C68',
          sageHover: '#868B74',
          sageDark: '#525646',
          sand: '#C5A880',
          gold: '#E3B94E',
          text: '#EAEBE8',
          muted: '#A8AD94',
          border: 'rgba(234, 235, 232, 0.15)',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        sans: ['"Jost"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
