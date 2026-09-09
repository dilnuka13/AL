import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/app.css';
          }
          return 'assets/[name].[ext]';
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/doenets': {
        target: 'https://result.doenets.lk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/doenets/, ''),
        secure: false,
        headers: {
          'Referer': 'https://doenets.lk/examresults',
          'Origin': 'https://doenets.lk'
        }
      }
    }
  }
});
