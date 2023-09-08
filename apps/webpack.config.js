const {
  ALL_APPS,
  appsEntriesFor,
} = require('./webpackEntryPoints');

const { createWebpackConfig } = require('./webpack.create.config');

// From Gruntfile, this is defined as: grunt.option('watch-notify');
const watchNotify = false;
console.warn("grunt.option('watch-notify') equivalent not supported yet");

// From Gruntfile this is defined as: grunt.option('piskel-dev');
const piskelDevMode = false;
console.warn("grunt.option('piskel-dev') equivalent not supported yet");

module.exports = createWebpackConfig({
  appsEntries: appsEntriesFor(ALL_APPS),
  minify: false,
  watch: false,
  piskelDevMode,
});
