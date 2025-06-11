import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      external: [
        // 'swiper',
        // 'swiper/react',
        // 'swiper/css',
        // 'swiper/css/navigation',
        // 'swiper/css/pagination',
      ],
    },
  },
});
