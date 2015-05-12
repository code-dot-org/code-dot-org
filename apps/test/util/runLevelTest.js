var assert = require('chai').assert;
var _ = require('lodash');
var timeoutList = require('@cdo/apps/timeoutList');
var cb;

module.exports = function(testCollection, testData, dataItem, done) {
  cb = done;
  var data = dataItem();
  var app = testCollection.app;

  // skin shouldn't matter for most cases
  var skinId = testCollection.skinId || 'farmer';

  var level;
  // Each testCollection file must either specify a file from which to get the
  // level, or provide it's own custom level
  if (testCollection.levelFile) {
    var levels = data.levels[testCollection.levelFile];
    level = _.cloneDeep(levels[testCollection.levelId]);
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
      // waitLong();
      setTimeout(report.onComplete, 0);
      // timeoutList.waitAll();
      // timeoutList.clearTimeouts();
    }
  };

  runLevel(app, skinId, level, validateResult, testData.runBeforeClick);
};

function logError(msg) {
  console.log('Log: ' + msg + '\n');
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
  var done = cb;
  cb = null;
  // Main blockspace doesn't always exist (i.e. edit-code)
  if (Blockly.mainBlockSpace) {
    Blockly.mainBlockSpace.clear();
  }
  if(done) {
    done();
  }
};

StubDialog.prototype.hide = function() {
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
}

function runLevel (app, skinId, level, onAttempt, beforeClick) {
  require('@cdo/apps/' + app + '/main');

  var studioApp = require('@cdo/apps/StudioApp').singleton;

  if (level.editCode) {
    assert(window.requirejs);
  }
  setAppSpecificGlobals(app);

  // TODO (brent): Intentionally not messing with timing yet, though that will
  // come in a future commit.
  // Stub timers to speed up tests depending on setTimeout/setInterval
  // if(app == 'studio' || app == 'maze' || app == 'eval') {
  //   require('@cdo/apps/timeoutList').stubTimer(true);
  // }

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

      // we have a race condition for loading our editor. give it another 500ms
      // to load if it hasnt already
      var timeout = 0;
      if (level.editCode && !studioApp.editor) {
        timeout = 500;
      }
      setTimeout(function () {
        studioApp.runButtonClick();
      }, timeout);
      // waitLong();
    },
    onAttempt: onAttempt
  });
}

// function waitLong() {
//   try {
//     timeoutList.advance();
//   } catch (e) {
//     console.log(e);
//   }
// }

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
