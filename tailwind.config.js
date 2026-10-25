/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--bg-base-rgb) / <alpha-value>)',
        sidebar: 'var(--bg-sidebar)',
        surface: 'rgb(var(--bg-surface-rgb) / <alpha-value>)',
        'surface-hover': 'rgb(var(--bg-hover-rgb) / <alpha-value>)',
        elevated: 'var(--bg-elevated)',
        interactive: 'var(--bg-interactive)',
        selected: 'var(--bg-selected)',
        overlay: 'var(--bg-overlay)',
        inverse: 'var(--bg-inverse)',

        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          hover: 'var(--accent-hover)',
          muted: 'var(--accent-muted)',
        },

        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
        
        text: {
          primary: 'rgb(var(--text-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
          tertiary: 'rgb(var(--text-tertiary-rgb) / <alpha-value>)',
          inverse: 'var(--text-inverse)',
        },

        risk: {
          critical: 'rgb(var(--risk-critical-rgb) / <alpha-value>)',
          high: 'rgb(var(--risk-high-rgb) / <alpha-value>)',
          moderate: 'rgb(var(--risk-moderate-rgb) / <alpha-value>)',
          low: 'rgb(var(--risk-low-rgb) / <alpha-value>)',
        },

        info: 'rgb(var(--status-info-rgb) / <alpha-value>)',
        success: 'rgb(var(--status-success-rgb) / <alpha-value>)',
        warning: 'rgb(var(--status-warning-rgb) / <alpha-value>)',
        error: 'rgb(var(--status-error-rgb) / <alpha-value>)',

        status: {
          info: 'rgb(var(--status-info-rgb) / <alpha-value>)',
          success: 'rgb(var(--status-success-rgb) / <alpha-value>)',
          warning: 'rgb(var(--status-warning-rgb) / <alpha-value>)',
          error: 'rgb(var(--status-error-rgb) / <alpha-value>)',
        },
      },
      borderColor: {
        DEFAULT: 'var(--border-default)',
        subtle: 'var(--border-subtle)',
        strong: 'var(--border-strong)',
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        // Precise enterprise scale: dense, readable, constrained
        'xs': ['11px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'sm': ['13px', { lineHeight: '20px', letterSpacing: '0em' }],       // Primary UI text
        'base': ['14px', { lineHeight: '20px', letterSpacing: '-0.005em' }], // Emphasized body
        'lg': ['16px', { lineHeight: '24px', letterSpacing: '-0.01em' }],    // Section titles
        'xl': ['18px', { lineHeight: '28px', letterSpacing: '-0.015em' }],   // Modals / Overlays
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],   // Page titles (Max size)
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.02em' }],   // Top-level metrics only
      },

      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        // Bold/700+ omitted to enforce enterprise restraint
      },

      borderRadius: {
        'none': '0',
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
        'full': '9999px',
      },

      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}