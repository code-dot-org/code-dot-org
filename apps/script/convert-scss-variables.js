#!/usr/bin/env node

/**
 * Script that processes an scss file containing a set of variables, and
 * generates the equivalent set in JS.
 */
var fs = require('fs');
var path = require('path');
var readline = require('readline');

// Regular expression to capture a variable definition from SCSS
var variableRe = /\$([\w-]+)\s*:\s*([^;]+);/;
var cachedVariables = {};

// In color.scss some variable definitions reference previous
// variable definitions.  Since we're reading them in order,
// we can recursively resolve these referential defintions
// until we land on an actual variable.
function resolveVariable(value) {
  var originalValue = value;
  while (/^\$/.test(value)) {
    value = cachedVariables[value.substring(1)];
  }
  return value;
}

function convertScssToJs(scssPath, jsPath) {
  // Generate <foo>.js while reading <foo>.scss line-by-line
  var out = fs.createWriteStream(jsPath);
  out.write([
    '// ' + jsPath,
    '// GENERATED FILE: DO NOT MODIFY DIRECTLY',
    '// This generated file exports all variables defined in ' + scssPath,
    '// for use in JavaScript. The generator script is convert-scss-variables.js',
    'module.exports = {\n'
  ].join('\n'));

  var rl = readline.createInterface({
    input: fs.createReadStream(scssPath),
    terminal: false
  });

  var currentLine = 0;
  rl.on('line', function (line) {
    currentLine++;
    var match = variableRe.exec(line);
    if (match === null) {
      return;
    }

    var variableName = match[1];
    var variableValue = resolveVariable(match[2]);
    if (typeof variableValue === 'undefined') {
      throw new Error([
          'Unable to resolve variable ' + variableName,
          scssPath + ':' + currentLine,
          line,
          ' ^'
          ].join('\n'));
    }

    var isNumber = false;
    if (/px$/.test(variableValue)) {
      variableValue = parseFloat(variableValue);
      isNumber = true;
    }
    cachedVariables[variableName] = variableValue;

    // Put quotes around non-numbers
    if (!isNumber) {
      variableValue = '"' + variableValue + '"';
    }

    out.write('  "' + variableName + '": ' + variableValue + ',\n');
  });
  rl.on('close', function () {
    out.write('};\n');
  });

}

convertScssToJs(path.resolve('../shared/css/color.scss'), path.resolve('./src/color.js'));
convertScssToJs(path.resolve('../shared/css/style-constants.scss'), path.resolve('./src/styleConstants.js'));
