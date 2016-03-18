#!/usr/bin/env node
// Script to generate color.js from color.scss
var fs = require('fs');
var path = require('path');
var readline = require('readline');

var colorScssPath = path.resolve('../shared/css/color.scss');
var colorJsPath = path.resolve('./src/color.js');

// Regular expression to capture a color definition from SCSS
var colorRe = /\$(\w+)\s*:\s*([^;]+);/;
var cachedColors = {};

// In color.scss some color definitions reference previous
// color definitions.  Since we're reading them in order,
// we can recursively resolve these referential defintions
// until we land on an actual color.
function resolveColor(value) {
  var originalValue = value;
  while (/^\$/.test(value)) {
    value = cachedColors[value.substring(1)];
  }
  return value;
}

// Generate color.js while reading color.scss line-by-line
var out = fs.createWriteStream(colorJsPath);
out.write([
  '// color.js',
  '// GENERATED FILE: DO NOT MODIFY DIRECTLY',
  '// This generated file exports all colors defined in color.scss',
  '// for use in JavaScript. The generator script is build-color-js.js',
  'module.exports = {\n'
].join('\n'));

var rl = readline.createInterface({
  input: fs.createReadStream(colorScssPath),
  terminal: false
});

var currentLine = 0;
rl.on('line', function (line) {
  currentLine++;
  var match = colorRe.exec(line);
  if (match === null) {
    return;
  }

  var colorName = match[1];
  var colorValue = resolveColor(match[2]);
  if (typeof colorValue === 'undefined') {
    throw new Error([
        'Unable to resolve color ' + colorName,
        colorScssPath + ':' + currentLine,
        line,
        ' ^'
        ].join('\n'));
  }
  cachedColors[colorName] = colorValue;

  out.write('  ' + colorName + ': "' + colorValue + '",\n');
});
rl.on('close', function () {
  out.write('};\n');
});

