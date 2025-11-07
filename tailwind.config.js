/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // A shade of blue for primary actions
        secondary: '#60a5fa', // A lighter blue
        accent: '#bfdbfe', // Very light blue
        background: '#f8fafc', // Light gray background
        card: '#ffffff', // White for cards
        text: '#334155', // Dark gray for text
        'status-pending': '#facc15',
        'status-approved': '#22c55e',
        'status-cancelled': '#ef4444',
        'status-finished': '#0ea5e9',
      },
    },
  },
  plugins: [],
}