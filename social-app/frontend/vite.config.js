import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    
    proxy: {
      '/auth':     'http://localhost:5000',
      '/posts':    'http://localhost:5000',
      '/users':    'http://localhost:5000',
      '/feed':     'http://localhost:5000',
      '/comments': 'http://localhost:5000',
    }
  }
});