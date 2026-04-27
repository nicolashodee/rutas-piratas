/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        kara: ['Kara', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Base
        ink:       '#1a1a18',  // noir profond (encre)
        ink_soft:  '#2b2b27',  // noir un peu plus doux
        paper:     '#f5f2ed',  // papier
        parchment: '#f4ecd8',  // parchemin (plus chaud)
        bone:      '#e8e4dd',  // bordures discrètes

        // Accents pirate
        gold:      '#c8a86b',  // or vieilli (sobre)
        gold_dark: '#9c7e44',
        wine:      '#7a1f2e',  // rouge bordeaux (sang séché)
        navy:      '#1e2a3a',  // bleu marine (officiel, pour corsaria)
        moss:      '#3a7a42',  // vert (nature, accent secondaire)

        // Difficulty
        diff_easy: '#2d7a3a',
        diff_med:  '#7a6b00',
        diff_hard: '#b04a00',
        diff_very: '#1a1a18',
      },
      boxShadow: {
        // Léger relief pour les boutons primaires (effet cachet)
        stamp: '0 1px 0 rgba(0,0,0,.15), 0 2px 4px rgba(0,0,0,.08)',
      },
    },
  },
  plugins: [],
}
