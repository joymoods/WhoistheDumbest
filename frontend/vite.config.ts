import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://backend:8080',
      '/socket.io': {
        target: 'http://backend:8080',
        ws: true,
      },
    },
  },
});
