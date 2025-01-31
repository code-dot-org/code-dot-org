import {defineConfig} from 'tsup';
import {postcssModules, sassPlugin} from 'esbuild-sass-plugin';
import type {Options} from 'tsup';
import {glob} from 'glob';

const entryPoints = glob.sync('./src/**/index.ts', {
  posix: true,
  ignore: './src/common/index.ts',
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
        transform: postcssModules({
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        }),
      }),
    ],
  };
}

export default defineConfig([createConfig('cjs'), createConfig('esm')]);
