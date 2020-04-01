module.exports = function (grunt) {
  var path = require('path');
  var MessageFormat = require('messageformat');
  var EOL = require('os').EOL;

  grunt.registerMultiTask('messages', 'Compile messages!', function () {
    var locales = new Set();
    var namespaces = new Set();

    this.files.forEach(function (filePair) {
      filePair.src.forEach(function (src) {
        var locale = path.basename(src, '.json');
        locales.add(locale);
        var namespace = path.basename(filePair.dest).split('.js')[0];
        namespaces.add(namespace);

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

    /**
     * We want to make sure that we aren't missing any locale files in any
     * namespaces; specifically, if we're missing locale information in any
     * context, we want to default to English rather than landing in an error
     * state.
     *
     * In this case, after building out all files found by examining apps/i18n
     * we want to go through all combinations of locales and namespaces we
     * encountered. Any combinations that are missing a built file should
     * simply clone said file from english.
     */
    const {dest} = this.options();
    locales.forEach(function (locale) {
      namespaces.forEach(function (namespace) {
        const expected = path.join(dest, locale, namespace + '.js');
        if (!grunt.file.exists(expected)) {
          const fallback = expected.replace(locale, 'en_us');
          grunt.file.copy(fallback, expected);
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
