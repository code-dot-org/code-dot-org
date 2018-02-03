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
const SVG_NS = constants.SVG_NS;
const generateCodeAliases = require('../dropletUtils').generateCodeAliases;
const getStore = require('../redux').getStore;
const studioApp = require('../StudioApp').singleton;
const containedLevels = require('../containedLevels');
const getContainedLevelResultInfo = containedLevels.getContainedLevelResultInfo;
const postContainedLevelAttempt = containedLevels.postContainedLevelAttempt;
const runAfterPostContainedLevel = containedLevels.runAfterPostContainedLevel;

const ExecutionInfo = require('./executionInfo');
const MazeMap = require('./mazeMap');
const MazeVisualizationColumn = require('./MazeVisualizationColumn');
const api = require('./api');
const drawMap = require('./drawMap');
const displayPegman = drawMap.displayPegman;
const getPegmanYForRow = drawMap.getPegmanYForRow;
const dropletConfig = require('./dropletConfig');
const mazeReducer = require('./redux');
const getSubtypeForSkin = require('./mazeUtils').getSubtypeForSkin;
const tiles = require('./tiles');

module.exports = class Maze {
  constructor() {
    this.level;
    this.skin;
    this.stepSpeed = 100;

    //TODO: Make configurable.
    studioApp().setCheckForEmptyBlocks(true);

    // Default Scalings
    this.scale = {
      snapRadius: 1,
      stepSpeed: 5
    };
  }

  /**
   * Used by appMain to register reducers
   * TODO elijah should this be a static method?
   */
  getAppReducers() {
    return {
      maze: mazeReducer
    };
  }

  loadLevel() {
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

    this.startDirection = this.level.startDirection;

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

  createAnimations(svg) {
    // Add idle pegman.
    if (this.skin.idlePegmanAnimation) {
      this.createPegmanAnimation(svg, {
        idStr: 'idle',
        pegmanImage: this.skin.idlePegmanAnimation,
        row: this.subtype.start.y,
        col: this.subtype.start.x,
        direction: this.startDirection,
        numColPegman: this.skin.idlePegmanCol,
        numRowPegman: this.skin.idlePegmanRow
      });


      if (this.skin.idlePegmanCol > 1 || this.skin.idlePegmanRow > 1) {
        // our idle is a sprite sheet instead of a gif. schedule cycling through
        // the frames
        var numFrames = this.skin.idlePegmanRow;
        var idlePegmanIcon = document.getElementById('idlePegman');
        var timePerFrame = 600; // timeForAnimation / numFrames;
        var idleAnimationFrame = 0;

        setInterval(() => {
          if (idlePegmanIcon.getAttribute('visibility') === 'visible') {
            this.updatePegmanAnimation({
              idStr: 'idle',
              row: this.subtype.start.y,
              col: this.subtype.start.x,
              direction: this.startDirection,
              animationRow: idleAnimationFrame
            });
            idleAnimationFrame = (idleAnimationFrame + 1) % numFrames;
          }
        }, timePerFrame);
      }
    }

    if (this.skin.celebrateAnimation) {
      this.createPegmanAnimation(svg, {
        idStr: 'celebrate',
        pegmanImage: this.skin.celebrateAnimation,
        row: this.subtype.start.y,
        col: this.subtype.start.x,
        direction: tiles.Direction.NORTH,
        numColPegman: this.skin.celebratePegmanCol,
        numRowPegman: this.skin.celebratePegmanRow
      });
    }

    // Add the hidden dazed pegman when hitting the wall.
    if (this.skin.wallPegmanAnimation) {
      this.createPegmanAnimation(svg, {
        idStr: 'wall',
        pegmanImage: this.skin.wallPegmanAnimation
      });
    }

    // create element for our hitting wall spritesheet
    if (this.skin.hittingWallAnimation && this.skin.hittingWallAnimationFrameNumber) {
      this.createPegmanAnimation(svg, {
        idStr: 'wall',
        pegmanImage: this.skin.hittingWallAnimation,
        numColPegman: this.skin.hittingWallPegmanCol,
        numRowPegman: this.skin.hittingWallPegmanRow
      });
      document.getElementById('wallPegman').setAttribute('visibility', 'hidden');
    }

    // Add the hidden moving pegman animation.
    if (this.skin.movePegmanAnimation) {
      this.createPegmanAnimation(svg, {
        idStr: 'move',
        pegmanImage: this.skin.movePegmanAnimation,
        numColPegman: 4,
        numRowPegman: (this.skin.movePegmanAnimationFrameNumber || 9)
      });
    }

    // Add wall hitting animation
    if (this.skin.hittingWallAnimation) {
      var wallAnimationIcon = document.createElementNS(SVG_NS, 'image');
      wallAnimationIcon.setAttribute('id', 'wallAnimation');
      wallAnimationIcon.setAttribute('height', this.SQUARE_SIZE);
      wallAnimationIcon.setAttribute('width', this.SQUARE_SIZE);
      wallAnimationIcon.setAttribute('visibility', 'hidden');
      svg.appendChild(wallAnimationIcon);
    }
  }

  /**
   * Redraw all dirt images
   * @param {boolean} running Whether or not user program is currently running
   */
  resetDirtImages(running) {
    this.map.forEachCell((cell, row, col) => {
      this.subtype.drawer.updateItemImage(row, col, running);
    });
  }

  /**
   * Initialize Blockly and the maze.  Called on page load.
   */
  init(config) {
    // replace studioApp() methods with our own
    studioApp().runButtonClick = this.runButtonClick.bind(this);
    studioApp().reset = this.reset.bind(this);

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

    this.loadLevel();

    this.cachedBlockStates = [];

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
      this.createAnimations(svg);

      var stepButton = document.getElementById('stepButton');
      dom.addClickTouchEvent(stepButton, this.stepButtonClick.bind(this));

      // base's studioApp().resetButtonClick will be called first
      var resetButton = document.getElementById('resetButton');
      dom.addClickTouchEvent(resetButton, this.resetButtonClick.bind(this));

      var finishButton = document.getElementById('finishButton');
      if (finishButton) {
        finishButton.setAttribute('disabled', 'disabled');
        dom.addClickTouchEvent(finishButton, this.finishButtonClick.bind(this));
      }

      // Listen for hint events that draw a path in the game.
      window.addEventListener('displayHintPath', e => {
        this.drawHintPath(svg, e.detail);
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

  gridNumberToPosition(n) {
    return (n + 0.5) * this.SQUARE_SIZE;
  }

  /**
   * @param svg
   * @param {Array<Array>} coordinates An array of x and y grid coordinates.
   */
  drawHintPath(svg, coordinates) {
    const path = svg.getElementById('hintPath');
    path.setAttribute('d', 'M' + coordinates.map(([x, y]) => {
      return `${this.gridNumberToPosition(x)},${this.gridNumberToPosition(y)}`;
    }).join(' '));
  }

  /**
   * Click the run button.  Start the program.
   */
  // XXX This is the only method used by the templates!
  // TODO confirm that the above XXX comment is accurate
  runButtonClick() {
    var stepButton = document.getElementById('stepButton');
    if (stepButton) {
      stepButton.setAttribute('disabled', '');
    }
    this.execute(false);
  }

  /**
   * Handle a click on the step button.  If we're already animating, we should
   * perform a single step.  Otherwise, we call beginAttempt which will do
   * some initial setup, and then perform the first step.
   */
  stepButtonClick() {
    var stepButton = document.getElementById('stepButton');
    stepButton.setAttribute('disabled', '');

    if (this.animating_) {
      this.scheduleAnimations(true);
    } else {
      this.execute(true);
    }
  }

  /**
   * App specific reset button click logic.  studioApp().resetButtonClick will be
   * called first.
   */
  resetButtonClick() {
    var stepButton = document.getElementById('stepButton');
    stepButton.removeAttribute('disabled');

    this.reenableCachedBlockStates();
  }

  /**
   * Handle a click on the finish button; stop animating if we are, and display
   * whatever feedback we currently have.
   *
   * Currently only used by Collector levels to allow users to continue iterating
   * on a pass-but-not-perfect solution, but still finish whenever they want.
   */
  finishButtonClick() {
    timeoutList.clearTimeouts();
    this.animating_ = false;
    this.displayFeedback(true);
  }

  /**
   * Calculate the Y offset within the sheet
   */
  getPegmanFrameOffsetY(animationRow) {
    animationRow = animationRow || 0;
    return animationRow * this.PEGMAN_HEIGHT;
  }

  /**
   * Create sprite assets for pegman.
   * @param svg
   * @param options Specify different features of the pegman animation.
   * idStr required identifier for the pegman.
   * pegmanImage required which image to use for the animation.
   * col which column the pegman is at.
   * row which row the pegman is at.
   * direction which direction the pegman is facing at.
   * numColPegman number of the pegman in each row, default is 4.
   * numRowPegman number of the pegman in each column, default is 1.
   */
  createPegmanAnimation(svg, options) {
    // Create clip path.
    var clip = document.createElementNS(SVG_NS, 'clipPath');
    clip.setAttribute('id', options.idStr + 'PegmanClip');
    var rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('id', options.idStr + 'PegmanClipRect');
    if (options.col !== undefined) {
      rect.setAttribute('x', options.col * this.SQUARE_SIZE + 1 + this.PEGMAN_X_OFFSET);
    }
    if (options.row !== undefined) {
      rect.setAttribute('y', getPegmanYForRow(this.skin, options.row));
    }
    rect.setAttribute('width', this.PEGMAN_WIDTH);
    rect.setAttribute('height', this.PEGMAN_HEIGHT);
    clip.appendChild(rect);
    svg.appendChild(clip);
    // Create image.
    var imgSrc = options.pegmanImage;
    var img = document.createElementNS(SVG_NS, 'image');
    img.setAttributeNS(
        'http://www.w3.org/1999/xlink', 'xlink:href', imgSrc);
    img.setAttribute('height', this.PEGMAN_HEIGHT * (options.numRowPegman || 1));
    img.setAttribute('width', this.PEGMAN_WIDTH * (options.numColPegman || 4));
    img.setAttribute('clip-path', 'url(#' + options.idStr + 'PegmanClip)');
    img.setAttribute('id', options.idStr + 'Pegman');
    svg.appendChild(img);
    // Update pegman icon & clip path.
    if (options.col !== undefined && options.direction !== undefined) {
      var x = this.SQUARE_SIZE * options.col -
        options.direction * this.PEGMAN_WIDTH + 1 + this.PEGMAN_X_OFFSET;
      img.setAttribute('x', x);
    }
    if (options.row !== undefined) {
      img.setAttribute('y', getPegmanYForRow(this.skin, options.row));
    }
  }

  /**
    * Update sprite assets for pegman.
    * @param options Specify different features of the pegman animation.
    * idStr required identifier for the pegman.
    * col required which column the pegman is at.
    * row required which row the pegman is at.
    * direction required which direction the pegman is facing at.
    * animationRow which row of the sprite sheet the pegman animation needs
    */
  updatePegmanAnimation(options) {
    var rect = document.getElementById(options.idStr + 'PegmanClipRect');
    rect.setAttribute('x', options.col * this.SQUARE_SIZE + 1 + this.PEGMAN_X_OFFSET);
    rect.setAttribute('y', getPegmanYForRow(this.skin, options.row));
    var img = document.getElementById(options.idStr + 'Pegman');
    var x = this.SQUARE_SIZE * options.col -
        options.direction * this.PEGMAN_WIDTH + 1 + this.PEGMAN_X_OFFSET;
    img.setAttribute('x', x);
    var y = getPegmanYForRow(this.skin, options.row) - this.getPegmanFrameOffsetY(options.animationRow);
    img.setAttribute('y', y);
    img.setAttribute('visibility', 'visible');
  }

  /**
   * Reset the maze to the start position and kill any pending animation tasks.
   * @param {boolean} first True if an opening animation is to be played.
   */
  reset(first) {
    this.subtype.reset();

    var i;
    // Kill all tasks.
    timeoutList.clearTimeouts();

    this.animating_ = false;

    // Move Pegman into position.
    this.pegmanX = this.subtype.start.x;
    this.pegmanY = this.subtype.start.y;

    this.pegmanD = this.startDirection;
    if (first) {
      // Dance consists of 5 animations, each of which get 150ms
      var danceTime = 150 * 5;
      if (this.skin.danceOnLoad) {
        this.scheduleDance(false, danceTime);
      }
      timeoutList.setTimeout(() => {
        this.stepSpeed = 100;
        this.scheduleTurn(this.startDirection);
      }, danceTime + 150);
    } else {
      this.displayPegman(this.pegmanX, this.pegmanY, tiles.directionToFrame(this.pegmanD));

      const finishIcon = document.getElementById('finish');
      if (finishIcon) {
        finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', this.skin.goalIdle);
      }
    }

    // Make 'look' icon invisible and promote to top.
    var lookIcon = document.getElementById('look');
    lookIcon.style.display = 'none';
    lookIcon.parentNode.appendChild(lookIcon);
    var paths = lookIcon.getElementsByTagName('path');
    for (i = 0; i < paths.length; i++) {
      var path = paths[i];
      path.setAttribute('stroke', this.skin.look);
    }

    // Reset pegman's visibility.
    var pegmanIcon = document.getElementById('pegman');
    pegmanIcon.setAttribute('opacity', 1);

    if (this.skin.idlePegmanAnimation) {
      pegmanIcon.setAttribute('visibility', 'hidden');
      var idlePegmanIcon = document.getElementById('idlePegman');
      idlePegmanIcon.setAttribute('visibility', 'visible');
    } else {
      pegmanIcon.setAttribute('visibility', 'visible');
    }

    if (this.skin.wallPegmanAnimation) {
      var wallPegmanIcon = document.getElementById('wallPegman');
      wallPegmanIcon.setAttribute('visibility', 'hidden');
    }

    if (this.skin.movePegmanAnimation) {
      var movePegmanIcon = document.getElementById('movePegman');
      movePegmanIcon.setAttribute('visibility', 'hidden');
    }

    if (this.skin.celebrateAnimation) {
      var celebrateAnimation = document.getElementById('celebratePegman');
      celebrateAnimation.setAttribute('visibility', 'hidden');
    }

    // Move the init dirt marker icons into position.
    this.map.resetDirt();
    this.resetDirtImages(false);

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
      this.resetTiles();
    }
  }

  resetTiles() {
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

  reenableCachedBlockStates() {
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
  displayFeedback(finalFeedback = false) {
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
  onReportComplete(response) {
    this.response = response;
    this.waitingForReport = false;
    studioApp().onReportComplete(response);
    this.displayFeedback();
  }

  /**
   * Perform some basic initialization/resetting operations before
   * execution. This function should be idempotent, as it can be called
   * during execution when running multiple trials.
   */
  prepareForExecution() {
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
  execute(stepMode) {
    Maze.beginAttempt();
    this.prepareForExecution();

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
            this.onExecutionFinish();
            if (this.executionInfo.terminationValue() === true) {
              successes.push(i);
            } else {
              failures.push(i);
            }

            // Reset for next trial
            this.subtype.drawer.reset();
            this.prepareForExecution();
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

      this.onExecutionFinish();

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
      runAfterPostContainedLevel(this.onReportComplete);
    } else {
      // Report result to server.
      studioApp().report({
        app: 'maze',
        level: this.level.id,
        result: this.result === ResultType.SUCCESS,
        testResult: this.testResults,
        program: encodeURIComponent(program),
        onComplete: this.onReportComplete
      });
    }

    // Maze. now contains a transcript of all the user's actions.
    // Reset the maze and animate the transcript.
    studioApp().reset(false);
    this.resetDirtImages(true);

    // if we have extra top blocks, don't even bother animating
    if (this.testResults === TestResults.EXTRA_TOP_BLOCKS_FAIL) {
      this.result = ResultType.ERROR;
      this.displayFeedback();
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

    // Removing the idle animation and replace with pegman sprite
    if (this.skin.idlePegmanAnimation) {
      var pegmanIcon = document.getElementById('pegman');
      var idlePegmanIcon = document.getElementById('idlePegman');
      idlePegmanIcon.setAttribute('visibility', 'hidden');
      pegmanIcon.setAttribute('visibility', 'visible');
    }

    // Speeding up specific levels
    var scaledStepSpeed = this.stepSpeed * this.scale.stepSpeed *
    this.skin.movePegmanAnimationSpeedScale;
    timeoutList.setTimeout(() => {
      this.scheduleAnimations(stepMode);
    }, scaledStepSpeed);
  }

  /**
   * Perform our animations, either all of them or those of a single step
   */
  scheduleAnimations(singleStep) {
    var stepButton = document.getElementById('stepButton');

    timeoutList.clearTimeouts();

    var timePerAction = this.stepSpeed * this.scale.stepSpeed *
      this.skin.movePegmanAnimationSpeedScale;
    // get a flat list of actions we want to schedule
    var actions = this.executionInfo.getActions(singleStep);

    scheduleSingleAnimation(0);

    // schedule animations in sequence
    // The reason we do this recursively instead of iteratively is that we want to
    // ensure that we finish scheduling action1 before starting to schedule
    // action2. Otherwise we get into trouble when stepSpeed is 0.
    const scheduleSingleAnimation = (index) => {
      if (index >= actions.length) {
        finishAnimations();
        return;
      }

      this.animateAction(actions[index], singleStep, timePerAction);

      var command = actions[index] && actions[index].command;
      var timeModifier = (this.skin.actionSpeedScale && this.skin.actionSpeedScale[command]) || 1;
      var timeForThisAction = Math.round(timePerAction * timeModifier);

      timeoutList.setTimeout(function () {
        scheduleSingleAnimation(index + 1);
      }, timeForThisAction);
    };

    // Once animations are complete, we want to reenable the step button if we
    // have steps left, otherwise we're done with this execution.
    const finishAnimations = () => {
      var stepsRemaining = this.executionInfo.stepsRemaining();

      // allow time for  additional pause if we're completely done
      var waitTime = (stepsRemaining ? 0 : 1000);

      // run after all animations
      timeoutList.setTimeout(() => {
        if (stepsRemaining) {
          stepButton.removeAttribute('disabled');
        } else {
          this.animating_ = false;
          if (studioApp().isUsingBlockly()) {
            // reenable toolbox
            Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
          }
          // If stepping and we failed, we want to retain highlighting until
          // clicking reset.  Otherwise we can clear highlighting/disabled
          // blocks now
          if (!singleStep || this.result === ResultType.SUCCESS) {
            this.reenableCachedBlockStates();
            studioApp().clearHighlighting();
          }
          this.displayFeedback();
        }
      }, waitTime);
    };
  }

  /**
   * Animates a single action
   * @param {string} action The action to animate
   * @param {boolean} spotlightBlocks Whether or not we should highlight entire blocks
   * @param {integer} timePerStep How much time we have allocated before the next step
   */
  animateAction(action, spotlightBlocks, timePerStep) {
    if (action.blockId) {
      studioApp().highlight(String(action.blockId), spotlightBlocks);
    }

    switch (action.command) {
      case 'north':
        this.animatedMove(tiles.Direction.NORTH, timePerStep);
        break;
      case 'east':
        this.animatedMove(tiles.Direction.EAST, timePerStep);
        break;
      case 'south':
        this.animatedMove(tiles.Direction.SOUTH, timePerStep);
        break;
      case 'west':
        this.animatedMove(tiles.Direction.WEST, timePerStep);
        break;
      case 'look_north':
        this.scheduleLook(tiles.Direction.NORTH);
        break;
      case 'look_east':
        this.scheduleLook(tiles.Direction.EAST);
        break;
      case 'look_south':
        this.scheduleLook(tiles.Direction.SOUTH);
        break;
      case 'look_west':
        this.scheduleLook(tiles.Direction.WEST);
        break;
      case 'fail_forward':
        this.scheduleFail(true);
        break;
      case 'fail_backward':
        this.scheduleFail(false);
        break;
      case 'left':
        var newDirection = this.pegmanD + tiles.TurnDirection.LEFT;
        this.scheduleTurn(newDirection);
        this.pegmanD = tiles.constrainDirection4(newDirection);
        break;
      case 'right':
        newDirection = this.pegmanD + tiles.TurnDirection.RIGHT;
        this.scheduleTurn(newDirection);
        this.pegmanD = tiles.constrainDirection4(newDirection);
        break;
      case 'finish':
        // Only schedule victory animation for certain conditions:
        if (this.testResults >= TestResults.MINIMUM_PASS_RESULT) {
          this.scheduleDance(true, timePerStep);
        } else {
          timeoutList.setTimeout(function () {
            studioApp().playAudioOnFailure();
          }, this.stepSpeed);
        }
        break;
      case 'putdown':
        this.scheduleFill();
        break;
      case 'pickup':
        this.scheduleDig();
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

  animatedMove(direction, timeForMove) {
    var positionChange = tiles.directionToDxDy(direction);
    var newX = this.pegmanX + positionChange.dx;
    var newY = this.pegmanY + positionChange.dy;
    this.scheduleMove(newX, newY, timeForMove);
    this.pegmanX = newX;
    this.pegmanY = newY;
  }

  /**
   * Schedule a movement animating using a spritesheet.
   */
  scheduleSheetedMovement(start, delta, numFrames, timePerFrame, idStr, direction, hidePegman) {
    var pegmanIcon = document.getElementById('pegman');
    utils.range(0, numFrames - 1).forEach((frame) => {
      timeoutList.setTimeout(() => {
        if (hidePegman) {
          pegmanIcon.setAttribute('visibility', 'hidden');
        }
        this.updatePegmanAnimation({
          idStr: idStr,
          col: start.x + delta.x * frame / numFrames,
          row: start.y + delta.y * frame / numFrames,
          direction: direction,
          animationRow: frame
        });
      }, timePerFrame * frame);
    });
  }

  /**
   * Schedule the animations for a move from the current position
   * @param {number} endX X coordinate of the target position
   * @param {number} endY Y coordinate of the target position
   */
  scheduleMove(endX, endY, timeForAnimation) {
    var startX = this.pegmanX;
    var startY = this.pegmanY;
    var direction = this.pegmanD;

    var deltaX = (endX - startX);
    var deltaY = (endY - startY);
    var numFrames;
    var timePerFrame;

    if (this.skin.movePegmanAnimation) {
      numFrames = this.skin.movePegmanAnimationFrameNumber;
      // If move animation of pegman is set, and this is not a turn.
      // Show the animation.
      var pegmanIcon = document.getElementById('pegman');
      var movePegmanIcon = document.getElementById('movePegman');
      timePerFrame = timeForAnimation / numFrames;

      this.scheduleSheetedMovement({
          x: startX,
          y: startY
        }, {
          x: deltaX,
          y: deltaY
        },
        numFrames, timePerFrame, 'move', direction, true);

      // Hide movePegman and set pegman to the end position.
      timeoutList.setTimeout(() => {
        movePegmanIcon.setAttribute('visibility', 'hidden');
        pegmanIcon.setAttribute('visibility', 'visible');
        this.displayPegman(endX, endY, tiles.directionToFrame(direction));
        if (this.subtype.isWordSearch()) {
          this.subtype.markTileVisited(endY, endX, true);
        }
      }, timePerFrame * numFrames);
    } else {
      // we don't have an animation, so just move the x/y pos
      numFrames = 4;
      timePerFrame = timeForAnimation / numFrames;
      utils.range(1, numFrames).forEach((frame) => {
        timeoutList.setTimeout(() => {
          this.displayPegman(
            startX + deltaX * frame / numFrames,
            startY + deltaY * frame / numFrames,
            tiles.directionToFrame(direction));
        }, timePerFrame * frame);
      });
    }

    if (this.skin.approachingGoalAnimation) {
      var finishIcon = document.getElementById('finish');
      // If pegman is close to the goal
      // Replace the goal file with approachingGoalAnimation
      if (this.subtype.finish && Math.abs(endX - this.subtype.finish.x) <= 1 &&
          Math.abs(endY - this.subtype.finish.y) <= 1) {
        finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
          this.skin.approachingGoalAnimation);
      } else {
        finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
          this.skin.goalIdle);
      }
    }

    studioApp().playAudio('walk');
  }

  /**
   * Schedule the animations for a turn from the current direction
   * @param {number} endDirection The direction we're turning to
   */
  scheduleTurn(endDirection) {
    var numFrames = 4;
    var startDirection = this.pegmanD;
    var deltaDirection = endDirection - startDirection;
    utils.range(1, numFrames).forEach((frame) => {
      timeoutList.setTimeout(() => {
        this.displayPegman(
          this.pegmanX,
          this.pegmanY,
          tiles.directionToFrame(startDirection + deltaDirection * frame / numFrames));
      }, this.stepSpeed * (frame - 1));
    });
  }

  /**
   * Replace the tiles surrounding the obstacle with broken tiles.
   */
  updateSurroundingTiles(obstacleY, obstacleX, callback) {
    var tileCoords = [
      [obstacleY - 1, obstacleX - 1],
      [obstacleY - 1, obstacleX],
      [obstacleY - 1, obstacleX + 1],
      [obstacleY, obstacleX - 1],
      [obstacleY, obstacleX],
      [obstacleY, obstacleX + 1],
      [obstacleY + 1, obstacleX - 1],
      [obstacleY + 1, obstacleX],
      [obstacleY + 1, obstacleX + 1]
    ];
    for (let idx = 0; idx < tileCoords.length; ++idx) {
      const row = tileCoords[idx][1];
      const col = tileCoords[idx][0];
      const tileIdx = row + this.map.COLS * col;
      const tileElement = document.getElementById('tileElement' + tileIdx);
      if (tileElement) {
        callback(tileElement, this.map.getCell(col, row));
      }
    }
  }

  /**
   * Schedule the animations and sounds for a failed move.
   * @param {boolean} forward True if forward, false if backward.
   */
  scheduleFail(forward) {
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
    this.displayPegman(this.pegmanX + deltaX / 4,
                      this.pegmanY + deltaY / 4,
                      frame);
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
        // Remove cracked ice, replace surrounding ice with cracked ice.
        this.updateSurroundingTiles(targetY, targetX, (tileElement, cell) => {
          if (cell.getTile() === tiles.SquareType.OPEN) {
            tileElement.setAttributeNS(
              'http://www.w3.org/1999/xlink', 'xlink:href',
              this.skin.largerObstacleAnimationTiles
            );
          } else if (cell.getTile() === tiles.SquareType.OBSTACLE) {
            tileElement.setAttribute('opacity', 0);
          }
        });
      }

      // Play the animation of hitting the wall
      if (this.skin.hittingWallAnimation) {
        var wallAnimationIcon = document.getElementById('wallAnimation');
        var numFrames = this.skin.hittingWallAnimationFrameNumber || 0;

        if (numFrames > 1) {

          // The Scrat "wall" animation has him falling backwards into the water.
          // This looks great when he falls into the water above him, but looks a
          // little off when falling to the side/forward. Tune that by bumping the
          // deltaY by one. Hacky, but looks much better
          if (deltaY >= 0) {
            deltaY += 1;
          }
          // animate our sprite sheet
          var timePerFrame = 100;
          this.scheduleSheetedMovement({
              x: this.pegmanX,
              y: this.pegmanY
            }, {
              x: deltaX,
              y: deltaY
            }, numFrames, timePerFrame, 'wall',
            tiles.Direction.NORTH, true);
          setTimeout(function () {
            document.getElementById('wallPegman').setAttribute('visibility', 'hidden');
          }, numFrames * timePerFrame);
        } else {
          // active our gif
          timeoutList.setTimeout(() => {
            wallAnimationIcon.setAttribute('x',
              this.SQUARE_SIZE * (this.pegmanX + 0.5 + deltaX * 0.5) -
              wallAnimationIcon.getAttribute('width') / 2);
            wallAnimationIcon.setAttribute('y',
              this.SQUARE_SIZE * (this.pegmanY + 1 + deltaY * 0.5) -
              wallAnimationIcon.getAttribute('height'));
            wallAnimationIcon.setAttribute('visibility', 'visible');
            wallAnimationIcon.setAttributeNS(
              'http://www.w3.org/1999/xlink', 'xlink:href',
              this.skin.hittingWallAnimation);
          }, this.stepSpeed / 2);
        }
      }
      timeoutList.setTimeout(() => {
        this.displayPegman(this.pegmanX, this.pegmanY, frame);
      }, this.stepSpeed);
      timeoutList.setTimeout(() => {
        this.displayPegman(this.pegmanX + deltaX / 4, this.pegmanY + deltaY / 4,
          frame);
        studioApp().playAudioOnFailure();
      }, this.stepSpeed * 2);
      timeoutList.setTimeout(() => {
        this.displayPegman(this.pegmanX, this.pegmanY, frame);
      }, this.stepSpeed * 3);

      if (this.skin.wallPegmanAnimation) {
        timeoutList.setTimeout(() => {
          var pegmanIcon = document.getElementById('pegman');
          pegmanIcon.setAttribute('visibility', 'hidden');
          this.updatePegmanAnimation({
            idStr: 'wall',
            row: this.pegmanY,
            col: this.pegmanX,
            direction: this.pegmanD
          });
        }, this.stepSpeed * 4);
      }
    } else if (squareType === tiles.SquareType.OBSTACLE) {
      // Play the sound
      studioApp().playAudio('obstacle');

      // Play the animation
      var obsId = targetX + this.map.COLS * targetY;
      var obsIcon = document.getElementById('obstacle' + obsId);
      obsIcon.setAttributeNS(
          'http://www.w3.org/1999/xlink', 'xlink:href',
          this.skin.obstacleAnimation);
      timeoutList.setTimeout(() => {
        this.displayPegman(this.pegmanX + deltaX / 2,
                          this.pegmanY + deltaY / 2,
                          frame);
      }, this.stepSpeed);

      // Replace the objects around obstacles with broken objects
      if (this.skin.largerObstacleAnimationTiles) {
        timeoutList.setTimeout(() => {
          this.updateSurroundingTiles(targetY, targetX, tileElement => (
            tileElement.setAttributeNS(
              'http://www.w3.org/1999/xlink', 'xlink:href',
              this.skin.largerObstacleAnimationTiles
            )
          ));
        }, this.stepSpeed);
      }

      // Remove pegman
      if (!this.skin.nonDisappearingPegmanHittingObstacle) {
        var pegmanIcon = document.getElementById('pegman');

        timeoutList.setTimeout(function () {
          pegmanIcon.setAttribute('visibility', 'hidden');
        }, this.stepSpeed * 2);
      }
      timeoutList.setTimeout(function () {
        studioApp().playAudioOnFailure();
      }, this.stepSpeed);
    }
  }

  /**
   * Set the tiles to be transparent gradually.
   */
  setTileTransparent() {
    var tileId = 0;
    for (var y = 0; y < this.map.ROWS; y++) {
      for (var x = 0; x < this.map.COLS; x++) {
        // Tile sprite.
        var tileElement = document.getElementById('tileElement' + tileId);
        var tileAnimation = document.getElementById('tileAnimation' + tileId);
        if (tileElement) {
          tileElement.setAttribute('opacity', 0);
        }
        if (tileAnimation && tileAnimation.beginElement) {
          // IE doesn't support beginElement, so check for it.
          tileAnimation.beginElement();
        }
        tileId++;
      }
    }
  }

  /**
   * TODO elijah should this be an instance methods?
   */
  static setPegmanTransparent() {
    var pegmanFadeoutAnimation = document.getElementById('pegmanFadeoutAnimation');
    var pegmanIcon = document.getElementById('pegman');
    if (pegmanIcon) {
      pegmanIcon.setAttribute('opacity', 0);
    }
    if (pegmanFadeoutAnimation && pegmanFadeoutAnimation.beginElement) {
      // IE doesn't support beginElement, so check for it.
      pegmanFadeoutAnimation.beginElement();
    }
  }

  /**
   * Schedule the animations and sound for a dance.
   * @param {boolean} victoryDance This is a victory dance after completing the
   *   puzzle (vs. dancing on load).
   * @param {integer} timeAlloted How much time we have for our animations
   */
  scheduleDance(victoryDance, timeAlloted) {
    if (this.subtype.scheduleDance) {
      this.subtype.scheduleDance(victoryDance, timeAlloted, this.skin);
      return;
    }

    var finishButton = document.getElementById('finishButton');
    if (victoryDance && finishButton) {
      finishButton.removeAttribute('disabled');
    }

    var originalFrame = tiles.directionToFrame(this.pegmanD);
    this.displayPegman(this.pegmanX, this.pegmanY, 16);

    // If victoryDance === true, play the goal animation, else reset it
    var finishIcon = document.getElementById('finish');
    if (victoryDance && finishIcon) {
      studioApp().playAudio('winGoal');
      finishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        this.skin.goalAnimation);
    }

    if (victoryDance) {
      studioApp().playAudioOnWin();
    }

    var danceSpeed = timeAlloted / 5;
    timeoutList.setTimeout(() => {
      this.displayPegman(this.pegmanX, this.pegmanY, 18);
    }, danceSpeed);
    timeoutList.setTimeout(() => {
      this.displayPegman(this.pegmanX, this.pegmanY, 20);
    }, danceSpeed * 2);
    timeoutList.setTimeout(() => {
      this.displayPegman(this.pegmanX, this.pegmanY, 18);
    }, danceSpeed * 3);
    timeoutList.setTimeout(() => {
      this.displayPegman(this.pegmanX, this.pegmanY, 20);
    }, danceSpeed * 4);

    timeoutList.setTimeout(() => {
      if (!victoryDance || this.skin.turnAfterVictory) {
        this.displayPegman(this.pegmanX, this.pegmanY, originalFrame);
      }

      if (victoryDance && this.skin.transparentTileEnding) {
        this.setTileTransparent();
      }

      if (this.subtype.isWordSearch()) {
        Maze.setPegmanTransparent();
      }
    }, danceSpeed * 5);
  }

  /**
   * Display Pegman at the specified location, facing the specified direction.
   * @param {number} x Horizontal grid (or fraction thereof).
   * @param {number} y Vertical grid (or fraction thereof).
   * @param {number} frame Direction (0 - 15) or dance (16 - 17).
   */
  displayPegman(x, y, frame) {
    var pegmanIcon = document.getElementById('pegman');
    var clipRect = document.getElementById('clipRect');
    displayPegman(this.skin, pegmanIcon, clipRect, x, y, frame);
  }

  scheduleDirtChange(options) {
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
  scheduleFill() {
    this.scheduleDirtChange({
      amount: 1,
      sound: 'fill'
    });
  }

  /**
   * Schedule to remove dirt at pegman's current location.
   */
  scheduleDig() {
    this.scheduleDirtChange({
      amount: -1,
      sound: 'dig'
    });
  }

  /**
   * Display the look icon at Pegman's current location,
   * in the specified direction.
   * @param {!Direction} d Direction (0 - 3).
   */
  scheduleLook(d) {
    var x = this.pegmanX;
    var y = this.pegmanY;
    switch (d) {
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
    d = d * 90 - 45;

    var lookIcon = document.getElementById('look');
    lookIcon.setAttribute('transform',
        'translate(' + x + ', ' + y + ') ' +
        'rotate(' + d + ' 0 0) scale(.4)');
    var paths = lookIcon.getElementsByTagName('path');
    lookIcon.style.display = 'inline';
    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];
      this.scheduleLookStep(path, this.stepSpeed * i);
    }
  }

  /**
   * Schedule one of the 'look' icon's waves to appear, then disappear.
   * @param {!Element} path Element to make appear.
   * @param {number} delay Milliseconds to wait before making wave appear.
   */
  scheduleLookStep(path, delay) {
    timeoutList.setTimeout(() => {
      path.style.display = 'inline';
      window.setTimeout(function () {
        path.style.display = 'none';
      }, this.stepSpeed * 2);
    }, delay);
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
  onExecutionFinish() {
    // If we haven't terminated, make one last check for success
    if (!this.executionInfo.isTerminated()) {
      this.checkSuccess();
    }

    this.subtype.onExecutionFinish();
  }
}
