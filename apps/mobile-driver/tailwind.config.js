/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: '#1E1E1E',
        primary: '#00E676', // Verde Neón sugerido
        textPrimary: '#FFFFFF',
        textSecondary: '#A0A0A0',
        danger: '#FF3B30'
      }
    },
  },
  plugins: [],
}
