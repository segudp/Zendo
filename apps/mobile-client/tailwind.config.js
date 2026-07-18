module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#FF4B3A',
        background: '#F5F5F8',
        surface: '#FFFFFF',
        textPrimary: '#2D2D2D',
        textSecondary: '#8A8A8F',
      }
    },
  },
  plugins: [],
}
