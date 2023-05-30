/**
 * Generate the xml for a block for the calc app.
 * @param {string} type Type for this block
 * @param {number[]|string[]} args List of args, where each arg is either the
 *   xml for a child block, a number, or the name of a variable.
 */
export const calcBlockXml = function (type, args) {
  var str = '<block type="' + type + '" inline="false">';
  for (var i = 1; i <= args.length; i++) {
    str += '<functional_input name="ARG' + i + '">';
    var arg = args[i - 1];
    if (typeof arg === 'number') {
      arg =
        '<block type="functional_math_number"><title name="NUM">' +
        arg +
        '</title></block>';
    } else if (/^<block/.test(arg)) {
      // we have xml, dont make any changes
    } else {
      // we think we have a variable
      arg = calcBlockGetVar(arg);
    }
    str += arg;
    str += '</functional_input>';
  }
  str += '</block>';

  return str;
};

/**
 * @returns the xml for a functional_parameters_get block with the given
 *   variableName
 */
export const calcBlockGetVar = function (variableName) {
  return (
    '' +
    '<block type="functional_parameters_get" uservisible="false">' +
    '  <mutation>' +
    '    <outputtype>Number</outputtype>' +
    '  </mutation>' +
    '  <title name="VAR">' +
    variableName +
    '</title>' +
    '</block>'
  );
};

/**
 * Generate the xml for a math block (either calc or eval apps).
 * @param {string} type Type for this block
 * @param {Object.<string,string>} inputs Dictionary mapping input name to the
 xml for that input
 * @param {Object.<string.string>} [titles] Dictionary of titles mapping name to value
 */
export const mathBlockXml = function (type, inputs, titles) {
  var str = '<block type="' + type + '" inline="false">';
  for (var title in titles) {
    str += '<title name="' + title + '">' + titles[title] + '</title>';
  }

  for (var input in inputs) {
    str +=
      '<functional_input name="' +
      input +
      '">' +
      inputs[input] +
      '</functional_input>';
  }

  str += '</block>';

  return str;
};
