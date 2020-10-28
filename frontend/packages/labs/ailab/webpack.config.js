const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require("path");

const commonConfig = {
  devtool: 'eval-cheap-module-source-map',
  resolve: {
    extensions: ["*", ".js", ".jsx"],
    // Note: Separate aliases are required for aliases to work in unit tests. These should
    // be added in package.json in the jest configuration.
    alias: {
      '@ml': path.resolve(__dirname, 'src'),
      '@public': path.resolve(__dirname, 'public')
    }
  },
  output: {
    filename: "[name].js",
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
        from: 'public/datasets/*.csv',
        to: 'assets/datasets/',
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
      assetPath: './src/assetPath.js'
    },
    ...commonConfig,
    ...firstConfigOnly,
    ...externalConfig
  },
  {
    entry: {
      mainDev: './src/indexDev.js'
    },
    ...commonConfig
  }
];

const productionConfig = [
  {
    entry: {
      main: './src/indexProd.js'
    },
    ...commonConfig,
    ...externalConfig
  }
];

module.exports = (env, argv) => {
  if (argv.mode === 'production') {
    return [...defaultConfig, ...productionConfig];
  }

  console.log("!!" ,defaultConfig);

  return defaultConfig;
};

