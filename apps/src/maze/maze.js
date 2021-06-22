const React = require('react');
const ReactDOM = require('react-dom');
const Provider = require('react-redux').Provider;

const timeoutList = require('../lib/util/timeoutList');
import AppView from '../templates/AppView';
const CustomMarshalingInterpreter = require('../lib/tools/jsinterpreter/CustomMarshalingInterpreter')
  .default;
const codegen = require('../lib/tools/jsinterpreter/codegen');
const dom = require('../dom');
const utils = require('../utils');
import {TestResults, ResultType} from '../constants';
const generateCodeAliases = require('../dropletUtils').generateCodeAliases;
const getStore = require('../redux').getStore;
const studioApp = require('../StudioApp').singleton;
const containedLevels = require('../containedLevels');
const getContainedLevelResultInfo = containedLevels.getContainedLevelResultInfo;
const postContainedLevelAttempt = containedLevels.postContainedLevelAttempt;
const runAfterPostContainedLevel = containedLevels.runAfterPostContainedLevel;

const ExecutionInfo = require('./executionInfo');
const MazeVisualizationColumn = require('./MazeVisualizationColumn');
const api = require('./api');
const dropletConfig = require('./dropletConfig');
const mazeReducer = require('./redux');

const maze = require('@code-dot-org/maze');
const MazeController = maze.MazeController;
const tiles = maze.tiles;

const createResultsHandlerForSubtype = require('./results/utils')
  .createResultsHandlerForSubtype;

module.exports = class Maze {
  constructor() {
    this.scale = {
      snapRadius: 1,
      stepSpeed: 5
    };

    this.shouldSpeedUpInfiniteLoops = true;
    this.stepSpeed = 100;
    this.animating_ = false;

    this.resultsHandler = undefined;
    this.response = undefined;
    this.result = undefined;
    this.testResults = undefined;
    this.waitingForReport = undefined;

    //TODO: Make configurable.
    studioApp().setCheckForEmptyBlocks(true);
  }

  /**
   * Used by appMain to register reducers
   * TODO elijah should this be a static method?
   */
  getAppReducers() {
    return {
      maze: mazeReducer.default
    };
  }

  init(config) {
    // replace studioApp() methods with our own
    studioApp().runButtonClick = this.runButtonClick_;
    studioApp().reset = this.reset_;

    const skin = config.skin;
    const level = config.level;

    // Override scalars.
    for (var key in level.scale) {
      this.scale[key] = level.scale[key];
    }

    if (level.map && level.shapeShift) {
      for (let i = 1, max = Math.random() * 4; i < max; i++) {
        level.map = utils.rotate(level.map);
        level.startDirection = (level.startDirection + 3) % 4;
      }
    }

    config.grayOutUndeletableBlocks = true;
    config.forceInsertTopBlock = 'when_run';
    config.dropletConfig = dropletConfig;

    this.controller = new MazeController(level, skin, config, {
      methods: {
        playAudio: (sound, options) => {
          studioApp().playAudio(sound, {...options, noOverlap: true});
        },
        playAudioOnFailure: studioApp().playAudioOnFailure.bind(studioApp()),
        loadAudio: studioApp().loadAudio.bind(studioApp()),
        getTestResults: studioApp().getTestResults.bind(studioApp())
      }
    });

    this.resultsHandler = createResultsHandlerForSubtype(
      this.controller,
      config
    );

    if (this.controller.subtype.overrideStepSpeed) {
      this.scale.stepSpeed = this.controller.subtype.overrideStepSpeed;
    }

    config.loadAudio = () => {
      studioApp().loadAudio(this.controller.skin.winSound, 'win');
      studioApp().loadAudio(this.controller.skin.startSound, 'start');
      studioApp().loadAudio(this.controller.skin.failureSound, 'failure');
      studioApp().loadAudio(this.controller.skin.obstacleSound, 'obstacle');
      // Load wall sounds.
      studioApp().loadAudio(this.controller.skin.wallSound, 'wall');

      if (this.controller.skin.walkSound) {
        studioApp().loadAudio(this.controller.skin.walkSound, 'walk');
      }

      // todo - longterm, instead of having sound related flags we should just
      // have the skin tell us the set of sounds it needs
      if (this.controller.skin.additionalSound) {
        studioApp().loadAudio(this.controller.skin.wall0Sound, 'wall0');
        studioApp().loadAudio(this.controller.skin.wall1Sound, 'wall1');
        studioApp().loadAudio(this.controller.skin.wall2Sound, 'wall2');
        studioApp().loadAudio(this.controller.skin.wall3Sound, 'wall3');
        studioApp().loadAudio(this.controller.skin.wall4Sound, 'wall4');
        studioApp().loadAudio(this.controller.skin.winGoalSound, 'winGoal');
      }
      if (this.controller.skin.dirtSound) {
        studioApp().loadAudio(this.controller.skin.fillSound, 'fill');
        studioApp().loadAudio(this.controller.skin.digSound, 'dig');
      }
      this.controller.subtype.loadAudio(this.controller.skin);
    };

    config.afterInject = () => {
      if (studioApp().isUsingBlockly()) {
        /**
         * The richness of block colours, regardless of the hue.
         * MOOC blocks should be brighter (target audience is younger).
         * Must be in the range of 0 (inclusive) to 1 (exclusive).
         * Blockly's default is 0.45.
         */
        Blockly.HSV_SATURATION = 0.6;

        Blockly.SNAP_RADIUS *= this.scale.snapRadius;
        Blockly.JavaScript.INFINITE_LOOP_TRAP = codegen.loopTrap();
      }

      const svg = document.getElementById('svgMaze');
      this.controller.map.resetDirt();

      this.controller.subtype.initStartFinish();
      this.controller.subtype.createDrawer(svg);
      this.controller.subtype.initWallMap();

      // Adjust visualizationColumn width.
      var visualizationColumn = document.getElementById('visualizationColumn');
      visualizationColumn.style.width = this.controller.MAZE_WIDTH + 'px';

      this.controller.initWithSvg(svg);

      var stepButton = document.getElementById('stepButton');
      dom.addClickTouchEvent(stepButton, this.stepButtonClick_);

      // base's studioApp().resetButtonClick will be called first
      var resetButton = document.getElementById('resetButton');
      dom.addClickTouchEvent(resetButton, this.resetButtonClick_);

      var finishButton = document.getElementById('finishButton');
      if (finishButton) {
        finishButton.setAttribute('disabled', 'disabled');
        dom.addClickTouchEvent(finishButton, this.finishButtonClick_);
      }

      // Listen for hint events that draw a path in the game.
      window.addEventListener('displayHintPath', e => {
        this.controller.drawHintPath(svg, e.detail);
      });
    };

    // Note: Setting alwaysHideRunButton in our config is necessary because
    // StudioApp.js will manipulate the run/reset buttons, displaying the run
    // button when "Reset" is clicked. We do not want this behavior on stepOnly levels.
    const alwaysHideRunButton = !!(
      this.controller.level.stepOnly && !this.controller.level.edit_blocks
    );
    config.alwaysHideRunButton = alwaysHideRunButton;

    // Push initial level properties into the Redux store
    studioApp().setPageConstants(config, {
      hideRunButton: alwaysHideRunButton
    });

    var visualizationColumn = (
      <MazeVisualizationColumn
        searchWord={this.controller.level.searchWord}
        showCollectorGemCounter={this.controller.subtype.isCollector()}
        showFinishButton={
          this.controller.subtype.isCollector() &&
          !studioApp().hasContainedLevels
        }
        showStepButton={
          !!(this.controller.level.step && !this.controller.level.edit_blocks)
        }
      />
    );

    ReactDOM.render(
      <Provider store={getStore()}>
        <AppView
          visualizationColumn={visualizationColumn}
          onMount={studioApp().init.bind(studioApp(), config)}
        />
      </Provider>,
      document.getElementById(config.containerId)
    );
  }

  /**
   * Click the run button.  Start the program.
   */
  // XXX This is the only method used by the templates!
  // TODO confirm that the above XXX comment is accurate
  runButtonClick_ = () => {
    var stepButton = document.getElementById('stepButton');
    if (stepButton) {
      stepButton.setAttribute('disabled', '');
    }
    this.execute_(false);
  };

  /**
   * Handle a click on the step button.  If we're already animating, we should
   * perform a single step.  Otherwise, we call beginAttempt which will do
   * some initial setup, and then perform the first step.
   */
  stepButtonClick_ = () => {
    var stepButton = document.getElementById('stepButton');
    stepButton.setAttribute('disabled', '');

    if (this.animating_) {
      this.scheduleAnimations_(true);
    } else {
      this.execute_(true);
    }
  };

  /**
   * App specific reset button click logic.  studioApp().resetButtonClick will be
   * called first.
   */
  resetButtonClick_ = () => {
    var stepButton = document.getElementById('stepButton');
    stepButton.removeAttribute('disabled');
  };

  /**
   * Handle a click on the finish button; stop animating if we are, and display
   * whatever feedback we currently have.
   *
   * Currently only used by Collector levels to allow users to continue iterating
   * on a pass-but-not-perfect solution, but still finish whenever they want.
   */
  finishButtonClick_ = () => {
    timeoutList.clearTimeouts();
    this.animating_ = false;
    this.displayFeedback_(true);
  };

  reset_ = () => {
    this.animating_ = false;
    timeoutList.clearTimeouts();
    this.controller.reset();
  };

  beginAttempt() {
    var runButton = document.getElementById('runButton');
    var resetButton = document.getElementById('resetButton');
    // Ensure that Reset button is at least as wide as Run button.
    if (!resetButton.style.minWidth) {
      resetButton.style.minWidth = runButton.offsetWidth + 'px';
    }
    studioApp().toggleRunReset('reset');
    if (studioApp().isUsingBlockly()) {
      Blockly.mainBlockSpace.traceOn(true);
    }
    studioApp().reset(false);
    studioApp().attempts++;
  }

  isPreAnimationFailure(testResult) {
    return (
      testResult === TestResults.QUESTION_MARKS_IN_NUMBER_FIELD ||
      testResult === TestResults.EMPTY_FUNCTIONAL_BLOCK ||
      testResult === TestResults.EXTRA_TOP_BLOCKS_FAIL ||
      testResult === TestResults.EXAMPLE_FAILED ||
      testResult === TestResults.EMPTY_BLOCK_FAIL ||
      testResult === TestResults.EMPTY_FUNCTION_NAME
    );
  }

  /**
   * Execute the user's code.  Heaven help us...
   */
  execute_(stepMode) {
    this.beginAttempt();
    this.prepareForExecution_();

    var code = '';
    if (studioApp().isUsingBlockly()) {
      let codeBlocks = Blockly.mainBlockSpace.getTopBlocks(true);
      if (studioApp().initializationBlocks) {
        codeBlocks = studioApp().initializationBlocks.concat(codeBlocks);
      }

      code = Blockly.Generator.blocksToCode('JavaScript', codeBlocks);
    } else {
      code = generateCodeAliases(dropletConfig, 'Maze');
      code += studioApp().editor.getValue();
    }

    // Try running the user's code.  There are a few possible outcomes:
    // 1. If pegman reaches the finish [SUCCESS], executionInfo's termination
    //    value is set to true.
    // 2. If the program is terminated due to running too long [TIMEOUT],
    //    the termination value is set to Infinity
    // 3. If the program terminated because of hitting a wall/obstacle, the
    //    termination value is set to false and the ResultType is ERROR
    // 4. If the program finishes without meeting success condition, we have no
    //    termination value and set ResultType to FAILURE
    // 5. The only other time we should fail should be if an exception is thrown
    //    during execution, in which case we set ResultType to ERROR.
    // The animation should be fast if execution was successful, slow otherwise
    // to help the user see the mistake.
    studioApp().playAudio('start');
    try {
      // don't bother running code if we're just editting required blocks. all
      // we care about is the contents of report.
      var initialTestResults = studioApp().getTestResults(false);
      var runCode =
        !this.isPreAnimationFailure(initialTestResults) &&
        !this.controller.level.edit_blocks;

      if (runCode) {
        if (this.controller.map.hasMultiplePossibleGrids()) {
          // If this.controller.level is a level with multiple possible grids, we
          // need to run against all grids and sort them into successes
          // and failures
          var successes = [];
          var failures = [];
          const numGrids = this.controller.map.staticGrids.length;

          for (let i = 0; i < numGrids; i++) {
            this.controller.map.useGridWithId(i);
            this.controller.subtype.reset();

            // Run trial
            CustomMarshalingInterpreter.evalWith(code, {
              Maze: api,
              executionInfo: this.executionInfo
            });

            // Sort static grids based on trial result
            this.onExecutionFinish_();
            if (this.executionInfo.terminationValue() === true) {
              successes.push(i);
            } else if (this.executionInfo.terminationValue() === Infinity) {
              // terminationValue Infinity means executing took more than the maximum number of steps
              // so we have declared it to be an infinite loop. If there are a lot of map configurations that result
              // in infinite loops, the time required to check each one is perceived as buggy/glitchy. To prevent this
              // perceived lag,  we should stop checking map configurations as soon as we detect an infinite loop
              // and immediately show the result. It is possible that there is an infinite loop
              // on only some map configurations. In these cases, we should always show the map configuration
              // with first infinite loop we detect.
              failures = [i];
              break;
            } else {
              failures.push(i);
            }

            // Reset for next trial
            this.controller.subtype.drawer.reset();
            this.prepareForExecution_();
            studioApp().reset(false);
          }

          // The user's code needs to succeed against all possible grids
          // to be considered actually successful; if there are any
          // failures, randomly select one of the failing grids to be the
          // "real" state of the map. If all grids are successful,
          // randomly select any one of them.
          var i =
            failures.length > 0
              ? utils.randomValue(failures)
              : utils.randomValue(successes);

          this.controller.map.useGridWithId(i);
          this.controller.subtype.reset();
        }

        CustomMarshalingInterpreter.evalWith(code, {
          Maze: api,
          executionInfo: this.executionInfo
        });
      }

      this.onExecutionFinish_();

      switch (this.executionInfo.terminationValue()) {
        case null:
          // didn't terminate
          this.executionInfo.queueAction('finish', null);
          this.result = ResultType.FAILURE;
          this.stepSpeed = 150;
          break;
        case Infinity:
          // Detected an infinite loop.  Animate what we have as quickly as
          // possible
          this.result = ResultType.TIMEOUT;
          this.executionInfo.queueAction('finish', null);
          this.stepSpeed = this.shouldSpeedUpInfiniteLoops ? 0 : 100;
          break;
        case true:
          this.result = ResultType.SUCCESS;
          this.stepSpeed = 100;
          break;
        case false:
          this.result = ResultType.ERROR;
          this.stepSpeed = 150;
          break;
        default:
          // App-specific failure.
          this.testResults = this.resultsHandler.getTestResults(
            this.executionInfo.terminationValue()
          );
          this.result =
            this.testResults >= TestResults.MINIMUM_PASS_RESULT
              ? ResultType.SUCCESS
              : ResultType.ERROR;
          this.executionInfo.queueAction('finish', null);
          break;
      }
    } catch (e) {
      // Syntax error, can't happen.
      this.result = ResultType.ERROR;
      console.error('Unexpected exception: ' + e + '\n' + e.stack);
      // call window.onerror so that we get new relic collection.  prepend with
      // UserCode so that it's clear this is in eval'ed code.
      if (window.onerror) {
        window.onerror('UserCode:' + e.message, document.URL, 0);
      }
      return;
    }

    // If we know they succeeded, mark levelComplete true
    // Note that we have not yet animated the successful run
    var levelComplete = this.result === ResultType.SUCCESS;

    // Set testResults unless app-specific results were set in the default
    // branch of the above switch statement.
    if (this.testResults === TestResults.NO_TESTS_RUN) {
      this.testResults = studioApp().getTestResults(levelComplete);
    }

    var program;
    if (this.controller.level.editCode) {
      // If we want to "normalize" the JavaScript to avoid proliferation of nearly
      // identical versions of the code on the service, we could do either of these:

      // do an acorn.parse and then use escodegen to generate back a "clean" version
      // or minify (uglifyjs) and that or js-beautify to restore a "clean" version

      program = studioApp().editor.getValue();
    } else {
      var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
      program = Blockly.Xml.domToText(xml);
    }

    this.waitingForReport = true;

    if (studioApp().hasContainedLevels && !this.controller.level.edit_blocks) {
      // Contained levels post progress in a special way, and always pass
      postContainedLevelAttempt(studioApp());
      this.testResults = TestResults.ALL_PASS;
      runAfterPostContainedLevel(this.onReportComplete_);
    } else {
      // Report result to server.
      studioApp().report({
        app: 'maze',
        level: this.controller.level.id,
        result: this.result === ResultType.SUCCESS,
        testResult: this.testResults,
        program: encodeURIComponent(program),
        onComplete: this.onReportComplete_
      });
    }

    // Maze. now contains a transcript of all the user's actions.
    // Reset the maze and animate the transcript.
    studioApp().reset(false);
    this.controller.resetDirtImages(true);

    // if we have extra top blocks, don't even bother animating
    if (this.testResults === TestResults.EXTRA_TOP_BLOCKS_FAIL) {
      this.result = ResultType.ERROR;
      this.displayFeedback_();
      return;
    }

    this.animating_ = true;

    this.controller.animationsController.stopIdling();

    // Speeding up specific levels
    var scaledStepSpeed =
      this.stepSpeed *
      this.scale.stepSpeed *
      this.controller.skin.movePegmanAnimationSpeedScale;
    timeoutList.setTimeout(() => {
      this.scheduleAnimations_(stepMode);
    }, scaledStepSpeed);
  }

  scheduleAnimations_(singleStep) {
    timeoutList.clearTimeouts();

    var timePerAction =
      this.stepSpeed *
      this.scale.stepSpeed *
      this.controller.skin.movePegmanAnimationSpeedScale;
    // get a flat list of actions we want to schedule
    var actions = this.executionInfo.getActions(singleStep);

    this.scheduleSingleAnimation_(0, actions, singleStep, timePerAction);
  }

  /**
   * Called after user's code has finished being executed, giving us one more
   * chance to check if we've accomplished our goals. This is required in part
   * because elsewhere we only check for success after movement.
   */
  onExecutionFinish_() {
    // If we haven't terminated, make one last check for success
    if (!this.executionInfo.isTerminated()) {
      this.checkSuccess();
    }

    this.resultsHandler.onExecutionFinish();
  }

  /**
   * App specific displayFeedback function that calls into
   * studioApp().displayFeedback when appropriate
   */
  displayFeedback_(finalFeedback = false) {
    if (this.waitingForReport || this.animating_) {
      return;
    }
    var options = {
      feedbackType: this.testResults,
      response: this.response,
      level: this.controller.level
    };

    let message;
    if (studioApp().hasContainedLevels) {
      message = getContainedLevelResultInfo().feedback;
    } else if (this.resultsHandler.hasMessage(this.testResults)) {
      // If there was an app-specific error
      // add it to the options passed to studioApp().displayFeedback().
      message = this.resultsHandler.getMessage(
        this.executionInfo.terminationValue()
      );
    }

    if (message) {
      options.message = message;
    }

    // We will usually want to allow subtypes to situationally prevent a dialog
    // from being shown if they want to allow the user to pass but keep them on
    // the page for iteration; we only refrain from doing so if we know this is
    // the "final" feedback display triggered by the Finish Button
    if (!finalFeedback) {
      options.preventDialog = this.resultsHandler.shouldPreventFeedbackDialog(
        options.feedbackType
      );
    }

    studioApp().displayFeedback(options);
  }

  /**
   * Function to be called when the service report call is complete
   * @param {MilestoneResponse} response - JSON response (if available)
   */
  onReportComplete_ = response => {
    this.response = response;
    this.waitingForReport = false;
    studioApp().onReportComplete(response);
    this.displayFeedback_();
  };

  /**
   * Perform some basic initialization/resetting operations before
   * execution. This function should be idempotent, as it can be called
   * during execution when running multiple trials.
   */
  prepareForExecution_() {
    this.executionInfo = new ExecutionInfo({
      ticks: 1000
    });
    this.resultsHandler.executionInfo = this.executionInfo;
    this.result = ResultType.UNSET;
    this.testResults = TestResults.NO_TESTS_RUN;
    this.waitingForReport = false;
    this.animating_ = false;
    this.response = null;
  }

  /**
   * Animates a single action
   * @param {string} action The action to animate
   * @param {integer} timePerStep How much time we have allocated before the next step
   */
  animateAction_(action, timePerStep) {
    if (action.blockId) {
      studioApp().highlight(String(action.blockId));
    }

    switch (action.command) {
      case 'north':
        this.controller.animatedMove(tiles.Direction.NORTH, timePerStep);
        break;
      case 'east':
        this.controller.animatedMove(tiles.Direction.EAST, timePerStep);
        break;
      case 'south':
        this.controller.animatedMove(tiles.Direction.SOUTH, timePerStep);
        break;
      case 'west':
        this.controller.animatedMove(tiles.Direction.WEST, timePerStep);
        break;
      case 'look_north':
        this.controller.animatedLook(tiles.Direction.NORTH);
        break;
      case 'look_east':
        this.controller.animatedLook(tiles.Direction.EAST);
        break;
      case 'look_south':
        this.controller.animatedLook(tiles.Direction.SOUTH);
        break;
      case 'look_west':
        this.controller.animatedLook(tiles.Direction.WEST);
        break;
      case 'fail_forward':
        this.controller.animatedFail(true);
        break;
      case 'fail_backward':
        this.controller.animatedFail(false);
        break;
      case 'left':
        this.controller.animatedTurn(tiles.TurnDirection.LEFT);
        break;
      case 'right':
        this.controller.animatedTurn(tiles.TurnDirection.RIGHT);
        break;
      case 'finish':
        this.finish_(timePerStep);
        break;
      case 'putdown':
        this.controller.scheduleFill();
        break;
      case 'pickup':
        this.controller.scheduleDig();
        break;
      case 'fail_pickup':
        this.controller.animatedFail(false);
        break;
      case 'nectar':
        this.controller.subtype.animateGetNectar();
        break;
      case 'honey':
        this.controller.subtype.animateMakeHoney();
        break;
      case 'get_corn':
        this.controller.subtype.animateGetCorn();
        break;
      case 'get_pumpkin':
        this.controller.subtype.animateGetPumpkin();
        break;
      case 'get_lettuce':
        this.controller.subtype.animateGetLettuce();
        break;
      case 'plant':
        this.controller.subtype.animatePlant();
        break;
      default:
        // action[0] is null if generated by studioApp().checkTimeout().
        break;
    }
  }

  finish_(timePerStep) {
    // Only schedule victory animation for certain conditions:
    if (this.testResults >= TestResults.MINIMUM_PASS_RESULT) {
      var finishButton = document.getElementById('finishButton');
      if (finishButton) {
        finishButton.removeAttribute('disabled');
      }
      var finishIcon = document.getElementById('finish');
      if (finishIcon) {
        studioApp().playAudio('winGoal');
      }
      studioApp().playAudioOnWin();
      this.controller.animatedFinish(timePerStep);
    } else {
      timeoutList.setTimeout(function() {
        studioApp().playAudioOnFailure();
      }, this.stepSpeed);
    }
  }

  /**
   * schedule animations in sequence
   * The reason we do this recursively instead of iteratively is that we want to
   * ensure that we finish scheduling action1 before starting to schedule
   * action2. Otherwise we get into trouble when stepSpeed is 0.
   */
  scheduleSingleAnimation_(index, actions, singleStep, timePerAction) {
    if (index >= actions.length) {
      this.finishAnimations_(singleStep);
      return;
    }

    this.animateAction_(actions[index], timePerAction);

    var command = actions[index] && actions[index].command;
    var timeModifier =
      (this.controller.skin.actionSpeedScale &&
        this.controller.skin.actionSpeedScale[command]) ||
      1;
    var timeForThisAction = Math.round(timePerAction * timeModifier);

    timeoutList.setTimeout(() => {
      this.scheduleSingleAnimation_(
        index + 1,
        actions,
        singleStep,
        timePerAction
      );
    }, timeForThisAction);
  }

  /**
   * Once animations are complete, we want to reenable the step button if we
   * have steps left, otherwise we're done with this execution.
   */
  finishAnimations_(singleStep) {
    var stepsRemaining = this.executionInfo.stepsRemaining();
    var stepButton = document.getElementById('stepButton');

    // allow time for  additional pause if we're completely done
    var waitTime = stepsRemaining ? 0 : 1000;

    // run after all animations
    timeoutList.setTimeout(() => {
      if (stepsRemaining) {
        stepButton.removeAttribute('disabled');
      } else {
        this.animating_ = false;
        // If stepping and we failed, we want to retain highlighting until
        // clicking reset.  Otherwise we can clear highlighting/disabled
        // blocks now
        if (!singleStep || this.result === ResultType.SUCCESS) {
          studioApp().clearHighlighting();
        }
        this.displayFeedback_();
      }
    }, waitTime);
  }

  /**
   * Certain Maze types - namely, WordSearch, Collector, and any Maze with
   * Quantum maps, don't want to check for success until the user's code
   * has finished running completely.
   */
  shouldCheckSuccessOnMove() {
    if (this.controller.map.hasMultiplePossibleGrids()) {
      return false;
    }
    return this.resultsHandler.shouldCheckSuccessOnMove();
  }

  /**
   * Check whether all goals have been accomplished
   */
  checkSuccess() {
    const succeeded = this.resultsHandler.succeeded();

    if (succeeded) {
      // Finished.  Terminate the user's program.
      this.executionInfo.queueAction('finish', null);
      this.executionInfo.terminateWithValue(true);
    }

    return succeeded;
  }
};
