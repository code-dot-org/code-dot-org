module.exports = function (grunt) {
  var path = require('path');
  var MessageFormat = require('messageformat');
  var EOL = require('os').EOL;

  grunt.registerMultiTask('messages', 'Compile messages!', function () {
    this.files.forEach(function (filePair) {
      filePair.src.forEach(function (src) {
        var locale = path.basename(src, '.json');
        var namespace = path.basename(filePair.dest).split('.js')[0];
        var englishData = grunt.file.readJSON(src.replace(locale, 'en_us'));
        var localeData = grunt.file.readJSON(src);
        Object.keys(localeData).forEach(function (key) {
          if (localeData[key] === "") {
            delete localeData[key];
          }
        });
        var finalData = Object.assign(englishData, localeData);
        try {
          var formatted = process(locale, namespace, finalData);
          grunt.file.write(filePair.dest, formatted);
        } catch (e) {
          var errorMsg = "Error processing localization file " + src + ": " + e;
          if (grunt.option('force')) {
            grunt.log.warn(errorMsg);
          } else {
            throw new Error(errorMsg);
          }
        }
      });
    });
  });

  function process(locale, namespace, json) {
    var mf;
    try {
      mf = new MessageFormat(locale, false, namespace);
    } catch (e) {
      // Fallback to en if locale is not found
      if (locale !== 'en') {
        return process('en', namespace, json);
      } else {
        throw e;
      }
    }

    return [
      'var ' + namespace + ' = ' + mf.functions() + ';',
      '(window.blockly = window.blockly || {}).' + namespace + ' = ' + mf.precompileObject(json) + ';'
    ].join(EOL);
  }

};
