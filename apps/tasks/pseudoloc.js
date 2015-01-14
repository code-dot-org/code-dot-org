module.exports = function(grunt) {
  'use strict';

  var path = require('path');

  var pseudolocString = function(string) {
    //TODO: Something smarter.
    return '!!-' + string + '-!!';
  };

  grunt.registerMultiTask('pseudoloc', 'Pseudolocalize Messages', function() {

    var srcBase = this.data.srcBase;
    var srcLocale = this.data.srcLocale;
    var destBase = this.data.destBase;
    var pseudoLocale = this.data.pseudoLocale;

    // Resolve mapping from source locale to pseudo locale strings files.
    var pattern = srcBase + '/**/' + srcLocale + '.json';
    var files = grunt.file.expandMapping(pattern, destBase, {
      expand: true,
      rename: function(destBase, matchedPath) {
        var destPath = matchedPath.substring(srcBase.length);
        var filename = destPath.replace(srcLocale, pseudoLocale);
        return path.join(destBase, filename);
      }
    });

    // Pseudolocalize each string from the source locale.
    files.forEach(function(file) {
      var messages = grunt.file.readJSON(file.src[0]);
      Object.keys(messages).forEach(function(id) {
        messages[id] = pseudolocString(messages[id]);
      });
      grunt.file.write(file.dest, JSON.stringify(messages, null, 2));
    });

  });

};
