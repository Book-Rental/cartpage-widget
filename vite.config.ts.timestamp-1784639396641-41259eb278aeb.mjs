// vite.config.ts
import { defineConfig } from "file:///D:/George/Micro-frontend/BookRental/cartpage-widget/node_modules/vitest/dist/config.js";
import react from "file:///D:/George/Micro-frontend/BookRental/cartpage-widget/node_modules/@vitejs/plugin-react/dist/index.js";
import cssInjectedByJsPlugin from "file:///D:/George/Micro-frontend/BookRental/cartpage-widget/node_modules/vite-plugin-css-injected-by-js/dist/esm/index.js";
import path from "path";
var __vite_injected_original_dirname = "D:\\George\\Micro-frontend\\BookRental\\cartpage-widget";
var vite_config_default = defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: path.resolve(__vite_injected_original_dirname, "src/index.widget.tsx"),
      name: "CaasWidget",
      formats: ["iife"],
      fileName: () => "bundle.js"
    },
    rollupOptions: {
      external: []
    },
    minify: true
  },
  define: {
    "process.env": {}
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: true,
    include: [
      "src/tests/**/*.test.ts",
      "src/tests/**/*.test.tsx"
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70
      },
      exclude: [
        "src/setupTests.ts",
        "**/*.stories.tsx",
        "dist/**"
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHZW9yZ2VcXFxcTWljcm8tZnJvbnRlbmRcXFxcQm9va1JlbnRhbFxcXFxjYXJ0cGFnZS13aWRnZXRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdlb3JnZVxcXFxNaWNyby1mcm9udGVuZFxcXFxCb29rUmVudGFsXFxcXGNhcnRwYWdlLXdpZGdldFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovR2VvcmdlL01pY3JvLWZyb250ZW5kL0Jvb2tSZW50YWwvY2FydHBhZ2Utd2lkZ2V0L3ZpdGUuY29uZmlnLnRzXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlc3QvY29uZmlnXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCBjc3NJbmplY3RlZEJ5SnNQbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tY3NzLWluamVjdGVkLWJ5LWpzJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBjc3NJbmplY3RlZEJ5SnNQbHVnaW4oKV0sXHJcblxyXG4gIGJ1aWxkOiB7XHJcbiAgICBsaWI6IHtcclxuICAgICAgZW50cnk6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXgud2lkZ2V0LnRzeCcpLFxyXG4gICAgICBuYW1lOiAnQ2Fhc1dpZGdldCcsXHJcbiAgICAgIGZvcm1hdHM6IFsnaWlmZSddLFxyXG4gICAgICBmaWxlTmFtZTogKCkgPT4gJ2J1bmRsZS5qcycsXHJcbiAgICB9LFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBleHRlcm5hbDogW10sXHJcbiAgICB9LFxyXG4gICAgbWluaWZ5OiB0cnVlLFxyXG4gIH0sXHJcblxyXG4gIGRlZmluZToge1xyXG4gICAgJ3Byb2Nlc3MuZW52Jzoge30sXHJcbiAgfSxcclxuICB0ZXN0OiB7XHJcbiAgICBnbG9iYWxzOiB0cnVlLFxyXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXHJcbiAgICBzZXR1cEZpbGVzOiAnLi9zcmMvc2V0dXBUZXN0cy50cycsXHJcbiAgICBjc3M6IHRydWUsXHJcblxyXG4gICAgaW5jbHVkZTogW1xyXG4gICAgICAnc3JjL3Rlc3RzLyoqLyoudGVzdC50cycsXHJcbiAgICAgICdzcmMvdGVzdHMvKiovKi50ZXN0LnRzeCcsXHJcbiAgICBdLFxyXG5cclxuICAgIGNvdmVyYWdlOiB7XHJcbiAgICAgIHByb3ZpZGVyOiAndjgnLFxyXG4gICAgICByZXBvcnRlcjogWyd0ZXh0JywgJ2pzb24nLCAnaHRtbCddLFxyXG4gICAgICB0aHJlc2hvbGRzOiB7XHJcbiAgICAgICAgbGluZXM6IDgwLFxyXG4gICAgICAgIGZ1bmN0aW9uczogODAsXHJcbiAgICAgICAgYnJhbmNoZXM6IDcwLFxyXG4gICAgICB9LFxyXG4gICAgICBleGNsdWRlOiBbXHJcbiAgICAgICAgJ3NyYy9zZXR1cFRlc3RzLnRzJyxcclxuICAgICAgICAnKiovKi5zdG9yaWVzLnRzeCcsXHJcbiAgICAgICAgJ2Rpc3QvKionLFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICB9XHJcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTywyQkFBMkI7QUFDbEMsT0FBTyxVQUFVO0FBSmpCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsc0JBQXNCLENBQUM7QUFBQSxFQUUxQyxPQUFPO0FBQUEsSUFDTCxLQUFLO0FBQUEsTUFDSCxPQUFPLEtBQUssUUFBUSxrQ0FBVyxzQkFBc0I7QUFBQSxNQUNyRCxNQUFNO0FBQUEsTUFDTixTQUFTLENBQUMsTUFBTTtBQUFBLE1BQ2hCLFVBQVUsTUFBTTtBQUFBLElBQ2xCO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUM7QUFBQSxJQUNiO0FBQUEsSUFDQSxRQUFRO0FBQUEsRUFDVjtBQUFBLEVBRUEsUUFBUTtBQUFBLElBQ04sZUFBZSxDQUFDO0FBQUEsRUFDbEI7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLEtBQUs7QUFBQSxJQUVMLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUVBLFVBQVU7QUFBQSxNQUNSLFVBQVU7QUFBQSxNQUNWLFVBQVUsQ0FBQyxRQUFRLFFBQVEsTUFBTTtBQUFBLE1BQ2pDLFlBQVk7QUFBQSxRQUNWLE9BQU87QUFBQSxRQUNQLFdBQVc7QUFBQSxRQUNYLFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
