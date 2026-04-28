import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/ — build:1777369614
export default defineConfig(() => ({
  server: {
    host: "127.0.0.1",
    port: 8080,
    strictPort: true,
    cors: false,
    origin: "http://127.0.0.1:8080",
    fs: {
      strict: true,
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("lucide-react")) return "icons-vendor";
          if (id.includes("clsx") || id.includes("tailwind-merge") || id.includes("class-variance-authority")) return "ui-utils-vendor";
          if (id.includes("sonner")) return "toast-vendor";
          if (id.includes("@supabase/supabase-js")) return "supabase-vendor";
          if (id.includes("@radix-ui")) return "radix-vendor";
          if (id.includes("react-router-dom")) return "router-vendor";
          if (id.includes("@tanstack/react-query")) return "query-vendor";
          return "vendor";
        },
      },
    },
  },
}));
