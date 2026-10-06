/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nav-dark': '#181A1B',
        'text-primary': '#171717',
        'text-secondary': '#6B7280',
        'border-light': '#E5E7EB',
        'bg-light': '#F8F9FA',
        'accent-blue': '#2563EB',
        'accent-success': '#22C55E',
        'accent-warning': '#F59E0B',
        'accent-danger': '#EF4444',
        'accent-chat': '#3B82F6',
        'accent-call': '#8B5CF6',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
