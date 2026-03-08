import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/sawt/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/*.png", "data/fonts/*"],
      manifest: {
        name: "Sawt — Quran Recitations",
        short_name: "Sawt",
        description: "Quran Recitation App",
        theme_color: "#3B6E46",
        background_color: "#F9F8F5",
        display: "standalone",
        orientation: "portrait",
        scope: "/sawt/",
        start_url: "/sawt/",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,woff2}"],
        runtimeCaching: [
          {
            // Cache Quran audio files
            urlPattern: /^https:\/\/audio-cdn\.tarteel\.ai\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "quran-audio",
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Cache Quran.com API (surah list)
            urlPattern: /^https:\/\/api\.quran\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "quran-api",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
    }),
  ],
});
