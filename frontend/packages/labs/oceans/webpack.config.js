const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const commonConfig = {
  devtool: 'eval-cheap-module-source-map',
  resolve: {
    extensions: ['.js', '.jsx'],
    // Note: Separate aliases are required for aliases to work in unit tests. These should
    // be added in package.json in the jest configuration.
    alias: {
      '@ml': path.resolve(__dirname, 'src')
    }
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {test: /\.css$/, loader: 'style-loader!css-loader'},
      {
        test: /\.jsx$/,
        enforce: 'pre',
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['react', 'env'],
              plugins: ['transform-class-properties']
            }
          }
        ]
      },
      {
        test: /\.(png|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
          outputPath: 'assets/images',
          publicPath: 'images',
          postTransformPublicPath: p =>
            `__ml_activities_asset_public_path__ + ${p}`,
          name: '[name].[ext]?[contenthash]'
        }
      },
      {
        type: 'javascript/auto',
        test: /src\/demo\/model.json$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets/models',
              publicPath: 'models',
              postTransformPublicPath: p =>
                `__ml_activities_asset_public_path__ + ${p}`,
              name: '[name].[ext]?[contenthash]'
            }
          }
        ]
      },
      {
        test: /\.(mp3|ogg|wav)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'assets/sounds',
          publicPath: 'sounds',
          postTransformPublicPath: p =>
            `__ml_activities_asset_public_path__ + ${p}`,
          name: '[name].[ext]?[contenthash]'
        }
      }
    ]
  },
  performance: {
    assetFilter: function(assetFilename) {
      return /^assets\//.test(assetFilename);
    },
    maxAssetSize: 300000,
    maxEntrypointSize: 10500000
  }
};

const firstConfigOnly = {
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin([
      {
        from: 'src/demo/*.bin',
        to: 'assets/models/',
        flatten: true
      }
    ])
  ]
};

const externalConfig = {
  externals: {
    lodash: 'lodash',
    radium: 'radium',
    react: 'react',
    'react-dom': 'react-dom'
  }
};

const defaultConfig = [
  {
    entry: {
      assetPath: './src/demo/assetPath.js'
    },
    ...commonConfig,
    ...firstConfigOnly,
    ...externalConfig
  },
  {
    entry: {
      demo: './src/demo/index.jsx'
    },
    ...commonConfig
  }
];

const productionConfig = [
  {
    entry: {
      main: './src/index.js'
    },
    ...commonConfig,
    ...externalConfig
  }
];

module.exports = (env, argv) => {
  if (argv.mode === 'production') {
    return [...defaultConfig, ...productionConfig];
  }

  return defaultConfig;
};
