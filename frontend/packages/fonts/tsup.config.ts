import {sassPlugin} from 'esbuild-sass-plugin';
import {glob} from 'glob';
import {resolve} from 'node:path';
import type {Options} from 'tsup';
import {defineConfig} from 'tsup';

import {LOCALES_WITH_INTERNATIONAL_FONTS} from '@/constants';

/**
 * Creates a tsup configuration object for a given format
 * @param format The output mode for the configuration, `cjs` or `esm`
 * @returns tsup configuration object
 */
function createJavascriptConfig(format: 'cjs' | 'esm'): Options {
  return {
    entry: [
      './src/index.ts',
      './src/loader/index.ts',
      './src/react/FontLoader/index.tsx',
    ],
    outDir: `dist/${format}`,
    clean: true,
    dts: true,
    // The following is located within this package, however they are supposed to be
    // dynamically imported at runtime and therefore, should be excluded from the compiled
    // bundle.
    external: LOCALES_WITH_INTERNATIONAL_FONTS.map(
      locale => `@code-dot-org/fonts/locales/${locale}/index.module.css`,
    ),
    target: 'es2019',
    format: [format],
    sourcemap: true,
  };
}

function createLocaleCSSConfig(entryPoints: string[], outDir: string): Options {
  return {
    entry: entryPoints,
    outDir: outDir,
    clean: true,
    format: 'esm',
    target: 'es2019',
    sourcemap: true,
    bundle: true,
    loader: {
      '.woff': 'file',
      '.woff2': 'file',
    },
    metafile: true,
    esbuildPlugins: [
      {
        name: 'esbuild-load-fonts',
        setup(build) {
          /**
           * This custom plugin loads woff and woff2 fonts that are installed via fontsource in node modules.
           * When esbuild runs, it will attempt to resolve `~@fontsource/figtree`, but this will fail as esbuild
           * does not recognize the sass `~` pointer. This plugin resolves this pointer by removing it.
           *
           * Then, this plugin also resolves the node_modules path to provide a file reference to the actual font file.
           * This then allows esbuild to load the file as a distributable file in the `dist` folder.
           *
           * This methodology allows only fonts that are actually used by Code.org to be distributed in a central package.
           */
          build.onResolve(
            {filter: /^~.*\.(woff|woff2)$/},
            async ({path, importer, resolveDir}) => {
              const result = await build.resolve(path.slice(1), {
                importer,
                resolveDir,
                kind: 'import-statement',
              });

              return {
                // Convert relative path to node module to absolute for esbuild
                path: resolve('node_modules', result.path),
                external: false,
              };
            },
          );
        },
      },
      sassPlugin({
        type: 'css',
        cssImports: false,
      }),
    ],
  };
}

/**
 * Gets all the locale specific font configuration as entrypoints
 */
const localizedEntryPoints = glob.sync('./src/locales/**/index.module.scss', {
  posix: true,
});

const cssEntrypointsByLocale = createLocaleCSSConfig(
  localizedEntryPoints,
  'dist/locales',
);

/**
 * The default fonts for Code.org as an entrypoint
 */
const defaultCSSEntrypoints = createLocaleCSSConfig(
  ['./src/index.scss'],
  'dist',
);

export default defineConfig([
  defaultCSSEntrypoints,
  cssEntrypointsByLocale,
  createJavascriptConfig('cjs'),
  createJavascriptConfig('esm'),
]);
