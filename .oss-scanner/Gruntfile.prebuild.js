// OSS Scanner image only: generate what apps/ Jest tests import (build/locales,
// generated constants, region configs, ...) and the CSS that Rails views
// reference, without the full webpack `grunt build`.
//
// Run from apps/ (grunt-cli would look for grunt next to this file, so call
// the apps/ copy of grunt directly):
//   node -e "require('grunt').tasks(['oss-scanner-prebuild'],
//            {gruntfile: '../.oss-scanner/Gruntfile.prebuild.js', base: '.'})"
//
// It loads the real apps/Gruntfile.js and changes one thing: the `messages`
// task compiles only en_us. Every other locale under apps/i18n is a Git LFS
// object, which a plain clone has only as a pointer file, and the en_us
// locale files (committed as normal git blobs) are the only ones setupJest
// imports.
const path = require('path');

module.exports = function (grunt) {
  require(path.resolve(__dirname, '../apps/Gruntfile.js'))(grunt);

  const files = grunt.config.getRaw('messages.all.files');
  files[0].src = ['i18n/**/en_us.json'];
  grunt.config.set('messages.all.files', files);

  // The `prebuild` list from apps/Gruntfile.js, minus lint/size checks and
  // exec:buildFrontendDependencies (the Dockerfile already ran it), plus
  // `sass` from `postbuild`: Rails views need build/package/css/*.css (served
  // through the dashboard/public/blockly symlink the Dockerfile creates).
  grunt.registerTask('oss-scanner-prebuild', [
    'exec:generateSharedConstants',
    'messages',
    'exec:convertScssVars',
    'exec:generateRegionConfigurations',
    'exec:generateStudioRoutes',
    'copy:src',
    'copy:lib',
    'locales',
    'ejs',
    'sass',
  ]);
};
