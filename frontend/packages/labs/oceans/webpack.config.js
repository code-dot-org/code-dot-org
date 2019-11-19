const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: 'eval-cheap-module-source-map',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  entry: {
    assetPath: './src/demo/assetPath.js',
    main: './src/index.js',
    demo: './src/demo/index.jsx',
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: "babel-loader",
    },
    {test: /\.css$/, loader: 'style-loader!css-loader'},
    {
      test: /\.jsx$/,
      enforce: 'pre',
      exclude: /(node_modules)/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['react', 'env'],
          plugins: ["transform-class-properties"]
        }
      }]
    },
    {
      test: /\.png$/,
      loader: "url-loader",
      options: {
        limit: 8192,
        outputPath: 'assets/images',
        publicPath: 'images',
        postTransformPublicPath: (p) => `__ml_activities_asset_public_path__ + ${p}`,
        name: '[name].[ext]?[contenthash]',
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
              postTransformPublicPath: (p) => `__ml_activities_asset_public_path__ + ${p}`,
              name: '[name].[ext]?[contenthash]',
            }
          }
      ]
    },
    {
      test: /\.(mp3|ogg|wav)$/,
      loader: "file-loader",
      options: {
        outputPath: 'assets/sounds',
        publicPath: 'sounds',
        postTransformPublicPath: (p) => `__ml_activities_asset_public_path__ + ${p}`,
        name: '[name].[ext]?[contenthash]',
      }
    }],
  },
  performance: {
    assetFilter: function (assetFilename) {
      return (/^(images|models|sounds)/.test(assetFilename));
    },
    maxAssetSize: 300000,
    maxEntrypointSize: 10500000,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin([{
      from: 'src/demo/*.bin',
      to: 'assets/models/',
      flatten: true,
    }]),
  ],
};
