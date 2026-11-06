import react from '@vitejs/plugin-react';
import {tanstackRouter} from '@tanstack/router-plugin/vite';
import {rootRoute, route} from '@tanstack/virtual-file-routes';
import {defineConfig, searchForWorkspaceRoot, type Plugin} from 'vite';
import path from 'node:path';

const LOCALE_FONTS = /^@code-dot-org\/fonts\/locales\//;
const NO_LOCALE_FONTS = '\0no-locale-fonts';
const BRAND_FONTS = /\/fonts\/dist\/brands\/[^/]+\/index\.css$/;
const FONT_FACE = /@font-face\s*\{[^}]*\}/g;
const KEPT_FAMILY =
  /font-family:\s*["']?(Geist|Barlow Semi Condensed|Space Grotesk)/;
const LATIN_SUBSET = /-latin-(?!ext-)/;
const WOFF_FALLBACK = /,\s*url\([^)]*\.woff["']?\)\s*format\(["']?woff["']?\)/g;
const FONT_DISPLAY = /font-display:\s*swap/;
// The weights the launcher and congratulations screen draw.
const PRELOADED_FONT = /^assets\/geist-latin-(400|600|700)-normal-.*\.woff2$/;

// The launcher is en-US only, and the build copies every font a stylesheet
// names. @code-dot-org/fonts can import a stylesheet per language (about 19MB
// of fonts), though nothing here calls the importer. Of the brand fonts only
// Geist, Barlow and Space Grotesk, the headings' and card titles' font, stay,
// in their Latin subsets and as WOFF2 alone: Noto Sans fills in only
// characters Geist lacks.
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

const FONT_AWESOME_SHEET =
  /https:\/\/dsco\.code\.org\/assets\/font-awesome-pro\/\d+\/css\/(fontawesome|solid)\.min\.css/g;
const FONT_AWESOME_FONT =
  /url\((https:\/\/dsco\.code\.org\/assets\/font-awesome-pro\/\d+\/webfonts\/([\w-]+\.woff2))\)\s*format\("woff2"\)(?:,\s*url\([^)]*\)\s*format\("truetype"\))?/g;
const LOCAL_FONT_AWESOME = 'assets/font-awesome-pro';

// The app's offline screen draws Font Awesome Pro icons, but the WebView will
// not serve dsco.code.org's files from its cache when the app starts offline.
// The build fetches the stylesheets solid icons need, and their font, into
// the output, and @code-dot-org/fonts names these copies in place of
// dsco.code.org's; its other stylesheets still load from there. Pro files
// may not go in a public repository, so they are fetched, not committed.
function localFontAwesome(): Plugin {
  const sheets = new Map<string, string>();
  return {
    name: 'local-font-awesome',
    apply: 'build',
    transform(code) {
      if (!code.includes('dsco.code.org/assets/font-awesome-pro/')) return null;
      return code.replace(FONT_AWESOME_SHEET, (url, name: string) => {
        const file = `${LOCAL_FONT_AWESOME}/css/${name}.min.css`;
        sheets.set(file, url);
        return `./${file}`;
      });
    },
    async generateBundle() {
      if (sheets.size === 0) {
        this.error('@code-dot-org/fonts names no Font Awesome stylesheet');
      }
      const fonts = new Map<string, string>();
      for (const [file, url] of sheets) {
        const css = (await download(url).then(r => r.text())).replace(
          FONT_AWESOME_FONT,
          (_rule, fontUrl: string, name: string) => {
            fonts.set(`${LOCAL_FONT_AWESOME}/webfonts/${name}`, fontUrl);
            return `url(../webfonts/${name}) format("woff2")`;
          },
        );
        if (css.includes('dsco.code.org')) {
          this.error(`${url} names a file the build does not copy`);
        }
        this.emitFile({type: 'asset', fileName: file, source: css});
      }
      for (const [file, url] of fonts) {
        const font = new Uint8Array(await (await download(url)).arrayBuffer());
        this.emitFile({type: 'asset', fileName: file, source: font});
      }
    },
  };
}

async function download(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url}: ${response.status}`);
  }
  return response;
}

// The only pages the app serves. Lab routes stay out, and so does the lab code
// they load, which the app never requests: labs run on studio.code.org.
const MOBILE_ROUTES = rootRoute('__root.tsx', [
  route('/launcher', 'launcher.tsx'),
  route('/offline', 'offline.tsx'),
]);
const MOBILE_ROUTE_TREE = path.resolve(
  __dirname,
  'src/routeTree.mobile.gen.ts',
);

// Builds the shell that Capacitor packages into the Android app, starting at
// /launcher. The output is loaded from local files, so asset URLs are
// relative and index.html sits at the root of dist-mobile, where
// apps/mobile expects it. vite.config.ts stays the Rails build.
export default defineConfig({
  // src/config/buildMode.ts reads this mode.
  mode: 'mobile',
  base: './',
  publicDir: false,
  build: {
    outDir: path.resolve(__dirname, 'dist-mobile'),
    emptyOutDir: true,
  },
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },
  resolve: {
    dedupe: ['@mui/material', '@emotion/react', '@emotion/styled'],
    alias: [
      {find: /^@\/routeTree\.gen$/, replacement: MOBILE_ROUTE_TREE},
      {find: '@', replacement: path.resolve(__dirname, './src')},
    ],
  },
  plugins: [
    englishFontsOnly(),
    localFontAwesome(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      virtualRouteConfig: MOBILE_ROUTES,
      generatedRouteTree: MOBILE_ROUTE_TREE,
    }),
    react(),
  ],
});
