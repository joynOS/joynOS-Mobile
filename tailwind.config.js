/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'joyn-orange': 'hsl(20, 70%, 47%)',
        'joyn-purple': 'hsl(258, 100%, 67%)',
        primary: '#cc5c24',
      },
    },
  },
  plugins: [],
}
