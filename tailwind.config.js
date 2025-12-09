const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // Custom variant for hover-capable devices (mouse, trackpad, stylus)
    // Uses (hover: hover) to check if PRIMARY input supports hover
    // iPadOS reports any-hover:hover even without mouse, so we check primary input instead
    plugin(function({ addVariant }) {
      addVariant('can-hover', '@media (hover: hover)');
    }),
  ],
}
