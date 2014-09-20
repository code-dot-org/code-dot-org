/**
 * The level test driver.
 * Tests collections are specified in .js files in the solutions directory.
 * To extract the xml for a test from a workspace, run the following code in
 * your console:
 * Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace));
 */

// todo - should we also have tests around which blocks to show as part of the
// feedback when a user gets the puzzle wrong?

var path = require('path');
var assert = require('chai').assert;
var wrench = require('wrench');

var child_process = require('child_process');

getTestCollections('./test/solutions').forEach(function (path) {
  runTestCollection(path);
});

// Get all json files under directory path
function getTestCollections (directory) {
  var files = wrench.readdirSyncRecursive(directory);
  var testCollections = [];
  files.forEach(function (file) {
    if (/\.js$/.test(file)) {
      testCollections.push(file);
    }
  });
  return testCollections;
}

// Loads a test collection at path and runs all the tests specified in it.
function runTestCollection (path) {
  var testCollection = require('./solutions/' + path);
  var app = testCollection.app;

  describe(path, function () {
    testCollection.tests.forEach(function (testData, index) {
      // todo - maybe change the name of expected to make it clear what type of
      // test is being run, since we're using the same JSON files for these
      // and our getMissingRequiredBlocks tests (and likely also other things
      // in the future)
      if (testData.expected) {
        runTest(path, testData, index);
      }
    });
  });
}

function runTest (path, testData, index) {
  it(testData.description, function (done) {
    var debugArgs = '';
    // use --dbg to have node start child in debugger on port 5859
    process.argv.forEach(function (arg) {
      if (arg === '--dbg') {
        debugArgs = '--debug-brk=5859';
      }
    });

    // can specify a test specific timeout in json file.
    if (testData.timeout !== undefined) {
      this.timeout(testData.timeout);
    }
    if (process.execArgv.indexOf('--debug') !== -1 ||
      process.execArgv.indexOf('--debug-brk') !== -1 || debugArgs) {
      // Don't timeout while we're debugging
      this.timeout(0);
    }

    // run executor in it's own node process
    child_process.exec('node ' + debugArgs + ' test/util/executor ' + path + ' ' +  index,
      {}, function (error, stdout, stderr) {
        if (stdout && stdout !== '') {
          console.log(stdout);
        }
        assert.equal(error, null);
        assert(stderr === "", '\n' + stderr);
        done();
    });
  });
}
