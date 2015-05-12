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

var testUtils = require('./util/testUtils');
testUtils.setupLocales();

var wrappedEventListener = require('./util/wrappedEventListener');

// One day this might be the sort of thing we share with initApp.js
function loadSource(src) {
  var deferred = new $.Deferred();
  document.body.appendChild($('<script>', { src: src }).on('load', function () {
    deferred.resolve();
  })[0]);
  return deferred;
}
describe('Level tests', function() {
  var studioApp;
  var originalRender;

  before(function(done) {
    this.timeout(15000);
    // Load a bunch of droplet sources. We could potentially gate this on level.editCode,
    // but that doesn't get us a lot since everything is run in a single session now.
    loadSource('http://localhost:8001/jsinterpreter/acorn_interpreter.js')
    .then(function () { return loadSource('http://localhost:8001/requirejs/full/require.js'); })
    .then(function () { return loadSource('http://localhost:8001/ace/src-noconflict/ace.js'); })
    .then(function () { return loadSource('http://localhost:8001/ace/src-noconflict/mode-javascript.js'); })
    .then(function () { return loadSource('http://localhost:8001/ace/src-noconflict/ext-language_tools.js'); })
    .then(function () { return loadSource('http://localhost:8001/droplet/droplet-full.js'); })
    .then(function () {
      assert(requirejs);
      done();
    });
  });

  beforeEach(function () {
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
      var Projectile = require('@cdo/apps/studio/projectile');
      Projectile.__resetIds();
    }
  });

  getTestCollections().forEach(runTestCollection);

  afterEach(function () {
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
  });
});

// Get all json files under directory path
function getTestCollections () {
  // require-globify transform
  var files = require('./solutions/**/*.js', {hash: 'path'});
  var testCollections = [];
  Object.keys(files).forEach(function (file) {
    testCollections.push({path: file, data: files[file]});
  });

  return testCollections;
}

// Loads a test collection at path and runs all the tests specified in it.
function runTestCollection (item) {
  var runLevelTest = require('./util/runLevelTest');
  // Append back the .js so that we can distinguish 2_1.js from 2_10.js when grepping
  var path = item.path + '.js';
  var testCollection = item.data;

  var app = testCollection.app;

  describe(path, function () {
    testCollection.tests.forEach(function (testData, index) {
      // todo - maybe change the name of expected to make it clear what type of
      // test is being run, since we're using the same JSON files for these
      // and our getMissingRequiredBlocks tests (and likely also other things
      // in the future)
      if (testData.expected) {
        it(testData.description, function (done) {
          testUtils.setupLocale(app);
          var dataItem = require('./util/data')(app);
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
