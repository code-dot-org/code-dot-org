var assert = require('chai').assert;
var path = require('path');
var fs = require('fs');
var jsdomRoot = require('jsdom');
var jsdom = require('jsdom').jsdom;
var xmldom = require('xmldom');
var canvas = require('canvas');
var requirejs = require('requirejs');
var testUtils = require('./testUtils');
testUtils.setupLocales();
var msg = testUtils.requireWithGlobalsCheckBuildFolder('../locale/current/common', ['c', 'n', 'v', 'p', 's']);

var buildDir = '../../build';

var BLOCKLY_CODE =
  fs.readFileSync(path.join(__dirname, buildDir + '/package/js/blockly.js'));
var BLOCKLY_LOCALE_CODE =
  fs.readFileSync(path.join(__dirname, buildDir + '/package/js/en_us/blockly_locale.js'));

setGlobals();

var testCollection = require('../solutions/' + process.argv[2]);
var testData = testCollection.tests[process.argv[3]];

setLevelSpecificGlobals();

runTestFromCollection();

// Executor is called in its own process.  Logging statements are swalled.
// levelTest treats any write to stderr as test failure, and writes that info
// to the console
function logError(msg) {
  process.stderr.write(msg + '\n');
}

function setGlobals () {
  // Initialize virtual browser environment.
  var html = '<html><head></head><body><div id="app"></div></body></html>';
  global.document = jsdom(html);
  global.window = global.document.parentWindow;
  global.DOMParser = xmldom.DOMParser;
  global.window.DOMParser = global.DOMParser;
  global.XMLSerializer = xmldom.XMLSerializer;
  // needed for Hammer.js and Ace
  global.navigator = {
    'platform': 'other',
    'appName': 'other',
    'userAgent': 'other'
  };
  global.Image = canvas.Image;

  jsdomRoot.dom.level3.html.HTMLElement.prototype.getBBox = function () {
    return {
      height: 0,
      width: 0
    };
  };

  // contains and focus are needed in applab
  jsdomRoot.dom.level3.html.HTMLElement.prototype.contains = function () {
    return true;
  };
  jsdomRoot.dom.level3.html.HTMLElement.prototype.focus = function () {
  };
}

function setLevelSpecificGlobals () {
  if (testData.editCode) {
    global.requirejs = requirejs;
    global.Interpreter = initInterpreter();
    global.acorn = window.acorn;
    initAce();
    // must set global.define after ace and before droplet
    global.define = requirejs.define;
    initDroplet();
  } else {
    global.Blockly = initBlockly(window);
  }
}

function initBlockly () {
  /* jshint -W054 */
  var fn = new Function(BLOCKLY_CODE + ';' + BLOCKLY_LOCALE_CODE + '; return Blockly;');
  return fn.call(window);
}

function initInterpreter () {
  /* jshint -W054 */
  var INTERPRETER_CODE =
    fs.readFileSync(path.join(__dirname, buildDir + '/package/js/jsinterpreter/acorn_interpreter.js'));
  var fn = new Function(INTERPRETER_CODE);
  fn.call(window);
  return window.Interpreter;
}

function initAce () {
  /* jshint -W054 */
  var ACE_CODE =
    fs.readFileSync(path.join(__dirname, buildDir + '/package/js/ace/ace.js'));
  var fn = new Function(ACE_CODE);
  fn.call(window);

  var ACE_LANG_EXT_CODE =
    fs.readFileSync(path.join(__dirname, buildDir + '/package/js/ace/ext-language_tools.js'));
  fn = new Function(ACE_LANG_EXT_CODE);
  fn.call(window);
}

function initDroplet () {
  /* jshint -W054 */
  var DROPLET_CODE =
    fs.readFileSync(path.join(__dirname, buildDir + '/package/js/droplet/droplet-full.js'));
  var fn = new Function(DROPLET_CODE);
  fn.call(window);
}

function runTestFromCollection () {
  var app = testCollection.app;
  testUtils.setupLocale(app);

  // skin shouldnt matter for most cases
  var skinId = testCollection.skinId || 'farmer';

  var level;
  // Each testCollection file must either specify a file from which to get the
  // level, or provide it's own custom level
  if (testCollection.levelFile) {
    var levels = require(testUtils.buildPath(app + '/' + testCollection.levelFile));
    level = levels[testCollection.levelId];
  } else {
    // custom levels can either be across all tests in the collection (in which
    // case it's testCollection.levelDefinition), or for a single test (in which
    // case it's returned by testData.delayLoadLevelDefinition())
    // NOTE: we could simplify things by converting everyone to use the per test
    // usage instead of the per collection usage
    if (!testCollection.levelDefinition && !testData.delayLoadLevelDefinition) {
      logError('testCollection requires levelFile or levelDefinition');
      return;
    }
    level = testCollection.levelDefinition || testData.delayLoadLevelDefinition();
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
    // StudioApp.report gets called. Allows us to access some things that
    // aren't on the options object passed into report
    if (testData.customValidator) {
      assert(testData.customValidator(assert), 'Custom validator failed');
    }

    // Notify the app that the report operation is complete
    // (important to do this asynchronously to simulate a service call or else
    //  we will have problems with the animating_ / waitingForReport_ states
    //  in the maze state machine)
    if (report.onComplete) {
      setTimeout(report.onComplete, 0);
    }
  };

  runLevel(app, skinId, level, validateResult, testData.runBeforeClick);
}

function StubDialog(options) {
  this.options = options;
}

StubDialog.prototype.show = function() {
  if (this.options.body) {
    // Examine content of the feedback in future tests?
    // console.log(this.options.body.innerHTML);
  }
  // Level is complete and feedback dialog has appeared: exit() succesfully here
  // (otherwise process may continue indefinitely due to timers)
  process.exit(0);
};

StubDialog.prototype.hide = function() {
};

function runLevel (app, skinId, level, onAttempt, beforeClick) {
  require(buildDir + '/js/' + app + '/main');
  var studioApp = require(buildDir + '/js/StudioApp').singleton;
  setAppSpecificGlobals(app);

  var main = window[app + 'Main'];
  main({
    skinId: skinId,
    level: level,
    baseUrl: '/', // Doesn't matter
    containerId: 'app',
    Dialog: StubDialog,
    onInitialize: function() {
      // Click the run button!
      if (beforeClick) {
        beforeClick(assert);
      }
      studioApp.runButtonClick();
    },
    onAttempt: onAttempt
  });
}

function setAppSpecificGlobals (app) {
  // app specific hacks
  switch (app.toLowerCase()) {
    case 'calc':
      global.Calc = window.Calc;
      break;
    case 'eval':
      global.Eval = window.Eval;
      break;
  }
}
