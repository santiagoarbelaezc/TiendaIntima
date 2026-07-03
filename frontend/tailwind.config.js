/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: '#FAFAFA',
          ink: '#111111',
          blush: '#EAC7D2',
          blushStrong: '#D59AAD'
        }
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        soft: '0 18px 50px rgba(17, 17, 17, 0.08)'
      }
    }
  },
  plugins: []
};