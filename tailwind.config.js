/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
        fontFamily: {
            nunito: ['var(--font-nunito)'],
            encode: ['var(--font-encode-sans'],
        },
    },
  },
  plugins: [],
}

