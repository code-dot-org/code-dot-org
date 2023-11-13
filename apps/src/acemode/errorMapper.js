var errorMap = [
  {
    original: /Assignment in conditional expression/,
    replacement:
      'For conditionals, use the comparison operator (===) to check if two things are equal.',
  },
  {
    original: /(.*)\sis defined but never used./,
    replacement: "$1 is defined, but it's not called in your program.",
  },
  {
    original: /(.*)\sis not defined./,
    replacement: "$1 hasn't been declared yet.",
  },
  {
    original:
      /Expected an identifier and instead saw (.*)\s\(a reserved word\)./,
    applab_replacement:
      '$1 is a reserved word in App Lab. Use a different variable name.',
    gamelab_replacement:
      '$1 is a reserved word in Game Lab. Use a different variable name.',
  },
  {
    original: /'setup' is defined, but it's not called in your program./,
    replacement:
      "'setup' is a function that already exists in Game Lab. Consider giving this function a different name.",
  },
];

/**
 * Takes the results of a JSLint pass, and modifies the error text according to
 * our mapping. Note this makes changes in place to the passed in results
 * object.
 */
module.exports.processResults = function (results, appType) {
  results.data.forEach(function (item) {
    if (item.type === 'info') {
      item.type = 'warning';
    }

    errorMap.forEach(function (errorMapping) {
      if (!errorMapping.original.test(item.text)) {
        return;
      }

      let replacement;
      if (errorMapping.replacement) {
        replacement = errorMapping.replacement;
      } else {
        replacement =
          appType === 'Applab'
            ? errorMapping.applab_replacement
            : errorMapping.gamelab_replacement;
      }

      item.text = item.text.replace(errorMapping.original, replacement);
    });
  });
};
