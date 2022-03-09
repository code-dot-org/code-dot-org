module.exports = function(grunt) {
  var path = require('path');
  var MessageFormat = require('messageformat');

  grunt.registerMultiTask('messages', 'Compile messages!', function() {
    var locales = new Set();
    var namespaces = new Set();

    // Tracks all the errors found when processing the I18n content.
    const errors = [];
    // Loop through all the I18n content used by "apps" and process it so it is usable to our
    // javascript code.
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

        // Verify the translated content is formatted correctly.
        const formatErrors = checkForFormatIssues(
          locale,
          namespace,
          finalData,
          src
        );
        if (formatErrors.length !== 0) {
          // Format error found, track the error and move on to the next file.
          const errorMsg = formatErrors.join('\n');
          errors.push(new Error(errorMsg));
          return;
        }

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
            let errorMsg = `Failed to process localization file ${src}: ${e}`;
            if (grunt.option('force')) {
              grunt.log.warn(errorMsg);
            } else {
              errors.push(new Error(errorMsg));
            }
          }
        }
      });
    });
    // If an error was found when processing the I18n content, report it and raise an error.
    if (errors.length !== 0) {
      const errorMsg = 'All I18n content issues:';
      const allErrors = errors.reduce(
        (all, error) => `${all}\n${error.message}`,
        errorMsg
      );
      throw new Error(allErrors);
    }

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

  /**
   * Parses the given JSON for any MessageFormat issues and returns a list of exceptions found.
   * @param locale The language/region locale code for the given JSON.
   * @param namespace Some unique ID for the content, usually the file name e.g. 'fish' or 'maze'
   * @param json {object} A JSON object which has string values inside it.
   * @returns {array} A list of exceptions found when trying to parse the given JSON.
   */
  function checkForFormatIssues(locale, namespace, json, src) {
    const errors = [];
    // Process each individual key so we can quickly identify which string is having an issue.
    Object.keys(json).forEach(function(key) {
      try {
        process(locale, namespace, json[key]);
      } catch (e) {
        if (locale !== 'in_tl') {
          // in_tl is a pseudolanguage locale we don't fully support yet so we will ignore it.
          let errorMsg = `key '${key}' in localization file ${src} has a format issue: ${e}`;
          errors.push(new Error(errorMsg));
        }
      }
    });
    return errors;
  }

  /**
   * Applies MessageFormat to all the strings found in the given JSON.
   * @param locale The language/region locale code for the given JSON.
   * @param namespace Some unique ID for the content, usually the file name e.g. 'fish' or 'maze'
   * @param json A JSON object which has string values inside it.
   * @returns {object} The given JSON object but formatted with MessageFormat.
   */
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
