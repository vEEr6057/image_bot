/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      maxWidth: {
        'content': '960px',
      },
      spacing: {
        'section': '32px',
        'gap': '24px',
      },
      borderRadius: {
        'custom': '12px',
      },
      boxShadow: {
        'custom': '0 4px 16px rgba(0,0,0,0.08)',
        'card': '0 2px 12px rgba(0,0,0,0.05)',
        'modal': '0 8px 24px rgba(0,0,0,0.2)',
      },
      fontSize: {
        'title': '28px',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
