/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Base dark surfaces (Material 3 dark-theme guidance: dark grays, not pure black)
        ink: {
          DEFAULT: '#0B0D0C',  // Background
          soft: '#111513',     // Surface
          elevated: '#171C19', // Surface Elevated
          line: '#252C28',     // Border
        },
        // Light text on dark surfaces
        paper: '#F3F7F4', // Main Text

        // Primary brand accent — emerald green
        signal: {
          DEFAULT: '#39FF88', // Primary Green
          dim: '#16A34A',     // Secondary Green
        },

        // Status: TYPICAL / success
        teal: {
          DEFAULT: '#39FF88',
          soft: 'rgba(57,255,136,0.14)',
        },
        // Status: ABOVE_TYPICAL / warning
        amberflag: {
          DEFAULT: '#F5C451',
          soft: 'rgba(245,196,81,0.14)',
        },
        // Status: UNUSUALLY_HIGH / danger
        coral: {
          DEFAULT: '#FF5C5C',
          soft: 'rgba(255,92,92,0.14)',
        },

        // Text hierarchy
        slate: {
          DEFAULT: '#9AA59F', // Secondary Text
          light: '#66716B',   // Muted Text
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        meter: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.3), 0 8px 24px -12px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
