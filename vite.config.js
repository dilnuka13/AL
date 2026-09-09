import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  base: './',
  plugins: [
    react(),
    {
      name: 'dev-entry-resolver',
      transformIndexHtml(html) {
        if (command === 'serve') {
          return html.replace(
            /<script type="module" crossorigin src="(?:\.\/)?assets\/app\.js"><\/script>/,
            '<script type="module" src="/src/main.jsx"></script>'
          );
        }
        return html;
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        app: './src/main.jsx'
      },
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
}));
