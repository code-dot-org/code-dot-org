module.exports = function(grunt) {
  'use strict';

  var path = require('path');
  var fs = require('fs');
  var vm = require('vm');
  var MessageFormat = require('messageformat');

  grunt.registerMultiTask('messages', 'Compile messages', function() {

    var locales = this.data.locales;
    var srcBases = this.data.srcBases;
    var destBase = this.data.destBase;

    locales.forEach(function(locale) {

      grunt.log.write('Generating ' + locale + ' messages\n');

      // Resolve mapping from locale strings to generated code files.
      var patterns = srcBases.map(function(srcBase) {
        return srcBase + '/**/' + locale + '.json';
      });

      // Returns an array of src-dest file mapping objects.
      // For each source file matched by a specified pattern, join that file path to the specified dest.
      // http://gruntjs.com/api/grunt.file#grunt.file.expandmapping
      var files = grunt.file.expandMapping(patterns, destBase, {
        // Enable dynamic expansion.
        expand: true,
        // If specified, this function will be responsible for returning the final dest filepath.
        rename: function(destBase, matchedPath) {
          var destPath;
          srcBases.forEach(function(srcBase) {
            if (matchedPath.substring(0, srcBase.length) === srcBase) {
              destPath = matchedPath.substring(srcBase.length);
            }
          });
          var filename = destPath.replace('/' + locale + '.json', '.js');
          return path.join(destBase, locale, filename);
        }
      });

      // Initialize MessageFormat.
      // MessageFormat (PluralFormat + SelectFormat) is a mechanism for handling both pluralization and gender.
      // https://github.com/SlexAxton/messageformat.js
      var language = locale.split('_')[0];
      var backend, mf;
      var loadBackend = function(lang) {
        backend = fs.readFileSync(
          './node_modules/messageformat/locale/' + lang + '.js', 'utf8');
        vm.runInNewContext(backend, {MessageFormat: MessageFormat});
        mf = new MessageFormat(lang);
      };
      try {
        loadBackend(language);
      } catch (e) {
        // Fallback to English on failure.
        grunt.log.warn('Error loading MessageFormat backend: ' + e);
        loadBackend('en');
      }

      // Generate javascript message functions.
      files.forEach(function(file) {
        var src = file.src[0];
        var translated = grunt.file.readJSON(src);
        //XXX Shouldn't have to re-read source strings for each locale, nor
        // should this code be doing weird path replace munging.
        var source = grunt.file.readJSON(
          src.replace('build/', '').replace(locale, 'en_us'));
        var code = 'var MessageFormat = require("messageformat");';
        code += backend;
        Object.keys(source).forEach(function(key) {
          code += 'exports.' + key + ' = ';
          try {
            if (translated[key]) {
              code += mf.precompile(mf.parse(translated[key]));
            } else {
              code += mf.precompile(mf.parse(source[key]));
            }
          } catch (e) {
            // Fallback to English on failure.
            grunt.log.warn('Failed to compile ' + src + ':' + key + '\n' + e);
            code += mf.precompile(mf.parse(source[key]));
          }
          code += ';\n\n';
        });
        grunt.file.write(file.dest, code);
      });
    });

  });

};
