import {webglPlugin} from "esbuild-plugin-webgl";
import {postcssModules, sassPlugin} from 'esbuild-sass-plugin';
import fs from 'fs';
import {glob} from 'glob';
import {spawnSync} from 'node:child_process';
import type {Options} from 'tsup';
import {defineConfig} from 'tsup';

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
    target: 'es2019',
    format: [format],
    external: ['./index.css'],
    dts: false, // See typescript generator below
    splitting: false,
    async onSuccess() {
      const buildSentinel = `.tsup.building.cjs`;
      if (format === 'cjs') {
        if (!fs.existsSync(buildSentinel)) {
          fs.writeFileSync(buildSentinel, '');
        }
      } else {
        if (fs.existsSync(buildSentinel)) {
          console.error('Not building types for esm since cjs type generation failed.');
          fs.unlinkSync(buildSentinel);
          return;
        }
      }

      console.log('Generating typescript types...');
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
      const tscAlias = tsc.status === 0 ? spawnSync('tsc-alias', [
        '-p',
        'tsconfig.json',
        '--outDir',
        `dist/${format}`,
      ]) : {status: -1};

      if (tsc.status === 0 && tscAlias.status === 0) {
        console.log(`Generating typescript types success`);
        if (fs.existsSync(buildSentinel)) {
          fs.unlinkSync(buildSentinel);
        }
      } else {
        console.error(`Generating typescript types failed`);
        console.error('tsc:', tsc.stdout.toString(), tsc.stderr.toString());
        if (tsc.status === 0) {
          console.error(
            'tsc-alias:',
            tscAlias.stdout.toString(),
            tscAlias.stderr.toString(),
          );
        }
        else {
          console.error('tsc-alias: did not run due to tsc errors');
        }
      }
    },
    sourcemap: true,
    esbuildPlugins: [
      webglPlugin(),
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
