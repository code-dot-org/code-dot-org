/**
 * Blockly Apps: Maze
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JavaScript for Blockly's Maze application.
 * @author fraser@google.com (Neil Fraser)
 */

const React = require('react');
const ReactDOM = require('react-dom');
const Provider = require('react-redux').Provider;

const timeoutList = require('../lib/util/timeoutList');
const AppView = require('../templates/AppView');
const CustomMarshalingInterpreter = require('../lib/tools/jsinterpreter/CustomMarshalingInterpreter');
const codegen = require('../lib/tools/jsinterpreter/codegen');
const dom = require('../dom');
const utils = require('../utils');
const constants = require('../constants');
const TestResults = constants.TestResults;
const ResultType = constants.ResultType;
const generateCodeAliases = require('../dropletUtils').generateCodeAliases;
const getStore = require('../redux').getStore;
const studioApp = require('../StudioApp').singleton;
const containedLevels = require('../containedLevels');
const getContainedLevelResultInfo = containedLevels.getContainedLevelResultInfo;
const postContainedLevelAttempt = containedLevels.postContainedLevelAttempt;
const runAfterPostContainedLevel = containedLevels.runAfterPostContainedLevel;

const AnimationsController = require('./animationsController');
const ExecutionInfo = require('./executionInfo');
const MazeMap = require('./mazeMap');
const MazeVisualizationColumn = require('./MazeVisualizationColumn');
const api = require('./api');
const drawMap = require('./drawMap');
const dropletConfig = require('./dropletConfig');
const mazeReducer = require('./redux');
const getSubtypeForSkin = require('./mazeUtils').getSubtypeForSkin;
const tiles = require('./tiles');

module.exports = class Maze {
  constructor() {
    this.scale = {
      snapRadius: 1,
      stepSpeed: 5
    };

    this.stepSpeed = 100;

    this.cachedBlockStates = [];

    this.level;
    this.skin;
    this.startDirection;

    this.map;
    this.subtype;
    this.executionInfo;
    this.animationsController;

    this.animating_;
    this.response;
    this.result;
    this.testResults;
    this.waitingForReport;

    this.pegmanD;
    this.pegmanX;
    this.pegmanY;

    this.MAZE_HEIGHT;
    this.MAZE_WIDTH;
    this.PATH_WIDTH;
    this.PEGMAN_HEIGHT;
    this.PEGMAN_WIDTH;
    this.PEGMAN_X_OFFSET;
    this.PEGMAN_Y_OFFSET;
    this.SQUARE_SIZE;

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

  loadLevel_() {
    // Load maps.
    //
    // "serializedMaze" is the new way of storing maps; it's a JSON array
    // containing complex map data.
    //
    // "map" plus optionally "levelDirt" is the old way of storing maps;
    // they are each arrays of a combination of strings and ints with
    // their own complex syntax. This way is deprecated for new levels,
    // and only exists for backwards compatibility for not-yet-updated
    // levels.
    if (this.level.serializedMaze) {
      this.map = MazeMap.deserialize(this.level.serializedMaze, this.subtype.getCellClass());
    } else {
      this.map = MazeMap.parseFromOldValues(this.level.map, this.level.initialDirt, this.subtype.getCellClass());
    }

    // this could possibly be eliminated in favor of just always referencing
    // this.level.startDirection
    this.startDirection = this.level.startDirection;

    // this could probably be moved to the constructor
    this.animating_ = false;

    // Override scalars.
    for (var key in this.level.scale) {
      this.scale[key] = this.level.scale[key];
    }

    if (this.level.fastGetNectarAnimation) {
      this.skin.actionSpeedScale.nectar = 0.5;
    }

    // Pixel height and width of each maze square (i.e. tile).
    this.SQUARE_SIZE = 50;
    this.PEGMAN_HEIGHT = this.skin.pegmanHeight;
    this.PEGMAN_WIDTH = this.skin.pegmanWidth;
    this.PEGMAN_X_OFFSET = this.skin.pegmanXOffset || 0;
    this.PEGMAN_Y_OFFSET = this.skin.pegmanYOffset;

    this.MAZE_WIDTH = this.SQUARE_SIZE * this.map.COLS;
    this.MAZE_HEIGHT = this.SQUARE_SIZE * this.map.ROWS;
    this.PATH_WIDTH = this.SQUARE_SIZE / 3;
  }

  /**
   * Redraw all dirt images
   * @param {boolean} running Whether or not user program is currently running
   */
  resetDirtImages_(running) {
    this.map.forEachCell((cell, row, col) => {
      this.subtype.drawer.updateItemImage(row, col, running);
    });
  }

  /**
   * Initialize Blockly and the maze.  Called on page load.
   */
  init(config) {
    // replace studioApp() methods with our own
    studioApp().runButtonClick = this.runButtonClick_;
    studioApp().reset = this.reset_;

    this.skin = config.skin;
    this.level = config.level;

    if (this.level.map && this.level.shapeShift) {
      for (let i = 1, max = Math.random() * 4; i < max; i++) {
        this.level.map = utils.rotate(this.level.map);
        this.level.startDirection = (this.level.startDirection + 3) % 4;
      }
    }

    config.grayOutUndeletableBlocks = true;
    config.forceInsertTopBlock = 'when_run';
    config.dropletConfig = dropletConfig;

    const Type = getSubtypeForSkin(config.skinId);
    this.subtype = new Type(this, studioApp(), config);

    if (this.subtype.overrideStepSpeed) {
      this.scale.stepSpeed = this.subtype.overrideStepSpeed;
    }

    this.loadLevel_();

    config.loadAudio = () => {
      studioApp().loadAudio(this.skin.winSound, 'win');
      studioApp().loadAudio(this.skin.startSound, 'start');
      studioApp().loadAudio(this.skin.failureSound, 'failure');
      studioApp().loadAudio(this.skin.obstacleSound, 'obstacle');
      // Load wall sounds.
      studioApp().loadAudio(this.skin.wallSound, 'wall');

      if (this.skin.walkSound) {
        studioApp().loadAudio(this.skin.walkSound, 'walk');
      }

      // todo - longterm, instead of having sound related flags we should just
      // have the skin tell us the set of sounds it needs
      if (this.skin.additionalSound) {
        studioApp().loadAudio(this.skin.wall0Sound, 'wall0');
        studioApp().loadAudio(this.skin.wall1Sound, 'wall1');
        studioApp().loadAudio(this.skin.wall2Sound, 'wall2');
        studioApp().loadAudio(this.skin.wall3Sound, 'wall3');
        studioApp().loadAudio(this.skin.wall4Sound, 'wall4');
        studioApp().loadAudio(this.skin.winGoalSound, 'winGoal');
      }
      if (this.skin.dirtSound) {
        studioApp().loadAudio(this.skin.fillSound, 'fill');
        studioApp().loadAudio(this.skin.digSound, 'dig');
      }
      this.subtype.loadAudio(this.skin);
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
        Blockly.JavaScript.INFINITE_LOOP_TRAP = codegen.loopHighlight("Maze");
      }

      const svg = document.getElementById('svgMaze');
      this.map.resetDirt();

      this.subtype.initStartFinish();
      this.subtype.createDrawer(svg);
      this.subtype.initWallMap();


      // Adjust outer element size.
      svg.setAttribute('width', this.MAZE_WIDTH);
      svg.setAttribute('height', this.MAZE_HEIGHT);

      // Adjust visualizationColumn width.
      var visualizationColumn = document.getElementById('visualizationColumn');
      visualizationColumn.style.width = this.MAZE_WIDTH + 'px';

      drawMap.default(svg, this.skin, this.subtype, this.map, this.SQUARE_SIZE);
      this.animationsController = new AnimationsController(this, svg);

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
        this.drawHintPath_(svg, e.detail);
      });
    };

    if (
      config.embed &&
      config.level.markdownInstructions &&
      !config.level.instructions
    ) {
      // if we are an embedded level with markdown instructions but no regular
      // instructions, we want to display CSP-style instructions and not be
      // centered
      config.noInstructionsWhenCollapsed = true;
      config.centerEmbedded = false;
    }

    // Push initial level properties into the Redux store
    studioApp().setPageConstants(config, {
      hideRunButton: !!(this.level.stepOnly && !this.level.edit_blocks)
    });

    var visualizationColumn = (
      <MazeVisualizationColumn
        searchWord={this.level.searchWord}
        showCollectorGemCounter={this.subtype.isCollector()}
        showFinishButton={this.subtype.isCollector() && !studioApp().hasContainedLevels}
        showStepButton={!!(this.level.step && !this.level.edit_blocks)}
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

  gridNumberToPosition_(n) {
    return (n + 0.5) * this.SQUARE_SIZE;
  }

  /**
   * @param svg
   * @param {Array<Array>} coordinates An array of x and y grid coordinates.
   */
  drawHintPath_(svg, coordinates) {
    const path = svg.getElementById('hintPath');
    path.setAttribute('d', 'M' + coordinates.map(([x, y]) => {
      return `${this.gridNumberToPosition_(x)},${this.gridNumberToPosition_(y)}`;
    }).join(' '));
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

  scheduleAnimations_(singleStep) {
    this.animationsController.scheduleAnimations(singleStep, () => {
      this.animating_ = false;
      if (studioApp().isUsingBlockly()) {
        // reenable toolbox
        Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
      }
      // If stepping and we failed, we want to retain highlighting until
      // clicking reset.  Otherwise we can clear highlighting/disabled
      // blocks now
      if (!singleStep || this.result === ResultType.SUCCESS) {
        this.reenableCachedBlockStates_();
        studioApp().clearHighlighting();
      }
      this.displayFeedback_();
    });
  }

  /**
   * App specific reset button click logic.  studioApp().resetButtonClick will be
   * called first.
   */
  resetButtonClick_ = () => {
    var stepButton = document.getElementById('stepButton');
    stepButton.removeAttribute('disabled');

    this.reenableCachedBlockStates_();
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

  /**
   * Reset the maze to the start position and kill any pending animation tasks.
   * @param {boolean} first True if an opening animation is to be played.
   */
  reset_ = (first) => {
    this.subtype.reset();

    // Kill all tasks.
    timeoutList.clearTimeouts();

    this.animating_ = false;

    // Move Pegman into position.
    this.pegmanX = this.subtype.start.x;
    this.pegmanY = this.subtype.start.y;

    this.pegmanD = this.startDirection;
    this.animationsController.reset(first);

    // Move the init dirt marker icons into position.
    this.map.resetDirt();
    this.resetDirtImages_(false);

    // Reset the obstacle image.
    var obsId = 0;
    var x, y;
    for (y = 0; y < this.map.ROWS; y++) {
      for (x = 0; x < this.map.COLS; x++) {
        var obsIcon = document.getElementById('obstacle' + obsId);
        if (obsIcon) {
          obsIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                                 this.skin.obstacleIdle);
        }
        ++obsId;
      }
    }

    if (this.subtype.resetTiles) {
      this.subtype.resetTiles();
    } else {
      this.resetTiles_();
    }
  };

  resetTiles_() {
    // Reset the tiles
    var tileId = 0;
    for (var y = 0; y < this.map.ROWS; y++) {
      for (var x = 0; x < this.map.COLS; x++) {
        // Tile's clipPath element.
        var tileClip = document.getElementById('tileClipPath' + tileId);
        tileClip.setAttribute('visibility', 'visible');
        // Tile sprite.
        var tileElement = document.getElementById('tileElement' + tileId);
        tileElement.setAttributeNS(
            'http://www.w3.org/1999/xlink', 'xlink:href', this.skin.tiles);
        tileElement.setAttribute('opacity', 1);
        tileId++;
      }
    }
  }

  reenableCachedBlockStates_() {
    if (this.cachedBlockStates) {
      // restore moveable/deletable/editable state from before we started stepping
      this.cachedBlockStates.forEach(function (cached) {
        cached.block.setMovable(cached.movable);
        cached.block.setDeletable(cached.deletable);
        cached.block.setEditable(cached.editable);
      });
      this.cachedBlockStates = [];
    }
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
      level: this.level
    };

    let message;
    if (studioApp().hasContainedLevels) {
      message = getContainedLevelResultInfo().feedback;
    } else if (this.subtype.hasMessage(this.testResults)) {
      // If there was an app-specific error
      // add it to the options passed to studioApp().displayFeedback().
      message = this.subtype.getMessage(this.executionInfo.terminationValue());
    }

    if (message) {
      options.message = message;
    }

    // We will usually want to allow subtypes to situationally prevent a dialog
    // from being shown if they want to allow the user to pass but keep them on
    // the page for iteration; we only refrain from doing so if we know this is
    // the "final" feedback display triggered by the Finish Button
    if (!finalFeedback) {
      options.preventDialog = this.subtype.shouldPreventFeedbackDialog(
        options.feedbackType,
      );
    }

    studioApp().displayFeedback(options);
  }

  /**
   * Function to be called when the service report call is complete
   * @param {MilestoneResponse} response - JSON response (if available)
   */
  onReportComplete_ = (response) => {
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
      ticks: 100
    });
    this.result = ResultType.UNSET;
    this.testResults = TestResults.NO_TESTS_RUN;
    this.waitingForReport = false;
    this.animating_ = false;
    this.response = null;
  }

  static isPreAnimationFailure(testResult) {
    return testResult === TestResults.QUESTION_MARKS_IN_NUMBER_FIELD ||
      testResult === TestResults.EMPTY_FUNCTIONAL_BLOCK ||
      testResult === TestResults.EXTRA_TOP_BLOCKS_FAIL ||
      testResult === TestResults.EXAMPLE_FAILED ||
      testResult === TestResults.EMPTY_BLOCK_FAIL ||
      testResult === TestResults.EMPTY_FUNCTION_NAME;
  }

  /**
   * TODO elijah should this be an instance method?
   */
  static beginAttempt() {
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

  /**
   * Execute the user's code.  Heaven help us...
   */
  execute_(stepMode) {
    Maze.beginAttempt();
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
      var runCode = !Maze.isPreAnimationFailure(initialTestResults) && !this.level.edit_blocks;

      if (runCode) {
        if (this.map.hasMultiplePossibleGrids()) {
          // If this level is a level with multiple possible grids, we
          // need to run against all grids and sort them into successes
          // and failures
          var successes = [];
          var failures = [];

          this.map.staticGrids.forEach((grid, i) => {
            this.map.useGridWithId(i);
            this.subtype.reset();

            // Run trial
            CustomMarshalingInterpreter.evalWith(code, {
              Maze: api,
              executionInfo: this.executionInfo
            });

            // Sort static grids based on trial result
            this.onExecutionFinish_();
            if (this.executionInfo.terminationValue() === true) {
              successes.push(i);
            } else {
              failures.push(i);
            }

            // Reset for next trial
            this.subtype.drawer.reset();
            this.prepareForExecution_();
            studioApp().reset(false);
          });

          // The user's code needs to succeed against all possible grids
          // to be considered actually successful; if there are any
          // failures, randomly select one of the failing grids to be the
          // "real" state of the map. If all grids are successful,
          // randomly select any one of them.
          var i = (failures.length > 0) ?
              utils.randomValue(failures) :
              utils.randomValue(successes);

          this.map.useGridWithId(i);
          this.subtype.reset();
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
          this.stepSpeed = 0;
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
          this.testResults = this.subtype.getTestResults(
            this.executionInfo.terminationValue());
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
      console.error("Unexpected exception: " + e + "\n" + e.stack);
      // call window.onerror so that we get new relic collection.  prepend with
      // UserCode so that it's clear this is in eval'ed code.
      if (window.onerror) {
        window.onerror("UserCode:" + e.message, document.URL, 0);
      }
      return;
    }

    // If we know they succeeded, mark levelComplete true
    // Note that we have not yet animated the successful run
    var levelComplete = (this.result === ResultType.SUCCESS);

    // Set testResults unless app-specific results were set in the default
    // branch of the above switch statement.
    if (this.testResults === TestResults.NO_TESTS_RUN) {
      this.testResults = studioApp().getTestResults(levelComplete);
    }

    var program;
    if (this.level.editCode) {
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

    if (studioApp().hasContainedLevels && !this.level.edit_blocks) {
      // Contained levels post progress in a special way, and always pass
      postContainedLevelAttempt(studioApp());
      this.testResults = TestResults.ALL_PASS;
      runAfterPostContainedLevel(this.onReportComplete_);
    } else {
      // Report result to server.
      studioApp().report({
        app: 'maze',
        level: this.level.id,
        result: this.result === ResultType.SUCCESS,
        testResult: this.testResults,
        program: encodeURIComponent(program),
        onComplete: this.onReportComplete_
      });
    }

    // Maze. now contains a transcript of all the user's actions.
    // Reset the maze and animate the transcript.
    studioApp().reset(false);
    this.resetDirtImages_(true);

    // if we have extra top blocks, don't even bother animating
    if (this.testResults === TestResults.EXTRA_TOP_BLOCKS_FAIL) {
      this.result = ResultType.ERROR;
      this.displayFeedback_();
      return;
    }

    this.animating_ = true;

    if (studioApp().isUsingBlockly()) {
      // Disable toolbox while running
      Blockly.mainBlockSpaceEditor.setEnableToolbox(false);

      if (stepMode) {
        if (this.cachedBlockStates.length !== 0) {
          throw new Error('Unexpected cachedBlockStates');
        }
        // Disable all blocks, caching their state first
        Blockly.mainBlockSpace.getAllBlocks().forEach((block) => {
          this.cachedBlockStates.push({
            block: block,
            movable: block.isMovable(),
            deletable: block.isDeletable(),
            editable: block.isEditable()
          });
          block.setMovable(false);
          block.setDeletable(false);
          block.setEditable(false);
        });
      }
    }

    this.animationsController.stopIdling();

    // Speeding up specific levels
    var scaledStepSpeed = this.stepSpeed * this.scale.stepSpeed *
    this.skin.movePegmanAnimationSpeedScale;
    timeoutList.setTimeout(() => {
      this.scheduleAnimations_(stepMode);
    }, scaledStepSpeed);
  }

  /**
   * Animates a single action
   * @param {string} action The action to animate
   * @param {boolean} spotlightBlocks Whether or not we should highlight entire blocks
   * @param {integer} timePerStep How much time we have allocated before the next step
   */
  animateAction_(action, spotlightBlocks, timePerStep) {
    if (action.blockId) {
      studioApp().highlight(String(action.blockId), spotlightBlocks);
    }

    switch (action.command) {
      case 'north':
        this.animatedMove_(tiles.Direction.NORTH, timePerStep);
        break;
      case 'east':
        this.animatedMove_(tiles.Direction.EAST, timePerStep);
        break;
      case 'south':
        this.animatedMove_(tiles.Direction.SOUTH, timePerStep);
        break;
      case 'west':
        this.animatedMove_(tiles.Direction.WEST, timePerStep);
        break;
      case 'look_north':
        this.animatedLook_(tiles.Direction.NORTH);
        break;
      case 'look_east':
        this.animatedLook_(tiles.Direction.EAST);
        break;
      case 'look_south':
        this.animatedLook_(tiles.Direction.SOUTH);
        break;
      case 'look_west':
        this.animatedLook_(tiles.Direction.WEST);
        break;
      case 'fail_forward':
        this.animatedFail_(true);
        break;
      case 'fail_backward':
        this.animatedFail_(false);
        break;
      case 'left':
        this.animatedTurn_(tiles.TurnDirection.LEFT);
        break;
      case 'right':
        this.animatedTurn_(tiles.TurnDirection.RIGHT);
        break;
      case 'finish':
        this.animatedFinish_(timePerStep);
        break;
      case 'putdown':
        this.scheduleFill_();
        break;
      case 'pickup':
        this.scheduleDig_();
        break;
      case 'nectar':
        this.subtype.animateGetNectar();
        break;
      case 'honey':
        this.subtype.animateMakeHoney();
        break;
      case 'get_corn':
        this.subtype.animateGetCorn();
        break;
      case 'get_pumpkin':
        this.subtype.animateGetPumpkin();
        break;
      case 'get_lettuce':
        this.subtype.animateGetLettuce();
        break;
      case 'plant':
        this.subtype.animatePlant();
        break;
      default:
        // action[0] is null if generated by studioApp().checkTimeout().
        break;
    }
  }

  animatedFinish_(timePerStep) {
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
      this.animationsController.scheduleDance(true, timePerStep);
    } else {
      timeoutList.setTimeout(function () {
        studioApp().playAudioOnFailure();
      }, this.stepSpeed);
    }
  }

  animatedMove_(direction, timeForMove) {
    var positionChange = tiles.directionToDxDy(direction);
    var newX = this.pegmanX + positionChange.dx;
    var newY = this.pegmanY + positionChange.dy;
    this.animationsController.scheduleMove(newX, newY, timeForMove);
    studioApp().playAudio('walk');
    this.pegmanX = newX;
    this.pegmanY = newY;
  }

  animatedTurn_(direction) {
    var newDirection = this.pegmanD + direction;
    this.animationsController.scheduleTurn(newDirection);
    this.pegmanD = tiles.constrainDirection4(newDirection);
  }

  animatedFail_(forward) {
    var dxDy = tiles.directionToDxDy(this.pegmanD);
    var deltaX = dxDy.dx;
    var deltaY = dxDy.dy;

    if (!forward) {
      deltaX = -deltaX;
      deltaY = -deltaY;
    }

    var targetX = this.pegmanX + deltaX;
    var targetY = this.pegmanY + deltaY;
    var frame = tiles.directionToFrame(this.pegmanD);
    this.animationsController.displayPegman(
      this.pegmanX + deltaX / 4,
      this.pegmanY + deltaY / 4,
      frame,
    );
    // Play sound and animation for hitting wall or obstacle
    var squareType = this.map.getTile(targetY, targetX);
    if (squareType === tiles.SquareType.WALL || squareType === undefined ||
      (this.subtype.isScrat() && squareType === tiles.SquareType.OBSTACLE)) {
      // Play the sound
      studioApp().playAudio('wall');
      if (squareType !== undefined) {
        // Check which type of wall pegman is hitting
        studioApp().playAudio('wall' + this.subtype.wallMap[targetY][targetX]);
      }

      if (this.subtype.isScrat() && squareType === tiles.SquareType.OBSTACLE) {
        this.animationsController.crackSurroundingIce(targetX, targetY);
      }

      this.animationsController.scheduleWallHit(targetX, targetY, deltaX, deltaY, frame);
      timeoutList.setTimeout(() => {
        studioApp().playAudioOnFailure();
      }, this.stepSpeed * 2);
    } else if (squareType === tiles.SquareType.OBSTACLE) {
      // Play the sound
      studioApp().playAudio('obstacle');
      this.animationsController.scheduleObstacleHit(targetX, targetY, deltaX, deltaY, frame);
      timeoutList.setTimeout(function () {
        studioApp().playAudioOnFailure();
      }, this.stepSpeed);
    }
  }

  /**
   * Display the look icon at Pegman's current location,
   * in the specified direction.
   * @param {!Direction} direction Direction (0 - 3).
   */
  animatedLook_(direction) {
    var x = this.pegmanX;
    var y = this.pegmanY;
    switch (direction) {
      case tiles.Direction.NORTH:
        x += 0.5;
        break;
      case tiles.Direction.EAST:
        x += 1;
        y += 0.5;
        break;
      case tiles.Direction.SOUTH:
        x += 0.5;
        y += 1;
        break;
      case tiles.Direction.WEST:
        y += 0.5;
        break;
    }
    x *= this.SQUARE_SIZE;
    y *= this.SQUARE_SIZE;
    var d = direction * 90 - 45;

    this.animationsController.scheduleLook(x, y, d);
  }

  scheduleDirtChange_(options) {
    var col = this.pegmanX;
    var row = this.pegmanY;

    // cells that started as "flat" will be undefined
    var previousValue = this.map.getValue(row, col) || 0;

    this.map.setValue(row, col, previousValue + options.amount);
    this.subtype.scheduleDirtChange(row, col);
    studioApp().playAudio(options.sound);
  }

  /**
   * Schedule to add dirt at pegman's current position.
   */
  scheduleFill_() {
    this.scheduleDirtChange_({
      amount: 1,
      sound: 'fill'
    });
  }

  /**
   * Schedule to remove dirt at pegman's current location.
   */
  scheduleDig_() {
    this.scheduleDirtChange_({
      amount: -1,
      sound: 'dig'
    });
  }

  /**
   * Certain Maze types - namely, WordSearch, Collector, and any Maze with
   * Quantum maps, don't want to check for success until the user's code
   * has finished running completely.
   */
  shouldCheckSuccessOnMove() {
    if (this.map.hasMultiplePossibleGrids()) {
      return false;
    }
    return this.subtype.shouldCheckSuccessOnMove();
  }

  /**
   * Check whether all goals have been accomplished
   */
  checkSuccess() {
    const succeeded = this.subtype.succeeded();

    if (succeeded) {
      // Finished.  Terminate the user's program.
      this.executionInfo.queueAction('finish', null);
      this.executionInfo.terminateWithValue(true);
    }

    return succeeded;
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

    this.subtype.onExecutionFinish();
  }
};
