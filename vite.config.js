
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: 'https://vateam.demomyapp.com/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://vateam.demomyapp.com/',
        changeOrigin: true,
      },
    },
  }
});
