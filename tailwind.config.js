/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: 'var(--surface-canvas)',
        paper: 'var(--surface-paper)',
        subtle: 'var(--surface-subtle)',
        ink: {
          DEFAULT: 'var(--ink-primary)',
          muted: 'var(--ink-muted)',
        },
        line: 'var(--border-hairline)',
        accent: {
          DEFAULT: 'var(--accent-primary)',
          hover: 'var(--accent-hover)',
          soft: 'var(--accent-soft)',
          ink: 'var(--accent-ink)',
        },
      },
    },
  },
  plugins: [],
};
