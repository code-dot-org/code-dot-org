import {postcssModules, sassPlugin} from 'esbuild-sass-plugin';
import {glob} from 'glob';
import {spawnSync} from 'node:child_process';
import type {Options} from 'tsup';
import {defineConfig} from 'tsup';

const entryPoints = glob.sync('./src/**/index.ts', {
  posix: true,
});

let successes = 0;

/**
 * Creates a tsup configuration object for a given format
 * @param format The output mode for the configuration, `cjs` or `esm`
 * @returns tsup configuration object
 */
function createConfig(format: 'cjs' | 'esm'): Options {
  return {
    entry: entryPoints,
    outDir: `dist/${format}`,
    target: 'es2019',
    format: [format],
    // Externalize peer dependencies to avoid bundling them - the consuming app provides these
    // Also externalize all @code-dot-org/* workspace packages to ensure singletons (like Redux store) are shared
    // Note: Don't externalize './index.css' - let esbuild handle CSS imports so they resolve correctly
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'classnames',
      'swiper',
      /^@code-dot-org\//,
    ],
    dts: false, // See typescript generator below
    splitting: false,
    async onSuccess() {
      successes++;
      if (successes === 2) {
        console.log(`Generating typescript types...`);
        // This generates the .d.ts files using the official typescript compiler, `tsc`
        // rather than using the esbuild implementation that uses the Microsoft API Extractor
        const tsc = spawnSync('tsc', [
          '--emitDeclarationOnly',
          '--declaration',
          '--project',
          'src',
          '--outDir',
          `dist/types`,
        ]);
        const tscAlias = spawnSync('tsc-alias', [
          '-p',
          'tsconfig.json',
          '--outDir',
          `dist/types`,
        ]);

        if (tsc.status === 0 && tscAlias.status === 0) {
          console.log(`Generating typescript types success`);
        } else {
          console.error(`Generating typescript types failed`);
          console.error('tsc:', tsc.stdout.toString(), tsc.stderr.toString());
          console.error(
            'tsc-alias:',
            tscAlias.stdout.toString(),
            tscAlias.stderr.toString(),
          );
        }
      }
    },
    sourcemap: true,
    esbuildPlugins: [
      sassPlugin({
        type: 'css',
        transform: postcssModules({
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        }),
      }),
    ],
  };
}

export default defineConfig([createConfig('cjs'), createConfig('esm')]);
