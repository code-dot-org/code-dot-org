const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const commonConfig = {
  devtool: 'eval-cheap-module-source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    // Note: Separate aliases are required for aliases to work in unit tests. These should
    // be added in package.json in the jest configuration.
    alias: {
      '@ml': path.resolve(__dirname, 'src'),
      '@public': path.resolve(__dirname, 'public'),
    },
  },
  output: {
    filename: '[name].js',
    library: {
      type: 'umd',
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8192,
          },
        },
        generator: {
          // URLs resolve to `<__webpack_public_path__>images/<name>`
          // at runtime. The consumer sets the public path via
          // `__ml_playground_asset_public_path__` (see
          // `src/setPublicPath.ts`); leaving an `assets/` prefix here
          // would double up against consumer paths that already end
          // in `assets/` or similar, so the prefix lives entirely on
          // the consumer side.
          filename: 'images/[name][ext][query]',
        },
      },
    ],
  },
  performance: {
    assetFilter: function (assetFilename) {
      return /^assets\//.test(assetFilename);
    },
    maxAssetSize: 300000,
    maxEntrypointSize: 10500000,
  },
};

const firstConfigOnly = {
  output: {
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'public/datasets/*.*',
          to: 'assets/datasets/[name][ext]',
        },
      ],
    }),
  ],
};

const externalConfig = {
  externals: {
    lodash: 'lodash',
    react: 'react',
    'react-dom': 'react-dom',
    'react/jsx-runtime': 'react/jsx-runtime',
  },
};

const defaultConfig = [
  {
    entry: {
      assetPath: './src/assetPath.ts',
    },
    ...commonConfig,
    ...firstConfigOnly,
    ...externalConfig,
    output: {
      ...commonConfig.output,
      ...firstConfigOnly.output,
    },
  },
  {
    entry: {
      mainDev: './src/indexDev.tsx',
    },
    ...commonConfig,
  },
];

const productionConfig = [
  {
    entry: {
      main: './src/indexProd.tsx',
    },
    ...commonConfig,
    ...externalConfig,
  },
];

module.exports = (env, argv) => {
  if (argv.mode === 'production') {
    return [...defaultConfig, ...productionConfig];
  }

  return defaultConfig;
};
