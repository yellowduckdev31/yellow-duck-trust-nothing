import { defineConfig } from 'vite';

export default defineConfig({
  // Base public path when served in development or production.
  // Using relative path './' so it works on GitHub Pages without knowing the repo name.
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Minify with esbuild by default
    minify: 'esbuild',
    // Generate sourcemaps for debugging (optional, usually false for prod)
    sourcemap: false
  },
  server: {
    port: 3000,
    open: true
  }
});
