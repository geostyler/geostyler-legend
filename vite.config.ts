import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    manifest: true,
    sourcemap: true,
    lib: {
      entry: './src/index.ts',
      name: 'GeoStylerLegend',
      formats: ['iife'],
      fileName: 'geoStylerLegend',
    },
    rollupOptions: {
      output: {
        dir: 'dist',
        exports: 'named',
        generatedCode: 'es5',
        format: 'iife',
      },
    },
  },
  define: {
    appName: 'GeoStyler'
  },
  server: {
    host: '0.0.0.0',
  },
});
