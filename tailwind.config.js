/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rid: {
          blue: '#004282',      // กรมชลประทาน กรมท่า
          lightBlue: '#0284c7', // ฟ้าคราม
          accent: '#0288d1',
          gold: '#eab308',      // สีทอง
          goldDark: '#ca8a04',
          dark: '#0f172a',
          surface: '#f8fafc',
          border: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Prompt', 'Sarabun', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
