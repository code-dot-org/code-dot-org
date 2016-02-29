require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ubuntu/staging/apps/build/js/bounce/main.js":[function(require,module,exports){
(function (global){
'use strict';

var appMain = require('../appMain');
window.Bounce = require('./bounce');
if (typeof global !== 'undefined') {
  global.Bounce = window.Bounce;
}
var blocks = require('./blocks');
var levels = require('./levels');
var skins = require('./skins');

window.bounceMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Bounce, levels, options);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1aWxkL2pzL2JvdW5jZS9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxNQUFNLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwQyxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtBQUNqQyxRQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7Q0FDL0I7QUFDRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFL0IsTUFBTSxDQUFDLFVBQVUsR0FBRyxVQUFTLE9BQU8sRUFBRTtBQUNwQyxTQUFPLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUM1QixTQUFPLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUM5QixTQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDekMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuQm91bmNlID0gcmVxdWlyZSgnLi9ib3VuY2UnKTtcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICBnbG9iYWwuQm91bmNlID0gd2luZG93LkJvdW5jZTtcbn1cbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuL3NraW5zJyk7XG5cbndpbmRvdy5ib3VuY2VNYWluID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBvcHRpb25zLnNraW5zTW9kdWxlID0gc2tpbnM7XG4gIG9wdGlvbnMuYmxvY2tzTW9kdWxlID0gYmxvY2tzO1xuICBhcHBNYWluKHdpbmRvdy5Cb3VuY2UsIGxldmVscywgb3B0aW9ucyk7XG59O1xuIl19
},{"../appMain":"/home/ubuntu/staging/apps/build/js/appMain.js","./blocks":"/home/ubuntu/staging/apps/build/js/bounce/blocks.js","./bounce":"/home/ubuntu/staging/apps/build/js/bounce/bounce.js","./levels":"/home/ubuntu/staging/apps/build/js/bounce/levels.js","./skins":"/home/ubuntu/staging/apps/build/js/bounce/skins.js"}],"/home/ubuntu/staging/apps/build/js/bounce/skins.js":[function(require,module,exports){
/**
 * Load Skin for Bounce.
 */
// tiles: A 250x200 set of 20 map images.
// goal: A 20x34 goal image.
// background: Number of 400x400 background images. Randomly select one if
// specified, otherwise, use background.png.
// graph: Colour of optional grid lines, or false.

'use strict';

var skinsBase = require('../skins');

var CONFIGS = {

  bounce: {
    nonDisappearingPegmanHittingObstacle: true,
    ballYOffset: 10
  }

};

exports.load = function (assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  var config = CONFIGS[skin.id];

  skin.retro = {
    background: skin.assetUrl('retro_background.png'),
    tiles: skin.assetUrl('retro_tiles_wall.png'),
    goalTiles: skin.assetUrl('retro_tiles_goal.png'),
    paddle: skin.assetUrl('retro_paddle.png'),
    ball: skin.assetUrl('retro_ball.png')
  };

  // Images
  skin.tiles = skin.assetUrl('tiles_wall.png');
  skin.goalTiles = skin.assetUrl('tiles_goal.png');
  skin.goal = skin.assetUrl('goal.png');
  skin.goalSuccess = skin.assetUrl('goal_success.png');
  skin.ball = skin.assetUrl('ball.png');
  skin.paddle = skin.assetUrl('paddle.png');
  skin.obstacle = skin.assetUrl('obstacle.png');
  if (config.nonDisappearingPegmanHittingObstacle) {
    skin.nonDisappearingPegmanHittingObstacle = true;
  } else {
    skin.nonDisappearingPegmanHittingObstacle = false;
  }
  skin.obstacleScale = config.obstacleScale || 1.0;
  skin.largerObstacleAnimationTiles = skin.assetUrl(config.largerObstacleAnimationTiles);
  skin.hittingWallAnimation = skin.assetUrl(config.hittingWallAnimation);
  skin.approachingGoalAnimation = skin.assetUrl(config.approachingGoalAnimation);
  // Sounds
  skin.rubberSound = [skin.assetUrl('wall.mp3'), skin.assetUrl('wall.ogg')];
  skin.flagSound = [skin.assetUrl('win_goal.mp3'), skin.assetUrl('win_goal.ogg')];
  skin.crunchSound = [skin.assetUrl('wall0.mp3'), skin.assetUrl('wall0.ogg')];
  skin.ballStartSound = [skin.assetUrl('ball_start.mp3'), skin.assetUrl('ball_start.ogg')];
  skin.winPointSound = [skin.assetUrl('1_we_win.mp3'), skin.assetUrl('1_we_win.ogg')];
  skin.winPoint2Sound = [skin.assetUrl('2_we_win.mp3'), skin.assetUrl('2_we_win.ogg')];
  skin.losePointSound = [skin.assetUrl('1_we_lose.mp3'), skin.assetUrl('1_we_lose.ogg')];
  skin.losePoint2Sound = [skin.assetUrl('2_we_lose.mp3'), skin.assetUrl('2_we_lose.ogg')];
  skin.goal1Sound = [skin.assetUrl('1_goal.mp3'), skin.assetUrl('1_goal.ogg')];
  skin.goal2Sound = [skin.assetUrl('2_goal.mp3'), skin.assetUrl('2_goal.ogg')];
  skin.woodSound = [skin.assetUrl('1_paddle_bounce.mp3'), skin.assetUrl('1_paddle_bounce.ogg')];
  skin.retroSound = [skin.assetUrl('2_paddle_bounce.mp3'), skin.assetUrl('2_paddle_bounce.ogg')];
  skin.slapSound = [skin.assetUrl('1_wall_bounce.mp3'), skin.assetUrl('1_wall_bounce.ogg')];
  skin.hitSound = [skin.assetUrl('2_wall_bounce.mp3'), skin.assetUrl('2_wall_bounce.ogg')];

  // Settings
  if (config.background !== undefined) {
    var index = Math.floor(Math.random() * config.background);
    skin.background = skin.assetUrl('background' + index + '.png');
  } else {
    skin.background = skin.assetUrl('background.png');
  }
  skin.pegmanHeight = config.pegmanHeight || 52;
  skin.pegmanWidth = config.pegmanWidth || 49;
  skin.ballYOffset = config.ballYOffset || 0;
  skin.paddleYOffset = config.paddleYOffset || 0;
  return skin;
};

},{"../skins":"/home/ubuntu/staging/apps/build/js/skins.js"}],"/home/ubuntu/staging/apps/build/js/bounce/levels.js":[function(require,module,exports){
/*jshint multistr: true */

'use strict';

var Direction = require('./tiles').Direction;
var tb = require('../block_utils').createToolbox;

/*
 * Configuration for all levels.
 */
module.exports = {

  '1': {
    'requiredBlocks': [[{ 'test': 'moveLeft', 'type': 'bounce_moveLeft' }]],
    'scale': {
      'snapRadius': 2
    },
    'softButtons': ['leftButton'],
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [8, 0, 0, 16, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
    'toolbox': tb('<block type="bounce_moveLeft"></block> \
          <block type="bounce_moveRight"></block>'),
    'startBlocks': '<block type="bounce_whenLeft" deletable="false" x="20" y="20"></block>'
  },
  '2': {
    'ideal': 5,
    'requiredBlocks': [[{ 'test': 'moveRight', 'type': 'bounce_moveRight' }], [{ 'test': 'moveLeft', 'type': 'bounce_moveLeft' }]],
    'scale': {
      'snapRadius': 2
    },
    'softButtons': ['leftButton', 'rightButton'],
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [8, 0, 0, 16, 0, 0, 0, 8], [0, 0, 0, 0, 0, 0, 0, 0]],
    'toolbox': tb('<block type="bounce_moveLeft"></block> \
          <block type="bounce_moveRight"></block>'),
    'startBlocks': '<block type="bounce_whenLeft" deletable="false" x="20" y="20"></block> \
      <block type="bounce_whenRight" deletable="false" x="180" y="20"></block>'
  },
  '3': {
    'requiredBlocks': [[{ 'test': 'moveUp', 'type': 'bounce_moveUp' }]],
    'scale': {
      'snapRadius': 2
    },
    'softButtons': ['upButton'],
    'map': [[0, 0, 0, 8, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 16, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]],
    'toolbox': tb('<block type="bounce_moveLeft"></block> \
          <block type="bounce_moveRight"></block> \
          <block type="bounce_moveUp"></block> \
          <block type="bounce_moveDown"></block>'),
    'startBlocks': '<block type="bounce_whenUp" deletable="false" x="20" y="20"></block>'
  },
  '4': {
    'requiredBlocks': [[{ 'test': 'moveRight', 'type': 'bounce_moveRight' }], [{ 'test': 'moveLeft', 'type': 'bounce_moveLeft' }], [{ 'test': 'moveUp', 'type': 'bounce_moveUp' }], [{ 'test': 'moveDown', 'type': 'bounce_moveDown' }]],
    'scale': {
      'snapRadius': 2
    },
    'softButtons': ['leftButton', 'rightButton', 'downButton', 'upButton'],
    'map': [[0, 0, 8, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 8], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [8, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 16, 0, 0, 0, 0], [0, 0, 0, 0, 0, 8, 0, 0]],
    'toolbox': tb('<block type="bounce_moveLeft"></block> \
          <block type="bounce_moveRight"></block> \
          <block type="bounce_moveUp"></block> \
          <block type="bounce_moveDown"></block>'),
    'startBlocks': '<block type="bounce_whenLeft" deletable="false" x="20" y="20"></block> \
      <block type="bounce_whenRight" deletable="false" x="180" y="20"></block> \
      <block type="bounce_whenUp" deletable="false" x="20" y="120"></block> \
      <block type="bounce_whenDown" deletable="false" x="180" y="120"></block>'
  },
  '5': {
    'timeoutFailureTick': 100,
    'requiredBlocks': [[{ 'test': 'bounceBall', 'type': 'bounce_bounceBall' }]],
    'scale': {
      'snapRadius': 2
    },
    'ballDirection': 1.285 * Math.PI,
    'map': [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [32, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 4, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 16, 0, 0, 0, 0]],
    'toolbox': tb('<block type="bounce_bounceBall"></block> \
          <block type="bounce_playSound"></block>'),
    'startBlocks': '<block type="bounce_whenPaddleCollided" deletable="false" x="20" y="20"></block>'
  },
  '6': {
    'timeoutFailureTick': 140,
    'requiredBlocks': [[{ 'test': 'bounceBall', 'type': 'bounce_bounceBall' }]],
    'scale': {
      'snapRadius': 2
    },
    'ballDirection': 1.285 * Math.PI,
    'map': [[1, 1, 33, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 4, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 16, 0, 0, 0, 1]],
    'toolbox': tb('<block type="bounce_bounceBall"></block> \
          <block type="bounce_playSound"></block>'),
    'startBlocks': '<block type="bounce_whenPaddleCollided" deletable="false" x="20" y="20"></block> \
      <block type="bounce_whenWallCollided" deletable="false" x="20" y="120"></block>'
  },
  '7': {
    'timeoutFailureTick': 900,
    'requiredBlocks': [[{ 'test': 'moveLeft', 'type': 'bounce_moveLeft' }], [{ 'test': 'moveRight', 'type': 'bounce_moveRight' }], [{ 'test': 'bounceBall', 'type': 'bounce_bounceBall' }]],
    'scale': {
      'snapRadius': 2
    },
    'softButtons': ['leftButton', 'rightButton'],
    'failOnBallExit': true,
    'map': [[1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 32, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 4, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 16, 0, 0, 0, 0, 1]],
    'toolbox': tb('<block type="bounce_moveLeft"></block> \
          <block type="bounce_moveRight"></block> \
          <block type="bounce_bounceBall"></block> \
          <block type="bounce_playSound"></block>'),
    'startBlocks': '<block type="bounce_whenLeft" deletable="false" x="20" y="20"></block> \
      <block type="bounce_whenRight" deletable="false" x="180" y="20"></block> \
      <block type="bounce_whenPaddleCollided" deletable="false" x="20" y="120"></block> \
      <block type="bounce_whenWallCollided" deletable="false" x="20" y="220"></block>'
  },
  /*
    '8': {
      'requiredBlocks': [
        [{'test': 'moveRight', 'type': 'bounce_moveRight'}]
      ],
      'scale': {
        'snapRadius': 2
      },
      'softButtons': [
        'leftButton',
        'rightButton'
      ],
      'map': [
        [1, 1, 1, 1, 5, 1, 1, 1],
        [1, 0, 4, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 4, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 4, 1],
        [1, 4, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0,16, 0, 0, 0, 0, 1]
      ],
      'toolbox':
        tb('<block type="bounce_moveLeft"></block> \
            <block type="bounce_moveRight"></block> \
            <block type="bounce_bounceBall"></block> \
            <block type="bounce_playSound"></block>'),
      'startBlocks':
       '<block type="bounce_whenLeft" deletable="false" x="20" y="20"></block> \
        <block type="bounce_whenRight" deletable="false" x="180" y="20"></block> \
        <block type="bounce_whenPaddleCollided" deletable="false" x="20" y="120"></block> \
        <block type="bounce_whenWallCollided" deletable="false" x="20" y="220"></block>'
    },
    '9': {
      'requiredBlocks': [
        [{'test': 'moveRight', 'type': 'bounce_moveRight'}]
      ],
      'scale': {
        'snapRadius': 2
      },
      'softButtons': [
        'leftButton',
        'rightButton'
      ],
      'map': [
        [1, 5, 1, 5, 1, 5, 1, 5],
        [5, 0, 4, 0, 4, 0, 4, 1],
        [1, 4, 0, 4, 0, 4, 0, 5],
        [5, 0, 4, 0, 4, 0, 4, 1],
        [1, 4, 0, 4, 0, 4, 0, 5],
        [5, 0, 4, 0, 4, 0, 4, 1],
        [1, 4, 0, 4, 0, 4, 0, 5],
        [1, 0,16, 0, 0, 0, 0, 1]
      ],
      'toolbox':
        tb('<block type="bounce_moveLeft"></block> \
            <block type="bounce_moveRight"></block> \
            <block type="bounce_bounceBall"></block> \
            <block type="bounce_playSound"></block>'),
      'startBlocks':
       '<block type="bounce_whenLeft" deletable="false" x="20" y="20"></block> \
        <block type="bounce_whenRight" deletable="false" x="180" y="20"></block> \
        <block type="bounce_whenPaddleCollided" deletable="false" x="20" y="120"></block> \
        <block type="bounce_whenWallCollided" deletable="false" x="20" y="220"></block>'
    },
  */
  '10': {
    'requiredBlocks': [[{ 'test': 'moveLeft', 'type': 'bounce_moveLeft' }], [{ 'test': 'moveRight', 'type': 'bounce_moveRight' }], [{ 'test': 'bounceBall', 'type': 'bounce_bounceBall' }], [{ 'test': 'incrementPlayerScore', 'type': 'bounce_incrementPlayerScore' }], [{ 'test': 'incrementOpponentScore', 'type': 'bounce_incrementOpponentScore' }]],
    'scale': {
      'snapRadius': 2
    },
    'softButtons': ['leftButton', 'rightButton'],
    'goal': {
      successCondition: function successCondition() {
        return Bounce.opponentScore >= 2;
      }
    },
    'respawnBalls': true,
    'map': [[1, 1, 2, 2, 2, 2, 1, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 4, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 16, 0, 0, 0, 0, 1]],
    'toolbox': tb('<block type="bounce_moveLeft"></block> \
          <block type="bounce_moveRight"></block> \
          <block type="bounce_bounceBall"></block> \
          <block type="bounce_playSound"></block> \
          <block type="bounce_incrementPlayerScore"></block> \
          <block type="bounce_incrementOpponentScore"></block>'),
    'startBlocks': '<block type="bounce_whenLeft" deletable="false" x="20" y="20"></block> \
      <block type="bounce_whenRight" deletable="false" x="180" y="20"></block> \
      <block type="bounce_whenPaddleCollided" deletable="false" x="20" y="100"></block> \
      <block type="bounce_whenWallCollided" deletable="false" x="20" y="180"></block> \
      <block type="bounce_whenBallInGoal" deletable="false" x="20" y="260"></block> \
      <block type="bounce_whenBallMissesPaddle" deletable="false" x="20" y="340"></block>'
  },
  '11': {
    'requiredBlocks': [[{ 'test': 'moveLeft', 'type': 'bounce_moveLeft' }], [{ 'test': 'moveRight', 'type': 'bounce_moveRight' }], [{ 'test': 'bounceBall', 'type': 'bounce_bounceBall' }], [{ 'test': 'incrementPlayerScore', 'type': 'bounce_incrementPlayerScore' }], [{ 'test': 'incrementOpponentScore', 'type': 'bounce_incrementOpponentScore' }], [{ 'test': 'launchBall', 'type': 'bounce_launchBall' }]],
    'scale': {
      'snapRadius': 2
    },
    'softButtons': ['leftButton', 'rightButton'],
    'minWorkspaceHeight': 750,
    'goal': {
      successCondition: function successCondition() {
        return Bounce.opponentScore >= 2;
      }
    },
    'map': [[1, 1, 2, 2, 2, 2, 1, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 16, 0, 0, 0, 0, 1]],
    'toolbox': tb('<block type="bounce_moveLeft"></block> \
          <block type="bounce_moveRight"></block> \
          <block type="bounce_bounceBall"></block> \
          <block type="bounce_playSound"></block> \
          <block type="bounce_incrementPlayerScore"></block> \
          <block type="bounce_incrementOpponentScore"></block> \
          <block type="bounce_launchBall"></block> \
          <block type="bounce_setPaddleSpeed"></block> \
          <block type="bounce_setBallSpeed"></block> \
          <block type="bounce_setBackground"></block> \
          <block type="bounce_setBall"></block> \
          <block type="bounce_setPaddle"></block>'),
    'startBlocks': '<block type="when_run" deletable="false" x="20" y="20"></block> \
      <block type="bounce_whenLeft" deletable="false" x="20" y="180"></block> \
      <block type="bounce_whenRight" deletable="false" x="180" y="180"></block> \
      <block type="bounce_whenPaddleCollided" deletable="false" x="20" y="270"></block> \
      <block type="bounce_whenWallCollided" deletable="false" x="20" y="370"></block> \
      <block type="bounce_whenBallInGoal" deletable="false" x="20" y="470"></block> \
      <block type="bounce_whenBallMissesPaddle" deletable="false" x="20" y="590"></block>'
  },
  '12': {
    'requiredBlocks': [],
    'scale': {
      'snapRadius': 2
    },
    'softButtons': ['leftButton', 'rightButton'],
    'minWorkspaceHeight': 800,
    'freePlay': true,
    'map': [[1, 1, 2, 2, 2, 2, 1, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 16, 0, 0, 0, 0, 1]],
    'toolbox': tb('<block type="bounce_moveLeft"></block> \
          <block type="bounce_moveRight"></block> \
          <block type="bounce_bounceBall"></block> \
          <block type="bounce_playSound"></block> \
          <block type="bounce_incrementPlayerScore"></block> \
          <block type="bounce_incrementOpponentScore"></block> \
          <block type="bounce_launchBall"></block> \
          <block type="bounce_setPaddleSpeed"></block> \
          <block type="bounce_setBallSpeed"></block> \
          <block type="bounce_setBackground"></block> \
          <block type="bounce_setBall"></block> \
          <block type="bounce_setPaddle"></block>'),
    'startBlocks': '<block type="when_run" deletable="false" x="20" y="20"></block> \
      <block type="bounce_whenLeft" deletable="false" x="20" y="220"></block> \
      <block type="bounce_whenRight" deletable="false" x="180" y="220"></block> \
      <block type="bounce_whenPaddleCollided" deletable="false" x="20" y="310"></block> \
      <block type="bounce_whenWallCollided" deletable="false" x="20" y="410"></block> \
      <block type="bounce_whenBallInGoal" deletable="false" x="20" y="510"></block> \
      <block type="bounce_whenBallMissesPaddle" deletable="false" x="20" y="630"></block>'
  }
};

},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","./tiles":"/home/ubuntu/staging/apps/build/js/bounce/tiles.js"}],"/home/ubuntu/staging/apps/build/js/bounce/bounce.js":[function(require,module,exports){
/**
 * Blockly App: Bounce
 *
 * Copyright 2013 Code.org
 *
 */

'use strict';

var studioApp = require('../StudioApp').singleton;
var commonMsg = require('../locale');
var bounceMsg = require('./locale');
var skins = require('../skins');
var tiles = require('./tiles');
var codegen = require('../codegen');
var api = require('./api');
var AppView = require('../templates/AppView.jsx');
var page = require('../templates/page.html.ejs');
var dom = require('../dom');
var Hammer = require('../hammer');
var utils = require('../utils');
var dropletUtils = require('../dropletUtils');
var constants = require('../constants');
var KeyCodes = constants.KeyCodes;

var Direction = tiles.Direction;
var SquareType = tiles.SquareType;

var ResultType = studioApp.ResultType;
var TestResults = studioApp.TestResults;

/**
 * Create a namespace for the application.
 */
var Bounce = module.exports;

Bounce.keyState = {};
Bounce.gesturesObserved = {};
Bounce.btnState = {};

var ButtonState = {
  UP: 0,
  DOWN: 1
};

Bounce.BallFlags = {
  MISSED_PADDLE: 1,
  IN_GOAL: 2,
  LAUNCHING: 4
};

var ArrowIds = {
  LEFT: 'leftButton',
  UP: 'upButton',
  RIGHT: 'rightButton',
  DOWN: 'downButton'
};

var DRAG_DISTANCE_TO_MOVE_RATIO = 25;

var level;
var skin;

/**
 * Milliseconds between each animation frame.
 */
var stepSpeed;

//TODO: Make configurable.
studioApp.setCheckForEmptyBlocks(true);

var getTile = function getTile(map, x, y) {
  if (map && map[y]) {
    return map[y][x];
  }
};

// Default Scalings
Bounce.scale = {
  'snapRadius': 1,
  'stepSpeed': 33
};

var twitterOptions = {
  text: bounceMsg.shareBounceTwitter(),
  hashtag: "BounceCode"
};

var loadLevel = function loadLevel() {
  // Load maps.
  Bounce.map = level.map;
  Bounce.timeoutFailureTick = level.timeoutFailureTick || Infinity;
  Bounce.minWorkspaceHeight = level.minWorkspaceHeight;
  Bounce.softButtons_ = level.softButtons || [];
  Bounce.respawnBalls = level.respawnBalls || false;
  Bounce.failOnBallExit = level.failOnBallExit || false;

  // Override scalars.
  for (var key in level.scale) {
    Bounce.scale[key] = level.scale[key];
  }

  // Measure maze dimensions and set sizes.
  // ROWS: Number of tiles down.
  Bounce.ROWS = Bounce.map.length;
  // COLS: Number of tiles across.
  Bounce.COLS = Bounce.map[0].length;
  // Initialize the wallMap.
  initWallMap();
  // Pixel height and width of each maze square (i.e. tile).
  Bounce.SQUARE_SIZE = 50;
  Bounce.PEGMAN_HEIGHT = skin.pegmanHeight;
  Bounce.PEGMAN_WIDTH = skin.pegmanWidth;
  Bounce.BALL_Y_OFFSET = skin.ballYOffset;
  Bounce.PADDLE_Y_OFFSET = skin.paddleYOffset;
  // Height and width of the goal and obstacles.
  Bounce.MARKER_HEIGHT = 43;
  Bounce.MARKER_WIDTH = 50;

  Bounce.MAZE_WIDTH = Bounce.SQUARE_SIZE * Bounce.COLS;
  Bounce.MAZE_HEIGHT = Bounce.SQUARE_SIZE * Bounce.ROWS;
  Bounce.PATH_WIDTH = Bounce.SQUARE_SIZE / 3;
};

var initWallMap = function initWallMap() {
  Bounce.wallMap = new Array(Bounce.ROWS);
  for (var y = 0; y < Bounce.ROWS; y++) {
    Bounce.wallMap[y] = new Array(Bounce.COLS);
  }
};

/**
 * PIDs of async tasks currently executing.
 */
var timeoutList = require('../timeoutList');

// Map each possible shape to a sprite.
// Input: Binary string representing Centre/North/East/South/West squares.
// Output: [x, y] coordinates of each tile's sprite in tiles.png.
var WALL_TILE_SHAPES = {
  '1X101': [1, 0], // Horiz top
  '11X10': [2, 1], // Vert right
  '11XX0': [2, 1], // Bottom right corner
  '1XX11': [2, 0], // Top right corner
  '1X001': [1, 0], // Top horiz right end
  '1X100': [1, 0], // Top horiz left end
  '1101X': [0, 1], // Vert left
  '110XX': [0, 1], // Bottom left corner
  '1X11X': [0, 0], // Top left corner
  'null0': [1, 1] // Empty
};

var GOAL_TILE_SHAPES = {
  '1X101': [2, 3], // Horiz top
  '1XX11': [3, 3], // Top right corner
  '1X001': [3, 3], // Top horiz right end
  '1X11X': [0, 2], // Top left corner
  '1X100': [0, 2], // Top horiz left end
  'null0': [1, 1] // Empty
};

// Return a value of '0' if the specified square is not a wall, '1' for
// a wall, 'X' for out of bounds
var wallNormalize = function wallNormalize(x, y) {
  return Bounce.map[y] === undefined || Bounce.map[y][x] === undefined ? 'X' : Bounce.map[y][x] & SquareType.WALL ? '1' : '0';
};

// Return a value of '0' if the specified square is not a wall, '1' for
// a wall, 'X' for out of bounds
var goalNormalize = function goalNormalize(x, y) {
  return Bounce.map[y] === undefined || Bounce.map[y][x] === undefined ? 'X' : Bounce.map[y][x] & SquareType.GOAL ? '1' : '0';
};

// Create ball elements
Bounce.createBallElements = function (i) {
  var svg = document.getElementById('svgBounce');
  // Ball's clipPath element, whose (x, y) is reset by Bounce.displayBall
  var ballClip = document.createElementNS(Blockly.SVG_NS, 'clipPath');
  ballClip.setAttribute('id', 'ballClipPath' + i);
  var ballClipRect = document.createElementNS(Blockly.SVG_NS, 'rect');
  ballClipRect.setAttribute('id', 'ballClipRect' + i);
  ballClipRect.setAttribute('width', Bounce.PEGMAN_WIDTH);
  ballClipRect.setAttribute('height', Bounce.PEGMAN_HEIGHT);
  ballClip.appendChild(ballClipRect);
  svg.appendChild(ballClip);

  // Add ball.
  var ballIcon = document.createElementNS(Blockly.SVG_NS, 'image');
  ballIcon.setAttribute('id', 'ball' + i);
  ballIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', Bounce.ballImage);
  ballIcon.setAttribute('height', Bounce.PEGMAN_HEIGHT);
  ballIcon.setAttribute('width', Bounce.PEGMAN_WIDTH);
  ballIcon.setAttribute('clip-path', 'url(#ballClipPath' + i + ')');
  svg.appendChild(ballIcon);
};

// Delete ball elements
Bounce.deleteBallElements = function (i) {
  var ballClipPath = document.getElementById('ballClipPath' + i);
  ballClipPath.parentNode.removeChild(ballClipPath);

  var ballIcon = document.getElementById('ball' + i);
  ballIcon.parentNode.removeChild(ballIcon);
};

var drawMap = function drawMap() {
  var svg = document.getElementById('svgBounce');
  var i, x, y, k, tile;

  // Adjust outer element size.
  svg.setAttribute('width', Bounce.MAZE_WIDTH);
  svg.setAttribute('height', Bounce.MAZE_HEIGHT);

  // Attach drag handler.
  var hammerSvg = new Hammer(svg);
  hammerSvg.on("drag", Bounce.onSvgDrag);

  // Adjust visualizationColumn width.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.width = Bounce.MAZE_WIDTH + 'px';

  if (skin.background) {
    tile = document.createElementNS(Blockly.SVG_NS, 'image');
    tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.background);
    tile.setAttribute('id', 'background');
    tile.setAttribute('height', Bounce.MAZE_HEIGHT);
    tile.setAttribute('width', Bounce.MAZE_WIDTH);
    tile.setAttribute('x', 0);
    tile.setAttribute('y', 0);
    svg.appendChild(tile);
  }

  // Draw the tiles making up the maze map.

  // Compute and draw the tile for each square.
  var tileId = 0;
  for (y = 0; y < Bounce.ROWS; y++) {
    for (x = 0; x < Bounce.COLS; x++) {
      var left;
      var top;
      var image;
      // Compute the tile index.
      tile = wallNormalize(x, y) + wallNormalize(x, y - 1) + // North.
      wallNormalize(x + 1, y) + // East.
      wallNormalize(x, y + 1) + // South.
      wallNormalize(x - 1, y); // West.

      // Draw the tile.
      if (WALL_TILE_SHAPES[tile]) {
        left = WALL_TILE_SHAPES[tile][0];
        top = WALL_TILE_SHAPES[tile][1];
        image = skin.tiles;
      } else {
        // Compute the tile index.
        tile = goalNormalize(x, y) + goalNormalize(x, y - 1) + // North.
        goalNormalize(x + 1, y) + // East.
        goalNormalize(x, y + 1) + // South.
        goalNormalize(x - 1, y); // West.

        if (!GOAL_TILE_SHAPES[tile]) {
          // Empty square.  Use null0.
          tile = 'null0';
        }
        left = GOAL_TILE_SHAPES[tile][0];
        top = GOAL_TILE_SHAPES[tile][1];
        image = skin.goalTiles;
      }
      if (tile != 'null0') {
        // Tile's clipPath element.
        var tileClip = document.createElementNS(Blockly.SVG_NS, 'clipPath');
        tileClip.setAttribute('id', 'tileClipPath' + tileId);
        var tileClipRect = document.createElementNS(Blockly.SVG_NS, 'rect');
        tileClipRect.setAttribute('width', Bounce.SQUARE_SIZE);
        tileClipRect.setAttribute('height', Bounce.SQUARE_SIZE);

        tileClipRect.setAttribute('x', x * Bounce.SQUARE_SIZE);
        tileClipRect.setAttribute('y', y * Bounce.SQUARE_SIZE);

        tileClip.appendChild(tileClipRect);
        svg.appendChild(tileClip);
        // Tile sprite.
        var tileElement = document.createElementNS(Blockly.SVG_NS, 'image');
        tileElement.setAttribute('id', 'tileElement' + tileId);
        tileElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', image);
        tileElement.setAttribute('height', Bounce.SQUARE_SIZE * 4);
        tileElement.setAttribute('width', Bounce.SQUARE_SIZE * 5);
        tileElement.setAttribute('clip-path', 'url(#tileClipPath' + tileId + ')');
        tileElement.setAttribute('x', (x - left) * Bounce.SQUARE_SIZE);
        tileElement.setAttribute('y', (y - top) * Bounce.SQUARE_SIZE);
        svg.appendChild(tileElement);
        // Tile animation
        var tileAnimation = document.createElementNS(Blockly.SVG_NS, 'animate');
        tileAnimation.setAttribute('id', 'tileAnimation' + tileId);
        tileAnimation.setAttribute('attributeType', 'CSS');
        tileAnimation.setAttribute('attributeName', 'opacity');
        tileAnimation.setAttribute('from', 1);
        tileAnimation.setAttribute('to', 0);
        tileAnimation.setAttribute('dur', '1s');
        tileAnimation.setAttribute('begin', 'indefinite');
        tileElement.appendChild(tileAnimation);
      }

      tileId++;
    }
  }

  Bounce.ballImage = skin.ball;
  for (i = 0; i < Bounce.ballCount; i++) {
    Bounce.createBallElements(i);
  }

  if (Bounce.paddleStart_) {
    // Paddle's clipPath element, whose (x, y) is reset by Bounce.displayPaddle
    var paddleClip = document.createElementNS(Blockly.SVG_NS, 'clipPath');
    paddleClip.setAttribute('id', 'paddleClipPath');
    var paddleClipRect = document.createElementNS(Blockly.SVG_NS, 'rect');
    paddleClipRect.setAttribute('id', 'paddleClipRect');
    paddleClipRect.setAttribute('width', Bounce.PEGMAN_WIDTH);
    paddleClipRect.setAttribute('height', Bounce.PEGMAN_HEIGHT);
    paddleClip.appendChild(paddleClipRect);
    svg.appendChild(paddleClip);

    // Add paddle.
    var paddleIcon = document.createElementNS(Blockly.SVG_NS, 'image');
    paddleIcon.setAttribute('id', 'paddle');
    paddleIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.paddle);
    paddleIcon.setAttribute('height', Bounce.PEGMAN_HEIGHT);
    paddleIcon.setAttribute('width', Bounce.PEGMAN_WIDTH);
    paddleIcon.setAttribute('clip-path', 'url(#paddleClipPath)');
    svg.appendChild(paddleIcon);
  }

  if (Bounce.paddleFinish_) {
    for (i = 0; i < Bounce.paddleFinishCount; i++) {
      // Add finish markers.
      var paddleFinishMarker = document.createElementNS(Blockly.SVG_NS, 'image');
      paddleFinishMarker.setAttribute('id', 'paddlefinish' + i);
      paddleFinishMarker.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.goal);
      paddleFinishMarker.setAttribute('height', Bounce.MARKER_HEIGHT);
      paddleFinishMarker.setAttribute('width', Bounce.MARKER_WIDTH);
      svg.appendChild(paddleFinishMarker);
    }
  }

  if (Bounce.ballFinish_) {
    // Add ball finish marker.
    var ballFinishMarker = document.createElementNS(Blockly.SVG_NS, 'image');
    ballFinishMarker.setAttribute('id', 'ballfinish');
    ballFinishMarker.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.goal);
    ballFinishMarker.setAttribute('height', Bounce.MARKER_HEIGHT);
    ballFinishMarker.setAttribute('width', Bounce.MARKER_WIDTH);
    svg.appendChild(ballFinishMarker);
  }

  var score = document.createElementNS(Blockly.SVG_NS, 'text');
  score.setAttribute('id', 'score');
  score.setAttribute('class', 'bounce-score');
  score.setAttribute('x', Bounce.MAZE_WIDTH / 2);
  score.setAttribute('y', 60);
  score.appendChild(document.createTextNode('0'));
  score.setAttribute('visibility', 'hidden');
  svg.appendChild(score);

  // Add wall hitting animation
  if (skin.hittingWallAnimation) {
    var wallAnimationIcon = document.createElementNS(Blockly.SVG_NS, 'image');
    wallAnimationIcon.setAttribute('id', 'wallAnimation');
    wallAnimationIcon.setAttribute('height', Bounce.SQUARE_SIZE);
    wallAnimationIcon.setAttribute('width', Bounce.SQUARE_SIZE);
    wallAnimationIcon.setAttribute('visibility', 'hidden');
    svg.appendChild(wallAnimationIcon);
  }

  // Add obstacles.
  var obsId = 0;
  for (y = 0; y < Bounce.ROWS; y++) {
    for (x = 0; x < Bounce.COLS; x++) {
      if (Bounce.map[y][x] == SquareType.OBSTACLE) {
        var obsIcon = document.createElementNS(Blockly.SVG_NS, 'image');
        obsIcon.setAttribute('id', 'obstacle' + obsId);
        obsIcon.setAttribute('height', Bounce.MARKER_HEIGHT * skin.obstacleScale);
        obsIcon.setAttribute('width', Bounce.MARKER_WIDTH * skin.obstacleScale);
        obsIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.obstacle);
        obsIcon.setAttribute('x', Bounce.SQUARE_SIZE * (x + 0.5) - obsIcon.getAttribute('width') / 2);
        obsIcon.setAttribute('y', Bounce.SQUARE_SIZE * (y + 0.9) - obsIcon.getAttribute('height'));
        svg.appendChild(obsIcon);
      }
      ++obsId;
    }
  }
};

Bounce.calcDistance = function (xDist, yDist) {
  return Math.sqrt(xDist * xDist + yDist * yDist);
};

var essentiallyEqual = function essentiallyEqual(float1, float2, opt_variance) {
  var variance = opt_variance || 0.01;
  return Math.abs(float1 - float2) < variance;
};

Bounce.isBallOutOfBounds = function (i) {
  if (Bounce.ballX[i] < 0) {
    return true;
  }
  if (Bounce.ballX[i] > Bounce.COLS - 1) {
    return true;
  }
  if (Bounce.ballY[i] < tiles.Y_TOP_BOUNDARY) {
    return true;
  }
  if (Bounce.ballY[i] > Bounce.ROWS - 1) {
    return true;
  }
  return false;
};

/**
 * @param scope Object :  The scope in which to execute the delegated function.
 * @param func Function : The function to execute
 * @param data Object or Array : The data to pass to the function. If the function is also passed arguments, the data is appended to the arguments list. If the data is an Array, each item is appended as a new argument.
 */
var delegate = function delegate(scope, func, data) {
  return function () {
    var args = Array.prototype.slice.apply(arguments).concat(data);
    func.apply(scope, args);
  };
};

/**
 * We want to swallow exceptions when executing user generated code. This provides
 * a single place to do so.
 */
Bounce.callUserGeneratedCode = function (fn) {
  try {
    fn.call(Bounce, studioApp, api);
  } catch (e) {
    // swallow error. should we also log this somewhere?
    if (console) {
      console.log(e);
    }
  }
};

Bounce.onTick = function () {
  Bounce.tickCount++;

  if (Bounce.tickCount === 1) {
    Bounce.callUserGeneratedCode(Bounce.whenGameStarts);
  }

  // Run key event handlers for any keys that are down:
  for (var key in KeyCodes) {
    if (Bounce.keyState[KeyCodes[key]] && Bounce.keyState[KeyCodes[key]] == "keydown") {
      switch (KeyCodes[key]) {
        case KeyCodes.LEFT:
          Bounce.callUserGeneratedCode(Bounce.whenLeft);
          break;
        case KeyCodes.UP:
          Bounce.callUserGeneratedCode(Bounce.whenUp);
          break;
        case KeyCodes.RIGHT:
          Bounce.callUserGeneratedCode(Bounce.whenRight);
          break;
        case KeyCodes.DOWN:
          Bounce.callUserGeneratedCode(Bounce.whenDown);
          break;
      }
    }
  }

  for (var btn in ArrowIds) {
    if (Bounce.btnState[ArrowIds[btn]] && Bounce.btnState[ArrowIds[btn]] == ButtonState.DOWN) {
      switch (ArrowIds[btn]) {
        case ArrowIds.LEFT:
          Bounce.callUserGeneratedCode(Bounce.whenLeft);
          break;
        case ArrowIds.UP:
          Bounce.callUserGeneratedCode(Bounce.whenUp);
          break;
        case ArrowIds.RIGHT:
          Bounce.callUserGeneratedCode(Bounce.whenRight);
          break;
        case ArrowIds.DOWN:
          Bounce.callUserGeneratedCode(Bounce.whenDown);
          break;
      }
    }
  }

  for (var gesture in Bounce.gesturesObserved) {
    switch (gesture) {
      case 'left':
        Bounce.callUserGeneratedCode(Bounce.whenLeft);
        break;
      case 'up':
        Bounce.callUserGeneratedCode(Bounce.whenUp);
        break;
      case 'right':
        Bounce.callUserGeneratedCode(Bounce.whenRight);
        break;
      case 'down':
        Bounce.callUserGeneratedCode(Bounce.whenDown);
        break;
    }
    if (0 === Bounce.gesturesObserved[gesture]--) {
      delete Bounce.gesturesObserved[gesture];
    }
  }

  for (var i = 0; i < Bounce.ballCount; i++) {
    var deltaX = Bounce.ballSpeed[i] * Math.sin(Bounce.ballDir[i]);
    var deltaY = -Bounce.ballSpeed[i] * Math.cos(Bounce.ballDir[i]);

    var wasXOK = Bounce.ballX[i] >= 0 && Bounce.ballX[i] <= Bounce.COLS - 1;
    var wasYOK = Bounce.ballY[i] >= tiles.Y_TOP_BOUNDARY;
    var wasYAboveBottom = Bounce.ballY[i] <= Bounce.ROWS - 1;

    Bounce.ballX[i] += deltaX;
    Bounce.ballY[i] += deltaY;

    if (0 === (Bounce.ballFlags[i] & (Bounce.BallFlags.MISSED_PADDLE | Bounce.BallFlags.IN_GOAL))) {
      var nowXOK = Bounce.ballX[i] >= 0 && Bounce.ballX[i] <= Bounce.COLS - 1;
      var nowYOK = Bounce.ballY[i] >= tiles.Y_TOP_BOUNDARY;
      var nowYAboveBottom = Bounce.ballY[i] <= Bounce.ROWS - 1;

      if (wasYOK && wasXOK && !nowXOK) {
        //console.log("calling whenWallCollided for ball " + i +
        //" x=" + Bounce.ballX[i] + " y=" + Bounce.ballY[i]);
        Bounce.callUserGeneratedCode(Bounce.whenWallCollided);
      }

      if (wasXOK && wasYOK && !nowYOK) {
        if (Bounce.map[0][Math.round(Bounce.ballX[i])] & SquareType.GOAL) {
          //console.log("calling whenBallInGoal for ball " + i +
          //" x=" + Bounce.ballX[i] + " y=" + Bounce.ballY[i]);
          Bounce.callUserGeneratedCode(Bounce.whenBallInGoal);
          Bounce.ballFlags[i] |= Bounce.BallFlags.IN_GOAL;
          timeoutList.setTimeout(delegate(this, Bounce.moveBallOffscreen, i), 1000);
          if (Bounce.respawnBalls) {
            Bounce.launchBall(i);
          }
        } else {
          //console.log("calling whenWallCollided for ball " + i +
          //" x=" + Bounce.ballX[i] + " y=" + Bounce.ballY[i]);
          Bounce.callUserGeneratedCode(Bounce.whenWallCollided);
        }
      }

      var xPaddleBall = Bounce.ballX[i] - Bounce.paddleX;
      var yPaddleBall = Bounce.ballY[i] - Bounce.paddleY;
      var distPaddleBall = Bounce.calcDistance(xPaddleBall, yPaddleBall);

      if (distPaddleBall < tiles.PADDLE_BALL_COLLIDE_DISTANCE) {
        // paddle ball collision
        //console.log("calling whenPaddleCollided for ball " + i +
        //" x=" + Bounce.ballX[i] + " y=" + Bounce.ballY[i]);
        Bounce.callUserGeneratedCode(Bounce.whenPaddleCollided);
      } else if (wasYAboveBottom && !nowYAboveBottom) {
        // ball missed paddle
        //console.log("calling whenBallMissesPaddle for ball " + i +
        //" x=" + Bounce.ballX[i] + " y=" + Bounce.ballY[i]);
        Bounce.callUserGeneratedCode(Bounce.whenBallMissesPaddle);
        Bounce.ballFlags[i] |= Bounce.BallFlags.MISSED_PADDLE;
        timeoutList.setTimeout(delegate(this, Bounce.moveBallOffscreen, i), 1000);
        if (Bounce.respawnBalls) {
          Bounce.launchBall(i);
        } else if (Bounce.failOnBallExit) {
          Bounce.result = ResultType.FAILURE;
          Bounce.onPuzzleComplete();
        }
      }
    }

    Bounce.displayBall(i, Bounce.ballX[i], Bounce.ballY[i]);
  }

  Bounce.displayPaddle(Bounce.paddleX, Bounce.paddleY);

  if (checkFinished()) {
    Bounce.onPuzzleComplete();
  }
};

Bounce.onSvgDrag = function (e) {
  if (Bounce.intervalId) {
    Bounce.gesturesObserved[e.gesture.direction] = Math.round(e.gesture.distance / DRAG_DISTANCE_TO_MOVE_RATIO);
    e.gesture.preventDefault();
  }
};

Bounce.onKey = function (e) {
  // Store the most recent event type per-key
  Bounce.keyState[e.keyCode] = e.type;

  // If we are actively running our tick loop, suppress default event handling
  if (Bounce.intervalId && e.keyCode >= KeyCodes.LEFT && e.keyCode <= KeyCodes.DOWN) {
    e.preventDefault();
  }
};

Bounce.onArrowButtonDown = function (e, idBtn) {
  // Store the most recent event type per-button
  Bounce.btnState[idBtn] = ButtonState.DOWN;
  e.preventDefault(); // Stop normal events so we see mouseup later.
};

Bounce.onArrowButtonUp = function (e, idBtn) {
  // Store the most recent event type per-button
  Bounce.btnState[idBtn] = ButtonState.UP;
};

Bounce.onMouseUp = function (e) {
  // Reset btnState on mouse up
  Bounce.btnState = {};
};

/**
 * Initialize Blockly and the Bounce app.  Called on page load.
 */
Bounce.init = function (config) {
  // replace studioApp methods with our own
  studioApp.reset = this.reset.bind(this);
  studioApp.runButtonClick = this.runButtonClick.bind(this);

  Bounce.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;
  loadLevel();

  window.addEventListener("keydown", Bounce.onKey, false);
  window.addEventListener("keyup", Bounce.onKey, false);

  config.loadAudio = function () {
    studioApp.loadAudio(skin.winSound, 'win');
    studioApp.loadAudio(skin.startSound, 'start');
    studioApp.loadAudio(skin.ballStartSound, 'ballstart');
    studioApp.loadAudio(skin.failureSound, 'failure');
    studioApp.loadAudio(skin.rubberSound, 'rubber');
    studioApp.loadAudio(skin.crunchSound, 'crunch');
    studioApp.loadAudio(skin.flagSound, 'flag');
    studioApp.loadAudio(skin.winPointSound, 'winpoint');
    studioApp.loadAudio(skin.winPoint2Sound, 'winpoint2');
    studioApp.loadAudio(skin.losePointSound, 'losepoint');
    studioApp.loadAudio(skin.losePoint2Sound, 'losepoint2');
    studioApp.loadAudio(skin.goal1Sound, 'goal1');
    studioApp.loadAudio(skin.goal2Sound, 'goal2');
    studioApp.loadAudio(skin.woodSound, 'wood');
    studioApp.loadAudio(skin.retroSound, 'retro');
    studioApp.loadAudio(skin.slapSound, 'slap');
    studioApp.loadAudio(skin.hitSound, 'hit');
  };

  config.afterInject = function () {
    // Connect up arrow button event handlers
    for (var btn in ArrowIds) {
      dom.addMouseUpTouchEvent(document.getElementById(ArrowIds[btn]), delegate(this, Bounce.onArrowButtonUp, ArrowIds[btn]));
      dom.addMouseDownTouchEvent(document.getElementById(ArrowIds[btn]), delegate(this, Bounce.onArrowButtonDown, ArrowIds[btn]));
    }
    document.addEventListener('mouseup', Bounce.onMouseUp, false);

    /**
     * The richness of block colours, regardless of the hue.
     * MOOC blocks should be brighter (target audience is younger).
     * Must be in the range of 0 (inclusive) to 1 (exclusive).
     * Blockly's default is 0.45.
     */
    Blockly.HSV_SATURATION = 0.6;

    Blockly.SNAP_RADIUS *= Bounce.scale.snapRadius;

    Bounce.ballStart_ = [];
    Bounce.ballX = [];
    Bounce.ballY = [];
    Bounce.ballDir = [];
    Bounce.ballSpeed = [];
    Bounce.ballFlags = [];
    Bounce.ballCount = 0;
    Bounce.originalBallCount = 0;
    Bounce.paddleFinishCount = 0;
    Bounce.defaultBallSpeed = level.ballSpeed || tiles.DEFAULT_BALL_SPEED;
    Bounce.defaultBallDir = level.ballDirection || tiles.DEFAULT_BALL_DIRECTION;

    // Locate the start and finish squares.
    for (var y = 0; y < Bounce.ROWS; y++) {
      for (var x = 0; x < Bounce.COLS; x++) {
        if (Bounce.map[y][x] & SquareType.PADDLEFINISH) {
          if (0 === Bounce.paddleFinishCount) {
            Bounce.paddleFinish_ = [];
          }
          Bounce.paddleFinish_[Bounce.paddleFinishCount] = { x: x, y: y };
          Bounce.paddleFinishCount++;
        } else if (Bounce.map[y][x] & SquareType.BALLSTART) {
          Bounce.ballStart_[Bounce.ballCount] = { x: x, y: y };
          Bounce.ballCount++;
        } else if (Bounce.map[y][x] & SquareType.PADDLESTART) {
          Bounce.paddleStart_ = { x: x, y: y };
        } else if (Bounce.map[y][x] & SquareType.BALLFINISH) {
          Bounce.ballFinish_ = { x: x, y: y };
        } else if (Bounce.map[y][x] & SquareType.GOAL) {
          Bounce.goalLocated_ = true;
        }
      }
    }

    Bounce.originalBallCount = Bounce.ballCount;

    drawMap();
  };

  // Block placement default (used as fallback in the share levels)
  config.blockArrangement = {
    'when_run': { x: 20, y: 20 },
    'bounce_whenLeft': { x: 20, y: 220 },
    'bounce_whenRight': { x: 180, y: 220 },
    'bounce_whenPaddleCollided': { x: 20, y: 310 },
    'bounce_whenWallCollided': { x: 20, y: 410 },
    'bounce_whenBallInGoal': { x: 20, y: 510 },
    'bounce_whenBallMissesPaddle': { x: 20, y: 630 }
  };

  config.twitter = twitterOptions;

  // for this app, show make your own button if on share page
  config.makeYourOwn = config.share;

  config.makeString = bounceMsg.makeYourOwn();
  config.makeUrl = "http://code.org/bounce";
  config.makeImage = studioApp.assetUrl('media/promo.png');

  config.enableShowCode = false;
  config.enableShowBlockCount = false;

  React.render(React.createElement(AppView, {
    renderCodeApp: function renderCodeApp() {
      return page({
        assetUrl: studioApp.assetUrl,
        data: {
          localeDirection: studioApp.localeDirection(),
          visualization: require('./visualization.html.ejs')(),
          controls: require('./controls.html.ejs')({ assetUrl: studioApp.assetUrl }),
          blockUsed: undefined,
          idealBlockNumber: undefined,
          editCode: level.editCode,
          blockCounterClass: 'block-counter-default',
          readonlyWorkspace: config.readonlyWorkspace
        }
      });
    },
    onMount: function onMount() {
      studioApp.init(config);

      var finishButton = document.getElementById('finishButton');
      dom.addClickTouchEvent(finishButton, Bounce.onPuzzleComplete);
    }
  }), document.getElementById(config.containerId));
};

/**
 * Clear the event handlers and stop the onTick timer.
 */
Bounce.clearEventHandlersKillTickLoop = function () {
  Bounce.whenWallCollided = null;
  Bounce.whenBallInGoal = null;
  Bounce.whenBallMissesPaddle = null;
  Bounce.whenPaddleCollided = null;
  Bounce.whenDown = null;
  Bounce.whenLeft = null;
  Bounce.whenRight = null;
  Bounce.whenUp = null;
  Bounce.whenGameStarts = null;
  if (Bounce.intervalId) {
    window.clearInterval(Bounce.intervalId);
  }
  Bounce.intervalId = 0;
  // Kill all tasks.
  timeoutList.clearTimeouts();
};

/**
 * Move ball to a safe place off of the screen.
 * @param {int} i Index of ball to be moved.
 */
Bounce.moveBallOffscreen = function (i) {
  Bounce.ballX[i] = 100;
  Bounce.ballY[i] = 100;
  Bounce.ballDir[i] = 0;
  // stop the ball from moving if we're not planning to respawn:
  Bounce.ballSpeed[i] = 0;
};

/**
 * Play a start sound and reset the ball at index i and redraw it.
 * @param {int} i Index of ball to be reset.
 */
Bounce.playSoundAndResetBall = function (i) {
  //console.log("playSoundAndResetBall called for ball " + i);
  Bounce.resetBall(i, { randomPosition: true });
  studioApp.playAudio('ballstart');
};

/**
 * Launch the ball from index i from a start position and launch it.
 * @param {int} i Index of ball to be launched.
 */
Bounce.launchBall = function (i) {
  Bounce.ballFlags[i] |= Bounce.BallFlags.LAUNCHING;
  timeoutList.setTimeout(delegate(this, Bounce.playSoundAndResetBall, i), 3000);
};

/**
 * Reset the ball from index i to the start position and redraw it.
 * @param {int} i Index of ball to be reset.
 * @param {options} randomPosition: random start
 */
Bounce.resetBall = function (i, options) {
  //console.log("resetBall called for ball " + i);
  var randStart = options.randomPosition || typeof Bounce.ballStart_[i] == 'undefined';
  Bounce.ballX[i] = randStart ? Math.floor(Math.random() * Bounce.COLS) : Bounce.ballStart_[i].x;
  Bounce.ballY[i] = randStart ? tiles.DEFAULT_BALL_START_Y : Bounce.ballStart_[i].y;
  Bounce.ballDir[i] = randStart ? Math.random() * Math.PI / 2 + Math.PI * 0.75 : Bounce.defaultBallDir;
  Bounce.ballSpeed[i] = Bounce.currentBallSpeed;
  Bounce.ballFlags[i] = 0;

  Bounce.displayBall(i, Bounce.ballX[i], Bounce.ballY[i]);
};

/**
 * Reset the app to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Bounce.reset = function (first) {
  var i;
  Bounce.clearEventHandlersKillTickLoop();

  // Soft buttons
  var softButtonCount = 0;
  for (i = 0; i < Bounce.softButtons_.length; i++) {
    document.getElementById(Bounce.softButtons_[i]).style.display = 'inline';
    softButtonCount++;
  }
  if (softButtonCount) {
    var softButtonsCell = document.getElementById('soft-buttons');
    softButtonsCell.className = 'soft-buttons-' + softButtonCount;
  }

  Bounce.gesturesObserved = {};

  // Reset the score.
  Bounce.playerScore = 0;
  Bounce.opponentScore = 0;
  document.getElementById('score').setAttribute('visibility', 'hidden');

  // Reset configurable variables
  Bounce.setBackground('hardcourt');
  Bounce.setBall('hardcourt');
  Bounce.setPaddle('hardcourt');
  Bounce.currentBallSpeed = Bounce.defaultBallSpeed;

  // Remove any extra balls that were created dynamically.
  for (i = Bounce.originalBallCount; i < Bounce.ballCount; i++) {
    Bounce.deleteBallElements(i);
  }
  // Reset ballCount back to the original value
  Bounce.ballCount = Bounce.originalBallCount;
  // Move ball(s) into position.
  for (i = 0; i < Bounce.ballCount; i++) {
    Bounce.resetBall(i, {});
  }

  // Move Paddle into position.
  Bounce.paddleX = Bounce.paddleStart_.x;
  Bounce.paddleY = Bounce.paddleStart_.y;
  Bounce.paddleSpeed = tiles.DEFAULT_PADDLE_SPEED;

  Bounce.displayPaddle(Bounce.paddleX, Bounce.paddleY);

  var svg = document.getElementById('svgBounce');

  if (Bounce.paddleFinish_) {
    for (i = 0; i < Bounce.paddleFinishCount; i++) {
      // Mark each finish as incomplete.
      Bounce.paddleFinish_[i].finished = false;

      // Move the finish icons into position.
      var paddleFinishIcon = document.getElementById('paddlefinish' + i);
      paddleFinishIcon.setAttribute('x', Bounce.SQUARE_SIZE * (Bounce.paddleFinish_[i].x + 0.5) - paddleFinishIcon.getAttribute('width') / 2);
      paddleFinishIcon.setAttribute('y', Bounce.SQUARE_SIZE * (Bounce.paddleFinish_[i].y + 0.9) - paddleFinishIcon.getAttribute('height'));
      paddleFinishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.goal);
    }
  }

  if (Bounce.ballFinish_) {
    // Move the finish icon into position.
    var ballFinishIcon = document.getElementById('ballfinish');
    ballFinishIcon.setAttribute('x', Bounce.SQUARE_SIZE * (Bounce.ballFinish_.x + 0.5) - ballFinishIcon.getAttribute('width') / 2);
    ballFinishIcon.setAttribute('y', Bounce.SQUARE_SIZE * (Bounce.ballFinish_.y + 0.9) - ballFinishIcon.getAttribute('height'));
    ballFinishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.goal);
  }

  // Reset the obstacle image.
  var obsId = 0;
  var x, y;
  for (y = 0; y < Bounce.ROWS; y++) {
    for (x = 0; x < Bounce.COLS; x++) {
      var obsIcon = document.getElementById('obstacle' + obsId);
      if (obsIcon) {
        obsIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.obstacle);
      }
      ++obsId;
    }
  }

  // Reset the tiles
  var tileId = 0;
  for (y = 0; y < Bounce.ROWS; y++) {
    for (x = 0; x < Bounce.COLS; x++) {
      // Tile's clipPath element.
      var tileClip = document.getElementById('tileClipPath' + tileId);
      if (tileClip) {
        tileClip.setAttribute('visibility', 'visible');
      }
      // Tile sprite.
      var tileElement = document.getElementById('tileElement' + tileId);
      if (tileElement) {
        tileElement.setAttribute('opacity', 1);
      }
      tileId++;
    }
  }
};

/**
 * Click the run button.  Start the program.
 */
// XXX This is the only method used by the templates!
Bounce.runButtonClick = function () {
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  studioApp.toggleRunReset('reset');
  Blockly.mainBlockSpace.traceOn(true);
  studioApp.reset(false);
  studioApp.attempts++;
  Bounce.execute();

  if (level.freePlay && !studioApp.hideSource) {
    var shareCell = document.getElementById('share-cell');
    shareCell.className = 'share-cell-enabled';
  }
  if (Bounce.goalLocated_) {
    document.getElementById('score').setAttribute('visibility', 'visible');
    Bounce.displayScore();
  }
};

/**
 * App specific displayFeedback function that calls into
 * studioApp.displayFeedback when appropriate
 */
var displayFeedback = function displayFeedback() {
  if (!Bounce.waitingForReport) {
    studioApp.displayFeedback({
      app: 'bounce', //XXX
      skin: skin.id,
      feedbackType: Bounce.testResults,
      response: Bounce.response,
      level: level,
      showingSharing: level.freePlay,
      twitter: twitterOptions,
      appStrings: {
        reinfFeedbackMsg: bounceMsg.reinfFeedbackMsg(),
        sharingText: bounceMsg.shareGame()
      }
    });
  }
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
Bounce.onReportComplete = function (response) {
  Bounce.response = response;
  Bounce.waitingForReport = false;
  studioApp.onReportComplete(response);
  displayFeedback();
};

/**
 * Execute the user's code.  Heaven help us...
 */
Bounce.execute = function () {
  var code = Blockly.Generator.blockSpaceToCode('JavaScript', 'bounce_whenRun');
  Bounce.result = ResultType.UNSET;
  Bounce.testResults = TestResults.NO_TESTS_RUN;
  Bounce.waitingForReport = false;
  Bounce.response = null;

  if (level.editCode) {
    code = dropletUtils.generateCodeAliases(null, 'Bounce');
    code += studioApp.editor.getValue();
  }

  var codeWallCollided = Blockly.Generator.blockSpaceToCode('JavaScript', 'bounce_whenWallCollided');
  var whenWallCollidedFunc = codegen.functionFromCode(codeWallCollided, {
    StudioApp: studioApp,
    Bounce: api });

  var codeBallInGoal = Blockly.Generator.blockSpaceToCode('JavaScript', 'bounce_whenBallInGoal');
  var whenBallInGoalFunc = codegen.functionFromCode(codeBallInGoal, {
    StudioApp: studioApp,
    Bounce: api });

  var codeBallMissesPaddle = Blockly.Generator.blockSpaceToCode('JavaScript', 'bounce_whenBallMissesPaddle');
  var whenBallMissesPaddleFunc = codegen.functionFromCode(codeBallMissesPaddle, {
    StudioApp: studioApp,
    Bounce: api });

  var codePaddleCollided = Blockly.Generator.blockSpaceToCode('JavaScript', 'bounce_whenPaddleCollided');
  var whenPaddleCollidedFunc = codegen.functionFromCode(codePaddleCollided, {
    StudioApp: studioApp,
    Bounce: api });

  var codeLeft = Blockly.Generator.blockSpaceToCode('JavaScript', 'bounce_whenLeft');
  var whenLeftFunc = codegen.functionFromCode(codeLeft, {
    StudioApp: studioApp,
    Bounce: api });

  var codeRight = Blockly.Generator.blockSpaceToCode('JavaScript', 'bounce_whenRight');
  var whenRightFunc = codegen.functionFromCode(codeRight, {
    StudioApp: studioApp,
    Bounce: api });

  var codeUp = Blockly.Generator.blockSpaceToCode('JavaScript', 'bounce_whenUp');
  var whenUpFunc = codegen.functionFromCode(codeUp, {
    StudioApp: studioApp,
    Bounce: api });

  var codeDown = Blockly.Generator.blockSpaceToCode('JavaScript', 'bounce_whenDown');
  var whenDownFunc = codegen.functionFromCode(codeDown, {
    StudioApp: studioApp,
    Bounce: api });

  var codeGameStarts = Blockly.Generator.blockSpaceToCode('JavaScript', 'when_run');
  var whenGameStartsFunc = codegen.functionFromCode(codeGameStarts, {
    StudioApp: studioApp,
    Bounce: api });

  studioApp.playAudio(Bounce.ballCount > 0 ? 'ballstart' : 'start');

  studioApp.reset(false);

  // Set event handlers and start the onTick timer
  Bounce.whenWallCollided = whenWallCollidedFunc;
  Bounce.whenBallInGoal = whenBallInGoalFunc;
  Bounce.whenBallMissesPaddle = whenBallMissesPaddleFunc;
  Bounce.whenPaddleCollided = whenPaddleCollidedFunc;
  Bounce.whenLeft = whenLeftFunc;
  Bounce.whenRight = whenRightFunc;
  Bounce.whenUp = whenUpFunc;
  Bounce.whenDown = whenDownFunc;
  Bounce.whenGameStarts = whenGameStartsFunc;
  Bounce.tickCount = 0;
  Bounce.intervalId = window.setInterval(Bounce.onTick, Bounce.scale.stepSpeed);
};

Bounce.onPuzzleComplete = function () {
  if (level.freePlay) {
    Bounce.result = ResultType.SUCCESS;
  }

  // Stop everything on screen
  Bounce.clearEventHandlersKillTickLoop();

  // If we know they succeeded, mark levelComplete true
  // Note that we have not yet animated the succesful run
  var levelComplete = Bounce.result == ResultType.SUCCESS;

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    Bounce.testResults = TestResults.FREE_PLAY;
  } else {
    Bounce.testResults = studioApp.getTestResults(levelComplete);
  }

  if (Bounce.testResults >= TestResults.FREE_PLAY) {
    studioApp.playAudio('win');
  } else {
    studioApp.playAudio('failure');
  }

  if (level.editCode) {
    Bounce.testResults = levelComplete ? TestResults.ALL_PASS : TestResults.TOO_FEW_BLOCKS_FAIL;
  }

  var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  var textBlocks = Blockly.Xml.domToText(xml);

  Bounce.waitingForReport = true;

  // Report result to server.
  studioApp.report({
    app: 'bounce',
    level: level.id,
    result: Bounce.result === ResultType.SUCCESS,
    testResult: Bounce.testResults,
    program: encodeURIComponent(textBlocks),
    onComplete: Bounce.onReportComplete
  });
};

/**
 * Set the tiles to be transparent gradually.
 */
Bounce.setTileTransparent = function () {
  var tileId = 0;
  for (var y = 0; y < Bounce.ROWS; y++) {
    for (var x = 0; x < Bounce.COLS; x++) {
      // Tile sprite.
      var tileElement = document.getElementById('tileElement' + tileId);
      var tileAnimation = document.getElementById('tileAnimation' + tileId);
      if (tileElement) {
        tileElement.setAttribute('opacity', 0);
      }
      if (tileAnimation) {
        tileAnimation.beginElement();
      }
      tileId++;
    }
  }
};

/**
 * Display Ball at the specified location, facing the specified direction.
 * @param {number} i Ball index..
 * @param {number} x Horizontal grid (or fraction thereof).
 * @param {number} y Vertical grid (or fraction thereof).
 */
Bounce.displayBall = function (i, x, y) {
  var ballIcon = document.getElementById('ball' + i);
  ballIcon.setAttribute('x', x * Bounce.SQUARE_SIZE);
  ballIcon.setAttribute('y', y * Bounce.SQUARE_SIZE + Bounce.BALL_Y_OFFSET);

  var ballClipRect = document.getElementById('ballClipRect' + i);
  ballClipRect.setAttribute('x', x * Bounce.SQUARE_SIZE);
  ballClipRect.setAttribute('y', ballIcon.getAttribute('y'));
};

/**
 * Display Paddle at the specified location
 * @param {number} x Horizontal grid (or fraction thereof).
 * @param {number} y Vertical grid (or fraction thereof).
 */
Bounce.displayPaddle = function (x, y) {
  var paddleIcon = document.getElementById('paddle');
  paddleIcon.setAttribute('x', x * Bounce.SQUARE_SIZE);
  paddleIcon.setAttribute('y', y * Bounce.SQUARE_SIZE + Bounce.PADDLE_Y_OFFSET);

  var paddleClipRect = document.getElementById('paddleClipRect');
  paddleClipRect.setAttribute('x', x * Bounce.SQUARE_SIZE);
  paddleClipRect.setAttribute('y', paddleIcon.getAttribute('y'));
};

Bounce.displayScore = function () {
  var score = document.getElementById('score');
  score.textContent = bounceMsg.scoreText({
    playerScore: Bounce.playerScore,
    opponentScore: Bounce.opponentScore
  });
};

var skinTheme = function skinTheme(value) {
  if (value === 'hardcourt') {
    return skin;
  }
  return skin[value];
};

Bounce.setBackground = function (value) {
  var element = document.getElementById('background');
  element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skinTheme(value).background);

  // Recompute all of the tiles to determine if they are walls, goals, or empty
  // TODO: do this once during init and cache the result
  var tileId = 0;
  for (var y = 0; y < Bounce.ROWS; y++) {
    for (var x = 0; x < Bounce.COLS; x++) {
      var empty = false;
      var image;
      // Compute the tile index.
      var tile = wallNormalize(x, y) + wallNormalize(x, y - 1) + // North.
      wallNormalize(x + 1, y) + // East.
      wallNormalize(x, y + 1) + // South.
      wallNormalize(x - 1, y); // West.

      // Draw the tile.
      if (WALL_TILE_SHAPES[tile]) {
        image = skinTheme(value).tiles;
      } else {
        // Compute the tile index.
        tile = goalNormalize(x, y) + goalNormalize(x, y - 1) + // North.
        goalNormalize(x + 1, y) + // East.
        goalNormalize(x, y + 1) + // South.
        goalNormalize(x - 1, y); // West.

        if (!GOAL_TILE_SHAPES[tile]) {
          empty = true;
        }
        image = skinTheme(value).goalTiles;
      }
      if (!empty) {
        element = document.getElementById('tileElement' + tileId);
        element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', image);
      }
      tileId++;
    }
  }
};

Bounce.setBall = function (value) {
  Bounce.ballImage = skinTheme(value).ball;
  for (var i = 0; i < Bounce.ballCount; i++) {
    var element = document.getElementById('ball' + i);
    element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', Bounce.ballImage);
  }
};

Bounce.setPaddle = function (value) {
  var element = document.getElementById('paddle');
  element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skinTheme(value).paddle);
};

Bounce.timedOut = function () {
  return Bounce.tickCount > Bounce.timeoutFailureTick;
};

Bounce.allFinishesComplete = function () {
  var i;
  if (Bounce.paddleFinish_) {
    var finished, playSound;
    for (i = 0, finished = 0; i < Bounce.paddleFinishCount; i++) {
      if (!Bounce.paddleFinish_[i].finished) {
        if (essentiallyEqual(Bounce.paddleX, Bounce.paddleFinish_[i].x, tiles.FINISH_COLLIDE_DISTANCE) && essentiallyEqual(Bounce.paddleY, Bounce.paddleFinish_[i].y, tiles.FINISH_COLLIDE_DISTANCE)) {
          Bounce.paddleFinish_[i].finished = true;
          finished++;
          playSound = true;

          // Change the finish icon to goalSuccess.
          var paddleFinishIcon = document.getElementById('paddlefinish' + i);
          paddleFinishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.goalSuccess);
        }
      } else {
        finished++;
      }
    }
    if (playSound && finished != Bounce.paddleFinishCount) {
      // Play a sound unless we've hit the last flag
      studioApp.playAudio('flag');
    }
    return finished == Bounce.paddleFinishCount;
  }
  if (Bounce.ballFinish_) {
    for (i = 0; i < Bounce.ballCount; i++) {
      if (essentiallyEqual(Bounce.ballX[i], Bounce.ballFinish_.x, tiles.FINISH_COLLIDE_DISTANCE) && essentiallyEqual(Bounce.ballY[i], Bounce.ballFinish_.y, tiles.FINISH_COLLIDE_DISTANCE)) {
        // Change the finish icon to goalSuccess.
        var ballFinishIcon = document.getElementById('ballfinish');
        ballFinishIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.goalSuccess);
        return true;
      }
    }
  }
  return false;
};

var checkFinished = function checkFinished() {
  // if we have a succcess condition and have accomplished it, we're done and successful
  if (level.goal && level.goal.successCondition && level.goal.successCondition()) {
    Bounce.result = ResultType.SUCCESS;
    return true;
  }

  // if we have a failure condition, and it's been reached, we're done and failed
  if (level.goal && level.goal.failureCondition && level.goal.failureCondition()) {
    Bounce.result = ResultType.FAILURE;
    return true;
  }

  if (Bounce.allFinishesComplete()) {
    Bounce.result = ResultType.SUCCESS;
    return true;
  }

  if (Bounce.timedOut()) {
    Bounce.result = ResultType.FAILURE;
    return true;
  }

  return false;
};

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../constants":"/home/ubuntu/staging/apps/build/js/constants.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../hammer":"/home/ubuntu/staging/apps/build/js/hammer.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../templates/AppView.jsx":"/home/ubuntu/staging/apps/build/js/templates/AppView.jsx","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../timeoutList":"/home/ubuntu/staging/apps/build/js/timeoutList.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./api":"/home/ubuntu/staging/apps/build/js/bounce/api.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/bounce/controls.html.ejs","./locale":"/home/ubuntu/staging/apps/build/js/bounce/locale.js","./tiles":"/home/ubuntu/staging/apps/build/js/bounce/tiles.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/bounce/visualization.html.ejs"}],"/home/ubuntu/staging/apps/build/js/bounce/visualization.html.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape
/**/) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgBounce">\n</svg>\n<div id="capacityBubble">\n  <div id="capacity"></div>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/bounce/controls.html.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape
/**/) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1;
  var msg = require('./locale');
  var commonMsg = require('../locale');
; buf.push('\n\n<div id="soft-buttons" class="soft-buttons-none">\n  <button id="leftButton" disabled=true class="arrow">\n    <img src="', escape((8,  assetUrl('media/1x1.gif') )), '" class="left-btn icon21">\n  </button>\n  <button id="rightButton" disabled=true class="arrow">\n    <img src="', escape((11,  assetUrl('media/1x1.gif') )), '" class="right-btn icon21">\n  </button>\n  <button id="upButton" disabled=true class="arrow">\n    <img src="', escape((14,  assetUrl('media/1x1.gif') )), '" class="up-btn icon21">\n  </button>\n  <button id="downButton" disabled=true class="arrow">\n    <img src="', escape((17,  assetUrl('media/1x1.gif') )), '" class="down-btn icon21">\n  </button>\n</div>\n<div id="share-cell-wrapper">\n  <div id="share-cell" class="share-cell-none">\n    <button id="finishButton" class="share">\n      <img src="', escape((23,  assetUrl('media/1x1.gif') )), '">', escape((23,  commonMsg.finish() )), '\n    </button>\n  </div>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","./locale":"/home/ubuntu/staging/apps/build/js/bounce/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/bounce/blocks.js":[function(require,module,exports){
/**
 * Blockly App: Bounce
 *
 * Copyright 2013 Code.org
 *
 */
'use strict';

var msg = require('./locale');
var codegen = require('../codegen');

var generateSetterCode = function generateSetterCode(ctx, name) {
  var value = ctx.getTitleValue('VALUE');
  if (value === "random") {
    var allValues = ctx.VALUES.slice(1).map(function (item) {
      return item[1];
    });
    value = 'Bounce.random([' + allValues + '])';
  }

  return 'Bounce.' + name + '(\'block_id_' + ctx.id + '\', ' + value + ');\n';
};

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function (blockly, blockInstallOptions) {
  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  blockly.Blocks.bounce_whenLeft = {
    // Block to handle event when the Left arrow button is pressed.
    helpUrl: '',
    init: function init() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.whenLeft());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenLeftTooltip());
    }
  };

  generator.bounce_whenLeft = function () {
    // Generate JavaScript for handling Left arrow button event.
    return '\n';
  };

  blockly.Blocks.bounce_whenRight = {
    // Block to handle event when the Right arrow button is pressed.
    helpUrl: '',
    init: function init() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.whenRight());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenRightTooltip());
    }
  };

  generator.bounce_whenRight = function () {
    // Generate JavaScript for handling Right arrow button event.
    return '\n';
  };

  blockly.Blocks.bounce_whenUp = {
    // Block to handle event when the Up arrow button is pressed.
    helpUrl: '',
    init: function init() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.whenUp());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenUpTooltip());
    }
  };

  generator.bounce_whenUp = function () {
    // Generate JavaScript for handling Up arrow button event.
    return '\n';
  };

  blockly.Blocks.bounce_whenDown = {
    // Block to handle event when the Down arrow button is pressed.
    helpUrl: '',
    init: function init() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.whenDown());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenDownTooltip());
    }
  };

  generator.bounce_whenDown = function () {
    // Generate JavaScript for handling Down arrow button event.
    return '\n';
  };

  blockly.Blocks.bounce_whenWallCollided = {
    // Block to handle event when a wall/ball collision occurs.
    helpUrl: '',
    init: function init() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.whenWallCollided());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenWallCollidedTooltip());
    }
  };

  generator.bounce_whenWallCollided = function () {
    // Generate JavaScript for handling when a wall/ball collision occurs.
    return '\n';
  };

  blockly.Blocks.bounce_whenBallInGoal = {
    // Block to handle event when a ball enters a goal.
    helpUrl: '',
    init: function init() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.whenBallInGoal());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenBallInGoalTooltip());
    }
  };

  generator.bounce_whenBallInGoal = function () {
    // Generate JavaScript for handling when a ball in goal event occurs.
    return '\n';
  };

  blockly.Blocks.bounce_whenBallMissesPaddle = {
    // Block to handle event when a ball misses the paddle.
    helpUrl: '',
    init: function init() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.whenBallMissesPaddle());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenBallMissesPaddleTooltip());
    }
  };

  generator.bounce_whenBallMissesPaddle = function () {
    // Generate JavaScript for handling when a ball misses the paddle.
    return '\n';
  };

  blockly.Blocks.bounce_whenPaddleCollided = {
    // Block to handle event when a wall collision occurs.
    helpUrl: '',
    init: function init() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.whenPaddleCollided());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenPaddleCollidedTooltip());
    }
  };

  generator.bounce_whenPaddleCollided = function () {
    // Generate JavaScript for handling when a paddle/ball collision occurs.
    return '\n';
  };

  blockly.Blocks.bounce_moveLeft = {
    // Block for moving left.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.moveLeft());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveLeftTooltip());
    }
  };

  generator.bounce_moveLeft = function () {
    // Generate JavaScript for moving left.
    return 'Bounce.moveLeft(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.bounce_moveRight = {
    // Block for moving right.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.moveRight());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveRightTooltip());
    }
  };

  generator.bounce_moveRight = function () {
    // Generate JavaScript for moving right.
    return 'Bounce.moveRight(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.bounce_moveUp = {
    // Block for moving up.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.moveUp());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveUpTooltip());
    }
  };

  generator.bounce_moveUp = function () {
    // Generate JavaScript for moving up.
    return 'Bounce.moveUp(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.bounce_moveDown = {
    // Block for moving down.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.moveDown());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveDownTooltip());
    }
  };

  generator.bounce_moveDown = function () {
    // Generate JavaScript for moving down.
    return 'Bounce.moveDown(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.bounce_playSound = {
    // Block for playing sound.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(new blockly.FieldDropdown(this.SOUNDS), 'SOUND');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.playSoundTooltip());
    }
  };

  blockly.Blocks.bounce_playSound.SOUNDS = [[msg.playSoundHit(), 'hit'], [msg.playSoundWood(), 'wood'], [msg.playSoundRetro(), 'retro'], [msg.playSoundSlap(), 'slap'], [msg.playSoundRubber(), 'rubber'], [msg.playSoundCrunch(), 'crunch'], [msg.playSoundWinPoint(), 'winpoint'], [msg.playSoundWinPoint2(), 'winpoint2'], [msg.playSoundLosePoint(), 'losepoint'], [msg.playSoundLosePoint2(), 'losepoint2'], [msg.playSoundGoal1(), 'goal1'], [msg.playSoundGoal2(), 'goal2']];

  generator.bounce_playSound = function () {
    // Generate JavaScript for playing a sound.
    return 'Bounce.playSound(\'block_id_' + this.id + '\', \'' + this.getTitleValue('SOUND') + '\');\n';
  };

  blockly.Blocks.bounce_incrementPlayerScore = {
    // Block for incrementing the player's score.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.incrementPlayerScore());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.incrementPlayerScoreTooltip());
    }
  };

  generator.bounce_incrementPlayerScore = function () {
    // Generate JavaScript for incrementing the player's score.
    return 'Bounce.incrementPlayerScore(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.bounce_incrementOpponentScore = {
    // Block for incrementing the opponent's score.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.incrementOpponentScore());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.incrementOpponentScoreTooltip());
    }
  };

  generator.bounce_incrementOpponentScore = function () {
    // Generate JavaScript for incrementing the opponent's score.
    return 'Bounce.incrementOpponentScore(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.bounce_bounceBall = {
    // Block for bouncing a ball.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.bounceBall());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.bounceBallTooltip());
    }
  };

  generator.bounce_bounceBall = function () {
    // Generate JavaScript for bouncing a ball.
    return 'Bounce.bounceBall(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.bounce_launchBall = {
    // Block for launching a ball.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.launchBall());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.launchBallTooltip());
    }
  };

  generator.bounce_launchBall = function () {
    // Generate JavaScript for launching a ball.
    return 'Bounce.launchBall(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.bounce_setBallSpeed = {
    // Block for setting ball speed
    helpUrl: '',
    init: function init() {
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[3][1]); // default to normal

      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setBallSpeedTooltip());
    }
  };

  blockly.Blocks.bounce_setBallSpeed.VALUES = [[msg.setBallSpeedRandom(), 'random'], [msg.setBallSpeedVerySlow(), 'Bounce.BallSpeed.VERY_SLOW'], [msg.setBallSpeedSlow(), 'Bounce.BallSpeed.SLOW'], [msg.setBallSpeedNormal(), 'Bounce.BallSpeed.NORMAL'], [msg.setBallSpeedFast(), 'Bounce.BallSpeed.FAST'], [msg.setBallSpeedVeryFast(), 'Bounce.BallSpeed.VERY_FAST']];

  generator.bounce_setBallSpeed = function (velocity) {
    return generateSetterCode(this, 'setBallSpeed');
  };

  blockly.Blocks.bounce_setPaddleSpeed = {
    // Block for setting paddle speed
    helpUrl: '',
    init: function init() {
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[3][1]); // default to normal

      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setPaddleSpeedTooltip());
    }
  };

  blockly.Blocks.bounce_setPaddleSpeed.VALUES = [[msg.setPaddleSpeedRandom(), 'random'], [msg.setPaddleSpeedVerySlow(), 'Bounce.PaddleSpeed.VERY_SLOW'], [msg.setPaddleSpeedSlow(), 'Bounce.PaddleSpeed.SLOW'], [msg.setPaddleSpeedNormal(), 'Bounce.PaddleSpeed.NORMAL'], [msg.setPaddleSpeedFast(), 'Bounce.PaddleSpeed.FAST'], [msg.setPaddleSpeedVeryFast(), 'Bounce.PaddleSpeed.VERY_FAST']];

  generator.bounce_setPaddleSpeed = function (velocity) {
    return generateSetterCode(this, 'setPaddleSpeed');
  };

  /**
   * setBackground
   */
  blockly.Blocks.bounce_setBackground = {
    helpUrl: '',
    init: function init() {
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[1][1]); // default to hardcourt

      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setBackgroundTooltip());
    }
  };

  blockly.Blocks.bounce_setBackground.VALUES = [[msg.setBackgroundRandom(), 'random'], [msg.setBackgroundHardcourt(), '"hardcourt"'], [msg.setBackgroundRetro(), '"retro"']];

  generator.bounce_setBackground = function () {
    return generateSetterCode(this, 'setBackground');
  };

  /**
   * setBall
   */
  blockly.Blocks.bounce_setBall = {
    helpUrl: '',
    init: function init() {
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[1][1]); // default to hardcourt

      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setBallTooltip());
    }
  };

  blockly.Blocks.bounce_setBall.VALUES = [[msg.setBallRandom(), 'random'], [msg.setBallHardcourt(), '"hardcourt"'], [msg.setBallRetro(), '"retro"']];

  generator.bounce_setBall = function () {
    return generateSetterCode(this, 'setBall');
  };

  /**
   * setPaddle
   */
  blockly.Blocks.bounce_setPaddle = {
    helpUrl: '',
    init: function init() {
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[1][1]); // default to hardcourt

      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setPaddleTooltip());
    }
  };

  blockly.Blocks.bounce_setPaddle.VALUES = [[msg.setPaddleRandom(), 'random'], [msg.setPaddleHardcourt(), '"hardcourt"'], [msg.setPaddleRetro(), '"retro"']];

  generator.bounce_setPaddle = function () {
    return generateSetterCode(this, 'setPaddle');
  };

  delete blockly.Blocks.procedures_defreturn;
  delete blockly.Blocks.procedures_ifreturn;
};

},{"../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","./locale":"/home/ubuntu/staging/apps/build/js/bounce/locale.js"}],"/home/ubuntu/staging/apps/build/js/bounce/locale.js":[function(require,module,exports){
// locale for bounce

"use strict";

module.exports = window.blockly.bounce_locale;

},{}],"/home/ubuntu/staging/apps/build/js/bounce/api.js":[function(require,module,exports){
'use strict';

var tiles = require('./tiles');
var Direction = tiles.Direction;
var SquareType = tiles.SquareType;
var studioApp = require('../StudioApp').singleton;

exports.PaddleSpeed = {
  VERY_SLOW: 0.04,
  SLOW: 0.06,
  NORMAL: 0.1,
  FAST: 0.15,
  VERY_FAST: 0.23
};

exports.BallSpeed = {
  VERY_SLOW: 0.04,
  SLOW: 0.06,
  NORMAL: 0.1,
  FAST: 0.15,
  VERY_FAST: 0.23
};

exports.random = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

exports.setBallSpeed = function (id, value) {
  studioApp.highlight(id);
  Bounce.currentBallSpeed = value;
  for (var i = 0; i < Bounce.ballCount; i++) {
    Bounce.ballSpeed[i] = value;
  }
};

exports.setBackground = function (id, value) {
  studioApp.highlight(id);
  Bounce.setBackground(value);
};

exports.setBall = function (id, value) {
  studioApp.highlight(id);
  Bounce.setBall(value);
};

exports.setPaddle = function (id, value) {
  studioApp.highlight(id);
  Bounce.setPaddle(value);
};

exports.setBackground = function (id, value) {
  studioApp.highlight(id);
  Bounce.setBackground(value);
};

exports.setPaddleSpeed = function (id, value) {
  studioApp.highlight(id);
  Bounce.paddleSpeed = value;
};

exports.playSound = function (id, soundName) {
  studioApp.highlight(id);
  studioApp.playAudio(soundName);
};

exports.moveLeft = function (id) {
  studioApp.highlight(id);
  Bounce.paddleX -= Bounce.paddleSpeed;
  if (Bounce.paddleX < 0) {
    Bounce.paddleX = 0;
  }
};

exports.moveRight = function (id) {
  studioApp.highlight(id);
  Bounce.paddleX += Bounce.paddleSpeed;
  if (Bounce.paddleX > Bounce.COLS - 1) {
    Bounce.paddleX = Bounce.COLS - 1;
  }
};

exports.moveUp = function (id) {
  studioApp.highlight(id);
  Bounce.paddleY -= Bounce.paddleSpeed;
  if (Bounce.paddleY < 0) {
    Bounce.paddleY = 0;
  }
};

exports.moveDown = function (id) {
  studioApp.highlight(id);
  Bounce.paddleY += Bounce.paddleSpeed;
  if (Bounce.paddleY > Bounce.ROWS - 1) {
    Bounce.paddleY = Bounce.ROWS - 1;
  }
};

exports.incrementOpponentScore = function (id) {
  studioApp.highlight(id);
  Bounce.opponentScore++;
  Bounce.displayScore();
};

exports.incrementPlayerScore = function (id) {
  studioApp.highlight(id);
  Bounce.playerScore++;
  Bounce.displayScore();
};

exports.launchBall = function (id) {
  studioApp.highlight(id);

  // look for an "out of play" ball to re-launch:
  for (var i = 0; i < Bounce.ballCount; i++) {
    if (Bounce.isBallOutOfBounds(i) && 0 === (Bounce.ballFlags[i] & Bounce.BallFlags.LAUNCHING)) {
      // found an out-of-bounds ball that is not already launching...
      //console.log("LB: relaunching ball " + i);
      Bounce.launchBall(i);
      return;
    }
  }

  // we didn't find an "out of play" ball, so create and launch a new one:
  i = Bounce.ballCount;
  Bounce.ballCount++;
  Bounce.createBallElements(i);
  //console.log("LB: created new ball " + i + " calling playSoundAndResetBall");
  Bounce.playSoundAndResetBall(i);
};

exports.bounceBall = function (id) {
  studioApp.highlight(id);

  var i;
  for (i = 0; i < Bounce.ballCount; i++) {
    if (0 === (Bounce.ballFlags[i] & (Bounce.BallFlags.MISSED_PADDLE | Bounce.BallFlags.IN_GOAL))) {
      if (Bounce.ballX[i] < 0) {
        Bounce.ballX[i] = 0;
        Bounce.ballDir[i] = 2 * Math.PI - Bounce.ballDir[i];
        //console.log("Bounced off left, ball " + i);
      } else if (Bounce.ballX[i] > Bounce.COLS - 1) {
          Bounce.ballX[i] = Bounce.COLS - 1;
          Bounce.ballDir[i] = 2 * Math.PI - Bounce.ballDir[i];
          //console.log("Bounced off right, ball " + i);
        }

      if (Bounce.ballY[i] < tiles.Y_TOP_BOUNDARY) {
        Bounce.ballY[i] = tiles.Y_TOP_BOUNDARY;
        Bounce.ballDir[i] = Math.PI - Bounce.ballDir[i];
        //console.log("Bounced off top, ball " + i);
      }

      var xPaddleBall = Bounce.ballX[i] - Bounce.paddleX;
      var yPaddleBall = Bounce.ballY[i] - Bounce.paddleY;
      var distPaddleBall = Bounce.calcDistance(xPaddleBall, yPaddleBall);

      if (distPaddleBall < tiles.PADDLE_BALL_COLLIDE_DISTANCE) {
        // paddle ball collision
        if (Math.cos(Bounce.ballDir[i]) < 0) {
          // rather than just bounce the ball off a flat paddle, we offset the
          // angle after collision based on whether you hit the left or right
          // side of the paddle.  And then we cap the resulting angle to be in a
          // certain range of radians so the resulting angle isn't too flat
          var paddleAngleBias = 3 * Math.PI / 8 * (xPaddleBall / tiles.PADDLE_BALL_COLLIDE_DISTANCE);
          // Add 5 PI instead of PI to ensure that the resulting angle is
          // positive to simplify the ternary operation in the next statement
          Bounce.ballDir[i] = (Math.PI * 5 + paddleAngleBias - Bounce.ballDir[i]) % (Math.PI * 2);
          Bounce.ballDir[i] = Bounce.ballDir[i] < Math.PI ? Math.min(Math.PI / 2 - 0.2, Bounce.ballDir[i]) : Math.max(3 * Math.PI / 2 + 0.2, Bounce.ballDir[i]);
          //console.log("Bounced off paddle, ball " + i);
        }
      }
    }
  }
};

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","./tiles":"/home/ubuntu/staging/apps/build/js/bounce/tiles.js"}],"/home/ubuntu/staging/apps/build/js/bounce/tiles.js":[function(require,module,exports){
'use strict';

/**
 * Constants for cardinal directions.  Subsequent code assumes these are
 * in the range 0..3 and that opposites have an absolute difference of 2.
 * @enum {number}
 */
exports.Direction = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3
};

exports.PADDLE_BALL_COLLIDE_DISTANCE = 0.7;
exports.FINISH_COLLIDE_DISTANCE = 0.5;
exports.DEFAULT_BALL_SPEED = 0.1;
exports.DEFAULT_BALL_DIRECTION = 1.25 * Math.PI;
exports.DEFAULT_PADDLE_SPEED = 0.1;
exports.DEFAULT_BALL_START_Y = 2;
exports.Y_TOP_BOUNDARY = -0.2;

/**
 * The types of squares in the maze, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
exports.SquareType = {
  OPEN: 0,
  WALL: 1,
  GOAL: 2,
  BALLSTART: 4,
  PADDLEFINISH: 8,
  PADDLESTART: 16,
  BALLFINISH: 32,
  OBSTACLE: 64
};

},{}]},{},["/home/ubuntu/staging/apps/build/js/bounce/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9ib3VuY2UvbWFpbi5qcyIsImJ1aWxkL2pzL2JvdW5jZS9za2lucy5qcyIsImJ1aWxkL2pzL2JvdW5jZS9sZXZlbHMuanMiLCJidWlsZC9qcy9ib3VuY2UvYm91bmNlLmpzIiwiYnVpbGQvanMvYm91bmNlL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9ib3VuY2UvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9ib3VuY2UvYmxvY2tzLmpzIiwiYnVpbGQvanMvYm91bmNlL2xvY2FsZS5qcyIsImJ1aWxkL2pzL2JvdW5jZS9hcGkuanMiLCJidWlsZC9qcy9ib3VuY2UvdGlsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDVkEsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVwQyxJQUFJLE9BQU8sR0FBRzs7QUFFWixRQUFNLEVBQUU7QUFDTix3Q0FBb0MsRUFBRSxJQUFJO0FBQzFDLGVBQVcsRUFBRSxFQUFFO0dBQ2hCOztDQUVGLENBQUM7O0FBRUYsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDcEMsTUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEMsTUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFOUIsTUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLGNBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxD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a0IsR0FBRyxHQUFHLENBQUM7QUFDakMsT0FBTyxDQUFDLHNCQUFzQixHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ2hELE9BQU8sQ0FBQyxvQkFBb0IsR0FBRyxHQUFHLENBQUM7QUFDbkMsT0FBTyxDQUFDLG9CQUFvQixHQUFHLENBQUMsQ0FBQztBQUNqQyxPQUFPLENBQUMsY0FBYyxHQUFHLENBQUMsR0FBRyxDQUFDOzs7Ozs7O0FBTzlCLE9BQU8sQ0FBQyxVQUFVLEdBQUc7QUFDbkIsTUFBSSxFQUFFLENBQUM7QUFDUCxNQUFJLEVBQUUsQ0FBQztBQUNQLE1BQUksRUFBRSxDQUFDO0FBQ1AsV0FBUyxFQUFFLENBQUM7QUFDWixjQUFZLEVBQUUsQ0FBQztBQUNmLGFBQVcsRUFBRSxFQUFFO0FBQ2YsWUFBVSxFQUFFLEVBQUU7QUFDZCxVQUFRLEVBQUUsRUFBRTtDQUNiLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXBwTWFpbiA9IHJlcXVpcmUoJy4uL2FwcE1haW4nKTtcbndpbmRvdy5Cb3VuY2UgPSByZXF1aXJlKCcuL2JvdW5jZScpO1xuaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gIGdsb2JhbC5Cb3VuY2UgPSB3aW5kb3cuQm91bmNlO1xufVxudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4vc2tpbnMnKTtcblxud2luZG93LmJvdW5jZU1haW4gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICBvcHRpb25zLnNraW5zTW9kdWxlID0gc2tpbnM7XG4gIG9wdGlvbnMuYmxvY2tzTW9kdWxlID0gYmxvY2tzO1xuICBhcHBNYWluKHdpbmRvdy5Cb3VuY2UsIGxldmVscywgb3B0aW9ucyk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltSjFhV3hrTDJwekwySnZkVzVqWlM5dFlXbHVMbXB6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3T3p0QlFVRkJMRWxCUVVrc1QwRkJUeXhIUVVGSExFOUJRVThzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXp0QlFVTndReXhOUVVGTkxFTkJRVU1zVFVGQlRTeEhRVUZITEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRCUVVOd1F5eEpRVUZKTEU5QlFVOHNUVUZCVFN4TFFVRkxMRmRCUVZjc1JVRkJSVHRCUVVOcVF5eFJRVUZOTEVOQlFVTXNUVUZCVFN4SFFVRkhMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU03UTBGREwwSTdRVUZEUkN4SlFVRkpMRTFCUVUwc1IwRkJSeXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTTdRVUZEYWtNc1NVRkJTU3hOUVVGTkxFZEJRVWNzVDBGQlR5eERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMEZCUTJwRExFbEJRVWtzUzBGQlN5eEhRVUZITEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenM3UVVGRkwwSXNUVUZCVFN4RFFVRkRMRlZCUVZVc1IwRkJSeXhWUVVGVExFOUJRVThzUlVGQlJUdEJRVU53UXl4VFFVRlBMRU5CUVVNc1YwRkJWeXhIUVVGSExFdEJRVXNzUTBGQlF6dEJRVU0xUWl4VFFVRlBMRU5CUVVNc1dVRkJXU3hIUVVGSExFMUJRVTBzUTBGQlF6dEJRVU01UWl4VFFVRlBMRU5CUVVNc1RVRkJUU3hEUVVGRExFMUJRVTBzUlVGQlJTeE5RVUZOTEVWQlFVVXNUMEZCVHl4RFFVRkRMRU5CUVVNN1EwRkRla01zUTBGQlF5SXNJbVpwYkdVaU9pSm5aVzVsY21GMFpXUXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpZG1GeUlHRndjRTFoYVc0Z1BTQnlaWEYxYVhKbEtDY3VMaTloY0hCTllXbHVKeWs3WEc1M2FXNWtiM2N1UW05MWJtTmxJRDBnY21WeGRXbHlaU2duTGk5aWIzVnVZMlVuS1R0Y2JtbG1JQ2gwZVhCbGIyWWdaMnh2WW1Gc0lDRTlQU0FuZFc1a1pXWnBibVZrSnlrZ2UxeHVJQ0JuYkc5aVlXd3VRbTkxYm1ObElEMGdkMmx1Wkc5M0xrSnZkVzVqWlR0Y2JuMWNiblpoY2lCaWJHOWphM01nUFNCeVpYRjFhWEpsS0NjdUwySnNiMk5yY3ljcE8xeHVkbUZ5SUd4bGRtVnNjeUE5SUhKbGNYVnBjbVVvSnk0dmJHVjJaV3h6SnlrN1hHNTJZWElnYzJ0cGJuTWdQU0J5WlhGMWFYSmxLQ2N1TDNOcmFXNXpKeWs3WEc1Y2JuZHBibVJ2ZHk1aWIzVnVZMlZOWVdsdUlEMGdablZ1WTNScGIyNG9iM0IwYVc5dWN5a2dlMXh1SUNCdmNIUnBiMjV6TG5OcmFXNXpUVzlrZFd4bElEMGdjMnRwYm5NN1hHNGdJRzl3ZEdsdmJuTXVZbXh2WTJ0elRXOWtkV3hsSUQwZ1lteHZZMnR6TzF4dUlDQmhjSEJOWVdsdUtIZHBibVJ2ZHk1Q2IzVnVZMlVzSUd4bGRtVnNjeXdnYjNCMGFXOXVjeWs3WEc1OU8xeHVJbDE5IiwiLyoqXG4gKiBMb2FkIFNraW4gZm9yIEJvdW5jZS5cbiAqL1xuLy8gdGlsZXM6IEEgMjUweDIwMCBzZXQgb2YgMjAgbWFwIGltYWdlcy5cbi8vIGdvYWw6IEEgMjB4MzQgZ29hbCBpbWFnZS5cbi8vIGJhY2tncm91bmQ6IE51bWJlciBvZiA0MDB4NDAwIGJhY2tncm91bmQgaW1hZ2VzLiBSYW5kb21seSBzZWxlY3Qgb25lIGlmXG4vLyBzcGVjaWZpZWQsIG90aGVyd2lzZSwgdXNlIGJhY2tncm91bmQucG5nLlxuLy8gZ3JhcGg6IENvbG91ciBvZiBvcHRpb25hbCBncmlkIGxpbmVzLCBvciBmYWxzZS5cblxudmFyIHNraW5zQmFzZSA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG5cbnZhciBDT05GSUdTID0ge1xuXG4gIGJvdW5jZToge1xuICAgIG5vbkRpc2FwcGVhcmluZ1BlZ21hbkhpdHRpbmdPYnN0YWNsZTogdHJ1ZSxcbiAgICBiYWxsWU9mZnNldDogMTBcbiAgfVxuXG59O1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbihhc3NldFVybCwgaWQpIHtcbiAgdmFyIHNraW4gPSBza2luc0Jhc2UubG9hZChhc3NldFVybCwgaWQpO1xuICB2YXIgY29uZmlnID0gQ09ORklHU1tza2luLmlkXTtcblxuICBza2luLnJldHJvID0ge1xuICAgIGJhY2tncm91bmQ6IHNraW4uYXNzZXRVcmwoJ3JldHJvX2JhY2tncm91bmQucG5nJyksXG4gICAgdGlsZXM6IHNraW4uYXNzZXRVcmwoJ3JldHJvX3RpbGVzX3dhbGwucG5nJyksXG4gICAgZ29hbFRpbGVzOiBza2luLmFzc2V0VXJsKCdyZXRyb190aWxlc19nb2FsLnBuZycpLFxuICAgIHBhZGRsZTogc2tpbi5hc3NldFVybCgncmV0cm9fcGFkZGxlLnBuZycpLFxuICAgIGJhbGw6IHNraW4uYXNzZXRVcmwoJ3JldHJvX2JhbGwucG5nJylcbiAgfTtcblxuICAvLyBJbWFnZXNcbiAgc2tpbi50aWxlcyA9IHNraW4uYXNzZXRVcmwoJ3RpbGVzX3dhbGwucG5nJyk7XG4gIHNraW4uZ29hbFRpbGVzID0gc2tpbi5hc3NldFVybCgndGlsZXNfZ29hbC5wbmcnKTtcbiAgc2tpbi5nb2FsID0gc2tpbi5hc3NldFVybCgnZ29hbC5wbmcnKTtcbiAgc2tpbi5nb2FsU3VjY2VzcyA9IHNraW4uYXNzZXRVcmwoJ2dvYWxfc3VjY2Vzcy5wbmcnKTtcbiAgc2tpbi5iYWxsID0gc2tpbi5hc3NldFVybCgnYmFsbC5wbmcnKTtcbiAgc2tpbi5wYWRkbGUgPSBza2luLmFzc2V0VXJsKCdwYWRkbGUucG5nJyk7XG4gIHNraW4ub2JzdGFjbGUgPSBza2luLmFzc2V0VXJsKCdvYnN0YWNsZS5wbmcnKTtcbiAgaWYgKGNvbmZpZy5ub25EaXNhcHBlYXJpbmdQZWdtYW5IaXR0aW5nT2JzdGFjbGUpIHtcbiAgICBza2luLm5vbkRpc2FwcGVhcmluZ1BlZ21hbkhpdHRpbmdPYnN0YWNsZSA9IHRydWU7XG4gIH0gZWxzZSB7XG4gICAgc2tpbi5ub25EaXNhcHBlYXJpbmdQZWdtYW5IaXR0aW5nT2JzdGFjbGUgPSBmYWxzZTtcbiAgfVxuICBza2luLm9ic3RhY2xlU2NhbGUgPSBjb25maWcub2JzdGFjbGVTY2FsZSB8fCAxLjA7XG4gIHNraW4ubGFyZ2VyT2JzdGFjbGVBbmltYXRpb25UaWxlcyA9XG4gICAgICBza2luLmFzc2V0VXJsKGNvbmZpZy5sYXJnZXJPYnN0YWNsZUFuaW1hdGlvblRpbGVzKTtcbiAgc2tpbi5oaXR0aW5nV2FsbEFuaW1hdGlvbiA9XG4gICAgICBza2luLmFzc2V0VXJsKGNvbmZpZy5oaXR0aW5nV2FsbEFuaW1hdGlvbik7XG4gIHNraW4uYXBwcm9hY2hpbmdHb2FsQW5pbWF0aW9uID1cbiAgICAgIHNraW4uYXNzZXRVcmwoY29uZmlnLmFwcHJvYWNoaW5nR29hbEFuaW1hdGlvbik7XG4gIC8vIFNvdW5kc1xuICBza2luLnJ1YmJlclNvdW5kID0gW3NraW4uYXNzZXRVcmwoJ3dhbGwubXAzJyksIHNraW4uYXNzZXRVcmwoJ3dhbGwub2dnJyldO1xuICBza2luLmZsYWdTb3VuZCA9IFtza2luLmFzc2V0VXJsKCd3aW5fZ29hbC5tcDMnKSxcbiAgICAgICAgICAgICAgICAgICAgc2tpbi5hc3NldFVybCgnd2luX2dvYWwub2dnJyldO1xuICBza2luLmNydW5jaFNvdW5kID0gW3NraW4uYXNzZXRVcmwoJ3dhbGwwLm1wMycpLCBza2luLmFzc2V0VXJsKCd3YWxsMC5vZ2cnKV07XG4gIHNraW4uYmFsbFN0YXJ0U291bmQgPSBbc2tpbi5hc3NldFVybCgnYmFsbF9zdGFydC5tcDMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBza2luLmFzc2V0VXJsKCdiYWxsX3N0YXJ0Lm9nZycpXTtcbiAgc2tpbi53aW5Qb2ludFNvdW5kID0gW3NraW4uYXNzZXRVcmwoJzFfd2Vfd2luLm1wMycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5hc3NldFVybCgnMV93ZV93aW4ub2dnJyldO1xuICBza2luLndpblBvaW50MlNvdW5kID0gW3NraW4uYXNzZXRVcmwoJzJfd2Vfd2luLm1wMycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uYXNzZXRVcmwoJzJfd2Vfd2luLm9nZycpXTtcbiAgc2tpbi5sb3NlUG9pbnRTb3VuZCA9IFtza2luLmFzc2V0VXJsKCcxX3dlX2xvc2UubXAzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5hc3NldFVybCgnMV93ZV9sb3NlLm9nZycpXTtcbiAgc2tpbi5sb3NlUG9pbnQyU291bmQgPSBbc2tpbi5hc3NldFVybCgnMl93ZV9sb3NlLm1wMycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLmFzc2V0VXJsKCcyX3dlX2xvc2Uub2dnJyldO1xuICBza2luLmdvYWwxU291bmQgPSBbc2tpbi5hc3NldFVybCgnMV9nb2FsLm1wMycpLCBza2luLmFzc2V0VXJsKCcxX2dvYWwub2dnJyldO1xuICBza2luLmdvYWwyU291bmQgPSBbc2tpbi5hc3NldFVybCgnMl9nb2FsLm1wMycpLCBza2luLmFzc2V0VXJsKCcyX2dvYWwub2dnJyldO1xuICBza2luLndvb2RTb3VuZCA9IFtza2luLmFzc2V0VXJsKCcxX3BhZGRsZV9ib3VuY2UubXAzJyksXG4gICAgICAgICAgICAgICAgICAgIHNraW4uYXNzZXRVcmwoJzFfcGFkZGxlX2JvdW5jZS5vZ2cnKV07XG4gIHNraW4ucmV0cm9Tb3VuZCA9IFtza2luLmFzc2V0VXJsKCcyX3BhZGRsZV9ib3VuY2UubXAzJyksXG4gICAgICAgICAgICAgICAgICAgICBza2luLmFzc2V0VXJsKCcyX3BhZGRsZV9ib3VuY2Uub2dnJyldO1xuICBza2luLnNsYXBTb3VuZCA9IFtza2luLmFzc2V0VXJsKCcxX3dhbGxfYm91bmNlLm1wMycpLFxuICAgICAgICAgICAgICAgICAgICBza2luLmFzc2V0VXJsKCcxX3dhbGxfYm91bmNlLm9nZycpXTtcbiAgc2tpbi5oaXRTb3VuZCA9IFtza2luLmFzc2V0VXJsKCcyX3dhbGxfYm91bmNlLm1wMycpLFxuICAgICAgICAgICAgICAgICAgIHNraW4uYXNzZXRVcmwoJzJfd2FsbF9ib3VuY2Uub2dnJyldO1xuXG4gIC8vIFNldHRpbmdzXG4gIGlmIChjb25maWcuYmFja2dyb3VuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY29uZmlnLmJhY2tncm91bmQpO1xuICAgIHNraW4uYmFja2dyb3VuZCA9IHNraW4uYXNzZXRVcmwoJ2JhY2tncm91bmQnICsgaW5kZXggKyAnLnBuZycpO1xuICB9IGVsc2Uge1xuICAgIHNraW4uYmFja2dyb3VuZCA9IHNraW4uYXNzZXRVcmwoJ2JhY2tncm91bmQucG5nJyk7XG4gIH1cbiAgc2tpbi5wZWdtYW5IZWlnaHQgPSBjb25maWcucGVnbWFuSGVpZ2h0IHx8IDUyO1xuICBza2luLnBlZ21hbldpZHRoID0gY29uZmlnLnBlZ21hbldpZHRoIHx8IDQ5O1xuICBza2luLmJhbGxZT2Zmc2V0ID0gY29uZmlnLmJhbGxZT2Zmc2V0IHx8IDA7XG4gIHNraW4ucGFkZGxlWU9mZnNldCA9IGNvbmZpZy5wYWRkbGVZT2Zmc2V0IHx8IDA7XG4gIHJldHVybiBza2luO1xufTtcbiIsIi8qanNoaW50IG11bHRpc3RyOiB0cnVlICovXG5cbnZhciBEaXJlY3Rpb24gPSByZXF1aXJlKCcuL3RpbGVzJykuRGlyZWN0aW9uO1xudmFyIHRiID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKS5jcmVhdGVUb29sYm94O1xuXG4vKlxuICogQ29uZmlndXJhdGlvbiBmb3IgYWxsIGxldmVscy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgJzEnOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdtb3ZlTGVmdCcsICd0eXBlJzogJ2JvdW5jZV9tb3ZlTGVmdCd9XVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAnc29mdEJ1dHRvbnMnOiBbXG4gICAgICAnbGVmdEJ1dHRvbidcbiAgICBdLFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbOCwgMCwgMCwxNiwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdLFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKCc8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlTGVmdFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZVJpZ2h0XCI+PC9ibG9jaz4nKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAnPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbkxlZnRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+J1xuICB9LFxuICAnMic6IHtcbiAgICAnaWRlYWwnOiA1LFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFt7J3Rlc3QnOiAnbW92ZVJpZ2h0JywgJ3R5cGUnOiAnYm91bmNlX21vdmVSaWdodCd9XSxcbiAgICAgIFt7J3Rlc3QnOiAnbW92ZUxlZnQnLCAndHlwZSc6ICdib3VuY2VfbW92ZUxlZnQnfV1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3NvZnRCdXR0b25zJzogW1xuICAgICAgJ2xlZnRCdXR0b24nLFxuICAgICAgJ3JpZ2h0QnV0dG9uJ1xuICAgIF0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFs4LCAwLCAwLDE2LCAwLCAwLCAwLCA4XSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoJzxibG9jayB0eXBlPVwiYm91bmNlX21vdmVMZWZ0XCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlUmlnaHRcIj48L2Jsb2NrPicpLFxuICAgICdzdGFydEJsb2Nrcyc6XG4gICAgICc8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuTGVmdFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5SaWdodFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjE4MFwiIHk9XCIyMFwiPjwvYmxvY2s+J1xuICB9LFxuICAnMyc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ21vdmVVcCcsICd0eXBlJzogJ2JvdW5jZV9tb3ZlVXAnfV1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3NvZnRCdXR0b25zJzogW1xuICAgICAgJ3VwQnV0dG9uJ1xuICAgIF0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCA4LCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLDE2LCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXVxuICAgIF0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoJzxibG9jayB0eXBlPVwiYm91bmNlX21vdmVMZWZ0XCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlUmlnaHRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX21vdmVVcFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZURvd25cIj48L2Jsb2NrPicpLFxuICAgICdzdGFydEJsb2Nrcyc6XG4gICAgICc8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuVXBcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+J1xuICB9LFxuICAnNCc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ21vdmVSaWdodCcsICd0eXBlJzogJ2JvdW5jZV9tb3ZlUmlnaHQnfV0sXG4gICAgICBbeyd0ZXN0JzogJ21vdmVMZWZ0JywgJ3R5cGUnOiAnYm91bmNlX21vdmVMZWZ0J31dLFxuICAgICAgW3sndGVzdCc6ICdtb3ZlVXAnLCAndHlwZSc6ICdib3VuY2VfbW92ZVVwJ31dLFxuICAgICAgW3sndGVzdCc6ICdtb3ZlRG93bicsICd0eXBlJzogJ2JvdW5jZV9tb3ZlRG93bid9XVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAnc29mdEJ1dHRvbnMnOiBbXG4gICAgICAnbGVmdEJ1dHRvbicsXG4gICAgICAncmlnaHRCdXR0b24nLFxuICAgICAgJ2Rvd25CdXR0b24nLFxuICAgICAgJ3VwQnV0dG9uJ1xuICAgIF0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCA4LCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCA4XSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFs4LCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLDE2LCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCA4LCAwLCAwXVxuICAgIF0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoJzxibG9jayB0eXBlPVwiYm91bmNlX21vdmVMZWZ0XCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlUmlnaHRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX21vdmVVcFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZURvd25cIj48L2Jsb2NrPicpLFxuICAgICdzdGFydEJsb2Nrcyc6XG4gICAgICc8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuTGVmdFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5SaWdodFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjE4MFwiIHk9XCIyMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuVXBcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIxMjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbkRvd25cIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIxODBcIiB5PVwiMTIwXCI+PC9ibG9jaz4nXG4gIH0sXG4gICc1Jzoge1xuICAgICd0aW1lb3V0RmFpbHVyZVRpY2snOiAxMDAsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdib3VuY2VCYWxsJywgJ3R5cGUnOiAnYm91bmNlX2JvdW5jZUJhbGwnfV1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ2JhbGxEaXJlY3Rpb24nOiAoMS4yODUgKiBNYXRoLlBJKSxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzMyLDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDQsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsMTYsIDAsIDAsIDAsIDBdXG4gICAgXSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YignPGJsb2NrIHR5cGU9XCJib3VuY2VfYm91bmNlQmFsbFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfcGxheVNvdW5kXCI+PC9ibG9jaz4nKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAnPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlblBhZGRsZUNvbGxpZGVkXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPidcbiAgfSxcbiAgJzYnOiB7XG4gICAgJ3RpbWVvdXRGYWlsdXJlVGljayc6IDE0MCxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ2JvdW5jZUJhbGwnLCAndHlwZSc6ICdib3VuY2VfYm91bmNlQmFsbCd9XVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAnYmFsbERpcmVjdGlvbic6ICgxLjI4NSAqIE1hdGguUEkpLFxuICAgICdtYXAnOiBbXG4gICAgICBbMSwgMSwzMywgMSwgMSwgMSwgMSwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgNCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwxNiwgMCwgMCwgMCwgMV1cbiAgICBdLFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKCc8YmxvY2sgdHlwZT1cImJvdW5jZV9ib3VuY2VCYWxsXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9wbGF5U291bmRcIj48L2Jsb2NrPicpLFxuICAgICdzdGFydEJsb2Nrcyc6XG4gICAgICc8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuUGFkZGxlQ29sbGlkZWRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuV2FsbENvbGxpZGVkXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMTIwXCI+PC9ibG9jaz4nXG4gIH0sXG4gICc3Jzoge1xuICAgICd0aW1lb3V0RmFpbHVyZVRpY2snOiA5MDAsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdtb3ZlTGVmdCcsICd0eXBlJzogJ2JvdW5jZV9tb3ZlTGVmdCd9XSxcbiAgICAgIFt7J3Rlc3QnOiAnbW92ZVJpZ2h0JywgJ3R5cGUnOiAnYm91bmNlX21vdmVSaWdodCd9XSxcbiAgICAgIFt7J3Rlc3QnOiAnYm91bmNlQmFsbCcsICd0eXBlJzogJ2JvdW5jZV9ib3VuY2VCYWxsJ31dXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICdzb2Z0QnV0dG9ucyc6IFtcbiAgICAgICdsZWZ0QnV0dG9uJyxcbiAgICAgICdyaWdodEJ1dHRvbidcbiAgICBdLFxuICAgICdmYWlsT25CYWxsRXhpdCcgOiB0cnVlLFxuICAgICdtYXAnOiBbXG4gICAgICBbMSwgMSwgMSwgMSwgMSwgMSwgMSwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwzMiwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgNCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwxNiwgMCwgMCwgMCwgMCwgMV1cbiAgICBdLFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKCc8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlTGVmdFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZVJpZ2h0XCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9ib3VuY2VCYWxsXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9wbGF5U291bmRcIj48L2Jsb2NrPicpLFxuICAgICdzdGFydEJsb2Nrcyc6XG4gICAgICc8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuTGVmdFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5SaWdodFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjE4MFwiIHk9XCIyMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuUGFkZGxlQ29sbGlkZWRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIxMjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbldhbGxDb2xsaWRlZFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIyMFwiPjwvYmxvY2s+J1xuICB9LFxuLypcbiAgJzgnOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdtb3ZlUmlnaHQnLCAndHlwZSc6ICdib3VuY2VfbW92ZVJpZ2h0J31dXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICdzb2Z0QnV0dG9ucyc6IFtcbiAgICAgICdsZWZ0QnV0dG9uJyxcbiAgICAgICdyaWdodEJ1dHRvbidcbiAgICBdLFxuICAgICdtYXAnOiBbXG4gICAgICBbMSwgMSwgMSwgMSwgNSwgMSwgMSwgMV0sXG4gICAgICBbMSwgMCwgNCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgNCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgNCwgMV0sXG4gICAgICBbMSwgNCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwxNiwgMCwgMCwgMCwgMCwgMV1cbiAgICBdLFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKCc8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlTGVmdFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZVJpZ2h0XCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9ib3VuY2VCYWxsXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9wbGF5U291bmRcIj48L2Jsb2NrPicpLFxuICAgICdzdGFydEJsb2Nrcyc6XG4gICAgICc8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuTGVmdFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5SaWdodFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjE4MFwiIHk9XCIyMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuUGFkZGxlQ29sbGlkZWRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIxMjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbldhbGxDb2xsaWRlZFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIyMFwiPjwvYmxvY2s+J1xuICB9LFxuICAnOSc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ21vdmVSaWdodCcsICd0eXBlJzogJ2JvdW5jZV9tb3ZlUmlnaHQnfV1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3NvZnRCdXR0b25zJzogW1xuICAgICAgJ2xlZnRCdXR0b24nLFxuICAgICAgJ3JpZ2h0QnV0dG9uJ1xuICAgIF0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsxLCA1LCAxLCA1LCAxLCA1LCAxLCA1XSxcbiAgICAgIFs1LCAwLCA0LCAwLCA0LCAwLCA0LCAxXSxcbiAgICAgIFsxLCA0LCAwLCA0LCAwLCA0LCAwLCA1XSxcbiAgICAgIFs1LCAwLCA0LCAwLCA0LCAwLCA0LCAxXSxcbiAgICAgIFsxLCA0LCAwLCA0LCAwLCA0LCAwLCA1XSxcbiAgICAgIFs1LCAwLCA0LCAwLCA0LCAwLCA0LCAxXSxcbiAgICAgIFsxLCA0LCAwLCA0LCAwLCA0LCAwLCA1XSxcbiAgICAgIFsxLCAwLDE2LCAwLCAwLCAwLCAwLCAxXVxuICAgIF0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoJzxibG9jayB0eXBlPVwiYm91bmNlX21vdmVMZWZ0XCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlUmlnaHRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX2JvdW5jZUJhbGxcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3BsYXlTb3VuZFwiPjwvYmxvY2s+JyksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgJzxibG9jayB0eXBlPVwiYm91bmNlX3doZW5MZWZ0XCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlblJpZ2h0XCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMTgwXCIgeT1cIjIwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5QYWRkbGVDb2xsaWRlZFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjEyMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuV2FsbENvbGxpZGVkXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjIwXCI+PC9ibG9jaz4nXG4gIH0sXG4qL1xuICAnMTAnOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdtb3ZlTGVmdCcsICd0eXBlJzogJ2JvdW5jZV9tb3ZlTGVmdCd9XSxcbiAgICAgIFt7J3Rlc3QnOiAnbW92ZVJpZ2h0JywgJ3R5cGUnOiAnYm91bmNlX21vdmVSaWdodCd9XSxcbiAgICAgIFt7J3Rlc3QnOiAnYm91bmNlQmFsbCcsICd0eXBlJzogJ2JvdW5jZV9ib3VuY2VCYWxsJ31dLFxuICAgICAgW3sndGVzdCc6ICdpbmNyZW1lbnRQbGF5ZXJTY29yZScsICd0eXBlJzogJ2JvdW5jZV9pbmNyZW1lbnRQbGF5ZXJTY29yZSd9XSxcbiAgICAgIFt7J3Rlc3QnOiAnaW5jcmVtZW50T3Bwb25lbnRTY29yZScsICd0eXBlJzogJ2JvdW5jZV9pbmNyZW1lbnRPcHBvbmVudFNjb3JlJ31dXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICdzb2Z0QnV0dG9ucyc6IFtcbiAgICAgICdsZWZ0QnV0dG9uJyxcbiAgICAgICdyaWdodEJ1dHRvbidcbiAgICBdLFxuICAgICdnb2FsJzoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gKEJvdW5jZS5vcHBvbmVudFNjb3JlID49IDIpO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ3Jlc3Bhd25CYWxscycgOiB0cnVlLFxuICAgICdtYXAnOiBbXG4gICAgICBbMSwgMSwgMiwgMiwgMiwgMiwgMSwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgNCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwxNiwgMCwgMCwgMCwgMCwgMV1cbiAgICBdLFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKCc8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlTGVmdFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZVJpZ2h0XCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9ib3VuY2VCYWxsXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9wbGF5U291bmRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX2luY3JlbWVudFBsYXllclNjb3JlXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9pbmNyZW1lbnRPcHBvbmVudFNjb3JlXCI+PC9ibG9jaz4nKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAnPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbkxlZnRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuUmlnaHRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIxODBcIiB5PVwiMjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlblBhZGRsZUNvbGxpZGVkXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMTAwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5XYWxsQ29sbGlkZWRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIxODBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbkJhbGxJbkdvYWxcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyNjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbkJhbGxNaXNzZXNQYWRkbGVcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIzNDBcIj48L2Jsb2NrPidcbiAgfSxcbiAgJzExJzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFt7J3Rlc3QnOiAnbW92ZUxlZnQnLCAndHlwZSc6ICdib3VuY2VfbW92ZUxlZnQnfV0sXG4gICAgICBbeyd0ZXN0JzogJ21vdmVSaWdodCcsICd0eXBlJzogJ2JvdW5jZV9tb3ZlUmlnaHQnfV0sXG4gICAgICBbeyd0ZXN0JzogJ2JvdW5jZUJhbGwnLCAndHlwZSc6ICdib3VuY2VfYm91bmNlQmFsbCd9XSxcbiAgICAgIFt7J3Rlc3QnOiAnaW5jcmVtZW50UGxheWVyU2NvcmUnLCAndHlwZSc6ICdib3VuY2VfaW5jcmVtZW50UGxheWVyU2NvcmUnfV0sXG4gICAgICBbeyd0ZXN0JzogJ2luY3JlbWVudE9wcG9uZW50U2NvcmUnLCAndHlwZSc6ICdib3VuY2VfaW5jcmVtZW50T3Bwb25lbnRTY29yZSd9XSxcbiAgICAgIFt7J3Rlc3QnOiAnbGF1bmNoQmFsbCcsICd0eXBlJzogJ2JvdW5jZV9sYXVuY2hCYWxsJ31dXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICdzb2Z0QnV0dG9ucyc6IFtcbiAgICAgICdsZWZ0QnV0dG9uJyxcbiAgICAgICdyaWdodEJ1dHRvbidcbiAgICBdLFxuICAgICdtaW5Xb3Jrc3BhY2VIZWlnaHQnOiA3NTAsXG4gICAgJ2dvYWwnOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAoQm91bmNlLm9wcG9uZW50U2NvcmUgPj0gMik7XG4gICAgICB9XG4gICAgfSxcbiAgICAnbWFwJzogW1xuICAgICAgWzEsIDEsIDIsIDIsIDIsIDIsIDEsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsMTYsIDAsIDAsIDAsIDAsIDFdXG4gICAgXSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YignPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZUxlZnRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX21vdmVSaWdodFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfYm91bmNlQmFsbFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfcGxheVNvdW5kXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9pbmNyZW1lbnRQbGF5ZXJTY29yZVwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfaW5jcmVtZW50T3Bwb25lbnRTY29yZVwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfbGF1bmNoQmFsbFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfc2V0UGFkZGxlU3BlZWRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3NldEJhbGxTcGVlZFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfc2V0QmFja2dyb3VuZFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfc2V0QmFsbFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfc2V0UGFkZGxlXCI+PC9ibG9jaz4nKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAnPGJsb2NrIHR5cGU9XCJ3aGVuX3J1blwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5MZWZ0XCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMTgwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5SaWdodFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjE4MFwiIHk9XCIxODBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlblBhZGRsZUNvbGxpZGVkXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjcwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5XYWxsQ29sbGlkZWRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIzNzBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbkJhbGxJbkdvYWxcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCI0NzBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbkJhbGxNaXNzZXNQYWRkbGVcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCI1OTBcIj48L2Jsb2NrPidcbiAgfSxcbiAgJzEyJzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3NvZnRCdXR0b25zJzogW1xuICAgICAgJ2xlZnRCdXR0b24nLFxuICAgICAgJ3JpZ2h0QnV0dG9uJ1xuICAgIF0sXG4gICAgJ21pbldvcmtzcGFjZUhlaWdodCc6IDgwMCxcbiAgICAnZnJlZVBsYXknOiB0cnVlLFxuICAgICdtYXAnOiBbXG4gICAgICBbMSwgMSwgMiwgMiwgMiwgMiwgMSwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gICAgICBbMSwgMCwxNiwgMCwgMCwgMCwgMCwgMV1cbiAgICBdLFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKCc8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlTGVmdFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZVJpZ2h0XCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9ib3VuY2VCYWxsXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9wbGF5U291bmRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX2luY3JlbWVudFBsYXllclNjb3JlXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9pbmNyZW1lbnRPcHBvbmVudFNjb3JlXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9sYXVuY2hCYWxsXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9zZXRQYWRkbGVTcGVlZFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfc2V0QmFsbFNwZWVkXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9zZXRCYWNrZ3JvdW5kXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9zZXRCYWxsXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9zZXRQYWRkbGVcIj48L2Jsb2NrPicpLFxuICAgICdzdGFydEJsb2Nrcyc6XG4gICAgICc8YmxvY2sgdHlwZT1cIndoZW5fcnVuXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbkxlZnRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlblJpZ2h0XCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMTgwXCIgeT1cIjIyMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuUGFkZGxlQ29sbGlkZWRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIzMTBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbldhbGxDb2xsaWRlZFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjQxMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuQmFsbEluR29hbFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjUxMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuQmFsbE1pc3Nlc1BhZGRsZVwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjYzMFwiPjwvYmxvY2s+J1xuICB9LFxufTtcbiIsIi8qKlxuICogQmxvY2tseSBBcHA6IEJvdW5jZVxuICpcbiAqIENvcHlyaWdodCAyMDEzIENvZGUub3JnXG4gKlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciBib3VuY2VNc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi4vc2tpbnMnKTtcbnZhciB0aWxlcyA9IHJlcXVpcmUoJy4vdGlsZXMnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xudmFyIGFwaSA9IHJlcXVpcmUoJy4vYXBpJyk7XG52YXIgQXBwVmlldyA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9BcHBWaWV3LmpzeCcpO1xudmFyIHBhZ2UgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvcGFnZS5odG1sLmVqcycpO1xudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2RvbScpO1xudmFyIEhhbW1lciA9IHJlcXVpcmUoJy4uL2hhbW1lcicpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBkcm9wbGV0VXRpbHMgPSByZXF1aXJlKCcuLi9kcm9wbGV0VXRpbHMnKTtcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBLZXlDb2RlcyA9IGNvbnN0YW50cy5LZXlDb2RlcztcblxudmFyIERpcmVjdGlvbiA9IHRpbGVzLkRpcmVjdGlvbjtcbnZhciBTcXVhcmVUeXBlID0gdGlsZXMuU3F1YXJlVHlwZTtcblxudmFyIFJlc3VsdFR5cGUgPSBzdHVkaW9BcHAuUmVzdWx0VHlwZTtcbnZhciBUZXN0UmVzdWx0cyA9IHN0dWRpb0FwcC5UZXN0UmVzdWx0cztcblxuLyoqXG4gKiBDcmVhdGUgYSBuYW1lc3BhY2UgZm9yIHRoZSBhcHBsaWNhdGlvbi5cbiAqL1xudmFyIEJvdW5jZSA9IG1vZHVsZS5leHBvcnRzO1xuXG5Cb3VuY2Uua2V5U3RhdGUgPSB7fTtcbkJvdW5jZS5nZXN0dXJlc09ic2VydmVkID0ge307XG5Cb3VuY2UuYnRuU3RhdGUgPSB7fTtcblxudmFyIEJ1dHRvblN0YXRlID0ge1xuICBVUDogMCxcbiAgRE9XTjogMVxufTtcblxuQm91bmNlLkJhbGxGbGFncyA9IHtcbiAgTUlTU0VEX1BBRERMRTogMSxcbiAgSU5fR09BTDogMixcbiAgTEFVTkNISU5HOiA0XG59O1xuXG52YXIgQXJyb3dJZHMgPSB7XG4gIExFRlQ6ICdsZWZ0QnV0dG9uJyxcbiAgVVA6ICd1cEJ1dHRvbicsXG4gIFJJR0hUOiAncmlnaHRCdXR0b24nLFxuICBET1dOOiAnZG93bkJ1dHRvbidcbn07XG5cbnZhciBEUkFHX0RJU1RBTkNFX1RPX01PVkVfUkFUSU8gPSAyNTtcblxudmFyIGxldmVsO1xudmFyIHNraW47XG5cbi8qKlxuICogTWlsbGlzZWNvbmRzIGJldHdlZW4gZWFjaCBhbmltYXRpb24gZnJhbWUuXG4gKi9cbnZhciBzdGVwU3BlZWQ7XG5cbi8vVE9ETzogTWFrZSBjb25maWd1cmFibGUuXG5zdHVkaW9BcHAuc2V0Q2hlY2tGb3JFbXB0eUJsb2Nrcyh0cnVlKTtcblxudmFyIGdldFRpbGUgPSBmdW5jdGlvbihtYXAsIHgsIHkpIHtcbiAgaWYgKG1hcCAmJiBtYXBbeV0pIHtcbiAgICByZXR1cm4gbWFwW3ldW3hdO1xuICB9XG59O1xuXG4vLyBEZWZhdWx0IFNjYWxpbmdzXG5Cb3VuY2Uuc2NhbGUgPSB7XG4gICdzbmFwUmFkaXVzJzogMSxcbiAgJ3N0ZXBTcGVlZCc6IDMzXG59O1xuXG52YXIgdHdpdHRlck9wdGlvbnMgPSB7XG4gIHRleHQ6IGJvdW5jZU1zZy5zaGFyZUJvdW5jZVR3aXR0ZXIoKSxcbiAgaGFzaHRhZzogXCJCb3VuY2VDb2RlXCJcbn07XG5cbnZhciBsb2FkTGV2ZWwgPSBmdW5jdGlvbigpIHtcbiAgLy8gTG9hZCBtYXBzLlxuICBCb3VuY2UubWFwID0gbGV2ZWwubWFwO1xuICBCb3VuY2UudGltZW91dEZhaWx1cmVUaWNrID0gbGV2ZWwudGltZW91dEZhaWx1cmVUaWNrIHx8IEluZmluaXR5O1xuICBCb3VuY2UubWluV29ya3NwYWNlSGVpZ2h0ID0gbGV2ZWwubWluV29ya3NwYWNlSGVpZ2h0O1xuICBCb3VuY2Uuc29mdEJ1dHRvbnNfID0gbGV2ZWwuc29mdEJ1dHRvbnMgfHwgW107XG4gIEJvdW5jZS5yZXNwYXduQmFsbHMgPSBsZXZlbC5yZXNwYXduQmFsbHMgfHwgZmFsc2U7XG4gIEJvdW5jZS5mYWlsT25CYWxsRXhpdCA9IGxldmVsLmZhaWxPbkJhbGxFeGl0IHx8IGZhbHNlO1xuXG4gIC8vIE92ZXJyaWRlIHNjYWxhcnMuXG4gIGZvciAodmFyIGtleSBpbiBsZXZlbC5zY2FsZSkge1xuICAgIEJvdW5jZS5zY2FsZVtrZXldID0gbGV2ZWwuc2NhbGVba2V5XTtcbiAgfVxuXG4gIC8vIE1lYXN1cmUgbWF6ZSBkaW1lbnNpb25zIGFuZCBzZXQgc2l6ZXMuXG4gIC8vIFJPV1M6IE51bWJlciBvZiB0aWxlcyBkb3duLlxuICBCb3VuY2UuUk9XUyA9IEJvdW5jZS5tYXAubGVuZ3RoO1xuICAvLyBDT0xTOiBOdW1iZXIgb2YgdGlsZXMgYWNyb3NzLlxuICBCb3VuY2UuQ09MUyA9IEJvdW5jZS5tYXBbMF0ubGVuZ3RoO1xuICAvLyBJbml0aWFsaXplIHRoZSB3YWxsTWFwLlxuICBpbml0V2FsbE1hcCgpO1xuICAvLyBQaXhlbCBoZWlnaHQgYW5kIHdpZHRoIG9mIGVhY2ggbWF6ZSBzcXVhcmUgKGkuZS4gdGlsZSkuXG4gIEJvdW5jZS5TUVVBUkVfU0laRSA9IDUwO1xuICBCb3VuY2UuUEVHTUFOX0hFSUdIVCA9IHNraW4ucGVnbWFuSGVpZ2h0O1xuICBCb3VuY2UuUEVHTUFOX1dJRFRIID0gc2tpbi5wZWdtYW5XaWR0aDtcbiAgQm91bmNlLkJBTExfWV9PRkZTRVQgPSBza2luLmJhbGxZT2Zmc2V0O1xuICBCb3VuY2UuUEFERExFX1lfT0ZGU0VUID0gc2tpbi5wYWRkbGVZT2Zmc2V0O1xuICAvLyBIZWlnaHQgYW5kIHdpZHRoIG9mIHRoZSBnb2FsIGFuZCBvYnN0YWNsZXMuXG4gIEJvdW5jZS5NQVJLRVJfSEVJR0hUID0gNDM7XG4gIEJvdW5jZS5NQVJLRVJfV0lEVEggPSA1MDtcblxuICBCb3VuY2UuTUFaRV9XSURUSCA9IEJvdW5jZS5TUVVBUkVfU0laRSAqIEJvdW5jZS5DT0xTO1xuICBCb3VuY2UuTUFaRV9IRUlHSFQgPSBCb3VuY2UuU1FVQVJFX1NJWkUgKiBCb3VuY2UuUk9XUztcbiAgQm91bmNlLlBBVEhfV0lEVEggPSBCb3VuY2UuU1FVQVJFX1NJWkUgLyAzO1xufTtcblxuXG52YXIgaW5pdFdhbGxNYXAgPSBmdW5jdGlvbigpIHtcbiAgQm91bmNlLndhbGxNYXAgPSBuZXcgQXJyYXkoQm91bmNlLlJPV1MpO1xuICBmb3IgKHZhciB5ID0gMDsgeSA8IEJvdW5jZS5ST1dTOyB5KyspIHtcbiAgICBCb3VuY2Uud2FsbE1hcFt5XSA9IG5ldyBBcnJheShCb3VuY2UuQ09MUyk7XG4gIH1cbn07XG5cbi8qKlxuICogUElEcyBvZiBhc3luYyB0YXNrcyBjdXJyZW50bHkgZXhlY3V0aW5nLlxuICovXG52YXIgdGltZW91dExpc3QgPSByZXF1aXJlKCcuLi90aW1lb3V0TGlzdCcpO1xuXG4vLyBNYXAgZWFjaCBwb3NzaWJsZSBzaGFwZSB0byBhIHNwcml0ZS5cbi8vIElucHV0OiBCaW5hcnkgc3RyaW5nIHJlcHJlc2VudGluZyBDZW50cmUvTm9ydGgvRWFzdC9Tb3V0aC9XZXN0IHNxdWFyZXMuXG4vLyBPdXRwdXQ6IFt4LCB5XSBjb29yZGluYXRlcyBvZiBlYWNoIHRpbGUncyBzcHJpdGUgaW4gdGlsZXMucG5nLlxudmFyIFdBTExfVElMRV9TSEFQRVMgPSB7XG4gICcxWDEwMSc6IFsxLCAwXSwgIC8vIEhvcml6IHRvcFxuICAnMTFYMTAnOiBbMiwgMV0sICAvLyBWZXJ0IHJpZ2h0XG4gICcxMVhYMCc6IFsyLCAxXSwgIC8vIEJvdHRvbSByaWdodCBjb3JuZXJcbiAgJzFYWDExJzogWzIsIDBdLCAgLy8gVG9wIHJpZ2h0IGNvcm5lclxuICAnMVgwMDEnOiBbMSwgMF0sICAvLyBUb3AgaG9yaXogcmlnaHQgZW5kXG4gICcxWDEwMCc6IFsxLCAwXSwgIC8vIFRvcCBob3JpeiBsZWZ0IGVuZFxuICAnMTEwMVgnOiBbMCwgMV0sICAvLyBWZXJ0IGxlZnRcbiAgJzExMFhYJzogWzAsIDFdLCAgLy8gQm90dG9tIGxlZnQgY29ybmVyXG4gICcxWDExWCc6IFswLCAwXSwgIC8vIFRvcCBsZWZ0IGNvcm5lclxuICAnbnVsbDAnOiBbMSwgMV0gICAvLyBFbXB0eVxufTtcblxudmFyIEdPQUxfVElMRV9TSEFQRVMgPSB7XG4gICcxWDEwMSc6IFsyLCAzXSwgIC8vIEhvcml6IHRvcFxuICAnMVhYMTEnOiBbMywgM10sICAvLyBUb3AgcmlnaHQgY29ybmVyXG4gICcxWDAwMSc6IFszLCAzXSwgIC8vIFRvcCBob3JpeiByaWdodCBlbmRcbiAgJzFYMTFYJzogWzAsIDJdLCAgLy8gVG9wIGxlZnQgY29ybmVyXG4gICcxWDEwMCc6IFswLCAyXSwgIC8vIFRvcCBob3JpeiBsZWZ0IGVuZFxuICAnbnVsbDAnOiBbMSwgMV0gICAvLyBFbXB0eVxufTtcblxuLy8gUmV0dXJuIGEgdmFsdWUgb2YgJzAnIGlmIHRoZSBzcGVjaWZpZWQgc3F1YXJlIGlzIG5vdCBhIHdhbGwsICcxJyBmb3Jcbi8vIGEgd2FsbCwgJ1gnIGZvciBvdXQgb2YgYm91bmRzXG52YXIgd2FsbE5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgcmV0dXJuICgoQm91bmNlLm1hcFt5XSA9PT0gdW5kZWZpbmVkKSB8fFxuICAgICAgICAgIChCb3VuY2UubWFwW3ldW3hdID09PSB1bmRlZmluZWQpKSA/ICdYJyA6XG4gICAgICAgICAgICAoQm91bmNlLm1hcFt5XVt4XSAmIFNxdWFyZVR5cGUuV0FMTCkgPyAnMScgOiAnMCc7XG59O1xuXG4vLyBSZXR1cm4gYSB2YWx1ZSBvZiAnMCcgaWYgdGhlIHNwZWNpZmllZCBzcXVhcmUgaXMgbm90IGEgd2FsbCwgJzEnIGZvclxuLy8gYSB3YWxsLCAnWCcgZm9yIG91dCBvZiBib3VuZHNcbnZhciBnb2FsTm9ybWFsaXplID0gZnVuY3Rpb24oeCwgeSkge1xuICByZXR1cm4gKChCb3VuY2UubWFwW3ldID09PSB1bmRlZmluZWQpIHx8XG4gICAgICAgICAgKEJvdW5jZS5tYXBbeV1beF0gPT09IHVuZGVmaW5lZCkpID8gJ1gnIDpcbiAgICAgICAgICAgIChCb3VuY2UubWFwW3ldW3hdICYgU3F1YXJlVHlwZS5HT0FMKSA/ICcxJyA6ICcwJztcbn07XG5cbi8vIENyZWF0ZSBiYWxsIGVsZW1lbnRzXG5Cb3VuY2UuY3JlYXRlQmFsbEVsZW1lbnRzID0gZnVuY3Rpb24gKGkpIHtcbiAgdmFyIHN2ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdCb3VuY2UnKTtcbiAgLy8gQmFsbCdzIGNsaXBQYXRoIGVsZW1lbnQsIHdob3NlICh4LCB5KSBpcyByZXNldCBieSBCb3VuY2UuZGlzcGxheUJhbGxcbiAgdmFyIGJhbGxDbGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnY2xpcFBhdGgnKTtcbiAgYmFsbENsaXAuc2V0QXR0cmlidXRlKCdpZCcsICdiYWxsQ2xpcFBhdGgnICsgaSk7XG4gIHZhciBiYWxsQ2xpcFJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdyZWN0Jyk7XG4gIGJhbGxDbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2JhbGxDbGlwUmVjdCcgKyBpKTtcbiAgYmFsbENsaXBSZWN0LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBCb3VuY2UuUEVHTUFOX1dJRFRIKTtcbiAgYmFsbENsaXBSZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLlBFR01BTl9IRUlHSFQpO1xuICBiYWxsQ2xpcC5hcHBlbmRDaGlsZChiYWxsQ2xpcFJlY3QpO1xuICBzdmcuYXBwZW5kQ2hpbGQoYmFsbENsaXApO1xuXG4gIC8vIEFkZCBiYWxsLlxuICB2YXIgYmFsbEljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICBiYWxsSWNvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2JhbGwnICsgaSk7XG4gIGJhbGxJY29uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBCb3VuY2UuYmFsbEltYWdlKTtcbiAgYmFsbEljb24uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBCb3VuY2UuUEVHTUFOX0hFSUdIVCk7XG4gIGJhbGxJY29uLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBCb3VuY2UuUEVHTUFOX1dJRFRIKTtcbiAgYmFsbEljb24uc2V0QXR0cmlidXRlKCdjbGlwLXBhdGgnLCAndXJsKCNiYWxsQ2xpcFBhdGgnICsgaSArICcpJyk7XG4gIHN2Zy5hcHBlbmRDaGlsZChiYWxsSWNvbik7XG59O1xuXG4vLyBEZWxldGUgYmFsbCBlbGVtZW50c1xuQm91bmNlLmRlbGV0ZUJhbGxFbGVtZW50cyA9IGZ1bmN0aW9uIChpKSB7XG4gIHZhciBiYWxsQ2xpcFBhdGggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFsbENsaXBQYXRoJyArIGkpO1xuICBiYWxsQ2xpcFBhdGgucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChiYWxsQ2xpcFBhdGgpO1xuXG4gIHZhciBiYWxsSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWxsJyArIGkpO1xuICBiYWxsSWNvbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGJhbGxJY29uKTtcbn07XG5cbnZhciBkcmF3TWFwID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnQm91bmNlJyk7XG4gIHZhciBpLCB4LCB5LCBrLCB0aWxlO1xuXG4gIC8vIEFkanVzdCBvdXRlciBlbGVtZW50IHNpemUuXG4gIHN2Zy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgQm91bmNlLk1BWkVfV0lEVEgpO1xuICBzdmcuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBCb3VuY2UuTUFaRV9IRUlHSFQpO1xuXG4gIC8vIEF0dGFjaCBkcmFnIGhhbmRsZXIuXG4gIHZhciBoYW1tZXJTdmcgPSBuZXcgSGFtbWVyKHN2Zyk7XG4gIGhhbW1lclN2Zy5vbihcImRyYWdcIiwgQm91bmNlLm9uU3ZnRHJhZyk7XG5cbiAgLy8gQWRqdXN0IHZpc3VhbGl6YXRpb25Db2x1bW4gd2lkdGguXG4gIHZhciB2aXN1YWxpemF0aW9uQ29sdW1uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25Db2x1bW4nKTtcbiAgdmlzdWFsaXphdGlvbkNvbHVtbi5zdHlsZS53aWR0aCA9IEJvdW5jZS5NQVpFX1dJRFRIICsgJ3B4JztcblxuICBpZiAoc2tpbi5iYWNrZ3JvdW5kKSB7XG4gICAgdGlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2ltYWdlJyk7XG4gICAgdGlsZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uYmFja2dyb3VuZCk7XG4gICAgdGlsZS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2JhY2tncm91bmQnKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLk1BWkVfSEVJR0hUKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBCb3VuY2UuTUFaRV9XSURUSCk7XG4gICAgdGlsZS5zZXRBdHRyaWJ1dGUoJ3gnLCAwKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZSgneScsIDApO1xuICAgIHN2Zy5hcHBlbmRDaGlsZCh0aWxlKTtcbiAgfVxuXG4gIC8vIERyYXcgdGhlIHRpbGVzIG1ha2luZyB1cCB0aGUgbWF6ZSBtYXAuXG5cbiAgLy8gQ29tcHV0ZSBhbmQgZHJhdyB0aGUgdGlsZSBmb3IgZWFjaCBzcXVhcmUuXG4gIHZhciB0aWxlSWQgPSAwO1xuICBmb3IgKHkgPSAwOyB5IDwgQm91bmNlLlJPV1M7IHkrKykge1xuICAgIGZvciAoeCA9IDA7IHggPCBCb3VuY2UuQ09MUzsgeCsrKSB7XG4gICAgICB2YXIgbGVmdDtcbiAgICAgIHZhciB0b3A7XG4gICAgICB2YXIgaW1hZ2U7XG4gICAgICAvLyBDb21wdXRlIHRoZSB0aWxlIGluZGV4LlxuICAgICAgdGlsZSA9IHdhbGxOb3JtYWxpemUoeCwgeSkgK1xuICAgICAgICAgIHdhbGxOb3JtYWxpemUoeCwgeSAtIDEpICsgIC8vIE5vcnRoLlxuICAgICAgICAgIHdhbGxOb3JtYWxpemUoeCArIDEsIHkpICsgIC8vIEVhc3QuXG4gICAgICAgICAgd2FsbE5vcm1hbGl6ZSh4LCB5ICsgMSkgKyAgLy8gU291dGguXG4gICAgICAgICAgd2FsbE5vcm1hbGl6ZSh4IC0gMSwgeSk7ICAgLy8gV2VzdC5cblxuICAgICAgLy8gRHJhdyB0aGUgdGlsZS5cbiAgICAgIGlmIChXQUxMX1RJTEVfU0hBUEVTW3RpbGVdKSB7XG4gICAgICAgIGxlZnQgPSBXQUxMX1RJTEVfU0hBUEVTW3RpbGVdWzBdO1xuICAgICAgICB0b3AgPSBXQUxMX1RJTEVfU0hBUEVTW3RpbGVdWzFdO1xuICAgICAgICBpbWFnZSA9IHNraW4udGlsZXM7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUgdGlsZSBpbmRleC5cbiAgICAgICAgdGlsZSA9IGdvYWxOb3JtYWxpemUoeCwgeSkgK1xuICAgICAgICAgICAgZ29hbE5vcm1hbGl6ZSh4LCB5IC0gMSkgKyAgLy8gTm9ydGguXG4gICAgICAgICAgICBnb2FsTm9ybWFsaXplKHggKyAxLCB5KSArICAvLyBFYXN0LlxuICAgICAgICAgICAgZ29hbE5vcm1hbGl6ZSh4LCB5ICsgMSkgKyAgLy8gU291dGguXG4gICAgICAgICAgICBnb2FsTm9ybWFsaXplKHggLSAxLCB5KTsgICAvLyBXZXN0LlxuXG4gICAgICAgIGlmICghR09BTF9USUxFX1NIQVBFU1t0aWxlXSkge1xuICAgICAgICAgIC8vIEVtcHR5IHNxdWFyZS4gIFVzZSBudWxsMC5cbiAgICAgICAgICB0aWxlID0gJ251bGwwJztcbiAgICAgICAgfVxuICAgICAgICBsZWZ0ID0gR09BTF9USUxFX1NIQVBFU1t0aWxlXVswXTtcbiAgICAgICAgdG9wID0gR09BTF9USUxFX1NIQVBFU1t0aWxlXVsxXTtcbiAgICAgICAgaW1hZ2UgPSBza2luLmdvYWxUaWxlcztcbiAgICAgIH1cbiAgICAgIGlmICh0aWxlICE9ICdudWxsMCcpIHtcbiAgICAgICAgLy8gVGlsZSdzIGNsaXBQYXRoIGVsZW1lbnQuXG4gICAgICAgIHZhciB0aWxlQ2xpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2NsaXBQYXRoJyk7XG4gICAgICAgIHRpbGVDbGlwLnNldEF0dHJpYnV0ZSgnaWQnLCAndGlsZUNsaXBQYXRoJyArIHRpbGVJZCk7XG4gICAgICAgIHZhciB0aWxlQ2xpcFJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdyZWN0Jyk7XG4gICAgICAgIHRpbGVDbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgQm91bmNlLlNRVUFSRV9TSVpFKTtcbiAgICAgICAgdGlsZUNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLlNRVUFSRV9TSVpFKTtcblxuICAgICAgICB0aWxlQ2xpcFJlY3Quc2V0QXR0cmlidXRlKCd4JywgeCAqIEJvdW5jZS5TUVVBUkVfU0laRSk7XG4gICAgICAgIHRpbGVDbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ3knLCB5ICogQm91bmNlLlNRVUFSRV9TSVpFKTtcblxuICAgICAgICB0aWxlQ2xpcC5hcHBlbmRDaGlsZCh0aWxlQ2xpcFJlY3QpO1xuICAgICAgICBzdmcuYXBwZW5kQ2hpbGQodGlsZUNsaXApO1xuICAgICAgICAvLyBUaWxlIHNwcml0ZS5cbiAgICAgICAgdmFyIHRpbGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICAgICAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdpZCcsICd0aWxlRWxlbWVudCcgKyB0aWxlSWQpO1xuICAgICAgICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UpO1xuICAgICAgICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIEJvdW5jZS5TUVVBUkVfU0laRSAqIDQpO1xuICAgICAgICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgQm91bmNlLlNRVUFSRV9TSVpFICogNSk7XG4gICAgICAgIHRpbGVFbGVtZW50LnNldEF0dHJpYnV0ZSgnY2xpcC1wYXRoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd1cmwoI3RpbGVDbGlwUGF0aCcgKyB0aWxlSWQgKyAnKScpO1xuICAgICAgICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3gnLCAoeCAtIGxlZnQpICogQm91bmNlLlNRVUFSRV9TSVpFKTtcbiAgICAgICAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKCd5JywgKHkgLSB0b3ApICogQm91bmNlLlNRVUFSRV9TSVpFKTtcbiAgICAgICAgc3ZnLmFwcGVuZENoaWxkKHRpbGVFbGVtZW50KTtcbiAgICAgICAgLy8gVGlsZSBhbmltYXRpb25cbiAgICAgICAgdmFyIHRpbGVBbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhbmltYXRlJyk7XG4gICAgICAgIHRpbGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCdpZCcsICd0aWxlQW5pbWF0aW9uJyArIHRpbGVJZCk7XG4gICAgICAgIHRpbGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGVUeXBlJywgJ0NTUycpO1xuICAgICAgICB0aWxlQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlTmFtZScsICdvcGFjaXR5Jyk7XG4gICAgICAgIHRpbGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCdmcm9tJywgMSk7XG4gICAgICAgIHRpbGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCd0bycsIDApO1xuICAgICAgICB0aWxlQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnZHVyJywgJzFzJyk7XG4gICAgICAgIHRpbGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCdiZWdpbicsICdpbmRlZmluaXRlJyk7XG4gICAgICAgIHRpbGVFbGVtZW50LmFwcGVuZENoaWxkKHRpbGVBbmltYXRpb24pO1xuICAgICAgfVxuXG4gICAgICB0aWxlSWQrKztcbiAgICB9XG4gIH1cblxuICBCb3VuY2UuYmFsbEltYWdlID0gc2tpbi5iYWxsO1xuICBmb3IgKGkgPSAwOyBpIDwgQm91bmNlLmJhbGxDb3VudDsgaSsrKSB7XG4gICAgQm91bmNlLmNyZWF0ZUJhbGxFbGVtZW50cyhpKTtcbiAgfVxuXG4gIGlmIChCb3VuY2UucGFkZGxlU3RhcnRfKSB7XG4gICAgLy8gUGFkZGxlJ3MgY2xpcFBhdGggZWxlbWVudCwgd2hvc2UgKHgsIHkpIGlzIHJlc2V0IGJ5IEJvdW5jZS5kaXNwbGF5UGFkZGxlXG4gICAgdmFyIHBhZGRsZUNsaXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdjbGlwUGF0aCcpO1xuICAgIHBhZGRsZUNsaXAuc2V0QXR0cmlidXRlKCdpZCcsICdwYWRkbGVDbGlwUGF0aCcpO1xuICAgIHZhciBwYWRkbGVDbGlwUmVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3JlY3QnKTtcbiAgICBwYWRkbGVDbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3BhZGRsZUNsaXBSZWN0Jyk7XG4gICAgcGFkZGxlQ2xpcFJlY3Quc2V0QXR0cmlidXRlKCd3aWR0aCcsIEJvdW5jZS5QRUdNQU5fV0lEVEgpO1xuICAgIHBhZGRsZUNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLlBFR01BTl9IRUlHSFQpO1xuICAgIHBhZGRsZUNsaXAuYXBwZW5kQ2hpbGQocGFkZGxlQ2xpcFJlY3QpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChwYWRkbGVDbGlwKTtcblxuICAgIC8vIEFkZCBwYWRkbGUuXG4gICAgdmFyIHBhZGRsZUljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICAgIHBhZGRsZUljb24uc2V0QXR0cmlidXRlKCdpZCcsICdwYWRkbGUnKTtcbiAgICBwYWRkbGVJY29uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5wYWRkbGUpO1xuICAgIHBhZGRsZUljb24uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBCb3VuY2UuUEVHTUFOX0hFSUdIVCk7XG4gICAgcGFkZGxlSWNvbi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgQm91bmNlLlBFR01BTl9XSURUSCk7XG4gICAgcGFkZGxlSWNvbi5zZXRBdHRyaWJ1dGUoJ2NsaXAtcGF0aCcsICd1cmwoI3BhZGRsZUNsaXBQYXRoKScpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChwYWRkbGVJY29uKTtcbiAgfVxuXG4gIGlmIChCb3VuY2UucGFkZGxlRmluaXNoXykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBCb3VuY2UucGFkZGxlRmluaXNoQ291bnQ7IGkrKykge1xuICAgICAgLy8gQWRkIGZpbmlzaCBtYXJrZXJzLlxuICAgICAgdmFyIHBhZGRsZUZpbmlzaE1hcmtlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2ltYWdlJyk7XG4gICAgICBwYWRkbGVGaW5pc2hNYXJrZXIuc2V0QXR0cmlidXRlKCdpZCcsICdwYWRkbGVmaW5pc2gnICsgaSk7XG4gICAgICBwYWRkbGVGaW5pc2hNYXJrZXIuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLmdvYWwpO1xuICAgICAgcGFkZGxlRmluaXNoTWFya2VyLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLk1BUktFUl9IRUlHSFQpO1xuICAgICAgcGFkZGxlRmluaXNoTWFya2VyLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBCb3VuY2UuTUFSS0VSX1dJRFRIKTtcbiAgICAgIHN2Zy5hcHBlbmRDaGlsZChwYWRkbGVGaW5pc2hNYXJrZXIpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChCb3VuY2UuYmFsbEZpbmlzaF8pIHtcbiAgICAvLyBBZGQgYmFsbCBmaW5pc2ggbWFya2VyLlxuICAgIHZhciBiYWxsRmluaXNoTWFya2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICBiYWxsRmluaXNoTWFya2VyLnNldEF0dHJpYnV0ZSgnaWQnLCAnYmFsbGZpbmlzaCcpO1xuICAgIGJhbGxGaW5pc2hNYXJrZXIuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5nb2FsKTtcbiAgICBiYWxsRmluaXNoTWFya2VyLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLk1BUktFUl9IRUlHSFQpO1xuICAgIGJhbGxGaW5pc2hNYXJrZXIuc2V0QXR0cmlidXRlKCd3aWR0aCcsIEJvdW5jZS5NQVJLRVJfV0lEVEgpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChiYWxsRmluaXNoTWFya2VyKTtcbiAgfVxuXG4gIHZhciBzY29yZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3RleHQnKTtcbiAgc2NvcmUuc2V0QXR0cmlidXRlKCdpZCcsICdzY29yZScpO1xuICBzY29yZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2JvdW5jZS1zY29yZScpO1xuICBzY29yZS5zZXRBdHRyaWJ1dGUoJ3gnLCBCb3VuY2UuTUFaRV9XSURUSCAvIDIpO1xuICBzY29yZS5zZXRBdHRyaWJ1dGUoJ3knLCA2MCk7XG4gIHNjb3JlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcwJykpO1xuICBzY29yZS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIHN2Zy5hcHBlbmRDaGlsZChzY29yZSk7XG5cbiAgLy8gQWRkIHdhbGwgaGl0dGluZyBhbmltYXRpb25cbiAgaWYgKHNraW4uaGl0dGluZ1dhbGxBbmltYXRpb24pIHtcbiAgICB2YXIgd2FsbEFuaW1hdGlvbkljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICAgIHdhbGxBbmltYXRpb25JY29uLnNldEF0dHJpYnV0ZSgnaWQnLCAnd2FsbEFuaW1hdGlvbicpO1xuICAgIHdhbGxBbmltYXRpb25JY29uLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLlNRVUFSRV9TSVpFKTtcbiAgICB3YWxsQW5pbWF0aW9uSWNvbi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgQm91bmNlLlNRVUFSRV9TSVpFKTtcbiAgICB3YWxsQW5pbWF0aW9uSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKHdhbGxBbmltYXRpb25JY29uKTtcbiAgfVxuXG4gIC8vIEFkZCBvYnN0YWNsZXMuXG4gIHZhciBvYnNJZCA9IDA7XG4gIGZvciAoeSA9IDA7IHkgPCBCb3VuY2UuUk9XUzsgeSsrKSB7XG4gICAgZm9yICh4ID0gMDsgeCA8IEJvdW5jZS5DT0xTOyB4KyspIHtcbiAgICAgIGlmIChCb3VuY2UubWFwW3ldW3hdID09IFNxdWFyZVR5cGUuT0JTVEFDTEUpIHtcbiAgICAgICAgdmFyIG9ic0ljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICAgICAgICBvYnNJY29uLnNldEF0dHJpYnV0ZSgnaWQnLCAnb2JzdGFjbGUnICsgb2JzSWQpO1xuICAgICAgICBvYnNJY29uLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLk1BUktFUl9IRUlHSFQgKiBza2luLm9ic3RhY2xlU2NhbGUpO1xuICAgICAgICBvYnNJY29uLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBCb3VuY2UuTUFSS0VSX1dJRFRIICogc2tpbi5vYnN0YWNsZVNjYWxlKTtcbiAgICAgICAgb2JzSWNvbi5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgICAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJywgc2tpbi5vYnN0YWNsZSk7XG4gICAgICAgIG9ic0ljb24uc2V0QXR0cmlidXRlKCd4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlLlNRVUFSRV9TSVpFICogKHggKyAwLjUpIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzSWNvbi5nZXRBdHRyaWJ1dGUoJ3dpZHRoJykgLyAyKTtcbiAgICAgICAgb2JzSWNvbi5zZXRBdHRyaWJ1dGUoJ3knLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCb3VuY2UuU1FVQVJFX1NJWkUgKiAoeSArIDAuOSkgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNJY29uLmdldEF0dHJpYnV0ZSgnaGVpZ2h0JykpO1xuICAgICAgICBzdmcuYXBwZW5kQ2hpbGQob2JzSWNvbik7XG4gICAgICB9XG4gICAgICArK29ic0lkO1xuICAgIH1cbiAgfVxufTtcblxuQm91bmNlLmNhbGNEaXN0YW5jZSA9IGZ1bmN0aW9uKHhEaXN0LCB5RGlzdCkge1xuICByZXR1cm4gTWF0aC5zcXJ0KHhEaXN0ICogeERpc3QgKyB5RGlzdCAqIHlEaXN0KTtcbn07XG5cbnZhciBlc3NlbnRpYWxseUVxdWFsID0gZnVuY3Rpb24oZmxvYXQxLCBmbG9hdDIsIG9wdF92YXJpYW5jZSkge1xuICB2YXIgdmFyaWFuY2UgPSBvcHRfdmFyaWFuY2UgfHwgMC4wMTtcbiAgcmV0dXJuIChNYXRoLmFicyhmbG9hdDEgLSBmbG9hdDIpIDwgdmFyaWFuY2UpO1xufTtcblxuQm91bmNlLmlzQmFsbE91dE9mQm91bmRzID0gZnVuY3Rpb24oaSkge1xuICBpZiAoQm91bmNlLmJhbGxYW2ldIDwgMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChCb3VuY2UuYmFsbFhbaV0gPiBCb3VuY2UuQ09MUyAtIDEpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoQm91bmNlLmJhbGxZW2ldIDwgdGlsZXMuWV9UT1BfQk9VTkRBUlkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoQm91bmNlLmJhbGxZW2ldID4gQm91bmNlLlJPV1MgLSAxKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBAcGFyYW0gc2NvcGUgT2JqZWN0IDogIFRoZSBzY29wZSBpbiB3aGljaCB0byBleGVjdXRlIHRoZSBkZWxlZ2F0ZWQgZnVuY3Rpb24uXG4gKiBAcGFyYW0gZnVuYyBGdW5jdGlvbiA6IFRoZSBmdW5jdGlvbiB0byBleGVjdXRlXG4gKiBAcGFyYW0gZGF0YSBPYmplY3Qgb3IgQXJyYXkgOiBUaGUgZGF0YSB0byBwYXNzIHRvIHRoZSBmdW5jdGlvbi4gSWYgdGhlIGZ1bmN0aW9uIGlzIGFsc28gcGFzc2VkIGFyZ3VtZW50cywgdGhlIGRhdGEgaXMgYXBwZW5kZWQgdG8gdGhlIGFyZ3VtZW50cyBsaXN0LiBJZiB0aGUgZGF0YSBpcyBhbiBBcnJheSwgZWFjaCBpdGVtIGlzIGFwcGVuZGVkIGFzIGEgbmV3IGFyZ3VtZW50LlxuICovXG52YXIgZGVsZWdhdGUgPSBmdW5jdGlvbihzY29wZSwgZnVuYywgZGF0YSlcbntcbiAgcmV0dXJuIGZ1bmN0aW9uKClcbiAge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGFyZ3VtZW50cykuY29uY2F0KGRhdGEpO1xuICAgIGZ1bmMuYXBwbHkoc2NvcGUsIGFyZ3MpO1xuICB9O1xufTtcblxuLyoqXG4gKiBXZSB3YW50IHRvIHN3YWxsb3cgZXhjZXB0aW9ucyB3aGVuIGV4ZWN1dGluZyB1c2VyIGdlbmVyYXRlZCBjb2RlLiBUaGlzIHByb3ZpZGVzXG4gKiBhIHNpbmdsZSBwbGFjZSB0byBkbyBzby5cbiAqL1xuQm91bmNlLmNhbGxVc2VyR2VuZXJhdGVkQ29kZSA9IGZ1bmN0aW9uIChmbikge1xuICB0cnkge1xuICAgIGZuLmNhbGwoQm91bmNlLCBzdHVkaW9BcHAsIGFwaSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBzd2FsbG93IGVycm9yLiBzaG91bGQgd2UgYWxzbyBsb2cgdGhpcyBzb21ld2hlcmU/XG4gICAgaWYgKGNvbnNvbGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIH1cbiAgfVxufTtcblxuXG5Cb3VuY2Uub25UaWNrID0gZnVuY3Rpb24oKSB7XG4gIEJvdW5jZS50aWNrQ291bnQrKztcblxuICBpZiAoQm91bmNlLnRpY2tDb3VudCA9PT0gMSkge1xuICAgIEJvdW5jZS5jYWxsVXNlckdlbmVyYXRlZENvZGUoQm91bmNlLndoZW5HYW1lU3RhcnRzKTtcbiAgfVxuXG4gIC8vIFJ1biBrZXkgZXZlbnQgaGFuZGxlcnMgZm9yIGFueSBrZXlzIHRoYXQgYXJlIGRvd246XG4gIGZvciAodmFyIGtleSBpbiBLZXlDb2Rlcykge1xuICAgIGlmIChCb3VuY2Uua2V5U3RhdGVbS2V5Q29kZXNba2V5XV0gJiZcbiAgICAgICAgQm91bmNlLmtleVN0YXRlW0tleUNvZGVzW2tleV1dID09IFwia2V5ZG93blwiKSB7XG4gICAgICBzd2l0Y2ggKEtleUNvZGVzW2tleV0pIHtcbiAgICAgICAgY2FzZSBLZXlDb2Rlcy5MRUZUOlxuICAgICAgICAgIEJvdW5jZS5jYWxsVXNlckdlbmVyYXRlZENvZGUoQm91bmNlLndoZW5MZWZ0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlDb2Rlcy5VUDpcbiAgICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuVXApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleUNvZGVzLlJJR0hUOlxuICAgICAgICAgIEJvdW5jZS5jYWxsVXNlckdlbmVyYXRlZENvZGUoQm91bmNlLndoZW5SaWdodCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5Q29kZXMuRE9XTjpcbiAgICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuRG93bik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgYnRuIGluIEFycm93SWRzKSB7XG4gICAgaWYgKEJvdW5jZS5idG5TdGF0ZVtBcnJvd0lkc1tidG5dXSAmJlxuICAgICAgICBCb3VuY2UuYnRuU3RhdGVbQXJyb3dJZHNbYnRuXV0gPT0gQnV0dG9uU3RhdGUuRE9XTikge1xuICAgICAgc3dpdGNoIChBcnJvd0lkc1tidG5dKSB7XG4gICAgICAgIGNhc2UgQXJyb3dJZHMuTEVGVDpcbiAgICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuTGVmdCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQXJyb3dJZHMuVVA6XG4gICAgICAgICAgQm91bmNlLmNhbGxVc2VyR2VuZXJhdGVkQ29kZShCb3VuY2Uud2hlblVwKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBBcnJvd0lkcy5SSUdIVDpcbiAgICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuUmlnaHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEFycm93SWRzLkRPV046XG4gICAgICAgICAgQm91bmNlLmNhbGxVc2VyR2VuZXJhdGVkQ29kZShCb3VuY2Uud2hlbkRvd24pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGdlc3R1cmUgaW4gQm91bmNlLmdlc3R1cmVzT2JzZXJ2ZWQpIHtcbiAgICBzd2l0Y2ggKGdlc3R1cmUpIHtcbiAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuTGVmdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndXAnOlxuICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuVXApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgQm91bmNlLmNhbGxVc2VyR2VuZXJhdGVkQ29kZShCb3VuY2Uud2hlblJpZ2h0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgQm91bmNlLmNhbGxVc2VyR2VuZXJhdGVkQ29kZShCb3VuY2Uud2hlbkRvd24pO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKDAgPT09IEJvdW5jZS5nZXN0dXJlc09ic2VydmVkW2dlc3R1cmVdLS0pIHtcbiAgICAgIGRlbGV0ZSBCb3VuY2UuZ2VzdHVyZXNPYnNlcnZlZFtnZXN0dXJlXTtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IEJvdW5jZS5iYWxsQ291bnQ7IGkrKykge1xuICAgIHZhciBkZWx0YVggPSBCb3VuY2UuYmFsbFNwZWVkW2ldICogTWF0aC5zaW4oQm91bmNlLmJhbGxEaXJbaV0pO1xuICAgIHZhciBkZWx0YVkgPSAtQm91bmNlLmJhbGxTcGVlZFtpXSAqIE1hdGguY29zKEJvdW5jZS5iYWxsRGlyW2ldKTtcblxuICAgIHZhciB3YXNYT0sgPSBCb3VuY2UuYmFsbFhbaV0gPj0gMCAmJiBCb3VuY2UuYmFsbFhbaV0gPD0gQm91bmNlLkNPTFMgLSAxO1xuICAgIHZhciB3YXNZT0sgPSBCb3VuY2UuYmFsbFlbaV0gPj0gdGlsZXMuWV9UT1BfQk9VTkRBUlk7XG4gICAgdmFyIHdhc1lBYm92ZUJvdHRvbSA9IEJvdW5jZS5iYWxsWVtpXSA8PSBCb3VuY2UuUk9XUyAtIDE7XG5cbiAgICBCb3VuY2UuYmFsbFhbaV0gKz0gZGVsdGFYO1xuICAgIEJvdW5jZS5iYWxsWVtpXSArPSBkZWx0YVk7XG5cbiAgICBpZiAoMCA9PT0gKEJvdW5jZS5iYWxsRmxhZ3NbaV0gJlxuICAgICAgICAgICAgICAgKEJvdW5jZS5CYWxsRmxhZ3MuTUlTU0VEX1BBRERMRSB8IEJvdW5jZS5CYWxsRmxhZ3MuSU5fR09BTCkpKSB7XG4gICAgICB2YXIgbm93WE9LID0gQm91bmNlLmJhbGxYW2ldID49IDAgJiYgQm91bmNlLmJhbGxYW2ldIDw9IEJvdW5jZS5DT0xTIC0gMTtcbiAgICAgIHZhciBub3dZT0sgPSBCb3VuY2UuYmFsbFlbaV0gPj0gdGlsZXMuWV9UT1BfQk9VTkRBUlk7XG4gICAgICB2YXIgbm93WUFib3ZlQm90dG9tID0gQm91bmNlLmJhbGxZW2ldIDw9IEJvdW5jZS5ST1dTIC0gMTtcblxuICAgICAgaWYgKHdhc1lPSyAmJiB3YXNYT0sgJiYgIW5vd1hPSykge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiY2FsbGluZyB3aGVuV2FsbENvbGxpZGVkIGZvciBiYWxsIFwiICsgaSArXG4gICAgICAgIC8vXCIgeD1cIiArIEJvdW5jZS5iYWxsWFtpXSArIFwiIHk9XCIgKyBCb3VuY2UuYmFsbFlbaV0pO1xuICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuV2FsbENvbGxpZGVkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHdhc1hPSyAmJiB3YXNZT0sgJiYgIW5vd1lPSykge1xuICAgICAgICBpZiAoQm91bmNlLm1hcFswXVtNYXRoLnJvdW5kKEJvdW5jZS5iYWxsWFtpXSldICYgU3F1YXJlVHlwZS5HT0FMKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhcImNhbGxpbmcgd2hlbkJhbGxJbkdvYWwgZm9yIGJhbGwgXCIgKyBpICtcbiAgICAgICAgICAvL1wiIHg9XCIgKyBCb3VuY2UuYmFsbFhbaV0gKyBcIiB5PVwiICsgQm91bmNlLmJhbGxZW2ldKTtcbiAgICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuQmFsbEluR29hbCk7XG4gICAgICAgICAgQm91bmNlLmJhbGxGbGFnc1tpXSB8PSBCb3VuY2UuQmFsbEZsYWdzLklOX0dPQUw7XG4gICAgICAgICAgdGltZW91dExpc3Quc2V0VGltZW91dChcbiAgICAgICAgICAgICAgZGVsZWdhdGUodGhpcywgQm91bmNlLm1vdmVCYWxsT2Zmc2NyZWVuLCBpKSxcbiAgICAgICAgICAgICAgMTAwMCk7XG4gICAgICAgICAgaWYgKEJvdW5jZS5yZXNwYXduQmFsbHMpIHtcbiAgICAgICAgICAgIEJvdW5jZS5sYXVuY2hCYWxsKGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiY2FsbGluZyB3aGVuV2FsbENvbGxpZGVkIGZvciBiYWxsIFwiICsgaSArXG4gICAgICAgICAgLy9cIiB4PVwiICsgQm91bmNlLmJhbGxYW2ldICsgXCIgeT1cIiArIEJvdW5jZS5iYWxsWVtpXSk7XG4gICAgICAgICAgQm91bmNlLmNhbGxVc2VyR2VuZXJhdGVkQ29kZShCb3VuY2Uud2hlbldhbGxDb2xsaWRlZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHhQYWRkbGVCYWxsID0gQm91bmNlLmJhbGxYW2ldIC0gQm91bmNlLnBhZGRsZVg7XG4gICAgICB2YXIgeVBhZGRsZUJhbGwgPSBCb3VuY2UuYmFsbFlbaV0gLSBCb3VuY2UucGFkZGxlWTtcbiAgICAgIHZhciBkaXN0UGFkZGxlQmFsbCA9IEJvdW5jZS5jYWxjRGlzdGFuY2UoeFBhZGRsZUJhbGwsIHlQYWRkbGVCYWxsKTtcblxuICAgICAgaWYgKGRpc3RQYWRkbGVCYWxsIDwgdGlsZXMuUEFERExFX0JBTExfQ09MTElERV9ESVNUQU5DRSkge1xuICAgICAgICAvLyBwYWRkbGUgYmFsbCBjb2xsaXNpb25cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcImNhbGxpbmcgd2hlblBhZGRsZUNvbGxpZGVkIGZvciBiYWxsIFwiICsgaSArXG4gICAgICAgIC8vXCIgeD1cIiArIEJvdW5jZS5iYWxsWFtpXSArIFwiIHk9XCIgKyBCb3VuY2UuYmFsbFlbaV0pO1xuICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuUGFkZGxlQ29sbGlkZWQpO1xuICAgICAgfSBlbHNlIGlmICh3YXNZQWJvdmVCb3R0b20gJiYgIW5vd1lBYm92ZUJvdHRvbSkge1xuICAgICAgICAvLyBiYWxsIG1pc3NlZCBwYWRkbGVcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcImNhbGxpbmcgd2hlbkJhbGxNaXNzZXNQYWRkbGUgZm9yIGJhbGwgXCIgKyBpICtcbiAgICAgICAgLy9cIiB4PVwiICsgQm91bmNlLmJhbGxYW2ldICsgXCIgeT1cIiArIEJvdW5jZS5iYWxsWVtpXSk7XG4gICAgICAgIEJvdW5jZS5jYWxsVXNlckdlbmVyYXRlZENvZGUoQm91bmNlLndoZW5CYWxsTWlzc2VzUGFkZGxlKTtcbiAgICAgICAgQm91bmNlLmJhbGxGbGFnc1tpXSB8PSBCb3VuY2UuQmFsbEZsYWdzLk1JU1NFRF9QQURETEU7XG4gICAgICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoXG4gICAgICAgICAgICBkZWxlZ2F0ZSh0aGlzLCBCb3VuY2UubW92ZUJhbGxPZmZzY3JlZW4sIGkpLFxuICAgICAgICAgICAgMTAwMCk7XG4gICAgICAgIGlmIChCb3VuY2UucmVzcGF3bkJhbGxzKSB7XG4gICAgICAgICAgQm91bmNlLmxhdW5jaEJhbGwoaSk7XG4gICAgICAgIH0gZWxzZSBpZiAoQm91bmNlLmZhaWxPbkJhbGxFeGl0KSB7XG4gICAgICAgICAgQm91bmNlLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICAgICAgICBCb3VuY2Uub25QdXp6bGVDb21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgQm91bmNlLmRpc3BsYXlCYWxsKGksIEJvdW5jZS5iYWxsWFtpXSwgQm91bmNlLmJhbGxZW2ldKTtcbiAgfVxuXG4gIEJvdW5jZS5kaXNwbGF5UGFkZGxlKEJvdW5jZS5wYWRkbGVYLCBCb3VuY2UucGFkZGxlWSk7XG5cbiAgaWYgKGNoZWNrRmluaXNoZWQoKSkge1xuICAgIEJvdW5jZS5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH1cbn07XG5cbkJvdW5jZS5vblN2Z0RyYWcgPSBmdW5jdGlvbihlKSB7XG4gIGlmIChCb3VuY2UuaW50ZXJ2YWxJZCkge1xuICAgIEJvdW5jZS5nZXN0dXJlc09ic2VydmVkW2UuZ2VzdHVyZS5kaXJlY3Rpb25dID1cbiAgICAgIE1hdGgucm91bmQoZS5nZXN0dXJlLmRpc3RhbmNlIC8gRFJBR19ESVNUQU5DRV9UT19NT1ZFX1JBVElPKTtcbiAgICBlLmdlc3R1cmUucHJldmVudERlZmF1bHQoKTtcbiAgfVxufTtcblxuQm91bmNlLm9uS2V5ID0gZnVuY3Rpb24oZSkge1xuICAvLyBTdG9yZSB0aGUgbW9zdCByZWNlbnQgZXZlbnQgdHlwZSBwZXIta2V5XG4gIEJvdW5jZS5rZXlTdGF0ZVtlLmtleUNvZGVdID0gZS50eXBlO1xuXG4gIC8vIElmIHdlIGFyZSBhY3RpdmVseSBydW5uaW5nIG91ciB0aWNrIGxvb3AsIHN1cHByZXNzIGRlZmF1bHQgZXZlbnQgaGFuZGxpbmdcbiAgaWYgKEJvdW5jZS5pbnRlcnZhbElkICYmXG4gICAgICBlLmtleUNvZGUgPj0gS2V5Q29kZXMuTEVGVCAmJiBlLmtleUNvZGUgPD0gS2V5Q29kZXMuRE9XTikge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfVxufTtcblxuQm91bmNlLm9uQXJyb3dCdXR0b25Eb3duID0gZnVuY3Rpb24oZSwgaWRCdG4pIHtcbiAgLy8gU3RvcmUgdGhlIG1vc3QgcmVjZW50IGV2ZW50IHR5cGUgcGVyLWJ1dHRvblxuICBCb3VuY2UuYnRuU3RhdGVbaWRCdG5dID0gQnV0dG9uU3RhdGUuRE9XTjtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpOyAgLy8gU3RvcCBub3JtYWwgZXZlbnRzIHNvIHdlIHNlZSBtb3VzZXVwIGxhdGVyLlxufTtcblxuQm91bmNlLm9uQXJyb3dCdXR0b25VcCA9IGZ1bmN0aW9uKGUsIGlkQnRuKSB7XG4gIC8vIFN0b3JlIHRoZSBtb3N0IHJlY2VudCBldmVudCB0eXBlIHBlci1idXR0b25cbiAgQm91bmNlLmJ0blN0YXRlW2lkQnRuXSA9IEJ1dHRvblN0YXRlLlVQO1xufTtcblxuQm91bmNlLm9uTW91c2VVcCA9IGZ1bmN0aW9uKGUpIHtcbiAgLy8gUmVzZXQgYnRuU3RhdGUgb24gbW91c2UgdXBcbiAgQm91bmNlLmJ0blN0YXRlID0ge307XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgQmxvY2tseSBhbmQgdGhlIEJvdW5jZSBhcHAuICBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5Cb3VuY2UuaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAvLyByZXBsYWNlIHN0dWRpb0FwcCBtZXRob2RzIHdpdGggb3VyIG93blxuICBzdHVkaW9BcHAucmVzZXQgPSB0aGlzLnJlc2V0LmJpbmQodGhpcyk7XG4gIHN0dWRpb0FwcC5ydW5CdXR0b25DbGljayA9IHRoaXMucnVuQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcblxuICBCb3VuY2UuY2xlYXJFdmVudEhhbmRsZXJzS2lsbFRpY2tMb29wKCk7XG4gIHNraW4gPSBjb25maWcuc2tpbjtcbiAgbGV2ZWwgPSBjb25maWcubGV2ZWw7XG4gIGxvYWRMZXZlbCgpO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBCb3VuY2Uub25LZXksIGZhbHNlKTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBCb3VuY2Uub25LZXksIGZhbHNlKTtcblxuICBjb25maWcubG9hZEF1ZGlvID0gZnVuY3Rpb24oKSB7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndpblNvdW5kLCAnd2luJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLnN0YXJ0U291bmQsICdzdGFydCcpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5iYWxsU3RhcnRTb3VuZCwgJ2JhbGxzdGFydCcpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5mYWlsdXJlU291bmQsICdmYWlsdXJlJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLnJ1YmJlclNvdW5kLCAncnViYmVyJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmNydW5jaFNvdW5kLCAnY3J1bmNoJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmZsYWdTb3VuZCwgJ2ZsYWcnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2luUG9pbnRTb3VuZCwgJ3dpbnBvaW50Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndpblBvaW50MlNvdW5kLCAnd2lucG9pbnQyJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmxvc2VQb2ludFNvdW5kLCAnbG9zZXBvaW50Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmxvc2VQb2ludDJTb3VuZCwgJ2xvc2Vwb2ludDInKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uZ29hbDFTb3VuZCwgJ2dvYWwxJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmdvYWwyU291bmQsICdnb2FsMicpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi53b29kU291bmQsICd3b29kJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLnJldHJvU291bmQsICdyZXRybycpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5zbGFwU291bmQsICdzbGFwJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmhpdFNvdW5kLCAnaGl0Jyk7XG4gIH07XG5cbiAgY29uZmlnLmFmdGVySW5qZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gQ29ubmVjdCB1cCBhcnJvdyBidXR0b24gZXZlbnQgaGFuZGxlcnNcbiAgICBmb3IgKHZhciBidG4gaW4gQXJyb3dJZHMpIHtcbiAgICAgIGRvbS5hZGRNb3VzZVVwVG91Y2hFdmVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChBcnJvd0lkc1tidG5dKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxlZ2F0ZSh0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJvdW5jZS5vbkFycm93QnV0dG9uVXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyb3dJZHNbYnRuXSkpO1xuICAgICAgZG9tLmFkZE1vdXNlRG93blRvdWNoRXZlbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoQXJyb3dJZHNbYnRuXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxlZ2F0ZSh0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlLm9uQXJyb3dCdXR0b25Eb3duLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyb3dJZHNbYnRuXSkpO1xuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgQm91bmNlLm9uTW91c2VVcCwgZmFsc2UpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHJpY2huZXNzIG9mIGJsb2NrIGNvbG91cnMsIHJlZ2FyZGxlc3Mgb2YgdGhlIGh1ZS5cbiAgICAgKiBNT09DIGJsb2NrcyBzaG91bGQgYmUgYnJpZ2h0ZXIgKHRhcmdldCBhdWRpZW5jZSBpcyB5b3VuZ2VyKS5cbiAgICAgKiBNdXN0IGJlIGluIHRoZSByYW5nZSBvZiAwIChpbmNsdXNpdmUpIHRvIDEgKGV4Y2x1c2l2ZSkuXG4gICAgICogQmxvY2tseSdzIGRlZmF1bHQgaXMgMC40NS5cbiAgICAgKi9cbiAgICBCbG9ja2x5LkhTVl9TQVRVUkFUSU9OID0gMC42O1xuXG4gICAgQmxvY2tseS5TTkFQX1JBRElVUyAqPSBCb3VuY2Uuc2NhbGUuc25hcFJhZGl1cztcblxuICAgIEJvdW5jZS5iYWxsU3RhcnRfID0gW107XG4gICAgQm91bmNlLmJhbGxYID0gW107XG4gICAgQm91bmNlLmJhbGxZID0gW107XG4gICAgQm91bmNlLmJhbGxEaXIgPSBbXTtcbiAgICBCb3VuY2UuYmFsbFNwZWVkID0gW107XG4gICAgQm91bmNlLmJhbGxGbGFncyA9IFtdO1xuICAgIEJvdW5jZS5iYWxsQ291bnQgPSAwO1xuICAgIEJvdW5jZS5vcmlnaW5hbEJhbGxDb3VudCA9IDA7XG4gICAgQm91bmNlLnBhZGRsZUZpbmlzaENvdW50ID0gMDtcbiAgICBCb3VuY2UuZGVmYXVsdEJhbGxTcGVlZCA9IGxldmVsLmJhbGxTcGVlZCB8fCB0aWxlcy5ERUZBVUxUX0JBTExfU1BFRUQ7XG4gICAgQm91bmNlLmRlZmF1bHRCYWxsRGlyID0gbGV2ZWwuYmFsbERpcmVjdGlvbiB8fCB0aWxlcy5ERUZBVUxUX0JBTExfRElSRUNUSU9OO1xuXG4gICAgLy8gTG9jYXRlIHRoZSBzdGFydCBhbmQgZmluaXNoIHNxdWFyZXMuXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBCb3VuY2UuUk9XUzsgeSsrKSB7XG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IEJvdW5jZS5DT0xTOyB4KyspIHtcbiAgICAgICAgaWYgKEJvdW5jZS5tYXBbeV1beF0gJiBTcXVhcmVUeXBlLlBBRERMRUZJTklTSCkge1xuICAgICAgICAgIGlmICgwID09PSBCb3VuY2UucGFkZGxlRmluaXNoQ291bnQpIHtcbiAgICAgICAgICAgIEJvdW5jZS5wYWRkbGVGaW5pc2hfID0gW107XG4gICAgICAgICAgfVxuICAgICAgICAgIEJvdW5jZS5wYWRkbGVGaW5pc2hfW0JvdW5jZS5wYWRkbGVGaW5pc2hDb3VudF0gPSB7eDogeCwgeTogeX07XG4gICAgICAgICAgQm91bmNlLnBhZGRsZUZpbmlzaENvdW50Kys7XG4gICAgICAgIH0gZWxzZSBpZiAoQm91bmNlLm1hcFt5XVt4XSAmIFNxdWFyZVR5cGUuQkFMTFNUQVJUKSB7XG4gICAgICAgICAgQm91bmNlLmJhbGxTdGFydF9bQm91bmNlLmJhbGxDb3VudF0gPSB7IHg6IHgsIHk6IHl9O1xuICAgICAgICAgIEJvdW5jZS5iYWxsQ291bnQrKztcbiAgICAgICAgfSBlbHNlIGlmIChCb3VuY2UubWFwW3ldW3hdICYgU3F1YXJlVHlwZS5QQURETEVTVEFSVCkge1xuICAgICAgICAgIEJvdW5jZS5wYWRkbGVTdGFydF8gPSB7eDogeCwgeTogeX07XG4gICAgICAgIH0gZWxzZSBpZiAoQm91bmNlLm1hcFt5XVt4XSAmIFNxdWFyZVR5cGUuQkFMTEZJTklTSCkge1xuICAgICAgICAgIEJvdW5jZS5iYWxsRmluaXNoXyA9IHt4OiB4LCB5OiB5fTtcbiAgICAgICAgfSBlbHNlIGlmIChCb3VuY2UubWFwW3ldW3hdICYgU3F1YXJlVHlwZS5HT0FMKSB7XG4gICAgICAgICAgQm91bmNlLmdvYWxMb2NhdGVkXyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBCb3VuY2Uub3JpZ2luYWxCYWxsQ291bnQgPSBCb3VuY2UuYmFsbENvdW50O1xuXG4gICAgZHJhd01hcCgpO1xuICB9O1xuXG4gIC8vIEJsb2NrIHBsYWNlbWVudCBkZWZhdWx0ICh1c2VkIGFzIGZhbGxiYWNrIGluIHRoZSBzaGFyZSBsZXZlbHMpXG4gIGNvbmZpZy5ibG9ja0FycmFuZ2VtZW50ID0ge1xuICAgICd3aGVuX3J1bic6IHsgeDogMjAsIHk6IDIwfSxcbiAgICAnYm91bmNlX3doZW5MZWZ0JzogeyB4OiAyMCwgeTogMjIwfSxcbiAgICAnYm91bmNlX3doZW5SaWdodCc6IHsgeDogMTgwLCB5OiAyMjB9LFxuICAgICdib3VuY2Vfd2hlblBhZGRsZUNvbGxpZGVkJzogeyB4OiAyMCwgeTogMzEwfSxcbiAgICAnYm91bmNlX3doZW5XYWxsQ29sbGlkZWQnOiB7IHg6IDIwLCB5OiA0MTB9LFxuICAgICdib3VuY2Vfd2hlbkJhbGxJbkdvYWwnOiB7IHg6IDIwLCB5OiA1MTB9LFxuICAgICdib3VuY2Vfd2hlbkJhbGxNaXNzZXNQYWRkbGUnOiB7IHg6IDIwLCB5OiA2MzB9XG4gIH07XG5cbiAgY29uZmlnLnR3aXR0ZXIgPSB0d2l0dGVyT3B0aW9ucztcblxuICAvLyBmb3IgdGhpcyBhcHAsIHNob3cgbWFrZSB5b3VyIG93biBidXR0b24gaWYgb24gc2hhcmUgcGFnZVxuICBjb25maWcubWFrZVlvdXJPd24gPSBjb25maWcuc2hhcmU7XG5cbiAgY29uZmlnLm1ha2VTdHJpbmcgPSBib3VuY2VNc2cubWFrZVlvdXJPd24oKTtcbiAgY29uZmlnLm1ha2VVcmwgPSBcImh0dHA6Ly9jb2RlLm9yZy9ib3VuY2VcIjtcbiAgY29uZmlnLm1ha2VJbWFnZSA9IHN0dWRpb0FwcC5hc3NldFVybCgnbWVkaWEvcHJvbW8ucG5nJyk7XG5cbiAgY29uZmlnLmVuYWJsZVNob3dDb2RlID0gZmFsc2U7XG4gIGNvbmZpZy5lbmFibGVTaG93QmxvY2tDb3VudCA9IGZhbHNlO1xuXG4gIFJlYWN0LnJlbmRlcihSZWFjdC5jcmVhdGVFbGVtZW50KEFwcFZpZXcsIHtcbiAgICByZW5kZXJDb2RlQXBwOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gcGFnZSh7XG4gICAgICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBsb2NhbGVEaXJlY3Rpb246IHN0dWRpb0FwcC5sb2NhbGVEaXJlY3Rpb24oKSxcbiAgICAgICAgICB2aXN1YWxpemF0aW9uOiByZXF1aXJlKCcuL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMnKSgpLFxuICAgICAgICAgIGNvbnRyb2xzOiByZXF1aXJlKCcuL2NvbnRyb2xzLmh0bWwuZWpzJykoe2Fzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmx9KSxcbiAgICAgICAgICBibG9ja1VzZWQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICBpZGVhbEJsb2NrTnVtYmVyOiB1bmRlZmluZWQsXG4gICAgICAgICAgZWRpdENvZGU6IGxldmVsLmVkaXRDb2RlLFxuICAgICAgICAgIGJsb2NrQ291bnRlckNsYXNzOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgICAgICByZWFkb25seVdvcmtzcGFjZTogY29uZmlnLnJlYWRvbmx5V29ya3NwYWNlXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG4gICAgb25Nb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgc3R1ZGlvQXBwLmluaXQoY29uZmlnKTtcblxuICAgICAgdmFyIGZpbmlzaEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaW5pc2hCdXR0b24nKTtcbiAgICAgIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQoZmluaXNoQnV0dG9uLCBCb3VuY2Uub25QdXp6bGVDb21wbGV0ZSk7XG4gICAgfVxuICB9KSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLmNvbnRhaW5lcklkKSk7XG59O1xuXG4vKipcbiAqIENsZWFyIHRoZSBldmVudCBoYW5kbGVycyBhbmQgc3RvcCB0aGUgb25UaWNrIHRpbWVyLlxuICovXG5Cb3VuY2UuY2xlYXJFdmVudEhhbmRsZXJzS2lsbFRpY2tMb29wID0gZnVuY3Rpb24oKSB7XG4gIEJvdW5jZS53aGVuV2FsbENvbGxpZGVkID0gbnVsbDtcbiAgQm91bmNlLndoZW5CYWxsSW5Hb2FsID0gbnVsbDtcbiAgQm91bmNlLndoZW5CYWxsTWlzc2VzUGFkZGxlID0gbnVsbDtcbiAgQm91bmNlLndoZW5QYWRkbGVDb2xsaWRlZCA9IG51bGw7XG4gIEJvdW5jZS53aGVuRG93biA9IG51bGw7XG4gIEJvdW5jZS53aGVuTGVmdCA9IG51bGw7XG4gIEJvdW5jZS53aGVuUmlnaHQgPSBudWxsO1xuICBCb3VuY2Uud2hlblVwID0gbnVsbDtcbiAgQm91bmNlLndoZW5HYW1lU3RhcnRzID0gbnVsbDtcbiAgaWYgKEJvdW5jZS5pbnRlcnZhbElkKSB7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQm91bmNlLmludGVydmFsSWQpO1xuICB9XG4gIEJvdW5jZS5pbnRlcnZhbElkID0gMDtcbiAgLy8gS2lsbCBhbGwgdGFza3MuXG4gIHRpbWVvdXRMaXN0LmNsZWFyVGltZW91dHMoKTtcbn07XG5cbi8qKlxuICogTW92ZSBiYWxsIHRvIGEgc2FmZSBwbGFjZSBvZmYgb2YgdGhlIHNjcmVlbi5cbiAqIEBwYXJhbSB7aW50fSBpIEluZGV4IG9mIGJhbGwgdG8gYmUgbW92ZWQuXG4gKi9cbkJvdW5jZS5tb3ZlQmFsbE9mZnNjcmVlbiA9IGZ1bmN0aW9uKGkpIHtcbiAgQm91bmNlLmJhbGxYW2ldID0gMTAwO1xuICBCb3VuY2UuYmFsbFlbaV0gPSAxMDA7XG4gIEJvdW5jZS5iYWxsRGlyW2ldID0gMDtcbiAgLy8gc3RvcCB0aGUgYmFsbCBmcm9tIG1vdmluZyBpZiB3ZSdyZSBub3QgcGxhbm5pbmcgdG8gcmVzcGF3bjpcbiAgQm91bmNlLmJhbGxTcGVlZFtpXSA9IDA7XG59O1xuXG4vKipcbiAqIFBsYXkgYSBzdGFydCBzb3VuZCBhbmQgcmVzZXQgdGhlIGJhbGwgYXQgaW5kZXggaSBhbmQgcmVkcmF3IGl0LlxuICogQHBhcmFtIHtpbnR9IGkgSW5kZXggb2YgYmFsbCB0byBiZSByZXNldC5cbiAqL1xuQm91bmNlLnBsYXlTb3VuZEFuZFJlc2V0QmFsbCA9IGZ1bmN0aW9uKGkpIHtcbiAgLy9jb25zb2xlLmxvZyhcInBsYXlTb3VuZEFuZFJlc2V0QmFsbCBjYWxsZWQgZm9yIGJhbGwgXCIgKyBpKTtcbiAgQm91bmNlLnJlc2V0QmFsbChpLCB7IHJhbmRvbVBvc2l0aW9uOiB0cnVlIH0gKTtcbiAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnYmFsbHN0YXJ0Jyk7XG59O1xuXG4vKipcbiAqIExhdW5jaCB0aGUgYmFsbCBmcm9tIGluZGV4IGkgZnJvbSBhIHN0YXJ0IHBvc2l0aW9uIGFuZCBsYXVuY2ggaXQuXG4gKiBAcGFyYW0ge2ludH0gaSBJbmRleCBvZiBiYWxsIHRvIGJlIGxhdW5jaGVkLlxuICovXG5Cb3VuY2UubGF1bmNoQmFsbCA9IGZ1bmN0aW9uKGkpIHtcbiAgQm91bmNlLmJhbGxGbGFnc1tpXSB8PSBCb3VuY2UuQmFsbEZsYWdzLkxBVU5DSElORztcbiAgdGltZW91dExpc3Quc2V0VGltZW91dChkZWxlZ2F0ZSh0aGlzLCBCb3VuY2UucGxheVNvdW5kQW5kUmVzZXRCYWxsLCBpKSwgMzAwMCk7XG59O1xuXG4vKipcbiAqIFJlc2V0IHRoZSBiYWxsIGZyb20gaW5kZXggaSB0byB0aGUgc3RhcnQgcG9zaXRpb24gYW5kIHJlZHJhdyBpdC5cbiAqIEBwYXJhbSB7aW50fSBpIEluZGV4IG9mIGJhbGwgdG8gYmUgcmVzZXQuXG4gKiBAcGFyYW0ge29wdGlvbnN9IHJhbmRvbVBvc2l0aW9uOiByYW5kb20gc3RhcnRcbiAqL1xuQm91bmNlLnJlc2V0QmFsbCA9IGZ1bmN0aW9uKGksIG9wdGlvbnMpIHtcbiAgLy9jb25zb2xlLmxvZyhcInJlc2V0QmFsbCBjYWxsZWQgZm9yIGJhbGwgXCIgKyBpKTtcbiAgdmFyIHJhbmRTdGFydCA9IG9wdGlvbnMucmFuZG9tUG9zaXRpb24gfHxcbiAgICAgICAgICAgICAgICAgIHR5cGVvZiBCb3VuY2UuYmFsbFN0YXJ0X1tpXSA9PSAndW5kZWZpbmVkJztcbiAgQm91bmNlLmJhbGxYW2ldID0gIHJhbmRTdGFydCA/IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIEJvdW5jZS5DT0xTKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCb3VuY2UuYmFsbFN0YXJ0X1tpXS54O1xuICBCb3VuY2UuYmFsbFlbaV0gPSAgcmFuZFN0YXJ0ID8gdGlsZXMuREVGQVVMVF9CQUxMX1NUQVJUX1kgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlLmJhbGxTdGFydF9baV0ueTtcbiAgQm91bmNlLmJhbGxEaXJbaV0gPSByYW5kU3RhcnQgP1xuICAgICAgICAgICAgICAgICAgICAgICAgKE1hdGgucmFuZG9tKCkgKiBNYXRoLlBJIC8gMikgKyBNYXRoLlBJICogMC43NSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBCb3VuY2UuZGVmYXVsdEJhbGxEaXI7XG4gIEJvdW5jZS5iYWxsU3BlZWRbaV0gPSBCb3VuY2UuY3VycmVudEJhbGxTcGVlZDtcbiAgQm91bmNlLmJhbGxGbGFnc1tpXSA9IDA7XG5cbiAgQm91bmNlLmRpc3BsYXlCYWxsKGksIEJvdW5jZS5iYWxsWFtpXSwgQm91bmNlLmJhbGxZW2ldKTtcbn07XG5cbi8qKlxuICogUmVzZXQgdGhlIGFwcCB0byB0aGUgc3RhcnQgcG9zaXRpb24gYW5kIGtpbGwgYW55IHBlbmRpbmcgYW5pbWF0aW9uIHRhc2tzLlxuICogQHBhcmFtIHtib29sZWFufSBmaXJzdCBUcnVlIGlmIGFuIG9wZW5pbmcgYW5pbWF0aW9uIGlzIHRvIGJlIHBsYXllZC5cbiAqL1xuQm91bmNlLnJlc2V0ID0gZnVuY3Rpb24oZmlyc3QpIHtcbiAgdmFyIGk7XG4gIEJvdW5jZS5jbGVhckV2ZW50SGFuZGxlcnNLaWxsVGlja0xvb3AoKTtcblxuICAvLyBTb2Z0IGJ1dHRvbnNcbiAgdmFyIHNvZnRCdXR0b25Db3VudCA9IDA7XG4gIGZvciAoaSA9IDA7IGkgPCBCb3VuY2Uuc29mdEJ1dHRvbnNfLmxlbmd0aDsgaSsrKSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoQm91bmNlLnNvZnRCdXR0b25zX1tpXSkuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xuICAgIHNvZnRCdXR0b25Db3VudCsrO1xuICB9XG4gIGlmIChzb2Z0QnV0dG9uQ291bnQpIHtcbiAgICB2YXIgc29mdEJ1dHRvbnNDZWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NvZnQtYnV0dG9ucycpO1xuICAgIHNvZnRCdXR0b25zQ2VsbC5jbGFzc05hbWUgPSAnc29mdC1idXR0b25zLScgKyBzb2Z0QnV0dG9uQ291bnQ7XG4gIH1cblxuICBCb3VuY2UuZ2VzdHVyZXNPYnNlcnZlZCA9IHt9O1xuXG4gIC8vIFJlc2V0IHRoZSBzY29yZS5cbiAgQm91bmNlLnBsYXllclNjb3JlID0gMDtcbiAgQm91bmNlLm9wcG9uZW50U2NvcmUgPSAwO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NvcmUnKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG5cbiAgLy8gUmVzZXQgY29uZmlndXJhYmxlIHZhcmlhYmxlc1xuICBCb3VuY2Uuc2V0QmFja2dyb3VuZCgnaGFyZGNvdXJ0Jyk7XG4gIEJvdW5jZS5zZXRCYWxsKCdoYXJkY291cnQnKTtcbiAgQm91bmNlLnNldFBhZGRsZSgnaGFyZGNvdXJ0Jyk7XG4gIEJvdW5jZS5jdXJyZW50QmFsbFNwZWVkID0gQm91bmNlLmRlZmF1bHRCYWxsU3BlZWQ7XG5cbiAgLy8gUmVtb3ZlIGFueSBleHRyYSBiYWxscyB0aGF0IHdlcmUgY3JlYXRlZCBkeW5hbWljYWxseS5cbiAgZm9yIChpID0gQm91bmNlLm9yaWdpbmFsQmFsbENvdW50OyBpIDwgQm91bmNlLmJhbGxDb3VudDsgaSsrKSB7XG4gICAgQm91bmNlLmRlbGV0ZUJhbGxFbGVtZW50cyhpKTtcbiAgfVxuICAvLyBSZXNldCBiYWxsQ291bnQgYmFjayB0byB0aGUgb3JpZ2luYWwgdmFsdWVcbiAgQm91bmNlLmJhbGxDb3VudCA9IEJvdW5jZS5vcmlnaW5hbEJhbGxDb3VudDtcbiAgLy8gTW92ZSBiYWxsKHMpIGludG8gcG9zaXRpb24uXG4gIGZvciAoaSA9IDA7IGkgPCBCb3VuY2UuYmFsbENvdW50OyBpKyspIHtcbiAgICBCb3VuY2UucmVzZXRCYWxsKGksIHt9KTtcbiAgfVxuXG4gIC8vIE1vdmUgUGFkZGxlIGludG8gcG9zaXRpb24uXG4gIEJvdW5jZS5wYWRkbGVYID0gQm91bmNlLnBhZGRsZVN0YXJ0Xy54O1xuICBCb3VuY2UucGFkZGxlWSA9IEJvdW5jZS5wYWRkbGVTdGFydF8ueTtcbiAgQm91bmNlLnBhZGRsZVNwZWVkID0gdGlsZXMuREVGQVVMVF9QQURETEVfU1BFRUQ7XG5cbiAgQm91bmNlLmRpc3BsYXlQYWRkbGUoQm91bmNlLnBhZGRsZVgsIEJvdW5jZS5wYWRkbGVZKTtcblxuICB2YXIgc3ZnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z0JvdW5jZScpO1xuXG4gIGlmIChCb3VuY2UucGFkZGxlRmluaXNoXykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBCb3VuY2UucGFkZGxlRmluaXNoQ291bnQ7IGkrKykge1xuICAgICAgLy8gTWFyayBlYWNoIGZpbmlzaCBhcyBpbmNvbXBsZXRlLlxuICAgICAgQm91bmNlLnBhZGRsZUZpbmlzaF9baV0uZmluaXNoZWQgPSBmYWxzZTtcblxuICAgICAgLy8gTW92ZSB0aGUgZmluaXNoIGljb25zIGludG8gcG9zaXRpb24uXG4gICAgICB2YXIgcGFkZGxlRmluaXNoSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWRkbGVmaW5pc2gnICsgaSk7XG4gICAgICBwYWRkbGVGaW5pc2hJY29uLnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAneCcsXG4gICAgICAgICAgQm91bmNlLlNRVUFSRV9TSVpFICogKEJvdW5jZS5wYWRkbGVGaW5pc2hfW2ldLnggKyAwLjUpIC1cbiAgICAgICAgICBwYWRkbGVGaW5pc2hJY29uLmdldEF0dHJpYnV0ZSgnd2lkdGgnKSAvIDIpO1xuICAgICAgcGFkZGxlRmluaXNoSWNvbi5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgJ3knLFxuICAgICAgICAgIEJvdW5jZS5TUVVBUkVfU0laRSAqIChCb3VuY2UucGFkZGxlRmluaXNoX1tpXS55ICsgMC45KSAtXG4gICAgICAgICAgcGFkZGxlRmluaXNoSWNvbi5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpKTtcbiAgICAgIHBhZGRsZUZpbmlzaEljb24uc2V0QXR0cmlidXRlTlMoXG4gICAgICAgICAgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLFxuICAgICAgICAgICd4bGluazpocmVmJyxcbiAgICAgICAgICBza2luLmdvYWwpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChCb3VuY2UuYmFsbEZpbmlzaF8pIHtcbiAgICAvLyBNb3ZlIHRoZSBmaW5pc2ggaWNvbiBpbnRvIHBvc2l0aW9uLlxuICAgIHZhciBiYWxsRmluaXNoSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWxsZmluaXNoJyk7XG4gICAgYmFsbEZpbmlzaEljb24uc2V0QXR0cmlidXRlKFxuICAgICAgICAneCcsXG4gICAgICAgIEJvdW5jZS5TUVVBUkVfU0laRSAqIChCb3VuY2UuYmFsbEZpbmlzaF8ueCArIDAuNSkgLVxuICAgICAgICBiYWxsRmluaXNoSWNvbi5nZXRBdHRyaWJ1dGUoJ3dpZHRoJykgLyAyKTtcbiAgICBiYWxsRmluaXNoSWNvbi5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICd5JyxcbiAgICAgICAgQm91bmNlLlNRVUFSRV9TSVpFICogKEJvdW5jZS5iYWxsRmluaXNoXy55ICsgMC45KSAtXG4gICAgICAgIGJhbGxGaW5pc2hJY29uLmdldEF0dHJpYnV0ZSgnaGVpZ2h0JykpO1xuICAgIGJhbGxGaW5pc2hJY29uLnNldEF0dHJpYnV0ZU5TKFxuICAgICAgICAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsXG4gICAgICAgICd4bGluazpocmVmJyxcbiAgICAgICAgc2tpbi5nb2FsKTtcbiAgfVxuXG4gIC8vIFJlc2V0IHRoZSBvYnN0YWNsZSBpbWFnZS5cbiAgdmFyIG9ic0lkID0gMDtcbiAgdmFyIHgsIHk7XG4gIGZvciAoeSA9IDA7IHkgPCBCb3VuY2UuUk9XUzsgeSsrKSB7XG4gICAgZm9yICh4ID0gMDsgeCA8IEJvdW5jZS5DT0xTOyB4KyspIHtcbiAgICAgIHZhciBvYnNJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29ic3RhY2xlJyArIG9ic0lkKTtcbiAgICAgIGlmIChvYnNJY29uKSB7XG4gICAgICAgIG9ic0ljb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5vYnN0YWNsZSk7XG4gICAgICB9XG4gICAgICArK29ic0lkO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlc2V0IHRoZSB0aWxlc1xuICB2YXIgdGlsZUlkID0gMDtcbiAgZm9yICh5ID0gMDsgeSA8IEJvdW5jZS5ST1dTOyB5KyspIHtcbiAgICBmb3IgKHggPSAwOyB4IDwgQm91bmNlLkNPTFM7IHgrKykge1xuICAgICAgLy8gVGlsZSdzIGNsaXBQYXRoIGVsZW1lbnQuXG4gICAgICB2YXIgdGlsZUNsaXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGlsZUNsaXBQYXRoJyArIHRpbGVJZCk7XG4gICAgICBpZiAodGlsZUNsaXApIHtcbiAgICAgICAgdGlsZUNsaXAuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgIH1cbiAgICAgIC8vIFRpbGUgc3ByaXRlLlxuICAgICAgdmFyIHRpbGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbGVFbGVtZW50JyArIHRpbGVJZCk7XG4gICAgICBpZiAodGlsZUVsZW1lbnQpIHtcbiAgICAgICAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdvcGFjaXR5JywgMSk7XG4gICAgICB9XG4gICAgICB0aWxlSWQrKztcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogQ2xpY2sgdGhlIHJ1biBidXR0b24uICBTdGFydCB0aGUgcHJvZ3JhbS5cbiAqL1xuLy8gWFhYIFRoaXMgaXMgdGhlIG9ubHkgbWV0aG9kIHVzZWQgYnkgdGhlIHRlbXBsYXRlcyFcbkJvdW5jZS5ydW5CdXR0b25DbGljayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcnVuQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bkJ1dHRvbicpO1xuICB2YXIgcmVzZXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXRCdXR0b24nKTtcbiAgLy8gRW5zdXJlIHRoYXQgUmVzZXQgYnV0dG9uIGlzIGF0IGxlYXN0IGFzIHdpZGUgYXMgUnVuIGJ1dHRvbi5cbiAgaWYgKCFyZXNldEJ1dHRvbi5zdHlsZS5taW5XaWR0aCkge1xuICAgIHJlc2V0QnV0dG9uLnN0eWxlLm1pbldpZHRoID0gcnVuQnV0dG9uLm9mZnNldFdpZHRoICsgJ3B4JztcbiAgfVxuICBzdHVkaW9BcHAudG9nZ2xlUnVuUmVzZXQoJ3Jlc2V0Jyk7XG4gIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UudHJhY2VPbih0cnVlKTtcbiAgc3R1ZGlvQXBwLnJlc2V0KGZhbHNlKTtcbiAgc3R1ZGlvQXBwLmF0dGVtcHRzKys7XG4gIEJvdW5jZS5leGVjdXRlKCk7XG5cbiAgaWYgKGxldmVsLmZyZWVQbGF5ICYmICFzdHVkaW9BcHAuaGlkZVNvdXJjZSkge1xuICAgIHZhciBzaGFyZUNlbGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hhcmUtY2VsbCcpO1xuICAgIHNoYXJlQ2VsbC5jbGFzc05hbWUgPSAnc2hhcmUtY2VsbC1lbmFibGVkJztcbiAgfVxuICBpZiAoQm91bmNlLmdvYWxMb2NhdGVkXykge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZScpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gICAgQm91bmNlLmRpc3BsYXlTY29yZSgpO1xuICB9XG59O1xuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyBkaXNwbGF5RmVlZGJhY2sgZnVuY3Rpb24gdGhhdCBjYWxscyBpbnRvXG4gKiBzdHVkaW9BcHAuZGlzcGxheUZlZWRiYWNrIHdoZW4gYXBwcm9wcmlhdGVcbiAqL1xudmFyIGRpc3BsYXlGZWVkYmFjayA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIUJvdW5jZS53YWl0aW5nRm9yUmVwb3J0KSB7XG4gICAgc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayh7XG4gICAgICBhcHA6ICdib3VuY2UnLCAvL1hYWFxuICAgICAgc2tpbjogc2tpbi5pZCxcbiAgICAgIGZlZWRiYWNrVHlwZTogQm91bmNlLnRlc3RSZXN1bHRzLFxuICAgICAgcmVzcG9uc2U6IEJvdW5jZS5yZXNwb25zZSxcbiAgICAgIGxldmVsOiBsZXZlbCxcbiAgICAgIHNob3dpbmdTaGFyaW5nOiBsZXZlbC5mcmVlUGxheSxcbiAgICAgIHR3aXR0ZXI6IHR3aXR0ZXJPcHRpb25zLFxuICAgICAgYXBwU3RyaW5nczoge1xuICAgICAgICByZWluZkZlZWRiYWNrTXNnOiBib3VuY2VNc2cucmVpbmZGZWVkYmFja01zZygpLFxuICAgICAgICBzaGFyaW5nVGV4dDogYm91bmNlTXNnLnNoYXJlR2FtZSgpXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHNlcnZpY2UgcmVwb3J0IGNhbGwgaXMgY29tcGxldGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBKU09OIHJlc3BvbnNlIChpZiBhdmFpbGFibGUpXG4gKi9cbkJvdW5jZS5vblJlcG9ydENvbXBsZXRlID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgQm91bmNlLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIEJvdW5jZS53YWl0aW5nRm9yUmVwb3J0ID0gZmFsc2U7XG4gIHN0dWRpb0FwcC5vblJlcG9ydENvbXBsZXRlKHJlc3BvbnNlKTtcbiAgZGlzcGxheUZlZWRiYWNrKCk7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgdGhlIHVzZXIncyBjb2RlLiAgSGVhdmVuIGhlbHAgdXMuLi5cbiAqL1xuQm91bmNlLmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNvZGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKCdKYXZhU2NyaXB0JywgJ2JvdW5jZV93aGVuUnVuJyk7XG4gIEJvdW5jZS5yZXN1bHQgPSBSZXN1bHRUeXBlLlVOU0VUO1xuICBCb3VuY2UudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5OT19URVNUU19SVU47XG4gIEJvdW5jZS53YWl0aW5nRm9yUmVwb3J0ID0gZmFsc2U7XG4gIEJvdW5jZS5yZXNwb25zZSA9IG51bGw7XG5cbiAgaWYgKGxldmVsLmVkaXRDb2RlKSB7XG4gICAgY29kZSA9IGRyb3BsZXRVdGlscy5nZW5lcmF0ZUNvZGVBbGlhc2VzKG51bGwsICdCb3VuY2UnKTtcbiAgICBjb2RlICs9IHN0dWRpb0FwcC5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgfVxuXG4gIHZhciBjb2RlV2FsbENvbGxpZGVkID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdKYXZhU2NyaXB0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdib3VuY2Vfd2hlbldhbGxDb2xsaWRlZCcpO1xuICB2YXIgd2hlbldhbGxDb2xsaWRlZEZ1bmMgPSBjb2RlZ2VuLmZ1bmN0aW9uRnJvbUNvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZVdhbGxDb2xsaWRlZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHVkaW9BcHA6IHN0dWRpb0FwcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlOiBhcGkgfSApO1xuXG4gIHZhciBjb2RlQmFsbEluR29hbCA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSmF2YVNjcmlwdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYm91bmNlX3doZW5CYWxsSW5Hb2FsJyk7XG4gIHZhciB3aGVuQmFsbEluR29hbEZ1bmMgPSBjb2RlZ2VuLmZ1bmN0aW9uRnJvbUNvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZUJhbGxJbkdvYWwsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJvdW5jZTogYXBpIH0gKTtcblxuICB2YXIgY29kZUJhbGxNaXNzZXNQYWRkbGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0phdmFTY3JpcHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2JvdW5jZV93aGVuQmFsbE1pc3Nlc1BhZGRsZScpO1xuICB2YXIgd2hlbkJhbGxNaXNzZXNQYWRkbGVGdW5jID0gY29kZWdlbi5mdW5jdGlvbkZyb21Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVCYWxsTWlzc2VzUGFkZGxlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0dWRpb0FwcDogc3R1ZGlvQXBwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCb3VuY2U6IGFwaSB9ICk7XG5cbiAgdmFyIGNvZGVQYWRkbGVDb2xsaWRlZCA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSmF2YVNjcmlwdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYm91bmNlX3doZW5QYWRkbGVDb2xsaWRlZCcpO1xuICB2YXIgd2hlblBhZGRsZUNvbGxpZGVkRnVuYyA9IGNvZGVnZW4uZnVuY3Rpb25Gcm9tQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlUGFkZGxlQ29sbGlkZWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJvdW5jZTogYXBpIH0gKTtcblxuICB2YXIgY29kZUxlZnQgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0phdmFTY3JpcHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2JvdW5jZV93aGVuTGVmdCcpO1xuICB2YXIgd2hlbkxlZnRGdW5jID0gY29kZWdlbi5mdW5jdGlvbkZyb21Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVMZWZ0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0dWRpb0FwcDogc3R1ZGlvQXBwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCb3VuY2U6IGFwaSB9ICk7XG5cbiAgdmFyIGNvZGVSaWdodCA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSmF2YVNjcmlwdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYm91bmNlX3doZW5SaWdodCcpO1xuICB2YXIgd2hlblJpZ2h0RnVuYyA9IGNvZGVnZW4uZnVuY3Rpb25Gcm9tQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlUmlnaHQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJvdW5jZTogYXBpIH0gKTtcblxuICB2YXIgY29kZVVwID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdKYXZhU2NyaXB0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdib3VuY2Vfd2hlblVwJyk7XG4gIHZhciB3aGVuVXBGdW5jID0gY29kZWdlbi5mdW5jdGlvbkZyb21Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVVcCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHVkaW9BcHA6IHN0dWRpb0FwcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlOiBhcGkgfSApO1xuXG4gIHZhciBjb2RlRG93biA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSmF2YVNjcmlwdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYm91bmNlX3doZW5Eb3duJyk7XG4gIHZhciB3aGVuRG93bkZ1bmMgPSBjb2RlZ2VuLmZ1bmN0aW9uRnJvbUNvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZURvd24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJvdW5jZTogYXBpIH0gKTtcblxuICB2YXIgY29kZUdhbWVTdGFydHMgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0phdmFTY3JpcHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3doZW5fcnVuJyk7XG4gIHZhciB3aGVuR2FtZVN0YXJ0c0Z1bmMgPSBjb2RlZ2VuLmZ1bmN0aW9uRnJvbUNvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZUdhbWVTdGFydHMsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJvdW5jZTogYXBpIH0gKTtcblxuICBzdHVkaW9BcHAucGxheUF1ZGlvKEJvdW5jZS5iYWxsQ291bnQgPiAwID8gJ2JhbGxzdGFydCcgOiAnc3RhcnQnKTtcblxuICBzdHVkaW9BcHAucmVzZXQoZmFsc2UpO1xuXG4gIC8vIFNldCBldmVudCBoYW5kbGVycyBhbmQgc3RhcnQgdGhlIG9uVGljayB0aW1lclxuICBCb3VuY2Uud2hlbldhbGxDb2xsaWRlZCA9IHdoZW5XYWxsQ29sbGlkZWRGdW5jO1xuICBCb3VuY2Uud2hlbkJhbGxJbkdvYWwgPSB3aGVuQmFsbEluR29hbEZ1bmM7XG4gIEJvdW5jZS53aGVuQmFsbE1pc3Nlc1BhZGRsZSA9IHdoZW5CYWxsTWlzc2VzUGFkZGxlRnVuYztcbiAgQm91bmNlLndoZW5QYWRkbGVDb2xsaWRlZCA9IHdoZW5QYWRkbGVDb2xsaWRlZEZ1bmM7XG4gIEJvdW5jZS53aGVuTGVmdCA9IHdoZW5MZWZ0RnVuYztcbiAgQm91bmNlLndoZW5SaWdodCA9IHdoZW5SaWdodEZ1bmM7XG4gIEJvdW5jZS53aGVuVXAgPSB3aGVuVXBGdW5jO1xuICBCb3VuY2Uud2hlbkRvd24gPSB3aGVuRG93bkZ1bmM7XG4gIEJvdW5jZS53aGVuR2FtZVN0YXJ0cyA9IHdoZW5HYW1lU3RhcnRzRnVuYztcbiAgQm91bmNlLnRpY2tDb3VudCA9IDA7XG4gIEJvdW5jZS5pbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKEJvdW5jZS5vblRpY2ssIEJvdW5jZS5zY2FsZS5zdGVwU3BlZWQpO1xufTtcblxuQm91bmNlLm9uUHV6emxlQ29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKGxldmVsLmZyZWVQbGF5KSB7XG4gICAgQm91bmNlLnJlc3VsdCA9IFJlc3VsdFR5cGUuU1VDQ0VTUztcbiAgfVxuXG4gIC8vIFN0b3AgZXZlcnl0aGluZyBvbiBzY3JlZW5cbiAgQm91bmNlLmNsZWFyRXZlbnRIYW5kbGVyc0tpbGxUaWNrTG9vcCgpO1xuXG4gIC8vIElmIHdlIGtub3cgdGhleSBzdWNjZWVkZWQsIG1hcmsgbGV2ZWxDb21wbGV0ZSB0cnVlXG4gIC8vIE5vdGUgdGhhdCB3ZSBoYXZlIG5vdCB5ZXQgYW5pbWF0ZWQgdGhlIHN1Y2Nlc2Z1bCBydW5cbiAgdmFyIGxldmVsQ29tcGxldGUgPSAoQm91bmNlLnJlc3VsdCA9PSBSZXN1bHRUeXBlLlNVQ0NFU1MpO1xuXG4gIC8vIElmIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgZnJlZSBwbGF5LCBhbHdheXMgcmV0dXJuIHRoZSBmcmVlIHBsYXlcbiAgLy8gcmVzdWx0IHR5cGVcbiAgaWYgKGxldmVsLmZyZWVQbGF5KSB7XG4gICAgQm91bmNlLnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRlJFRV9QTEFZO1xuICB9IGVsc2Uge1xuICAgIEJvdW5jZS50ZXN0UmVzdWx0cyA9IHN0dWRpb0FwcC5nZXRUZXN0UmVzdWx0cyhsZXZlbENvbXBsZXRlKTtcbiAgfVxuXG4gIGlmIChCb3VuY2UudGVzdFJlc3VsdHMgPj0gVGVzdFJlc3VsdHMuRlJFRV9QTEFZKSB7XG4gICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnd2luJyk7XG4gIH0gZWxzZSB7XG4gICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnZmFpbHVyZScpO1xuICB9XG5cbiAgaWYgKGxldmVsLmVkaXRDb2RlKSB7XG4gICAgQm91bmNlLnRlc3RSZXN1bHRzID0gbGV2ZWxDb21wbGV0ZSA/XG4gICAgICBUZXN0UmVzdWx0cy5BTExfUEFTUyA6XG4gICAgICBUZXN0UmVzdWx0cy5UT09fRkVXX0JMT0NLU19GQUlMO1xuICB9XG5cbiAgdmFyIHhtbCA9IEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKTtcbiAgdmFyIHRleHRCbG9ja3MgPSBCbG9ja2x5LlhtbC5kb21Ub1RleHQoeG1sKTtcblxuICBCb3VuY2Uud2FpdGluZ0ZvclJlcG9ydCA9IHRydWU7XG5cbiAgLy8gUmVwb3J0IHJlc3VsdCB0byBzZXJ2ZXIuXG4gIHN0dWRpb0FwcC5yZXBvcnQoe1xuICAgICAgICAgICAgICAgICAgICAgYXBwOiAnYm91bmNlJyxcbiAgICAgICAgICAgICAgICAgICAgIGxldmVsOiBsZXZlbC5pZCxcbiAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogQm91bmNlLnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5TVUNDRVNTLFxuICAgICAgICAgICAgICAgICAgICAgdGVzdFJlc3VsdDogQm91bmNlLnRlc3RSZXN1bHRzLFxuICAgICAgICAgICAgICAgICAgICAgcHJvZ3JhbTogZW5jb2RlVVJJQ29tcG9uZW50KHRleHRCbG9ja3MpLFxuICAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZTogQm91bmNlLm9uUmVwb3J0Q29tcGxldGVcbiAgICAgICAgICAgICAgICAgICAgIH0pO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIHRpbGVzIHRvIGJlIHRyYW5zcGFyZW50IGdyYWR1YWxseS5cbiAqL1xuQm91bmNlLnNldFRpbGVUcmFuc3BhcmVudCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgdGlsZUlkID0gMDtcbiAgZm9yICh2YXIgeSA9IDA7IHkgPCBCb3VuY2UuUk9XUzsgeSsrKSB7XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCBCb3VuY2UuQ09MUzsgeCsrKSB7XG4gICAgICAvLyBUaWxlIHNwcml0ZS5cbiAgICAgIHZhciB0aWxlRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aWxlRWxlbWVudCcgKyB0aWxlSWQpO1xuICAgICAgdmFyIHRpbGVBbmltYXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGlsZUFuaW1hdGlvbicgKyB0aWxlSWQpO1xuICAgICAgaWYgKHRpbGVFbGVtZW50KSB7XG4gICAgICAgIHRpbGVFbGVtZW50LnNldEF0dHJpYnV0ZSgnb3BhY2l0eScsIDApO1xuICAgICAgfVxuICAgICAgaWYgKHRpbGVBbmltYXRpb24pIHtcbiAgICAgICAgdGlsZUFuaW1hdGlvbi5iZWdpbkVsZW1lbnQoKTtcbiAgICAgIH1cbiAgICAgIHRpbGVJZCsrO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBEaXNwbGF5IEJhbGwgYXQgdGhlIHNwZWNpZmllZCBsb2NhdGlvbiwgZmFjaW5nIHRoZSBzcGVjaWZpZWQgZGlyZWN0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGkgQmFsbCBpbmRleC4uXG4gKiBAcGFyYW0ge251bWJlcn0geCBIb3Jpem9udGFsIGdyaWQgKG9yIGZyYWN0aW9uIHRoZXJlb2YpLlxuICogQHBhcmFtIHtudW1iZXJ9IHkgVmVydGljYWwgZ3JpZCAob3IgZnJhY3Rpb24gdGhlcmVvZikuXG4gKi9cbkJvdW5jZS5kaXNwbGF5QmFsbCA9IGZ1bmN0aW9uKGksIHgsIHkpIHtcbiAgdmFyIGJhbGxJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGwnICsgaSk7XG4gIGJhbGxJY29uLnNldEF0dHJpYnV0ZSgneCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB4ICogQm91bmNlLlNRVUFSRV9TSVpFKTtcbiAgYmFsbEljb24uc2V0QXR0cmlidXRlKCd5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgKiBCb3VuY2UuU1FVQVJFX1NJWkUgKyBCb3VuY2UuQkFMTF9ZX09GRlNFVCk7XG5cbiAgdmFyIGJhbGxDbGlwUmVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWxsQ2xpcFJlY3QnICsgaSk7XG4gIGJhbGxDbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ3gnLCB4ICogQm91bmNlLlNRVUFSRV9TSVpFKTtcbiAgYmFsbENsaXBSZWN0LnNldEF0dHJpYnV0ZSgneScsIGJhbGxJY29uLmdldEF0dHJpYnV0ZSgneScpKTtcbn07XG5cbi8qKlxuICogRGlzcGxheSBQYWRkbGUgYXQgdGhlIHNwZWNpZmllZCBsb2NhdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IHggSG9yaXpvbnRhbCBncmlkIChvciBmcmFjdGlvbiB0aGVyZW9mKS5cbiAqIEBwYXJhbSB7bnVtYmVyfSB5IFZlcnRpY2FsIGdyaWQgKG9yIGZyYWN0aW9uIHRoZXJlb2YpLlxuICovXG5Cb3VuY2UuZGlzcGxheVBhZGRsZSA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgdmFyIHBhZGRsZUljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFkZGxlJyk7XG4gIHBhZGRsZUljb24uc2V0QXR0cmlidXRlKCd4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgeCAqIEJvdW5jZS5TUVVBUkVfU0laRSk7XG4gIHBhZGRsZUljb24uc2V0QXR0cmlidXRlKCd5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgeSAqIEJvdW5jZS5TUVVBUkVfU0laRSArIEJvdW5jZS5QQURETEVfWV9PRkZTRVQpO1xuXG4gIHZhciBwYWRkbGVDbGlwUmVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWRkbGVDbGlwUmVjdCcpO1xuICBwYWRkbGVDbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ3gnLCB4ICogQm91bmNlLlNRVUFSRV9TSVpFKTtcbiAgcGFkZGxlQ2xpcFJlY3Quc2V0QXR0cmlidXRlKCd5JywgcGFkZGxlSWNvbi5nZXRBdHRyaWJ1dGUoJ3knKSk7XG59O1xuXG5Cb3VuY2UuZGlzcGxheVNjb3JlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzY29yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZScpO1xuICBzY29yZS50ZXh0Q29udGVudCA9IGJvdW5jZU1zZy5zY29yZVRleHQoe1xuICAgIHBsYXllclNjb3JlOiBCb3VuY2UucGxheWVyU2NvcmUsXG4gICAgb3Bwb25lbnRTY29yZTogQm91bmNlLm9wcG9uZW50U2NvcmVcbiAgfSk7XG59O1xuXG52YXIgc2tpblRoZW1lID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PT0gJ2hhcmRjb3VydCcpIHtcbiAgICByZXR1cm4gc2tpbjtcbiAgfVxuICByZXR1cm4gc2tpblt2YWx1ZV07XG59O1xuXG5Cb3VuY2Uuc2V0QmFja2dyb3VuZCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWNrZ3JvdW5kJyk7XG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgc2tpblRoZW1lKHZhbHVlKS5iYWNrZ3JvdW5kKTtcblxuICAvLyBSZWNvbXB1dGUgYWxsIG9mIHRoZSB0aWxlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgd2FsbHMsIGdvYWxzLCBvciBlbXB0eVxuICAvLyBUT0RPOiBkbyB0aGlzIG9uY2UgZHVyaW5nIGluaXQgYW5kIGNhY2hlIHRoZSByZXN1bHRcbiAgdmFyIHRpbGVJZCA9IDA7XG4gIGZvciAodmFyIHkgPSAwOyB5IDwgQm91bmNlLlJPV1M7IHkrKykge1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgQm91bmNlLkNPTFM7IHgrKykge1xuICAgICAgdmFyIGVtcHR5ID0gZmFsc2U7XG4gICAgICB2YXIgaW1hZ2U7XG4gICAgICAvLyBDb21wdXRlIHRoZSB0aWxlIGluZGV4LlxuICAgICAgdmFyIHRpbGUgPSB3YWxsTm9ybWFsaXplKHgsIHkpICtcbiAgICAgICAgICB3YWxsTm9ybWFsaXplKHgsIHkgLSAxKSArICAvLyBOb3J0aC5cbiAgICAgICAgICB3YWxsTm9ybWFsaXplKHggKyAxLCB5KSArICAvLyBFYXN0LlxuICAgICAgICAgIHdhbGxOb3JtYWxpemUoeCwgeSArIDEpICsgIC8vIFNvdXRoLlxuICAgICAgICAgIHdhbGxOb3JtYWxpemUoeCAtIDEsIHkpOyAgIC8vIFdlc3QuXG5cbiAgICAgIC8vIERyYXcgdGhlIHRpbGUuXG4gICAgICBpZiAoV0FMTF9USUxFX1NIQVBFU1t0aWxlXSkge1xuICAgICAgICBpbWFnZSA9IHNraW5UaGVtZSh2YWx1ZSkudGlsZXM7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUgdGlsZSBpbmRleC5cbiAgICAgICAgdGlsZSA9IGdvYWxOb3JtYWxpemUoeCwgeSkgK1xuICAgICAgICAgICAgZ29hbE5vcm1hbGl6ZSh4LCB5IC0gMSkgKyAgLy8gTm9ydGguXG4gICAgICAgICAgICBnb2FsTm9ybWFsaXplKHggKyAxLCB5KSArICAvLyBFYXN0LlxuICAgICAgICAgICAgZ29hbE5vcm1hbGl6ZSh4LCB5ICsgMSkgKyAgLy8gU291dGguXG4gICAgICAgICAgICBnb2FsTm9ybWFsaXplKHggLSAxLCB5KTsgICAvLyBXZXN0LlxuXG4gICAgICAgIGlmICghR09BTF9USUxFX1NIQVBFU1t0aWxlXSkge1xuICAgICAgICAgIGVtcHR5ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpbWFnZSA9IHNraW5UaGVtZSh2YWx1ZSkuZ29hbFRpbGVzO1xuICAgICAgfVxuICAgICAgaWYgKCFlbXB0eSkge1xuICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbGVFbGVtZW50JyArIHRpbGVJZCk7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlTlMoXG4gICAgICAgICAgICAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJywgaW1hZ2UpO1xuICAgICAgfVxuICAgICAgdGlsZUlkKys7XG4gICAgfVxuICB9XG59O1xuXG5Cb3VuY2Uuc2V0QmFsbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBCb3VuY2UuYmFsbEltYWdlID0gc2tpblRoZW1lKHZhbHVlKS5iYWxsO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IEJvdW5jZS5iYWxsQ291bnQ7IGkrKykge1xuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGwnICsgaSk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgIEJvdW5jZS5iYWxsSW1hZ2UpO1xuICB9XG59O1xuXG5Cb3VuY2Uuc2V0UGFkZGxlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZGRsZScpO1xuICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgIHNraW5UaGVtZSh2YWx1ZSkucGFkZGxlKTtcbn07XG5cbkJvdW5jZS50aW1lZE91dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gQm91bmNlLnRpY2tDb3VudCA+IEJvdW5jZS50aW1lb3V0RmFpbHVyZVRpY2s7XG59O1xuXG5Cb3VuY2UuYWxsRmluaXNoZXNDb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaTtcbiAgaWYgKEJvdW5jZS5wYWRkbGVGaW5pc2hfKSB7XG4gICAgdmFyIGZpbmlzaGVkLCBwbGF5U291bmQ7XG4gICAgZm9yIChpID0gMCwgZmluaXNoZWQgPSAwOyBpIDwgQm91bmNlLnBhZGRsZUZpbmlzaENvdW50OyBpKyspIHtcbiAgICAgIGlmICghQm91bmNlLnBhZGRsZUZpbmlzaF9baV0uZmluaXNoZWQpIHtcbiAgICAgICAgaWYgKGVzc2VudGlhbGx5RXF1YWwoQm91bmNlLnBhZGRsZVgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJvdW5jZS5wYWRkbGVGaW5pc2hfW2ldLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbGVzLkZJTklTSF9DT0xMSURFX0RJU1RBTkNFKSAmJlxuICAgICAgICAgICAgZXNzZW50aWFsbHlFcXVhbChCb3VuY2UucGFkZGxlWSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlLnBhZGRsZUZpbmlzaF9baV0ueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGlsZXMuRklOSVNIX0NPTExJREVfRElTVEFOQ0UpKSB7XG4gICAgICAgICAgQm91bmNlLnBhZGRsZUZpbmlzaF9baV0uZmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgIGZpbmlzaGVkKys7XG4gICAgICAgICAgcGxheVNvdW5kID0gdHJ1ZTtcblxuICAgICAgICAgIC8vIENoYW5nZSB0aGUgZmluaXNoIGljb24gdG8gZ29hbFN1Y2Nlc3MuXG4gICAgICAgICAgdmFyIHBhZGRsZUZpbmlzaEljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFkZGxlZmluaXNoJyArIGkpO1xuICAgICAgICAgIHBhZGRsZUZpbmlzaEljb24uc2V0QXR0cmlidXRlTlMoXG4gICAgICAgICAgICAgICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyxcbiAgICAgICAgICAgICAgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICBza2luLmdvYWxTdWNjZXNzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmluaXNoZWQrKztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBsYXlTb3VuZCAmJiBmaW5pc2hlZCAhPSBCb3VuY2UucGFkZGxlRmluaXNoQ291bnQpIHtcbiAgICAgIC8vIFBsYXkgYSBzb3VuZCB1bmxlc3Mgd2UndmUgaGl0IHRoZSBsYXN0IGZsYWdcbiAgICAgIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ2ZsYWcnKTtcbiAgICB9XG4gICAgcmV0dXJuIChmaW5pc2hlZCA9PSBCb3VuY2UucGFkZGxlRmluaXNoQ291bnQpO1xuICB9XG4gIGlmIChCb3VuY2UuYmFsbEZpbmlzaF8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgQm91bmNlLmJhbGxDb3VudDsgaSsrKSB7XG4gICAgICBpZiAoZXNzZW50aWFsbHlFcXVhbChCb3VuY2UuYmFsbFhbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBCb3VuY2UuYmFsbEZpbmlzaF8ueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbGVzLkZJTklTSF9DT0xMSURFX0RJU1RBTkNFKSAmJlxuICAgICAgICAgIGVzc2VudGlhbGx5RXF1YWwoQm91bmNlLmJhbGxZW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlLmJhbGxGaW5pc2hfLnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aWxlcy5GSU5JU0hfQ09MTElERV9ESVNUQU5DRSkpIHtcbiAgICAgICAgLy8gQ2hhbmdlIHRoZSBmaW5pc2ggaWNvbiB0byBnb2FsU3VjY2Vzcy5cbiAgICAgICAgdmFyIGJhbGxGaW5pc2hJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGxmaW5pc2gnKTtcbiAgICAgICAgYmFsbEZpbmlzaEljb24uc2V0QXR0cmlidXRlTlMoXG4gICAgICAgICAgICAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsXG4gICAgICAgICAgICAneGxpbms6aHJlZicsXG4gICAgICAgICAgICBza2luLmdvYWxTdWNjZXNzKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbnZhciBjaGVja0ZpbmlzaGVkID0gZnVuY3Rpb24gKCkge1xuICAvLyBpZiB3ZSBoYXZlIGEgc3VjY2Nlc3MgY29uZGl0aW9uIGFuZCBoYXZlIGFjY29tcGxpc2hlZCBpdCwgd2UncmUgZG9uZSBhbmQgc3VjY2Vzc2Z1bFxuICBpZiAobGV2ZWwuZ29hbCAmJiBsZXZlbC5nb2FsLnN1Y2Nlc3NDb25kaXRpb24gJiYgbGV2ZWwuZ29hbC5zdWNjZXNzQ29uZGl0aW9uKCkpIHtcbiAgICBCb3VuY2UucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gaWYgd2UgaGF2ZSBhIGZhaWx1cmUgY29uZGl0aW9uLCBhbmQgaXQncyBiZWVuIHJlYWNoZWQsIHdlJ3JlIGRvbmUgYW5kIGZhaWxlZFxuICBpZiAobGV2ZWwuZ29hbCAmJiBsZXZlbC5nb2FsLmZhaWx1cmVDb25kaXRpb24gJiYgbGV2ZWwuZ29hbC5mYWlsdXJlQ29uZGl0aW9uKCkpIHtcbiAgICBCb3VuY2UucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKEJvdW5jZS5hbGxGaW5pc2hlc0NvbXBsZXRlKCkpIHtcbiAgICBCb3VuY2UucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKEJvdW5jZS50aW1lZE91dCgpKSB7XG4gICAgQm91bmNlLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIiBpZD1cInN2Z0JvdW5jZVwiPlxcbjwvc3ZnPlxcbjxkaXYgaWQ9XCJjYXBhY2l0eUJ1YmJsZVwiPlxcbiAgPGRpdiBpZD1cImNhcGFjaXR5XCI+PC9kaXY+XFxuPC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxO1xuICB2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbiAgdmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xuOyBidWYucHVzaCgnXFxuXFxuPGRpdiBpZD1cInNvZnQtYnV0dG9uc1wiIGNsYXNzPVwic29mdC1idXR0b25zLW5vbmVcIj5cXG4gIDxidXR0b24gaWQ9XCJsZWZ0QnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg4LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwibGVmdC1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG4gIDxidXR0b24gaWQ9XCJyaWdodEJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoMTEsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJyaWdodC1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG4gIDxidXR0b24gaWQ9XCJ1cEJ1dHRvblwiIGRpc2FibGVkPXRydWUgY2xhc3M9XCJhcnJvd1wiPlxcbiAgICA8aW1nIHNyYz1cIicsIGVzY2FwZSgoMTQsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJ1cC1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG4gIDxidXR0b24gaWQ9XCJkb3duQnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgxNywgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cImRvd24tYnRuIGljb24yMVwiPlxcbiAgPC9idXR0b24+XFxuPC9kaXY+XFxuPGRpdiBpZD1cInNoYXJlLWNlbGwtd3JhcHBlclwiPlxcbiAgPGRpdiBpZD1cInNoYXJlLWNlbGxcIiBjbGFzcz1cInNoYXJlLWNlbGwtbm9uZVwiPlxcbiAgICA8YnV0dG9uIGlkPVwiZmluaXNoQnV0dG9uXCIgY2xhc3M9XCJzaGFyZVwiPlxcbiAgICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgyMywgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIj4nLCBlc2NhcGUoKDIzLCAgY29tbW9uTXNnLmZpbmlzaCgpICkpLCAnXFxuICAgIDwvYnV0dG9uPlxcbiAgPC9kaXY+XFxuPC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiLyoqXG4gKiBCbG9ja2x5IEFwcDogQm91bmNlXG4gKlxuICogQ29weXJpZ2h0IDIwMTMgQ29kZS5vcmdcbiAqXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgY29kZWdlbiA9IHJlcXVpcmUoJy4uL2NvZGVnZW4nKTtcblxudmFyIGdlbmVyYXRlU2V0dGVyQ29kZSA9IGZ1bmN0aW9uIChjdHgsIG5hbWUpIHtcbiAgdmFyIHZhbHVlID0gY3R4LmdldFRpdGxlVmFsdWUoJ1ZBTFVFJyk7XG4gIGlmICh2YWx1ZSA9PT0gXCJyYW5kb21cIikge1xuICAgIHZhciBhbGxWYWx1ZXMgPSBjdHguVkFMVUVTLnNsaWNlKDEpLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIGl0ZW1bMV07XG4gICAgfSk7XG4gICAgdmFsdWUgPSAnQm91bmNlLnJhbmRvbShbJyArIGFsbFZhbHVlcyArICddKSc7XG4gIH1cblxuICByZXR1cm4gJ0JvdW5jZS4nICsgbmFtZSArICcoXFwnYmxvY2tfaWRfJyArIGN0eC5pZCArICdcXCcsICcgK1xuICAgIHZhbHVlICsgJyk7XFxuJztcbn07XG5cbi8vIEluc3RhbGwgZXh0ZW5zaW9ucyB0byBCbG9ja2x5J3MgbGFuZ3VhZ2UgYW5kIEphdmFTY3JpcHQgZ2VuZXJhdG9yLlxuZXhwb3J0cy5pbnN0YWxsID0gZnVuY3Rpb24oYmxvY2tseSwgYmxvY2tJbnN0YWxsT3B0aW9ucykge1xuICB2YXIgZ2VuZXJhdG9yID0gYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0Jyk7XG4gIGJsb2NrbHkuSmF2YVNjcmlwdCA9IGdlbmVyYXRvcjtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2Vfd2hlbkxlZnQgPSB7XG4gICAgLy8gQmxvY2sgdG8gaGFuZGxlIGV2ZW50IHdoZW4gdGhlIExlZnQgYXJyb3cgYnV0dG9uIGlzIHByZXNzZWQuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxNDAsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy53aGVuTGVmdCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQoZmFsc2UpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGVuTGVmdFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5ib3VuY2Vfd2hlbkxlZnQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBoYW5kbGluZyBMZWZ0IGFycm93IGJ1dHRvbiBldmVudC5cbiAgICByZXR1cm4gJ1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3doZW5SaWdodCA9IHtcbiAgICAvLyBCbG9jayB0byBoYW5kbGUgZXZlbnQgd2hlbiB0aGUgUmlnaHQgYXJyb3cgYnV0dG9uIGlzIHByZXNzZWQuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxNDAsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy53aGVuUmlnaHQoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KGZhbHNlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2hlblJpZ2h0VG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV93aGVuUmlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBoYW5kbGluZyBSaWdodCBhcnJvdyBidXR0b24gZXZlbnQuXG4gICAgcmV0dXJuICdcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV93aGVuVXAgPSB7XG4gICAgLy8gQmxvY2sgdG8gaGFuZGxlIGV2ZW50IHdoZW4gdGhlIFVwIGFycm93IGJ1dHRvbiBpcyBwcmVzc2VkLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTQwLCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShtc2cud2hlblVwKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudChmYWxzZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndoZW5VcFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5ib3VuY2Vfd2hlblVwID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgaGFuZGxpbmcgVXAgYXJyb3cgYnV0dG9uIGV2ZW50LlxuICAgIHJldHVybiAnXFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2Vfd2hlbkRvd24gPSB7XG4gICAgLy8gQmxvY2sgdG8gaGFuZGxlIGV2ZW50IHdoZW4gdGhlIERvd24gYXJyb3cgYnV0dG9uIGlzIHByZXNzZWQuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxNDAsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy53aGVuRG93bigpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQoZmFsc2UpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGVuRG93blRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5ib3VuY2Vfd2hlbkRvd24gPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBoYW5kbGluZyBEb3duIGFycm93IGJ1dHRvbiBldmVudC5cbiAgICByZXR1cm4gJ1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3doZW5XYWxsQ29sbGlkZWQgPSB7XG4gICAgLy8gQmxvY2sgdG8gaGFuZGxlIGV2ZW50IHdoZW4gYSB3YWxsL2JhbGwgY29sbGlzaW9uIG9jY3Vycy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE0MCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLndoZW5XYWxsQ29sbGlkZWQoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KGZhbHNlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2hlbldhbGxDb2xsaWRlZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5ib3VuY2Vfd2hlbldhbGxDb2xsaWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGhhbmRsaW5nIHdoZW4gYSB3YWxsL2JhbGwgY29sbGlzaW9uIG9jY3Vycy5cbiAgICByZXR1cm4gJ1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3doZW5CYWxsSW5Hb2FsID0ge1xuICAgIC8vIEJsb2NrIHRvIGhhbmRsZSBldmVudCB3aGVuIGEgYmFsbCBlbnRlcnMgYSBnb2FsLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTQwLCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShtc2cud2hlbkJhbGxJbkdvYWwoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KGZhbHNlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2hlbkJhbGxJbkdvYWxUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuYm91bmNlX3doZW5CYWxsSW5Hb2FsID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgaGFuZGxpbmcgd2hlbiBhIGJhbGwgaW4gZ29hbCBldmVudCBvY2N1cnMuXG4gICAgcmV0dXJuICdcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV93aGVuQmFsbE1pc3Nlc1BhZGRsZSA9IHtcbiAgICAvLyBCbG9jayB0byBoYW5kbGUgZXZlbnQgd2hlbiBhIGJhbGwgbWlzc2VzIHRoZSBwYWRkbGUuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxNDAsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy53aGVuQmFsbE1pc3Nlc1BhZGRsZSgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQoZmFsc2UpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGVuQmFsbE1pc3Nlc1BhZGRsZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5ib3VuY2Vfd2hlbkJhbGxNaXNzZXNQYWRkbGUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBoYW5kbGluZyB3aGVuIGEgYmFsbCBtaXNzZXMgdGhlIHBhZGRsZS5cbiAgICByZXR1cm4gJ1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3doZW5QYWRkbGVDb2xsaWRlZCA9IHtcbiAgICAvLyBCbG9jayB0byBoYW5kbGUgZXZlbnQgd2hlbiBhIHdhbGwgY29sbGlzaW9uIG9jY3Vycy5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE0MCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLndoZW5QYWRkbGVDb2xsaWRlZCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQoZmFsc2UpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGVuUGFkZGxlQ29sbGlkZWRUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuYm91bmNlX3doZW5QYWRkbGVDb2xsaWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGhhbmRsaW5nIHdoZW4gYSBwYWRkbGUvYmFsbCBjb2xsaXNpb24gb2NjdXJzLlxuICAgIHJldHVybiAnXFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2VfbW92ZUxlZnQgPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBsZWZ0LlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShtc2cubW92ZUxlZnQoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5tb3ZlTGVmdFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5ib3VuY2VfbW92ZUxlZnQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgbGVmdC5cbiAgICByZXR1cm4gJ0JvdW5jZS5tb3ZlTGVmdChcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX21vdmVSaWdodCA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIHJpZ2h0LlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShtc2cubW92ZVJpZ2h0KCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cubW92ZVJpZ2h0VG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV9tb3ZlUmlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgcmlnaHQuXG4gICAgcmV0dXJuICdCb3VuY2UubW92ZVJpZ2h0KFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2VfbW92ZVVwID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgdXAuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5tb3ZlVXAoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5tb3ZlVXBUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuYm91bmNlX21vdmVVcCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIG1vdmluZyB1cC5cbiAgICByZXR1cm4gJ0JvdW5jZS5tb3ZlVXAoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV9tb3ZlRG93biA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGRvd24uXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5tb3ZlRG93bigpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLm1vdmVEb3duVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV9tb3ZlRG93biA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIG1vdmluZyBkb3duLlxuICAgIHJldHVybiAnQm91bmNlLm1vdmVEb3duKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2VfcGxheVNvdW5kID0ge1xuICAgIC8vIEJsb2NrIGZvciBwbGF5aW5nIHNvdW5kLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5TT1VORFMpLCAnU09VTkQnKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnBsYXlTb3VuZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV9wbGF5U291bmQuU09VTkRTID1cbiAgICAgIFtbbXNnLnBsYXlTb3VuZEhpdCgpLCAnaGl0J10sXG4gICAgICAgW21zZy5wbGF5U291bmRXb29kKCksICd3b29kJ10sXG4gICAgICAgW21zZy5wbGF5U291bmRSZXRybygpLCAncmV0cm8nXSxcbiAgICAgICBbbXNnLnBsYXlTb3VuZFNsYXAoKSwgJ3NsYXAnXSxcbiAgICAgICBbbXNnLnBsYXlTb3VuZFJ1YmJlcigpLCAncnViYmVyJ10sXG4gICAgICAgW21zZy5wbGF5U291bmRDcnVuY2goKSwgJ2NydW5jaCddLFxuICAgICAgIFttc2cucGxheVNvdW5kV2luUG9pbnQoKSwgJ3dpbnBvaW50J10sXG4gICAgICAgW21zZy5wbGF5U291bmRXaW5Qb2ludDIoKSwgJ3dpbnBvaW50MiddLFxuICAgICAgIFttc2cucGxheVNvdW5kTG9zZVBvaW50KCksICdsb3NlcG9pbnQnXSxcbiAgICAgICBbbXNnLnBsYXlTb3VuZExvc2VQb2ludDIoKSwgJ2xvc2Vwb2ludDInXSxcbiAgICAgICBbbXNnLnBsYXlTb3VuZEdvYWwxKCksICdnb2FsMSddLFxuICAgICAgIFttc2cucGxheVNvdW5kR29hbDIoKSwgJ2dvYWwyJ11dO1xuXG4gIGdlbmVyYXRvci5ib3VuY2VfcGxheVNvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgcGxheWluZyBhIHNvdW5kLlxuICAgIHJldHVybiAnQm91bmNlLnBsYXlTb3VuZChcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcsIFxcJycgK1xuICAgICAgICAgICAgICAgdGhpcy5nZXRUaXRsZVZhbHVlKCdTT1VORCcpICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2VfaW5jcmVtZW50UGxheWVyU2NvcmUgPSB7XG4gICAgLy8gQmxvY2sgZm9yIGluY3JlbWVudGluZyB0aGUgcGxheWVyJ3Mgc2NvcmUuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5pbmNyZW1lbnRQbGF5ZXJTY29yZSgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmluY3JlbWVudFBsYXllclNjb3JlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV9pbmNyZW1lbnRQbGF5ZXJTY29yZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGluY3JlbWVudGluZyB0aGUgcGxheWVyJ3Mgc2NvcmUuXG4gICAgcmV0dXJuICdCb3VuY2UuaW5jcmVtZW50UGxheWVyU2NvcmUoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV9pbmNyZW1lbnRPcHBvbmVudFNjb3JlID0ge1xuICAgIC8vIEJsb2NrIGZvciBpbmNyZW1lbnRpbmcgdGhlIG9wcG9uZW50J3Mgc2NvcmUuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5pbmNyZW1lbnRPcHBvbmVudFNjb3JlKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuaW5jcmVtZW50T3Bwb25lbnRTY29yZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5ib3VuY2VfaW5jcmVtZW50T3Bwb25lbnRTY29yZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGluY3JlbWVudGluZyB0aGUgb3Bwb25lbnQncyBzY29yZS5cbiAgICByZXR1cm4gJ0JvdW5jZS5pbmNyZW1lbnRPcHBvbmVudFNjb3JlKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2VfYm91bmNlQmFsbCA9IHtcbiAgICAvLyBCbG9jayBmb3IgYm91bmNpbmcgYSBiYWxsLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShtc2cuYm91bmNlQmFsbCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmJvdW5jZUJhbGxUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuYm91bmNlX2JvdW5jZUJhbGwgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBib3VuY2luZyBhIGJhbGwuXG4gICAgcmV0dXJuICdCb3VuY2UuYm91bmNlQmFsbChcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX2xhdW5jaEJhbGwgPSB7XG4gICAgLy8gQmxvY2sgZm9yIGxhdW5jaGluZyBhIGJhbGwuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5sYXVuY2hCYWxsKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cubGF1bmNoQmFsbFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5ib3VuY2VfbGF1bmNoQmFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGxhdW5jaGluZyBhIGJhbGwuXG4gICAgcmV0dXJuICdCb3VuY2UubGF1bmNoQmFsbChcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3NldEJhbGxTcGVlZCA9IHtcbiAgICAvLyBCbG9jayBmb3Igc2V0dGluZyBiYWxsIHNwZWVkXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUVTKTtcbiAgICAgIGRyb3Bkb3duLnNldFZhbHVlKHRoaXMuVkFMVUVTWzNdWzFdKTsgLy8gZGVmYXVsdCB0byBub3JtYWxcblxuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVkFMVUUnKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnNldEJhbGxTcGVlZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV9zZXRCYWxsU3BlZWQuVkFMVUVTID1cbiAgICAgIFtbbXNnLnNldEJhbGxTcGVlZFJhbmRvbSgpLCAncmFuZG9tJ10sXG4gICAgICAgW21zZy5zZXRCYWxsU3BlZWRWZXJ5U2xvdygpLCAnQm91bmNlLkJhbGxTcGVlZC5WRVJZX1NMT1cnXSxcbiAgICAgICBbbXNnLnNldEJhbGxTcGVlZFNsb3coKSwgJ0JvdW5jZS5CYWxsU3BlZWQuU0xPVyddLFxuICAgICAgIFttc2cuc2V0QmFsbFNwZWVkTm9ybWFsKCksICdCb3VuY2UuQmFsbFNwZWVkLk5PUk1BTCddLFxuICAgICAgIFttc2cuc2V0QmFsbFNwZWVkRmFzdCgpLCAnQm91bmNlLkJhbGxTcGVlZC5GQVNUJ10sXG4gICAgICAgW21zZy5zZXRCYWxsU3BlZWRWZXJ5RmFzdCgpLCAnQm91bmNlLkJhbGxTcGVlZC5WRVJZX0ZBU1QnXV07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV9zZXRCYWxsU3BlZWQgPSBmdW5jdGlvbiAodmVsb2NpdHkpIHtcbiAgICByZXR1cm4gZ2VuZXJhdGVTZXR0ZXJDb2RlKHRoaXMsICdzZXRCYWxsU3BlZWQnKTtcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2Vfc2V0UGFkZGxlU3BlZWQgPSB7XG4gICAgLy8gQmxvY2sgZm9yIHNldHRpbmcgcGFkZGxlIHNwZWVkXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUVTKTtcbiAgICAgIGRyb3Bkb3duLnNldFZhbHVlKHRoaXMuVkFMVUVTWzNdWzFdKTsgLy8gZGVmYXVsdCB0byBub3JtYWxcblxuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVkFMVUUnKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnNldFBhZGRsZVNwZWVkVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3NldFBhZGRsZVNwZWVkLlZBTFVFUyA9XG4gICAgICBbW21zZy5zZXRQYWRkbGVTcGVlZFJhbmRvbSgpLCAncmFuZG9tJ10sXG4gICAgICAgW21zZy5zZXRQYWRkbGVTcGVlZFZlcnlTbG93KCksICdCb3VuY2UuUGFkZGxlU3BlZWQuVkVSWV9TTE9XJ10sXG4gICAgICAgW21zZy5zZXRQYWRkbGVTcGVlZFNsb3coKSwgJ0JvdW5jZS5QYWRkbGVTcGVlZC5TTE9XJ10sXG4gICAgICAgW21zZy5zZXRQYWRkbGVTcGVlZE5vcm1hbCgpLCAnQm91bmNlLlBhZGRsZVNwZWVkLk5PUk1BTCddLFxuICAgICAgIFttc2cuc2V0UGFkZGxlU3BlZWRGYXN0KCksICdCb3VuY2UuUGFkZGxlU3BlZWQuRkFTVCddLFxuICAgICAgIFttc2cuc2V0UGFkZGxlU3BlZWRWZXJ5RmFzdCgpLCAnQm91bmNlLlBhZGRsZVNwZWVkLlZFUllfRkFTVCddXTtcblxuICBnZW5lcmF0b3IuYm91bmNlX3NldFBhZGRsZVNwZWVkID0gZnVuY3Rpb24gKHZlbG9jaXR5KSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlU2V0dGVyQ29kZSh0aGlzLCAnc2V0UGFkZGxlU3BlZWQnKTtcbiAgfTtcblxuICAvKipcbiAgICogc2V0QmFja2dyb3VuZFxuICAgKi9cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3NldEJhY2tncm91bmQgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUVTKTtcbiAgICAgIGRyb3Bkb3duLnNldFZhbHVlKHRoaXMuVkFMVUVTWzFdWzFdKTsgIC8vIGRlZmF1bHQgdG8gaGFyZGNvdXJ0XG5cbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1ZBTFVFJyk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnNldEJhY2tncm91bmRUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2Vfc2V0QmFja2dyb3VuZC5WQUxVRVMgPVxuICAgICAgW1ttc2cuc2V0QmFja2dyb3VuZFJhbmRvbSgpLCAncmFuZG9tJ10sXG4gICAgICAgW21zZy5zZXRCYWNrZ3JvdW5kSGFyZGNvdXJ0KCksICdcImhhcmRjb3VydFwiJ10sXG4gICAgICAgW21zZy5zZXRCYWNrZ3JvdW5kUmV0cm8oKSwgJ1wicmV0cm9cIiddXTtcblxuICBnZW5lcmF0b3IuYm91bmNlX3NldEJhY2tncm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZ2VuZXJhdGVTZXR0ZXJDb2RlKHRoaXMsICdzZXRCYWNrZ3JvdW5kJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIHNldEJhbGxcbiAgICovXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV9zZXRCYWxsID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFUyk7XG4gICAgICBkcm9wZG93bi5zZXRWYWx1ZSh0aGlzLlZBTFVFU1sxXVsxXSk7ICAvLyBkZWZhdWx0IHRvIGhhcmRjb3VydFxuXG4gICAgICB0aGlzLnNldEhTVigzMTIsIDAuMzIsIDAuNjIpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5zZXRCYWxsVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3NldEJhbGwuVkFMVUVTID1cbiAgICAgIFtbbXNnLnNldEJhbGxSYW5kb20oKSwgJ3JhbmRvbSddLFxuICAgICAgIFttc2cuc2V0QmFsbEhhcmRjb3VydCgpLCAnXCJoYXJkY291cnRcIiddLFxuICAgICAgIFttc2cuc2V0QmFsbFJldHJvKCksICdcInJldHJvXCInXV07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV9zZXRCYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlU2V0dGVyQ29kZSh0aGlzLCAnc2V0QmFsbCcpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBzZXRQYWRkbGVcbiAgICovXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV9zZXRQYWRkbGUgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUVTKTtcbiAgICAgIGRyb3Bkb3duLnNldFZhbHVlKHRoaXMuVkFMVUVTWzFdWzFdKTsgIC8vIGRlZmF1bHQgdG8gaGFyZGNvdXJ0XG5cbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1ZBTFVFJyk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnNldFBhZGRsZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV9zZXRQYWRkbGUuVkFMVUVTID1cbiAgICAgIFtbbXNnLnNldFBhZGRsZVJhbmRvbSgpLCAncmFuZG9tJ10sXG4gICAgICAgW21zZy5zZXRQYWRkbGVIYXJkY291cnQoKSwgJ1wiaGFyZGNvdXJ0XCInXSxcbiAgICAgICBbbXNnLnNldFBhZGRsZVJldHJvKCksICdcInJldHJvXCInXV07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV9zZXRQYWRkbGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZ2VuZXJhdGVTZXR0ZXJDb2RlKHRoaXMsICdzZXRQYWRkbGUnKTtcbiAgfTtcblxuICBkZWxldGUgYmxvY2tseS5CbG9ja3MucHJvY2VkdXJlc19kZWZyZXR1cm47XG4gIGRlbGV0ZSBibG9ja2x5LkJsb2Nrcy5wcm9jZWR1cmVzX2lmcmV0dXJuO1xufTtcbiIsIi8vIGxvY2FsZSBmb3IgYm91bmNlXG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmJsb2NrbHkuYm91bmNlX2xvY2FsZTtcbiIsInZhciB0aWxlcyA9IHJlcXVpcmUoJy4vdGlsZXMnKTtcbnZhciBEaXJlY3Rpb24gPSB0aWxlcy5EaXJlY3Rpb247XG52YXIgU3F1YXJlVHlwZSA9IHRpbGVzLlNxdWFyZVR5cGU7XG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xuXG5leHBvcnRzLlBhZGRsZVNwZWVkID0ge1xuICBWRVJZX1NMT1c6IDAuMDQsXG4gIFNMT1c6IDAuMDYsXG4gIE5PUk1BTDogMC4xLFxuICBGQVNUOiAwLjE1LFxuICBWRVJZX0ZBU1Q6IDAuMjNcbn07XG5cbmV4cG9ydHMuQmFsbFNwZWVkID0ge1xuICBWRVJZX1NMT1c6IDAuMDQsXG4gIFNMT1c6IDAuMDYsXG4gIE5PUk1BTDogMC4xLFxuICBGQVNUOiAwLjE1LFxuICBWRVJZX0ZBU1Q6IDAuMjNcbn07XG5cbmV4cG9ydHMucmFuZG9tID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICB2YXIga2V5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdmFsdWVzLmxlbmd0aCk7XG4gIHJldHVybiB2YWx1ZXNba2V5XTtcbn07XG5cbmV4cG9ydHMuc2V0QmFsbFNwZWVkID0gZnVuY3Rpb24gKGlkLCB2YWx1ZSkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgQm91bmNlLmN1cnJlbnRCYWxsU3BlZWQgPSB2YWx1ZTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBCb3VuY2UuYmFsbENvdW50OyBpKyspIHtcbiAgICBCb3VuY2UuYmFsbFNwZWVkW2ldID0gdmFsdWU7XG4gIH1cbn07XG5cbmV4cG9ydHMuc2V0QmFja2dyb3VuZCA9IGZ1bmN0aW9uIChpZCwgdmFsdWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEJvdW5jZS5zZXRCYWNrZ3JvdW5kKHZhbHVlKTtcbn07XG5cbmV4cG9ydHMuc2V0QmFsbCA9IGZ1bmN0aW9uIChpZCwgdmFsdWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEJvdW5jZS5zZXRCYWxsKHZhbHVlKTtcbn07XG5cbmV4cG9ydHMuc2V0UGFkZGxlID0gZnVuY3Rpb24gKGlkLCB2YWx1ZSkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgQm91bmNlLnNldFBhZGRsZSh2YWx1ZSk7XG59O1xuXG5leHBvcnRzLnNldEJhY2tncm91bmQgPSBmdW5jdGlvbiAoaWQsIHZhbHVlKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBCb3VuY2Uuc2V0QmFja2dyb3VuZCh2YWx1ZSk7XG59O1xuXG5leHBvcnRzLnNldFBhZGRsZVNwZWVkID0gZnVuY3Rpb24gKGlkLCB2YWx1ZSkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgQm91bmNlLnBhZGRsZVNwZWVkID0gdmFsdWU7XG59O1xuXG5leHBvcnRzLnBsYXlTb3VuZCA9IGZ1bmN0aW9uKGlkLCBzb3VuZE5hbWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIHN0dWRpb0FwcC5wbGF5QXVkaW8oc291bmROYW1lKTtcbn07XG5cbmV4cG9ydHMubW92ZUxlZnQgPSBmdW5jdGlvbihpZCkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgQm91bmNlLnBhZGRsZVggLT0gQm91bmNlLnBhZGRsZVNwZWVkO1xuICBpZiAoQm91bmNlLnBhZGRsZVggPCAwKSB7XG4gICAgQm91bmNlLnBhZGRsZVggPSAwO1xuICB9XG59O1xuXG5leHBvcnRzLm1vdmVSaWdodCA9IGZ1bmN0aW9uKGlkKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBCb3VuY2UucGFkZGxlWCArPSBCb3VuY2UucGFkZGxlU3BlZWQ7XG4gIGlmIChCb3VuY2UucGFkZGxlWCA+IChCb3VuY2UuQ09MUyAtIDEpKSB7XG4gICAgQm91bmNlLnBhZGRsZVggPSBCb3VuY2UuQ09MUyAtIDE7XG4gIH1cbn07XG5cbmV4cG9ydHMubW92ZVVwID0gZnVuY3Rpb24oaWQpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEJvdW5jZS5wYWRkbGVZIC09IEJvdW5jZS5wYWRkbGVTcGVlZDtcbiAgaWYgKEJvdW5jZS5wYWRkbGVZIDwgMCkge1xuICAgIEJvdW5jZS5wYWRkbGVZID0gMDtcbiAgfVxufTtcblxuZXhwb3J0cy5tb3ZlRG93biA9IGZ1bmN0aW9uKGlkKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBCb3VuY2UucGFkZGxlWSArPSBCb3VuY2UucGFkZGxlU3BlZWQ7XG4gIGlmIChCb3VuY2UucGFkZGxlWSA+IChCb3VuY2UuUk9XUyAtIDEpKSB7XG4gICAgQm91bmNlLnBhZGRsZVkgPSBCb3VuY2UuUk9XUyAtIDE7XG4gIH1cbn07XG5cbmV4cG9ydHMuaW5jcmVtZW50T3Bwb25lbnRTY29yZSA9IGZ1bmN0aW9uKGlkKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBCb3VuY2Uub3Bwb25lbnRTY29yZSsrO1xuICBCb3VuY2UuZGlzcGxheVNjb3JlKCk7XG59O1xuXG5leHBvcnRzLmluY3JlbWVudFBsYXllclNjb3JlID0gZnVuY3Rpb24oaWQpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEJvdW5jZS5wbGF5ZXJTY29yZSsrO1xuICBCb3VuY2UuZGlzcGxheVNjb3JlKCk7XG59O1xuXG5leHBvcnRzLmxhdW5jaEJhbGwgPSBmdW5jdGlvbihpZCkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcblxuICAvLyBsb29rIGZvciBhbiBcIm91dCBvZiBwbGF5XCIgYmFsbCB0byByZS1sYXVuY2g6XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgQm91bmNlLmJhbGxDb3VudDsgaSsrKSB7XG4gICAgaWYgKEJvdW5jZS5pc0JhbGxPdXRPZkJvdW5kcyhpKSAmJlxuICAgICAgICAoMCA9PT0gKEJvdW5jZS5iYWxsRmxhZ3NbaV0gJiBCb3VuY2UuQmFsbEZsYWdzLkxBVU5DSElORykpKSB7XG4gICAgICAvLyBmb3VuZCBhbiBvdXQtb2YtYm91bmRzIGJhbGwgdGhhdCBpcyBub3QgYWxyZWFkeSBsYXVuY2hpbmcuLi5cbiAgICAgIC8vY29uc29sZS5sb2coXCJMQjogcmVsYXVuY2hpbmcgYmFsbCBcIiArIGkpO1xuICAgICAgQm91bmNlLmxhdW5jaEJhbGwoaSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgLy8gd2UgZGlkbid0IGZpbmQgYW4gXCJvdXQgb2YgcGxheVwiIGJhbGwsIHNvIGNyZWF0ZSBhbmQgbGF1bmNoIGEgbmV3IG9uZTpcbiAgaSA9IEJvdW5jZS5iYWxsQ291bnQ7XG4gIEJvdW5jZS5iYWxsQ291bnQrKztcbiAgQm91bmNlLmNyZWF0ZUJhbGxFbGVtZW50cyhpKTtcbiAgLy9jb25zb2xlLmxvZyhcIkxCOiBjcmVhdGVkIG5ldyBiYWxsIFwiICsgaSArIFwiIGNhbGxpbmcgcGxheVNvdW5kQW5kUmVzZXRCYWxsXCIpO1xuICBCb3VuY2UucGxheVNvdW5kQW5kUmVzZXRCYWxsKGkpO1xufTtcblxuZXhwb3J0cy5ib3VuY2VCYWxsID0gZnVuY3Rpb24oaWQpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG5cbiAgdmFyIGk7XG4gIGZvciAoaSA9IDA7IGkgPCBCb3VuY2UuYmFsbENvdW50OyBpKyspIHtcbiAgICBpZiAoMCA9PT0gKEJvdW5jZS5iYWxsRmxhZ3NbaV0gJlxuICAgICAgICAgICAgICAgKEJvdW5jZS5CYWxsRmxhZ3MuTUlTU0VEX1BBRERMRSB8IEJvdW5jZS5CYWxsRmxhZ3MuSU5fR09BTCkpKSB7XG4gICAgICBpZiAoQm91bmNlLmJhbGxYW2ldIDwgMCkge1xuICAgICAgICBCb3VuY2UuYmFsbFhbaV0gPSAwO1xuICAgICAgICBCb3VuY2UuYmFsbERpcltpXSA9IDIgKiBNYXRoLlBJIC0gQm91bmNlLmJhbGxEaXJbaV07XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJCb3VuY2VkIG9mZiBsZWZ0LCBiYWxsIFwiICsgaSk7XG4gICAgICB9IGVsc2UgaWYgKEJvdW5jZS5iYWxsWFtpXSA+IChCb3VuY2UuQ09MUyAtIDEpKSB7XG4gICAgICAgIEJvdW5jZS5iYWxsWFtpXSA9IEJvdW5jZS5DT0xTIC0gMTtcbiAgICAgICAgQm91bmNlLmJhbGxEaXJbaV0gPSAyICogTWF0aC5QSSAtIEJvdW5jZS5iYWxsRGlyW2ldO1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQm91bmNlZCBvZmYgcmlnaHQsIGJhbGwgXCIgKyBpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKEJvdW5jZS5iYWxsWVtpXSA8IHRpbGVzLllfVE9QX0JPVU5EQVJZKSB7XG4gICAgICAgIEJvdW5jZS5iYWxsWVtpXSA9IHRpbGVzLllfVE9QX0JPVU5EQVJZO1xuICAgICAgICBCb3VuY2UuYmFsbERpcltpXSA9IE1hdGguUEkgLSBCb3VuY2UuYmFsbERpcltpXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkJvdW5jZWQgb2ZmIHRvcCwgYmFsbCBcIiArIGkpO1xuICAgICAgfVxuXG4gICAgICB2YXIgeFBhZGRsZUJhbGwgPSBCb3VuY2UuYmFsbFhbaV0gLSBCb3VuY2UucGFkZGxlWDtcbiAgICAgIHZhciB5UGFkZGxlQmFsbCA9IEJvdW5jZS5iYWxsWVtpXSAtIEJvdW5jZS5wYWRkbGVZO1xuICAgICAgdmFyIGRpc3RQYWRkbGVCYWxsID0gQm91bmNlLmNhbGNEaXN0YW5jZSh4UGFkZGxlQmFsbCwgeVBhZGRsZUJhbGwpO1xuXG4gICAgICBpZiAoZGlzdFBhZGRsZUJhbGwgPCB0aWxlcy5QQURETEVfQkFMTF9DT0xMSURFX0RJU1RBTkNFKSB7XG4gICAgICAgIC8vIHBhZGRsZSBiYWxsIGNvbGxpc2lvblxuICAgICAgICBpZiAoTWF0aC5jb3MoQm91bmNlLmJhbGxEaXJbaV0pIDwgMCkge1xuICAgICAgICAgIC8vIHJhdGhlciB0aGFuIGp1c3QgYm91bmNlIHRoZSBiYWxsIG9mZiBhIGZsYXQgcGFkZGxlLCB3ZSBvZmZzZXQgdGhlXG4gICAgICAgICAgLy8gYW5nbGUgYWZ0ZXIgY29sbGlzaW9uIGJhc2VkIG9uIHdoZXRoZXIgeW91IGhpdCB0aGUgbGVmdCBvciByaWdodFxuICAgICAgICAgIC8vIHNpZGUgb2YgdGhlIHBhZGRsZS4gIEFuZCB0aGVuIHdlIGNhcCB0aGUgcmVzdWx0aW5nIGFuZ2xlIHRvIGJlIGluIGFcbiAgICAgICAgICAvLyBjZXJ0YWluIHJhbmdlIG9mIHJhZGlhbnMgc28gdGhlIHJlc3VsdGluZyBhbmdsZSBpc24ndCB0b28gZmxhdFxuICAgICAgICAgIHZhciBwYWRkbGVBbmdsZUJpYXMgPSAoMyAqIE1hdGguUEkgLyA4KSAqXG4gICAgICAgICAgICAgICh4UGFkZGxlQmFsbCAvIHRpbGVzLlBBRERMRV9CQUxMX0NPTExJREVfRElTVEFOQ0UpO1xuICAgICAgICAgIC8vIEFkZCA1IFBJIGluc3RlYWQgb2YgUEkgdG8gZW5zdXJlIHRoYXQgdGhlIHJlc3VsdGluZyBhbmdsZSBpc1xuICAgICAgICAgIC8vIHBvc2l0aXZlIHRvIHNpbXBsaWZ5IHRoZSB0ZXJuYXJ5IG9wZXJhdGlvbiBpbiB0aGUgbmV4dCBzdGF0ZW1lbnRcbiAgICAgICAgICBCb3VuY2UuYmFsbERpcltpXSA9XG4gICAgICAgICAgICAgICgoTWF0aC5QSSAqIDUpICsgcGFkZGxlQW5nbGVCaWFzIC0gQm91bmNlLmJhbGxEaXJbaV0pICVcbiAgICAgICAgICAgICAgIChNYXRoLlBJICogMik7XG4gICAgICAgICAgQm91bmNlLmJhbGxEaXJbaV0gPSAoQm91bmNlLmJhbGxEaXJbaV0gPCBNYXRoLlBJKSA/XG4gICAgICAgICAgICAgIE1hdGgubWluKChNYXRoLlBJIC8gMikgLSAwLjIsIEJvdW5jZS5iYWxsRGlyW2ldKSA6XG4gICAgICAgICAgICAgIE1hdGgubWF4KCgzICogTWF0aC5QSSAvIDIpICsgMC4yLCBCb3VuY2UuYmFsbERpcltpXSk7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhcIkJvdW5jZWQgb2ZmIHBhZGRsZSwgYmFsbCBcIiArIGkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENvbnN0YW50cyBmb3IgY2FyZGluYWwgZGlyZWN0aW9ucy4gIFN1YnNlcXVlbnQgY29kZSBhc3N1bWVzIHRoZXNlIGFyZVxuICogaW4gdGhlIHJhbmdlIDAuLjMgYW5kIHRoYXQgb3Bwb3NpdGVzIGhhdmUgYW4gYWJzb2x1dGUgZGlmZmVyZW5jZSBvZiAyLlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuZXhwb3J0cy5EaXJlY3Rpb24gPSB7XG4gIE5PUlRIOiAwLFxuICBFQVNUOiAxLFxuICBTT1VUSDogMixcbiAgV0VTVDogM1xufTtcblxuZXhwb3J0cy5QQURETEVfQkFMTF9DT0xMSURFX0RJU1RBTkNFID0gMC43O1xuZXhwb3J0cy5GSU5JU0hfQ09MTElERV9ESVNUQU5DRSA9IDAuNTtcbmV4cG9ydHMuREVGQVVMVF9CQUxMX1NQRUVEID0gMC4xO1xuZXhwb3J0cy5ERUZBVUxUX0JBTExfRElSRUNUSU9OID0gMS4yNSAqIE1hdGguUEk7XG5leHBvcnRzLkRFRkFVTFRfUEFERExFX1NQRUVEID0gMC4xO1xuZXhwb3J0cy5ERUZBVUxUX0JBTExfU1RBUlRfWSA9IDI7XG5leHBvcnRzLllfVE9QX0JPVU5EQVJZID0gLTAuMjtcblxuLyoqXG4gKiBUaGUgdHlwZXMgb2Ygc3F1YXJlcyBpbiB0aGUgbWF6ZSwgd2hpY2ggaXMgcmVwcmVzZW50ZWRcbiAqIGFzIGEgMkQgYXJyYXkgb2YgU3F1YXJlVHlwZSB2YWx1ZXMuXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5leHBvcnRzLlNxdWFyZVR5cGUgPSB7XG4gIE9QRU46IDAsXG4gIFdBTEw6IDEsXG4gIEdPQUw6IDIsXG4gIEJBTExTVEFSVDogNCxcbiAgUEFERExFRklOSVNIOiA4LFxuICBQQURETEVTVEFSVDogMTYsXG4gIEJBTExGSU5JU0g6IDMyLFxuICBPQlNUQUNMRTogNjRcbn07XG4iXX0=
