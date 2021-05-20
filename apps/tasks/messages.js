module.exports = function(grunt) {
  var path = require('path');
  var MessageFormat = require('messageformat');

  grunt.registerMultiTask('messages', 'Compile messages!', function() {
    var locales = new Set();
    var namespaces = new Set();

    this.files.forEach(function(filePair) {
      filePair.src.forEach(function(src) {
        var locale = path.basename(src, '.json');
        locales.add(locale);
        var namespace = path.basename(filePair.dest).split('.js')[0];
        namespaces.add(namespace);

        var englishData = grunt.file.readJSON(src.replace(locale, 'en_us'));
        var localeData = grunt.file.readJSON(src);
        Object.keys(localeData).forEach(function(key) {
          if (localeData[key] === '') {
            delete localeData[key];
          }
        });
        var finalData = Object.assign(englishData, localeData);
        try {
          var formatted = process(locale, namespace, finalData);
          grunt.file.write(filePair.dest, formatted);
        } catch (e) {
          if (locale === 'in_tl') {
            // Crowdin generates a pseudo-language locale (in_tl) for all of our files. Sometimes Crowdin will output a
            // pseudo-translation in an unexpected way and we cannot process it. This catches that error and skips the
            // problem file. The english strings will be used instead and translators will have to go to the Crowdin
            // website in order to translate the strings for that file.
            let msg = `Error processing Crowdin in-context localization file. Using the in-context translation tool will not work for strings in ${src}: ${e}`;
            grunt.log.debug(msg);
          } else {
            let errorMsg = `Error processing localization file ${src}: ${e}`;
            if (grunt.option('force')) {
              grunt.log.warn(errorMsg);
            } else {
              throw new Error(errorMsg);
            }
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
    locales.forEach(function(locale) {
      namespaces.forEach(function(namespace) {
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
      mf = new MessageFormat(locale);
      // Several languages, like Japanese, don't allow the "one" syntax,
      // causing the build to fail with our current set of translations.
      // This turns off that check.
      // See https://messageformat.github.io/messageformat/MessageFormat#disablePluralKeyChecks__anchor
      mf.disablePluralKeyChecks();
    } catch (e) {
      // Fallback to en if locale is not found
      if (locale !== 'en') {
        return process('en', namespace, json);
      } else {
        throw e;
      }
    }

    return (
      mf
        .compile(json)
        .toString('(window.locales = window.locales || {}).' + namespace) + ';'
    );
  }
};
