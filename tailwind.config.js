/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Crickbuzz Light Theme Colors
        primary: {
          dark: '#000000',        // Dark text
          light: '#ffffff',       // Light background
        },
        crickbuzz: {
          green: '#10b981',       // Primary green
          'green-dark': '#059669', // Dark green
          'green-light': '#ecfdf5', // Very light green
          text: '#1f2937',        // Dark text
          'text-light': '#6b7280', // Light gray text
          border: '#e5e7eb',      // Light border
          'bg': '#ffffff',        // White background
          'bg-light': '#f9fafb',  // Light gray background
        },
      },
      backgroundColor: {
        'crickbuzz-green': '#10b981',
        'crickbuzz-light': '#f9fafb',
        'crickbuzz-white': '#ffffff',
      },
      borderColor: {
        'crickbuzz-border': '#e5e7eb',
        'crickbuzz-green': '#10b981',
      },
      textColor: {
        'crickbuzz-text': '#1f2937',
        'crickbuzz-green': '#10b981',
      },
      boxShadow: {
        'crickbuzz-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'crickbuzz': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'crickbuzz-lg': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'crickbuzz-nav': '0 -2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
