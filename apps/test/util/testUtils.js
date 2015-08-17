var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;
exports.assert = assert;
require('require-globify');

var $ = require('jquery');

exports.buildPath = function (path) {
  return __dirname + '/../../build/js/' + path;
};

var _ = require('lodash');

var studioApp;

var testBlockFactory = require('./testBlockFactory');

function setupLocale(app) {
  setupLocales();
}

exports.setupLocale = setupLocale;

function setupLocales() {
  // make sure Blockly is loaded
  require('./frame')();
  require('../../build/package/js/en_us/*_locale-????????????????????????????????.js', { mode: 'expand'});
  assert(window.blockly.applab_locale);
}

exports.setupLocales = setupLocales;

exports.setupBlocklyFrame = function () {
  // TODO (brent): Intentionally not messing with timing yet, though that will
  // come in a future commit.
  // var timeoutList = require('@cdo/apps/timeoutList');
  // timeoutList.clearTimeouts();
  // timeoutList.stubTimer(false);
  require('./frame')();
  assert(global.Blockly, 'Frame loaded Blockly into global namespace');
  assert(Object.keys(global.Blockly).length > 0);
  Blockly.JavaScript.INFINITE_LOOP_TRAP = null;

  setupLocales();

  // c, n, v, p, s get added to global namespace by messageformat module, which
  // is loaded when we require our locale msg files
  studioApp = require('@cdo/apps/StudioApp').singleton;
  studioApp.reset = function(){};

  var blocklyAppDiv = document.getElementById('app');
  assert(blocklyAppDiv, 'blocklyAppDiv exists');


  studioApp.assetUrl = function (path) {
    return '../lib/blockly/' + path;
  };
};

/**
 * Initializes an instance of blockly for testing
 */
exports.setupTestBlockly = function() {
  exports.setupBlocklyFrame();
  var options = {
    assetUrl: studioApp.assetUrl
  };
  var blocklyAppDiv = document.getElementById('app');
  Blockly.inject(blocklyAppDiv, options);
  // TODO (brent)
  // studioApp.removeEventListeners();
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
  var ArtistAPI = require('@cdo/apps/turtle/api');
  var api = new ArtistAPI();

  api.log = [];
  generatedCode(api);
  return api.log;
};

/**
 * Runs the given function at the provided tick count. For Studio.
 */
exports.runOnStudioTick = function (tick, fn) {
  exports.runOnAppTick(Studio, tick, fn);
};

/**
 * Generic function allowing us to hook into onTick. Only tested for Studio/Applab
 */
exports.runOnAppTick = function (app, tick, fn) {
  if (!app) {
    throw new Error('not supported outside of studio/applab');
  }
  var ran = false;
  app.onTick = _.wrap(app.onTick, function (originalOnTick) {
    if (app.tickCount === tick && !ran) {
      ran = true;
      fn();
    }
    originalOnTick();
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
 * Check that two numbers are close, within a given threshold.
 * @param {number} left
 * @param {number} right
 * @param {number} maxDelta
 */
exports.assertWithinRange = function (left, right, maxDelta) {
  assert(Math.abs(left - right) <= maxDelta, "Values " + left + " and " +
      right + " are more than " + maxDelta + " apart.");
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
      "; exception: " + x.message);
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


/**
 * @returns {boolean} True if mochify was launched with debug flag
 */
exports.debugMode = function () {
  return location.search.substring(1).split('&').indexOf('debug') !== -1;
};

/**
 * jQuery.simulate was having issues in phantom, so I decided to roll my own
 * drag simulation. May belong in a util file.
 * @param {string} type ElementType to be dragged in
 * @param {number} left Horizontal offset from top left of visualization to drop at
 * @param {number} top Vertical offset from top left of visualization to drop at
 */
exports.dragToVisualization = function (type, left, top) {
  // drag a new element in
  var element = $("[data-element-type='" + type + "']");
  var screenOffset = element.offset();
  var mousedown = $.Event("mousedown", {
    which: 1,
    pageX: screenOffset.left,
    pageY: screenOffset.top
  });
  var drag = $.Event("mousemove", {
    pageX: $("#visualization").offset().left + left,
    pageY: $("#visualization").offset().top + top
  });
  var mouseup = $.Event('mouseup', {
    pageX: $("#visualization").offset().left + left,
    pageY: $("#visualization").offset().top + top
  });
  element.trigger(mousedown);
  $(document).trigger(drag);
  $(document).trigger(mouseup);
};
