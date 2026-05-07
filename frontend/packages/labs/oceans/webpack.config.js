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
      '@ml': path.resolve(__dirname, 'src'),
      '@public': path.resolve(__dirname, 'public')
    }
  },
  output: {
    filename: '[name].js',
    library: {
      type: 'umd'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {test: /\.css$/, use: ['style-loader', 'css-loader']},
      {
        test: /\.jsx$/,
        enforce: 'pre',
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react', '@babel/preset-env'],
              plugins: ['@babel/plugin-transform-class-properties']
            }
          }
        ]
      },
      {
        test: /\.(png|gif|svg)$/,
        type: 'asset/inline',
      },
      {
        type: 'asset/resource',
        test: /src\/oceans\/model.json$/,
        generator: {
          filename: 'assets/models/[name][ext]?[contenthash]'
        }
      },
      {
        test: /\.(mp3|ogg|wav)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/sounds/[name][ext]?[contenthash]'
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
  },
  plugins: [
    new (require('webpack').ProvidePlugin)({
      process: 'process/browser'
    })
  ]
};

const firstConfigOnly = {
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: 'src/oceans/*.bin',
          to: 'assets/models/[name][ext]'
        }
      ]
    })
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
      assetPath: './src/oceans/assetPath.js'
    },
    ...commonConfig,
    ...firstConfigOnly,
    ...externalConfig
  },
  {
    entry: {
      oceans: './src/oceans/index.jsx'
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
