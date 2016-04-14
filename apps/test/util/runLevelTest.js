var assert = require('chai').assert;
var _ = require('lodash');
var testCollectionUtils = require('./testCollectionUtils');

var cb;

module.exports = function (testCollection, testData, dataItem, done) {
  cb = done;
  var data = dataItem();
  var app = testCollection.app;

  // skin shouldn't matter for most cases
  var skinId = testCollection.skinId || 'farmer';

  var level = testCollectionUtils.getLevelFromCollection(testCollection,
    testData, dataItem);

  // Override speed
  if (!level.scale) {
    level.scale = {};
  }
  level.scale.stepSpeed = 1;
  level.sliderSpeed = 1;

  // studio tests depend on timing
  if (app === 'studio') {
    level.scale.stepSpeed = 33;
  }

  // Override start blocks to load the solution;
  level.startBlocks = testData.xml;
  level.levelHtml = testData.levelHtml;

  // Validate successful solution.
  var validateResult = function (report) {
    assert(testData.expected, 'Have expectations');
    assert(Object.keys(testData.expected).length > 0, 'No expected keys specified');
    Object.keys(testData.expected).forEach(function (key) {
      if (report[key] !== testData.expected[key]) {
        var failureMsg = 'Failure for key: ' + key + '. Expected: ' + testData.expected[key] + '. Got: ' + report[key] + '\n';
        assert(false, failureMsg);
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

  runLevel(app, skinId, level, validateResult, testData);
};

function logError(msg) {
  console.log('Log: ' + msg + '\n');
}

function StubDialog(options) {
  this.options = options;
}

StubDialog.prototype.show = function () {
  if (this.options.body) {
    // Examine content of the feedback in future tests?
    // console.log(this.options.body.innerHTML);
  }
  // Level is complete and feedback dialog has appeared: exit() succesfully here
  // (otherwise process may continue indefinitely due to timers)
  var done = cb;
  cb = null;
  // Main blockspace doesn't always exist (i.e. edit-code)
  if (Blockly.mainBlockSpace) {
    Blockly.mainBlockSpace.clear();
  }
  if (done) {
    done();
  }
};

StubDialog.prototype.hide = function () {
};

// Hack to compile files into browserify. Don't call this function!
// TODO (brent) : this can probably be replaced using require-globify and/or
// making use of data.js
function ಠ_ಠ() {
  require('@cdo/apps/maze/main');
  require('@cdo/apps/flappy/main');
  require('@cdo/apps/turtle/main');
  require('@cdo/apps/eval/main');
  require('@cdo/apps/studio/main');
  require('@cdo/apps/calc/main');
  require('@cdo/apps/bounce/main');
  require('@cdo/apps/applab/main');
  require('@cdo/apps/gamelab/main');
  require('@cdo/apps/craft/main');
}

function runLevel(app, skinId, level, onAttempt, testData) {
  require('@cdo/apps/' + app + '/main');

  var studioApp = require('@cdo/apps/StudioApp').singleton;

  if (level.editCode) {
    assert(window.droplet, 'droplet is in global');
  }
  setAppSpecificGlobals(app);

  var main = window[app + 'Main'];
  main({
    skinId: skinId,
    level: level,
    baseUrl: 'http://localhost:8001/apps/build/package/',
    channel: 'applab-channel-id',
    assetPathPrefix: testData.assetPathPrefix,
    containerId: 'app',
    Dialog: StubDialog,
    isAdmin: true,
    onInitialize: function () {
      // we have a race condition for loading our editor. give it another 500ms
      // to load if it hasnt already
      var timeout = 0;
      if (level.editCode && !studioApp.editor) {
        timeout = 500;
      }

      setTimeout(function () {
        assert(window.droplet, 'droplet is in global');

        // Click the run button!
        if (testData.runBeforeClick) {
          testData.runBeforeClick(assert);
        }

        studioApp.runButtonClickWrapper.call(studioApp, studioApp.runButtonClick);

      }, timeout);
      // waitLong();
    },
    onAttempt: onAttempt
  });
}

function setAppSpecificGlobals(app) {
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
