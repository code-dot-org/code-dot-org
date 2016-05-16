/**
 * The level test driver.
 * Tests collections are specified in .js files in the solutions directory.
 * To extract the xml for a test from a workspace, run the following code in
 * your console:
 * Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));
 */

// todo - should we also have tests around which blocks to show as part of the
// feedback when a user gets the puzzle wrong?

var path = require('path');
var assert = require('chai').assert;
var $ = require('jquery');
var sinon = require('sinon');
require('jquery-ui');
var tickWrapper = require('./util/tickWrapper');

var wrappedEventListener = require('./util/wrappedEventListener');
var testCollectionUtils = require('./util/testCollectionUtils');

var testUtils = require('./util/testUtils');
testUtils.setupLocales();
testUtils.setExternalGlobals();

// Anatomy of a level test collection. The example itself is uncommented so
// that you get the benefits of editor syntax highlighting
var example = {
  // app name
  app: "turtle",
  // name of the level file within the app directory. will almost always be levels
  levelFile: "levels",
  // id of the level within the levels file
  levelId: "5_5",
  // a complete level defintion, can be used instead of levelFile/levelId
  levelDefinition: {},
  // a set of tests
  tests: [
    {
      description: 'Text describing this test',
      // this is passed to report
      expected: {
        result: true, // expected result value
        testResult: 10 // expected testResult value
      },
      // a function that returns a level definition on demand. this allows for
      // per test level definitions (dont need a collection levelId/levelDefinition
      // if taking this approach)
      delayLoadLevelDefinition: function () {},

      // xml to be used for startBlocks. set to string 'startBlocks' if you want
      // to use the xml from the level itself
      xml: '',
      // Prefix to add to the names of image and sound assets in applab instead of
      // "/v3/assets/". Set this to "//localhost:8001/apps/test/assets/" and add
      // files to apps/test/assets if you need requests for assets to succeed.
      assetPathPrefix: '',
      customValidator: function (assert) {
        // optional function called at puzzle finish (i.e. when BlocklyApps.report
        // is called.
        return true; // test fails if it returns false
      },
      runBeforeClick: function (assert) {
        // optional function called after puzzle loads, but before execution
        // starts
      }
    }
  ]
};

// One day this might be the sort of thing we share with initApp.js
function loadSource(src) {
  var deferred = new $.Deferred();
  document.body.appendChild($('<script>', { src: src }).on('load', function () {
    deferred.resolve();
  })[0]);
  return deferred;
}

describe('Level tests', function () {
  var studioApp;
  var originalRender;
  var clock, tickInterval;

  before(function (done) {
    this.timeout(15000);

    // Load a bunch of droplet sources. We could potentially gate this on level.editCode,
    // but that doesn't get us a lot since everything is run in a single session now.
    loadSource('http://localhost:8001/apps/lib/jsinterpreter/acorn.js')
    .then(function () { return loadSource('http://localhost:8001/apps/lib/jsinterpreter/interpreter.js'); })
    .then(function () { return loadSource('http://localhost:8001/apps/lib/ace/src-noconflict/ace.js'); })
    .then(function () { return loadSource('http://localhost:8001/apps/lib/ace/src-noconflict/mode-javascript.js'); })
    .then(function () { return loadSource('http://localhost:8001/apps/lib/ace/src-noconflict/ext-language_tools.js'); })
    .then(function () { return loadSource('http://localhost:8001/apps/lib/droplet/droplet-full.js'); })
    .then(function () { return loadSource('http://localhost:8001/apps/lib/tooltipster/jquery.tooltipster.js'); })
    .then(function () { return loadSource('http://localhost:8001/apps/lib/phaser/phaser.js'); })
    .then(function () { return loadSource('http://localhost:8001/apps/lib/p5play/p5.js'); })
    .then(function () { return loadSource('http://localhost:8001/apps/lib/p5play/p5.play.js'); })
    .then(function () {
      assert(window.droplet, 'droplet in global namespace');
      done();
    });
  });

  beforeEach(function () {
    tickInterval = window.setInterval(function () {
      if (clock) {
        clock.tick(100); // fake 1000 ms for every real 1ms
      }
    }, 1);
    clock = sinon.useFakeTimers(Date.now());

    testUtils.setupBlocklyFrame();
    studioApp = testUtils.getStudioAppSingleton();

    wrappedEventListener.attach();

    // For some reason, svg rendering is taking a long time in phantomjs. None
    // of these tests depend on that rendering actually happening.
    originalRender = Blockly.BlockSvg.prototype.render;
    Blockly.BlockSvg.prototype.render = function () {
      this.block_.rendered = true;
    };

    if (window.Studio) {
      var StudioAnimation = require('@cdo/apps/studio/StudioAnimation');
      StudioAnimation.__resetIds();
      Studio.JSInterpreter = undefined;
    }

    // Recreate our redux store so that we have a fresh copy
    studioApp.createReduxStore_();

    if (window.Applab) {
      var elementLibrary = require('@cdo/apps/applab/designElements/library');
      elementLibrary.resetIds();
    }

    if (window.Calc) {
      Calc.resetButtonClick();
    }
  });

  testCollectionUtils.getCollections().forEach(runTestCollection);

  afterEach(function () {
    clock.restore();
    clearInterval(tickInterval);
    var studioApp = require('@cdo/apps/StudioApp').singleton;
    if (studioApp.editor && studioApp.editor.aceEditor &&
        studioApp.editor.aceEditor.session &&
        studioApp.editor.aceEditor.session.$mode &&
        studioApp.editor.aceEditor.session.$mode.cleanup) {
      studioApp.editor.aceEditor.session.$mode.cleanup();
    }
    wrappedEventListener.detach();
    Blockly.BlockSvg.prototype.render = originalRender;

    // Clean up some state that is meant to be per level. This is an issue
    // because we're using the same window for all tests.
    if (window.Maze) {
      window.Maze.bee = null;
      window.Maze.wordSearch = null;
    }
    if (window.Studio) {
      window.Studio.customLogic = null;
      window.Studio.interpreter = null;
    }

    tickWrapper.reset();
  });
});

// Loads a test collection at path and runs all the tests specified in it.
function runTestCollection(item) {
  var runLevelTest = require('./util/runLevelTest');
  // Append back the .js so that we can distinguish 2_1.js from 2_10.js when grepping
  var path = item.path + '.js';
  var testCollection = item.data;

  var app = testCollection.app;

  describe(path, function () {
    testCollection.tests.forEach(function (testData, index) {
      testUtils.setupLocale(app);
      var dataItem = require('./util/data')(app);

      // todo - maybe change the name of expected to make it clear what type of
      // test is being run, since we're using the same JSON files for these
      // and our getMissingBlocks tests (and likely also other things
      // in the future)
      if (testData.expected) {
        it(testData.description, function (done) {
          // can specify a test specific timeout in json file.
          if (testData.timeout !== undefined) {
            this.timeout(testData.timeout);
          }

          if (testUtils.debugMode()) {
            // No timeout if we have a debugger attached
            this.timeout(0);
          }
          runLevelTest(testCollection, testData, dataItem, done);
        });
      }
    });
  });
}
