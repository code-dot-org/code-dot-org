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

var testUtils = require('./util/testUtils');
testUtils.setupLocales();

describe('Level tests', function() {
  var studioApp;

  beforeEach(function () {
    testUtils.setupBlocklyFrame();
    studioApp = testUtils.getStudioAppSingleton();
  });

  getTestCollections().forEach(function (item, index) {
    runTestCollection(item);
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
  var path = item.path;
  var testCollection = item.data;

  var app = testCollection.app;

  describe(path, function () {
    testCollection.tests.forEach(function (testData, index) {
      if(testData.editCode) {
        console.log('Skipping editCode test: ' + testData.description);
        return;
      }
      // todo - maybe change the name of expected to make it clear what type of
      // test is being run, since we're using the same JSON files for these
      // and our getMissingRequiredBlocks tests (and likely also other things
      // in the future)
      if (testData.expected) {
        it(testData.description, function (done) {
          var dataItem = require('./util/data')(app);
          // can specify a test specific timeout in json file.
          if (testData.timeout !== undefined) {
            this.timeout(testData.timeout);
          }
          runLevelTest(testCollection, testData, dataItem, done);
        });
      }
    });
  });
}

