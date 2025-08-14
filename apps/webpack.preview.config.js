const path = require('path');
const webpack = require('webpack');
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');

const p = (...paths) => path.resolve(__dirname, ...paths);

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/sites/studio/pages/codeprojects_preview/show.js',
  output: {
    path: p('build/preview'),
    filename:
      process.env.NODE_ENV === 'production'
        ? 'previewwp[contenthash].js'
        : 'preview.js',
    clean: true,
    publicPath: '/assets/',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@cdo/apps': p('src'),
      '@codebridge': p('src/codebridge'),
      '@cdo/locale': p('src/util/locale-do-not-import.js'),
      '@cdo/generated-scripts': p('generated-scripts'),
      '@cdo/codebridge/locale': p('src/codebridge/locale.ts'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: p('build/babel-cache'),
            compact: false,
          },
        },
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: 'tsconfig.build.json',
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [p('../shared/css')],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        include: [
          p('static'),
          p('src'),
          p('test'),
          p('../dashboard/app/assets/images'),
        ],
        type: 'asset/inline',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
    }),
    new WebpackManifestPlugin({
      basePath: 'preview/',
      fileName: 'manifest.json',
    }),
  ],
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
  },
};
