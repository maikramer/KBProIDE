module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#0f172a',
        surface2: '#111827',
        accent: '#60a5fa',
      }
    },
  },
  plugins: [],
};
