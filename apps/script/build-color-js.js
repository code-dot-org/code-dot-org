#!/usr/bin/env node

/**
 * Script that processes an scss file containing a set of variables, and
 * generates the equivalent set in JS.
 */
var fs = require('fs');
var path = require('path');
var readline = require('readline');

// Regular expression to capture a color definition from SCSS
var variableRe = /\$(\w+)\s*:\s*([^;]+);/;
var cachedVariables = {};

// In color.scss some color definitions reference previous
// color definitions.  Since we're reading them in order,
// we can recursively resolve these referential defintions
// until we land on an actual color.
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
    '// color.js',
    '// GENERATED FILE: DO NOT MODIFY DIRECTLY',
    '// This generated file exports all colors defined in color.scss',
    '// for use in JavaScript. The generator script is build-color-js.js',
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
          'Unable to resolve color ' + variableName,
          scssPath + ':' + currentLine,
          line,
          ' ^'
          ].join('\n'));
    }
    cachedVariables[variableName] = variableValue;

    out.write('  ' + variableName + ': "' + variableValue + '",\n');
  });
  rl.on('close', function () {
    out.write('};\n');
  });

}

convertScssToJs(path.resolve('../shared/css/color.scss'), path.resolve('./src/color.js'));
