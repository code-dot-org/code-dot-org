var _ = require('lodash');
var webpack = require('webpack');

var ALL_APPS = [
  'maze',
  'turtle',
  'bounce',
  'flappy',
  'studio',
  'jigsaw',
  'calc',
  'applab',
  'eval',
  'netsim',
  'craft',
  'gamelab'
];
var appsToBuild = ALL_APPS;
var appsEntries = _.fromPairs(appsToBuild.map(function (app) {
  return [app, './src/' + app + '/main.js'];
}).concat(appsToBuild.indexOf('applab') === -1 ? [] :
          [['applab-api', './src/applab/api-entry.js']]
));
var codeStudioEntries = {
  'code-studio': './src/code-studio/code-studio.js',
  'levelbuilder': './src/code-studio/levelbuilder.js',
  'levelbuilder_markdown': './src/code-studio/levelbuilder_markdown.js',
  'levelbuilder_studio': './src/code-studio/levelbuilder_studio.js',
  'levelbuilder_gamelab': './src/code-studio/levelbuilder_gamelab.js',
  'levelbuilder_applab': './src/code-studio/levelbuilder_applab.js',
  'makerlab/setupPage': './src/code-studio/makerlab/setupPage.js',
  'districtDropdown': './src/code-studio/districtDropdown.js',
  'signup': './src/code-studio/signup.js',
  'termsInterstitial': './src/code-studio/termsInterstitial.js',
  'levels/contract_match': './src/code-studio/levels/contract_match.jsx',
  'levels/widget': './src/code-studio/levels/widget.js',
  'levels/external': './src/code-studio/levels/external.js',
  // put these entry points in arrays so that they can be required elsewhere
  // https://github.com/webpack/webpack/issues/300
  'levels/multi': ['./src/code-studio/levels/multi.js'],
  'levels/textMatch': ['./src/code-studio/levels/textMatch.js'],
  'levels/levelGroup': './src/code-studio/levels/levelGroup.js',
  'levels/dialogHelper': './src/code-studio/levels/dialogHelper.js',
  'initApp/initApp': './src/code-studio/initApp/initApp.js'
};

module.exports = require('./webpack').create(
  {
    uniqueName: 'apps',
    outputDir: 'build',
    entries: _.extend(
      {},
      appsEntries,
      codeStudioEntries,
      {

        plc: './src/code-studio/plc/plc.js',


        // Build embedVideo.js in its own step (skipping factor-bundle) so that
        // we don't have to include the large code-studio-common file in the
        // embedded video page, keeping it fairly lightweight.
        // (I wonder how much more we could slim it down by removing jQuery!)
        // @see embed.html.haml
        embedVideo: './src/code-studio/embedVideo.js',

        // embedBlocks.js is just React, the babel-polyfill, and a few other dependencies
        // in a bundle to minimize the amound of stuff we need when loading blocks
        // in an iframe.
        embedBlocks: './src/code-studio/embedBlocks.js',

        makerlab: './src/code-studio/makerlab/makerlabDependencies.js',

        pd: './src/code-studio/pd/workshop_dashboard/workshop_dashboard.jsx',

        publicKeyCryptography: './src/publicKeyCryptography/main.js',
      }
    ),
    externals: [],
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        chunks: _.keys(appsEntries),
        minChunks: 2
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'code-studio-common',
        chunks: _.keys(codeStudioEntries).concat(['common']),
        minChunks: 2
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'minimal',
        minChunks: 2,
        chunks: [
          'plc',
          'embedVideo',
          'embedBlocks',
//          'makerlab',
          'pd',
          'publicKeyCryptography',
          'code-studio-common',
        ]
      }),
      new webpack.optimize.OccurrenceOrderPlugin(true),
      //        new ChunkManifestPlugin({
      //          filename: 'apps-chunk-manifest.json',
      //          manifestVariable: 'appsWebpackManifest'
      //        }),
    ],
    minify: false,
    watch: false,
    piskelDevMode: false
  }
);
