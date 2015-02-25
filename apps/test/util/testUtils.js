var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;
exports.assert = assert;

exports.buildPath = function (path) {
  return __dirname + '/../../build/js/' + path;
};

var _ = require(exports.buildPath('lodash'));

var studioApp;

var testBlockFactory = require('./testBlockFactory');

require('./requireUncache').wrap(require);

var GlobalDiff = require('./globalDiff');
var globalDiff = new GlobalDiff();

/**
 * Wrapper around require, potentially also using our overloader, that also
 * validates that any additions to our global namespace are expected.
 */
function requireWithGlobalsCheck(path, allowedChanges) {
  allowedChanges = allowedChanges || [];

  globalDiff.cache();
  var result = require(path);
  var diff = globalDiff.diff(true);
  diff.forEach(function (key) {
    assert.notEqual(allowedChanges.indexOf(key), -1, "unexpected global change\n" +
      "key: " + key + "\n" +
      "require: " + path + "\n");
  });
  return result;
}

/**
 * Load files from code-dot-org/apps/build, while checking that the only
 * additions to the global namespace are allowedChanges
 */
exports.requireWithGlobalsCheckBuildFolder = function (path, allowedChanges) {
  return requireWithGlobalsCheck(exports.buildPath(path), allowedChanges, false);
};

function setupLocale(app) {
  setupLocales();
  require.uncache('../../build/locale/current/' + app);
  var localePath = '../../build/package/js/en_us/' + app + '_locale';
  require.uncache(localePath);
  require(localePath);
}

exports.setupLocale = setupLocale;

function setupLocales() {
  global.navigator = global.navigator || {};
  global.window = global.window || {};
  global.document = global.document || {};
  global.window.blockly = {};
  var localePath = '../../build/package/js/en_us/common_locale';
  require.uncache(localePath);
  require(localePath);
}

exports.setupLocales = setupLocales;

/**
 * Initializes an instance of blockly for testing
 */
exports.setupTestBlockly = function() {
  // uncache file to force reload
  require.uncache(exports.buildPath('/StudioApp'));
  require.uncache('./frame');

  requireWithGlobalsCheck('./frame',
    ['document', 'window', 'DOMParser', 'XMLSerializer', 'Blockly']);
  assert(global.Blockly, 'Frame loaded Blockly into global namespace');

  setupLocales();

  // c, n, v, p, s get added to global namespace by messageformat module, which
  // is loaded when we require our locale msg files
  studioApp = exports.requireWithGlobalsCheckBuildFolder('/StudioApp',
    ['c', 'n', 'v', 'p', 's', 'TestResults']).singleton;

  var blocklyAppDiv = document.getElementById('app');
  assert(blocklyAppDiv, 'blocklyAppDiv exists');


  studioApp.assetUrl = function (path) {
    return '../lib/blockly/' + path;
  };

  var options = {
    assetUrl: studioApp.assetUrl
  };
  Blockly.inject(blocklyAppDiv, options);
  testBlockFactory.installTestBlocks(Blockly);

  assert(Blockly.Blocks.text_print, "text_print block exists");
  assert(Blockly.Blocks.text, "text block exists");
  assert(Blockly.Blocks.math_number, "math_number block exists");
  assert(studioApp, "studioApp exists");
  assert(Blockly.mainBlockSpace, "Blockly workspace exists");

  Blockly.mainBlockSpace.clear();
  assert(Blockly.mainBlockSpace.getBlockCount() === 0, "Blockly workspace is empty");
};

/**
 * Gets the singleton loaded by setupTestBlockly. Throws if setupTestBlockly
 * was not used (this will be true in the case of level tests).
 */
exports.getStudioAppSingleton = function () {
  if (!studioApp) {
    throw new Error("Expect singleton to exist");
  }
  return studioApp;
};

/**
 * Generates an artist answer (which is just an ordered list of artist commands)
 * when given a function simulating the generated code. That function will
 * look something like the following:
 * function (api) {
 *   api.moveForward(100);
 *   api.turnRight(90);
 * }
 */
exports.generateArtistAnswer = function (generatedCode) {
  var ArtistAPI = require(this.buildPath('turtle/api'));
  var api = new ArtistAPI();

  api.log = [];
  generatedCode(api);
  return api.log;
};

/**
 * Runs the given function at the provided tick count. For Studio only.
 */
exports.runOnStudioTick = function (tick, fn) {
  if (!Studio) {
    throw new Error('not supported outside of studio');
  }
  Studio.onTick = _.wrap(Studio.onTick, function (studioOnTick) {
    if (Studio.tickCount === tick) {
      fn();
    }
    studioOnTick();
  });
};

/**
 * Deep equality check of two values with more useful assertion failure
 * message.  Depends on lodash isEqual.
 * @param {*} left
 * @param {*} right
 */
exports.assertEqual = function (left, right) {
  assert(_.isEqual(left, right),
      JSON.stringify(left) + ' equals ' + JSON.stringify(right));
};

/**
 * Checks that executing certain code results in an exception of the
 * exact given type being thrown.  Produces usable output when assertions
 * fail.
 *
 * @param {function} exceptionType - constructor for the exception type you
 *        expect to be generated.  Cannot be an ancestor of the exception
 *        type; assertThrows(Error, function () { throw new TypeError(); });
 *        will fail.
 * @param {function} fn - Function expected to generate an exception. Receives
 *        no arguments, not expected to return a value.
 *
 * @example Passing assertion
 * assertThrows(Error, function () { throw new Error(); });
 *
 * @example Failing assertion
 * // Will produce output "Didn't throw!"
 * assertThrows(TypeError, function () { });
 *
 * @example Failing assertion
 * // Will produce output "Threw Error, expected TypeError; exception: {}"
 * assertThrows(TypeError, function () { throw new Error(); });
 */
exports.assertThrows = function (exceptionType, fn) {
  var x;
  try {
    fn();
  } catch (e) {
    x = e;
  }
  assert(x !== undefined, "Didn't throw!");
  assert(x.constructor === exceptionType,
      "Threw " + x.constructor.name +
      ", expected " + exceptionType.name +
      "; exception: " + JSON.stringify(x));
};

/**
 * Checks that an object has a property with the given name, independent
 * of its prototype.
 *
 * @param {*} obj - Object that should contain the property.
 * @param {string} propertyName - Name of the property the object should
 *        contain at own depth.
 */
exports.assertOwnProperty = function (obj, propertyName) {
  assert(obj.hasOwnProperty(propertyName), "Expected " +
      obj.constructor.name + " to have a property '" +
      propertyName + "' but no such property was found.");
};