var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);
chai.config.includeStack = true;
var assert = chai.assert;
exports.assert = assert;
var tickWrapper = require('./tickWrapper');

require('require-globify');

var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
var Radium = require('radium');
var _ = require('lodash');

exports.buildPath = function (path) {
  return __dirname + '/../../build/js/' + path;
};

var studioApp;

var testBlockFactory = require('./testBlockFactory');

exports.setExternalGlobals = function () {
  window.React = React;
  window.ReactDOM = ReactDOM;
  window.$ = $;
  window.jQuery = $;
  window.Radium = Radium;

  window.dashboard = $.extend(window.dashboard, {
    i18n: {
      t: function (selector) { return selector; }
    },
    // Right now we're just faking some of our dashboard project interactions.
    // If this becomes insufficient, we might be able to require the project.js
    // file from shared here.
    project: {
      clearHtml: function() {},
      exceedsAbuseThreshold: function () { return false; },
      getCurrentId: function () { return 'fake_id'; },
      isEditing: function () { return true; }
    }
  });
  window.marked = function (str) {
    return str;
  };
};

function setupLocale(app) {
  setupLocales();
}

exports.setupLocale = setupLocale;

function setupLocales() {
  // make sure Blockly is loaded
  require('./frame')();
  require('../../build/package/js/en_us/*_locale*.js', {mode: 'expand'});
  assert(window.blockly.applab_locale);
}

exports.setupLocales = setupLocales;

exports.setupBlocklyFrame = function () {
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
  tickWrapper.runOnAppTick(app, tick, fn);
};

/**
 * Check a given predicate every tick, returning a promise that will resolve
 * when the predicate first evaluates TRUE.  This provides an easy way to
 * wait for certain asynchronous test setup to complete before checking
 * assertions.
 *
 * @param {Studio|Applab|GameLab} app - actually, any object with an onTick method.
 * @param {function} predicate
 * @returns {Promise} to resolve when predicate is true
 *
 * @example
 *   tickAppUntil(Applab, function () {
 *     return document.getElementById('slow-element');
 *   }).then(function () {
 *     assert(document.getElementById('slow-element').textContent === 'pass');
 *   });
 */
exports.tickAppUntil = function (app, predicate) {
  return tickWrapper.tickAppUntil(app, predicate);
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
 * drag simulation.
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
  element.trigger(mousedown);

  var drag = $.Event("mousemove", {
    pageX: $("#visualization").offset().left + left,
    pageY: $("#visualization").offset().top + top
  });
  $(document).trigger(drag);

  // when we start our drag, it positions the dragged element to be centered
  // on our cursor. adjust the target drop location accordingly
  var halfWidth = $('.draggingParent').width() / 2;
  var drag2 = $.Event("mousemove", {
    pageX: $("#visualization").offset().left + left + halfWidth,
    pageY: $("#visualization").offset().top + top
  });
  $(document).trigger(drag2);

  var mouseup = $.Event('mouseup', {
    pageX: $("#visualization").offset().left + left + halfWidth,
    pageY: $("#visualization").offset().top + top
  });
  $(document).trigger(mouseup);
};

/**
 * From: http://marcgrabanski.com/simulating-mouse-click-events-in-javascript
 * Creates a mouse event of the given type with the given clientX/clientY
 * @param {string} type
 * @param {number} clientX
 * @param {number} clientY
 */
exports.createMouseEvent = function mouseEvent(type, clientX, clientY) {
  var evt;
  var e = {
    bubbles: true,
    cancelable: (type != "mousemove"),
    view: window,
    detail: 0,
    screenX: undefined,
    screenY: undefined,
    clientX: clientX,
    clientY: clientY,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: undefined
  };
  if (typeof( document.createEvent ) == "function") {
    evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(type,
      e.bubbles, e.cancelable, e.view, e.detail,
      e.screenX, e.screenY, e.clientX, e.clientY,
      e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
      e.button, document.body.parentNode);
  } else if (document.createEventObject) {
    evt = document.createEventObject();
    for (var prop in e) {
      evt[prop] = e[prop];
    }
    evt.button = {0:1, 1:4, 2:2}[evt.button] || evt.button;
  }
  return evt;
};

/**
 * Append text to the ace editor
 */
exports.typeAceText = function (text) {
  var aceEditor = window.__TestInterface.getDroplet().aceEditor;
  aceEditor.textInput.focus();
  aceEditor.onTextInput(text);
};

/**
 * Set the Ace editor text to the given text
 */
exports.setAceText = function (text) {
  var aceEditor = window.__TestInterface.getDroplet().aceEditor;
  aceEditor.textInput.focus();
  aceEditor.setValue(text);
};
