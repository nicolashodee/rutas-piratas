import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Sourcemaps en production pour débugger un écran blanc / erreur JS
    // via les DevTools du navigateur une fois déployé sur Netlify.
    sourcemap: true,
  },
})
