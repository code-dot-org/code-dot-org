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

  config.html = page({
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

  studioApp.init(config);

  var finishButton = document.getElementById('finishButton');
  dom.addClickTouchEvent(finishButton, Bounce.onPuzzleComplete);
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

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../constants":"/home/ubuntu/staging/apps/build/js/constants.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../hammer":"/home/ubuntu/staging/apps/build/js/hammer.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../timeoutList":"/home/ubuntu/staging/apps/build/js/timeoutList.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./api":"/home/ubuntu/staging/apps/build/js/bounce/api.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/bounce/controls.html.ejs","./locale":"/home/ubuntu/staging/apps/build/js/bounce/locale.js","./tiles":"/home/ubuntu/staging/apps/build/js/bounce/tiles.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/bounce/visualization.html.ejs"}],"/home/ubuntu/staging/apps/build/js/bounce/visualization.html.ejs":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9ib3VuY2UvbWFpbi5qcyIsImJ1aWxkL2pzL2JvdW5jZS9za2lucy5qcyIsImJ1aWxkL2pzL2JvdW5jZS9sZXZlbHMuanMiLCJidWlsZC9qcy9ib3VuY2UvYm91bmNlLmpzIiwiYnVpbGQvanMvYm91bmNlL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9ib3VuY2UvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9ib3VuY2UvYmxvY2tzLmpzIiwiYnVpbGQvanMvYm91bmNlL2xvY2FsZS5qcyIsImJ1aWxkL2pzL2JvdW5jZS9hcGkuanMiLCJidWlsZC9qcy9ib3VuY2UvdGlsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDVkEsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVwQyxJQUFJLE9BQU8sR0FBRzs7QUFFWixRQUFNLEVBQUU7QUFDTix3Q0FBb0MsRUFBRSxJQUFJO0FBQzFDLGVBQVcsRUFBRSxFQUFFO0dBQ2hCOztDQUVGLENBQUM7O0FBRUYsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDcEMsTUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEMsTUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFOUIsTUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLGNBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxD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QUMsVUFBVSxHQUFHO0FBQ25CLE1BQUksRUFBRSxDQUFDO0FBQ1AsTUFBSSxFQUFFLENBQUM7QUFDUCxNQUFJLEVBQUUsQ0FBQztBQUNQLFdBQVMsRUFBRSxDQUFDO0FBQ1osY0FBWSxFQUFFLENBQUM7QUFDZixhQUFXLEVBQUUsRUFBRTtBQUNmLFlBQVUsRUFBRSxFQUFFO0FBQ2QsVUFBUSxFQUFFLEVBQUU7Q0FDYixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuQm91bmNlID0gcmVxdWlyZSgnLi9ib3VuY2UnKTtcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICBnbG9iYWwuQm91bmNlID0gd2luZG93LkJvdW5jZTtcbn1cbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuL3NraW5zJyk7XG5cbndpbmRvdy5ib3VuY2VNYWluID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgYXBwTWFpbih3aW5kb3cuQm91bmNlLCBsZXZlbHMsIG9wdGlvbnMpO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbUoxYVd4a0wycHpMMkp2ZFc1alpTOXRZV2x1TG1weklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN096dEJRVUZCTEVsQlFVa3NUMEZCVHl4SFFVRkhMRTlCUVU4c1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF6dEJRVU53UXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0QlFVTndReXhKUVVGSkxFOUJRVThzVFVGQlRTeExRVUZMTEZkQlFWY3NSVUZCUlR0QlFVTnFReXhSUVVGTkxFTkJRVU1zVFVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNN1EwRkRMMEk3UVVGRFJDeEpRVUZKTEUxQlFVMHNSMEZCUnl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03UVVGRGFrTXNTVUZCU1N4TlFVRk5MRWRCUVVjc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzBGQlEycERMRWxCUVVrc1MwRkJTeXhIUVVGSExFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXpzN1FVRkZMMElzVFVGQlRTeERRVUZETEZWQlFWVXNSMEZCUnl4VlFVRlRMRTlCUVU4c1JVRkJSVHRCUVVOd1F5eFRRVUZQTEVOQlFVTXNWMEZCVnl4SFFVRkhMRXRCUVVzc1EwRkJRenRCUVVNMVFpeFRRVUZQTEVOQlFVTXNXVUZCV1N4SFFVRkhMRTFCUVUwc1EwRkJRenRCUVVNNVFpeFRRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRTFCUVUwc1JVRkJSU3hOUVVGTkxFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdRMEZEZWtNc1EwRkJReUlzSW1acGJHVWlPaUpuWlc1bGNtRjBaV1F1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaWRtRnlJR0Z3Y0UxaGFXNGdQU0J5WlhGMWFYSmxLQ2N1TGk5aGNIQk5ZV2x1SnlrN1hHNTNhVzVrYjNjdVFtOTFibU5sSUQwZ2NtVnhkV2x5WlNnbkxpOWliM1Z1WTJVbktUdGNibWxtSUNoMGVYQmxiMllnWjJ4dlltRnNJQ0U5UFNBbmRXNWtaV1pwYm1Wa0p5a2dlMXh1SUNCbmJHOWlZV3d1UW05MWJtTmxJRDBnZDJsdVpHOTNMa0p2ZFc1alpUdGNibjFjYm5aaGNpQmliRzlqYTNNZ1BTQnlaWEYxYVhKbEtDY3VMMkpzYjJOcmN5Y3BPMXh1ZG1GeUlHeGxkbVZzY3lBOUlISmxjWFZwY21Vb0p5NHZiR1YyWld4ekp5azdYRzUyWVhJZ2MydHBibk1nUFNCeVpYRjFhWEpsS0NjdUwzTnJhVzV6SnlrN1hHNWNibmRwYm1SdmR5NWliM1Z1WTJWTllXbHVJRDBnWm5WdVkzUnBiMjRvYjNCMGFXOXVjeWtnZTF4dUlDQnZjSFJwYjI1ekxuTnJhVzV6VFc5a2RXeGxJRDBnYzJ0cGJuTTdYRzRnSUc5d2RHbHZibk11WW14dlkydHpUVzlrZFd4bElEMGdZbXh2WTJ0ek8xeHVJQ0JoY0hCTllXbHVLSGRwYm1SdmR5NUNiM1Z1WTJVc0lHeGxkbVZzY3l3Z2IzQjBhVzl1Y3lrN1hHNTlPMXh1SWwxOSIsIi8qKlxuICogTG9hZCBTa2luIGZvciBCb3VuY2UuXG4gKi9cbi8vIHRpbGVzOiBBIDI1MHgyMDAgc2V0IG9mIDIwIG1hcCBpbWFnZXMuXG4vLyBnb2FsOiBBIDIweDM0IGdvYWwgaW1hZ2UuXG4vLyBiYWNrZ3JvdW5kOiBOdW1iZXIgb2YgNDAweDQwMCBiYWNrZ3JvdW5kIGltYWdlcy4gUmFuZG9tbHkgc2VsZWN0IG9uZSBpZlxuLy8gc3BlY2lmaWVkLCBvdGhlcndpc2UsIHVzZSBiYWNrZ3JvdW5kLnBuZy5cbi8vIGdyYXBoOiBDb2xvdXIgb2Ygb3B0aW9uYWwgZ3JpZCBsaW5lcywgb3IgZmFsc2UuXG5cbnZhciBza2luc0Jhc2UgPSByZXF1aXJlKCcuLi9za2lucycpO1xuXG52YXIgQ09ORklHUyA9IHtcblxuICBib3VuY2U6IHtcbiAgICBub25EaXNhcHBlYXJpbmdQZWdtYW5IaXR0aW5nT2JzdGFjbGU6IHRydWUsXG4gICAgYmFsbFlPZmZzZXQ6IDEwXG4gIH1cblxufTtcblxuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24oYXNzZXRVcmwsIGlkKSB7XG4gIHZhciBza2luID0gc2tpbnNCYXNlLmxvYWQoYXNzZXRVcmwsIGlkKTtcbiAgdmFyIGNvbmZpZyA9IENPTkZJR1Nbc2tpbi5pZF07XG5cbiAgc2tpbi5yZXRybyA9IHtcbiAgICBiYWNrZ3JvdW5kOiBza2luLmFzc2V0VXJsKCdyZXRyb19iYWNrZ3JvdW5kLnBuZycpLFxuICAgIHRpbGVzOiBza2luLmFzc2V0VXJsKCdyZXRyb190aWxlc193YWxsLnBuZycpLFxuICAgIGdvYWxUaWxlczogc2tpbi5hc3NldFVybCgncmV0cm9fdGlsZXNfZ29hbC5wbmcnKSxcbiAgICBwYWRkbGU6IHNraW4uYXNzZXRVcmwoJ3JldHJvX3BhZGRsZS5wbmcnKSxcbiAgICBiYWxsOiBza2luLmFzc2V0VXJsKCdyZXRyb19iYWxsLnBuZycpXG4gIH07XG5cbiAgLy8gSW1hZ2VzXG4gIHNraW4udGlsZXMgPSBza2luLmFzc2V0VXJsKCd0aWxlc193YWxsLnBuZycpO1xuICBza2luLmdvYWxUaWxlcyA9IHNraW4uYXNzZXRVcmwoJ3RpbGVzX2dvYWwucG5nJyk7XG4gIHNraW4uZ29hbCA9IHNraW4uYXNzZXRVcmwoJ2dvYWwucG5nJyk7XG4gIHNraW4uZ29hbFN1Y2Nlc3MgPSBza2luLmFzc2V0VXJsKCdnb2FsX3N1Y2Nlc3MucG5nJyk7XG4gIHNraW4uYmFsbCA9IHNraW4uYXNzZXRVcmwoJ2JhbGwucG5nJyk7XG4gIHNraW4ucGFkZGxlID0gc2tpbi5hc3NldFVybCgncGFkZGxlLnBuZycpO1xuICBza2luLm9ic3RhY2xlID0gc2tpbi5hc3NldFVybCgnb2JzdGFjbGUucG5nJyk7XG4gIGlmIChjb25maWcubm9uRGlzYXBwZWFyaW5nUGVnbWFuSGl0dGluZ09ic3RhY2xlKSB7XG4gICAgc2tpbi5ub25EaXNhcHBlYXJpbmdQZWdtYW5IaXR0aW5nT2JzdGFjbGUgPSB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHNraW4ubm9uRGlzYXBwZWFyaW5nUGVnbWFuSGl0dGluZ09ic3RhY2xlID0gZmFsc2U7XG4gIH1cbiAgc2tpbi5vYnN0YWNsZVNjYWxlID0gY29uZmlnLm9ic3RhY2xlU2NhbGUgfHwgMS4wO1xuICBza2luLmxhcmdlck9ic3RhY2xlQW5pbWF0aW9uVGlsZXMgPVxuICAgICAgc2tpbi5hc3NldFVybChjb25maWcubGFyZ2VyT2JzdGFjbGVBbmltYXRpb25UaWxlcyk7XG4gIHNraW4uaGl0dGluZ1dhbGxBbmltYXRpb24gPVxuICAgICAgc2tpbi5hc3NldFVybChjb25maWcuaGl0dGluZ1dhbGxBbmltYXRpb24pO1xuICBza2luLmFwcHJvYWNoaW5nR29hbEFuaW1hdGlvbiA9XG4gICAgICBza2luLmFzc2V0VXJsKGNvbmZpZy5hcHByb2FjaGluZ0dvYWxBbmltYXRpb24pO1xuICAvLyBTb3VuZHNcbiAgc2tpbi5ydWJiZXJTb3VuZCA9IFtza2luLmFzc2V0VXJsKCd3YWxsLm1wMycpLCBza2luLmFzc2V0VXJsKCd3YWxsLm9nZycpXTtcbiAgc2tpbi5mbGFnU291bmQgPSBbc2tpbi5hc3NldFVybCgnd2luX2dvYWwubXAzJyksXG4gICAgICAgICAgICAgICAgICAgIHNraW4uYXNzZXRVcmwoJ3dpbl9nb2FsLm9nZycpXTtcbiAgc2tpbi5jcnVuY2hTb3VuZCA9IFtza2luLmFzc2V0VXJsKCd3YWxsMC5tcDMnKSwgc2tpbi5hc3NldFVybCgnd2FsbDAub2dnJyldO1xuICBza2luLmJhbGxTdGFydFNvdW5kID0gW3NraW4uYXNzZXRVcmwoJ2JhbGxfc3RhcnQubXAzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5hc3NldFVybCgnYmFsbF9zdGFydC5vZ2cnKV07XG4gIHNraW4ud2luUG9pbnRTb3VuZCA9IFtza2luLmFzc2V0VXJsKCcxX3dlX3dpbi5tcDMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uYXNzZXRVcmwoJzFfd2Vfd2luLm9nZycpXTtcbiAgc2tpbi53aW5Qb2ludDJTb3VuZCA9IFtza2luLmFzc2V0VXJsKCcyX3dlX3dpbi5tcDMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBza2luLmFzc2V0VXJsKCcyX3dlX3dpbi5vZ2cnKV07XG4gIHNraW4ubG9zZVBvaW50U291bmQgPSBbc2tpbi5hc3NldFVybCgnMV93ZV9sb3NlLm1wMycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uYXNzZXRVcmwoJzFfd2VfbG9zZS5vZ2cnKV07XG4gIHNraW4ubG9zZVBvaW50MlNvdW5kID0gW3NraW4uYXNzZXRVcmwoJzJfd2VfbG9zZS5tcDMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5hc3NldFVybCgnMl93ZV9sb3NlLm9nZycpXTtcbiAgc2tpbi5nb2FsMVNvdW5kID0gW3NraW4uYXNzZXRVcmwoJzFfZ29hbC5tcDMnKSwgc2tpbi5hc3NldFVybCgnMV9nb2FsLm9nZycpXTtcbiAgc2tpbi5nb2FsMlNvdW5kID0gW3NraW4uYXNzZXRVcmwoJzJfZ29hbC5tcDMnKSwgc2tpbi5hc3NldFVybCgnMl9nb2FsLm9nZycpXTtcbiAgc2tpbi53b29kU291bmQgPSBbc2tpbi5hc3NldFVybCgnMV9wYWRkbGVfYm91bmNlLm1wMycpLFxuICAgICAgICAgICAgICAgICAgICBza2luLmFzc2V0VXJsKCcxX3BhZGRsZV9ib3VuY2Uub2dnJyldO1xuICBza2luLnJldHJvU291bmQgPSBbc2tpbi5hc3NldFVybCgnMl9wYWRkbGVfYm91bmNlLm1wMycpLFxuICAgICAgICAgICAgICAgICAgICAgc2tpbi5hc3NldFVybCgnMl9wYWRkbGVfYm91bmNlLm9nZycpXTtcbiAgc2tpbi5zbGFwU291bmQgPSBbc2tpbi5hc3NldFVybCgnMV93YWxsX2JvdW5jZS5tcDMnKSxcbiAgICAgICAgICAgICAgICAgICAgc2tpbi5hc3NldFVybCgnMV93YWxsX2JvdW5jZS5vZ2cnKV07XG4gIHNraW4uaGl0U291bmQgPSBbc2tpbi5hc3NldFVybCgnMl93YWxsX2JvdW5jZS5tcDMnKSxcbiAgICAgICAgICAgICAgICAgICBza2luLmFzc2V0VXJsKCcyX3dhbGxfYm91bmNlLm9nZycpXTtcblxuICAvLyBTZXR0aW5nc1xuICBpZiAoY29uZmlnLmJhY2tncm91bmQgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNvbmZpZy5iYWNrZ3JvdW5kKTtcbiAgICBza2luLmJhY2tncm91bmQgPSBza2luLmFzc2V0VXJsKCdiYWNrZ3JvdW5kJyArIGluZGV4ICsgJy5wbmcnKTtcbiAgfSBlbHNlIHtcbiAgICBza2luLmJhY2tncm91bmQgPSBza2luLmFzc2V0VXJsKCdiYWNrZ3JvdW5kLnBuZycpO1xuICB9XG4gIHNraW4ucGVnbWFuSGVpZ2h0ID0gY29uZmlnLnBlZ21hbkhlaWdodCB8fCA1MjtcbiAgc2tpbi5wZWdtYW5XaWR0aCA9IGNvbmZpZy5wZWdtYW5XaWR0aCB8fCA0OTtcbiAgc2tpbi5iYWxsWU9mZnNldCA9IGNvbmZpZy5iYWxsWU9mZnNldCB8fCAwO1xuICBza2luLnBhZGRsZVlPZmZzZXQgPSBjb25maWcucGFkZGxlWU9mZnNldCB8fCAwO1xuICByZXR1cm4gc2tpbjtcbn07XG4iLCIvKmpzaGludCBtdWx0aXN0cjogdHJ1ZSAqL1xuXG52YXIgRGlyZWN0aW9uID0gcmVxdWlyZSgnLi90aWxlcycpLkRpcmVjdGlvbjtcbnZhciB0YiA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJykuY3JlYXRlVG9vbGJveDtcblxuLypcbiAqIENvbmZpZ3VyYXRpb24gZm9yIGFsbCBsZXZlbHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICcxJzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFt7J3Rlc3QnOiAnbW92ZUxlZnQnLCAndHlwZSc6ICdib3VuY2VfbW92ZUxlZnQnfV1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3NvZnRCdXR0b25zJzogW1xuICAgICAgJ2xlZnRCdXR0b24nXG4gICAgXSxcbiAgICAnbWFwJzogW1xuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICAgICAgWzgsIDAsIDAsMTYsIDAsIDAsIDAsIDBdLFxuICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdXG4gICAgXSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YignPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZUxlZnRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX21vdmVSaWdodFwiPjwvYmxvY2s+JyksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgJzxibG9jayB0eXBlPVwiYm91bmNlX3doZW5MZWZ0XCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPidcbiAgfSxcbiAgJzInOiB7XG4gICAgJ2lkZWFsJzogNSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ21vdmVSaWdodCcsICd0eXBlJzogJ2JvdW5jZV9tb3ZlUmlnaHQnfV0sXG4gICAgICBbeyd0ZXN0JzogJ21vdmVMZWZ0JywgJ3R5cGUnOiAnYm91bmNlX21vdmVMZWZ0J31dXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICdzb2Z0QnV0dG9ucyc6IFtcbiAgICAgICdsZWZ0QnV0dG9uJyxcbiAgICAgICdyaWdodEJ1dHRvbidcbiAgICBdLFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbOCwgMCwgMCwxNiwgMCwgMCwgMCwgOF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdLFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKCc8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlTGVmdFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZVJpZ2h0XCI+PC9ibG9jaz4nKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAnPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbkxlZnRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuUmlnaHRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIxODBcIiB5PVwiMjBcIj48L2Jsb2NrPidcbiAgfSxcbiAgJzMnOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdtb3ZlVXAnLCAndHlwZSc6ICdib3VuY2VfbW92ZVVwJ31dXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICdzb2Z0QnV0dG9ucyc6IFtcbiAgICAgICd1cEJ1dHRvbidcbiAgICBdLFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgMCwgOCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwxNiwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF1cbiAgICBdLFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKCc8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlTGVmdFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZVJpZ2h0XCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlVXBcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX21vdmVEb3duXCI+PC9ibG9jaz4nKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAnPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlblVwXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPidcbiAgfSxcbiAgJzQnOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdtb3ZlUmlnaHQnLCAndHlwZSc6ICdib3VuY2VfbW92ZVJpZ2h0J31dLFxuICAgICAgW3sndGVzdCc6ICdtb3ZlTGVmdCcsICd0eXBlJzogJ2JvdW5jZV9tb3ZlTGVmdCd9XSxcbiAgICAgIFt7J3Rlc3QnOiAnbW92ZVVwJywgJ3R5cGUnOiAnYm91bmNlX21vdmVVcCd9XSxcbiAgICAgIFt7J3Rlc3QnOiAnbW92ZURvd24nLCAndHlwZSc6ICdib3VuY2VfbW92ZURvd24nfV1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3NvZnRCdXR0b25zJzogW1xuICAgICAgJ2xlZnRCdXR0b24nLFxuICAgICAgJ3JpZ2h0QnV0dG9uJyxcbiAgICAgICdkb3duQnV0dG9uJyxcbiAgICAgICd1cEJ1dHRvbidcbiAgICBdLFxuICAgICdtYXAnOiBbXG4gICAgICBbMCwgMCwgOCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgOF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbOCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwxNiwgMCwgMCwgMCwgMF0sXG4gICAgICBbMCwgMCwgMCwgMCwgMCwgOCwgMCwgMF1cbiAgICBdLFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKCc8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlTGVmdFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZVJpZ2h0XCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlVXBcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX21vdmVEb3duXCI+PC9ibG9jaz4nKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAnPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbkxlZnRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuUmlnaHRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIxODBcIiB5PVwiMjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlblVwXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMTIwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5Eb3duXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMTgwXCIgeT1cIjEyMFwiPjwvYmxvY2s+J1xuICB9LFxuICAnNSc6IHtcbiAgICAndGltZW91dEZhaWx1cmVUaWNrJzogMTAwLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFt7J3Rlc3QnOiAnYm91bmNlQmFsbCcsICd0eXBlJzogJ2JvdW5jZV9ib3VuY2VCYWxsJ31dXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICdiYWxsRGlyZWN0aW9uJzogKDEuMjg1ICogTWF0aC5QSSksXG4gICAgJ21hcCc6IFtcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFszMiwwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCA0LCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgICAgIFswLCAwLCAwLDE2LCAwLCAwLCAwLCAwXVxuICAgIF0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoJzxibG9jayB0eXBlPVwiYm91bmNlX2JvdW5jZUJhbGxcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3BsYXlTb3VuZFwiPjwvYmxvY2s+JyksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgJzxibG9jayB0eXBlPVwiYm91bmNlX3doZW5QYWRkbGVDb2xsaWRlZFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4nXG4gIH0sXG4gICc2Jzoge1xuICAgICd0aW1lb3V0RmFpbHVyZVRpY2snOiAxNDAsXG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdib3VuY2VCYWxsJywgJ3R5cGUnOiAnYm91bmNlX2JvdW5jZUJhbGwnfV1cbiAgICBdLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ2JhbGxEaXJlY3Rpb24nOiAoMS4yODUgKiBNYXRoLlBJKSxcbiAgICAnbWFwJzogW1xuICAgICAgWzEsIDEsMzMsIDEsIDEsIDEsIDEsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDQsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsMTYsIDAsIDAsIDAsIDFdXG4gICAgXSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YignPGJsb2NrIHR5cGU9XCJib3VuY2VfYm91bmNlQmFsbFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfcGxheVNvdW5kXCI+PC9ibG9jaz4nKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAnPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlblBhZGRsZUNvbGxpZGVkXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbldhbGxDb2xsaWRlZFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjEyMFwiPjwvYmxvY2s+J1xuICB9LFxuICAnNyc6IHtcbiAgICAndGltZW91dEZhaWx1cmVUaWNrJzogOTAwLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFt7J3Rlc3QnOiAnbW92ZUxlZnQnLCAndHlwZSc6ICdib3VuY2VfbW92ZUxlZnQnfV0sXG4gICAgICBbeyd0ZXN0JzogJ21vdmVSaWdodCcsICd0eXBlJzogJ2JvdW5jZV9tb3ZlUmlnaHQnfV0sXG4gICAgICBbeyd0ZXN0JzogJ2JvdW5jZUJhbGwnLCAndHlwZSc6ICdib3VuY2VfYm91bmNlQmFsbCd9XVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAnc29mdEJ1dHRvbnMnOiBbXG4gICAgICAnbGVmdEJ1dHRvbicsXG4gICAgICAncmlnaHRCdXR0b24nXG4gICAgXSxcbiAgICAnZmFpbE9uQmFsbEV4aXQnIDogdHJ1ZSxcbiAgICAnbWFwJzogW1xuICAgICAgWzEsIDEsIDEsIDEsIDEsIDEsIDEsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsMzIsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDQsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsMTYsIDAsIDAsIDAsIDAsIDFdXG4gICAgXSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YignPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZUxlZnRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX21vdmVSaWdodFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfYm91bmNlQmFsbFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfcGxheVNvdW5kXCI+PC9ibG9jaz4nKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAnPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbkxlZnRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuUmlnaHRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIxODBcIiB5PVwiMjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlblBhZGRsZUNvbGxpZGVkXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMTIwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5XYWxsQ29sbGlkZWRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMjBcIj48L2Jsb2NrPidcbiAgfSxcbi8qXG4gICc4Jzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFt7J3Rlc3QnOiAnbW92ZVJpZ2h0JywgJ3R5cGUnOiAnYm91bmNlX21vdmVSaWdodCd9XVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAnc29mdEJ1dHRvbnMnOiBbXG4gICAgICAnbGVmdEJ1dHRvbicsXG4gICAgICAncmlnaHRCdXR0b24nXG4gICAgXSxcbiAgICAnbWFwJzogW1xuICAgICAgWzEsIDEsIDEsIDEsIDUsIDEsIDEsIDFdLFxuICAgICAgWzEsIDAsIDQsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDQsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDQsIDFdLFxuICAgICAgWzEsIDQsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsMTYsIDAsIDAsIDAsIDAsIDFdXG4gICAgXSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YignPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZUxlZnRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX21vdmVSaWdodFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfYm91bmNlQmFsbFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfcGxheVNvdW5kXCI+PC9ibG9jaz4nKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAnPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbkxlZnRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuUmlnaHRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIxODBcIiB5PVwiMjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlblBhZGRsZUNvbGxpZGVkXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMTIwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5XYWxsQ29sbGlkZWRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMjBcIj48L2Jsb2NrPidcbiAgfSxcbiAgJzknOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdtb3ZlUmlnaHQnLCAndHlwZSc6ICdib3VuY2VfbW92ZVJpZ2h0J31dXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICdzb2Z0QnV0dG9ucyc6IFtcbiAgICAgICdsZWZ0QnV0dG9uJyxcbiAgICAgICdyaWdodEJ1dHRvbidcbiAgICBdLFxuICAgICdtYXAnOiBbXG4gICAgICBbMSwgNSwgMSwgNSwgMSwgNSwgMSwgNV0sXG4gICAgICBbNSwgMCwgNCwgMCwgNCwgMCwgNCwgMV0sXG4gICAgICBbMSwgNCwgMCwgNCwgMCwgNCwgMCwgNV0sXG4gICAgICBbNSwgMCwgNCwgMCwgNCwgMCwgNCwgMV0sXG4gICAgICBbMSwgNCwgMCwgNCwgMCwgNCwgMCwgNV0sXG4gICAgICBbNSwgMCwgNCwgMCwgNCwgMCwgNCwgMV0sXG4gICAgICBbMSwgNCwgMCwgNCwgMCwgNCwgMCwgNV0sXG4gICAgICBbMSwgMCwxNiwgMCwgMCwgMCwgMCwgMV1cbiAgICBdLFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKCc8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlTGVmdFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZVJpZ2h0XCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9ib3VuY2VCYWxsXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9wbGF5U291bmRcIj48L2Jsb2NrPicpLFxuICAgICdzdGFydEJsb2Nrcyc6XG4gICAgICc8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuTGVmdFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5SaWdodFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjE4MFwiIHk9XCIyMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuUGFkZGxlQ29sbGlkZWRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIxMjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbldhbGxDb2xsaWRlZFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIyMFwiPjwvYmxvY2s+J1xuICB9LFxuKi9cbiAgJzEwJzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFt7J3Rlc3QnOiAnbW92ZUxlZnQnLCAndHlwZSc6ICdib3VuY2VfbW92ZUxlZnQnfV0sXG4gICAgICBbeyd0ZXN0JzogJ21vdmVSaWdodCcsICd0eXBlJzogJ2JvdW5jZV9tb3ZlUmlnaHQnfV0sXG4gICAgICBbeyd0ZXN0JzogJ2JvdW5jZUJhbGwnLCAndHlwZSc6ICdib3VuY2VfYm91bmNlQmFsbCd9XSxcbiAgICAgIFt7J3Rlc3QnOiAnaW5jcmVtZW50UGxheWVyU2NvcmUnLCAndHlwZSc6ICdib3VuY2VfaW5jcmVtZW50UGxheWVyU2NvcmUnfV0sXG4gICAgICBbeyd0ZXN0JzogJ2luY3JlbWVudE9wcG9uZW50U2NvcmUnLCAndHlwZSc6ICdib3VuY2VfaW5jcmVtZW50T3Bwb25lbnRTY29yZSd9XVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAnc29mdEJ1dHRvbnMnOiBbXG4gICAgICAnbGVmdEJ1dHRvbicsXG4gICAgICAncmlnaHRCdXR0b24nXG4gICAgXSxcbiAgICAnZ29hbCc6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIChCb3VuY2Uub3Bwb25lbnRTY29yZSA+PSAyKTtcbiAgICAgIH1cbiAgICB9LFxuICAgICdyZXNwYXduQmFsbHMnIDogdHJ1ZSxcbiAgICAnbWFwJzogW1xuICAgICAgWzEsIDEsIDIsIDIsIDIsIDIsIDEsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDQsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsMTYsIDAsIDAsIDAsIDAsIDFdXG4gICAgXSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YignPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZUxlZnRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX21vdmVSaWdodFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfYm91bmNlQmFsbFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfcGxheVNvdW5kXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9pbmNyZW1lbnRQbGF5ZXJTY29yZVwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfaW5jcmVtZW50T3Bwb25lbnRTY29yZVwiPjwvYmxvY2s+JyksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgJzxibG9jayB0eXBlPVwiYm91bmNlX3doZW5MZWZ0XCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlblJpZ2h0XCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMTgwXCIgeT1cIjIwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5QYWRkbGVDb2xsaWRlZFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjEwMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuV2FsbENvbGxpZGVkXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMTgwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5CYWxsSW5Hb2FsXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjYwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5CYWxsTWlzc2VzUGFkZGxlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMzQwXCI+PC9ibG9jaz4nXG4gIH0sXG4gICcxMSc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ21vdmVMZWZ0JywgJ3R5cGUnOiAnYm91bmNlX21vdmVMZWZ0J31dLFxuICAgICAgW3sndGVzdCc6ICdtb3ZlUmlnaHQnLCAndHlwZSc6ICdib3VuY2VfbW92ZVJpZ2h0J31dLFxuICAgICAgW3sndGVzdCc6ICdib3VuY2VCYWxsJywgJ3R5cGUnOiAnYm91bmNlX2JvdW5jZUJhbGwnfV0sXG4gICAgICBbeyd0ZXN0JzogJ2luY3JlbWVudFBsYXllclNjb3JlJywgJ3R5cGUnOiAnYm91bmNlX2luY3JlbWVudFBsYXllclNjb3JlJ31dLFxuICAgICAgW3sndGVzdCc6ICdpbmNyZW1lbnRPcHBvbmVudFNjb3JlJywgJ3R5cGUnOiAnYm91bmNlX2luY3JlbWVudE9wcG9uZW50U2NvcmUnfV0sXG4gICAgICBbeyd0ZXN0JzogJ2xhdW5jaEJhbGwnLCAndHlwZSc6ICdib3VuY2VfbGF1bmNoQmFsbCd9XVxuICAgIF0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAnc29mdEJ1dHRvbnMnOiBbXG4gICAgICAnbGVmdEJ1dHRvbicsXG4gICAgICAncmlnaHRCdXR0b24nXG4gICAgXSxcbiAgICAnbWluV29ya3NwYWNlSGVpZ2h0JzogNzUwLFxuICAgICdnb2FsJzoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gKEJvdW5jZS5vcHBvbmVudFNjb3JlID49IDIpO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ21hcCc6IFtcbiAgICAgIFsxLCAxLCAyLCAyLCAyLCAyLCAxLCAxXSxcbiAgICAgIFsxLCAwLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgICAgIFsxLCAwLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgICAgIFsxLCAwLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgICAgIFsxLCAwLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgICAgIFsxLCAwLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgICAgIFsxLCAwLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgICAgIFsxLCAwLDE2LCAwLCAwLCAwLCAwLCAxXVxuICAgIF0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoJzxibG9jayB0eXBlPVwiYm91bmNlX21vdmVMZWZ0XCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9tb3ZlUmlnaHRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX2JvdW5jZUJhbGxcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3BsYXlTb3VuZFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfaW5jcmVtZW50UGxheWVyU2NvcmVcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX2luY3JlbWVudE9wcG9uZW50U2NvcmVcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX2xhdW5jaEJhbGxcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3NldFBhZGRsZVNwZWVkXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9zZXRCYWxsU3BlZWRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3NldEJhY2tncm91bmRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3NldEJhbGxcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3NldFBhZGRsZVwiPjwvYmxvY2s+JyksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgJzxibG9jayB0eXBlPVwid2hlbl9ydW5cIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCIyMFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuTGVmdFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjE4MFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuUmlnaHRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIxODBcIiB5PVwiMTgwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5QYWRkbGVDb2xsaWRlZFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjI3MFwiPjwvYmxvY2s+IFxcXG4gICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV93aGVuV2FsbENvbGxpZGVkXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMzcwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5CYWxsSW5Hb2FsXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiNDcwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5CYWxsTWlzc2VzUGFkZGxlXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiNTkwXCI+PC9ibG9jaz4nXG4gIH0sXG4gICcxMic6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgXSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICdzb2Z0QnV0dG9ucyc6IFtcbiAgICAgICdsZWZ0QnV0dG9uJyxcbiAgICAgICdyaWdodEJ1dHRvbidcbiAgICBdLFxuICAgICdtaW5Xb3Jrc3BhY2VIZWlnaHQnOiA4MDAsXG4gICAgJ2ZyZWVQbGF5JzogdHJ1ZSxcbiAgICAnbWFwJzogW1xuICAgICAgWzEsIDEsIDIsIDIsIDIsIDIsIDEsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICAgICAgWzEsIDAsMTYsIDAsIDAsIDAsIDAsIDFdXG4gICAgXSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YignPGJsb2NrIHR5cGU9XCJib3VuY2VfbW92ZUxlZnRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX21vdmVSaWdodFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfYm91bmNlQmFsbFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfcGxheVNvdW5kXCI+PC9ibG9jaz4gXFxcbiAgICAgICAgICA8YmxvY2sgdHlwZT1cImJvdW5jZV9pbmNyZW1lbnRQbGF5ZXJTY29yZVwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfaW5jcmVtZW50T3Bwb25lbnRTY29yZVwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2VfbGF1bmNoQmFsbFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfc2V0UGFkZGxlU3BlZWRcIj48L2Jsb2NrPiBcXFxuICAgICAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3NldEJhbGxTcGVlZFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfc2V0QmFja2dyb3VuZFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfc2V0QmFsbFwiPjwvYmxvY2s+IFxcXG4gICAgICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfc2V0UGFkZGxlXCI+PC9ibG9jaz4nKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAnPGJsb2NrIHR5cGU9XCJ3aGVuX3J1blwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjIwXCIgeT1cIjIwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5MZWZ0XCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMjIwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5SaWdodFwiIGRlbGV0YWJsZT1cImZhbHNlXCIgeD1cIjE4MFwiIHk9XCIyMjBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlblBhZGRsZUNvbGxpZGVkXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiB4PVwiMjBcIiB5PVwiMzEwXCI+PC9ibG9jaz4gXFxcbiAgICAgIDxibG9jayB0eXBlPVwiYm91bmNlX3doZW5XYWxsQ29sbGlkZWRcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCI0MTBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbkJhbGxJbkdvYWxcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCI1MTBcIj48L2Jsb2NrPiBcXFxuICAgICAgPGJsb2NrIHR5cGU9XCJib3VuY2Vfd2hlbkJhbGxNaXNzZXNQYWRkbGVcIiBkZWxldGFibGU9XCJmYWxzZVwiIHg9XCIyMFwiIHk9XCI2MzBcIj48L2Jsb2NrPidcbiAgfSxcbn07XG4iLCIvKipcbiAqIEJsb2NrbHkgQXBwOiBCb3VuY2VcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMyBDb2RlLm9yZ1xuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHVkaW9BcHAgPSByZXF1aXJlKCcuLi9TdHVkaW9BcHAnKS5zaW5nbGV0b247XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgYm91bmNlTXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG52YXIgdGlsZXMgPSByZXF1aXJlKCcuL3RpbGVzJyk7XG52YXIgY29kZWdlbiA9IHJlcXVpcmUoJy4uL2NvZGVnZW4nKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaScpO1xudmFyIHBhZ2UgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvcGFnZS5odG1sLmVqcycpO1xudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2RvbScpO1xudmFyIEhhbW1lciA9IHJlcXVpcmUoJy4uL2hhbW1lcicpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBkcm9wbGV0VXRpbHMgPSByZXF1aXJlKCcuLi9kcm9wbGV0VXRpbHMnKTtcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuLi9jb25zdGFudHMnKTtcbnZhciBLZXlDb2RlcyA9IGNvbnN0YW50cy5LZXlDb2RlcztcblxudmFyIERpcmVjdGlvbiA9IHRpbGVzLkRpcmVjdGlvbjtcbnZhciBTcXVhcmVUeXBlID0gdGlsZXMuU3F1YXJlVHlwZTtcblxudmFyIFJlc3VsdFR5cGUgPSBzdHVkaW9BcHAuUmVzdWx0VHlwZTtcbnZhciBUZXN0UmVzdWx0cyA9IHN0dWRpb0FwcC5UZXN0UmVzdWx0cztcblxuLyoqXG4gKiBDcmVhdGUgYSBuYW1lc3BhY2UgZm9yIHRoZSBhcHBsaWNhdGlvbi5cbiAqL1xudmFyIEJvdW5jZSA9IG1vZHVsZS5leHBvcnRzO1xuXG5Cb3VuY2Uua2V5U3RhdGUgPSB7fTtcbkJvdW5jZS5nZXN0dXJlc09ic2VydmVkID0ge307XG5Cb3VuY2UuYnRuU3RhdGUgPSB7fTtcblxudmFyIEJ1dHRvblN0YXRlID0ge1xuICBVUDogMCxcbiAgRE9XTjogMVxufTtcblxuQm91bmNlLkJhbGxGbGFncyA9IHtcbiAgTUlTU0VEX1BBRERMRTogMSxcbiAgSU5fR09BTDogMixcbiAgTEFVTkNISU5HOiA0XG59O1xuXG52YXIgQXJyb3dJZHMgPSB7XG4gIExFRlQ6ICdsZWZ0QnV0dG9uJyxcbiAgVVA6ICd1cEJ1dHRvbicsXG4gIFJJR0hUOiAncmlnaHRCdXR0b24nLFxuICBET1dOOiAnZG93bkJ1dHRvbidcbn07XG5cbnZhciBEUkFHX0RJU1RBTkNFX1RPX01PVkVfUkFUSU8gPSAyNTtcblxudmFyIGxldmVsO1xudmFyIHNraW47XG5cbi8qKlxuICogTWlsbGlzZWNvbmRzIGJldHdlZW4gZWFjaCBhbmltYXRpb24gZnJhbWUuXG4gKi9cbnZhciBzdGVwU3BlZWQ7XG5cbi8vVE9ETzogTWFrZSBjb25maWd1cmFibGUuXG5zdHVkaW9BcHAuc2V0Q2hlY2tGb3JFbXB0eUJsb2Nrcyh0cnVlKTtcblxudmFyIGdldFRpbGUgPSBmdW5jdGlvbihtYXAsIHgsIHkpIHtcbiAgaWYgKG1hcCAmJiBtYXBbeV0pIHtcbiAgICByZXR1cm4gbWFwW3ldW3hdO1xuICB9XG59O1xuXG4vLyBEZWZhdWx0IFNjYWxpbmdzXG5Cb3VuY2Uuc2NhbGUgPSB7XG4gICdzbmFwUmFkaXVzJzogMSxcbiAgJ3N0ZXBTcGVlZCc6IDMzXG59O1xuXG52YXIgdHdpdHRlck9wdGlvbnMgPSB7XG4gIHRleHQ6IGJvdW5jZU1zZy5zaGFyZUJvdW5jZVR3aXR0ZXIoKSxcbiAgaGFzaHRhZzogXCJCb3VuY2VDb2RlXCJcbn07XG5cbnZhciBsb2FkTGV2ZWwgPSBmdW5jdGlvbigpIHtcbiAgLy8gTG9hZCBtYXBzLlxuICBCb3VuY2UubWFwID0gbGV2ZWwubWFwO1xuICBCb3VuY2UudGltZW91dEZhaWx1cmVUaWNrID0gbGV2ZWwudGltZW91dEZhaWx1cmVUaWNrIHx8IEluZmluaXR5O1xuICBCb3VuY2UubWluV29ya3NwYWNlSGVpZ2h0ID0gbGV2ZWwubWluV29ya3NwYWNlSGVpZ2h0O1xuICBCb3VuY2Uuc29mdEJ1dHRvbnNfID0gbGV2ZWwuc29mdEJ1dHRvbnMgfHwgW107XG4gIEJvdW5jZS5yZXNwYXduQmFsbHMgPSBsZXZlbC5yZXNwYXduQmFsbHMgfHwgZmFsc2U7XG4gIEJvdW5jZS5mYWlsT25CYWxsRXhpdCA9IGxldmVsLmZhaWxPbkJhbGxFeGl0IHx8IGZhbHNlO1xuXG4gIC8vIE92ZXJyaWRlIHNjYWxhcnMuXG4gIGZvciAodmFyIGtleSBpbiBsZXZlbC5zY2FsZSkge1xuICAgIEJvdW5jZS5zY2FsZVtrZXldID0gbGV2ZWwuc2NhbGVba2V5XTtcbiAgfVxuXG4gIC8vIE1lYXN1cmUgbWF6ZSBkaW1lbnNpb25zIGFuZCBzZXQgc2l6ZXMuXG4gIC8vIFJPV1M6IE51bWJlciBvZiB0aWxlcyBkb3duLlxuICBCb3VuY2UuUk9XUyA9IEJvdW5jZS5tYXAubGVuZ3RoO1xuICAvLyBDT0xTOiBOdW1iZXIgb2YgdGlsZXMgYWNyb3NzLlxuICBCb3VuY2UuQ09MUyA9IEJvdW5jZS5tYXBbMF0ubGVuZ3RoO1xuICAvLyBJbml0aWFsaXplIHRoZSB3YWxsTWFwLlxuICBpbml0V2FsbE1hcCgpO1xuICAvLyBQaXhlbCBoZWlnaHQgYW5kIHdpZHRoIG9mIGVhY2ggbWF6ZSBzcXVhcmUgKGkuZS4gdGlsZSkuXG4gIEJvdW5jZS5TUVVBUkVfU0laRSA9IDUwO1xuICBCb3VuY2UuUEVHTUFOX0hFSUdIVCA9IHNraW4ucGVnbWFuSGVpZ2h0O1xuICBCb3VuY2UuUEVHTUFOX1dJRFRIID0gc2tpbi5wZWdtYW5XaWR0aDtcbiAgQm91bmNlLkJBTExfWV9PRkZTRVQgPSBza2luLmJhbGxZT2Zmc2V0O1xuICBCb3VuY2UuUEFERExFX1lfT0ZGU0VUID0gc2tpbi5wYWRkbGVZT2Zmc2V0O1xuICAvLyBIZWlnaHQgYW5kIHdpZHRoIG9mIHRoZSBnb2FsIGFuZCBvYnN0YWNsZXMuXG4gIEJvdW5jZS5NQVJLRVJfSEVJR0hUID0gNDM7XG4gIEJvdW5jZS5NQVJLRVJfV0lEVEggPSA1MDtcblxuICBCb3VuY2UuTUFaRV9XSURUSCA9IEJvdW5jZS5TUVVBUkVfU0laRSAqIEJvdW5jZS5DT0xTO1xuICBCb3VuY2UuTUFaRV9IRUlHSFQgPSBCb3VuY2UuU1FVQVJFX1NJWkUgKiBCb3VuY2UuUk9XUztcbiAgQm91bmNlLlBBVEhfV0lEVEggPSBCb3VuY2UuU1FVQVJFX1NJWkUgLyAzO1xufTtcblxuXG52YXIgaW5pdFdhbGxNYXAgPSBmdW5jdGlvbigpIHtcbiAgQm91bmNlLndhbGxNYXAgPSBuZXcgQXJyYXkoQm91bmNlLlJPV1MpO1xuICBmb3IgKHZhciB5ID0gMDsgeSA8IEJvdW5jZS5ST1dTOyB5KyspIHtcbiAgICBCb3VuY2Uud2FsbE1hcFt5XSA9IG5ldyBBcnJheShCb3VuY2UuQ09MUyk7XG4gIH1cbn07XG5cbi8qKlxuICogUElEcyBvZiBhc3luYyB0YXNrcyBjdXJyZW50bHkgZXhlY3V0aW5nLlxuICovXG52YXIgdGltZW91dExpc3QgPSByZXF1aXJlKCcuLi90aW1lb3V0TGlzdCcpO1xuXG4vLyBNYXAgZWFjaCBwb3NzaWJsZSBzaGFwZSB0byBhIHNwcml0ZS5cbi8vIElucHV0OiBCaW5hcnkgc3RyaW5nIHJlcHJlc2VudGluZyBDZW50cmUvTm9ydGgvRWFzdC9Tb3V0aC9XZXN0IHNxdWFyZXMuXG4vLyBPdXRwdXQ6IFt4LCB5XSBjb29yZGluYXRlcyBvZiBlYWNoIHRpbGUncyBzcHJpdGUgaW4gdGlsZXMucG5nLlxudmFyIFdBTExfVElMRV9TSEFQRVMgPSB7XG4gICcxWDEwMSc6IFsxLCAwXSwgIC8vIEhvcml6IHRvcFxuICAnMTFYMTAnOiBbMiwgMV0sICAvLyBWZXJ0IHJpZ2h0XG4gICcxMVhYMCc6IFsyLCAxXSwgIC8vIEJvdHRvbSByaWdodCBjb3JuZXJcbiAgJzFYWDExJzogWzIsIDBdLCAgLy8gVG9wIHJpZ2h0IGNvcm5lclxuICAnMVgwMDEnOiBbMSwgMF0sICAvLyBUb3AgaG9yaXogcmlnaHQgZW5kXG4gICcxWDEwMCc6IFsxLCAwXSwgIC8vIFRvcCBob3JpeiBsZWZ0IGVuZFxuICAnMTEwMVgnOiBbMCwgMV0sICAvLyBWZXJ0IGxlZnRcbiAgJzExMFhYJzogWzAsIDFdLCAgLy8gQm90dG9tIGxlZnQgY29ybmVyXG4gICcxWDExWCc6IFswLCAwXSwgIC8vIFRvcCBsZWZ0IGNvcm5lclxuICAnbnVsbDAnOiBbMSwgMV0gICAvLyBFbXB0eVxufTtcblxudmFyIEdPQUxfVElMRV9TSEFQRVMgPSB7XG4gICcxWDEwMSc6IFsyLCAzXSwgIC8vIEhvcml6IHRvcFxuICAnMVhYMTEnOiBbMywgM10sICAvLyBUb3AgcmlnaHQgY29ybmVyXG4gICcxWDAwMSc6IFszLCAzXSwgIC8vIFRvcCBob3JpeiByaWdodCBlbmRcbiAgJzFYMTFYJzogWzAsIDJdLCAgLy8gVG9wIGxlZnQgY29ybmVyXG4gICcxWDEwMCc6IFswLCAyXSwgIC8vIFRvcCBob3JpeiBsZWZ0IGVuZFxuICAnbnVsbDAnOiBbMSwgMV0gICAvLyBFbXB0eVxufTtcblxuLy8gUmV0dXJuIGEgdmFsdWUgb2YgJzAnIGlmIHRoZSBzcGVjaWZpZWQgc3F1YXJlIGlzIG5vdCBhIHdhbGwsICcxJyBmb3Jcbi8vIGEgd2FsbCwgJ1gnIGZvciBvdXQgb2YgYm91bmRzXG52YXIgd2FsbE5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgcmV0dXJuICgoQm91bmNlLm1hcFt5XSA9PT0gdW5kZWZpbmVkKSB8fFxuICAgICAgICAgIChCb3VuY2UubWFwW3ldW3hdID09PSB1bmRlZmluZWQpKSA/ICdYJyA6XG4gICAgICAgICAgICAoQm91bmNlLm1hcFt5XVt4XSAmIFNxdWFyZVR5cGUuV0FMTCkgPyAnMScgOiAnMCc7XG59O1xuXG4vLyBSZXR1cm4gYSB2YWx1ZSBvZiAnMCcgaWYgdGhlIHNwZWNpZmllZCBzcXVhcmUgaXMgbm90IGEgd2FsbCwgJzEnIGZvclxuLy8gYSB3YWxsLCAnWCcgZm9yIG91dCBvZiBib3VuZHNcbnZhciBnb2FsTm9ybWFsaXplID0gZnVuY3Rpb24oeCwgeSkge1xuICByZXR1cm4gKChCb3VuY2UubWFwW3ldID09PSB1bmRlZmluZWQpIHx8XG4gICAgICAgICAgKEJvdW5jZS5tYXBbeV1beF0gPT09IHVuZGVmaW5lZCkpID8gJ1gnIDpcbiAgICAgICAgICAgIChCb3VuY2UubWFwW3ldW3hdICYgU3F1YXJlVHlwZS5HT0FMKSA/ICcxJyA6ICcwJztcbn07XG5cbi8vIENyZWF0ZSBiYWxsIGVsZW1lbnRzXG5Cb3VuY2UuY3JlYXRlQmFsbEVsZW1lbnRzID0gZnVuY3Rpb24gKGkpIHtcbiAgdmFyIHN2ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdCb3VuY2UnKTtcbiAgLy8gQmFsbCdzIGNsaXBQYXRoIGVsZW1lbnQsIHdob3NlICh4LCB5KSBpcyByZXNldCBieSBCb3VuY2UuZGlzcGxheUJhbGxcbiAgdmFyIGJhbGxDbGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnY2xpcFBhdGgnKTtcbiAgYmFsbENsaXAuc2V0QXR0cmlidXRlKCdpZCcsICdiYWxsQ2xpcFBhdGgnICsgaSk7XG4gIHZhciBiYWxsQ2xpcFJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdyZWN0Jyk7XG4gIGJhbGxDbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2JhbGxDbGlwUmVjdCcgKyBpKTtcbiAgYmFsbENsaXBSZWN0LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBCb3VuY2UuUEVHTUFOX1dJRFRIKTtcbiAgYmFsbENsaXBSZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLlBFR01BTl9IRUlHSFQpO1xuICBiYWxsQ2xpcC5hcHBlbmRDaGlsZChiYWxsQ2xpcFJlY3QpO1xuICBzdmcuYXBwZW5kQ2hpbGQoYmFsbENsaXApO1xuXG4gIC8vIEFkZCBiYWxsLlxuICB2YXIgYmFsbEljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICBiYWxsSWNvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2JhbGwnICsgaSk7XG4gIGJhbGxJY29uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBCb3VuY2UuYmFsbEltYWdlKTtcbiAgYmFsbEljb24uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBCb3VuY2UuUEVHTUFOX0hFSUdIVCk7XG4gIGJhbGxJY29uLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBCb3VuY2UuUEVHTUFOX1dJRFRIKTtcbiAgYmFsbEljb24uc2V0QXR0cmlidXRlKCdjbGlwLXBhdGgnLCAndXJsKCNiYWxsQ2xpcFBhdGgnICsgaSArICcpJyk7XG4gIHN2Zy5hcHBlbmRDaGlsZChiYWxsSWNvbik7XG59O1xuXG4vLyBEZWxldGUgYmFsbCBlbGVtZW50c1xuQm91bmNlLmRlbGV0ZUJhbGxFbGVtZW50cyA9IGZ1bmN0aW9uIChpKSB7XG4gIHZhciBiYWxsQ2xpcFBhdGggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFsbENsaXBQYXRoJyArIGkpO1xuICBiYWxsQ2xpcFBhdGgucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChiYWxsQ2xpcFBhdGgpO1xuXG4gIHZhciBiYWxsSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWxsJyArIGkpO1xuICBiYWxsSWNvbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGJhbGxJY29uKTtcbn07XG5cbnZhciBkcmF3TWFwID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnQm91bmNlJyk7XG4gIHZhciBpLCB4LCB5LCBrLCB0aWxlO1xuXG4gIC8vIEFkanVzdCBvdXRlciBlbGVtZW50IHNpemUuXG4gIHN2Zy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgQm91bmNlLk1BWkVfV0lEVEgpO1xuICBzdmcuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBCb3VuY2UuTUFaRV9IRUlHSFQpO1xuXG4gIC8vIEF0dGFjaCBkcmFnIGhhbmRsZXIuXG4gIHZhciBoYW1tZXJTdmcgPSBuZXcgSGFtbWVyKHN2Zyk7XG4gIGhhbW1lclN2Zy5vbihcImRyYWdcIiwgQm91bmNlLm9uU3ZnRHJhZyk7XG5cbiAgLy8gQWRqdXN0IHZpc3VhbGl6YXRpb25Db2x1bW4gd2lkdGguXG4gIHZhciB2aXN1YWxpemF0aW9uQ29sdW1uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25Db2x1bW4nKTtcbiAgdmlzdWFsaXphdGlvbkNvbHVtbi5zdHlsZS53aWR0aCA9IEJvdW5jZS5NQVpFX1dJRFRIICsgJ3B4JztcblxuICBpZiAoc2tpbi5iYWNrZ3JvdW5kKSB7XG4gICAgdGlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2ltYWdlJyk7XG4gICAgdGlsZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uYmFja2dyb3VuZCk7XG4gICAgdGlsZS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2JhY2tncm91bmQnKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLk1BWkVfSEVJR0hUKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBCb3VuY2UuTUFaRV9XSURUSCk7XG4gICAgdGlsZS5zZXRBdHRyaWJ1dGUoJ3gnLCAwKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZSgneScsIDApO1xuICAgIHN2Zy5hcHBlbmRDaGlsZCh0aWxlKTtcbiAgfVxuXG4gIC8vIERyYXcgdGhlIHRpbGVzIG1ha2luZyB1cCB0aGUgbWF6ZSBtYXAuXG5cbiAgLy8gQ29tcHV0ZSBhbmQgZHJhdyB0aGUgdGlsZSBmb3IgZWFjaCBzcXVhcmUuXG4gIHZhciB0aWxlSWQgPSAwO1xuICBmb3IgKHkgPSAwOyB5IDwgQm91bmNlLlJPV1M7IHkrKykge1xuICAgIGZvciAoeCA9IDA7IHggPCBCb3VuY2UuQ09MUzsgeCsrKSB7XG4gICAgICB2YXIgbGVmdDtcbiAgICAgIHZhciB0b3A7XG4gICAgICB2YXIgaW1hZ2U7XG4gICAgICAvLyBDb21wdXRlIHRoZSB0aWxlIGluZGV4LlxuICAgICAgdGlsZSA9IHdhbGxOb3JtYWxpemUoeCwgeSkgK1xuICAgICAgICAgIHdhbGxOb3JtYWxpemUoeCwgeSAtIDEpICsgIC8vIE5vcnRoLlxuICAgICAgICAgIHdhbGxOb3JtYWxpemUoeCArIDEsIHkpICsgIC8vIEVhc3QuXG4gICAgICAgICAgd2FsbE5vcm1hbGl6ZSh4LCB5ICsgMSkgKyAgLy8gU291dGguXG4gICAgICAgICAgd2FsbE5vcm1hbGl6ZSh4IC0gMSwgeSk7ICAgLy8gV2VzdC5cblxuICAgICAgLy8gRHJhdyB0aGUgdGlsZS5cbiAgICAgIGlmIChXQUxMX1RJTEVfU0hBUEVTW3RpbGVdKSB7XG4gICAgICAgIGxlZnQgPSBXQUxMX1RJTEVfU0hBUEVTW3RpbGVdWzBdO1xuICAgICAgICB0b3AgPSBXQUxMX1RJTEVfU0hBUEVTW3RpbGVdWzFdO1xuICAgICAgICBpbWFnZSA9IHNraW4udGlsZXM7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUgdGlsZSBpbmRleC5cbiAgICAgICAgdGlsZSA9IGdvYWxOb3JtYWxpemUoeCwgeSkgK1xuICAgICAgICAgICAgZ29hbE5vcm1hbGl6ZSh4LCB5IC0gMSkgKyAgLy8gTm9ydGguXG4gICAgICAgICAgICBnb2FsTm9ybWFsaXplKHggKyAxLCB5KSArICAvLyBFYXN0LlxuICAgICAgICAgICAgZ29hbE5vcm1hbGl6ZSh4LCB5ICsgMSkgKyAgLy8gU291dGguXG4gICAgICAgICAgICBnb2FsTm9ybWFsaXplKHggLSAxLCB5KTsgICAvLyBXZXN0LlxuXG4gICAgICAgIGlmICghR09BTF9USUxFX1NIQVBFU1t0aWxlXSkge1xuICAgICAgICAgIC8vIEVtcHR5IHNxdWFyZS4gIFVzZSBudWxsMC5cbiAgICAgICAgICB0aWxlID0gJ251bGwwJztcbiAgICAgICAgfVxuICAgICAgICBsZWZ0ID0gR09BTF9USUxFX1NIQVBFU1t0aWxlXVswXTtcbiAgICAgICAgdG9wID0gR09BTF9USUxFX1NIQVBFU1t0aWxlXVsxXTtcbiAgICAgICAgaW1hZ2UgPSBza2luLmdvYWxUaWxlcztcbiAgICAgIH1cbiAgICAgIGlmICh0aWxlICE9ICdudWxsMCcpIHtcbiAgICAgICAgLy8gVGlsZSdzIGNsaXBQYXRoIGVsZW1lbnQuXG4gICAgICAgIHZhciB0aWxlQ2xpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2NsaXBQYXRoJyk7XG4gICAgICAgIHRpbGVDbGlwLnNldEF0dHJpYnV0ZSgnaWQnLCAndGlsZUNsaXBQYXRoJyArIHRpbGVJZCk7XG4gICAgICAgIHZhciB0aWxlQ2xpcFJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdyZWN0Jyk7XG4gICAgICAgIHRpbGVDbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgQm91bmNlLlNRVUFSRV9TSVpFKTtcbiAgICAgICAgdGlsZUNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLlNRVUFSRV9TSVpFKTtcblxuICAgICAgICB0aWxlQ2xpcFJlY3Quc2V0QXR0cmlidXRlKCd4JywgeCAqIEJvdW5jZS5TUVVBUkVfU0laRSk7XG4gICAgICAgIHRpbGVDbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ3knLCB5ICogQm91bmNlLlNRVUFSRV9TSVpFKTtcblxuICAgICAgICB0aWxlQ2xpcC5hcHBlbmRDaGlsZCh0aWxlQ2xpcFJlY3QpO1xuICAgICAgICBzdmcuYXBwZW5kQ2hpbGQodGlsZUNsaXApO1xuICAgICAgICAvLyBUaWxlIHNwcml0ZS5cbiAgICAgICAgdmFyIHRpbGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICAgICAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdpZCcsICd0aWxlRWxlbWVudCcgKyB0aWxlSWQpO1xuICAgICAgICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UpO1xuICAgICAgICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIEJvdW5jZS5TUVVBUkVfU0laRSAqIDQpO1xuICAgICAgICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgQm91bmNlLlNRVUFSRV9TSVpFICogNSk7XG4gICAgICAgIHRpbGVFbGVtZW50LnNldEF0dHJpYnV0ZSgnY2xpcC1wYXRoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd1cmwoI3RpbGVDbGlwUGF0aCcgKyB0aWxlSWQgKyAnKScpO1xuICAgICAgICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3gnLCAoeCAtIGxlZnQpICogQm91bmNlLlNRVUFSRV9TSVpFKTtcbiAgICAgICAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKCd5JywgKHkgLSB0b3ApICogQm91bmNlLlNRVUFSRV9TSVpFKTtcbiAgICAgICAgc3ZnLmFwcGVuZENoaWxkKHRpbGVFbGVtZW50KTtcbiAgICAgICAgLy8gVGlsZSBhbmltYXRpb25cbiAgICAgICAgdmFyIHRpbGVBbmltYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhbmltYXRlJyk7XG4gICAgICAgIHRpbGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCdpZCcsICd0aWxlQW5pbWF0aW9uJyArIHRpbGVJZCk7XG4gICAgICAgIHRpbGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCdhdHRyaWJ1dGVUeXBlJywgJ0NTUycpO1xuICAgICAgICB0aWxlQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnYXR0cmlidXRlTmFtZScsICdvcGFjaXR5Jyk7XG4gICAgICAgIHRpbGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCdmcm9tJywgMSk7XG4gICAgICAgIHRpbGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCd0bycsIDApO1xuICAgICAgICB0aWxlQW5pbWF0aW9uLnNldEF0dHJpYnV0ZSgnZHVyJywgJzFzJyk7XG4gICAgICAgIHRpbGVBbmltYXRpb24uc2V0QXR0cmlidXRlKCdiZWdpbicsICdpbmRlZmluaXRlJyk7XG4gICAgICAgIHRpbGVFbGVtZW50LmFwcGVuZENoaWxkKHRpbGVBbmltYXRpb24pO1xuICAgICAgfVxuXG4gICAgICB0aWxlSWQrKztcbiAgICB9XG4gIH1cblxuICBCb3VuY2UuYmFsbEltYWdlID0gc2tpbi5iYWxsO1xuICBmb3IgKGkgPSAwOyBpIDwgQm91bmNlLmJhbGxDb3VudDsgaSsrKSB7XG4gICAgQm91bmNlLmNyZWF0ZUJhbGxFbGVtZW50cyhpKTtcbiAgfVxuXG4gIGlmIChCb3VuY2UucGFkZGxlU3RhcnRfKSB7XG4gICAgLy8gUGFkZGxlJ3MgY2xpcFBhdGggZWxlbWVudCwgd2hvc2UgKHgsIHkpIGlzIHJlc2V0IGJ5IEJvdW5jZS5kaXNwbGF5UGFkZGxlXG4gICAgdmFyIHBhZGRsZUNsaXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdjbGlwUGF0aCcpO1xuICAgIHBhZGRsZUNsaXAuc2V0QXR0cmlidXRlKCdpZCcsICdwYWRkbGVDbGlwUGF0aCcpO1xuICAgIHZhciBwYWRkbGVDbGlwUmVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3JlY3QnKTtcbiAgICBwYWRkbGVDbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3BhZGRsZUNsaXBSZWN0Jyk7XG4gICAgcGFkZGxlQ2xpcFJlY3Quc2V0QXR0cmlidXRlKCd3aWR0aCcsIEJvdW5jZS5QRUdNQU5fV0lEVEgpO1xuICAgIHBhZGRsZUNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLlBFR01BTl9IRUlHSFQpO1xuICAgIHBhZGRsZUNsaXAuYXBwZW5kQ2hpbGQocGFkZGxlQ2xpcFJlY3QpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChwYWRkbGVDbGlwKTtcblxuICAgIC8vIEFkZCBwYWRkbGUuXG4gICAgdmFyIHBhZGRsZUljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICAgIHBhZGRsZUljb24uc2V0QXR0cmlidXRlKCdpZCcsICdwYWRkbGUnKTtcbiAgICBwYWRkbGVJY29uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5wYWRkbGUpO1xuICAgIHBhZGRsZUljb24uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBCb3VuY2UuUEVHTUFOX0hFSUdIVCk7XG4gICAgcGFkZGxlSWNvbi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgQm91bmNlLlBFR01BTl9XSURUSCk7XG4gICAgcGFkZGxlSWNvbi5zZXRBdHRyaWJ1dGUoJ2NsaXAtcGF0aCcsICd1cmwoI3BhZGRsZUNsaXBQYXRoKScpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChwYWRkbGVJY29uKTtcbiAgfVxuXG4gIGlmIChCb3VuY2UucGFkZGxlRmluaXNoXykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBCb3VuY2UucGFkZGxlRmluaXNoQ291bnQ7IGkrKykge1xuICAgICAgLy8gQWRkIGZpbmlzaCBtYXJrZXJzLlxuICAgICAgdmFyIHBhZGRsZUZpbmlzaE1hcmtlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2ltYWdlJyk7XG4gICAgICBwYWRkbGVGaW5pc2hNYXJrZXIuc2V0QXR0cmlidXRlKCdpZCcsICdwYWRkbGVmaW5pc2gnICsgaSk7XG4gICAgICBwYWRkbGVGaW5pc2hNYXJrZXIuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLmdvYWwpO1xuICAgICAgcGFkZGxlRmluaXNoTWFya2VyLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLk1BUktFUl9IRUlHSFQpO1xuICAgICAgcGFkZGxlRmluaXNoTWFya2VyLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBCb3VuY2UuTUFSS0VSX1dJRFRIKTtcbiAgICAgIHN2Zy5hcHBlbmRDaGlsZChwYWRkbGVGaW5pc2hNYXJrZXIpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChCb3VuY2UuYmFsbEZpbmlzaF8pIHtcbiAgICAvLyBBZGQgYmFsbCBmaW5pc2ggbWFya2VyLlxuICAgIHZhciBiYWxsRmluaXNoTWFya2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICBiYWxsRmluaXNoTWFya2VyLnNldEF0dHJpYnV0ZSgnaWQnLCAnYmFsbGZpbmlzaCcpO1xuICAgIGJhbGxGaW5pc2hNYXJrZXIuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5nb2FsKTtcbiAgICBiYWxsRmluaXNoTWFya2VyLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLk1BUktFUl9IRUlHSFQpO1xuICAgIGJhbGxGaW5pc2hNYXJrZXIuc2V0QXR0cmlidXRlKCd3aWR0aCcsIEJvdW5jZS5NQVJLRVJfV0lEVEgpO1xuICAgIHN2Zy5hcHBlbmRDaGlsZChiYWxsRmluaXNoTWFya2VyKTtcbiAgfVxuXG4gIHZhciBzY29yZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ3RleHQnKTtcbiAgc2NvcmUuc2V0QXR0cmlidXRlKCdpZCcsICdzY29yZScpO1xuICBzY29yZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2JvdW5jZS1zY29yZScpO1xuICBzY29yZS5zZXRBdHRyaWJ1dGUoJ3gnLCBCb3VuY2UuTUFaRV9XSURUSCAvIDIpO1xuICBzY29yZS5zZXRBdHRyaWJ1dGUoJ3knLCA2MCk7XG4gIHNjb3JlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcwJykpO1xuICBzY29yZS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIHN2Zy5hcHBlbmRDaGlsZChzY29yZSk7XG5cbiAgLy8gQWRkIHdhbGwgaGl0dGluZyBhbmltYXRpb25cbiAgaWYgKHNraW4uaGl0dGluZ1dhbGxBbmltYXRpb24pIHtcbiAgICB2YXIgd2FsbEFuaW1hdGlvbkljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICAgIHdhbGxBbmltYXRpb25JY29uLnNldEF0dHJpYnV0ZSgnaWQnLCAnd2FsbEFuaW1hdGlvbicpO1xuICAgIHdhbGxBbmltYXRpb25JY29uLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLlNRVUFSRV9TSVpFKTtcbiAgICB3YWxsQW5pbWF0aW9uSWNvbi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgQm91bmNlLlNRVUFSRV9TSVpFKTtcbiAgICB3YWxsQW5pbWF0aW9uSWNvbi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKHdhbGxBbmltYXRpb25JY29uKTtcbiAgfVxuXG4gIC8vIEFkZCBvYnN0YWNsZXMuXG4gIHZhciBvYnNJZCA9IDA7XG4gIGZvciAoeSA9IDA7IHkgPCBCb3VuY2UuUk9XUzsgeSsrKSB7XG4gICAgZm9yICh4ID0gMDsgeCA8IEJvdW5jZS5DT0xTOyB4KyspIHtcbiAgICAgIGlmIChCb3VuY2UubWFwW3ldW3hdID09IFNxdWFyZVR5cGUuT0JTVEFDTEUpIHtcbiAgICAgICAgdmFyIG9ic0ljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICAgICAgICBvYnNJY29uLnNldEF0dHJpYnV0ZSgnaWQnLCAnb2JzdGFjbGUnICsgb2JzSWQpO1xuICAgICAgICBvYnNJY29uLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgQm91bmNlLk1BUktFUl9IRUlHSFQgKiBza2luLm9ic3RhY2xlU2NhbGUpO1xuICAgICAgICBvYnNJY29uLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBCb3VuY2UuTUFSS0VSX1dJRFRIICogc2tpbi5vYnN0YWNsZVNjYWxlKTtcbiAgICAgICAgb2JzSWNvbi5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgICAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJywgc2tpbi5vYnN0YWNsZSk7XG4gICAgICAgIG9ic0ljb24uc2V0QXR0cmlidXRlKCd4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlLlNRVUFSRV9TSVpFICogKHggKyAwLjUpIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JzSWNvbi5nZXRBdHRyaWJ1dGUoJ3dpZHRoJykgLyAyKTtcbiAgICAgICAgb2JzSWNvbi5zZXRBdHRyaWJ1dGUoJ3knLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCb3VuY2UuU1FVQVJFX1NJWkUgKiAoeSArIDAuOSkgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNJY29uLmdldEF0dHJpYnV0ZSgnaGVpZ2h0JykpO1xuICAgICAgICBzdmcuYXBwZW5kQ2hpbGQob2JzSWNvbik7XG4gICAgICB9XG4gICAgICArK29ic0lkO1xuICAgIH1cbiAgfVxufTtcblxuQm91bmNlLmNhbGNEaXN0YW5jZSA9IGZ1bmN0aW9uKHhEaXN0LCB5RGlzdCkge1xuICByZXR1cm4gTWF0aC5zcXJ0KHhEaXN0ICogeERpc3QgKyB5RGlzdCAqIHlEaXN0KTtcbn07XG5cbnZhciBlc3NlbnRpYWxseUVxdWFsID0gZnVuY3Rpb24oZmxvYXQxLCBmbG9hdDIsIG9wdF92YXJpYW5jZSkge1xuICB2YXIgdmFyaWFuY2UgPSBvcHRfdmFyaWFuY2UgfHwgMC4wMTtcbiAgcmV0dXJuIChNYXRoLmFicyhmbG9hdDEgLSBmbG9hdDIpIDwgdmFyaWFuY2UpO1xufTtcblxuQm91bmNlLmlzQmFsbE91dE9mQm91bmRzID0gZnVuY3Rpb24oaSkge1xuICBpZiAoQm91bmNlLmJhbGxYW2ldIDwgMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChCb3VuY2UuYmFsbFhbaV0gPiBCb3VuY2UuQ09MUyAtIDEpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoQm91bmNlLmJhbGxZW2ldIDwgdGlsZXMuWV9UT1BfQk9VTkRBUlkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoQm91bmNlLmJhbGxZW2ldID4gQm91bmNlLlJPV1MgLSAxKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBAcGFyYW0gc2NvcGUgT2JqZWN0IDogIFRoZSBzY29wZSBpbiB3aGljaCB0byBleGVjdXRlIHRoZSBkZWxlZ2F0ZWQgZnVuY3Rpb24uXG4gKiBAcGFyYW0gZnVuYyBGdW5jdGlvbiA6IFRoZSBmdW5jdGlvbiB0byBleGVjdXRlXG4gKiBAcGFyYW0gZGF0YSBPYmplY3Qgb3IgQXJyYXkgOiBUaGUgZGF0YSB0byBwYXNzIHRvIHRoZSBmdW5jdGlvbi4gSWYgdGhlIGZ1bmN0aW9uIGlzIGFsc28gcGFzc2VkIGFyZ3VtZW50cywgdGhlIGRhdGEgaXMgYXBwZW5kZWQgdG8gdGhlIGFyZ3VtZW50cyBsaXN0LiBJZiB0aGUgZGF0YSBpcyBhbiBBcnJheSwgZWFjaCBpdGVtIGlzIGFwcGVuZGVkIGFzIGEgbmV3IGFyZ3VtZW50LlxuICovXG52YXIgZGVsZWdhdGUgPSBmdW5jdGlvbihzY29wZSwgZnVuYywgZGF0YSlcbntcbiAgcmV0dXJuIGZ1bmN0aW9uKClcbiAge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGFyZ3VtZW50cykuY29uY2F0KGRhdGEpO1xuICAgIGZ1bmMuYXBwbHkoc2NvcGUsIGFyZ3MpO1xuICB9O1xufTtcblxuLyoqXG4gKiBXZSB3YW50IHRvIHN3YWxsb3cgZXhjZXB0aW9ucyB3aGVuIGV4ZWN1dGluZyB1c2VyIGdlbmVyYXRlZCBjb2RlLiBUaGlzIHByb3ZpZGVzXG4gKiBhIHNpbmdsZSBwbGFjZSB0byBkbyBzby5cbiAqL1xuQm91bmNlLmNhbGxVc2VyR2VuZXJhdGVkQ29kZSA9IGZ1bmN0aW9uIChmbikge1xuICB0cnkge1xuICAgIGZuLmNhbGwoQm91bmNlLCBzdHVkaW9BcHAsIGFwaSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBzd2FsbG93IGVycm9yLiBzaG91bGQgd2UgYWxzbyBsb2cgdGhpcyBzb21ld2hlcmU/XG4gICAgaWYgKGNvbnNvbGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIH1cbiAgfVxufTtcblxuXG5Cb3VuY2Uub25UaWNrID0gZnVuY3Rpb24oKSB7XG4gIEJvdW5jZS50aWNrQ291bnQrKztcblxuICBpZiAoQm91bmNlLnRpY2tDb3VudCA9PT0gMSkge1xuICAgIEJvdW5jZS5jYWxsVXNlckdlbmVyYXRlZENvZGUoQm91bmNlLndoZW5HYW1lU3RhcnRzKTtcbiAgfVxuXG4gIC8vIFJ1biBrZXkgZXZlbnQgaGFuZGxlcnMgZm9yIGFueSBrZXlzIHRoYXQgYXJlIGRvd246XG4gIGZvciAodmFyIGtleSBpbiBLZXlDb2Rlcykge1xuICAgIGlmIChCb3VuY2Uua2V5U3RhdGVbS2V5Q29kZXNba2V5XV0gJiZcbiAgICAgICAgQm91bmNlLmtleVN0YXRlW0tleUNvZGVzW2tleV1dID09IFwia2V5ZG93blwiKSB7XG4gICAgICBzd2l0Y2ggKEtleUNvZGVzW2tleV0pIHtcbiAgICAgICAgY2FzZSBLZXlDb2Rlcy5MRUZUOlxuICAgICAgICAgIEJvdW5jZS5jYWxsVXNlckdlbmVyYXRlZENvZGUoQm91bmNlLndoZW5MZWZ0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlDb2Rlcy5VUDpcbiAgICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuVXApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleUNvZGVzLlJJR0hUOlxuICAgICAgICAgIEJvdW5jZS5jYWxsVXNlckdlbmVyYXRlZENvZGUoQm91bmNlLndoZW5SaWdodCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5Q29kZXMuRE9XTjpcbiAgICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuRG93bik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgYnRuIGluIEFycm93SWRzKSB7XG4gICAgaWYgKEJvdW5jZS5idG5TdGF0ZVtBcnJvd0lkc1tidG5dXSAmJlxuICAgICAgICBCb3VuY2UuYnRuU3RhdGVbQXJyb3dJZHNbYnRuXV0gPT0gQnV0dG9uU3RhdGUuRE9XTikge1xuICAgICAgc3dpdGNoIChBcnJvd0lkc1tidG5dKSB7XG4gICAgICAgIGNhc2UgQXJyb3dJZHMuTEVGVDpcbiAgICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuTGVmdCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQXJyb3dJZHMuVVA6XG4gICAgICAgICAgQm91bmNlLmNhbGxVc2VyR2VuZXJhdGVkQ29kZShCb3VuY2Uud2hlblVwKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBBcnJvd0lkcy5SSUdIVDpcbiAgICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuUmlnaHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEFycm93SWRzLkRPV046XG4gICAgICAgICAgQm91bmNlLmNhbGxVc2VyR2VuZXJhdGVkQ29kZShCb3VuY2Uud2hlbkRvd24pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGdlc3R1cmUgaW4gQm91bmNlLmdlc3R1cmVzT2JzZXJ2ZWQpIHtcbiAgICBzd2l0Y2ggKGdlc3R1cmUpIHtcbiAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuTGVmdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndXAnOlxuICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuVXApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgQm91bmNlLmNhbGxVc2VyR2VuZXJhdGVkQ29kZShCb3VuY2Uud2hlblJpZ2h0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgQm91bmNlLmNhbGxVc2VyR2VuZXJhdGVkQ29kZShCb3VuY2Uud2hlbkRvd24pO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKDAgPT09IEJvdW5jZS5nZXN0dXJlc09ic2VydmVkW2dlc3R1cmVdLS0pIHtcbiAgICAgIGRlbGV0ZSBCb3VuY2UuZ2VzdHVyZXNPYnNlcnZlZFtnZXN0dXJlXTtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IEJvdW5jZS5iYWxsQ291bnQ7IGkrKykge1xuICAgIHZhciBkZWx0YVggPSBCb3VuY2UuYmFsbFNwZWVkW2ldICogTWF0aC5zaW4oQm91bmNlLmJhbGxEaXJbaV0pO1xuICAgIHZhciBkZWx0YVkgPSAtQm91bmNlLmJhbGxTcGVlZFtpXSAqIE1hdGguY29zKEJvdW5jZS5iYWxsRGlyW2ldKTtcblxuICAgIHZhciB3YXNYT0sgPSBCb3VuY2UuYmFsbFhbaV0gPj0gMCAmJiBCb3VuY2UuYmFsbFhbaV0gPD0gQm91bmNlLkNPTFMgLSAxO1xuICAgIHZhciB3YXNZT0sgPSBCb3VuY2UuYmFsbFlbaV0gPj0gdGlsZXMuWV9UT1BfQk9VTkRBUlk7XG4gICAgdmFyIHdhc1lBYm92ZUJvdHRvbSA9IEJvdW5jZS5iYWxsWVtpXSA8PSBCb3VuY2UuUk9XUyAtIDE7XG5cbiAgICBCb3VuY2UuYmFsbFhbaV0gKz0gZGVsdGFYO1xuICAgIEJvdW5jZS5iYWxsWVtpXSArPSBkZWx0YVk7XG5cbiAgICBpZiAoMCA9PT0gKEJvdW5jZS5iYWxsRmxhZ3NbaV0gJlxuICAgICAgICAgICAgICAgKEJvdW5jZS5CYWxsRmxhZ3MuTUlTU0VEX1BBRERMRSB8IEJvdW5jZS5CYWxsRmxhZ3MuSU5fR09BTCkpKSB7XG4gICAgICB2YXIgbm93WE9LID0gQm91bmNlLmJhbGxYW2ldID49IDAgJiYgQm91bmNlLmJhbGxYW2ldIDw9IEJvdW5jZS5DT0xTIC0gMTtcbiAgICAgIHZhciBub3dZT0sgPSBCb3VuY2UuYmFsbFlbaV0gPj0gdGlsZXMuWV9UT1BfQk9VTkRBUlk7XG4gICAgICB2YXIgbm93WUFib3ZlQm90dG9tID0gQm91bmNlLmJhbGxZW2ldIDw9IEJvdW5jZS5ST1dTIC0gMTtcblxuICAgICAgaWYgKHdhc1lPSyAmJiB3YXNYT0sgJiYgIW5vd1hPSykge1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiY2FsbGluZyB3aGVuV2FsbENvbGxpZGVkIGZvciBiYWxsIFwiICsgaSArXG4gICAgICAgIC8vXCIgeD1cIiArIEJvdW5jZS5iYWxsWFtpXSArIFwiIHk9XCIgKyBCb3VuY2UuYmFsbFlbaV0pO1xuICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuV2FsbENvbGxpZGVkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHdhc1hPSyAmJiB3YXNZT0sgJiYgIW5vd1lPSykge1xuICAgICAgICBpZiAoQm91bmNlLm1hcFswXVtNYXRoLnJvdW5kKEJvdW5jZS5iYWxsWFtpXSldICYgU3F1YXJlVHlwZS5HT0FMKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhcImNhbGxpbmcgd2hlbkJhbGxJbkdvYWwgZm9yIGJhbGwgXCIgKyBpICtcbiAgICAgICAgICAvL1wiIHg9XCIgKyBCb3VuY2UuYmFsbFhbaV0gKyBcIiB5PVwiICsgQm91bmNlLmJhbGxZW2ldKTtcbiAgICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuQmFsbEluR29hbCk7XG4gICAgICAgICAgQm91bmNlLmJhbGxGbGFnc1tpXSB8PSBCb3VuY2UuQmFsbEZsYWdzLklOX0dPQUw7XG4gICAgICAgICAgdGltZW91dExpc3Quc2V0VGltZW91dChcbiAgICAgICAgICAgICAgZGVsZWdhdGUodGhpcywgQm91bmNlLm1vdmVCYWxsT2Zmc2NyZWVuLCBpKSxcbiAgICAgICAgICAgICAgMTAwMCk7XG4gICAgICAgICAgaWYgKEJvdW5jZS5yZXNwYXduQmFsbHMpIHtcbiAgICAgICAgICAgIEJvdW5jZS5sYXVuY2hCYWxsKGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiY2FsbGluZyB3aGVuV2FsbENvbGxpZGVkIGZvciBiYWxsIFwiICsgaSArXG4gICAgICAgICAgLy9cIiB4PVwiICsgQm91bmNlLmJhbGxYW2ldICsgXCIgeT1cIiArIEJvdW5jZS5iYWxsWVtpXSk7XG4gICAgICAgICAgQm91bmNlLmNhbGxVc2VyR2VuZXJhdGVkQ29kZShCb3VuY2Uud2hlbldhbGxDb2xsaWRlZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHhQYWRkbGVCYWxsID0gQm91bmNlLmJhbGxYW2ldIC0gQm91bmNlLnBhZGRsZVg7XG4gICAgICB2YXIgeVBhZGRsZUJhbGwgPSBCb3VuY2UuYmFsbFlbaV0gLSBCb3VuY2UucGFkZGxlWTtcbiAgICAgIHZhciBkaXN0UGFkZGxlQmFsbCA9IEJvdW5jZS5jYWxjRGlzdGFuY2UoeFBhZGRsZUJhbGwsIHlQYWRkbGVCYWxsKTtcblxuICAgICAgaWYgKGRpc3RQYWRkbGVCYWxsIDwgdGlsZXMuUEFERExFX0JBTExfQ09MTElERV9ESVNUQU5DRSkge1xuICAgICAgICAvLyBwYWRkbGUgYmFsbCBjb2xsaXNpb25cbiAgICAgICAgLy9jb25zb2xlLmxvZyhcImNhbGxpbmcgd2hlblBhZGRsZUNvbGxpZGVkIGZvciBiYWxsIFwiICsgaSArXG4gICAgICAgIC8vXCIgeD1cIiArIEJvdW5jZS5iYWxsWFtpXSArIFwiIHk9XCIgKyBCb3VuY2UuYmFsbFlbaV0pO1xuICAgICAgICBCb3VuY2UuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEJvdW5jZS53aGVuUGFkZGxlQ29sbGlkZWQpO1xuICAgICAgfSBlbHNlIGlmICh3YXNZQWJvdmVCb3R0b20gJiYgIW5vd1lBYm92ZUJvdHRvbSkge1xuICAgICAgICAvLyBiYWxsIG1pc3NlZCBwYWRkbGVcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcImNhbGxpbmcgd2hlbkJhbGxNaXNzZXNQYWRkbGUgZm9yIGJhbGwgXCIgKyBpICtcbiAgICAgICAgLy9cIiB4PVwiICsgQm91bmNlLmJhbGxYW2ldICsgXCIgeT1cIiArIEJvdW5jZS5iYWxsWVtpXSk7XG4gICAgICAgIEJvdW5jZS5jYWxsVXNlckdlbmVyYXRlZENvZGUoQm91bmNlLndoZW5CYWxsTWlzc2VzUGFkZGxlKTtcbiAgICAgICAgQm91bmNlLmJhbGxGbGFnc1tpXSB8PSBCb3VuY2UuQmFsbEZsYWdzLk1JU1NFRF9QQURETEU7XG4gICAgICAgIHRpbWVvdXRMaXN0LnNldFRpbWVvdXQoXG4gICAgICAgICAgICBkZWxlZ2F0ZSh0aGlzLCBCb3VuY2UubW92ZUJhbGxPZmZzY3JlZW4sIGkpLFxuICAgICAgICAgICAgMTAwMCk7XG4gICAgICAgIGlmIChCb3VuY2UucmVzcGF3bkJhbGxzKSB7XG4gICAgICAgICAgQm91bmNlLmxhdW5jaEJhbGwoaSk7XG4gICAgICAgIH0gZWxzZSBpZiAoQm91bmNlLmZhaWxPbkJhbGxFeGl0KSB7XG4gICAgICAgICAgQm91bmNlLnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICAgICAgICBCb3VuY2Uub25QdXp6bGVDb21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgQm91bmNlLmRpc3BsYXlCYWxsKGksIEJvdW5jZS5iYWxsWFtpXSwgQm91bmNlLmJhbGxZW2ldKTtcbiAgfVxuXG4gIEJvdW5jZS5kaXNwbGF5UGFkZGxlKEJvdW5jZS5wYWRkbGVYLCBCb3VuY2UucGFkZGxlWSk7XG5cbiAgaWYgKGNoZWNrRmluaXNoZWQoKSkge1xuICAgIEJvdW5jZS5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH1cbn07XG5cbkJvdW5jZS5vblN2Z0RyYWcgPSBmdW5jdGlvbihlKSB7XG4gIGlmIChCb3VuY2UuaW50ZXJ2YWxJZCkge1xuICAgIEJvdW5jZS5nZXN0dXJlc09ic2VydmVkW2UuZ2VzdHVyZS5kaXJlY3Rpb25dID1cbiAgICAgIE1hdGgucm91bmQoZS5nZXN0dXJlLmRpc3RhbmNlIC8gRFJBR19ESVNUQU5DRV9UT19NT1ZFX1JBVElPKTtcbiAgICBlLmdlc3R1cmUucHJldmVudERlZmF1bHQoKTtcbiAgfVxufTtcblxuQm91bmNlLm9uS2V5ID0gZnVuY3Rpb24oZSkge1xuICAvLyBTdG9yZSB0aGUgbW9zdCByZWNlbnQgZXZlbnQgdHlwZSBwZXIta2V5XG4gIEJvdW5jZS5rZXlTdGF0ZVtlLmtleUNvZGVdID0gZS50eXBlO1xuXG4gIC8vIElmIHdlIGFyZSBhY3RpdmVseSBydW5uaW5nIG91ciB0aWNrIGxvb3AsIHN1cHByZXNzIGRlZmF1bHQgZXZlbnQgaGFuZGxpbmdcbiAgaWYgKEJvdW5jZS5pbnRlcnZhbElkICYmXG4gICAgICBlLmtleUNvZGUgPj0gS2V5Q29kZXMuTEVGVCAmJiBlLmtleUNvZGUgPD0gS2V5Q29kZXMuRE9XTikge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfVxufTtcblxuQm91bmNlLm9uQXJyb3dCdXR0b25Eb3duID0gZnVuY3Rpb24oZSwgaWRCdG4pIHtcbiAgLy8gU3RvcmUgdGhlIG1vc3QgcmVjZW50IGV2ZW50IHR5cGUgcGVyLWJ1dHRvblxuICBCb3VuY2UuYnRuU3RhdGVbaWRCdG5dID0gQnV0dG9uU3RhdGUuRE9XTjtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpOyAgLy8gU3RvcCBub3JtYWwgZXZlbnRzIHNvIHdlIHNlZSBtb3VzZXVwIGxhdGVyLlxufTtcblxuQm91bmNlLm9uQXJyb3dCdXR0b25VcCA9IGZ1bmN0aW9uKGUsIGlkQnRuKSB7XG4gIC8vIFN0b3JlIHRoZSBtb3N0IHJlY2VudCBldmVudCB0eXBlIHBlci1idXR0b25cbiAgQm91bmNlLmJ0blN0YXRlW2lkQnRuXSA9IEJ1dHRvblN0YXRlLlVQO1xufTtcblxuQm91bmNlLm9uTW91c2VVcCA9IGZ1bmN0aW9uKGUpIHtcbiAgLy8gUmVzZXQgYnRuU3RhdGUgb24gbW91c2UgdXBcbiAgQm91bmNlLmJ0blN0YXRlID0ge307XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgQmxvY2tseSBhbmQgdGhlIEJvdW5jZSBhcHAuICBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5Cb3VuY2UuaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAvLyByZXBsYWNlIHN0dWRpb0FwcCBtZXRob2RzIHdpdGggb3VyIG93blxuICBzdHVkaW9BcHAucmVzZXQgPSB0aGlzLnJlc2V0LmJpbmQodGhpcyk7XG4gIHN0dWRpb0FwcC5ydW5CdXR0b25DbGljayA9IHRoaXMucnVuQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcblxuICBCb3VuY2UuY2xlYXJFdmVudEhhbmRsZXJzS2lsbFRpY2tMb29wKCk7XG4gIHNraW4gPSBjb25maWcuc2tpbjtcbiAgbGV2ZWwgPSBjb25maWcubGV2ZWw7XG4gIGxvYWRMZXZlbCgpO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBCb3VuY2Uub25LZXksIGZhbHNlKTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBCb3VuY2Uub25LZXksIGZhbHNlKTtcblxuICBjb25maWcuaHRtbCA9IHBhZ2Uoe1xuICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsXG4gICAgZGF0YToge1xuICAgICAgbG9jYWxlRGlyZWN0aW9uOiBzdHVkaW9BcHAubG9jYWxlRGlyZWN0aW9uKCksXG4gICAgICB2aXN1YWxpemF0aW9uOiByZXF1aXJlKCcuL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMnKSgpLFxuICAgICAgY29udHJvbHM6IHJlcXVpcmUoJy4vY29udHJvbHMuaHRtbC5lanMnKSh7YXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybH0pLFxuICAgICAgYmxvY2tVc2VkOiB1bmRlZmluZWQsXG4gICAgICBpZGVhbEJsb2NrTnVtYmVyOiB1bmRlZmluZWQsXG4gICAgICBlZGl0Q29kZTogbGV2ZWwuZWRpdENvZGUsXG4gICAgICBibG9ja0NvdW50ZXJDbGFzczogJ2Jsb2NrLWNvdW50ZXItZGVmYXVsdCcsXG4gICAgICByZWFkb25seVdvcmtzcGFjZTogY29uZmlnLnJlYWRvbmx5V29ya3NwYWNlXG4gICAgfVxuICB9KTtcblxuICBjb25maWcubG9hZEF1ZGlvID0gZnVuY3Rpb24oKSB7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndpblNvdW5kLCAnd2luJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLnN0YXJ0U291bmQsICdzdGFydCcpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5iYWxsU3RhcnRTb3VuZCwgJ2JhbGxzdGFydCcpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5mYWlsdXJlU291bmQsICdmYWlsdXJlJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLnJ1YmJlclNvdW5kLCAncnViYmVyJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmNydW5jaFNvdW5kLCAnY3J1bmNoJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmZsYWdTb3VuZCwgJ2ZsYWcnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2luUG9pbnRTb3VuZCwgJ3dpbnBvaW50Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndpblBvaW50MlNvdW5kLCAnd2lucG9pbnQyJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmxvc2VQb2ludFNvdW5kLCAnbG9zZXBvaW50Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmxvc2VQb2ludDJTb3VuZCwgJ2xvc2Vwb2ludDInKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uZ29hbDFTb3VuZCwgJ2dvYWwxJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmdvYWwyU291bmQsICdnb2FsMicpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi53b29kU291bmQsICd3b29kJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLnJldHJvU291bmQsICdyZXRybycpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5zbGFwU291bmQsICdzbGFwJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmhpdFNvdW5kLCAnaGl0Jyk7XG4gIH07XG5cbiAgY29uZmlnLmFmdGVySW5qZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gQ29ubmVjdCB1cCBhcnJvdyBidXR0b24gZXZlbnQgaGFuZGxlcnNcbiAgICBmb3IgKHZhciBidG4gaW4gQXJyb3dJZHMpIHtcbiAgICAgIGRvbS5hZGRNb3VzZVVwVG91Y2hFdmVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChBcnJvd0lkc1tidG5dKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxlZ2F0ZSh0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJvdW5jZS5vbkFycm93QnV0dG9uVXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyb3dJZHNbYnRuXSkpO1xuICAgICAgZG9tLmFkZE1vdXNlRG93blRvdWNoRXZlbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoQXJyb3dJZHNbYnRuXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxlZ2F0ZSh0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlLm9uQXJyb3dCdXR0b25Eb3duLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyb3dJZHNbYnRuXSkpO1xuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgQm91bmNlLm9uTW91c2VVcCwgZmFsc2UpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHJpY2huZXNzIG9mIGJsb2NrIGNvbG91cnMsIHJlZ2FyZGxlc3Mgb2YgdGhlIGh1ZS5cbiAgICAgKiBNT09DIGJsb2NrcyBzaG91bGQgYmUgYnJpZ2h0ZXIgKHRhcmdldCBhdWRpZW5jZSBpcyB5b3VuZ2VyKS5cbiAgICAgKiBNdXN0IGJlIGluIHRoZSByYW5nZSBvZiAwIChpbmNsdXNpdmUpIHRvIDEgKGV4Y2x1c2l2ZSkuXG4gICAgICogQmxvY2tseSdzIGRlZmF1bHQgaXMgMC40NS5cbiAgICAgKi9cbiAgICBCbG9ja2x5LkhTVl9TQVRVUkFUSU9OID0gMC42O1xuXG4gICAgQmxvY2tseS5TTkFQX1JBRElVUyAqPSBCb3VuY2Uuc2NhbGUuc25hcFJhZGl1cztcblxuICAgIEJvdW5jZS5iYWxsU3RhcnRfID0gW107XG4gICAgQm91bmNlLmJhbGxYID0gW107XG4gICAgQm91bmNlLmJhbGxZID0gW107XG4gICAgQm91bmNlLmJhbGxEaXIgPSBbXTtcbiAgICBCb3VuY2UuYmFsbFNwZWVkID0gW107XG4gICAgQm91bmNlLmJhbGxGbGFncyA9IFtdO1xuICAgIEJvdW5jZS5iYWxsQ291bnQgPSAwO1xuICAgIEJvdW5jZS5vcmlnaW5hbEJhbGxDb3VudCA9IDA7XG4gICAgQm91bmNlLnBhZGRsZUZpbmlzaENvdW50ID0gMDtcbiAgICBCb3VuY2UuZGVmYXVsdEJhbGxTcGVlZCA9IGxldmVsLmJhbGxTcGVlZCB8fCB0aWxlcy5ERUZBVUxUX0JBTExfU1BFRUQ7XG4gICAgQm91bmNlLmRlZmF1bHRCYWxsRGlyID0gbGV2ZWwuYmFsbERpcmVjdGlvbiB8fCB0aWxlcy5ERUZBVUxUX0JBTExfRElSRUNUSU9OO1xuXG4gICAgLy8gTG9jYXRlIHRoZSBzdGFydCBhbmQgZmluaXNoIHNxdWFyZXMuXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBCb3VuY2UuUk9XUzsgeSsrKSB7XG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IEJvdW5jZS5DT0xTOyB4KyspIHtcbiAgICAgICAgaWYgKEJvdW5jZS5tYXBbeV1beF0gJiBTcXVhcmVUeXBlLlBBRERMRUZJTklTSCkge1xuICAgICAgICAgIGlmICgwID09PSBCb3VuY2UucGFkZGxlRmluaXNoQ291bnQpIHtcbiAgICAgICAgICAgIEJvdW5jZS5wYWRkbGVGaW5pc2hfID0gW107XG4gICAgICAgICAgfVxuICAgICAgICAgIEJvdW5jZS5wYWRkbGVGaW5pc2hfW0JvdW5jZS5wYWRkbGVGaW5pc2hDb3VudF0gPSB7eDogeCwgeTogeX07XG4gICAgICAgICAgQm91bmNlLnBhZGRsZUZpbmlzaENvdW50Kys7XG4gICAgICAgIH0gZWxzZSBpZiAoQm91bmNlLm1hcFt5XVt4XSAmIFNxdWFyZVR5cGUuQkFMTFNUQVJUKSB7XG4gICAgICAgICAgQm91bmNlLmJhbGxTdGFydF9bQm91bmNlLmJhbGxDb3VudF0gPSB7IHg6IHgsIHk6IHl9O1xuICAgICAgICAgIEJvdW5jZS5iYWxsQ291bnQrKztcbiAgICAgICAgfSBlbHNlIGlmIChCb3VuY2UubWFwW3ldW3hdICYgU3F1YXJlVHlwZS5QQURETEVTVEFSVCkge1xuICAgICAgICAgIEJvdW5jZS5wYWRkbGVTdGFydF8gPSB7eDogeCwgeTogeX07XG4gICAgICAgIH0gZWxzZSBpZiAoQm91bmNlLm1hcFt5XVt4XSAmIFNxdWFyZVR5cGUuQkFMTEZJTklTSCkge1xuICAgICAgICAgIEJvdW5jZS5iYWxsRmluaXNoXyA9IHt4OiB4LCB5OiB5fTtcbiAgICAgICAgfSBlbHNlIGlmIChCb3VuY2UubWFwW3ldW3hdICYgU3F1YXJlVHlwZS5HT0FMKSB7XG4gICAgICAgICAgQm91bmNlLmdvYWxMb2NhdGVkXyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBCb3VuY2Uub3JpZ2luYWxCYWxsQ291bnQgPSBCb3VuY2UuYmFsbENvdW50O1xuXG4gICAgZHJhd01hcCgpO1xuICB9O1xuXG4gIC8vIEJsb2NrIHBsYWNlbWVudCBkZWZhdWx0ICh1c2VkIGFzIGZhbGxiYWNrIGluIHRoZSBzaGFyZSBsZXZlbHMpXG4gIGNvbmZpZy5ibG9ja0FycmFuZ2VtZW50ID0ge1xuICAgICd3aGVuX3J1bic6IHsgeDogMjAsIHk6IDIwfSxcbiAgICAnYm91bmNlX3doZW5MZWZ0JzogeyB4OiAyMCwgeTogMjIwfSxcbiAgICAnYm91bmNlX3doZW5SaWdodCc6IHsgeDogMTgwLCB5OiAyMjB9LFxuICAgICdib3VuY2Vfd2hlblBhZGRsZUNvbGxpZGVkJzogeyB4OiAyMCwgeTogMzEwfSxcbiAgICAnYm91bmNlX3doZW5XYWxsQ29sbGlkZWQnOiB7IHg6IDIwLCB5OiA0MTB9LFxuICAgICdib3VuY2Vfd2hlbkJhbGxJbkdvYWwnOiB7IHg6IDIwLCB5OiA1MTB9LFxuICAgICdib3VuY2Vfd2hlbkJhbGxNaXNzZXNQYWRkbGUnOiB7IHg6IDIwLCB5OiA2MzB9XG4gIH07XG5cbiAgY29uZmlnLnR3aXR0ZXIgPSB0d2l0dGVyT3B0aW9ucztcblxuICAvLyBmb3IgdGhpcyBhcHAsIHNob3cgbWFrZSB5b3VyIG93biBidXR0b24gaWYgb24gc2hhcmUgcGFnZVxuICBjb25maWcubWFrZVlvdXJPd24gPSBjb25maWcuc2hhcmU7XG5cbiAgY29uZmlnLm1ha2VTdHJpbmcgPSBib3VuY2VNc2cubWFrZVlvdXJPd24oKTtcbiAgY29uZmlnLm1ha2VVcmwgPSBcImh0dHA6Ly9jb2RlLm9yZy9ib3VuY2VcIjtcbiAgY29uZmlnLm1ha2VJbWFnZSA9IHN0dWRpb0FwcC5hc3NldFVybCgnbWVkaWEvcHJvbW8ucG5nJyk7XG5cbiAgY29uZmlnLmVuYWJsZVNob3dDb2RlID0gZmFsc2U7XG4gIGNvbmZpZy5lbmFibGVTaG93QmxvY2tDb3VudCA9IGZhbHNlO1xuXG4gIHN0dWRpb0FwcC5pbml0KGNvbmZpZyk7XG5cbiAgdmFyIGZpbmlzaEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaW5pc2hCdXR0b24nKTtcbiAgZG9tLmFkZENsaWNrVG91Y2hFdmVudChmaW5pc2hCdXR0b24sIEJvdW5jZS5vblB1enpsZUNvbXBsZXRlKTtcbn07XG5cbi8qKlxuICogQ2xlYXIgdGhlIGV2ZW50IGhhbmRsZXJzIGFuZCBzdG9wIHRoZSBvblRpY2sgdGltZXIuXG4gKi9cbkJvdW5jZS5jbGVhckV2ZW50SGFuZGxlcnNLaWxsVGlja0xvb3AgPSBmdW5jdGlvbigpIHtcbiAgQm91bmNlLndoZW5XYWxsQ29sbGlkZWQgPSBudWxsO1xuICBCb3VuY2Uud2hlbkJhbGxJbkdvYWwgPSBudWxsO1xuICBCb3VuY2Uud2hlbkJhbGxNaXNzZXNQYWRkbGUgPSBudWxsO1xuICBCb3VuY2Uud2hlblBhZGRsZUNvbGxpZGVkID0gbnVsbDtcbiAgQm91bmNlLndoZW5Eb3duID0gbnVsbDtcbiAgQm91bmNlLndoZW5MZWZ0ID0gbnVsbDtcbiAgQm91bmNlLndoZW5SaWdodCA9IG51bGw7XG4gIEJvdW5jZS53aGVuVXAgPSBudWxsO1xuICBCb3VuY2Uud2hlbkdhbWVTdGFydHMgPSBudWxsO1xuICBpZiAoQm91bmNlLmludGVydmFsSWQpIHtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChCb3VuY2UuaW50ZXJ2YWxJZCk7XG4gIH1cbiAgQm91bmNlLmludGVydmFsSWQgPSAwO1xuICAvLyBLaWxsIGFsbCB0YXNrcy5cbiAgdGltZW91dExpc3QuY2xlYXJUaW1lb3V0cygpO1xufTtcblxuLyoqXG4gKiBNb3ZlIGJhbGwgdG8gYSBzYWZlIHBsYWNlIG9mZiBvZiB0aGUgc2NyZWVuLlxuICogQHBhcmFtIHtpbnR9IGkgSW5kZXggb2YgYmFsbCB0byBiZSBtb3ZlZC5cbiAqL1xuQm91bmNlLm1vdmVCYWxsT2Zmc2NyZWVuID0gZnVuY3Rpb24oaSkge1xuICBCb3VuY2UuYmFsbFhbaV0gPSAxMDA7XG4gIEJvdW5jZS5iYWxsWVtpXSA9IDEwMDtcbiAgQm91bmNlLmJhbGxEaXJbaV0gPSAwO1xuICAvLyBzdG9wIHRoZSBiYWxsIGZyb20gbW92aW5nIGlmIHdlJ3JlIG5vdCBwbGFubmluZyB0byByZXNwYXduOlxuICBCb3VuY2UuYmFsbFNwZWVkW2ldID0gMDtcbn07XG5cbi8qKlxuICogUGxheSBhIHN0YXJ0IHNvdW5kIGFuZCByZXNldCB0aGUgYmFsbCBhdCBpbmRleCBpIGFuZCByZWRyYXcgaXQuXG4gKiBAcGFyYW0ge2ludH0gaSBJbmRleCBvZiBiYWxsIHRvIGJlIHJlc2V0LlxuICovXG5Cb3VuY2UucGxheVNvdW5kQW5kUmVzZXRCYWxsID0gZnVuY3Rpb24oaSkge1xuICAvL2NvbnNvbGUubG9nKFwicGxheVNvdW5kQW5kUmVzZXRCYWxsIGNhbGxlZCBmb3IgYmFsbCBcIiArIGkpO1xuICBCb3VuY2UucmVzZXRCYWxsKGksIHsgcmFuZG9tUG9zaXRpb246IHRydWUgfSApO1xuICBzdHVkaW9BcHAucGxheUF1ZGlvKCdiYWxsc3RhcnQnKTtcbn07XG5cbi8qKlxuICogTGF1bmNoIHRoZSBiYWxsIGZyb20gaW5kZXggaSBmcm9tIGEgc3RhcnQgcG9zaXRpb24gYW5kIGxhdW5jaCBpdC5cbiAqIEBwYXJhbSB7aW50fSBpIEluZGV4IG9mIGJhbGwgdG8gYmUgbGF1bmNoZWQuXG4gKi9cbkJvdW5jZS5sYXVuY2hCYWxsID0gZnVuY3Rpb24oaSkge1xuICBCb3VuY2UuYmFsbEZsYWdzW2ldIHw9IEJvdW5jZS5CYWxsRmxhZ3MuTEFVTkNISU5HO1xuICB0aW1lb3V0TGlzdC5zZXRUaW1lb3V0KGRlbGVnYXRlKHRoaXMsIEJvdW5jZS5wbGF5U291bmRBbmRSZXNldEJhbGwsIGkpLCAzMDAwKTtcbn07XG5cbi8qKlxuICogUmVzZXQgdGhlIGJhbGwgZnJvbSBpbmRleCBpIHRvIHRoZSBzdGFydCBwb3NpdGlvbiBhbmQgcmVkcmF3IGl0LlxuICogQHBhcmFtIHtpbnR9IGkgSW5kZXggb2YgYmFsbCB0byBiZSByZXNldC5cbiAqIEBwYXJhbSB7b3B0aW9uc30gcmFuZG9tUG9zaXRpb246IHJhbmRvbSBzdGFydFxuICovXG5Cb3VuY2UucmVzZXRCYWxsID0gZnVuY3Rpb24oaSwgb3B0aW9ucykge1xuICAvL2NvbnNvbGUubG9nKFwicmVzZXRCYWxsIGNhbGxlZCBmb3IgYmFsbCBcIiArIGkpO1xuICB2YXIgcmFuZFN0YXJ0ID0gb3B0aW9ucy5yYW5kb21Qb3NpdGlvbiB8fFxuICAgICAgICAgICAgICAgICAgdHlwZW9mIEJvdW5jZS5iYWxsU3RhcnRfW2ldID09ICd1bmRlZmluZWQnO1xuICBCb3VuY2UuYmFsbFhbaV0gPSAgcmFuZFN0YXJ0ID8gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogQm91bmNlLkNPTFMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJvdW5jZS5iYWxsU3RhcnRfW2ldLng7XG4gIEJvdW5jZS5iYWxsWVtpXSA9ICByYW5kU3RhcnQgPyB0aWxlcy5ERUZBVUxUX0JBTExfU1RBUlRfWSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCb3VuY2UuYmFsbFN0YXJ0X1tpXS55O1xuICBCb3VuY2UuYmFsbERpcltpXSA9IHJhbmRTdGFydCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAoTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgLyAyKSArIE1hdGguUEkgKiAwLjc1IDpcbiAgICAgICAgICAgICAgICAgICAgICAgIEJvdW5jZS5kZWZhdWx0QmFsbERpcjtcbiAgQm91bmNlLmJhbGxTcGVlZFtpXSA9IEJvdW5jZS5jdXJyZW50QmFsbFNwZWVkO1xuICBCb3VuY2UuYmFsbEZsYWdzW2ldID0gMDtcblxuICBCb3VuY2UuZGlzcGxheUJhbGwoaSwgQm91bmNlLmJhbGxYW2ldLCBCb3VuY2UuYmFsbFlbaV0pO1xufTtcblxuLyoqXG4gKiBSZXNldCB0aGUgYXBwIHRvIHRoZSBzdGFydCBwb3NpdGlvbiBhbmQga2lsbCBhbnkgcGVuZGluZyBhbmltYXRpb24gdGFza3MuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGZpcnN0IFRydWUgaWYgYW4gb3BlbmluZyBhbmltYXRpb24gaXMgdG8gYmUgcGxheWVkLlxuICovXG5Cb3VuY2UucmVzZXQgPSBmdW5jdGlvbihmaXJzdCkge1xuICB2YXIgaTtcbiAgQm91bmNlLmNsZWFyRXZlbnRIYW5kbGVyc0tpbGxUaWNrTG9vcCgpO1xuXG4gIC8vIFNvZnQgYnV0dG9uc1xuICB2YXIgc29mdEJ1dHRvbkNvdW50ID0gMDtcbiAgZm9yIChpID0gMDsgaSA8IEJvdW5jZS5zb2Z0QnV0dG9uc18ubGVuZ3RoOyBpKyspIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChCb3VuY2Uuc29mdEJ1dHRvbnNfW2ldKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSc7XG4gICAgc29mdEJ1dHRvbkNvdW50Kys7XG4gIH1cbiAgaWYgKHNvZnRCdXR0b25Db3VudCkge1xuICAgIHZhciBzb2Z0QnV0dG9uc0NlbGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc29mdC1idXR0b25zJyk7XG4gICAgc29mdEJ1dHRvbnNDZWxsLmNsYXNzTmFtZSA9ICdzb2Z0LWJ1dHRvbnMtJyArIHNvZnRCdXR0b25Db3VudDtcbiAgfVxuXG4gIEJvdW5jZS5nZXN0dXJlc09ic2VydmVkID0ge307XG5cbiAgLy8gUmVzZXQgdGhlIHNjb3JlLlxuICBCb3VuY2UucGxheWVyU2NvcmUgPSAwO1xuICBCb3VuY2Uub3Bwb25lbnRTY29yZSA9IDA7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZScpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcblxuICAvLyBSZXNldCBjb25maWd1cmFibGUgdmFyaWFibGVzXG4gIEJvdW5jZS5zZXRCYWNrZ3JvdW5kKCdoYXJkY291cnQnKTtcbiAgQm91bmNlLnNldEJhbGwoJ2hhcmRjb3VydCcpO1xuICBCb3VuY2Uuc2V0UGFkZGxlKCdoYXJkY291cnQnKTtcbiAgQm91bmNlLmN1cnJlbnRCYWxsU3BlZWQgPSBCb3VuY2UuZGVmYXVsdEJhbGxTcGVlZDtcblxuICAvLyBSZW1vdmUgYW55IGV4dHJhIGJhbGxzIHRoYXQgd2VyZSBjcmVhdGVkIGR5bmFtaWNhbGx5LlxuICBmb3IgKGkgPSBCb3VuY2Uub3JpZ2luYWxCYWxsQ291bnQ7IGkgPCBCb3VuY2UuYmFsbENvdW50OyBpKyspIHtcbiAgICBCb3VuY2UuZGVsZXRlQmFsbEVsZW1lbnRzKGkpO1xuICB9XG4gIC8vIFJlc2V0IGJhbGxDb3VudCBiYWNrIHRvIHRoZSBvcmlnaW5hbCB2YWx1ZVxuICBCb3VuY2UuYmFsbENvdW50ID0gQm91bmNlLm9yaWdpbmFsQmFsbENvdW50O1xuICAvLyBNb3ZlIGJhbGwocykgaW50byBwb3NpdGlvbi5cbiAgZm9yIChpID0gMDsgaSA8IEJvdW5jZS5iYWxsQ291bnQ7IGkrKykge1xuICAgIEJvdW5jZS5yZXNldEJhbGwoaSwge30pO1xuICB9XG5cbiAgLy8gTW92ZSBQYWRkbGUgaW50byBwb3NpdGlvbi5cbiAgQm91bmNlLnBhZGRsZVggPSBCb3VuY2UucGFkZGxlU3RhcnRfLng7XG4gIEJvdW5jZS5wYWRkbGVZID0gQm91bmNlLnBhZGRsZVN0YXJ0Xy55O1xuICBCb3VuY2UucGFkZGxlU3BlZWQgPSB0aWxlcy5ERUZBVUxUX1BBRERMRV9TUEVFRDtcblxuICBCb3VuY2UuZGlzcGxheVBhZGRsZShCb3VuY2UucGFkZGxlWCwgQm91bmNlLnBhZGRsZVkpO1xuXG4gIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnQm91bmNlJyk7XG5cbiAgaWYgKEJvdW5jZS5wYWRkbGVGaW5pc2hfKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IEJvdW5jZS5wYWRkbGVGaW5pc2hDb3VudDsgaSsrKSB7XG4gICAgICAvLyBNYXJrIGVhY2ggZmluaXNoIGFzIGluY29tcGxldGUuXG4gICAgICBCb3VuY2UucGFkZGxlRmluaXNoX1tpXS5maW5pc2hlZCA9IGZhbHNlO1xuXG4gICAgICAvLyBNb3ZlIHRoZSBmaW5pc2ggaWNvbnMgaW50byBwb3NpdGlvbi5cbiAgICAgIHZhciBwYWRkbGVGaW5pc2hJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZGRsZWZpbmlzaCcgKyBpKTtcbiAgICAgIHBhZGRsZUZpbmlzaEljb24uc2V0QXR0cmlidXRlKFxuICAgICAgICAgICd4JyxcbiAgICAgICAgICBCb3VuY2UuU1FVQVJFX1NJWkUgKiAoQm91bmNlLnBhZGRsZUZpbmlzaF9baV0ueCArIDAuNSkgLVxuICAgICAgICAgIHBhZGRsZUZpbmlzaEljb24uZ2V0QXR0cmlidXRlKCd3aWR0aCcpIC8gMik7XG4gICAgICBwYWRkbGVGaW5pc2hJY29uLnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAneScsXG4gICAgICAgICAgQm91bmNlLlNRVUFSRV9TSVpFICogKEJvdW5jZS5wYWRkbGVGaW5pc2hfW2ldLnkgKyAwLjkpIC1cbiAgICAgICAgICBwYWRkbGVGaW5pc2hJY29uLmdldEF0dHJpYnV0ZSgnaGVpZ2h0JykpO1xuICAgICAgcGFkZGxlRmluaXNoSWNvbi5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgICAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsXG4gICAgICAgICAgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgIHNraW4uZ29hbCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKEJvdW5jZS5iYWxsRmluaXNoXykge1xuICAgIC8vIE1vdmUgdGhlIGZpbmlzaCBpY29uIGludG8gcG9zaXRpb24uXG4gICAgdmFyIGJhbGxGaW5pc2hJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGxmaW5pc2gnKTtcbiAgICBiYWxsRmluaXNoSWNvbi5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICd4JyxcbiAgICAgICAgQm91bmNlLlNRVUFSRV9TSVpFICogKEJvdW5jZS5iYWxsRmluaXNoXy54ICsgMC41KSAtXG4gICAgICAgIGJhbGxGaW5pc2hJY29uLmdldEF0dHJpYnV0ZSgnd2lkdGgnKSAvIDIpO1xuICAgIGJhbGxGaW5pc2hJY29uLnNldEF0dHJpYnV0ZShcbiAgICAgICAgJ3knLFxuICAgICAgICBCb3VuY2UuU1FVQVJFX1NJWkUgKiAoQm91bmNlLmJhbGxGaW5pc2hfLnkgKyAwLjkpIC1cbiAgICAgICAgYmFsbEZpbmlzaEljb24uZ2V0QXR0cmlidXRlKCdoZWlnaHQnKSk7XG4gICAgYmFsbEZpbmlzaEljb24uc2V0QXR0cmlidXRlTlMoXG4gICAgICAgICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyxcbiAgICAgICAgJ3hsaW5rOmhyZWYnLFxuICAgICAgICBza2luLmdvYWwpO1xuICB9XG5cbiAgLy8gUmVzZXQgdGhlIG9ic3RhY2xlIGltYWdlLlxuICB2YXIgb2JzSWQgPSAwO1xuICB2YXIgeCwgeTtcbiAgZm9yICh5ID0gMDsgeSA8IEJvdW5jZS5ST1dTOyB5KyspIHtcbiAgICBmb3IgKHggPSAwOyB4IDwgQm91bmNlLkNPTFM7IHgrKykge1xuICAgICAgdmFyIG9ic0ljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2JzdGFjbGUnICsgb2JzSWQpO1xuICAgICAgaWYgKG9ic0ljb24pIHtcbiAgICAgICAgb2JzSWNvbi5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLm9ic3RhY2xlKTtcbiAgICAgIH1cbiAgICAgICsrb2JzSWQ7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVzZXQgdGhlIHRpbGVzXG4gIHZhciB0aWxlSWQgPSAwO1xuICBmb3IgKHkgPSAwOyB5IDwgQm91bmNlLlJPV1M7IHkrKykge1xuICAgIGZvciAoeCA9IDA7IHggPCBCb3VuY2UuQ09MUzsgeCsrKSB7XG4gICAgICAvLyBUaWxlJ3MgY2xpcFBhdGggZWxlbWVudC5cbiAgICAgIHZhciB0aWxlQ2xpcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aWxlQ2xpcFBhdGgnICsgdGlsZUlkKTtcbiAgICAgIGlmICh0aWxlQ2xpcCkge1xuICAgICAgICB0aWxlQ2xpcC5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgfVxuICAgICAgLy8gVGlsZSBzcHJpdGUuXG4gICAgICB2YXIgdGlsZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGlsZUVsZW1lbnQnICsgdGlsZUlkKTtcbiAgICAgIGlmICh0aWxlRWxlbWVudCkge1xuICAgICAgICB0aWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ29wYWNpdHknLCAxKTtcbiAgICAgIH1cbiAgICAgIHRpbGVJZCsrO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBDbGljayB0aGUgcnVuIGJ1dHRvbi4gIFN0YXJ0IHRoZSBwcm9ncmFtLlxuICovXG4vLyBYWFggVGhpcyBpcyB0aGUgb25seSBtZXRob2QgdXNlZCBieSB0aGUgdGVtcGxhdGVzIVxuQm91bmNlLnJ1bkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oKSB7XG4gIHZhciBydW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVuQnV0dG9uJyk7XG4gIHZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldEJ1dHRvbicpO1xuICAvLyBFbnN1cmUgdGhhdCBSZXNldCBidXR0b24gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBSdW4gYnV0dG9uLlxuICBpZiAoIXJlc2V0QnV0dG9uLnN0eWxlLm1pbldpZHRoKSB7XG4gICAgcmVzZXRCdXR0b24uc3R5bGUubWluV2lkdGggPSBydW5CdXR0b24ub2Zmc2V0V2lkdGggKyAncHgnO1xuICB9XG4gIHN0dWRpb0FwcC50b2dnbGVSdW5SZXNldCgncmVzZXQnKTtcbiAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuICBzdHVkaW9BcHAucmVzZXQoZmFsc2UpO1xuICBzdHVkaW9BcHAuYXR0ZW1wdHMrKztcbiAgQm91bmNlLmV4ZWN1dGUoKTtcblxuICBpZiAobGV2ZWwuZnJlZVBsYXkgJiYgIXN0dWRpb0FwcC5oaWRlU291cmNlKSB7XG4gICAgdmFyIHNoYXJlQ2VsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaGFyZS1jZWxsJyk7XG4gICAgc2hhcmVDZWxsLmNsYXNzTmFtZSA9ICdzaGFyZS1jZWxsLWVuYWJsZWQnO1xuICB9XG4gIGlmIChCb3VuY2UuZ29hbExvY2F0ZWRfKSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Njb3JlJykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICBCb3VuY2UuZGlzcGxheVNjb3JlKCk7XG4gIH1cbn07XG5cbi8qKlxuICogQXBwIHNwZWNpZmljIGRpc3BsYXlGZWVkYmFjayBmdW5jdGlvbiB0aGF0IGNhbGxzIGludG9cbiAqIHN0dWRpb0FwcC5kaXNwbGF5RmVlZGJhY2sgd2hlbiBhcHByb3ByaWF0ZVxuICovXG52YXIgZGlzcGxheUZlZWRiYWNrID0gZnVuY3Rpb24oKSB7XG4gIGlmICghQm91bmNlLndhaXRpbmdGb3JSZXBvcnQpIHtcbiAgICBzdHVkaW9BcHAuZGlzcGxheUZlZWRiYWNrKHtcbiAgICAgIGFwcDogJ2JvdW5jZScsIC8vWFhYXG4gICAgICBza2luOiBza2luLmlkLFxuICAgICAgZmVlZGJhY2tUeXBlOiBCb3VuY2UudGVzdFJlc3VsdHMsXG4gICAgICByZXNwb25zZTogQm91bmNlLnJlc3BvbnNlLFxuICAgICAgbGV2ZWw6IGxldmVsLFxuICAgICAgc2hvd2luZ1NoYXJpbmc6IGxldmVsLmZyZWVQbGF5LFxuICAgICAgdHdpdHRlcjogdHdpdHRlck9wdGlvbnMsXG4gICAgICBhcHBTdHJpbmdzOiB7XG4gICAgICAgIHJlaW5mRmVlZGJhY2tNc2c6IGJvdW5jZU1zZy5yZWluZkZlZWRiYWNrTXNnKCksXG4gICAgICAgIHNoYXJpbmdUZXh0OiBib3VuY2VNc2cuc2hhcmVHYW1lKClcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgc2VydmljZSByZXBvcnQgY2FsbCBpcyBjb21wbGV0ZVxuICogQHBhcmFtIHtvYmplY3R9IEpTT04gcmVzcG9uc2UgKGlmIGF2YWlsYWJsZSlcbiAqL1xuQm91bmNlLm9uUmVwb3J0Q29tcGxldGUgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICBCb3VuY2UucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgQm91bmNlLndhaXRpbmdGb3JSZXBvcnQgPSBmYWxzZTtcbiAgc3R1ZGlvQXBwLm9uUmVwb3J0Q29tcGxldGUocmVzcG9uc2UpO1xuICBkaXNwbGF5RmVlZGJhY2soKTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuICBIZWF2ZW4gaGVscCB1cy4uLlxuICovXG5Cb3VuY2UuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY29kZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoJ0phdmFTY3JpcHQnLCAnYm91bmNlX3doZW5SdW4nKTtcbiAgQm91bmNlLnJlc3VsdCA9IFJlc3VsdFR5cGUuVU5TRVQ7XG4gIEJvdW5jZS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLk5PX1RFU1RTX1JVTjtcbiAgQm91bmNlLndhaXRpbmdGb3JSZXBvcnQgPSBmYWxzZTtcbiAgQm91bmNlLnJlc3BvbnNlID0gbnVsbDtcblxuICBpZiAobGV2ZWwuZWRpdENvZGUpIHtcbiAgICBjb2RlID0gZHJvcGxldFV0aWxzLmdlbmVyYXRlQ29kZUFsaWFzZXMobnVsbCwgJ0JvdW5jZScpO1xuICAgIGNvZGUgKz0gc3R1ZGlvQXBwLmVkaXRvci5nZXRWYWx1ZSgpO1xuICB9XG5cbiAgdmFyIGNvZGVXYWxsQ29sbGlkZWQgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0phdmFTY3JpcHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2JvdW5jZV93aGVuV2FsbENvbGxpZGVkJyk7XG4gIHZhciB3aGVuV2FsbENvbGxpZGVkRnVuYyA9IGNvZGVnZW4uZnVuY3Rpb25Gcm9tQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlV2FsbENvbGxpZGVkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0dWRpb0FwcDogc3R1ZGlvQXBwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCb3VuY2U6IGFwaSB9ICk7XG5cbiAgdmFyIGNvZGVCYWxsSW5Hb2FsID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdKYXZhU2NyaXB0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdib3VuY2Vfd2hlbkJhbGxJbkdvYWwnKTtcbiAgdmFyIHdoZW5CYWxsSW5Hb2FsRnVuYyA9IGNvZGVnZW4uZnVuY3Rpb25Gcm9tQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlQmFsbEluR29hbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHVkaW9BcHA6IHN0dWRpb0FwcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlOiBhcGkgfSApO1xuXG4gIHZhciBjb2RlQmFsbE1pc3Nlc1BhZGRsZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSmF2YVNjcmlwdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYm91bmNlX3doZW5CYWxsTWlzc2VzUGFkZGxlJyk7XG4gIHZhciB3aGVuQmFsbE1pc3Nlc1BhZGRsZUZ1bmMgPSBjb2RlZ2VuLmZ1bmN0aW9uRnJvbUNvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZUJhbGxNaXNzZXNQYWRkbGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJvdW5jZTogYXBpIH0gKTtcblxuICB2YXIgY29kZVBhZGRsZUNvbGxpZGVkID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdKYXZhU2NyaXB0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdib3VuY2Vfd2hlblBhZGRsZUNvbGxpZGVkJyk7XG4gIHZhciB3aGVuUGFkZGxlQ29sbGlkZWRGdW5jID0gY29kZWdlbi5mdW5jdGlvbkZyb21Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVQYWRkbGVDb2xsaWRlZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHVkaW9BcHA6IHN0dWRpb0FwcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlOiBhcGkgfSApO1xuXG4gIHZhciBjb2RlTGVmdCA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSmF2YVNjcmlwdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYm91bmNlX3doZW5MZWZ0Jyk7XG4gIHZhciB3aGVuTGVmdEZ1bmMgPSBjb2RlZ2VuLmZ1bmN0aW9uRnJvbUNvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZUxlZnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEJvdW5jZTogYXBpIH0gKTtcblxuICB2YXIgY29kZVJpZ2h0ID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdKYXZhU2NyaXB0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdib3VuY2Vfd2hlblJpZ2h0Jyk7XG4gIHZhciB3aGVuUmlnaHRGdW5jID0gY29kZWdlbi5mdW5jdGlvbkZyb21Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVSaWdodCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHVkaW9BcHA6IHN0dWRpb0FwcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlOiBhcGkgfSApO1xuXG4gIHZhciBjb2RlVXAgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0phdmFTY3JpcHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2JvdW5jZV93aGVuVXAnKTtcbiAgdmFyIHdoZW5VcEZ1bmMgPSBjb2RlZ2VuLmZ1bmN0aW9uRnJvbUNvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZVVwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0dWRpb0FwcDogc3R1ZGlvQXBwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCb3VuY2U6IGFwaSB9ICk7XG5cbiAgdmFyIGNvZGVEb3duID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdKYXZhU2NyaXB0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdib3VuY2Vfd2hlbkRvd24nKTtcbiAgdmFyIHdoZW5Eb3duRnVuYyA9IGNvZGVnZW4uZnVuY3Rpb25Gcm9tQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlRG93biwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHVkaW9BcHA6IHN0dWRpb0FwcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlOiBhcGkgfSApO1xuXG4gIHZhciBjb2RlR2FtZVN0YXJ0cyA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSmF2YVNjcmlwdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnd2hlbl9ydW4nKTtcbiAgdmFyIHdoZW5HYW1lU3RhcnRzRnVuYyA9IGNvZGVnZW4uZnVuY3Rpb25Gcm9tQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlR2FtZVN0YXJ0cywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHVkaW9BcHA6IHN0dWRpb0FwcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlOiBhcGkgfSApO1xuXG4gIHN0dWRpb0FwcC5wbGF5QXVkaW8oQm91bmNlLmJhbGxDb3VudCA+IDAgPyAnYmFsbHN0YXJ0JyA6ICdzdGFydCcpO1xuXG4gIHN0dWRpb0FwcC5yZXNldChmYWxzZSk7XG5cbiAgLy8gU2V0IGV2ZW50IGhhbmRsZXJzIGFuZCBzdGFydCB0aGUgb25UaWNrIHRpbWVyXG4gIEJvdW5jZS53aGVuV2FsbENvbGxpZGVkID0gd2hlbldhbGxDb2xsaWRlZEZ1bmM7XG4gIEJvdW5jZS53aGVuQmFsbEluR29hbCA9IHdoZW5CYWxsSW5Hb2FsRnVuYztcbiAgQm91bmNlLndoZW5CYWxsTWlzc2VzUGFkZGxlID0gd2hlbkJhbGxNaXNzZXNQYWRkbGVGdW5jO1xuICBCb3VuY2Uud2hlblBhZGRsZUNvbGxpZGVkID0gd2hlblBhZGRsZUNvbGxpZGVkRnVuYztcbiAgQm91bmNlLndoZW5MZWZ0ID0gd2hlbkxlZnRGdW5jO1xuICBCb3VuY2Uud2hlblJpZ2h0ID0gd2hlblJpZ2h0RnVuYztcbiAgQm91bmNlLndoZW5VcCA9IHdoZW5VcEZ1bmM7XG4gIEJvdW5jZS53aGVuRG93biA9IHdoZW5Eb3duRnVuYztcbiAgQm91bmNlLndoZW5HYW1lU3RhcnRzID0gd2hlbkdhbWVTdGFydHNGdW5jO1xuICBCb3VuY2UudGlja0NvdW50ID0gMDtcbiAgQm91bmNlLmludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoQm91bmNlLm9uVGljaywgQm91bmNlLnNjYWxlLnN0ZXBTcGVlZCk7XG59O1xuXG5Cb3VuY2Uub25QdXp6bGVDb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICBCb3VuY2UucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICB9XG5cbiAgLy8gU3RvcCBldmVyeXRoaW5nIG9uIHNjcmVlblxuICBCb3VuY2UuY2xlYXJFdmVudEhhbmRsZXJzS2lsbFRpY2tMb29wKCk7XG5cbiAgLy8gSWYgd2Uga25vdyB0aGV5IHN1Y2NlZWRlZCwgbWFyayBsZXZlbENvbXBsZXRlIHRydWVcbiAgLy8gTm90ZSB0aGF0IHdlIGhhdmUgbm90IHlldCBhbmltYXRlZCB0aGUgc3VjY2VzZnVsIHJ1blxuICB2YXIgbGV2ZWxDb21wbGV0ZSA9IChCb3VuY2UucmVzdWx0ID09IFJlc3VsdFR5cGUuU1VDQ0VTUyk7XG5cbiAgLy8gSWYgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBmcmVlIHBsYXksIGFsd2F5cyByZXR1cm4gdGhlIGZyZWUgcGxheVxuICAvLyByZXN1bHQgdHlwZVxuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICBCb3VuY2UudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5GUkVFX1BMQVk7XG4gIH0gZWxzZSB7XG4gICAgQm91bmNlLnRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLmdldFRlc3RSZXN1bHRzKGxldmVsQ29tcGxldGUpO1xuICB9XG5cbiAgaWYgKEJvdW5jZS50ZXN0UmVzdWx0cyA+PSBUZXN0UmVzdWx0cy5GUkVFX1BMQVkpIHtcbiAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCd3aW4nKTtcbiAgfSBlbHNlIHtcbiAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCdmYWlsdXJlJyk7XG4gIH1cblxuICBpZiAobGV2ZWwuZWRpdENvZGUpIHtcbiAgICBCb3VuY2UudGVzdFJlc3VsdHMgPSBsZXZlbENvbXBsZXRlID9cbiAgICAgIFRlc3RSZXN1bHRzLkFMTF9QQVNTIDpcbiAgICAgIFRlc3RSZXN1bHRzLlRPT19GRVdfQkxPQ0tTX0ZBSUw7XG4gIH1cblxuICB2YXIgeG1sID0gQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICB2YXIgdGV4dEJsb2NrcyA9IEJsb2NrbHkuWG1sLmRvbVRvVGV4dCh4bWwpO1xuXG4gIEJvdW5jZS53YWl0aW5nRm9yUmVwb3J0ID0gdHJ1ZTtcblxuICAvLyBSZXBvcnQgcmVzdWx0IHRvIHNlcnZlci5cbiAgc3R1ZGlvQXBwLnJlcG9ydCh7XG4gICAgICAgICAgICAgICAgICAgICBhcHA6ICdib3VuY2UnLFxuICAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IGxldmVsLmlkLFxuICAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBCb3VuY2UucmVzdWx0ID09PSBSZXN1bHRUeXBlLlNVQ0NFU1MsXG4gICAgICAgICAgICAgICAgICAgICB0ZXN0UmVzdWx0OiBCb3VuY2UudGVzdFJlc3VsdHMsXG4gICAgICAgICAgICAgICAgICAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQodGV4dEJsb2NrcyksXG4gICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlOiBCb3VuY2Uub25SZXBvcnRDb21wbGV0ZVxuICAgICAgICAgICAgICAgICAgICAgfSk7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgdGlsZXMgdG8gYmUgdHJhbnNwYXJlbnQgZ3JhZHVhbGx5LlxuICovXG5Cb3VuY2Uuc2V0VGlsZVRyYW5zcGFyZW50ID0gZnVuY3Rpb24oKSB7XG4gIHZhciB0aWxlSWQgPSAwO1xuICBmb3IgKHZhciB5ID0gMDsgeSA8IEJvdW5jZS5ST1dTOyB5KyspIHtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IEJvdW5jZS5DT0xTOyB4KyspIHtcbiAgICAgIC8vIFRpbGUgc3ByaXRlLlxuICAgICAgdmFyIHRpbGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbGVFbGVtZW50JyArIHRpbGVJZCk7XG4gICAgICB2YXIgdGlsZUFuaW1hdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aWxlQW5pbWF0aW9uJyArIHRpbGVJZCk7XG4gICAgICBpZiAodGlsZUVsZW1lbnQpIHtcbiAgICAgICAgdGlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdvcGFjaXR5JywgMCk7XG4gICAgICB9XG4gICAgICBpZiAodGlsZUFuaW1hdGlvbikge1xuICAgICAgICB0aWxlQW5pbWF0aW9uLmJlZ2luRWxlbWVudCgpO1xuICAgICAgfVxuICAgICAgdGlsZUlkKys7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIERpc3BsYXkgQmFsbCBhdCB0aGUgc3BlY2lmaWVkIGxvY2F0aW9uLCBmYWNpbmcgdGhlIHNwZWNpZmllZCBkaXJlY3Rpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gaSBCYWxsIGluZGV4Li5cbiAqIEBwYXJhbSB7bnVtYmVyfSB4IEhvcml6b250YWwgZ3JpZCAob3IgZnJhY3Rpb24gdGhlcmVvZikuXG4gKiBAcGFyYW0ge251bWJlcn0geSBWZXJ0aWNhbCBncmlkIChvciBmcmFjdGlvbiB0aGVyZW9mKS5cbiAqL1xuQm91bmNlLmRpc3BsYXlCYWxsID0gZnVuY3Rpb24oaSwgeCwgeSkge1xuICB2YXIgYmFsbEljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFsbCcgKyBpKTtcbiAgYmFsbEljb24uc2V0QXR0cmlidXRlKCd4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHggKiBCb3VuY2UuU1FVQVJFX1NJWkUpO1xuICBiYWxsSWNvbi5zZXRBdHRyaWJ1dGUoJ3knLFxuICAgICAgICAgICAgICAgICAgICAgICAgeSAqIEJvdW5jZS5TUVVBUkVfU0laRSArIEJvdW5jZS5CQUxMX1lfT0ZGU0VUKTtcblxuICB2YXIgYmFsbENsaXBSZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhbGxDbGlwUmVjdCcgKyBpKTtcbiAgYmFsbENsaXBSZWN0LnNldEF0dHJpYnV0ZSgneCcsIHggKiBCb3VuY2UuU1FVQVJFX1NJWkUpO1xuICBiYWxsQ2xpcFJlY3Quc2V0QXR0cmlidXRlKCd5JywgYmFsbEljb24uZ2V0QXR0cmlidXRlKCd5JykpO1xufTtcblxuLyoqXG4gKiBEaXNwbGF5IFBhZGRsZSBhdCB0aGUgc3BlY2lmaWVkIGxvY2F0aW9uXG4gKiBAcGFyYW0ge251bWJlcn0geCBIb3Jpem9udGFsIGdyaWQgKG9yIGZyYWN0aW9uIHRoZXJlb2YpLlxuICogQHBhcmFtIHtudW1iZXJ9IHkgVmVydGljYWwgZ3JpZCAob3IgZnJhY3Rpb24gdGhlcmVvZikuXG4gKi9cbkJvdW5jZS5kaXNwbGF5UGFkZGxlID0gZnVuY3Rpb24oeCwgeSkge1xuICB2YXIgcGFkZGxlSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWRkbGUnKTtcbiAgcGFkZGxlSWNvbi5zZXRBdHRyaWJ1dGUoJ3gnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB4ICogQm91bmNlLlNRVUFSRV9TSVpFKTtcbiAgcGFkZGxlSWNvbi5zZXRBdHRyaWJ1dGUoJ3knLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB5ICogQm91bmNlLlNRVUFSRV9TSVpFICsgQm91bmNlLlBBRERMRV9ZX09GRlNFVCk7XG5cbiAgdmFyIHBhZGRsZUNsaXBSZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZGRsZUNsaXBSZWN0Jyk7XG4gIHBhZGRsZUNsaXBSZWN0LnNldEF0dHJpYnV0ZSgneCcsIHggKiBCb3VuY2UuU1FVQVJFX1NJWkUpO1xuICBwYWRkbGVDbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ3knLCBwYWRkbGVJY29uLmdldEF0dHJpYnV0ZSgneScpKTtcbn07XG5cbkJvdW5jZS5kaXNwbGF5U2NvcmUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNjb3JlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Njb3JlJyk7XG4gIHNjb3JlLnRleHRDb250ZW50ID0gYm91bmNlTXNnLnNjb3JlVGV4dCh7XG4gICAgcGxheWVyU2NvcmU6IEJvdW5jZS5wbGF5ZXJTY29yZSxcbiAgICBvcHBvbmVudFNjb3JlOiBCb3VuY2Uub3Bwb25lbnRTY29yZVxuICB9KTtcbn07XG5cbnZhciBza2luVGhlbWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSAnaGFyZGNvdXJ0Jykge1xuICAgIHJldHVybiBza2luO1xuICB9XG4gIHJldHVybiBza2luW3ZhbHVlXTtcbn07XG5cbkJvdW5jZS5zZXRCYWNrZ3JvdW5kID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhY2tncm91bmQnKTtcbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICBza2luVGhlbWUodmFsdWUpLmJhY2tncm91bmQpO1xuXG4gIC8vIFJlY29tcHV0ZSBhbGwgb2YgdGhlIHRpbGVzIHRvIGRldGVybWluZSBpZiB0aGV5IGFyZSB3YWxscywgZ29hbHMsIG9yIGVtcHR5XG4gIC8vIFRPRE86IGRvIHRoaXMgb25jZSBkdXJpbmcgaW5pdCBhbmQgY2FjaGUgdGhlIHJlc3VsdFxuICB2YXIgdGlsZUlkID0gMDtcbiAgZm9yICh2YXIgeSA9IDA7IHkgPCBCb3VuY2UuUk9XUzsgeSsrKSB7XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCBCb3VuY2UuQ09MUzsgeCsrKSB7XG4gICAgICB2YXIgZW1wdHkgPSBmYWxzZTtcbiAgICAgIHZhciBpbWFnZTtcbiAgICAgIC8vIENvbXB1dGUgdGhlIHRpbGUgaW5kZXguXG4gICAgICB2YXIgdGlsZSA9IHdhbGxOb3JtYWxpemUoeCwgeSkgK1xuICAgICAgICAgIHdhbGxOb3JtYWxpemUoeCwgeSAtIDEpICsgIC8vIE5vcnRoLlxuICAgICAgICAgIHdhbGxOb3JtYWxpemUoeCArIDEsIHkpICsgIC8vIEVhc3QuXG4gICAgICAgICAgd2FsbE5vcm1hbGl6ZSh4LCB5ICsgMSkgKyAgLy8gU291dGguXG4gICAgICAgICAgd2FsbE5vcm1hbGl6ZSh4IC0gMSwgeSk7ICAgLy8gV2VzdC5cblxuICAgICAgLy8gRHJhdyB0aGUgdGlsZS5cbiAgICAgIGlmIChXQUxMX1RJTEVfU0hBUEVTW3RpbGVdKSB7XG4gICAgICAgIGltYWdlID0gc2tpblRoZW1lKHZhbHVlKS50aWxlcztcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBDb21wdXRlIHRoZSB0aWxlIGluZGV4LlxuICAgICAgICB0aWxlID0gZ29hbE5vcm1hbGl6ZSh4LCB5KSArXG4gICAgICAgICAgICBnb2FsTm9ybWFsaXplKHgsIHkgLSAxKSArICAvLyBOb3J0aC5cbiAgICAgICAgICAgIGdvYWxOb3JtYWxpemUoeCArIDEsIHkpICsgIC8vIEVhc3QuXG4gICAgICAgICAgICBnb2FsTm9ybWFsaXplKHgsIHkgKyAxKSArICAvLyBTb3V0aC5cbiAgICAgICAgICAgIGdvYWxOb3JtYWxpemUoeCAtIDEsIHkpOyAgIC8vIFdlc3QuXG5cbiAgICAgICAgaWYgKCFHT0FMX1RJTEVfU0hBUEVTW3RpbGVdKSB7XG4gICAgICAgICAgZW1wdHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGltYWdlID0gc2tpblRoZW1lKHZhbHVlKS5nb2FsVGlsZXM7XG4gICAgICB9XG4gICAgICBpZiAoIWVtcHR5KSB7XG4gICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGlsZUVsZW1lbnQnICsgdGlsZUlkKTtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgICAgICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLCBpbWFnZSk7XG4gICAgICB9XG4gICAgICB0aWxlSWQrKztcbiAgICB9XG4gIH1cbn07XG5cbkJvdW5jZS5zZXRCYWxsID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIEJvdW5jZS5iYWxsSW1hZ2UgPSBza2luVGhlbWUodmFsdWUpLmJhbGw7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgQm91bmNlLmJhbGxDb3VudDsgaSsrKSB7XG4gICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFsbCcgKyBpKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgQm91bmNlLmJhbGxJbWFnZSk7XG4gIH1cbn07XG5cbkJvdW5jZS5zZXRQYWRkbGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFkZGxlJyk7XG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgc2tpblRoZW1lKHZhbHVlKS5wYWRkbGUpO1xufTtcblxuQm91bmNlLnRpbWVkT3V0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBCb3VuY2UudGlja0NvdW50ID4gQm91bmNlLnRpbWVvdXRGYWlsdXJlVGljaztcbn07XG5cbkJvdW5jZS5hbGxGaW5pc2hlc0NvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpO1xuICBpZiAoQm91bmNlLnBhZGRsZUZpbmlzaF8pIHtcbiAgICB2YXIgZmluaXNoZWQsIHBsYXlTb3VuZDtcbiAgICBmb3IgKGkgPSAwLCBmaW5pc2hlZCA9IDA7IGkgPCBCb3VuY2UucGFkZGxlRmluaXNoQ291bnQ7IGkrKykge1xuICAgICAgaWYgKCFCb3VuY2UucGFkZGxlRmluaXNoX1tpXS5maW5pc2hlZCkge1xuICAgICAgICBpZiAoZXNzZW50aWFsbHlFcXVhbChCb3VuY2UucGFkZGxlWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQm91bmNlLnBhZGRsZUZpbmlzaF9baV0ueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGlsZXMuRklOSVNIX0NPTExJREVfRElTVEFOQ0UpICYmXG4gICAgICAgICAgICBlc3NlbnRpYWxseUVxdWFsKEJvdW5jZS5wYWRkbGVZLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCb3VuY2UucGFkZGxlRmluaXNoX1tpXS55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWxlcy5GSU5JU0hfQ09MTElERV9ESVNUQU5DRSkpIHtcbiAgICAgICAgICBCb3VuY2UucGFkZGxlRmluaXNoX1tpXS5maW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgZmluaXNoZWQrKztcbiAgICAgICAgICBwbGF5U291bmQgPSB0cnVlO1xuXG4gICAgICAgICAgLy8gQ2hhbmdlIHRoZSBmaW5pc2ggaWNvbiB0byBnb2FsU3VjY2Vzcy5cbiAgICAgICAgICB2YXIgcGFkZGxlRmluaXNoSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWRkbGVmaW5pc2gnICsgaSk7XG4gICAgICAgICAgcGFkZGxlRmluaXNoSWNvbi5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgICAgICAgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLFxuICAgICAgICAgICAgICAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgIHNraW4uZ29hbFN1Y2Nlc3MpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaW5pc2hlZCsrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocGxheVNvdW5kICYmIGZpbmlzaGVkICE9IEJvdW5jZS5wYWRkbGVGaW5pc2hDb3VudCkge1xuICAgICAgLy8gUGxheSBhIHNvdW5kIHVubGVzcyB3ZSd2ZSBoaXQgdGhlIGxhc3QgZmxhZ1xuICAgICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnZmxhZycpO1xuICAgIH1cbiAgICByZXR1cm4gKGZpbmlzaGVkID09IEJvdW5jZS5wYWRkbGVGaW5pc2hDb3VudCk7XG4gIH1cbiAgaWYgKEJvdW5jZS5iYWxsRmluaXNoXykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBCb3VuY2UuYmFsbENvdW50OyBpKyspIHtcbiAgICAgIGlmIChlc3NlbnRpYWxseUVxdWFsKEJvdW5jZS5iYWxsWFtpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIEJvdW5jZS5iYWxsRmluaXNoXy54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGlsZXMuRklOSVNIX0NPTExJREVfRElTVEFOQ0UpICYmXG4gICAgICAgICAgZXNzZW50aWFsbHlFcXVhbChCb3VuY2UuYmFsbFlbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBCb3VuY2UuYmFsbEZpbmlzaF8ueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbGVzLkZJTklTSF9DT0xMSURFX0RJU1RBTkNFKSkge1xuICAgICAgICAvLyBDaGFuZ2UgdGhlIGZpbmlzaCBpY29uIHRvIGdvYWxTdWNjZXNzLlxuICAgICAgICB2YXIgYmFsbEZpbmlzaEljb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFsbGZpbmlzaCcpO1xuICAgICAgICBiYWxsRmluaXNoSWNvbi5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgICAgICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyxcbiAgICAgICAgICAgICd4bGluazpocmVmJyxcbiAgICAgICAgICAgIHNraW4uZ29hbFN1Y2Nlc3MpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxudmFyIGNoZWNrRmluaXNoZWQgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIGlmIHdlIGhhdmUgYSBzdWNjY2VzcyBjb25kaXRpb24gYW5kIGhhdmUgYWNjb21wbGlzaGVkIGl0LCB3ZSdyZSBkb25lIGFuZCBzdWNjZXNzZnVsXG4gIGlmIChsZXZlbC5nb2FsICYmIGxldmVsLmdvYWwuc3VjY2Vzc0NvbmRpdGlvbiAmJiBsZXZlbC5nb2FsLnN1Y2Nlc3NDb25kaXRpb24oKSkge1xuICAgIEJvdW5jZS5yZXN1bHQgPSBSZXN1bHRUeXBlLlNVQ0NFU1M7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBpZiB3ZSBoYXZlIGEgZmFpbHVyZSBjb25kaXRpb24sIGFuZCBpdCdzIGJlZW4gcmVhY2hlZCwgd2UncmUgZG9uZSBhbmQgZmFpbGVkXG4gIGlmIChsZXZlbC5nb2FsICYmIGxldmVsLmdvYWwuZmFpbHVyZUNvbmRpdGlvbiAmJiBsZXZlbC5nb2FsLmZhaWx1cmVDb25kaXRpb24oKSkge1xuICAgIEJvdW5jZS5yZXN1bHQgPSBSZXN1bHRUeXBlLkZBSUxVUkU7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoQm91bmNlLmFsbEZpbmlzaGVzQ29tcGxldGUoKSkge1xuICAgIEJvdW5jZS5yZXN1bHQgPSBSZXN1bHRUeXBlLlNVQ0NFU1M7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoQm91bmNlLnRpbWVkT3V0KCkpIHtcbiAgICBCb3VuY2UucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwic3ZnQm91bmNlXCI+XFxuPC9zdmc+XFxuPGRpdiBpZD1cImNhcGFjaXR5QnViYmxlXCI+XFxuICA8ZGl2IGlkPVwiY2FwYWNpdHlcIj48L2Rpdj5cXG48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7XG4gIHZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xuICB2YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG47IGJ1Zi5wdXNoKCdcXG5cXG48ZGl2IGlkPVwic29mdC1idXR0b25zXCIgY2xhc3M9XCJzb2Z0LWJ1dHRvbnMtbm9uZVwiPlxcbiAgPGJ1dHRvbiBpZD1cImxlZnRCdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDgsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCIgY2xhc3M9XCJsZWZ0LWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cInJpZ2h0QnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgxMSwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cInJpZ2h0LWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cInVwQnV0dG9uXCIgZGlzYWJsZWQ9dHJ1ZSBjbGFzcz1cImFycm93XCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCgxNCwgIGFzc2V0VXJsKCdtZWRpYS8xeDEuZ2lmJykgKSksICdcIiBjbGFzcz1cInVwLWJ0biBpY29uMjFcIj5cXG4gIDwvYnV0dG9uPlxcbiAgPGJ1dHRvbiBpZD1cImRvd25CdXR0b25cIiBkaXNhYmxlZD10cnVlIGNsYXNzPVwiYXJyb3dcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDE3LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiIGNsYXNzPVwiZG93bi1idG4gaWNvbjIxXCI+XFxuICA8L2J1dHRvbj5cXG48L2Rpdj5cXG48ZGl2IGlkPVwic2hhcmUtY2VsbC13cmFwcGVyXCI+XFxuICA8ZGl2IGlkPVwic2hhcmUtY2VsbFwiIGNsYXNzPVwic2hhcmUtY2VsbC1ub25lXCI+XFxuICAgIDxidXR0b24gaWQ9XCJmaW5pc2hCdXR0b25cIiBjbGFzcz1cInNoYXJlXCI+XFxuICAgICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDIzLCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiPicsIGVzY2FwZSgoMjMsICBjb21tb25Nc2cuZmluaXNoKCkgKSksICdcXG4gICAgPC9idXR0b24+XFxuICA8L2Rpdj5cXG48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCIvKipcbiAqIEJsb2NrbHkgQXBwOiBCb3VuY2VcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMyBDb2RlLm9yZ1xuICpcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBjb2RlZ2VuID0gcmVxdWlyZSgnLi4vY29kZWdlbicpO1xuXG52YXIgZ2VuZXJhdGVTZXR0ZXJDb2RlID0gZnVuY3Rpb24gKGN0eCwgbmFtZSkge1xuICB2YXIgdmFsdWUgPSBjdHguZ2V0VGl0bGVWYWx1ZSgnVkFMVUUnKTtcbiAgaWYgKHZhbHVlID09PSBcInJhbmRvbVwiKSB7XG4gICAgdmFyIGFsbFZhbHVlcyA9IGN0eC5WQUxVRVMuc2xpY2UoMSkubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gaXRlbVsxXTtcbiAgICB9KTtcbiAgICB2YWx1ZSA9ICdCb3VuY2UucmFuZG9tKFsnICsgYWxsVmFsdWVzICsgJ10pJztcbiAgfVxuXG4gIHJldHVybiAnQm91bmNlLicgKyBuYW1lICsgJyhcXCdibG9ja19pZF8nICsgY3R4LmlkICsgJ1xcJywgJyArXG4gICAgdmFsdWUgKyAnKTtcXG4nO1xufTtcblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV93aGVuTGVmdCA9IHtcbiAgICAvLyBCbG9jayB0byBoYW5kbGUgZXZlbnQgd2hlbiB0aGUgTGVmdCBhcnJvdyBidXR0b24gaXMgcHJlc3NlZC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE0MCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLndoZW5MZWZ0KCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudChmYWxzZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndoZW5MZWZ0VG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV93aGVuTGVmdCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGhhbmRsaW5nIExlZnQgYXJyb3cgYnV0dG9uIGV2ZW50LlxuICAgIHJldHVybiAnXFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2Vfd2hlblJpZ2h0ID0ge1xuICAgIC8vIEJsb2NrIHRvIGhhbmRsZSBldmVudCB3aGVuIHRoZSBSaWdodCBhcnJvdyBidXR0b24gaXMgcHJlc3NlZC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE0MCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLndoZW5SaWdodCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQoZmFsc2UpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGVuUmlnaHRUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuYm91bmNlX3doZW5SaWdodCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGhhbmRsaW5nIFJpZ2h0IGFycm93IGJ1dHRvbiBldmVudC5cbiAgICByZXR1cm4gJ1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3doZW5VcCA9IHtcbiAgICAvLyBCbG9jayB0byBoYW5kbGUgZXZlbnQgd2hlbiB0aGUgVXAgYXJyb3cgYnV0dG9uIGlzIHByZXNzZWQuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxNDAsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy53aGVuVXAoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KGZhbHNlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2hlblVwVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV93aGVuVXAgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBoYW5kbGluZyBVcCBhcnJvdyBidXR0b24gZXZlbnQuXG4gICAgcmV0dXJuICdcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV93aGVuRG93biA9IHtcbiAgICAvLyBCbG9jayB0byBoYW5kbGUgZXZlbnQgd2hlbiB0aGUgRG93biBhcnJvdyBidXR0b24gaXMgcHJlc3NlZC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE0MCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLndoZW5Eb3duKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudChmYWxzZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndoZW5Eb3duVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV93aGVuRG93biA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGhhbmRsaW5nIERvd24gYXJyb3cgYnV0dG9uIGV2ZW50LlxuICAgIHJldHVybiAnXFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2Vfd2hlbldhbGxDb2xsaWRlZCA9IHtcbiAgICAvLyBCbG9jayB0byBoYW5kbGUgZXZlbnQgd2hlbiBhIHdhbGwvYmFsbCBjb2xsaXNpb24gb2NjdXJzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTQwLCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShtc2cud2hlbldhbGxDb2xsaWRlZCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQoZmFsc2UpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGVuV2FsbENvbGxpZGVkVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV93aGVuV2FsbENvbGxpZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgaGFuZGxpbmcgd2hlbiBhIHdhbGwvYmFsbCBjb2xsaXNpb24gb2NjdXJzLlxuICAgIHJldHVybiAnXFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2Vfd2hlbkJhbGxJbkdvYWwgPSB7XG4gICAgLy8gQmxvY2sgdG8gaGFuZGxlIGV2ZW50IHdoZW4gYSBiYWxsIGVudGVycyBhIGdvYWwuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxNDAsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy53aGVuQmFsbEluR29hbCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQoZmFsc2UpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGVuQmFsbEluR29hbFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5ib3VuY2Vfd2hlbkJhbGxJbkdvYWwgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBoYW5kbGluZyB3aGVuIGEgYmFsbCBpbiBnb2FsIGV2ZW50IG9jY3Vycy5cbiAgICByZXR1cm4gJ1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3doZW5CYWxsTWlzc2VzUGFkZGxlID0ge1xuICAgIC8vIEJsb2NrIHRvIGhhbmRsZSBldmVudCB3aGVuIGEgYmFsbCBtaXNzZXMgdGhlIHBhZGRsZS5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE0MCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLndoZW5CYWxsTWlzc2VzUGFkZGxlKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudChmYWxzZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndoZW5CYWxsTWlzc2VzUGFkZGxlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV93aGVuQmFsbE1pc3Nlc1BhZGRsZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGhhbmRsaW5nIHdoZW4gYSBiYWxsIG1pc3NlcyB0aGUgcGFkZGxlLlxuICAgIHJldHVybiAnXFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2Vfd2hlblBhZGRsZUNvbGxpZGVkID0ge1xuICAgIC8vIEJsb2NrIHRvIGhhbmRsZSBldmVudCB3aGVuIGEgd2FsbCBjb2xsaXNpb24gb2NjdXJzLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTQwLCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShtc2cud2hlblBhZGRsZUNvbGxpZGVkKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudChmYWxzZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndoZW5QYWRkbGVDb2xsaWRlZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5ib3VuY2Vfd2hlblBhZGRsZUNvbGxpZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgaGFuZGxpbmcgd2hlbiBhIHBhZGRsZS9iYWxsIGNvbGxpc2lvbiBvY2N1cnMuXG4gICAgcmV0dXJuICdcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV9tb3ZlTGVmdCA9IHtcbiAgICAvLyBCbG9jayBmb3IgbW92aW5nIGxlZnQuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5tb3ZlTGVmdCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLm1vdmVMZWZ0VG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV9tb3ZlTGVmdCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIG1vdmluZyBsZWZ0LlxuICAgIHJldHVybiAnQm91bmNlLm1vdmVMZWZ0KFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2VfbW92ZVJpZ2h0ID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgcmlnaHQuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5tb3ZlUmlnaHQoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5tb3ZlUmlnaHRUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuYm91bmNlX21vdmVSaWdodCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIG1vdmluZyByaWdodC5cbiAgICByZXR1cm4gJ0JvdW5jZS5tb3ZlUmlnaHQoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV9tb3ZlVXAgPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyB1cC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLm1vdmVVcCgpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLm1vdmVVcFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5ib3VuY2VfbW92ZVVwID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgbW92aW5nIHVwLlxuICAgIHJldHVybiAnQm91bmNlLm1vdmVVcChcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX21vdmVEb3duID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZG93bi5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLm1vdmVEb3duKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cubW92ZURvd25Ub29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuYm91bmNlX21vdmVEb3duID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgbW92aW5nIGRvd24uXG4gICAgcmV0dXJuICdCb3VuY2UubW92ZURvd24oXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV9wbGF5U291bmQgPSB7XG4gICAgLy8gQmxvY2sgZm9yIHBsYXlpbmcgc291bmQuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlNPVU5EUyksICdTT1VORCcpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cucGxheVNvdW5kVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3BsYXlTb3VuZC5TT1VORFMgPVxuICAgICAgW1ttc2cucGxheVNvdW5kSGl0KCksICdoaXQnXSxcbiAgICAgICBbbXNnLnBsYXlTb3VuZFdvb2QoKSwgJ3dvb2QnXSxcbiAgICAgICBbbXNnLnBsYXlTb3VuZFJldHJvKCksICdyZXRybyddLFxuICAgICAgIFttc2cucGxheVNvdW5kU2xhcCgpLCAnc2xhcCddLFxuICAgICAgIFttc2cucGxheVNvdW5kUnViYmVyKCksICdydWJiZXInXSxcbiAgICAgICBbbXNnLnBsYXlTb3VuZENydW5jaCgpLCAnY3J1bmNoJ10sXG4gICAgICAgW21zZy5wbGF5U291bmRXaW5Qb2ludCgpLCAnd2lucG9pbnQnXSxcbiAgICAgICBbbXNnLnBsYXlTb3VuZFdpblBvaW50MigpLCAnd2lucG9pbnQyJ10sXG4gICAgICAgW21zZy5wbGF5U291bmRMb3NlUG9pbnQoKSwgJ2xvc2Vwb2ludCddLFxuICAgICAgIFttc2cucGxheVNvdW5kTG9zZVBvaW50MigpLCAnbG9zZXBvaW50MiddLFxuICAgICAgIFttc2cucGxheVNvdW5kR29hbDEoKSwgJ2dvYWwxJ10sXG4gICAgICAgW21zZy5wbGF5U291bmRHb2FsMigpLCAnZ29hbDInXV07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV9wbGF5U291bmQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBwbGF5aW5nIGEgc291bmQuXG4gICAgcmV0dXJuICdCb3VuY2UucGxheVNvdW5kKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJywgXFwnJyArXG4gICAgICAgICAgICAgICB0aGlzLmdldFRpdGxlVmFsdWUoJ1NPVU5EJykgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV9pbmNyZW1lbnRQbGF5ZXJTY29yZSA9IHtcbiAgICAvLyBCbG9jayBmb3IgaW5jcmVtZW50aW5nIHRoZSBwbGF5ZXIncyBzY29yZS5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmluY3JlbWVudFBsYXllclNjb3JlKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuaW5jcmVtZW50UGxheWVyU2NvcmVUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuYm91bmNlX2luY3JlbWVudFBsYXllclNjb3JlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgaW5jcmVtZW50aW5nIHRoZSBwbGF5ZXIncyBzY29yZS5cbiAgICByZXR1cm4gJ0JvdW5jZS5pbmNyZW1lbnRQbGF5ZXJTY29yZShcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX2luY3JlbWVudE9wcG9uZW50U2NvcmUgPSB7XG4gICAgLy8gQmxvY2sgZm9yIGluY3JlbWVudGluZyB0aGUgb3Bwb25lbnQncyBzY29yZS5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmluY3JlbWVudE9wcG9uZW50U2NvcmUoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5pbmNyZW1lbnRPcHBvbmVudFNjb3JlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV9pbmNyZW1lbnRPcHBvbmVudFNjb3JlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgaW5jcmVtZW50aW5nIHRoZSBvcHBvbmVudCdzIHNjb3JlLlxuICAgIHJldHVybiAnQm91bmNlLmluY3JlbWVudE9wcG9uZW50U2NvcmUoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV9ib3VuY2VCYWxsID0ge1xuICAgIC8vIEJsb2NrIGZvciBib3VuY2luZyBhIGJhbGwuXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5ib3VuY2VCYWxsKCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuYm91bmNlQmFsbFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5ib3VuY2VfYm91bmNlQmFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGJvdW5jaW5nIGEgYmFsbC5cbiAgICByZXR1cm4gJ0JvdW5jZS5ib3VuY2VCYWxsKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2VfbGF1bmNoQmFsbCA9IHtcbiAgICAvLyBCbG9jayBmb3IgbGF1bmNoaW5nIGEgYmFsbC5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmxhdW5jaEJhbGwoKSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5sYXVuY2hCYWxsVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmJvdW5jZV9sYXVuY2hCYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgbGF1bmNoaW5nIGEgYmFsbC5cbiAgICByZXR1cm4gJ0JvdW5jZS5sYXVuY2hCYWxsKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2Vfc2V0QmFsbFNwZWVkID0ge1xuICAgIC8vIEJsb2NrIGZvciBzZXR0aW5nIGJhbGwgc3BlZWRcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRVMpO1xuICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5WQUxVRVNbM11bMV0pOyAvLyBkZWZhdWx0IHRvIG5vcm1hbFxuXG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuc2V0QmFsbFNwZWVkVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3NldEJhbGxTcGVlZC5WQUxVRVMgPVxuICAgICAgW1ttc2cuc2V0QmFsbFNwZWVkUmFuZG9tKCksICdyYW5kb20nXSxcbiAgICAgICBbbXNnLnNldEJhbGxTcGVlZFZlcnlTbG93KCksICdCb3VuY2UuQmFsbFNwZWVkLlZFUllfU0xPVyddLFxuICAgICAgIFttc2cuc2V0QmFsbFNwZWVkU2xvdygpLCAnQm91bmNlLkJhbGxTcGVlZC5TTE9XJ10sXG4gICAgICAgW21zZy5zZXRCYWxsU3BlZWROb3JtYWwoKSwgJ0JvdW5jZS5CYWxsU3BlZWQuTk9STUFMJ10sXG4gICAgICAgW21zZy5zZXRCYWxsU3BlZWRGYXN0KCksICdCb3VuY2UuQmFsbFNwZWVkLkZBU1QnXSxcbiAgICAgICBbbXNnLnNldEJhbGxTcGVlZFZlcnlGYXN0KCksICdCb3VuY2UuQmFsbFNwZWVkLlZFUllfRkFTVCddXTtcblxuICBnZW5lcmF0b3IuYm91bmNlX3NldEJhbGxTcGVlZCA9IGZ1bmN0aW9uICh2ZWxvY2l0eSkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ3NldEJhbGxTcGVlZCcpO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV9zZXRQYWRkbGVTcGVlZCA9IHtcbiAgICAvLyBCbG9jayBmb3Igc2V0dGluZyBwYWRkbGUgc3BlZWRcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRVMpO1xuICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5WQUxVRVNbM11bMV0pOyAvLyBkZWZhdWx0IHRvIG5vcm1hbFxuXG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuc2V0UGFkZGxlU3BlZWRUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2Vfc2V0UGFkZGxlU3BlZWQuVkFMVUVTID1cbiAgICAgIFtbbXNnLnNldFBhZGRsZVNwZWVkUmFuZG9tKCksICdyYW5kb20nXSxcbiAgICAgICBbbXNnLnNldFBhZGRsZVNwZWVkVmVyeVNsb3coKSwgJ0JvdW5jZS5QYWRkbGVTcGVlZC5WRVJZX1NMT1cnXSxcbiAgICAgICBbbXNnLnNldFBhZGRsZVNwZWVkU2xvdygpLCAnQm91bmNlLlBhZGRsZVNwZWVkLlNMT1cnXSxcbiAgICAgICBbbXNnLnNldFBhZGRsZVNwZWVkTm9ybWFsKCksICdCb3VuY2UuUGFkZGxlU3BlZWQuTk9STUFMJ10sXG4gICAgICAgW21zZy5zZXRQYWRkbGVTcGVlZEZhc3QoKSwgJ0JvdW5jZS5QYWRkbGVTcGVlZC5GQVNUJ10sXG4gICAgICAgW21zZy5zZXRQYWRkbGVTcGVlZFZlcnlGYXN0KCksICdCb3VuY2UuUGFkZGxlU3BlZWQuVkVSWV9GQVNUJ11dO1xuXG4gIGdlbmVyYXRvci5ib3VuY2Vfc2V0UGFkZGxlU3BlZWQgPSBmdW5jdGlvbiAodmVsb2NpdHkpIHtcbiAgICByZXR1cm4gZ2VuZXJhdGVTZXR0ZXJDb2RlKHRoaXMsICdzZXRQYWRkbGVTcGVlZCcpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBzZXRCYWNrZ3JvdW5kXG4gICAqL1xuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2Vfc2V0QmFja2dyb3VuZCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRVMpO1xuICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5WQUxVRVNbMV1bMV0pOyAgLy8gZGVmYXVsdCB0byBoYXJkY291cnRcblxuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVkFMVUUnKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuc2V0QmFja2dyb3VuZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmJvdW5jZV9zZXRCYWNrZ3JvdW5kLlZBTFVFUyA9XG4gICAgICBbW21zZy5zZXRCYWNrZ3JvdW5kUmFuZG9tKCksICdyYW5kb20nXSxcbiAgICAgICBbbXNnLnNldEJhY2tncm91bmRIYXJkY291cnQoKSwgJ1wiaGFyZGNvdXJ0XCInXSxcbiAgICAgICBbbXNnLnNldEJhY2tncm91bmRSZXRybygpLCAnXCJyZXRyb1wiJ11dO1xuXG4gIGdlbmVyYXRvci5ib3VuY2Vfc2V0QmFja2dyb3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ3NldEJhY2tncm91bmQnKTtcbiAgfTtcblxuICAvKipcbiAgICogc2V0QmFsbFxuICAgKi9cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3NldEJhbGwgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUVTKTtcbiAgICAgIGRyb3Bkb3duLnNldFZhbHVlKHRoaXMuVkFMVUVTWzFdWzFdKTsgIC8vIGRlZmF1bHQgdG8gaGFyZGNvdXJ0XG5cbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1ZBTFVFJyk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnNldEJhbGxUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5ib3VuY2Vfc2V0QmFsbC5WQUxVRVMgPVxuICAgICAgW1ttc2cuc2V0QmFsbFJhbmRvbSgpLCAncmFuZG9tJ10sXG4gICAgICAgW21zZy5zZXRCYWxsSGFyZGNvdXJ0KCksICdcImhhcmRjb3VydFwiJ10sXG4gICAgICAgW21zZy5zZXRCYWxsUmV0cm8oKSwgJ1wicmV0cm9cIiddXTtcblxuICBnZW5lcmF0b3IuYm91bmNlX3NldEJhbGwgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZ2VuZXJhdGVTZXR0ZXJDb2RlKHRoaXMsICdzZXRCYWxsJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIHNldFBhZGRsZVxuICAgKi9cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3NldFBhZGRsZSA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRVMpO1xuICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5WQUxVRVNbMV1bMV0pOyAgLy8gZGVmYXVsdCB0byBoYXJkY291cnRcblxuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVkFMVUUnKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuc2V0UGFkZGxlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuYm91bmNlX3NldFBhZGRsZS5WQUxVRVMgPVxuICAgICAgW1ttc2cuc2V0UGFkZGxlUmFuZG9tKCksICdyYW5kb20nXSxcbiAgICAgICBbbXNnLnNldFBhZGRsZUhhcmRjb3VydCgpLCAnXCJoYXJkY291cnRcIiddLFxuICAgICAgIFttc2cuc2V0UGFkZGxlUmV0cm8oKSwgJ1wicmV0cm9cIiddXTtcblxuICBnZW5lcmF0b3IuYm91bmNlX3NldFBhZGRsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ3NldFBhZGRsZScpO1xuICB9O1xuXG4gIGRlbGV0ZSBibG9ja2x5LkJsb2Nrcy5wcm9jZWR1cmVzX2RlZnJldHVybjtcbiAgZGVsZXRlIGJsb2NrbHkuQmxvY2tzLnByb2NlZHVyZXNfaWZyZXR1cm47XG59O1xuIiwiLy8gbG9jYWxlIGZvciBib3VuY2VcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS5ib3VuY2VfbG9jYWxlO1xuIiwidmFyIHRpbGVzID0gcmVxdWlyZSgnLi90aWxlcycpO1xudmFyIERpcmVjdGlvbiA9IHRpbGVzLkRpcmVjdGlvbjtcbnZhciBTcXVhcmVUeXBlID0gdGlsZXMuU3F1YXJlVHlwZTtcbnZhciBzdHVkaW9BcHAgPSByZXF1aXJlKCcuLi9TdHVkaW9BcHAnKS5zaW5nbGV0b247XG5cbmV4cG9ydHMuUGFkZGxlU3BlZWQgPSB7XG4gIFZFUllfU0xPVzogMC4wNCxcbiAgU0xPVzogMC4wNixcbiAgTk9STUFMOiAwLjEsXG4gIEZBU1Q6IDAuMTUsXG4gIFZFUllfRkFTVDogMC4yM1xufTtcblxuZXhwb3J0cy5CYWxsU3BlZWQgPSB7XG4gIFZFUllfU0xPVzogMC4wNCxcbiAgU0xPVzogMC4wNixcbiAgTk9STUFMOiAwLjEsXG4gIEZBU1Q6IDAuMTUsXG4gIFZFUllfRkFTVDogMC4yM1xufTtcblxuZXhwb3J0cy5yYW5kb20gPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gIHZhciBrZXkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB2YWx1ZXMubGVuZ3RoKTtcbiAgcmV0dXJuIHZhbHVlc1trZXldO1xufTtcblxuZXhwb3J0cy5zZXRCYWxsU3BlZWQgPSBmdW5jdGlvbiAoaWQsIHZhbHVlKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBCb3VuY2UuY3VycmVudEJhbGxTcGVlZCA9IHZhbHVlO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IEJvdW5jZS5iYWxsQ291bnQ7IGkrKykge1xuICAgIEJvdW5jZS5iYWxsU3BlZWRbaV0gPSB2YWx1ZTtcbiAgfVxufTtcblxuZXhwb3J0cy5zZXRCYWNrZ3JvdW5kID0gZnVuY3Rpb24gKGlkLCB2YWx1ZSkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgQm91bmNlLnNldEJhY2tncm91bmQodmFsdWUpO1xufTtcblxuZXhwb3J0cy5zZXRCYWxsID0gZnVuY3Rpb24gKGlkLCB2YWx1ZSkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgQm91bmNlLnNldEJhbGwodmFsdWUpO1xufTtcblxuZXhwb3J0cy5zZXRQYWRkbGUgPSBmdW5jdGlvbiAoaWQsIHZhbHVlKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBCb3VuY2Uuc2V0UGFkZGxlKHZhbHVlKTtcbn07XG5cbmV4cG9ydHMuc2V0QmFja2dyb3VuZCA9IGZ1bmN0aW9uIChpZCwgdmFsdWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEJvdW5jZS5zZXRCYWNrZ3JvdW5kKHZhbHVlKTtcbn07XG5cbmV4cG9ydHMuc2V0UGFkZGxlU3BlZWQgPSBmdW5jdGlvbiAoaWQsIHZhbHVlKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBCb3VuY2UucGFkZGxlU3BlZWQgPSB2YWx1ZTtcbn07XG5cbmV4cG9ydHMucGxheVNvdW5kID0gZnVuY3Rpb24oaWQsIHNvdW5kTmFtZSkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgc3R1ZGlvQXBwLnBsYXlBdWRpbyhzb3VuZE5hbWUpO1xufTtcblxuZXhwb3J0cy5tb3ZlTGVmdCA9IGZ1bmN0aW9uKGlkKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBCb3VuY2UucGFkZGxlWCAtPSBCb3VuY2UucGFkZGxlU3BlZWQ7XG4gIGlmIChCb3VuY2UucGFkZGxlWCA8IDApIHtcbiAgICBCb3VuY2UucGFkZGxlWCA9IDA7XG4gIH1cbn07XG5cbmV4cG9ydHMubW92ZVJpZ2h0ID0gZnVuY3Rpb24oaWQpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEJvdW5jZS5wYWRkbGVYICs9IEJvdW5jZS5wYWRkbGVTcGVlZDtcbiAgaWYgKEJvdW5jZS5wYWRkbGVYID4gKEJvdW5jZS5DT0xTIC0gMSkpIHtcbiAgICBCb3VuY2UucGFkZGxlWCA9IEJvdW5jZS5DT0xTIC0gMTtcbiAgfVxufTtcblxuZXhwb3J0cy5tb3ZlVXAgPSBmdW5jdGlvbihpZCkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgQm91bmNlLnBhZGRsZVkgLT0gQm91bmNlLnBhZGRsZVNwZWVkO1xuICBpZiAoQm91bmNlLnBhZGRsZVkgPCAwKSB7XG4gICAgQm91bmNlLnBhZGRsZVkgPSAwO1xuICB9XG59O1xuXG5leHBvcnRzLm1vdmVEb3duID0gZnVuY3Rpb24oaWQpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEJvdW5jZS5wYWRkbGVZICs9IEJvdW5jZS5wYWRkbGVTcGVlZDtcbiAgaWYgKEJvdW5jZS5wYWRkbGVZID4gKEJvdW5jZS5ST1dTIC0gMSkpIHtcbiAgICBCb3VuY2UucGFkZGxlWSA9IEJvdW5jZS5ST1dTIC0gMTtcbiAgfVxufTtcblxuZXhwb3J0cy5pbmNyZW1lbnRPcHBvbmVudFNjb3JlID0gZnVuY3Rpb24oaWQpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEJvdW5jZS5vcHBvbmVudFNjb3JlKys7XG4gIEJvdW5jZS5kaXNwbGF5U2NvcmUoKTtcbn07XG5cbmV4cG9ydHMuaW5jcmVtZW50UGxheWVyU2NvcmUgPSBmdW5jdGlvbihpZCkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgQm91bmNlLnBsYXllclNjb3JlKys7XG4gIEJvdW5jZS5kaXNwbGF5U2NvcmUoKTtcbn07XG5cbmV4cG9ydHMubGF1bmNoQmFsbCA9IGZ1bmN0aW9uKGlkKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuXG4gIC8vIGxvb2sgZm9yIGFuIFwib3V0IG9mIHBsYXlcIiBiYWxsIHRvIHJlLWxhdW5jaDpcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBCb3VuY2UuYmFsbENvdW50OyBpKyspIHtcbiAgICBpZiAoQm91bmNlLmlzQmFsbE91dE9mQm91bmRzKGkpICYmXG4gICAgICAgICgwID09PSAoQm91bmNlLmJhbGxGbGFnc1tpXSAmIEJvdW5jZS5CYWxsRmxhZ3MuTEFVTkNISU5HKSkpIHtcbiAgICAgIC8vIGZvdW5kIGFuIG91dC1vZi1ib3VuZHMgYmFsbCB0aGF0IGlzIG5vdCBhbHJlYWR5IGxhdW5jaGluZy4uLlxuICAgICAgLy9jb25zb2xlLmxvZyhcIkxCOiByZWxhdW5jaGluZyBiYWxsIFwiICsgaSk7XG4gICAgICBCb3VuY2UubGF1bmNoQmFsbChpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICAvLyB3ZSBkaWRuJ3QgZmluZCBhbiBcIm91dCBvZiBwbGF5XCIgYmFsbCwgc28gY3JlYXRlIGFuZCBsYXVuY2ggYSBuZXcgb25lOlxuICBpID0gQm91bmNlLmJhbGxDb3VudDtcbiAgQm91bmNlLmJhbGxDb3VudCsrO1xuICBCb3VuY2UuY3JlYXRlQmFsbEVsZW1lbnRzKGkpO1xuICAvL2NvbnNvbGUubG9nKFwiTEI6IGNyZWF0ZWQgbmV3IGJhbGwgXCIgKyBpICsgXCIgY2FsbGluZyBwbGF5U291bmRBbmRSZXNldEJhbGxcIik7XG4gIEJvdW5jZS5wbGF5U291bmRBbmRSZXNldEJhbGwoaSk7XG59O1xuXG5leHBvcnRzLmJvdW5jZUJhbGwgPSBmdW5jdGlvbihpZCkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcblxuICB2YXIgaTtcbiAgZm9yIChpID0gMDsgaSA8IEJvdW5jZS5iYWxsQ291bnQ7IGkrKykge1xuICAgIGlmICgwID09PSAoQm91bmNlLmJhbGxGbGFnc1tpXSAmXG4gICAgICAgICAgICAgICAoQm91bmNlLkJhbGxGbGFncy5NSVNTRURfUEFERExFIHwgQm91bmNlLkJhbGxGbGFncy5JTl9HT0FMKSkpIHtcbiAgICAgIGlmIChCb3VuY2UuYmFsbFhbaV0gPCAwKSB7XG4gICAgICAgIEJvdW5jZS5iYWxsWFtpXSA9IDA7XG4gICAgICAgIEJvdW5jZS5iYWxsRGlyW2ldID0gMiAqIE1hdGguUEkgLSBCb3VuY2UuYmFsbERpcltpXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIkJvdW5jZWQgb2ZmIGxlZnQsIGJhbGwgXCIgKyBpKTtcbiAgICAgIH0gZWxzZSBpZiAoQm91bmNlLmJhbGxYW2ldID4gKEJvdW5jZS5DT0xTIC0gMSkpIHtcbiAgICAgICAgQm91bmNlLmJhbGxYW2ldID0gQm91bmNlLkNPTFMgLSAxO1xuICAgICAgICBCb3VuY2UuYmFsbERpcltpXSA9IDIgKiBNYXRoLlBJIC0gQm91bmNlLmJhbGxEaXJbaV07XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJCb3VuY2VkIG9mZiByaWdodCwgYmFsbCBcIiArIGkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoQm91bmNlLmJhbGxZW2ldIDwgdGlsZXMuWV9UT1BfQk9VTkRBUlkpIHtcbiAgICAgICAgQm91bmNlLmJhbGxZW2ldID0gdGlsZXMuWV9UT1BfQk9VTkRBUlk7XG4gICAgICAgIEJvdW5jZS5iYWxsRGlyW2ldID0gTWF0aC5QSSAtIEJvdW5jZS5iYWxsRGlyW2ldO1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiQm91bmNlZCBvZmYgdG9wLCBiYWxsIFwiICsgaSk7XG4gICAgICB9XG5cbiAgICAgIHZhciB4UGFkZGxlQmFsbCA9IEJvdW5jZS5iYWxsWFtpXSAtIEJvdW5jZS5wYWRkbGVYO1xuICAgICAgdmFyIHlQYWRkbGVCYWxsID0gQm91bmNlLmJhbGxZW2ldIC0gQm91bmNlLnBhZGRsZVk7XG4gICAgICB2YXIgZGlzdFBhZGRsZUJhbGwgPSBCb3VuY2UuY2FsY0Rpc3RhbmNlKHhQYWRkbGVCYWxsLCB5UGFkZGxlQmFsbCk7XG5cbiAgICAgIGlmIChkaXN0UGFkZGxlQmFsbCA8IHRpbGVzLlBBRERMRV9CQUxMX0NPTExJREVfRElTVEFOQ0UpIHtcbiAgICAgICAgLy8gcGFkZGxlIGJhbGwgY29sbGlzaW9uXG4gICAgICAgIGlmIChNYXRoLmNvcyhCb3VuY2UuYmFsbERpcltpXSkgPCAwKSB7XG4gICAgICAgICAgLy8gcmF0aGVyIHRoYW4ganVzdCBib3VuY2UgdGhlIGJhbGwgb2ZmIGEgZmxhdCBwYWRkbGUsIHdlIG9mZnNldCB0aGVcbiAgICAgICAgICAvLyBhbmdsZSBhZnRlciBjb2xsaXNpb24gYmFzZWQgb24gd2hldGhlciB5b3UgaGl0IHRoZSBsZWZ0IG9yIHJpZ2h0XG4gICAgICAgICAgLy8gc2lkZSBvZiB0aGUgcGFkZGxlLiAgQW5kIHRoZW4gd2UgY2FwIHRoZSByZXN1bHRpbmcgYW5nbGUgdG8gYmUgaW4gYVxuICAgICAgICAgIC8vIGNlcnRhaW4gcmFuZ2Ugb2YgcmFkaWFucyBzbyB0aGUgcmVzdWx0aW5nIGFuZ2xlIGlzbid0IHRvbyBmbGF0XG4gICAgICAgICAgdmFyIHBhZGRsZUFuZ2xlQmlhcyA9ICgzICogTWF0aC5QSSAvIDgpICpcbiAgICAgICAgICAgICAgKHhQYWRkbGVCYWxsIC8gdGlsZXMuUEFERExFX0JBTExfQ09MTElERV9ESVNUQU5DRSk7XG4gICAgICAgICAgLy8gQWRkIDUgUEkgaW5zdGVhZCBvZiBQSSB0byBlbnN1cmUgdGhhdCB0aGUgcmVzdWx0aW5nIGFuZ2xlIGlzXG4gICAgICAgICAgLy8gcG9zaXRpdmUgdG8gc2ltcGxpZnkgdGhlIHRlcm5hcnkgb3BlcmF0aW9uIGluIHRoZSBuZXh0IHN0YXRlbWVudFxuICAgICAgICAgIEJvdW5jZS5iYWxsRGlyW2ldID1cbiAgICAgICAgICAgICAgKChNYXRoLlBJICogNSkgKyBwYWRkbGVBbmdsZUJpYXMgLSBCb3VuY2UuYmFsbERpcltpXSkgJVxuICAgICAgICAgICAgICAgKE1hdGguUEkgKiAyKTtcbiAgICAgICAgICBCb3VuY2UuYmFsbERpcltpXSA9IChCb3VuY2UuYmFsbERpcltpXSA8IE1hdGguUEkpID9cbiAgICAgICAgICAgICAgTWF0aC5taW4oKE1hdGguUEkgLyAyKSAtIDAuMiwgQm91bmNlLmJhbGxEaXJbaV0pIDpcbiAgICAgICAgICAgICAgTWF0aC5tYXgoKDMgKiBNYXRoLlBJIC8gMikgKyAwLjIsIEJvdW5jZS5iYWxsRGlyW2ldKTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiQm91bmNlZCBvZmYgcGFkZGxlLCBiYWxsIFwiICsgaSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ29uc3RhbnRzIGZvciBjYXJkaW5hbCBkaXJlY3Rpb25zLiAgU3Vic2VxdWVudCBjb2RlIGFzc3VtZXMgdGhlc2UgYXJlXG4gKiBpbiB0aGUgcmFuZ2UgMC4uMyBhbmQgdGhhdCBvcHBvc2l0ZXMgaGF2ZSBhbiBhYnNvbHV0ZSBkaWZmZXJlbmNlIG9mIDIuXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5leHBvcnRzLkRpcmVjdGlvbiA9IHtcbiAgTk9SVEg6IDAsXG4gIEVBU1Q6IDEsXG4gIFNPVVRIOiAyLFxuICBXRVNUOiAzXG59O1xuXG5leHBvcnRzLlBBRERMRV9CQUxMX0NPTExJREVfRElTVEFOQ0UgPSAwLjc7XG5leHBvcnRzLkZJTklTSF9DT0xMSURFX0RJU1RBTkNFID0gMC41O1xuZXhwb3J0cy5ERUZBVUxUX0JBTExfU1BFRUQgPSAwLjE7XG5leHBvcnRzLkRFRkFVTFRfQkFMTF9ESVJFQ1RJT04gPSAxLjI1ICogTWF0aC5QSTtcbmV4cG9ydHMuREVGQVVMVF9QQURETEVfU1BFRUQgPSAwLjE7XG5leHBvcnRzLkRFRkFVTFRfQkFMTF9TVEFSVF9ZID0gMjtcbmV4cG9ydHMuWV9UT1BfQk9VTkRBUlkgPSAtMC4yO1xuXG4vKipcbiAqIFRoZSB0eXBlcyBvZiBzcXVhcmVzIGluIHRoZSBtYXplLCB3aGljaCBpcyByZXByZXNlbnRlZFxuICogYXMgYSAyRCBhcnJheSBvZiBTcXVhcmVUeXBlIHZhbHVlcy5cbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cbmV4cG9ydHMuU3F1YXJlVHlwZSA9IHtcbiAgT1BFTjogMCxcbiAgV0FMTDogMSxcbiAgR09BTDogMixcbiAgQkFMTFNUQVJUOiA0LFxuICBQQURETEVGSU5JU0g6IDgsXG4gIFBBRERMRVNUQVJUOiAxNixcbiAgQkFMTEZJTklTSDogMzIsXG4gIE9CU1RBQ0xFOiA2NFxufTtcbiJdfQ==
