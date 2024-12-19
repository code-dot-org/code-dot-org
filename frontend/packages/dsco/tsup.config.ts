import {defineConfig} from 'tsup';
import {postcssModules, sassPlugin} from 'esbuild-sass-plugin';
import {glob} from 'glob';
import {resolve} from 'node:path';

const entryPoints = glob.sync('./src/**/index.ts', {
  posix: true,
});

export default defineConfig({
  entry: entryPoints,
  clean: true,
  target: 'es2019',
  format: ['cjs', 'esm'],
  external: [
    '/fonts/barlowSemiCondensed/BarlowSemiCondensed-Medium.ttf',
    '/fonts/barlowSemiCondensed/BarlowSemiCondensed-SemiBold.ttf',
  ],
  esbuildPlugins: [
    sassPlugin({
      type: 'style',
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
});
