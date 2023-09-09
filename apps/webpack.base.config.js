const webpack = require('webpack');
const path = require('path');
const envConstants = require('./envConstants');
const sass = require('sass');

const p = (...paths) => path.resolve(__dirname, ...paths);

// Certain packages ship in ES6 and need to be transpiled for our purposes.
const nodeModulesToTranspile = [
  // All of our @cdo- and @dsco_-aliased files should get transpiled as they are our own
  // source files.
  '@cdo',
  '@dsco_',
  // playground-io ships in ES6 as of 0.3.0
  'playground-io',
  'json-parse-better-errors',
  '@blockly/field-grid-dropdown',
  '@blockly/keyboard-navigation',
  '@blockly/plugin-scroll-options',
  'blockly',
  '@code-dot-org/dance-party',
  '@code-dot-org/johnny-five',
  '@code-dot-org/remark-plugins',
  'firmata',
  // parse5 ships in ES6: https://github.com/inikulin/parse5/issues/263#issuecomment-410745073
  'parse5',
  'vmsg',
  'ml-knn',
  'ml-array-max',
  'ml-array-min',
  'ml-array-rescale',
  'ml-distance-euclidean',
  '@codemirror',
  'style-mod',
  '@lezer',
  'microsoft-cognitiveservices-speech-sdk',
  'slate',
  'react-loading-skeleton',
  'unified',
].map(path => p('node_modules', path));

// As of Webpack 5, Node APIs are no longer automatically polyfilled.
// resolve.fallback resolves the API to its NPM package, and the plugin
// makes the API available as a global.
const nodePolyfillConfig = {
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      events: 'events',
      stream: 'stream-browserify',
      path: 'path-browserify',
      process: 'process/browser',
      timers: 'timers-browserify',
    }),
  ],
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'),
      events: require.resolve('events/'),
      path: require.resolve('path-browserify'),
      'process/browser': require.resolve('process/browser'),
      stream: require.resolve('stream-browserify'),
      timers: require.resolve('timers-browserify'),
      crypto: false,
    },
  },
};

function devtool({minify} = {}) {
  if (process.env.CI) {
    return 'eval';
  } else if (minify) {
    return 'source-map';
  } else if (process.env.DEBUG_MINIFIED) {
    return 'eval-source-map';
  } else if (process.env.DEV) {
    return 'inline-cheap-source-map';
  } else {
    return 'inline-source-map';
  }
}

// alias '@cdo/aichat/locale' => 'src/aichat/locale-do-not-import.js'
const localeDoNotImport = (cdo, dir = 'src') => [
  cdo,
  p(cdo.replace(/^@cdo/, dir).replace(/locale$/, 'locale-do-not-import.js')),
];

// alias '@cdo/gamelab/locale' => 'src/p5lab/locale-do-not-import.js'
const localeDoNotImportP5Lab = (cdo, dir = 'src') => [
  cdo,
  localeDoNotImport(cdo.replace(/^@cdo/, `${dir}/p5lab`)),
];

// Our base webpack config, from which our other configs are derived
//
// To find our main webpack config (that runs on e.g. `npm run build`),
// see `createWepbackConfig()` in `webpack.config.js`. That function
// extends this config with many more plugins etc.
const baseConfig = {
  plugins: [...nodePolyfillConfig.plugins],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {...nodePolyfillConfig.resolve.fallback},
    alias: {
      '@cdo/locale': path.resolve(
        __dirname,
        'src/util/locale-do-not-import.js'
      ),
      ...Object.fromEntries([
        localeDoNotImport('@cdo/aichat/locale'),
        localeDoNotImport('@cdo/applab/locale'),
        localeDoNotImport('@cdo/javalab/locale'),
        localeDoNotImport('@cdo/music/locale'),
        localeDoNotImport('@cdo/netsim/locale'),
        localeDoNotImport('@cdo/regionalPartnerMiniContact/locale'),
        localeDoNotImport('@cdo/regionalPartnerSearch/locale'),
        localeDoNotImport('@cdo/standaloneVideo/locale'),
        localeDoNotImport('@cdo/tutorialExplorer/locale'),
        localeDoNotImport('@cdo/weblab/locale'),
        localeDoNotImportP5Lab('@cdo/gamelab/locale'),
        localeDoNotImportP5Lab('@cdo/poetry/locale'),
        localeDoNotImportP5Lab('@cdo/spritelab/locale'),
      ]),
      '@cdo/apps': p('src'),
      '@cdo/static': p('static'),
      repl: p('src/noop'),
      '@cdo/storybook': p('.storybook'),
      serialport: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.ejs$/,
        include: [p('src'), p('test')],
        loader: 'ejs-webpack-loader',
      },
      {test: /\.css$/, use: [{loader: 'style-loader'}, {loader: 'css-loader'}]},

      {
        test: /\.scss$/,
        use: [
          {loader: 'style-loader'},
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                localIdentName: process.env.DEV
                  ? '[path][name]__[local]'
                  : '[hash:base64]',
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: sass,
              sassOptions: {
                includePaths: [p('../shared/css')],
                outputStyle: 'compressed',
              },
            },
          },
        ],
      },

      {test: /\.interpreted.js$/, type: 'asset/source'},
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        include: [
          p('static'),
          p('src'),
          p('test'),
          p('../dashboard/app/assets/images'),
        ],
        // note that in the name template given below, a dash prefixing
        // the hash is explicitly avoided. If rails tries to serve
        // this file when asset digests are turned off, it will return a
        // 404 because it thinks the hash is a digest and it won't
        // be able to find the file without the hash. :( :(
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024,
              // uses the file-loader when file size is over the limit
              name: '[name]wp[contenthash].[ext]',
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.[j]sx?$/,
        enforce: 'pre',
        include: [...nodeModulesToTranspile, p('src'), p('test')],
        exclude: [p('src/lodash.js')],
        loader: 'esbuild-loader',
        options: {
          loader: 'jsx',
          // cacheDirectory: p('.babel-cache'),
          // compact: false,
          target: 'es2015',
        },
      },
      {
        test: /\.[t]sx?$/,
        enforce: 'pre',
        loader: 'esbuild-loader',
        options: {
          // cacheDirectory: p('.babel-cache'),
          // compact: false,
          target: 'es2015',
        },
      },
      // {
      //   test: /\.tsx?$/,
      //   use: 'ts-loader',
      //   exclude: /node_modules/,
      // },
      // modify baseConfig's preLoaders if looking for code coverage info
      ...(envConstants.COVERAGE
        ? [
            {
              test: /\.jsx?$/,
              enforce: 'post',
              loader: 'istanbul-instrumenter-loader',
              include: p('src'),
              exclude: [
                // we need to turn off instrumentation for this file
                // because we have tests that actually make assertions
                // about the contents of the compiled version of this file :(
                p('src/flappy/levels.js'),
              ],
              options: {
                cacheDirectory: true,
                compact: false,
                esModules: true,
              },
            },
          ]
        : []),
    ],
    noParse: [/html2canvas/],
  },
};

// if (envConstants.HOT) {
//   baseConfig.module.loaders.push({
//     test: /\.jsx?$/,
//     loader: 'react-hot-loader',
//     include: [p('src')],
//   });
// }

module.exports = {
  baseConfig,
  devtool,
  localeDoNotImport,
};
