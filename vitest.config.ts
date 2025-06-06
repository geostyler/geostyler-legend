import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],

  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'clover', 'json', 'lcov']
    },
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 1
      },
    },
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
  resolve: {
    extensions: ['.js', '.svg', '.ts', '.tsx', '.jsx']
  }
});
