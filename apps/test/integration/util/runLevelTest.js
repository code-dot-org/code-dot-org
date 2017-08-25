import $ from 'jquery';
import LegacyDialog from '@cdo/apps/code-studio/LegacyDialog';
import {assert} from '../../util/configuredChai';
import { getConfigRef, getDatabase } from '@cdo/apps/storage/firebaseUtils';
import Firebase from 'firebase';
import MockFirebase from '../../util/MockFirebase';

var testCollectionUtils = require('./testCollectionUtils');

function log(msg) {
  console.log(`[${Date.now()}]  ${msg}`);
}

function levelTestDone(mochaDone) {
  let cb = mochaDone;
  return function finished() {
    log('test finished!');
    // Level is complete and feedback dialog has appeared: exit() succesfully here
    // (otherwise process may continue indefinitely due to timers)
    let done = cb;
    cb = null;
    // TODO: Move this to an after-each step
    // Main blockspace doesn't always exist (i.e. edit-code)
    if (Blockly.mainBlockSpace) {
      Blockly.mainBlockSpace.clear();
    }
    if (done) {
      log('calling done');
      done();
    }
  };
}


module.exports = function (testCollection, testData, dataItem, done) {
  const finished = levelTestDone(done);

  LegacyDialog.prototype.show.callsFake(() => {
    if (!LegacyDialog.levelTestDontFinishOnShow) {
      log('Legacy dialog shown');
      finished();
    }
  });

  dataItem();
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

  if (testData.lastAttempt) {
    level.lastAttempt = testData.lastAttempt;
  }

  // Override start blocks to load the solution;
  level.startBlocks = testData.xml;

  level.startHtml = testData.startHtml;
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

  runLevel(app, skinId, level, validateResult, finished, testData);
};

const appLoaders = {
  applab: require('@cdo/apps/sites/studio/pages/init/loadApplab'),
  bounce: require('@cdo/apps/sites/studio/pages/init/loadBounce'),
  calc: require('@cdo/apps/sites/studio/pages/init/loadCalc'),
  craft: require('@cdo/apps/sites/studio/pages/init/loadCraft'),
  eval: require('@cdo/apps/sites/studio/pages/init/loadEval'),
  flappy: require('@cdo/apps/sites/studio/pages/init/loadFlappy'),
  gamelab: require('../../util/gamelab/loadTestableGamelab'),
  jigsaw: require('@cdo/apps/sites/studio/pages/init/loadJigsaw'),
  maze: require('@cdo/apps/sites/studio/pages/init/loadMaze'),
  netsim: require('@cdo/apps/sites/studio/pages/init/loadNetSim'),
  studio: require('@cdo/apps/sites/studio/pages/init/loadStudio'),
  turtle: require('@cdo/apps/sites/studio/pages/init/loadArtist'),
  weblab: require('@cdo/apps/sites/studio/pages/init/loadWeblab'),
};
function runLevel(app, skinId, level, onAttempt, finished, testData) {
  var loadApp = appLoaders[app];

  var studioApp = require('@cdo/apps/StudioApp').singleton;

  if (level.editCode) {
    assert(window.droplet, 'droplet is in global');
  }
  setAppSpecificGlobals(app);

  const unexpectedExecutionErrorMsg = 'Unexpected execution error. ' +
    'Define onExecutionError() in your level test case to handle this.';

  loadApp({
    skinId: skinId,
    level: level,
    baseUrl: '/base/build/package/',
    channel: 'applab-channel-id',
    assetPathPrefix: testData.assetPathPrefix,
    containerId: 'app',
    embed: testData.embed,
    firebaseName: 'test-firebase-name',
    firebaseAuthToken: 'test-firebase-auth-token',
    isSignedIn: true,
    isAdmin: true,
    onFeedback: () => {log('onFeedback'); finished();},
    onExecutionError: testData.onExecutionError ? testData.onExecutionError :
      () => { throw unexpectedExecutionErrorMsg; },
    onInitialize: function () {
      // we have a race condition for loading our editor. give it another 500ms
      // to load if it hasnt already
      var timeout = 0;
      if (level.editCode && !studioApp().editor) {
        timeout = 500;
      }

      if (app === 'applab') {
        // Karma must be configured to use MockFirebase in our webpack config.
        assert(Firebase === MockFirebase,
          'Expected to be using apps/test/util/MockFirebase in level tests.');

        getDatabase().autoFlush();
        getConfigRef().autoFlush();
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

        getDatabase().set(null);
      }

      setTimeout(function () {
        assert(window.droplet, 'droplet is in global');

        // Click the run button!
        if (testData.runBeforeClick) {
          testData.runBeforeClick(assert);
        }

        log('clicking run button');
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
