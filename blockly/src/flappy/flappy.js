/**
 * Blockly App: Flappy
 *
 * Copyright 2013 Code.org
 *
 */

'use strict';

var BlocklyApps = require('../base');
var commonMsg = require('../../locale/current/common');
var flappyMsg = require('../../locale/current/flappy');
var skins = require('../skins');
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html');
var feedback = require('../feedback.js');
var dom = require('../dom');
var constants = require('./constants');
var utils = require('../utils');

/**
 * Create a namespace for the application.
 */
var Flappy = module.exports;

Flappy.GameStates = {
  WAITING: 0,
  ACTIVE: 1,
  ENDING: 2,
  OVER: 3
};

Flappy.gameState = Flappy.GameStates.WAITING;

Flappy.clickPending = false;

Flappy.avatarVelocity = 0;

var level;
var skin;

Flappy.obstacles = [];

/**
 * Milliseconds between each animation frame.
 */
var stepSpeed;

// whether to show Get Ready and Game Over
var infoText;

//TODO: Make configurable.
BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = true;

var randomObstacleHeight = function () {
  var min = Flappy.MIN_OBSTACLE_HEIGHT;
  var max = Flappy.MAZE_HEIGHT - Flappy.GROUND_HEIGHT - Flappy.MIN_OBSTACLE_HEIGHT - Flappy.GAP_SIZE;
  return Math.floor((Math.random() * (max - min)) + min);
};

//The number of blocks to show as feedback.
BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

// Default Scalings
Flappy.scale = {
  'snapRadius': 1,
  'stepSpeed': 33
};

var twitterOptions = {
  text: flappyMsg.shareFlappyTwitter(),
  hashtag: "FlappyCode"
};

var AVATAR_HEIGHT = constants.AVATAR_HEIGHT;
var AVATAR_WIDTH = constants.AVATAR_WIDTH;
var AVATAR_Y_OFFSET = constants.AVATAR_Y_OFFSET;

var loadLevel = function() {
  // Load maps.
  infoText = (level.infoText === undefined ? true : level.infoText);
  if (!infoText) {
    Flappy.gameState = Flappy.GameStates.ACTIVE;
  }

  // Override scalars.
  for (var key in level.scale) {
    Flappy.scale[key] = level.scale[key];
  }

  // Height and width of the goal and obstacles.
  Flappy.MARKER_HEIGHT = 43;
  Flappy.MARKER_WIDTH = 50;

  Flappy.MAZE_WIDTH = 400;
  Flappy.MAZE_HEIGHT = 400;

  Flappy.GROUND_WIDTH = 400;
  Flappy.GROUND_HEIGHT = 48;

  Flappy.GOAL_SIZE = 55;

  Flappy.OBSTACLE_WIDTH = 52;
  Flappy.OBSTACLE_HEIGHT = 320;
  Flappy.MIN_OBSTACLE_HEIGHT = 48;

  Flappy.setGapHeight(api.GapHeight.NORMAL);

  Flappy.OBSTACLE_SPACING = 250; // number of horizontal pixels between the start of obstacles

  var numObstacles = 2 * Flappy.MAZE_WIDTH / Flappy.OBSTACLE_SPACING;
  if (!level.obstacles) {
    numObstacles = 0;
  }

  var resetObstacle = function (x) {
    this.x = x;
    this.gapStart = randomObstacleHeight();
    this.hitAvatar = false;
  };

  var containsAvatar = function () {
    var flappyRight = Flappy.avatarX + AVATAR_WIDTH;
    var flappyBottom = Flappy.avatarY + AVATAR_HEIGHT;
    var obstacleRight = this.x + Flappy.OBSTACLE_WIDTH;
    var obstacleBottom = this.gapStart + Flappy.GAP_SIZE;
    return (flappyRight > this.x &&
      flappyRight < obstacleRight &&
      Flappy.avatarY > this.gapStart &&
      flappyBottom < obstacleBottom);
  };

  for (var i = 0; i < numObstacles; i++) {
    Flappy.obstacles.push({
      x: Flappy.MAZE_WIDTH * 1.5 + i * Flappy.OBSTACLE_SPACING,
      gapStart: randomObstacleHeight(), // y coordinate of the top of the gap
      hitAvatar: false,
      reset: resetObstacle,
      containsAvatar: containsAvatar
    });
  }
};

var drawMap = function() {
  var svg = document.getElementById('svgFlappy');
  var i, x, y, k, tile;

  // Adjust outer element size.
  svg.setAttribute('width', Flappy.MAZE_WIDTH);
  svg.setAttribute('height', Flappy.MAZE_HEIGHT);

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = Flappy.MAZE_WIDTH + 'px';

  if (skin.background) {
    tile = document.createElementNS(Blockly.SVG_NS, 'image');
    tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                        skin.background);
    tile.setAttribute('id', 'background');
    tile.setAttribute('height', Flappy.MAZE_HEIGHT);
    tile.setAttribute('width', Flappy.MAZE_WIDTH);
    tile.setAttribute('x', 0);
    tile.setAttribute('y', 0);
    svg.appendChild(tile);
  }

  // Add obstacles
  Flappy.obstacles.forEach (function (obstacle, index) {
    var obstacleTopIcon = document.createElementNS(Blockly.SVG_NS, 'image');
    obstacleTopIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                              skin.obstacle_top);
    obstacleTopIcon.setAttribute('id', 'obstacle_top' + index);
    obstacleTopIcon.setAttribute('height', Flappy.OBSTACLE_HEIGHT);
    obstacleTopIcon.setAttribute('width', Flappy.OBSTACLE_WIDTH);
    svg.appendChild(obstacleTopIcon);

    var obstacleBottomIcon = document.createElementNS(Blockly.SVG_NS, 'image');
    obstacleBottomIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                              skin.obstacle_bottom);
    obstacleBottomIcon.setAttribute('id', 'obstacle_bottom' + index);
    obstacleBottomIcon.setAttribute('height', Flappy.OBSTACLE_HEIGHT);
    obstacleBottomIcon.setAttribute('width', Flappy.OBSTACLE_WIDTH);
    svg.appendChild(obstacleBottomIcon);
  });

  if (level.ground) {
    for (i = 0; i < Flappy.MAZE_WIDTH / Flappy.GROUND_WIDTH + 1; i++) {
      var groundIcon = document.createElementNS(Blockly.SVG_NS, 'image');
      groundIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                              skin.ground);
      groundIcon.setAttribute('id', 'ground' + i);
      groundIcon.setAttribute('height', Flappy.GROUND_HEIGHT);
      groundIcon.setAttribute('width', Flappy.GROUND_WIDTH);
      groundIcon.setAttribute('x', 0);
      groundIcon.setAttribute('y', Flappy.MAZE_HEIGHT - Flappy.GROUND_HEIGHT);
      svg.appendChild(groundIcon);
    }
  }

  if (level.goal && level.goal.startX) {
    var goal = document.createElementNS(Blockly.SVG_NS, 'image');
    goal.setAttribute('id', 'goal');
    goal.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                            skin.goal);
    goal.setAttribute('height', Flappy.GOAL_SIZE);
    goal.setAttribute('width', Flappy.GOAL_SIZE);
    goal.setAttribute('x', level.goal.startX);
    goal.setAttribute('y', level.goal.startY);
    svg.appendChild(goal);
  }

  var avatArclip = document.createElementNS(Blockly.SVG_NS, 'clipPath');
  avatArclip.setAttribute('id', 'avatArclipPath');
  var avatArclipRect = document.createElementNS(Blockly.SVG_NS, 'rect');
  avatArclipRect.setAttribute('id', 'avatArclipRect');
  avatArclipRect.setAttribute('width', Flappy.MAZE_WIDTH);
  avatArclipRect.setAttribute('height', Flappy.MAZE_HEIGHT - Flappy.GROUND_HEIGHT);
  avatArclip.appendChild(avatArclipRect);
  svg.appendChild(avatArclip);

  // Add avatar.
  var avatarIcon = document.createElementNS(Blockly.SVG_NS, 'image');
  avatarIcon.setAttribute('id', 'avatar');
  avatarIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                          skin.avatar);
  avatarIcon.setAttribute('height', AVATAR_HEIGHT);
  avatarIcon.setAttribute('width', AVATAR_WIDTH);
  if (level.ground) {
    avatarIcon.setAttribute('clip-path', 'url(#avatArclipPath)');
  }
  svg.appendChild(avatarIcon);

  var instructions = document.createElementNS(Blockly.SVG_NS, 'image');
  instructions.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                              skin.instructions);
  instructions.setAttribute('id', 'instructions');
  instructions.setAttribute('height', 50);
  instructions.setAttribute('width', 159);
  instructions.setAttribute('x', 110);
  instructions.setAttribute('y', 170);
  instructions.setAttribute('visibility', 'hidden');
  svg.appendChild(instructions);

  var getready = document.createElementNS(Blockly.SVG_NS, 'image');
  getready.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                              skin.getready);
  getready.setAttribute('id', 'getready');
  getready.setAttribute('height', 50);
  getready.setAttribute('width', 183);
  getready.setAttribute('x', 108);
  getready.setAttribute('y', 80);
  getready.setAttribute('visibility', 'hidden');
  svg.appendChild(getready);

  var clickrun = document.createElementNS(Blockly.SVG_NS, 'image');
  clickrun.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                              skin.clickrun);
  clickrun.setAttribute('id', 'clickrun');
  clickrun.setAttribute('height', 41);
  clickrun.setAttribute('width', 273);
  clickrun.setAttribute('x', 64);
  clickrun.setAttribute('y', 200);
  clickrun.setAttribute('visibility', 'visibile');
  svg.appendChild(clickrun);

  var gameover = document.createElementNS(Blockly.SVG_NS, 'image');
  gameover.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
                              skin.gameover);
  gameover.setAttribute('id', 'gameover');
  gameover.setAttribute('height', 41);
  gameover.setAttribute('width', 192);
  gameover.setAttribute('x', 104);
  gameover.setAttribute('y', 80);
  gameover.setAttribute('visibility', 'hidden');
  svg.appendChild(gameover);

  var score = document.createElementNS(Blockly.SVG_NS, 'text');
  score.setAttribute('id', 'score');
  score.setAttribute('class', 'flappy-score');
  score.setAttribute('x', Flappy.MAZE_WIDTH / 2);
  score.setAttribute('y', 60);
  score.appendChild(document.createTextNode('0'));
  score.setAttribute('visibility', 'hidden');
  svg.appendChild(score);

  var clickRect = document.createElementNS(Blockly.SVG_NS, 'rect');
  clickRect.setAttribute('width', Flappy.MAZE_WIDTH);
  clickRect.setAttribute('height', Flappy.MAZE_HEIGHT);
  clickRect.setAttribute('fill-opacity', 0);
  clickRect.addEventListener('touchstart', function (e) {
    Flappy.onMouseDown(e);
    e.preventDefault(); // don't want to see mouse down
  });
  clickRect.addEventListener('mousedown', function (e) {
    Flappy.onMouseDown(e);
  });
  svg.appendChild(clickRect);
};

Flappy.calcDistance = function(xDist, yDist) {
  return Math.sqrt(xDist * xDist + yDist * yDist);
};

var essentiallyEqual = function(float1, float2, opt_variance) {
  var variance = opt_variance || 0.01;
  return (Math.abs(float1 - float2) < variance);
};

/**
 * Check to see if avatar is in collision with given obstacle
 * @param obstacle Object : The obstacle object we're checking
 */
var checkForObstacleCollision = function (obstacle) {
  var insideObstacleColumn = Flappy.avatarX + AVATAR_WIDTH >= obstacle.x &&
    Flappy.avatarX <= obstacle.x + Flappy.OBSTACLE_WIDTH;
  if (insideObstacleColumn && (Flappy.avatarY <= obstacle.gapStart ||
    Flappy.avatarY + AVATAR_HEIGHT >= obstacle.gapStart + Flappy.GAP_SIZE)) {
    return true;
  }
  return false;
};

Flappy.activeTicks = function () {
  if (Flappy.firstActiveTick < 0) {
    return 0;
  }

  return (Flappy.tickCount - Flappy.firstActiveTick);
};

Flappy.onTick = function() {
  var avatarWasAboveGround, avatarIsAboveGround;

  if (Flappy.firstActiveTick < 0 && Flappy.gameState === Flappy.GameStates.ACTIVE) {
    Flappy.firstActiveTick = Flappy.tickCount;
  }

  Flappy.tickCount++;

  if (Flappy.tickCount === 1) {
    try { Flappy.whenRunButton(BlocklyApps, api); } catch (e) { }
  }

  // Check for click
  if (Flappy.clickPending && Flappy.gameState <= Flappy.GameStates.ACTIVE) {
    try { Flappy.whenClick(BlocklyApps, api); } catch (e) { }
    Flappy.clickPending = false;
  }

  avatarWasAboveGround = (Flappy.avatarY + AVATAR_HEIGHT) <
    (Flappy.MAZE_HEIGHT - Flappy.GROUND_HEIGHT);

  // Action doesn't start until user's first click
  if (Flappy.gameState === Flappy.GameStates.ACTIVE) {
    // Update avatar's vertical position
    Flappy.avatarVelocity += Flappy.gravity;
    Flappy.avatarY = Flappy.avatarY + Flappy.avatarVelocity;

    // never let the avatar go too far off the top or bottom
    var bottomLimit = level.ground ?
      (Flappy.MAZE_HEIGHT - Flappy.GROUND_HEIGHT - AVATAR_HEIGHT + 1) :
      (Flappy.MAZE_HEIGHT * 1.5);

    Flappy.avatarY = Math.min(Flappy.avatarY, bottomLimit);
    Flappy.avatarY = Math.max(Flappy.avatarY, Flappy.MAZE_HEIGHT * -0.5);

    // Update obstacles
    Flappy.obstacles.forEach(function (obstacle, index) {
      var wasRightOfAvatar = obstacle.x > (Flappy.avatarX + AVATAR_WIDTH);

      obstacle.x -= Flappy.SPEED;

      var isRightOfAvatar = obstacle.x > (Flappy.avatarX + AVATAR_WIDTH);
      if (wasRightOfAvatar && !isRightOfAvatar) {
        if (Flappy.avatarY > obstacle.gapStart &&
          (Flappy.avatarY + AVATAR_HEIGHT < obstacle.gapStart + Flappy.GAP_SIZE)) {
          try { Flappy.whenEnterObstacle(BlocklyApps, api); } catch (e) { }
        }
      }

      if (!obstacle.hitAvatar && checkForObstacleCollision(obstacle)) {
        obstacle.hitAvatar = true;
        try {Flappy.whenCollideObstacle(BlocklyApps, api); } catch (e) { }
      }

      // If obstacle moves off left side, repurpose as a new obstacle to our right
      var numObstacles = Flappy.obstacles.length;
      var previousObstacleIndex = (index - 1 + numObstacles ) % numObstacles;
      if (obstacle.x + Flappy.OBSTACLE_WIDTH < 0) {
        obstacle.reset(Flappy.obstacles[previousObstacleIndex].x + Flappy.OBSTACLE_SPACING);
      }
    });

    // check for ground collision
    avatarIsAboveGround = (Flappy.avatarY + AVATAR_HEIGHT) <
      (Flappy.MAZE_HEIGHT - Flappy.GROUND_HEIGHT);
    if (avatarWasAboveGround && !avatarIsAboveGround) {
      try { Flappy.whenCollideGround(BlocklyApps, api); } catch (e) { }
    }

    // update goal
    if (level.goal && level.goal.moving) {
      Flappy.goalX -= Flappy.SPEED;
      if (Flappy.goalX + Flappy.GOAL_SIZE < 0) {
        // if it disappears off of left, reappear on right
        Flappy.goalX = Flappy.MAZE_WIDTH + Flappy.GOAL_SIZE;
      }
    }
  }

  if (Flappy.gameState === Flappy.GameStates.ENDING) {
    Flappy.avatarY += 10;

    // we use avatar width instead of height bc he is rotating
    // the extra 4 is so that he buries his beak (similar to mobile game)
    var max = Flappy.MAZE_HEIGHT - Flappy.GROUND_HEIGHT - AVATAR_WIDTH + 4;
    if (Flappy.avatarY >= max) {
      Flappy.avatarY = max;
      Flappy.gameState = Flappy.GameStates.OVER;
      Flappy.gameOverTick = Flappy.tickCount;
    }

    document.getElementById('avatar').setAttribute('transform',
      'translate(' + AVATAR_WIDTH + ', 0) ' +
      'rotate(90, ' + Flappy.avatarX + ', ' + Flappy.avatarY + ')');
    if (infoText) {
      document.getElementById('gameover').setAttribute('visibility', 'visibile');
    }
  }

  Flappy.displayAvatar(Flappy.avatarX, Flappy.avatarY);
  Flappy.displayObstacles();
  if (Flappy.gameState <= Flappy.GameStates.ACTIVE) {
    Flappy.displayGround(Flappy.tickCount);
    Flappy.displayGoal();
  }

  if (checkFinished()) {
    Flappy.onPuzzleComplete();
  }
};

Flappy.onMouseDown = function (e) {
  if (Flappy.intervalId) {
    Flappy.clickPending = true;
    if (Flappy.gameState === Flappy.GameStates.WAITING) {
      Flappy.gameState = Flappy.GameStates.ACTIVE;
    } else if (Flappy.gameState === Flappy.GameStates.OVER &&
      Flappy.gameOverTick + 10 < Flappy.tickCount) {
      // do a reset
      var resetButton = document.getElementById('resetButton');
      if (resetButton) {
        resetButton.click();
      }
    }
    document.getElementById('instructions').setAttribute('visibility', 'hidden');
    document.getElementById('getready').setAttribute('visibility', 'hidden');
  } else if (Flappy.gameState === Flappy.GameStates.WAITING) {
    BlocklyApps.runButtonClick();
  }
};
/**
 * Initialize Blockly and the Flappy app.  Called on page load.
 */
Flappy.init = function(config) {
  Flappy.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;

  config.grayOutUndeletableBlocks = level.grayOutUndeletableBlocks;

  loadLevel();

  config.html = page({
    assetUrl: BlocklyApps.assetUrl,
    data: {
      localeDirection: BlocklyApps.localeDirection(),
      visualization: require('./visualization.html')(),
      controls: require('./controls.html')({assetUrl: BlocklyApps.assetUrl, shareable: level.shareable}),
      blockUsed: undefined,
      idealBlockNumber: undefined,
      editCode: level.editCode,
      blockCounterClass: 'block-counter-default'
    }
  });

  config.loadAudio = function() {
    Blockly.loadAudio_(skin.winSound, 'win');
    Blockly.loadAudio_(skin.startSound, 'start');
    Blockly.loadAudio_(skin.failureSound, 'failure');
    Blockly.loadAudio_(skin.obstacleSound, 'obstacle');

    Blockly.loadAudio_(skin.dieSound, 'sfx_die');
    Blockly.loadAudio_(skin.hitSound, 'sfx_hit');
    Blockly.loadAudio_(skin.pointSound, 'sfx_point');
    Blockly.loadAudio_(skin.swooshingSound, 'sfx_swooshing');
    Blockly.loadAudio_(skin.wingSound, 'sfx_wing');
    Blockly.loadAudio_(skin.winGoalSound, 'winGoal');
    Blockly.loadAudio_(skin.jetSound, 'jet');
    Blockly.loadAudio_(skin.jingleSound, 'jingle');
    Blockly.loadAudio_(skin.crashSound, 'crash');
    Blockly.loadAudio_(skin.laserSound, 'laser');
    Blockly.loadAudio_(skin.splashSound, 'splash');
    Blockly.loadAudio_(skin.wallSound, 'wall');
    Blockly.loadAudio_(skin.wall0Sound, 'wall0');
  };

  config.afterInject = function() {
    /**
     * The richness of block colours, regardless of the hue.
     * MOOC blocks should be brighter (target audience is younger).
     * Must be in the range of 0 (inclusive) to 1 (exclusive).
     * Blockly's default is 0.45.
     */
    Blockly.HSV_SATURATION = 0.6;

    Blockly.SNAP_RADIUS *= Flappy.scale.snapRadius;

    drawMap();
  };

  config.trashcan = false;

  config.twitter = twitterOptions;

  // for flappy show make your own button if on share page
  config.makeYourOwn = config.share;

  config.makeString = commonMsg.makeYourOwnFlappy();
  config.makeUrl = "http://code.org/flappy";
  config.makeImage = BlocklyApps.assetUrl('media/flappy_promo.png');

  config.enableShowCode = false;
  config.enableShowBlockCount = false;

  if (level.isK1) {
    // k1 blocks are taller
    constants.WORKSPACE_ROW_HEIGHT *= 1.5;
  }

  // define how our blocks should be arranged
  var col1 = constants.WORKSPACE_BUFFER;
  var col2 = col1 + constants.WORKSPACE_COL_WIDTH;
  var row1 = constants.WORKSPACE_BUFFER;
  var row2 = row1 + constants.WORKSPACE_ROW_HEIGHT;
  var row3 = row2 + constants.WORKSPACE_ROW_HEIGHT;

  config.blockArrangement = {
    'flappy_whenClick': { x: col1, y: row1},
    'when_run': { x: col1, y: row1},
    'flappy_whenCollideGround': { x: col2, y: row1},
    'flappy_whenCollideObstacle': { x: col2, y: row2},
    'flappy_whenEnterObstacle': { x: col2, y: row3}
  };

  // if we dont have collide events, have enter obstacle in top row
  if (level.startBlocks.indexOf('whenCollide') === -1) {
    config.blockArrangement.flappy_whenEnterObstacle = {x: col2, y: row1};
  }

  // when we have when_run and when_click, put when_run in top row
  if (level.startBlocks.indexOf('when_run') !== -1) {
    config.blockArrangement.flappy_whenClick.y = row2;
  }

  BlocklyApps.init(config);

  var rightButton = document.getElementById('rightButton');
  dom.addClickTouchEvent(rightButton, Flappy.onPuzzleComplete);
};

/**
 * Clear the event handlers and stop the onTick timer.
 */
Flappy.clearEventHandlersKillTickLoop = function() {
  Flappy.whenClick = null;
  Flappy.whenCollideGround = null;
  Flappy.whenCollideObstacle = null;
  Flappy.whenEnterObstacle = null;
  Flappy.whenRunButton = null;
  if (Flappy.intervalId) {
    window.clearInterval(Flappy.intervalId);
  }
  Flappy.intervalId = 0;
};

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
BlocklyApps.reset = function(first) {
  var i;
  Flappy.clearEventHandlersKillTickLoop();

  Flappy.gameState = Flappy.GameStates.WAITING;

  // Reset the score.
  Flappy.playerScore = 0;

  Flappy.avatarVelocity = 0;

  // Reset obstacles
  Flappy.obstacles.forEach(function (obstacle, index) {
    obstacle.reset(Flappy.MAZE_WIDTH * 1.5 + index * Flappy.OBSTACLE_SPACING);
  });

  // reset configurable values
  Flappy.SPEED = 0;
  Flappy.FLAP_VELOCITY = -11;
  Flappy.setBackground('flappy');
  Flappy.setObstacle('flappy');
  Flappy.setPlayer('flappy');
  Flappy.setGround('flappy');
  Flappy.setGapHeight(api.GapHeight.NORMAL);
  Flappy.gravity = api.Gravity.NORMAL;

  // Move Avatar into position.
  Flappy.avatarX = 110;
  Flappy.avatarY = 150;

  if (level.goal && level.goal.startX) {
    Flappy.goalX = level.goal.startX;
    Flappy.goalY = level.goal.startY;
  }

  document.getElementById('avatar').setAttribute('transform', '');
  document.getElementById('score').setAttribute('visibility', 'hidden');
  document.getElementById('instructions').setAttribute('visibility', 'hidden');
  document.getElementById('clickrun').setAttribute('visibility', 'visible');
  document.getElementById('getready').setAttribute('visibility', 'hidden');
  document.getElementById('gameover').setAttribute('visibility', 'hidden');

  Flappy.displayAvatar(Flappy.avatarX, Flappy.avatarY);
  Flappy.displayObstacles();
  Flappy.displayGround(0);
  Flappy.displayGoal();

  var svg = document.getElementById('svgFlappy');
};

/**
 * Click the run button.  Start the program.
 */
// XXX This is the only method used by the templates!
BlocklyApps.runButtonClick = function() {
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  document.getElementById('clickrun').setAttribute('visibility', 'hidden');
  document.getElementById('instructions').setAttribute('visibility', 'visible');
  document.getElementById('getready').setAttribute('visibility', 'visible');

  BlocklyApps.toggleRunReset('reset');
  Blockly.mainWorkspace.traceOn(true);
  // BlocklyApps.reset(false);
  BlocklyApps.attempts++;
  Flappy.execute();

  if (level.freePlay) {
    var rightButtonCell = document.getElementById('right-button-cell');
    rightButtonCell.className = 'right-button-cell-enabled';
  }
  if (level.score) {
    document.getElementById('score').setAttribute('visibility', 'visible');
    Flappy.displayScore();
  }
};

/**
 * App specific displayFeedback function that calls into
 * BlocklyApps.displayFeedback when appropriate
 */
var displayFeedback = function() {
  if (!Flappy.waitingForReport) {
    BlocklyApps.displayFeedback({
      app: 'flappy', //XXX
      skin: skin.id,
      feedbackType: Flappy.testResults,
      response: Flappy.response,
      level: level,
      showingSharing: level.freePlay && level.shareable,
      twitter: twitterOptions,
      appStrings: {
        reinfFeedbackMsg: flappyMsg.reinfFeedbackMsg(),
        sharingText: flappyMsg.shareGame()
      }
    });
  }
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
Flappy.onReportComplete = function(response) {
  Flappy.response = response;
  Flappy.waitingForReport = false;
  displayFeedback();
};

/**
 * Execute the user's code.  Heaven help us...
 */
Flappy.execute = function() {
  var code;
  Flappy.result = BlocklyApps.ResultType.UNSET;
  Flappy.testResults = BlocklyApps.TestResults.NO_TESTS_RUN;
  Flappy.waitingForReport = false;
  Flappy.response = null;

  if (level.editCode) {
    code = utils.generateCodeAliases(level.codeFunctions, 'Flappy');
    code += BlocklyApps.editor.getValue();
  }

  var codeClick = Blockly.Generator.workspaceToCode(
                                    'JavaScript',
                                    'flappy_whenClick');
  var whenClickFunc = codegen.functionFromCode(
                                      codeClick, {
                                      BlocklyApps: BlocklyApps,
                                      Flappy: api } );

  var codeCollideGround = Blockly.Generator.workspaceToCode(
                                    'JavaScript',
                                    'flappy_whenCollideGround');
  var whenCollideGroundFunc = codegen.functionFromCode(
                                      codeCollideGround, {
                                      BlocklyApps: BlocklyApps,
                                      Flappy: api } );

  var codeEnterObstacle = Blockly.Generator.workspaceToCode(
                                    'JavaScript',
                                    'flappy_whenEnterObstacle');
  var whenEnterObstacleFunc = codegen.functionFromCode(
                                      codeEnterObstacle, {
                                      BlocklyApps: BlocklyApps,
                                      Flappy: api } );

  var codeCollideObstacle = Blockly.Generator.workspaceToCode(
                                    'JavaScript',
                                    'flappy_whenCollideObstacle');
  var whenCollideObstacleFunc = codegen.functionFromCode(
                                      codeCollideObstacle, {
                                      BlocklyApps: BlocklyApps,
                                      Flappy: api } );

  var codeWhenRunButton = Blockly.Generator.workspaceToCode(
                                    'JavaScript',
                                    'when_run');
  var whenRunButtonFunc = codegen.functionFromCode(
                                      codeWhenRunButton, {
                                      BlocklyApps: BlocklyApps,
                                      Flappy: api } );


  BlocklyApps.playAudio('start');

  // BlocklyApps.reset(false);

  // Set event handlers and start the onTick timer
  Flappy.whenClick = whenClickFunc;
  Flappy.whenCollideGround = whenCollideGroundFunc;
  Flappy.whenEnterObstacle = whenEnterObstacleFunc;
  Flappy.whenCollideObstacle = whenCollideObstacleFunc;
  Flappy.whenRunButton = whenRunButtonFunc;

  Flappy.tickCount = 0;
  Flappy.firstActiveTick = -1;
  Flappy.gameOverTick = 0;
  if (Flappy.intervalId) {
    window.clearInterval(Flappy.intervalId);
  }
  Flappy.intervalId = window.setInterval(Flappy.onTick, Flappy.scale.stepSpeed);
};

Flappy.onPuzzleComplete = function() {
  if (level.freePlay) {
    Flappy.result = BlocklyApps.ResultType.SUCCESS;
  }

  // Stop everything on screen
  Flappy.clearEventHandlersKillTickLoop();

  // If we know they succeeded, mark levelComplete true
  // Note that we have not yet animated the succesful run
  var levelComplete = (Flappy.result == BlocklyApps.ResultType.SUCCESS);

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    Flappy.testResults = BlocklyApps.TestResults.FREE_PLAY;
  } else {
    Flappy.testResults = BlocklyApps.getTestResults(levelComplete);
  }

  // Special case for Flappy level 1 where you have the right blocks, but you
  // don't flap to the goal.  Note: See pivotal item 66362504 for why we
  // check for both TOO_FEW_BLOCKS_FAIL and LEVEL_INCOMPLETE_FAIL here.
  if (level.id === "1" &&
    (Flappy.testResults === BlocklyApps.TestResults.TOO_FEW_BLOCKS_FAIL ||
     Flappy.testResults === BlocklyApps.TestResults.LEVEL_INCOMPLETE_FAIL)) {
    // Feedback message is found in level.other1StarError.
    Flappy.testResults = BlocklyApps.TestResults.APP_SPECIFIC_FAIL;
  }

  if (Flappy.testResults >= BlocklyApps.TestResults.FREE_PLAY) {
    BlocklyApps.playAudio('win');
  } else {
    BlocklyApps.playAudio('failure');
  }

  if (level.editCode) {
    Flappy.testResults = levelComplete ?
      BlocklyApps.TestResults.ALL_PASS :
      BlocklyApps.TestResults.TOO_FEW_BLOCKS_FAIL;
  }

  var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var textBlocks = Blockly.Xml.domToText(xml);

  Flappy.waitingForReport = true;

  // Report result to server.
  BlocklyApps.report({
                     app: 'flappy',
                     level: level.id,
                     result: Flappy.result === BlocklyApps.ResultType.SUCCESS,
                     testResult: Flappy.testResults,
                     program: encodeURIComponent(textBlocks),
                     onComplete: Flappy.onReportComplete
                     });
};

/**
 * Display Avatar at the specified location
 * @param {number} x Horizontal Pixel location.
 * @param {number} y Vertical Pixel location.
 */
Flappy.displayAvatar = function(x, y) {
  var avatarIcon = document.getElementById('avatar');
  avatarIcon.setAttribute('x', x);
  avatarIcon.setAttribute('y', y);
};

/**
 * display moving goal
 */
Flappy.displayGoal = function() {
  if (!Flappy.goalX) {
    return;
  }
  var goal = document.getElementById('goal');
  goal.setAttribute('x', Flappy.goalX);
  goal.setAttribute('y', Flappy.goalY);
};


/**
 * Display ground at given tickCount
 */
Flappy.displayGround = function(tickCount) {
  if (!level.ground) {
    return;
  }
  var offset = tickCount * Flappy.SPEED;
  offset = offset % Flappy.GROUND_WIDTH;
  for (var i = 0; i < Flappy.MAZE_WIDTH / Flappy.GROUND_WIDTH + 1; i++) {
    var ground = document.getElementById('ground' + i);
    ground.setAttribute('x', -offset + i * Flappy.GROUND_WIDTH);
    ground.setAttribute('y', Flappy.MAZE_HEIGHT - Flappy.GROUND_HEIGHT);
  }
};

/**
 * Display all obstacles
 */
Flappy.displayObstacles = function () {
  for (var i = 0; i < Flappy.obstacles.length; i++) {
    var obstacle = Flappy.obstacles[i];
    var topIcon = document.getElementById('obstacle_top' + i);
    topIcon.setAttribute('x', obstacle.x);
    topIcon.setAttribute('y', obstacle.gapStart - Flappy.OBSTACLE_HEIGHT);

    var bottomIcon = document.getElementById('obstacle_bottom' + i);
    bottomIcon.setAttribute('x', obstacle.x);
    bottomIcon.setAttribute('y', obstacle.gapStart + Flappy.GAP_SIZE);
  }
};

Flappy.displayScore = function() {
  var score = document.getElementById('score');
  score.textContent = Flappy.playerScore;
};

Flappy.flap = function (amount) {
  var defaultFlap = level.defaultFlap || "NORMAL";
  Flappy.avatarVelocity = amount || api.FlapHeight[defaultFlap];
};

Flappy.setGapHeight = function (value) {
  var minGapSize = Flappy.MAZE_HEIGHT - Flappy.MIN_OBSTACLE_HEIGHT -
    Flappy.OBSTACLE_HEIGHT;
  if (value < minGapSize) {
    value = minGapSize;
  }
  Flappy.GAP_SIZE = value;
};

var skinTheme = function (value) {
  if (value === 'flappy') {
    return skin;
  }
  return skin[value];
};

Flappy.setBackground = function (value) {
  var element = document.getElementById('background');
  element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
    skinTheme(value).background);
};

Flappy.setPlayer = function (value) {
  var element = document.getElementById('avatar');
  element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
    skinTheme(value).avatar);
};

Flappy.setObstacle = function (value) {
  var element;
  Flappy.obstacles.forEach(function (obstacle, index) {
    element = document.getElementById('obstacle_top' + index);
    element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      skinTheme(value).obstacle_top);

    element = document.getElementById('obstacle_bottom' + index);
    element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      skinTheme(value).obstacle_bottom);
  });
};

Flappy.setGround = function (value) {
  if (!level.ground) {
    return;
  }
  var element, i;
  for (i = 0; i < Flappy.MAZE_WIDTH / Flappy.GROUND_WIDTH + 1; i++) {
    element = document.getElementById('ground' + i);
    element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      skinTheme(value).ground);
  }
};

var checkTickLimit = function() {
  if (!level.tickLimit) {
    return false;
  }

  if ((Flappy.tickCount - Flappy.firstActiveTick) >= level.tickLimit &&
    (Flappy.gameState === Flappy.GameStates.ACTIVE ||
    Flappy.gameState === Flappy.GameStates.OVER)) {
    // We'll ignore tick limit if we're ending so that we fully finish ending
    // sequence
    return true;
  }

  return false;
};

var checkFinished = function () {
  // if we have a succcess condition and have accomplished it, we're done and successful
  if (level.goal && level.goal.successCondition && level.goal.successCondition()) {
    Flappy.result = BlocklyApps.ResultType.SUCCESS;
    return true;
  }

  // if we have a failure condition, and it's been reached, we're done and failed
  if (level.goal && level.goal.failureCondition && level.goal.failureCondition()) {
    Flappy.result = BlocklyApps.ResultType.FAILURE;
    return true;
  }

  return false;
};
