import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      devOptions: {
        enabled: true,
      },
      strategies: "generateSW",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "autoUpdate",
      
      manifest: {
        name: "Thandal Management APP",
        short_name: "Thandal",
        icons: [
          {
            "src": "manifest-icon-192.maskable.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "manifest-icon-192.maskable.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "manifest-icon-512.maskable.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "manifest-icon-512.maskable.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          }
        ],
        theme_color: "#1a1a1a",
        background_color: "#1a1a1a",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
      },
    }),
  ],
});