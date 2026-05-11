import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('postprocessing')) return 'vendor-postfx'
          if (id.includes('three')) return 'vendor-three'
          if (!id.includes('/node_modules/')) return
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'vendor-react'
          if (
            id.includes('/@react-three/') ||
            id.includes('/three-stdlib/') ||
            id.includes('/react-reconciler/') ||
            id.includes('/scheduler/') ||
            id.includes('/zustand/') ||
            id.includes('/suspend-react/') ||
            id.includes('/use-sync-external-store/') ||
            id.includes('/its-fine/') ||
            id.includes('/react-use-measure/') ||
            id.includes('/maath/') ||
            id.includes('/troika-') ||
            id.includes('/camera-controls/') ||
            id.includes('/@react-spring/') ||
            id.includes('/@use-gesture/')
          ) {
            return 'vendor-scene'
          }
          return 'vendor'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
