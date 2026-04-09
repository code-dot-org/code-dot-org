const CopyPlugin = require('copy-webpack-plugin');
const path = require("path");

const commonConfig = {
  devtool: 'eval-cheap-module-source-map',
  resolve: {
    extensions: [".js", ".jsx"],
    // Note: Separate aliases are required for aliases to work in unit tests. These should
    // be added in package.json in the jest configuration.
    alias: {
      '@ml': path.resolve(__dirname, 'src'),
      '@public': path.resolve(__dirname, 'public')
    }
  },
  output: {
    filename: "[name].js",
    library: {
      type: 'umd'
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8192
          }
        },
        generator: {
          filename: 'assets/images/[name][ext][query]'
        }
      },
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
  output: {
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'public/datasets/*.*',
          to: 'assets/datasets/[name][ext]'
        }
      ]
    })
  ]
};

const externalConfig = {
  externals: {
    lodash: 'lodash',
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

  return defaultConfig;
};

