/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada en Apple
        ink: {
          DEFAULT: '#1d1d1f',
          soft: '#424245',
          mute: '#86868b',
        },
        canvas: {
          DEFAULT: '#fbfbfd',
          alt: '#f5f5f7',
          card: '#ffffff',
        },
        line: {
          DEFAULT: '#d2d2d7',
          soft: '#e8e8ed',
        },
        accent: {
          DEFAULT: '#0071e3',
          hover: '#0077ed',
          dark: '#0058b8',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '600' }],
        'display': ['clamp(2rem, 3.5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'title': ['clamp(1.5rem, 2.5vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '600' }],
      },
      borderRadius: {
        'apple': '18px',
        'apple-lg': '24px',
      },
      boxShadow: {
        'apple-sm': '0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.04)',
        'apple': '0 4px 16px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)',
        'apple-lg': '0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
      },
      backdropBlur: {
        'apple': '20px',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
