/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F2EEE1',
        ink: '#26301F',
        pine: '#33452C',
        pine2: '#4A5E3F',
        mustard: '#C99A2E',
        paprika: '#B65330',
        line: '#D9D2BE',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
