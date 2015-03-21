var assert = require('chai').assert;

module.exports = function(testCollection, testData, dataItem) {
  var data = dataItem();
  var app = testCollection.app;
  //testUtils.setupLocale(app);

  // skin shouldn't matter for most cases
  var skinId = testCollection.skinId || 'farmer';

  var level;
  // Each testCollection file must either specify a file from which to get the
  // level, or provide it's own custom level
  if (testCollection.levelFile) {
    var levels = data.levels[testCollection.levelFile];
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
  logError("Finished, exit!!");
};

StubDialog.prototype.hide = function() {
};


function runLevel (app, skinId, level, onAttempt, beforeClick) {
  if(app == 'maze') {
    require('@cdo/apps/maze/main');
  } else {
    logError('Not maze?!?!?!');
  }

  var studioApp = require('@cdo/apps/StudioApp').singleton;
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
