const webpack = require('webpack');
const path = require('path');
const envConstants = require('./envConstants');
const sass = require('sass');

// Certain packages ship in ES6 and need to be transpiled for our purposes.
const toTranspileWithinNodeModules = [
  // All of our @cdo- and @dsco_-aliased files should get transpiled as they are our own
  // source files.
  path.resolve(__dirname, 'node_modules', '@cdo'),
  path.resolve(__dirname, 'node_modules', '@dsco_'),
  // playground-io ships in ES6 as of 0.3.0
  path.resolve(__dirname, 'node_modules', 'playground-io'),
  path.resolve(__dirname, 'node_modules', 'json-parse-better-errors'),
  path.resolve(__dirname, 'node_modules', '@blockly', 'field-grid-dropdown'),
  path.resolve(__dirname, 'node_modules', '@blockly', 'keyboard-navigation'),
  path.resolve(__dirname, 'node_modules', '@blockly', 'plugin-scroll-options'),
  path.resolve(__dirname, 'node_modules', 'blockly'),
  path.resolve(__dirname, 'node_modules', '@code-dot-org', 'dance-party'),
  path.resolve(__dirname, 'node_modules', '@code-dot-org', 'johnny-five'),
  path.resolve(__dirname, 'node_modules', '@code-dot-org', 'remark-plugins'),
  path.resolve(__dirname, 'node_modules', 'firmata'),
  // parse5 ships in ES6: https://github.com/inikulin/parse5/issues/263#issuecomment-410745073
  path.resolve(__dirname, 'node_modules', 'parse5'),
  path.resolve(__dirname, 'node_modules', 'vmsg'),
  path.resolve(__dirname, 'node_modules', 'ml-knn'),
  path.resolve(__dirname, 'node_modules', 'ml-array-max'),
  path.resolve(__dirname, 'node_modules', 'ml-array-min'),
  path.resolve(__dirname, 'node_modules', 'ml-array-rescale'),
  path.resolve(__dirname, 'node_modules', 'ml-distance-euclidean'),
  path.resolve(__dirname, 'node_modules', '@codemirror'),
  path.resolve(__dirname, 'node_modules', 'style-mod'),
  path.resolve(__dirname, 'node_modules', '@lezer'),
  path.resolve(
    __dirname,
    'node_modules',
    'microsoft-cognitiveservices-speech-sdk'
  ),
  path.resolve(__dirname, 'node_modules', 'slate'),
  path.resolve(__dirname, 'node_modules', 'react-loading-skeleton'),
  path.resolve(__dirname, 'node_modules', 'unified'),
];

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

const p = _ => path.resolve(__dirname, _);
const localeDoNotImport = (cdo, dir = 'src') => [
  cdo,
  p(cdo.replace(/^@cdo/, dir).replace(/locale$/, 'locale-do-not-import.js')),
];
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
      '@cdo/apps': path.resolve(__dirname, 'src'),
      '@cdo/static': path.resolve(__dirname, 'static'),
      repl: path.resolve(__dirname, 'src/noop'),
      '@cdo/storybook': path.resolve(__dirname, '.storybook'),
      serialport: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.ejs$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
        ],
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
                includePaths: [path.resolve(__dirname, '../shared/css')],
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
          path.resolve(__dirname, 'static'),
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
          path.resolve(__dirname, '../dashboard/app/assets/images'),
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
        test: /\.jsx?$/,
        enforce: 'pre',
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
        ].concat(toTranspileWithinNodeModules),
        exclude: [path.resolve(__dirname, 'src/lodash.js')],
        loader: 'babel-loader',
        options: {
          cacheDirectory: path.resolve(__dirname, '.babel-cache'),
          compact: false,
        },
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
    noParse: [/html2canvas/],
  },
};

if (envConstants.HOT) {
  baseConfig.module.loaders.push({
    test: /\.jsx?$/,
    loader: 'react-hot-loader',
    include: [path.resolve(__dirname, 'src')],
  });
}

// modify baseConfig's preLoaders if looking for code coverage info
if (envConstants.COVERAGE) {
  baseConfig.module.rules.push({
    test: /\.jsx?$/,
    enforce: 'post',
    loader: 'istanbul-instrumenter-loader',
    include: path.resolve(__dirname, 'src'),
    exclude: [
      // we need to turn off instrumentation for this file
      // because we have tests that actually make assertions
      // about the contents of the compiled version of this file :(
      path.resolve(__dirname, 'src/flappy/levels.js'),
    ],
    options: {
      cacheDirectory: true,
      compact: false,
      esModules: true,
    },
  });
}

module.exports = {
  baseConfig,
  devtool,
  localeDoNotImport,
};
