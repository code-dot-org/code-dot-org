import react from '@vitejs/plugin-react';
import {defineConfig, searchForWorkspaceRoot, type Plugin} from 'vite';
import path from 'node:path';
import {VitePWA} from 'vite-plugin-pwa';

const LOCALE_FONTS = /^@code-dot-org\/fonts\/locales\//;
const NO_LOCALE_FONTS = '\0no-locale-fonts';
const BRAND_FONTS = /\/fonts\/dist\/brands\/[^/]+\/index\.css$/;
const FONT_FACE = /@font-face\s*\{[^}]*\}/g;
const KEPT_FAMILY = /font-family:\s*["']?(Geist|Barlow Semi Condensed)/;
const LATIN_SUBSET = /-latin-(?!ext-)/;
const WOFF_FALLBACK = /,\s*url\([^)]*\.woff["']?\)\s*format\(["']?woff["']?\)/g;
const FONT_DISPLAY = /font-display:\s*swap/;
// The weights the launcher and congratulations screen draw.
const PRELOADED_FONT = /^assets\/geist-latin-(400|600|700)-normal-.*\.woff2$/;

// The launcher is en-US only, and the build copies every font a stylesheet
// names. @code-dot-org/fonts can import a stylesheet per language (about 19MB
// of fonts), though nothing here calls the importer. Of the brand fonts only
// Geist and Barlow stay, in their Latin subsets and as WOFF2 alone: Noto Sans
// fills in only characters Geist lacks, and Space Grotesk only the letter
// shown when a curriculum's image fails, which falls back to Geist.
//
// The fonts are local files, so text waits for them instead of being drawn
// in a fallback first and redrawn, and the page preloads the ones it uses so
// they arrive with the script rather than after the first render.
function englishFontsOnly(): Plugin {
  return {
    name: 'english-fonts-only',
    enforce: 'pre',
    resolveId: id => (LOCALE_FONTS.test(id) ? NO_LOCALE_FONTS : null),
    load: id => (id === NO_LOCALE_FONTS ? 'export default {};' : null),
    transform(code, id) {
      if (!BRAND_FONTS.test(id)) return null;
      return code.replace(FONT_FACE, rule =>
        KEPT_FAMILY.test(rule) && LATIN_SUBSET.test(rule)
          ? rule
              .replace(WOFF_FALLBACK, '')
              .replace(FONT_DISPLAY, 'font-display: block')
          : '',
      );
    },
    transformIndexHtml: {
      order: 'post',
      handler: (_html, {bundle}) =>
        Object.keys(bundle ?? {})
          .filter(file => PRELOADED_FONT.test(file))
          .map(file => ({
            tag: 'link',
            attrs: {
              rel: 'preload',
              href: `./${file}`,
              as: 'font',
              type: 'font/woff2',
              crossorigin: '',
            },
            injectTo: 'head',
          })),
    },
  };
}

// Relative URLs let the same assets run on a web host and inside Capacitor.
export default defineConfig({
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },
  resolve: {
    dedupe: ['@mui/material', '@emotion/react', '@emotion/styled'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    englishFontsOnly(),
    react(),
    VitePWA({
      injectRegister: false,
      registerType: 'autoUpdate',
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
      },
      manifest: {
        name: 'CodeAI',
        short_name: 'CodeAI',
        description: 'Choose a coding and AI activity.',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#FFFFFF',
        theme_color: '#4C42CF',
        icons: [
          {src: 'pwa-192.png', sizes: '192x192', type: 'image/png'},
          {src: 'pwa-512.png', sizes: '512x512', type: 'image/png'},
        ],
      },
    }),
  ],
});
