import react from '@vitejs/plugin-react';
import path from 'path';
import type {OutputOptions} from 'rollup';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import {libInjectCss} from 'vite-plugin-lib-inject-css';

function getRollupOutputConfig(format: 'es' | 'cjs'): OutputOptions {
  return {
    format,
    exports: 'named',
    entryFileNames: format === 'es' ? '[name].mjs' : '[name].cjs',
    preserveModules: true,
    preserveModulesRoot: 'src',
    dir: 'dist',
  };
}

export default defineConfig(({command}) => ({
  plugins: [
    react(),
    // Emit each chunk's CSS as a real `.css` file and inject an `import` for it
    // at the top of that chunk's JS, so styles load automatically when a module
    // is imported. Matches the markdown / base / music packages.
    libInjectCss(),
    dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
    externalizeDeps(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Dev only (the standalone demo harness): resolve the workspace lab
      // packages to their SOURCE instead of their built dist. The dist ships
      // CSS-module classes hashed at each lab's build time (and referenced by
      // that hash in the dist JS); consuming it in `vite dev` either drops the
      // CSS (pre-bundling) or re-hashes the `.module.css` selectors so they no
      // longer match — leaving the shell / dialogs unstyled. Building from source
      // lets Vite hash CSS and JS together in one consistent pass, and keeps a
      // single base (`@code-dot-org/lab`) instance so the redux store stays a
      // singleton. The library build keeps the real (externalized) dependencies —
      // this alias never applies there (`command === 'serve'` only).
      ...(command === 'serve'
        ? {
            '@code-dot-org/codebridge': path.resolve(
              __dirname,
              '../codebridge/src',
            ),
            // More specific than the '@code-dot-org/lab' prefix below, so it must
            // come first: the scss lives outside the src root the prefix assumes.
            '@code-dot-org/lab/styles/variables.scss': path.resolve(
              __dirname,
              '../base/src/components/layout/variables.scss',
            ),
            '@code-dot-org/lab': path.resolve(__dirname, '../base/src'),
          }
        : {}),
    },
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      // `src/fixtures/index.ts` is an explicit entry so its JS emits at
      // dist/fixtures/index.* — the `./mocks` export subpath resolves to it.
      entry: ['src/index.ts', 'src/fixtures/index.ts'],
      name: 'python-lab',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
}));
