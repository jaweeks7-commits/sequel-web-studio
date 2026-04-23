/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-navy-dark':  '#0F1F3D',
        'brand-navy':       '#1F3864',
        'brand-blue':       '#2E75B6',
        'brand-blue-light': '#4B9FD4',
        'brand-purple':     '#8E44AD',
        'brand-grey':       '#595959',
        'brand-grey-muted': '#8892A0',
        'brand-bg':         '#F4F6FB',
      },
      fontFamily: {
        sans: ["'Space Grotesk'", '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ["'Space Mono'", 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
