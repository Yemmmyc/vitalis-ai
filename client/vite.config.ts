import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/mcp': 'http://localhost:4000',
      '/sse': 'http://localhost:4000',
      '/health': 'http://localhost:4000',
      '/tools': 'http://localhost:4000',
      '/api': 'http://localhost:4000'
    }
  }
});
