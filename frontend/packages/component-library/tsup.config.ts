import {defineConfig} from 'tsup';
import {postcssModules, sassPlugin} from 'esbuild-sass-plugin';
import type {Options} from 'tsup';
import {glob} from 'glob';
import {spawnSync} from 'node:child_process';

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
    target: 'es2019',
    format: [format],
    dts: false, // See typescript generator below
    async onSuccess() {
      console.log(`Generating typescript types...`);
      // This generates the .d.ts files using the official typescript compiler, `tsc`
      // rather than using the esbuild implementation that uses the Microsoft API Extractor
      const tsc = spawnSync('tsc', [
        '--emitDeclarationOnly',
        '--declaration',
        '--project',
        'src',
        '--outDir',
        `dist/${format}`,
      ]);
      const tscAlias = spawnSync('tsc-alias', [
        '-p',
        'src/tsconfig.json',
        '--outDir',
        `dist/${format}`,
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
    },
    sourcemap: true,
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
