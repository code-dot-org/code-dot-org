import react from '@vitejs/plugin-react';
import path from 'path';
import type {OutputOptions} from 'rollup';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import {libInjectCss} from 'vite-plugin-lib-inject-css';

/**
 * Rename emitted CSS-module assets from `*.module.css` to plain `*.css` (and
 * lib-inject-css's injected `import` follows the rename). This matters when
 * another Vite app consumes this package's `dist`: a file still named
 * `.module.css` gets the CSS-modules transform re-run and its selectors
 * re-hashed, so they no longer match the class names already baked into this
 * package's JS — leaving components unstyled (e.g. the studio app). The scoping
 * hash is applied at build time here, so the plain `.css` is self-contained.
 * Every other asset keeps the path lib-inject-css/preserveModules gave it.
 */
const stripModuleFromCssName: OutputOptions['assetFileNames'] = info => {
  const name = info.names?.[0];
  if (name?.endsWith('.module.css')) {
    return name.replace(/\.module\.css$/, '.css');
  }
  return name ?? 'assets/[name]-[hash][extname]';
};

function getRollupOutputConfig(format: 'es' | 'cjs'): OutputOptions {
  return {
    format,
    exports: 'named',
    entryFileNames: format === 'es' ? '[name].mjs' : '[name].cjs',
    preserveModules: true,
    preserveModulesRoot: 'src',
    dir: 'dist',
    assetFileNames: stripModuleFromCssName,
  };
}

// The three demo surfaces built as a production MPA (see `isDemo` below). The
// two sandbox pages live under `sandbox/` and emit there, which is what gives
// their service worker a scope of its own — see `SANDBOX_SURFACE_DIR`.
const demoInput = (root: string) => ({
  index: path.resolve(root, 'index.html'),
  preview: path.resolve(root, 'sandbox/preview.html'),
  compile: path.resolve(root, 'sandbox/compile.html'),
});

export default defineConfig(({command, mode}) => {
  // A standalone PRODUCTION static build of the demo harness (the three HTML
  // surfaces), so we can measure real deployed boot cost against the dev server.
  //   yarn build:demo   → dist-demo/  (minified, hashed, one bundle per surface)
  //   yarn preview:demo → serves dist-demo/ on :5139 (app) and :5202 (sandbox)
  // It is a normal app (MPA) build, kept entirely separate from the default
  // library build (`vite build`) the studio host consumes: no lib mode, and none
  // of the library-only plugins (libInjectCss/dts/externalizeDeps — the last
  // would wrongly externalize react/phaser/… from a self-contained app).
  const isDemo = command === 'build' && mode === 'demo';
  // Both the dev server and the demo app must bundle the workspace lab packages
  // from SOURCE (see the alias note below); only the library build externalizes
  // them.
  const useSourceAliases = command === 'serve' || isDemo;

  // Where the demo is served FROM, when that is not the root of an origin —
  // `https://wilkie.github.io/world-lab/` needs `/world-lab/`. Read for every
  // command, not just the demo build, so `preview:demo` serves a based build at
  // the path it was built for. The default is the root, which is what the dev server and
  // the library build have always assumed.
  //
  // Everything the app addresses absolutely is derived from this: the two
  // service workers, the vendored sandbox assets, the stock backdrops (see
  // `src/main.tsx`). A build put at a path it was not built for will 404 on all
  // of them.
  const base = process.env.WORLD_DEMO_BASE ?? '/';

  // Which icon set this build carries. One knob for both halves of the job:
  // `yarn setup:world` copies FontAwesome Free into `public/vendor/` when it is
  // `free`, and the app points at that copy when it reads the same value here.
  // Two variables for one decision would let them disagree.
  const icons = process.env.WORLD_DEMO_ICONS ?? '';

  return {
    base,
    define: {
      'import.meta.env.VITE_WORLD_ICONS': JSON.stringify(icons),
    },
    plugins: isDemo
      ? [react()]
      : [
          react(),
          // Emit each chunk's CSS as a real `.css` file and inject an `import`
          // for it at the top of that chunk's JS, so styles load automatically
          // when a module is imported. Matches markdown / base / music / web.
          libInjectCss(),
          dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
          externalizeDeps(),
        ],
    // Dev only (Vite ignores optimizeDeps for a build). By default the dep
    // scanner crawls only index.html, so the sandbox surfaces' deps — reached
    // through sandbox/preview.html and sandbox/compile.html and two levels of
    // dynamic import — are discovered LATE, when the iframe loads. Vite then
    // re-optimizes and forces a full-page reload mid-boot; chained, that is the
    // slow "8-9s first load".
    // Scanning all three entries pre-bundles the union in ONE startup pass, and
    // listing the two biggest sandbox deps (past the dynamic imports the scanner
    // can miss) guarantees they are ready before the iframe asks for them.
    optimizeDeps: {
      entries: ['index.html', 'sandbox/preview.html', 'sandbox/compile.html'],
      include: ['phaser', 'esbuild-wasm'],
    },
    // Dev only (`server` is ignored by a build). optimizeDeps above pre-bundles
    // the third-party deps at startup, but the first browser load still pays to
    // transform the app's OWN (unbundled) source graph on demand. Warming the
    // two entry modules transforms those graphs at startup instead, moving that
    // cost off the first load: `main.tsx` is the app shell, `entry.ts` is both
    // sandbox surfaces (preview + compile).
    server: {
      warmup: {
        clientFiles: ['./src/main.tsx', './src/runtime/sandbox/entry.ts'],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Dev server + demo build only: resolve the workspace lab packages to
        // their SOURCE instead of their built dist. The dist ships CSS-module
        // classes hashed at each lab's build time (and referenced by that hash
        // in the dist JS); consuming it either drops the CSS (pre-bundling) or
        // re-hashes the `.module.css` selectors so they no longer match —
        // leaving the shell / dialogs unstyled. Building from source lets Vite
        // hash CSS and JS together in one consistent pass, and keeps a single
        // base (`@code-dot-org/lab`) instance so the redux store stays a
        // singleton. The library build keeps the real (externalized)
        // dependencies — this alias never applies there.
        ...(useSourceAliases
          ? {
              '@code-dot-org/codebridge': path.resolve(
                __dirname,
                '../codebridge/src',
              ),
              // More specific than the '@code-dot-org/lab' prefix below, so it
              // must come first: the scss lives outside the src root the prefix
              // assumes.
              '@code-dot-org/lab/styles/variables.scss': path.resolve(
                __dirname,
                '../base/src/components/layout/variables.scss',
              ),
              '@code-dot-org/lab': path.resolve(__dirname, '../base/src'),
            }
          : {}),
      },
    },
    build: isDemo
      ? {
          // Production MPA build of the demo harness → dist-demo/. Minified and
          // hashed by Vite's defaults; each surface gets one bundle.
          outDir: 'dist-demo',
          emptyOutDir: true,
          // No maps: they are 29MB of the 78MB this build weighed, on a static
          // host that serves what it is given. The library build keeps its own
          // (`sourcemap: true` below) — that one is debugged inside studio.
          sourcemap: false,
          rollupOptions: {input: demoInput(__dirname)},
        }
      : {
          sourcemap: true,
          cssCodeSplit: true,
          lib: {
            // `src/fixtures/index.ts` is an explicit entry so its JS emits at
            // dist/fixtures/index.* — the `./mocks` export subpath resolves to
            // it.
            entry: ['src/index.ts', 'src/fixtures/index.ts'],
            name: 'world-lab',
            formats: ['es', 'cjs'],
          },
          rollupOptions: {
            output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
          },
        },
  };
});
