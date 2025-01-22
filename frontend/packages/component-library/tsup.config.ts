import {defineConfig} from 'tsup';
import {postcssModules, sassPlugin} from 'esbuild-sass-plugin';
import type {Options} from 'tsup';
import {glob} from 'glob';
import {resolve} from 'node:path';

const entryPoints = glob.sync('./src/**/index.ts', {
  posix: true,
});

/**
 * Creates a tsup configuration object for a given format
 * @param format The output mode for the configuration, `cjs` or `esm`
 * @returns tsup configuration object
 */
function createConfig(format: 'cjs' | 'esm'): Options {
  return {
    entry: entryPoints,
    outDir: `dist/${format}`,
    clean: true,
    target: 'es2019',
    format: [format],
    external: [
      '/fonts/barlowSemiCondensed/BarlowSemiCondensed-Medium.ttf',
      '/fonts/barlowSemiCondensed/BarlowSemiCondensed-SemiBold.ttf',
    ],
    esbuildPlugins: [
      sassPlugin({
        // In ESM mode, CSS Modules are generated which can be cached via the CSS loader.
        // In CJS mode, styles are injected into the DOM (resulting in a lengthy DOM and lower performance)
        // CJS mode is utilized by `code-dot-org/apps`, whereas newer applications (such as `marketing`) use ESM mode by default.
        type: format === 'esm' ? 'css' : 'style',
        filter: /\.module\.scss$/,
        loadPaths: ['@code-dot-org/legacy-css'],
        transform: postcssModules({
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        }),
        importMapper: path => {
          // Convert any references to @ to the ./src directory
          // Note: sass will detect relative paths if the file exists
          // resulting in a situation where if the file is found relatively
          // it results in a nested import statement when esbuild tries to resolve it.
          // To avoid this, remove any strings prior to `@` and replace it with `./src/`
          // See: https://github.com/glromeo/esbuild-sass-plugin/issues/136#issuecomment-1542828117
          return resolve(__dirname, path.replace(/^(.*?)@\//, './src/'));
        },
      }),
    ],
  };
}

export default defineConfig([createConfig('cjs'), createConfig('esm')]);
