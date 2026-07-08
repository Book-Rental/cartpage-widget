import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

import path from "path";

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],

  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.widget.tsx"),
      name: 'CaasWidget',
      formats: ["iife"],
      fileName: () => "bundle.js",
    },
    rollupOptions: {
      external: [], // keep empty so everything bundles
    },
    minify: true,
  },

  define: {
    "process.env": {}
  }
});