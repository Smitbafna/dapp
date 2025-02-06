import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // The base URL is typically set to the directory where your DFINITY canister will be deployed.
  base: '/demo-blockchain-integrations/',

  build: {
    // Output directory for the build files
    outDir: 'build',
    
    // Configure Rollup for specific input files (for HTML)
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        404: resolve(__dirname, 'public/404.html'),
      },
    },
  },

  plugins: [
    react(),
    tsconfigPaths(),  // Automatically resolves TypeScript paths from your tsconfig.json
    nodePolyfills(),  // Ensure compatibility with Node.js polyfills if needed
  ],

  // Additional configuration for resolving paths
  resolve: {
    alias: [
      {
        find: '@declarations', 
        replacement: resolve(__dirname, 'src/declarations')
      },
    ],
    dedupe: ['@dfinity/agent'], // Ensures deduplication of DFINITY agent package if used
  },

  server: {
    // Proxy configuration to integrate with DFINITY's backend if needed during development
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943', // Local DFINITY agent server, adjust to your setup
        changeOrigin: true,
      },
    },
  },

  // Ensure proper handling of environment variables
  define: {
    'process.env.DFINITY_ENV': JSON.stringify(process.env.DFINITY_ENV || 'development'),
  },

  // Ensure that Vite uses globalThis for compatibility (necessary for some DFINITY use cases)
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});



