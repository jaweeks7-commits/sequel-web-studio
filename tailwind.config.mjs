/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-navy':   '#1F3864',
        'brand-blue':   '#2E75B6',
        'brand-purple': '#8E44AD',
        'brand-grey':   '#595959',
        'brand-bg':     '#F7F8FA',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
