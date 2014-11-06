var path = require('path');
var fs = require('fs');
var jsdomRoot = require('jsdom');
var jsdom = require('jsdom').jsdom;
var xmldom = require('xmldom');
var canvas = require('canvas');

var buildDir = '../../build';

var VENDOR_CODE =
  fs.readFileSync(path.join(__dirname, buildDir + '/package/js/en_us/vendor.js'));

setGlobals();

runTestFromCollection(process.argv[2], process.argv[3]);

// Executor is called in its own process.  Logging statements are swalled.
// levelTest treats any write to stderr as test failure, and writes that info
// to the console
function logError(msg) {
  process.stderr.write(msg + '\n');
}

// Using chaiAssert results in most of the contents being swallowed because
// we're in our own process. Instead use a custom assert function that will at
// least give us a callstack on the child process.
function assert(test, msg) {
  if (!test) {
    if (msg) {
      logError(msg + '\n');
    }
    logError(new Error().stack);
  }
}

function setGlobals () {
  // Initialize virtual browser environment.
  var html = '<html><head></head><body><div id="app"></div></body></html>';
  global.document = jsdom(html);
  global.window = global.document.parentWindow;
  global.DOMParser = xmldom.DOMParser;
  global.window.DOMParser = global.DOMParser;
  global.XMLSerializer = xmldom.XMLSerializer;
  global.Blockly = initBlockly(window);
  global.Image = canvas.Image;
  // used by Hammer.js in studio
  global.navigator = {};

  jsdomRoot.dom.level3.html.HTMLElement.prototype.getBBox = function () {
    return {
      height: 0,
      width: 0
    };
  };
}

function initBlockly () {
  /* jshint -W054 */
  var fn = new Function(VENDOR_CODE + '; return Blockly;');
  return fn.call(window);
}

function runTestFromCollection (collection, index) {
  var testCollection = require('../solutions/' + collection);
  var app = testCollection.app;
  var testData = testCollection.tests[index];

  // skin shouldnt matter for most cases
  var skinId = testCollection.skinId || 'farmer';

  var level;
  // Each testCollection file must either specify a file from which to get the
  // level, or provide it's own custom level
  if (testCollection.levelFile) {
    var levels = require(buildDir + '/js/' + app + '/' + testCollection.levelFile);
    level = levels[testCollection.levelId];
  } else {
    if (!testCollection.levelDefinition) {
      logError('testCollection requires levelFile or levelDefinition');
      return;
    }
    level = testCollection.levelDefinition;
  }

  // Override speed
  if (!level.scale) {
    level.scale = {};
  }
  level.scale.stepSpeed = 0;
  level.sliderSpeed = 1;

  // studio tests depend on timing
  if (app === 'studio') {
    level.scale.stepSpeed = 33;
  }

  // Override start blocks to load the solution;
  level.startBlocks = testData.xml;

  // Validate successful solution.
  var validateResult = function (report) {
    assert(Object.keys(testData.expected).length > 0, 'No expected keys specified');
    Object.keys(testData.expected).forEach(function (key) {
      if (report[key] !== testData.expected[key]) {
        logError('Failure for key: ' + key);
        logError('. Expected: ' + testData.expected[key]);
        logError('. Got: ' + report[key] + '\n');
      }
    });

    // define a customValidator to run/validate arbitrary code at the point when
    // BlocklyApps.report gets called. Allows us to access some things that
    // aren't on the options object passed into report
    if (testData.customValidator) {
      assert(testData.customValidator(assert), 'Custom validator failed');
    }
  };

  runLevel(app, skinId, level, validateResult, testData.runBeforeClick);
}

function runLevel (app, skinId, level, onAttempt, beforeClick) {
  require(buildDir + '/js/' + app + '/main');

  setAppSpecificGlobals(app);

  var main = window[app + 'Main'];
  main({
    skinId: skinId,
    level: level,
    baseUrl: '/', // XXX Doesn't matter
    containerId: 'app',
    onInitialize: function() {
      // Click the run button!
      if (beforeClick) {
        beforeClick(assert);
      }
      window.BlocklyApps.runButtonClick();
    },
    onAttempt: onAttempt
  });
}

function setAppSpecificGlobals (app) {
  // app specific hacks
  switch (app.toLowerCase()) {
    case 'turtle':
      global.Turtle = window.Turtle;
      // hack drawTurtle to be a noop, as it's not needed to verify solutions,
      // and drawImage was having issues in a node environment
      global.Turtle.drawTurtle = function () {};
      break;
    case 'calc':
      global.Calc = window.Calc;
      break;
    case 'eval':
      global.Eval = window.Eval;
      break;
  }
}
