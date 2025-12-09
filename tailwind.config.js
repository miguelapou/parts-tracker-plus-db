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
    // Uses any-hover so USB mouse connected to touch device will enable hover
    plugin(function({ addVariant }) {
      addVariant('can-hover', '@media (any-hover: hover)');
    }),
  ],
}
