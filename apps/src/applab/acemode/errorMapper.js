var errorMap = [
  {
    original: /Assignment in conditional expression/,
    replacement: "For conditionals, use the comparison operator (===) to check if two things are equal."
  },
  {
    original: /(.*)\sis defined but never used./,
    replacement: "$1 is defined, but it's not called in your program."
  },
  {
    original: /(.*)\sis not defined./,
    replacement: "$1 hasn't been declared yet."
  }
];

/**
 * Takes the results of a JSLint pass, and modifies the error text according to
 * our mapping. Note this makes changes in place to the passed in results
 * object.
 */
module.exports.processResults = function (results) {
  results.data.forEach(function (item) {
    if (item.type === 'info') {
      item.type = 'warning';
    }

    errorMap.forEach(function (errorMapping) {
      if (!errorMapping.original.test(item.text)) {
        return;
      }

      item.text = item.text.replace(errorMapping.original, errorMapping.replacement);
    });
  });
};
