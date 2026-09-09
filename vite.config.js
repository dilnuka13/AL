import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
