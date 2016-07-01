/**
 * @file Utility for JS build scripts that loads our application configs from
 *       globals.yml and locals.yml, merges them, and makes the configured
 *       options available.
 *
 *       This utility should mirror the behavior of load_configuration() in
 *       deployment.rb as closely as possible.  Obviously it's not perfect
 *       (it's missing the computed defaults here) but we can get closer.
 */
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

var GLOBALS_YML_PATH = path.join(__dirname, '../../', 'globals.yml');
var LOCALS_YML_PATH = path.join(__dirname, '../../', 'locals.yml');

/**
 * Retrieve a config value by key.
 * @param {string} key
 */
module.exports.get = function (key) {
  return mergedConfig()[key];
};

/**
 * Load globals and locals, merge them, and return the result.
 * Possible future work: Find a way to include the computed defaults from
 * deployment.rb.
 */
var mergedConfig = _.once(function () {
  var globals = loadYamlFile(GLOBALS_YML_PATH);
  var locals = loadYamlFile(LOCALS_YML_PATH);
  return _.assign({}, globals, locals);
});

/**
 * Looks for the specified file.  If found, attempts to parse it as YAML and
 * return it as an object.
 * If the file doesn't exist or can't be parsed, returns an empty object.
 */
var loadYamlFile = _.memoize(function (filepath) {
  try {
    return yaml.safeLoad(fs.readFileSync(filepath));
  } catch (_) {
    return {};
  }
});
