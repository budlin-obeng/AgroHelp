/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agro: {
          50: '#f2fbf4',
          100: '#e1f7e6',
          200: '#c5eed0',
          300: '#97deaa',
          400: '#61c57c',
          500: '#3ba758',
          600: '#2c8744',
          700: '#246b38',
          800: '#205530',
          900: '#1c4629',
          950: '#0b2614',
        },
        soil: {
          50: '#faf6f0',
          100: '#f3ece0',
          200: '#e7d8c0',
          300: '#d7be9b',
          400: '#c49f73',
          500: '#b48556',
          600: '#9e6d47',
          700: '#7e543b',
          800: '#684534',
          900: '#563a2d',
        },
        nasa: {
          blue: '#0B3D91',
          red: '#FC3D21',
          gold: '#E3A857',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
