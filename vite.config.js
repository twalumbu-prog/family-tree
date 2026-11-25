import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Builds one self-contained docs/index.html (works on GitHub Pages and when opened directly from disk)
export default {
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { outDir: 'docs', emptyOutDir: true },
};
