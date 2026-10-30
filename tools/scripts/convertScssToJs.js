#!/usr/bin/env node

/**
 * Script that processes an scss file containing a set of variables, and
 * generates the equivalent set in JS.
 */
var fs = require("fs");
var path = require("path");
var readline = require("readline");

// Regular expression to capture a variable definition from SCSS
var variableRe = /\$([\w-]+)\s*:\s*([^;]+);/;
var cachedVariables = {};

const mixinStartRe = /@mixin\s([\w-]+)\s*\{/;
const mixinEndRe = /}/;
const includeRe = /@include\s([\w-]+);/;
const scssKeyValuePairRe = /([\w-]+)\s*:\s*([\w]+);/;
const scssVariableValueRe = /([\w-]+)\s*:\s*\$([\w-]+);/;
const cachedMixins = {};
let currentlyInsideMixin = "";

const camelize = (s) => s.replace(/-./g, (x) => x[1].toUpperCase());

// In color.scss some variable definitions reference previous
// variable definitions.  Since we're reading them in order,
// we can recursively resolve these referential definitions
// until we land on an actual variable.
function resolveVariable(value) {
  return value.split(', ').map(part => {
    return part.startsWith('$') ? cachedVariables[part.substring(1)] : part;
  }).join(', ');
}

const parseMixinStart = (mixinStartMatch, out) => {
  currentlyInsideMixin = mixinStartMatch[1];
  cachedMixins[mixinStartMatch[1]] = {};
  out.write(`  "${mixinStartMatch[1]}": {\n`);
};

const parseMixinVariableValue = (variableLineMatch) => {
  variableLineMatch[1] = camelize(variableLineMatch[1]);
  cachedMixins[currentlyInsideMixin][variableLineMatch[1]] =
    cachedVariables[variableLineMatch[2]];
};

const parseMixinKeyValuePair = (keyValuePairMatch) => {
  keyValuePairMatch[1] = camelize(keyValuePairMatch[1]);
  cachedMixins[currentlyInsideMixin][keyValuePairMatch[1]] =
    keyValuePairMatch[2];
};

const parseIncludeMixin = (includeMatch) => {
  cachedMixins[currentlyInsideMixin] = {
    ...cachedMixins[includeMatch[1]],
    ...cachedMixins[currentlyInsideMixin],
  };
};

const parseMixinEnd = (out) => {
  const mixinParsedToJSObject = JSON.stringify(
    cachedMixins[currentlyInsideMixin]
  )
    .replaceAll(":", ": ")
    .replaceAll(/[{}]/g, "")
    .replaceAll('",', '",\n  ');

  out.write(`  ${mixinParsedToJSObject},\n`);
  out.write("  },\n");
  currentlyInsideMixin = "";
};

const parseMixin = (line, out) => {
  if (!currentlyInsideMixin) {
    let mixinStartMatch = mixinStartRe.exec(line);
    if (mixinStartMatch !== null) {
      parseMixinStart(mixinStartMatch, out);
      return;
    }

    return;
  }

  let keyValuePairMatch = scssKeyValuePairRe.exec(line);
  if (keyValuePairMatch !== null) {
    parseMixinKeyValuePair(keyValuePairMatch);
    return;
  }

  let variableLineMatch = scssVariableValueRe.exec(line);
  if (variableLineMatch !== null) {
    parseMixinVariableValue(variableLineMatch);
    return;
  }

  let includeMatch = includeRe.exec(line);
  if (includeMatch !== null) {
    parseIncludeMixin(includeMatch);
    return;
  }

  if (mixinEndRe.test(line)) {
    parseMixinEnd(out);
    return;
  }
};

function convertScssToJs(scssPath, jsPath) {
  // Generate <foo>.js while reading <foo>.scss line-by-line
  var root = path.resolve(__dirname + "/../../");
  // Put a relative path in our comment, so that it is consistent across environments
  var relativeScss = path.relative(root, scssPath);
  var relativeJS = path.relative(root, jsPath);

  var out = fs.createWriteStream(jsPath);
  out.write(
    [
      "/* eslint-disable */",
      "",
      "// " + relativeJS,
      "// GENERATED FILE: DO NOT MODIFY DIRECTLY",
      "// This generated file exports all variables defined in " + relativeScss,
      "// for use in JavaScript. The generator script is convert-scss-variables.js",
      "module.exports = {\n",
    ].join("\n")
  );

  var rl = readline.createInterface({
    input: fs.createReadStream(scssPath),
    terminal: false,
  });

  var currentLine = 0;
  var accumulatedLine = '';
  rl.on("line", function (line) {
    currentLine++;

    accumulatedLine += ' ' + line.trim();

    var match = variableRe.exec(accumulatedLine);
    if (match === null || !!currentlyInsideMixin) {
      parseMixin(accumulatedLine, out);

      // Stop accumulating if the line ends with a semicolon
      if (accumulatedLine.endsWith(';')) accumulatedLine = '';

      return;
    }

    var variableName = match[1];
    var variableValue = resolveVariable(match[2]);
    if (typeof variableValue === "undefined") {
      throw new Error(
        [
          "Unable to resolve variable " + variableName,
          scssPath + ":" + currentLine,
          accumulatedLine,
          " ^",
        ].join("\n")
      );
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

    out.write('  "' + variableName + '": ' + variableValue + ",\n");
    accumulatedLine = '';
  });
  rl.on("close", function () {
    out.write("};\n");
  });
}

module.exports = convertScssToJs;
