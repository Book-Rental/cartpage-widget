
import { defineConfig } from "vitest/config";
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import path from 'path';

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],

  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.widget.tsx'),
      name: 'CaasWidget',
      formats: ['iife'],
      fileName: () => 'bundle.js',
    },
    rollupOptions: {
      external: [],
    },
    minify: true,
  },

  define: {
    'process.env': {},
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,

    include: [
      'src/tests/**/*.test.ts',
      'src/tests/**/*.test.tsx',
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
      },
      exclude: [
        'src/setupTests.ts',
        '**/*.stories.tsx',
        'dist/**',
      ],
    },
  }
});