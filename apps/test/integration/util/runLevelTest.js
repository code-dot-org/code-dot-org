import $ from 'jquery';
import {assert} from '../../util/configuredChai';
import { getConfigRef, getDatabase } from '@cdo/apps/applab/firebaseUtils';

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

  level.hideViewDataButton = testData.hideViewDataButton;

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

function runLevel(app, skinId, level, onAttempt, testData) {
  require('@cdo/apps/' + app + '/main');

  var studioApp = require('@cdo/apps/StudioApp').singleton;

  if (level.editCode) {
    assert(window.droplet, 'droplet is in global');
  }
  setAppSpecificGlobals(app);

  window.dashboard.project.useFirebase = function () {
    return Boolean(testData.useFirebase);
  };

  var main = window[app + 'Main'];
  main({
    skinId: skinId,
    level: level,
    baseUrl: '/base/build/package/',
    channel: 'applab-channel-id',
    assetPathPrefix: testData.assetPathPrefix,
    containerId: 'app',
    Dialog: StubDialog,
    // Fail fast if firebase is used without testData.useFirebase being specified.
    firebaseName: testData.useFirebase ? 'test-firebase-name' : '',
    firebaseAuthToken: testData.useFirebase ? 'test-firebase-auth-token' : '',
    isAdmin: true,
    onInitialize: function () {
      // we have a race condition for loading our editor. give it another 500ms
      // to load if it hasnt already
      var timeout = 0;
      if (level.editCode && !studioApp.editor) {
        timeout = 500;
      }

      // Avoid unnecessary delay for tests which don't use firebase.
      if (testData.useFirebase) {
        getDatabase(Applab.channelId).autoFlush();
        getConfigRef().set({
          limits: {
            '15': 5,
            '60': 10
          },
          maxRecordSize: 100,
          maxPropertySize: 100,
          maxTableRows: 20,
          maxTableCount: 10,
        });
        timeout = 500;
      }

      setTimeout(function () {
        assert(window.droplet, 'droplet is in global');

        // Click the run button!
        if (testData.runBeforeClick) {
          testData.runBeforeClick(assert);
        }

        $("#runButton").click();

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
