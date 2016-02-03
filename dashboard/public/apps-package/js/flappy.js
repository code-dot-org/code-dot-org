require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ubuntu/staging/apps/build/js/flappy/main.js":[function(require,module,exports){
(function (global){
'use strict';

var appMain = require('../appMain');
window.Flappy = require('./flappy');
if (typeof global !== 'undefined') {
  global.Flappy = window.Flappy;
}
var blocks = require('./blocks');
var levels = require('./levels');
var skins = require('./skins');

window.flappyMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Flappy, levels, options);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1aWxkL2pzL2ZsYXBweS9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxNQUFNLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwQyxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtBQUNqQyxRQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7Q0FDL0I7QUFDRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFL0IsTUFBTSxDQUFDLFVBQVUsR0FBRyxVQUFTLE9BQU8sRUFBRTtBQUNwQyxTQUFPLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUM1QixTQUFPLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUM5QixTQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDekMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuRmxhcHB5ID0gcmVxdWlyZSgnLi9mbGFwcHknKTtcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICBnbG9iYWwuRmxhcHB5ID0gd2luZG93LkZsYXBweTtcbn1cbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuL3NraW5zJyk7XG5cbndpbmRvdy5mbGFwcHlNYWluID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBvcHRpb25zLnNraW5zTW9kdWxlID0gc2tpbnM7XG4gIG9wdGlvbnMuYmxvY2tzTW9kdWxlID0gYmxvY2tzO1xuICBhcHBNYWluKHdpbmRvdy5GbGFwcHksIGxldmVscywgb3B0aW9ucyk7XG59O1xuIl19
},{"../appMain":"/home/ubuntu/staging/apps/build/js/appMain.js","./blocks":"/home/ubuntu/staging/apps/build/js/flappy/blocks.js","./flappy":"/home/ubuntu/staging/apps/build/js/flappy/flappy.js","./levels":"/home/ubuntu/staging/apps/build/js/flappy/levels.js","./skins":"/home/ubuntu/staging/apps/build/js/flappy/skins.js"}],"/home/ubuntu/staging/apps/build/js/flappy/skins.js":[function(require,module,exports){
/**
 * Load Skin for Flappy.
 */
// background: Number of 400x400 background images. Randomly select one if
// specified, otherwise, use background.png.
// graph: Colour of optional grid lines, or false.

'use strict';

var skinsBase = require('../skins');

var CONFIGS = {

  flappy: {}

};

exports.load = function (assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  var config = CONFIGS[skin.id];

  // todo: the way these are organized ends up being a little bit ugly as
  // lot of our assets are individual items not necessarily attached to a
  // specific theme

  skin.scifi = {
    background: skin.assetUrl('background_scifi.png'),
    avatar: skin.assetUrl('avatar_scifi.png'),
    obstacle_bottom: skin.assetUrl('obstacle_bottom_scifi.png'),
    obstacle_bottom_thumb: skin.assetUrl('obstacle_bottom_scifi_thumb.png'),
    obstacle_top: skin.assetUrl('obstacle_top_scifi.png'),
    ground: skin.assetUrl('ground_scifi.png'),
    ground_thumb: skin.assetUrl('ground_scifi_thumb.png')
  };

  skin.underwater = {
    background: skin.assetUrl('background_underwater.png'),
    avatar: skin.assetUrl('avatar_underwater.png'),
    obstacle_bottom: skin.assetUrl('obstacle_bottom_underwater.png'),
    obstacle_bottom_thumb: skin.assetUrl('obstacle_bottom_underwater_thumb.png'),
    obstacle_top: skin.assetUrl('obstacle_top_underwater.png'),
    ground: skin.assetUrl('ground_underwater.png'),
    ground_thumb: skin.assetUrl('ground_underwater_thumb.png')
  };

  skin.cave = {
    background: skin.assetUrl('background_cave.png'),
    avatar: skin.assetUrl('avatar_cave.png'),
    obstacle_bottom: skin.assetUrl('obstacle_bottom_cave.png'),
    obstacle_bottom_thumb: skin.assetUrl('obstacle_bottom_cave_thumb.png'),
    obstacle_top: skin.assetUrl('obstacle_top_cave.png'),
    ground: skin.assetUrl('ground_cave.png'),
    ground_thumb: skin.assetUrl('ground_cave_thumb.png')
  };

  skin.santa = {
    background: skin.assetUrl('background_santa.png'),
    avatar: skin.assetUrl('santa.png'),
    obstacle_bottom: skin.assetUrl('obstacle_bottom_santa.png'),
    obstacle_bottom_thumb: skin.assetUrl('obstacle_bottom_santa_thumb.png'),
    obstacle_top: skin.assetUrl('obstacle_top_santa.png'),
    ground: skin.assetUrl('ground_santa.png'),
    ground_thumb: skin.assetUrl('ground_santa_thumb.png')
  };

  skin.night = {
    background: skin.assetUrl('background_night.png')
  };

  skin.redbird = {
    avatar: skin.assetUrl('avatar_redbird.png')
  };

  skin.laser = {
    obstacle_bottom: skin.assetUrl('obstacle_bottom_laser.png'),
    obstacle_bottom_thumb: skin.assetUrl('obstacle_bottom_laser_thumb.png'),
    obstacle_top: skin.assetUrl('obstacle_top_laser.png')
  };

  skin.lava = {
    ground: skin.assetUrl('ground_lava.png'),
    ground_thumb: skin.assetUrl('ground_lava_thumb.png')
  };

  skin.shark = {
    avatar: skin.assetUrl('shark.png')
  };

  skin.easter = {
    avatar: skin.assetUrl('easterbunny.png')
  };

  skin.batman = {
    avatar: skin.assetUrl('batman.png')
  };

  skin.submarine = {
    avatar: skin.assetUrl('submarine.png')
  };

  skin.unicorn = {
    avatar: skin.assetUrl('unicorn.png')
  };

  skin.fairy = {
    avatar: skin.assetUrl('fairy.png')
  };

  skin.superman = {
    avatar: skin.assetUrl('superman.png')
  };

  skin.turkey = {
    avatar: skin.assetUrl('turkey.png')
  };

  // Images
  skin.ground = skin.assetUrl('ground.png');
  skin.ground_thumb = skin.assetUrl('ground_thumb.png');
  skin.obstacle_top = skin.assetUrl('obstacle_top.png');
  skin.obstacle_bottom = skin.assetUrl('obstacle_bottom.png');
  skin.obstacle_bottom_thumb = skin.assetUrl('obstacle_bottom_thumb.png');
  skin.instructions = skin.assetUrl('instructions.png');
  skin.clickrun = skin.assetUrl('clickrun.png');
  skin.getready = skin.assetUrl('getready.png');
  skin.gameover = skin.assetUrl('gameover.png');
  skin.flapIcon = skin.assetUrl('flap-bird.png');
  skin.crashIcon = skin.assetUrl('when-crash.png');
  skin.collideObstacleIcon = skin.assetUrl('when-obstacle.png');
  skin.collideGroundIcon = skin.assetUrl('when-crash.png');
  skin.enterObstacleIcon = skin.assetUrl('when-pass.png');
  skin.tiles = skin.assetUrl('tiles.png');
  skin.goal = skin.assetUrl('goal.png');
  skin.goalSuccess = skin.assetUrl('goal_success.png');
  skin.obstacle = skin.assetUrl('obstacle.png');
  skin.obstacleScale = config.obstacleScale || 1.0;
  skin.largerObstacleAnimationTiles = skin.assetUrl(config.largerObstacleAnimationTiles);
  skin.hittingWallAnimation = skin.assetUrl(config.hittingWallAnimation);
  skin.approachingGoalAnimation = skin.assetUrl(config.approachingGoalAnimation);
  // Sounds
  skin.obstacleSound = [skin.assetUrl('obstacle.mp3'), skin.assetUrl('obstacle.ogg')];
  skin.wallSound = [skin.assetUrl('wall.mp3'), skin.assetUrl('wall.ogg')];
  skin.winGoalSound = [skin.assetUrl('win_goal.mp3'), skin.assetUrl('win_goal.ogg')];
  skin.wall0Sound = [skin.assetUrl('wall0.mp3'), skin.assetUrl('wall0.ogg')];

  skin.dieSound = [skin.assetUrl('sfx_die.mp3'), skin.assetUrl('sfx_die.ogg')];
  skin.hitSound = [skin.assetUrl('sfx_hit.mp3'), skin.assetUrl('sfx_hit.ogg')];
  skin.pointSound = [skin.assetUrl('sfx_point.mp3'), skin.assetUrl('sfx_point.ogg')];
  skin.swooshingSound = [skin.assetUrl('sfx_swooshing.mp3'), skin.assetUrl('sfx_swooshing.ogg')];
  skin.wingSound = [skin.assetUrl('sfx_wing.mp3'), skin.assetUrl('sfx_wing.ogg')];

  skin.jetSound = [skin.assetUrl('jet.mp3'), skin.assetUrl('jet.ogg')];
  skin.crashSound = [skin.assetUrl('crash.mp3'), skin.assetUrl('crash.ogg')];
  skin.jingleSound = [skin.assetUrl('jingle.mp3'), skin.assetUrl('jingle.ogg')];
  skin.laserSound = [skin.assetUrl('laser.mp3'), skin.assetUrl('laser.ogg')];
  skin.splashSound = [skin.assetUrl('splash.mp3'), skin.assetUrl('splash.ogg')];

  // Settings
  skin.graph = config.graph;
  skin.background = skin.assetUrl('background.png');

  return skin;
};

},{"../skins":"/home/ubuntu/staging/apps/build/js/skins.js"}],"/home/ubuntu/staging/apps/build/js/flappy/levels.js":[function(require,module,exports){
/*jshint multistr: true */

// todo - i think our prepoluated code counts as LOCs

'use strict';

var constants = require('./constants');
var flappyMsg = require('./locale');
var tb = require('../block_utils').createToolbox;
var utils = require('../utils');

var category = function category(name, blocks) {
  return '<category id="' + name + '" name="' + name + '">' + blocks + '</category>';
};

var flapBlock = '<block type="flappy_flap"></block>';
var flapHeightBlock = '<block type="flappy_flap_height"></block>';
var endGameBlock = '<block type="flappy_endGame"></block>';
var playSoundBlock = '<block type="flappy_playSound"></block>';
var incrementScoreBlock = '<block type="flappy_incrementPlayerScore"></block>';

var setSpeedBlock = '<block type="flappy_setSpeed"></block>';
var setBackgroundBlock = '<block type="flappy_setBackground"></block>';
var setGapHeightBlock = '<block type="flappy_setGapHeight"></block>';
var setPlayerBlock = '<block type="flappy_setPlayer"></block>';
var setObstacleBlock = '<block type="flappy_setObstacle"></block>';
var setGroundBlock = '<block type="flappy_setGround"></block>';
var setGravityBlock = '<block type="flappy_setGravity"></block>';
var setScoreBlock = '<block type="flappy_setScore"></block>';

var AVATAR_HEIGHT = constants.AVATAR_HEIGHT;
var AVATAR_WIDTH = constants.AVATAR_WIDTH;
var AVATAR_Y_OFFSET = constants.AVATAR_Y_OFFSET;

var eventBlock = function eventBlock(type, child) {
  return '<block type="' + type + '" deletable="false">' + (child ? '<next>' + child + '</next>' : '') + '</block>';
};

// not movable or deletable
var anchoredBlock = function anchoredBlock(type, child) {
  return '<block type="' + type + '" deletable="false" movable="false">' + (child ? '<next>' + child + '</next>' : '') + '</block>';
};

/*
 * Configuration for all levels.
 */

/**
 * Explanation of options:
 * goal.startX/startY
 * - start location of flag image
 * goal.moving
 * - whether the goal stays in one spot or moves at level's speed
 * goal.successCondition
 * - condition(s), which if true at any point, indicate user has successfully
 *   completed the puzzle
 * goal.failureCondition
 * - condition(s), which if true at any point, indicates the puzzle is
     complete (indicating failure if success condition not met)
 */

module.exports = {
  '1': {
    'requiredBlocks': [[{ 'test': 'flap', 'type': 'flappy_flap' }]],
    'obstacles': false,
    'ground': false,
    'score': false,
    'freePlay': false,
    'goal': {
      startX: 100,
      startY: 0,
      successCondition: function successCondition() {
        return Flappy.avatarY <= 40;
      },
      failureCondition: function failureCondition() {
        return Flappy.avatarY > Flappy.MAZE_HEIGHT;
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox': tb(flapBlock + playSoundBlock),
    'startBlocks': eventBlock('flappy_whenClick'),
    'appSpecificFailError': flappyMsg.flappySpecificFail()
  },

  '2': {
    'requiredBlocks': [[{ 'test': 'endGame', 'type': 'flappy_endGame' }]],
    'obstacles': false,
    'ground': true,
    'score': false,
    'freePlay': false,
    'goal': {
      startX: 100,
      startY: 400 - 48 - 56 / 2,
      successCondition: function successCondition() {
        // this only happens after avatar hits ground, and we spin him because of
        // game over
        return Flappy.avatarY === 322 && Flappy.avatarX === 110;
      },
      failureCondition: function failureCondition() {
        var avatarBottom = Flappy.avatarY + AVATAR_HEIGHT;
        var ground = Flappy.MAZE_HEIGHT - Flappy.GROUND_HEIGHT;
        return avatarBottom >= ground && Flappy.gameState === Flappy.GameStates.ACTIVE;
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox': tb(flapBlock + endGameBlock + playSoundBlock),
    'startBlocks': eventBlock('flappy_whenClick', flapBlock) + eventBlock('flappy_whenCollideGround')
  },

  '3': {
    'requiredBlocks': [[{ 'test': 'setSpeed', 'type': 'flappy_setSpeed' }]],
    'obstacles': false,
    'ground': true,
    'score': false,
    'freePlay': false,
    'goal': {
      startX: 400 - 55,
      startY: 0,
      moving: true,
      successCondition: function successCondition() {
        var avatarCenter = {
          x: (Flappy.avatarX + AVATAR_WIDTH) / 2,
          y: (Flappy.avatarY + AVATAR_HEIGHT) / 2
        };
        var goalCenter = {
          x: (Flappy.goalX + Flappy.GOAL_SIZE) / 2,
          y: (Flappy.goalY + Flappy.GOAL_SIZE) / 2
        };

        var diff = {
          x: Math.abs(avatarCenter.x - goalCenter.x),
          y: Math.abs(avatarCenter.y - goalCenter.y)
        };

        return diff.x < 15 && diff.y < 15;
      },
      failureCondition: function failureCondition() {
        return Flappy.activeTicks() >= 120 && Flappy.SPEED === 0;
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox': tb(flapBlock + playSoundBlock + setSpeedBlock),
    'startBlocks': eventBlock('flappy_whenClick', flapBlock) + eventBlock('when_run')
  },

  '4': {
    'requiredBlocks': [[{ 'test': 'endGame', 'type': 'flappy_endGame' }]],
    'obstacles': true,
    'ground': true,
    'score': false,
    'freePlay': false,
    'goal': {
      startX: 600 - 56 / 2,
      startY: 400 - 48 - 56 / 2,
      moving: true,
      successCondition: function successCondition() {
        return Flappy.obstacles[0].hitAvatar && Flappy.gameState === Flappy.GameStates.OVER;
      },
      failureCondition: function failureCondition() {
        // todo - would be nice if we could distinguish feedback for
        // flew through pipe vs. didnt hook up endGame block
        var obstacleEnd = Flappy.obstacles[0].x + Flappy.OBSTACLE_WIDTH;
        return obstacleEnd < Flappy.avatarX;
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox': tb(flapBlock + endGameBlock + playSoundBlock + setSpeedBlock),
    'startBlocks': eventBlock('flappy_whenClick', flapBlock) + eventBlock('when_run', setSpeedBlock) + eventBlock('flappy_whenCollideObstacle')
  },

  '5': {
    'requiredBlocks': [[{ 'test': 'incrementPlayerScore', 'type': 'flappy_incrementPlayerScore' }]],
    'defaultFlap': 'SMALL',
    'obstacles': true,
    'ground': true,
    'score': true,
    'freePlay': false,
    'goal': {
      // todo - kind of ugly that we end up loopin through all obstacles twice,
      // once to check for success and again to check for failure
      successCondition: function successCondition() {
        var insideObstacle = false;
        Flappy.obstacles.forEach(function (obstacle) {
          if (!obstacle.hitAvatar && obstacle.containsAvatar()) {
            insideObstacle = true;
          }
        });
        return insideObstacle && Flappy.playerScore > 0;
      },
      failureCondition: function failureCondition() {
        var insideObstacle = false;
        Flappy.obstacles.forEach(function (obstacle) {
          if (!obstacle.hitAvatar && obstacle.containsAvatar()) {
            insideObstacle = true;
          }
        });
        return insideObstacle && Flappy.playerScore === 0;
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox': tb(flapBlock + endGameBlock + incrementScoreBlock + playSoundBlock + setSpeedBlock),
    'startBlocks': eventBlock('flappy_whenClick', flapBlock) + eventBlock('flappy_whenEnterObstacle') + eventBlock('when_run', setSpeedBlock)
  },

  '6': {
    'requiredBlocks': [[{ 'test': 'flap', 'type': 'flappy_flap_height' }]],
    'obstacles': true,
    'ground': true,
    'score': true,
    'freePlay': false,
    'goal': {
      successCondition: function successCondition() {
        var insideObstacle = false;
        Flappy.obstacles.forEach(function (obstacle) {
          if (obstacle.containsAvatar()) {
            insideObstacle = true;
          }
        });
        return insideObstacle && Flappy.playerScore > 0;
      },
      failureCondition: function failureCondition() {
        var insideObstacle = false;
        Flappy.obstacles.forEach(function (obstacle) {
          if (obstacle.containsAvatar()) {
            insideObstacle = true;
          }
        });
        return insideObstacle && Flappy.playerScore === 0;
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox': tb(flapHeightBlock + endGameBlock + incrementScoreBlock + playSoundBlock + setSpeedBlock),
    'startBlocks': eventBlock('flappy_whenClick') +
    // eventBlock('flappy_whenCollideGround', endGameBlock) +
    // eventBlock('flappy_whenCollideObstacle', endGameBlock) +
    eventBlock('flappy_whenEnterObstacle', incrementScoreBlock) + eventBlock('when_run', setSpeedBlock)
  },

  '7': {
    'requiredBlocks': [[{ 'test': 'setBackground', 'type': 'flappy_setBackground' }]],
    'obstacles': true,
    'ground': true,
    'score': true,
    'freePlay': false,
    'goal': {
      successCondition: function successCondition() {
        return Flappy.gameState === Flappy.GameStates.OVER;
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox': tb(flapHeightBlock + endGameBlock + incrementScoreBlock + playSoundBlock + setSpeedBlock + setBackgroundBlock),
    'startBlocks': eventBlock('flappy_whenClick', flapHeightBlock) + eventBlock('flappy_whenCollideGround', endGameBlock) + eventBlock('flappy_whenCollideObstacle', endGameBlock) + eventBlock('flappy_whenEnterObstacle', incrementScoreBlock) + eventBlock('when_run', setSpeedBlock)
  },

  '8': {
    'requiredBlocks': [[{
      test: function test(block) {
        return (block.type === 'flappy_setBackground' || block.type === 'flappy_setPlayer') && block.getTitleValue('VALUE') === 'random';
      },
      type: 'flappy_setBackground',
      titles: {
        'VALUE': 'random'
      }
    }]],
    'obstacles': true,
    'ground': true,
    'score': true,
    'freePlay': false,
    'goal': {
      successCondition: function successCondition() {
        return Flappy.gameState === Flappy.GameStates.OVER;
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox': tb(flapHeightBlock + endGameBlock + incrementScoreBlock + playSoundBlock + setSpeedBlock + setBackgroundBlock + setPlayerBlock),
    'startBlocks': eventBlock('flappy_whenClick', flapHeightBlock) + eventBlock('flappy_whenCollideGround', endGameBlock) + eventBlock('flappy_whenCollideObstacle', endGameBlock) + eventBlock('flappy_whenEnterObstacle', incrementScoreBlock) + eventBlock('when_run', setSpeedBlock)
  },

  '9': {
    'requiredBlocks': [[{
      test: function test(block) {
        return block.type === 'flappy_setScore';
      },
      type: 'flappy_setScore'
    }]],
    'obstacles': true,
    'ground': true,
    'score': true,
    'freePlay': false,
    'goal': {
      successCondition: function successCondition() {
        return Flappy.gameState === Flappy.GameStates.OVER;
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox': tb(flapHeightBlock + endGameBlock + incrementScoreBlock + playSoundBlock + setSpeedBlock + setBackgroundBlock + setPlayerBlock + setScoreBlock),
    'startBlocks': eventBlock('flappy_whenClick', flapHeightBlock) + eventBlock('flappy_whenCollideGround', endGameBlock) + eventBlock('flappy_whenCollideObstacle') + eventBlock('flappy_whenEnterObstacle', incrementScoreBlock) + eventBlock('when_run', setSpeedBlock)
  },

  '11': {
    shareable: true,
    'requiredBlocks': [],
    'obstacles': true,
    'ground': true,
    'score': true,
    'freePlay': true,
    'scale': {
      'snapRadius': 2
    },
    'toolbox': tb(flapHeightBlock + playSoundBlock + incrementScoreBlock + endGameBlock + setSpeedBlock + setBackgroundBlock + setPlayerBlock + setObstacleBlock + setGroundBlock + setGapHeightBlock + setGravityBlock + setScoreBlock),
    'startBlocks': eventBlock('flappy_whenClick') + eventBlock('flappy_whenCollideGround') + eventBlock('flappy_whenCollideObstacle') + eventBlock('flappy_whenEnterObstacle') + eventBlock('when_run')
  },
  'k1': {
    'requiredBlocks': [],
    'obstacles': true,
    'ground': true,
    'score': true,
    'freePlay': true,
    isK1: true,
    'scale': {
      'snapRadius': 2
    },
    'toolbox': tb(flapBlock + endGameBlock + setBackgroundBlock + setPlayerBlock + setObstacleBlock + setGroundBlock + playSoundBlock + flapHeightBlock + setSpeedBlock + incrementScoreBlock + setGapHeightBlock + setGravityBlock + setScoreBlock),
    'startBlocks': eventBlock('flappy_whenClick') + eventBlock('flappy_whenCollideGround') + eventBlock('flappy_whenCollideObstacle') + eventBlock('flappy_whenEnterObstacle') + eventBlock('when_run')
  }
};

module.exports.k1_1 = {
  'isK1': true,
  grayOutUndeletableBlocks: true,
  'requiredBlocks': [],
  'obstacles': true,
  'ground': true,
  'score': true,
  'freePlay': true,
  'scale': {
    'snapRadius': 2
  },
  'toolbox': '',
  'startBlocks': anchoredBlock('flappy_whenClick', anchoredBlock('flappy_flap')) + anchoredBlock('flappy_whenCollideGround', anchoredBlock('flappy_endGame')) + anchoredBlock('flappy_whenCollideObstacle', anchoredBlock('flappy_endGame')) + anchoredBlock('flappy_whenEnterObstacle', anchoredBlock('flappy_incrementPlayerScore')) + anchoredBlock('when_run', anchoredBlock('flappy_setSpeed'))
};

// flap to goal
module.exports.k1_2 = utils.extend(module.exports['1'], { 'isK1': true });

// hit ground
module.exports.k1_3 = utils.extend(module.exports['2'], { 'isK1': true });

// set speed
module.exports.k1_4 = utils.extend(module.exports['3'], { 'isK1': true });

// crash into obstacle
module.exports.k1_5 = utils.extend(module.exports['4'], { 'isK1': true });

// pass through obstacle, score a point
module.exports.k1_6 = utils.extend(module.exports['5'], { 'isK1': true });

// score multiple points for each pass
module.exports.k1_7 = {
  'isK1': true,
  'requiredBlocks': [[{ 'test': 'incrementPlayerScore', 'type': 'flappy_incrementPlayerScore' }]],
  'defaultFlap': 'SMALL',
  'obstacles': true,
  'ground': true,
  'score': true,
  'freePlay': false,
  'goal': {
    // todo - kind of ugly that we end up loopin through all obstacles twice,
    // once to check for success and again to check for failure
    successCondition: function successCondition() {
      var insideObstacle = false;
      Flappy.obstacles.forEach(function (obstacle) {
        if (!obstacle.hitAvatar && obstacle.containsAvatar()) {
          insideObstacle = true;
        }
      });
      return insideObstacle && Flappy.playerScore > 1;
    },
    failureCondition: function failureCondition() {
      var insideObstacle = false;
      Flappy.obstacles.forEach(function (obstacle) {
        if (!obstacle.hitAvatar && obstacle.containsAvatar()) {
          insideObstacle = true;
        }
      });
      return insideObstacle && Flappy.playerScore <= 1;
    }
  },
  'scale': {
    'snapRadius': 2
  },
  'toolbox': tb(flapBlock + endGameBlock + incrementScoreBlock + playSoundBlock + setSpeedBlock),
  'startBlocks': eventBlock('flappy_whenClick', flapBlock) + eventBlock('flappy_whenEnterObstacle') + eventBlock('when_run', setSpeedBlock)
};

// change the scene
module.exports.k1_8 = utils.extend(module.exports['7'], {
  'isK1': true,
  // override regular flappy so that we dont use variable flap block
  'toolbox': tb(flapBlock + endGameBlock + incrementScoreBlock + playSoundBlock + setSpeedBlock + setBackgroundBlock),
  'startBlocks': eventBlock('flappy_whenClick', flapBlock) + eventBlock('flappy_whenCollideGround', endGameBlock) + eventBlock('flappy_whenCollideObstacle', endGameBlock) + eventBlock('flappy_whenEnterObstacle', incrementScoreBlock) + eventBlock('when_run', setSpeedBlock)
});

// changing the player
module.exports.k1_9 = {
  'isK1': true,
  'requiredBlocks': [[{ 'test': 'setPlayer', 'type': 'flappy_setPlayer' }]],
  'obstacles': true,
  'ground': true,
  'score': true,
  'freePlay': false,
  'goal': {
    successCondition: function successCondition() {
      return Flappy.gameState === Flappy.GameStates.OVER;
    }
  },
  'scale': {
    'snapRadius': 2
  },
  'toolbox': tb(flapBlock + endGameBlock + incrementScoreBlock + playSoundBlock + setSpeedBlock + setBackgroundBlock + setPlayerBlock),
  'startBlocks': eventBlock('flappy_whenClick', flapBlock) + eventBlock('flappy_whenCollideGround', endGameBlock) + eventBlock('flappy_whenCollideObstacle', endGameBlock) + eventBlock('flappy_whenEnterObstacle', incrementScoreBlock) + eventBlock('when_run', setSpeedBlock)
};

},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./constants":"/home/ubuntu/staging/apps/build/js/flappy/constants.js","./locale":"/home/ubuntu/staging/apps/build/js/flappy/locale.js"}],"/home/ubuntu/staging/apps/build/js/flappy/flappy.js":[function(require,module,exports){
/**
 * Blockly App: Flappy
 *
 * Copyright 2013 Code.org
 *
 */

'use strict';

var studioApp = require('../StudioApp').singleton;
var commonMsg = require('../locale');
var flappyMsg = require('./locale');
var skins = require('../skins');
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html.ejs');
var dom = require('../dom');
var constants = require('./constants');
var utils = require('../utils');
var dropletUtils = require('../dropletUtils');

var ResultType = studioApp.ResultType;
var TestResults = studioApp.TestResults;

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
studioApp.setCheckForEmptyBlocks(true);

var randomObstacleHeight = function randomObstacleHeight() {
  var min = Flappy.MIN_OBSTACLE_HEIGHT;
  var max = Flappy.MAZE_HEIGHT - Flappy.GROUND_HEIGHT - Flappy.MIN_OBSTACLE_HEIGHT - Flappy.GAP_SIZE;
  return Math.floor(Math.random() * (max - min) + min);
};

//The number of blocks to show as feedback.

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

var loadLevel = function loadLevel() {
  // Load maps.
  infoText = utils.valueOr(level.infoText, true);
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

  var resetObstacle = function resetObstacle(x) {
    this.x = x;
    this.gapStart = randomObstacleHeight();
    this.hitAvatar = false;
  };

  var containsAvatar = function containsAvatar() {
    var flappyRight = Flappy.avatarX + AVATAR_WIDTH;
    var flappyBottom = Flappy.avatarY + AVATAR_HEIGHT;
    var obstacleRight = this.x + Flappy.OBSTACLE_WIDTH;
    var obstacleBottom = this.gapStart + Flappy.GAP_SIZE;
    return flappyRight > this.x && flappyRight < obstacleRight && Flappy.avatarY > this.gapStart && flappyBottom < obstacleBottom;
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

var drawMap = function drawMap() {
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
    tile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.background);
    tile.setAttribute('id', 'background');
    tile.setAttribute('height', Flappy.MAZE_HEIGHT);
    tile.setAttribute('width', Flappy.MAZE_WIDTH);
    tile.setAttribute('x', 0);
    tile.setAttribute('y', 0);
    svg.appendChild(tile);
  }

  // Add obstacles
  Flappy.obstacles.forEach(function (obstacle, index) {
    var obstacleTopIcon = document.createElementNS(Blockly.SVG_NS, 'image');
    obstacleTopIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.obstacle_top);
    obstacleTopIcon.setAttribute('id', 'obstacle_top' + index);
    obstacleTopIcon.setAttribute('height', Flappy.OBSTACLE_HEIGHT);
    obstacleTopIcon.setAttribute('width', Flappy.OBSTACLE_WIDTH);
    svg.appendChild(obstacleTopIcon);

    var obstacleBottomIcon = document.createElementNS(Blockly.SVG_NS, 'image');
    obstacleBottomIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.obstacle_bottom);
    obstacleBottomIcon.setAttribute('id', 'obstacle_bottom' + index);
    obstacleBottomIcon.setAttribute('height', Flappy.OBSTACLE_HEIGHT);
    obstacleBottomIcon.setAttribute('width', Flappy.OBSTACLE_WIDTH);
    svg.appendChild(obstacleBottomIcon);
  });

  if (level.ground) {
    for (i = 0; i < Flappy.MAZE_WIDTH / Flappy.GROUND_WIDTH + 1; i++) {
      var groundIcon = document.createElementNS(Blockly.SVG_NS, 'image');
      groundIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.ground);
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
    goal.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.goal);
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
  avatarIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.avatar);
  avatarIcon.setAttribute('height', AVATAR_HEIGHT);
  avatarIcon.setAttribute('width', AVATAR_WIDTH);
  if (level.ground) {
    avatarIcon.setAttribute('clip-path', 'url(#avatArclipPath)');
  }
  svg.appendChild(avatarIcon);

  var instructions = document.createElementNS(Blockly.SVG_NS, 'image');
  instructions.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.instructions);
  instructions.setAttribute('id', 'instructions');
  instructions.setAttribute('height', 50);
  instructions.setAttribute('width', 159);
  instructions.setAttribute('x', 110);
  instructions.setAttribute('y', 170);
  instructions.setAttribute('visibility', 'hidden');
  svg.appendChild(instructions);

  var getready = document.createElementNS(Blockly.SVG_NS, 'image');
  getready.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.getready);
  getready.setAttribute('id', 'getready');
  getready.setAttribute('height', 50);
  getready.setAttribute('width', 183);
  getready.setAttribute('x', 108);
  getready.setAttribute('y', 80);
  getready.setAttribute('visibility', 'hidden');
  svg.appendChild(getready);

  var clickrun = document.createElementNS(Blockly.SVG_NS, 'image');
  clickrun.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.clickrun);
  clickrun.setAttribute('id', 'clickrun');
  clickrun.setAttribute('height', 41);
  clickrun.setAttribute('width', 273);
  clickrun.setAttribute('x', 64);
  clickrun.setAttribute('y', 200);
  clickrun.setAttribute('visibility', 'visibile');
  svg.appendChild(clickrun);

  var gameover = document.createElementNS(Blockly.SVG_NS, 'image');
  gameover.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skin.gameover);
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

Flappy.calcDistance = function (xDist, yDist) {
  return Math.sqrt(xDist * xDist + yDist * yDist);
};

var essentiallyEqual = function essentiallyEqual(float1, float2, opt_variance) {
  var variance = opt_variance || 0.01;
  return Math.abs(float1 - float2) < variance;
};

/**
 * Check to see if avatar is in collision with given obstacle
 * @param obstacle Object : The obstacle object we're checking
 */
var checkForObstacleCollision = function checkForObstacleCollision(obstacle) {
  var insideObstacleColumn = Flappy.avatarX + AVATAR_WIDTH >= obstacle.x && Flappy.avatarX <= obstacle.x + Flappy.OBSTACLE_WIDTH;
  if (insideObstacleColumn && (Flappy.avatarY <= obstacle.gapStart || Flappy.avatarY + AVATAR_HEIGHT >= obstacle.gapStart + Flappy.GAP_SIZE)) {
    return true;
  }
  return false;
};

Flappy.activeTicks = function () {
  if (Flappy.firstActiveTick < 0) {
    return 0;
  }

  return Flappy.tickCount - Flappy.firstActiveTick;
};

/**
 * We want to swallow exceptions when executing user generated code. This provides
 * a single place to do so.
 */
Flappy.callUserGeneratedCode = function (fn) {
  try {
    fn.call(Flappy, studioApp, api);
  } catch (e) {
    // swallow error. should we also log this somewhere?
    if (console) {
      console.log(e);
    }
  }
};

Flappy.onTick = function () {
  var avatarWasAboveGround, avatarIsAboveGround;

  if (Flappy.firstActiveTick < 0 && Flappy.gameState === Flappy.GameStates.ACTIVE) {
    Flappy.firstActiveTick = Flappy.tickCount;
  }

  Flappy.tickCount++;

  if (Flappy.tickCount === 1) {
    Flappy.callUserGeneratedCode(Flappy.whenRunButton);
  }

  // Check for click
  if (Flappy.clickPending && Flappy.gameState <= Flappy.GameStates.ACTIVE) {
    Flappy.callUserGeneratedCode(Flappy.whenClick);
    Flappy.clickPending = false;
  }

  avatarWasAboveGround = Flappy.avatarY + AVATAR_HEIGHT < Flappy.MAZE_HEIGHT - Flappy.GROUND_HEIGHT;

  // Action doesn't start until user's first click
  if (Flappy.gameState === Flappy.GameStates.ACTIVE) {
    // Update avatar's vertical position
    Flappy.avatarVelocity += Flappy.gravity;
    Flappy.avatarY = Flappy.avatarY + Flappy.avatarVelocity;

    // never let the avatar go too far off the top or bottom
    var bottomLimit = level.ground ? Flappy.MAZE_HEIGHT - Flappy.GROUND_HEIGHT - AVATAR_HEIGHT + 1 : Flappy.MAZE_HEIGHT * 1.5;

    Flappy.avatarY = Math.min(Flappy.avatarY, bottomLimit);
    Flappy.avatarY = Math.max(Flappy.avatarY, Flappy.MAZE_HEIGHT * -0.5);

    // Update obstacles
    Flappy.obstacles.forEach(function (obstacle, index) {
      var wasRightOfAvatar = obstacle.x > Flappy.avatarX + AVATAR_WIDTH;

      obstacle.x -= Flappy.SPEED;

      var isRightOfAvatar = obstacle.x > Flappy.avatarX + AVATAR_WIDTH;
      if (wasRightOfAvatar && !isRightOfAvatar) {
        if (Flappy.avatarY > obstacle.gapStart && Flappy.avatarY + AVATAR_HEIGHT < obstacle.gapStart + Flappy.GAP_SIZE) {
          Flappy.callUserGeneratedCode(Flappy.whenEnterObstacle);
        }
      }

      if (!obstacle.hitAvatar && checkForObstacleCollision(obstacle)) {
        obstacle.hitAvatar = true;
        try {
          Flappy.whenCollideObstacle(studioApp, api);
        } catch (e) {}
      }

      // If obstacle moves off left side, repurpose as a new obstacle to our right
      var numObstacles = Flappy.obstacles.length;
      var previousObstacleIndex = (index - 1 + numObstacles) % numObstacles;
      if (obstacle.x + Flappy.OBSTACLE_WIDTH < 0) {
        obstacle.reset(Flappy.obstacles[previousObstacleIndex].x + Flappy.OBSTACLE_SPACING);
      }
    });

    // check for ground collision
    avatarIsAboveGround = Flappy.avatarY + AVATAR_HEIGHT < Flappy.MAZE_HEIGHT - Flappy.GROUND_HEIGHT;
    if (avatarWasAboveGround && !avatarIsAboveGround) {
      Flappy.callUserGeneratedCode(Flappy.whenCollideGround);
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

    document.getElementById('avatar').setAttribute('transform', 'translate(' + AVATAR_WIDTH + ', 0) ' + 'rotate(90, ' + Flappy.avatarX + ', ' + Flappy.avatarY + ')');
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
    } else if (Flappy.gameState === Flappy.GameStates.OVER && Flappy.gameOverTick + 10 < Flappy.tickCount) {
      // do a reset
      var resetButton = document.getElementById('resetButton');
      if (resetButton) {
        resetButton.click();
      }
    }
    document.getElementById('instructions').setAttribute('visibility', 'hidden');
    document.getElementById('getready').setAttribute('visibility', 'hidden');
  } else if (Flappy.gameState === Flappy.GameStates.WAITING) {
    Flappy.runButtonClick();
  }
};
/**
 * Initialize Blockly and the Flappy app.  Called on page load.
 */
Flappy.init = function (config) {
  // replace studioApp methods with our own
  studioApp.reset = this.reset.bind(this);
  studioApp.runButtonClick = this.runButtonClick.bind(this);

  Flappy.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;

  config.grayOutUndeletableBlocks = level.grayOutUndeletableBlocks;

  loadLevel();

  config.html = page({
    assetUrl: studioApp.assetUrl,
    data: {
      localeDirection: studioApp.localeDirection(),
      visualization: require('./visualization.html.ejs')(),
      controls: require('./controls.html.ejs')({ assetUrl: studioApp.assetUrl, shareable: level.shareable }),
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
    studioApp.loadAudio(skin.failureSound, 'failure');
    studioApp.loadAudio(skin.obstacleSound, 'obstacle');

    studioApp.loadAudio(skin.dieSound, 'sfx_die');
    studioApp.loadAudio(skin.hitSound, 'sfx_hit');
    studioApp.loadAudio(skin.pointSound, 'sfx_point');
    studioApp.loadAudio(skin.swooshingSound, 'sfx_swooshing');
    studioApp.loadAudio(skin.wingSound, 'sfx_wing');
    studioApp.loadAudio(skin.winGoalSound, 'winGoal');
    studioApp.loadAudio(skin.jetSound, 'jet');
    studioApp.loadAudio(skin.jingleSound, 'jingle');
    studioApp.loadAudio(skin.crashSound, 'crash');
    studioApp.loadAudio(skin.laserSound, 'laser');
    studioApp.loadAudio(skin.splashSound, 'splash');
    studioApp.loadAudio(skin.wallSound, 'wall');
    studioApp.loadAudio(skin.wall0Sound, 'wall0');
  };

  config.afterInject = function () {
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
  config.makeImage = studioApp.assetUrl('media/flappy_promo.png');

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
    'flappy_whenClick': { x: col1, y: row1 },
    'when_run': { x: col1, y: row1 },
    'flappy_whenCollideGround': { x: col2, y: row1 },
    'flappy_whenCollideObstacle': { x: col2, y: row2 },
    'flappy_whenEnterObstacle': { x: col2, y: row3 }
  };

  // if we dont have collide events, have enter obstacle in top row
  if (level.startBlocks.indexOf('whenCollide') === -1) {
    config.blockArrangement.flappy_whenEnterObstacle = { x: col2, y: row1 };
  }

  // when we have when_run and when_click, put when_run in top row
  if (level.startBlocks.indexOf('when_run') !== -1) {
    config.blockArrangement.flappy_whenClick.y = row2;
  }

  studioApp.init(config);

  var rightButton = document.getElementById('rightButton');
  dom.addClickTouchEvent(rightButton, Flappy.onPuzzleComplete);
};

/**
 * Clear the event handlers and stop the onTick timer.
 */
Flappy.clearEventHandlersKillTickLoop = function () {
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
Flappy.reset = function (first) {
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
Flappy.runButtonClick = function () {
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  document.getElementById('clickrun').setAttribute('visibility', 'hidden');
  document.getElementById('instructions').setAttribute('visibility', 'visible');
  document.getElementById('getready').setAttribute('visibility', 'visible');

  studioApp.toggleRunReset('reset');
  Blockly.mainBlockSpace.traceOn(true);
  // studioApp.reset(false);
  studioApp.attempts++;
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
 * studioApp.displayFeedback when appropriate
 */
var displayFeedback = function displayFeedback() {
  if (!Flappy.waitingForReport) {
    studioApp.displayFeedback({
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
Flappy.onReportComplete = function (response) {
  Flappy.response = response;
  Flappy.waitingForReport = false;
  studioApp.onReportComplete(response);
  displayFeedback();
};

/**
 * Execute the user's code.  Heaven help us...
 */
Flappy.execute = function () {
  var code;
  Flappy.result = ResultType.UNSET;
  Flappy.testResults = TestResults.NO_TESTS_RUN;
  Flappy.waitingForReport = false;
  Flappy.response = null;

  if (level.editCode) {
    code = dropletUtils.generateCodeAliases(null, 'Flappy');
    code += studioApp.editor.getValue();
  }

  var codeClick = Blockly.Generator.blockSpaceToCode('JavaScript', 'flappy_whenClick');
  var whenClickFunc = codegen.functionFromCode(codeClick, {
    StudioApp: studioApp,
    Flappy: api });

  var codeCollideGround = Blockly.Generator.blockSpaceToCode('JavaScript', 'flappy_whenCollideGround');
  var whenCollideGroundFunc = codegen.functionFromCode(codeCollideGround, {
    StudioApp: studioApp,
    Flappy: api });

  var codeEnterObstacle = Blockly.Generator.blockSpaceToCode('JavaScript', 'flappy_whenEnterObstacle');
  var whenEnterObstacleFunc = codegen.functionFromCode(codeEnterObstacle, {
    StudioApp: studioApp,
    Flappy: api });

  var codeCollideObstacle = Blockly.Generator.blockSpaceToCode('JavaScript', 'flappy_whenCollideObstacle');
  var whenCollideObstacleFunc = codegen.functionFromCode(codeCollideObstacle, {
    StudioApp: studioApp,
    Flappy: api });

  var codeWhenRunButton = Blockly.Generator.blockSpaceToCode('JavaScript', 'when_run');
  var whenRunButtonFunc = codegen.functionFromCode(codeWhenRunButton, {
    StudioApp: studioApp,
    Flappy: api });

  studioApp.playAudio('start');

  // studioApp.reset(false);

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

Flappy.onPuzzleComplete = function () {
  if (level.freePlay) {
    Flappy.result = ResultType.SUCCESS;
  }

  // Stop everything on screen
  Flappy.clearEventHandlersKillTickLoop();

  // If we know they succeeded, mark levelComplete true
  // Note that we have not yet animated the succesful run
  var levelComplete = Flappy.result == ResultType.SUCCESS;

  // If the current level is a free play, always return the free play
  // result type
  if (level.freePlay) {
    Flappy.testResults = TestResults.FREE_PLAY;
  } else {
    Flappy.testResults = studioApp.getTestResults(levelComplete);
  }

  // Special case for Flappy level 1 where you have the right blocks, but you
  // don't flap to the goal.  Note: See pivotal item 66362504 for why we
  // check for both TOO_FEW_BLOCKS_FAIL and LEVEL_INCOMPLETE_FAIL here.
  if (level.id === "1" && (Flappy.testResults === TestResults.TOO_FEW_BLOCKS_FAIL || Flappy.testResults === TestResults.LEVEL_INCOMPLETE_FAIL)) {
    // Feedback message is found in level.other1StarError.
    Flappy.testResults = TestResults.APP_SPECIFIC_FAIL;
  }

  if (Flappy.testResults >= TestResults.FREE_PLAY) {
    studioApp.playAudio('win');
  } else {
    studioApp.playAudio('failure');
  }

  if (level.editCode) {
    Flappy.testResults = levelComplete ? TestResults.ALL_PASS : TestResults.TOO_FEW_BLOCKS_FAIL;
  }

  var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  var textBlocks = Blockly.Xml.domToText(xml);

  Flappy.waitingForReport = true;

  // Report result to server.
  studioApp.report({
    app: 'flappy',
    level: level.id,
    result: Flappy.result === ResultType.SUCCESS,
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
Flappy.displayAvatar = function (x, y) {
  var avatarIcon = document.getElementById('avatar');
  avatarIcon.setAttribute('x', x);
  avatarIcon.setAttribute('y', y);
};

/**
 * display moving goal
 */
Flappy.displayGoal = function () {
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
Flappy.displayGround = function (tickCount) {
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

Flappy.displayScore = function () {
  var score = document.getElementById('score');
  score.textContent = Flappy.playerScore;
};

Flappy.flap = function (amount) {
  var defaultFlap = level.defaultFlap || "NORMAL";
  Flappy.avatarVelocity = amount || api.FlapHeight[defaultFlap];
};

Flappy.setGapHeight = function (value) {
  var minGapSize = Flappy.MAZE_HEIGHT - Flappy.MIN_OBSTACLE_HEIGHT - Flappy.OBSTACLE_HEIGHT;
  if (value < minGapSize) {
    value = minGapSize;
  }
  Flappy.GAP_SIZE = value;
};

var skinTheme = function skinTheme(value) {
  if (value === 'flappy') {
    return skin;
  }
  return skin[value];
};

Flappy.setBackground = function (value) {
  var element = document.getElementById('background');
  element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skinTheme(value).background);
};

Flappy.setPlayer = function (value) {
  var element = document.getElementById('avatar');
  element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skinTheme(value).avatar);
};

Flappy.setObstacle = function (value) {
  var element;
  Flappy.obstacles.forEach(function (obstacle, index) {
    element = document.getElementById('obstacle_top' + index);
    element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skinTheme(value).obstacle_top);

    element = document.getElementById('obstacle_bottom' + index);
    element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skinTheme(value).obstacle_bottom);
  });
};

Flappy.setGround = function (value) {
  if (!level.ground) {
    return;
  }
  var element, i;
  for (i = 0; i < Flappy.MAZE_WIDTH / Flappy.GROUND_WIDTH + 1; i++) {
    element = document.getElementById('ground' + i);
    element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', skinTheme(value).ground);
  }
};

var checkTickLimit = function checkTickLimit() {
  if (!level.tickLimit) {
    return false;
  }

  if (Flappy.tickCount - Flappy.firstActiveTick >= level.tickLimit && (Flappy.gameState === Flappy.GameStates.ACTIVE || Flappy.gameState === Flappy.GameStates.OVER)) {
    // We'll ignore tick limit if we're ending so that we fully finish ending
    // sequence
    return true;
  }

  return false;
};

var checkFinished = function checkFinished() {
  // if we have a succcess condition and have accomplished it, we're done and successful
  if (level.goal && level.goal.successCondition && level.goal.successCondition()) {
    Flappy.result = ResultType.SUCCESS;
    return true;
  }

  // if we have a failure condition, and it's been reached, we're done and failed
  if (level.goal && level.goal.failureCondition && level.goal.failureCondition()) {
    Flappy.result = ResultType.FAILURE;
    return true;
  }

  return false;
};

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./api":"/home/ubuntu/staging/apps/build/js/flappy/api.js","./constants":"/home/ubuntu/staging/apps/build/js/flappy/constants.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/flappy/controls.html.ejs","./locale":"/home/ubuntu/staging/apps/build/js/flappy/locale.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/flappy/visualization.html.ejs"}],"/home/ubuntu/staging/apps/build/js/flappy/visualization.html.ejs":[function(require,module,exports){
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
 buf.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgFlappy">\n</svg>\n<div id="capacityBubble">\n  <div id="capacity"></div>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/flappy/controls.html.ejs":[function(require,module,exports){
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
 buf.push('');1; var msg = require('../locale') ; buf.push('\n\n<div id="right-button-cell">\n  <button id="rightButton" class="share">\n    <img src="', escape((5,  assetUrl('media/1x1.gif') )), '">', escape((5,  msg.finish() )), '\n  </button>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../locale":"/home/ubuntu/staging/apps/build/js/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/flappy/constants.js":[function(require,module,exports){
"use strict";

module.exports = {
  WORKSPACE_BUFFER: 20,
  WORKSPACE_COL_WIDTH: 210,
  WORKSPACE_ROW_HEIGHT: 120,

  AVATAR_HEIGHT: 24,
  AVATAR_WIDTH: 34,
  AVATAR_Y_OFFSET: 0
};

},{}],"/home/ubuntu/staging/apps/build/js/flappy/blocks.js":[function(require,module,exports){
/**
 * Blockly App: Flappy
 *
 * Copyright 2013 Code.org
 *
 */
'use strict';

var msg = require('./locale');
var commonMsg = require('../locale');
var blockUtils = require('../block_utils');
var utils = require('../utils');
var _ = utils.getLodash();
var studioApp = require('../StudioApp').singleton;

var FLAPPY_VALUE = '"flappy"';
var RANDOM_VALUE = 'random';

var generateSetterCode = function generateSetterCode(ctx, name) {
  var value = ctx.getTitleValue('VALUE');
  if (value === RANDOM_VALUE) {
    var possibleValues = _(ctx.VALUES).map(function (item) {
      return item[1];
    }).reject(function (itemValue) {
      return itemValue === RANDOM_VALUE;
    });
    value = 'Flappy.random([' + possibleValues + '])';
  }

  return 'Flappy.' + name + '(\'block_id_' + ctx.id + '\', ' + value + ');\n';
};

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function (blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;

  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  blockly.Blocks.flappy_whenClick = {
    // Block to handle event where mouse is clicked
    helpUrl: '',
    init: function init() {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput().appendTitle(commonMsg.when()).appendTitle(new blockly.FieldImage(skin.clickIcon));
      } else {
        this.appendDummyInput().appendTitle(msg.whenClick());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenClickTooltip());
    }
  };

  generator.flappy_whenClick = function () {
    // Generate JavaScript for handling click event.
    return '\n';
  };

  blockly.Blocks.flappy_whenCollideGround = {
    // Block to handle event where flappy hits ground
    helpUrl: '',
    init: function init() {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput().appendTitle(commonMsg.when()).appendTitle(new blockly.FieldImage(skin.collideGroundIcon));
      } else {
        this.appendDummyInput().appendTitle(msg.whenCollideGround());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenCollideGroundTooltip());
    }
  };

  generator.flappy_whenCollideGround = function () {
    // Generate JavaScript for handling click event.
    return '\n';
  };

  blockly.Blocks.flappy_whenCollideObstacle = {
    // Block to handle event where flappy hits a Obstacle
    helpUrl: '',
    init: function init() {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput().appendTitle(commonMsg.when()).appendTitle(new blockly.FieldImage(skin.collideObstacleIcon));
      } else {
        this.appendDummyInput().appendTitle(msg.whenCollideObstacle());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenCollideObstacleTooltip());
    }
  };

  generator.flappy_whenCollideObstacle = function () {
    // Generate JavaScript for handling collide Obstacle event.
    return '\n';
  };

  blockly.Blocks.flappy_whenEnterObstacle = {
    // Block to handle event where flappy enters a Obstacle
    helpUrl: '',
    init: function init() {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput().appendTitle(commonMsg.when()).appendTitle(new blockly.FieldImage(skin.enterObstacleIcon));
      } else {
        this.appendDummyInput().appendTitle(msg.whenEnterObstacle());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenEnterObstacleTooltip());
    }
  };

  generator.flappy_whenEnterObstacle = function () {
    // Generate JavaScript for handling enter Obstacle.
    return '\n';
  };

  blockly.Blocks.flappy_flap = {
    // Block for flapping (flying upwards)
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput().appendTitle(msg.flap()).appendTitle(new blockly.FieldImage(skin.flapIcon));
      } else {
        this.appendDummyInput().appendTitle(msg.flap());
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.flapTooltip());
    }
  };

  // // used to have a flappy_whenRunButtonClick.
  // blockly.Blocks.flappy_whenRunButtonClick = blockly.Blocks.when_run;
  // generator.flappy_whenRunButtonClick = generator.when_run;

  generator.flappy_flap = function (velocity) {
    // Generate JavaScript for moving left.
    return 'Flappy.flap(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.flappy_flap_height = {
    // Block for flapping (flying upwards)
    helpUrl: '',
    init: function init() {
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[3][1]); // default to normal

      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.flapTooltip());
    }
  };

  blockly.Blocks.flappy_flap_height.VALUES = [[msg.flapRandom(), RANDOM_VALUE], [msg.flapVerySmall(), 'Flappy.FlapHeight.VERY_SMALL'], [msg.flapSmall(), 'Flappy.FlapHeight.SMALL'], [msg.flapNormal(), 'Flappy.FlapHeight.NORMAL'], [msg.flapLarge(), 'Flappy.FlapHeight.LARGE'], [msg.flapVeryLarge(), 'Flappy.FlapHeight.VERY_LARGE']];

  generator.flappy_flap_height = function (velocity) {
    return generateSetterCode(this, 'flap');
  };

  function onSoundSelected(soundValue) {
    if (soundValue === RANDOM_VALUE) {
      return;
    }
    studioApp.playAudio(utils.stripQuotes(soundValue));
  }

  blockly.Blocks.flappy_playSound = Object.defineProperties({
    // Block for playing sound.
    WING_FLAP_SOUND: '"sfx_wing"',
    helpUrl: '',
    init: function init() {
      this.VALUES = isK1 ? this.k1SoundChoices : this.soundChoices;
      var soundDropdown = new blockly.FieldDropdown(this.VALUES, onSoundSelected);
      soundDropdown.setValue(this.WING_FLAP_SOUND);

      if (isK1) {
        this.appendDummyInput().appendTitle(commonMsg.play()).appendTitle(new blockly.FieldImage(skin.soundIcon)).appendTitle(soundDropdown, 'VALUE');
      } else {
        this.appendDummyInput().appendTitle(soundDropdown, 'VALUE');
      }

      this.setHSV(184, 1.00, 0.74);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.playSoundTooltip());
    }
  }, {
    k1SoundChoices: {
      get: function get() {
        return [[msg.soundRandom(), RANDOM_VALUE], [msg.soundBounce(), '"wall"'], [msg.soundCrunch(), '"wall0"'], [msg.soundDie(), '"sfx_die"'], [msg.soundHit(), '"sfx_hit"'], [msg.soundPoint(), '"sfx_point"'], [msg.soundSwoosh(), '"sfx_swooshing"'], [msg.soundWing(), this.WING_FLAP_SOUND], [msg.soundJet(), '"jet"'], [msg.soundCrash(), '"crash"'], [msg.soundJingle(), '"jingle"'], [msg.soundSplash(), '"splash"'], [msg.soundLaser(), '"laser"']];
      },
      configurable: true,
      enumerable: true
    },
    soundChoices: {
      get: function get() {
        return [[msg.playSoundRandom(), RANDOM_VALUE], [msg.playSoundBounce(), '"wall"'], [msg.playSoundCrunch(), '"wall0"'], [msg.playSoundDie(), '"sfx_die"'], [msg.playSoundHit(), '"sfx_hit"'], [msg.playSoundPoint(), '"sfx_point"'], [msg.playSoundSwoosh(), '"sfx_swooshing"'], [msg.playSoundWing(), this.WING_FLAP_SOUND], [msg.playSoundJet(), '"jet"'], [msg.playSoundCrash(), '"crash"'], [msg.playSoundJingle(), '"jingle"'], [msg.playSoundSplash(), '"splash"'], [msg.playSoundLaser(), '"laser"']];
      },
      configurable: true,
      enumerable: true
    }
  });

  generator.flappy_playSound = function () {
    return generateSetterCode(this, 'playSound');
  };

  blockly.Blocks.flappy_incrementPlayerScore = {
    // Block for incrementing the player's score.
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput().appendTitle(commonMsg.score()).appendTitle(new blockly.FieldImage(skin.scoreCard));
      } else {
        this.appendDummyInput().appendTitle(msg.incrementPlayerScore());
      }

      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.incrementPlayerScoreTooltip());
    }
  };

  generator.flappy_incrementPlayerScore = function () {
    // Generate JavaScript for incrementing the player's score.
    return 'Flappy.incrementPlayerScore(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.flappy_endGame = {
    helpUrl: '',
    init: function init() {
      this.setHSV(184, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput().appendTitle(commonMsg.end()).appendTitle(new blockly.FieldImage(skin.endIcon));
      } else {
        this.appendDummyInput().appendTitle(msg.endGame());
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.endGameTooltip());
    }
  };

  generator.flappy_endGame = function () {
    // Generate JavaScript for incrementing the player's score.
    return 'Flappy.endGame(\'block_id_' + this.id + '\');\n';
  };

  /**
   * setSpeed
   */
  blockly.Blocks.flappy_setSpeed = {
    helpUrl: '',
    init: function init() {
      this.setHSV(312, 0.32, 0.62);
      if (isK1) {
        var fieldImageDropdown = new blockly.FieldImageDropdown(this.K1_VALUES, 63, 33);
        fieldImageDropdown.setValue(this.K1_VALUES[1][1]); // default to normal
        this.appendDummyInput().appendTitle(msg.setSpeed()).appendTitle(fieldImageDropdown, 'VALUE');
      } else {
        var dropdown = new blockly.FieldDropdown(this.VALUES);
        dropdown.setValue(this.VALUES[3][1]); // default to normal
        this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setSpeedTooltip());
    }
  };

  blockly.Blocks.flappy_setSpeed.K1_VALUES = [[skin.speedSlow, 'Flappy.LevelSpeed.SLOW'], [skin.speedMedium, 'Flappy.LevelSpeed.NORMAL'], [skin.speedFast, 'Flappy.LevelSpeed.FAST']];

  blockly.Blocks.flappy_setSpeed.VALUES = [[msg.speedRandom(), RANDOM_VALUE], [msg.speedVerySlow(), 'Flappy.LevelSpeed.VERY_SLOW'], [msg.speedSlow(), 'Flappy.LevelSpeed.SLOW'], [msg.speedNormal(), 'Flappy.LevelSpeed.NORMAL'], [msg.speedFast(), 'Flappy.LevelSpeed.FAST'], [msg.speedVeryFast(), 'Flappy.LevelSpeed.VERY_FAST']];

  generator.flappy_setSpeed = function () {
    return generateSetterCode(this, 'setSpeed');
  };

  /**
   * setGapHeight
   */
  blockly.Blocks.flappy_setGapHeight = {
    helpUrl: '',
    init: function init() {
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[3][1]); // default to normal

      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setGapHeightTooltip());
    }
  };

  blockly.Blocks.flappy_setGapHeight.VALUES = [[msg.setGapRandom(), RANDOM_VALUE], [msg.setGapVerySmall(), 'Flappy.GapHeight.VERY_SMALL'], [msg.setGapSmall(), 'Flappy.GapHeight.SMALL'], [msg.setGapNormal(), 'Flappy.GapHeight.NORMAL'], [msg.setGapLarge(), 'Flappy.GapHeight.LARGE'], [msg.setGapVeryLarge(), 'Flappy.GapHeight.VERY_LARGE']];

  generator.flappy_setGapHeight = function () {
    return generateSetterCode(this, 'setGapHeight');
  };

  /**
   * setBackground
   */
  blockly.Blocks.flappy_setBackground = {
    helpUrl: '',
    init: function init() {
      this.setHSV(312, 0.32, 0.62);
      var dropdown;
      var input = this.appendDummyInput();
      if (isK1) {
        input.appendTitle(msg.setBackground());
        dropdown = new blockly.FieldImageDropdown(this.K1_CHOICES, 50, 30);
        dropdown.setValue(FLAPPY_VALUE);
      } else {
        dropdown = new blockly.FieldDropdown(this.VALUES);
        dropdown.setValue(FLAPPY_VALUE);
      }

      input.appendTitle(dropdown, 'VALUE');

      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setBackgroundTooltip());
    }
  };

  blockly.Blocks.flappy_setBackground.VALUES = [[msg.setBackgroundRandom(), RANDOM_VALUE], [msg.setBackgroundFlappy(), FLAPPY_VALUE], [msg.setBackgroundNight(), '"night"'], [msg.setBackgroundSciFi(), '"scifi"'], [msg.setBackgroundUnderwater(), '"underwater"'], [msg.setBackgroundCave(), '"cave"'], [msg.setBackgroundSanta(), '"santa"']];

  blockly.Blocks.flappy_setBackground.K1_CHOICES = [[skin.background, FLAPPY_VALUE], [skin.night.background, '"night"'], [skin.scifi.background, '"scifi"'], [skin.underwater.background, '"underwater"'], [skin.cave.background, '"cave"'], [skin.santa.background, '"santa"'], [skin.randomPurpleIcon, RANDOM_VALUE]];

  generator.flappy_setBackground = function () {
    return generateSetterCode(this, 'setBackground');
  };

  /**
   * setPlayer
   */
  blockly.Blocks.flappy_setPlayer = {
    helpUrl: '',
    init: function init() {
      this.setHSV(312, 0.32, 0.62);
      var dropdown;
      var input = this.appendDummyInput();
      if (isK1) {
        input.appendTitle(msg.setPlayer());
        dropdown = new blockly.FieldImageDropdown(this.K1_CHOICES, 34, 24);
        dropdown.setValue(FLAPPY_VALUE);
      } else {
        dropdown = new blockly.FieldDropdown(this.VALUES);
        dropdown.setValue(FLAPPY_VALUE);
      }
      input.appendTitle(dropdown, 'VALUE');

      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setPlayerTooltip());
    }
  };

  blockly.Blocks.flappy_setPlayer.VALUES = [[msg.setPlayerRandom(), RANDOM_VALUE], [msg.setPlayerFlappy(), FLAPPY_VALUE], [msg.setPlayerRedBird(), '"redbird"'], [msg.setPlayerSciFi(), '"scifi"'], [msg.setPlayerUnderwater(), '"underwater"'], [msg.setPlayerSanta(), '"santa"'], [msg.setPlayerCave(), '"cave"'], [msg.setPlayerShark(), '"shark"'], [msg.setPlayerEaster(), '"easter"'], [msg.setPlayerBatman(), '"batman"'], [msg.setPlayerSubmarine(), '"submarine"'], [msg.setPlayerUnicorn(), '"unicorn"'], [msg.setPlayerFairy(), '"fairy"'], [msg.setPlayerSuperman(), '"superman"'], [msg.setPlayerTurkey(), '"turkey"']];

  blockly.Blocks.flappy_setPlayer.K1_CHOICES = [[skin.avatar, FLAPPY_VALUE], [skin.redbird.avatar, '"redbird"'], [skin.scifi.avatar, '"scifi"'], [skin.underwater.avatar, '"underwater"'], [skin.santa.avatar, '"santa"'], [skin.cave.avatar, '"cave"'], [skin.shark.avatar, '"shark"'], [skin.easter.avatar, '"easter"'], [skin.batman.avatar, '"batman"'], [skin.submarine.avatar, '"submarine"'], [skin.unicorn.avatar, '"unicorn"'], [skin.fairy.avatar, '"fairy"'], [skin.superman.avatar, '"superman"'], [skin.turkey.avatar, '"turkey"'], [skin.randomPurpleIcon, RANDOM_VALUE]];

  generator.flappy_setPlayer = function () {
    return generateSetterCode(this, 'setPlayer');
  };

  /**
   * setObstacle
   */
  blockly.Blocks.flappy_setObstacle = {
    helpUrl: '',
    init: function init() {
      this.setHSV(312, 0.32, 0.62);
      var dropdown;
      var input = this.appendDummyInput();
      if (isK1) {
        input.appendTitle(msg.setObstacle());
        dropdown = new blockly.FieldImageDropdown(this.K1_CHOICES, 50, 30);
        dropdown.setValue(FLAPPY_VALUE);
      } else {
        dropdown = new blockly.FieldDropdown(this.VALUES);
        dropdown.setValue(FLAPPY_VALUE);
      }

      input.appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setObstacleTooltip());
    }
  };

  blockly.Blocks.flappy_setObstacle.VALUES = [[msg.setObstacleRandom(), RANDOM_VALUE], [msg.setObstacleFlappy(), FLAPPY_VALUE], [msg.setObstacleSciFi(), '"scifi"'], [msg.setObstacleUnderwater(), '"underwater"'], [msg.setObstacleCave(), '"cave"'], [msg.setObstacleSanta(), '"santa"'], [msg.setObstacleLaser(), '"laser"']];

  blockly.Blocks.flappy_setObstacle.K1_CHOICES = [[skin.obstacle_bottom_thumb, FLAPPY_VALUE], [skin.scifi.obstacle_bottom_thumb, '"scifi"'], [skin.underwater.obstacle_bottom_thumb, '"underwater"'], [skin.cave.obstacle_bottom_thumb, '"cave"'], [skin.santa.obstacle_bottom_thumb, '"santa"'], [skin.laser.obstacle_bottom_thumb, '"laser"'], [skin.randomPurpleIcon, RANDOM_VALUE]];

  generator.flappy_setObstacle = function () {
    return generateSetterCode(this, 'setObstacle');
  };

  /**
   * setGround
   */
  blockly.Blocks.flappy_setGround = {
    helpUrl: '',
    init: function init() {
      this.setHSV(312, 0.32, 0.62);
      var dropdown;
      var input = this.appendDummyInput();
      if (isK1) {
        input.appendTitle(msg.setGround());
        dropdown = new blockly.FieldImageDropdown(this.K1_CHOICES, 50, 30);
        dropdown.setValue(FLAPPY_VALUE);
      } else {
        dropdown = new blockly.FieldDropdown(this.VALUES);
        dropdown.setValue(FLAPPY_VALUE);
      }
      input.appendTitle(dropdown, 'VALUE');

      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setGroundTooltip());
    }
  };

  blockly.Blocks.flappy_setGround.VALUES = [[msg.setGroundRandom(), RANDOM_VALUE], [msg.setGroundFlappy(), FLAPPY_VALUE], [msg.setGroundSciFi(), '"scifi"'], [msg.setGroundUnderwater(), '"underwater"'], [msg.setGroundCave(), '"cave"'], [msg.setGroundSanta(), '"santa"'], [msg.setGroundLava(), '"lava"']];

  blockly.Blocks.flappy_setGround.K1_CHOICES = [[skin.ground_thumb, FLAPPY_VALUE], [skin.scifi.ground_thumb, '"scifi"'], [skin.underwater.ground_thumb, '"underwater"'], [skin.cave.ground_thumb, '"cave"'], [skin.santa.ground_thumb, '"santa"'], [skin.lava.ground_thumb, '"lava"'], [skin.randomPurpleIcon, RANDOM_VALUE]];

  generator.flappy_setGround = function () {
    return generateSetterCode(this, 'setGround');
  };

  /**
   * setGravity
   */
  blockly.Blocks.flappy_setGravity = {
    helpUrl: '',
    init: function init() {
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[3][1]); // default to normal

      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setGravityTooltip());
    }
  };

  blockly.Blocks.flappy_setGravity.VALUES = [[msg.setGravityRandom(), RANDOM_VALUE], [msg.setGravityVeryLow(), 'Flappy.Gravity.VERY_LOW'], [msg.setGravityLow(), 'Flappy.Gravity.LOW'], [msg.setGravityNormal(), 'Flappy.Gravity.NORMAL'], [msg.setGravityHigh(), 'Flappy.Gravity.HIGH'], [msg.setGravityVeryHigh(), 'Flappy.Gravity.VERY_HIGH']];

  generator.flappy_setGravity = function () {
    return generateSetterCode(this, 'setGravity');
  };

  blockly.Blocks.flappy_setScore = {
    // Block for moving forward or backward the internal number of pixels.
    init: function init() {
      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput().appendTitle(msg.setScore()).appendTitle(new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator), 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setScoreTooltip());
    }
  };

  generator.flappy_setScore = function () {
    // Generate JavaScript for moving forward or backward the internal number of
    // pixels.
    var value = window.parseInt(this.getTitleValue('VALUE'), 10);
    return 'Flappy.setScore(\'block_id_' + this.id + '\', ' + value + ');\n';
  };

  delete blockly.Blocks.procedures_defreturn;
  delete blockly.Blocks.procedures_ifreturn;
};

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./locale":"/home/ubuntu/staging/apps/build/js/flappy/locale.js"}],"/home/ubuntu/staging/apps/build/js/flappy/locale.js":[function(require,module,exports){
// locale for flappy

"use strict";

module.exports = window.blockly.flappy_locale;

},{}],"/home/ubuntu/staging/apps/build/js/flappy/api.js":[function(require,module,exports){
'use strict';

var studioApp = require('../StudioApp').singleton;

exports.FlapHeight = {
  VERY_SMALL: -6,
  SMALL: -8,
  NORMAL: -11,
  LARGE: -13,
  VERY_LARGE: -15
};

exports.LevelSpeed = {
  VERY_SLOW: 1,
  SLOW: 3,
  NORMAL: 4,
  FAST: 6,
  VERY_FAST: 8
};

exports.GapHeight = {
  VERY_SMALL: 65,
  SMALL: 75,
  NORMAL: 100,
  LARGE: 125,
  VERY_LARGE: 150
};

exports.Gravity = {
  VERY_LOW: 0.5,
  LOW: 0.75,
  NORMAL: 1,
  HIGH: 1.25,
  VERY_HIGH: 1.5
};

exports.random = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

exports.setScore = function (id, value) {
  studioApp.highlight(id);
  Flappy.playerScore = value;
  Flappy.displayScore();
};

exports.setGravity = function (id, value) {
  studioApp.highlight(id);
  Flappy.gravity = value;
};

exports.setGround = function (id, value) {
  studioApp.highlight(id);
  Flappy.setGround(value);
};

exports.setObstacle = function (id, value) {
  studioApp.highlight(id);
  Flappy.setObstacle(value);
};

exports.setPlayer = function (id, value) {
  studioApp.highlight(id);
  Flappy.setPlayer(value);
};

exports.setGapHeight = function (id, value) {
  studioApp.highlight(id);
  Flappy.setGapHeight(value);
};

exports.setBackground = function (id, value) {
  studioApp.highlight(id);
  Flappy.setBackground(value);
};

exports.setSpeed = function (id, value) {
  studioApp.highlight(id);
  Flappy.SPEED = value;
};

exports.playSound = function (id, soundName) {
  studioApp.highlight(id);
  studioApp.playAudio(soundName);
};

exports.flap = function (id, amount) {
  studioApp.highlight(id);
  Flappy.flap(amount);
};

exports.endGame = function (id) {
  studioApp.highlight(id);
  Flappy.gameState = Flappy.GameStates.ENDING;
};

exports.incrementPlayerScore = function (id) {
  studioApp.highlight(id);
  Flappy.playerScore++;
  Flappy.displayScore();
};

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js"}]},{},["/home/ubuntu/staging/apps/build/js/flappy/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9mbGFwcHkvbWFpbi5qcyIsImJ1aWxkL2pzL2ZsYXBweS9za2lucy5qcyIsImJ1aWxkL2pzL2ZsYXBweS9sZXZlbHMuanMiLCJidWlsZC9qcy9mbGFwcHkvZmxhcHB5LmpzIiwiYnVpbGQvanMvZmxhcHB5L3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9mbGFwcHkvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9mbGFwcHkvY29uc3RhbnRzLmpzIiwiYnVpbGQvanMvZmxhcHB5L2Jsb2Nrcy5qcyIsImJ1aWxkL2pzL2ZsYXBweS9sb2NhbGUuanMiLCJidWlsZC9qcy9mbGFwcHkvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUNaQSxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRXBDLElBQUksT0FBTyxHQUFHOztBQUVaLFFBQU0sRUFBRSxFQUNQOztDQUVGLENBQUM7O0FBRUYsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDcEMsTUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEMsTUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7Ozs7O0FBTTlCLE1BQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxjQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQztBQUNqRCxVQUFNLEVBQUUsSUFBSSxD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QUFDO0FBQ3hCLFFBQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNyQixRQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7Q0FDdkIsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBhcHBNYWluID0gcmVxdWlyZSgnLi4vYXBwTWFpbicpO1xud2luZG93LkZsYXBweSA9IHJlcXVpcmUoJy4vZmxhcHB5Jyk7XG5pZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgZ2xvYmFsLkZsYXBweSA9IHdpbmRvdy5GbGFwcHk7XG59XG52YXIgYmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi9za2lucycpO1xuXG53aW5kb3cuZmxhcHB5TWFpbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIG9wdGlvbnMuc2tpbnNNb2R1bGUgPSBza2lucztcbiAgb3B0aW9ucy5ibG9ja3NNb2R1bGUgPSBibG9ja3M7XG4gIGFwcE1haW4od2luZG93LkZsYXBweSwgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW1KMWFXeGtMMnB6TDJac1lYQndlUzl0WVdsdUxtcHpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdPenRCUVVGQkxFbEJRVWtzVDBGQlR5eEhRVUZITEU5QlFVOHNRMEZCUXl4WlFVRlpMRU5CUVVNc1EwRkJRenRCUVVOd1F5eE5RVUZOTEVOQlFVTXNUVUZCVFN4SFFVRkhMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dEJRVU53UXl4SlFVRkpMRTlCUVU4c1RVRkJUU3hMUVVGTExGZEJRVmNzUlVGQlJUdEJRVU5xUXl4UlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTTdRMEZETDBJN1FVRkRSQ3hKUVVGSkxFMUJRVTBzUjBGQlJ5eFBRVUZQTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNN1FVRkRha01zU1VGQlNTeE5RVUZOTEVkQlFVY3NUMEZCVHl4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8wRkJRMnBETEVsQlFVa3NTMEZCU3l4SFFVRkhMRTlCUVU4c1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6czdRVUZGTDBJc1RVRkJUU3hEUVVGRExGVkJRVlVzUjBGQlJ5eFZRVUZUTEU5QlFVOHNSVUZCUlR0QlFVTndReXhUUVVGUExFTkJRVU1zVjBGQlZ5eEhRVUZITEV0QlFVc3NRMEZCUXp0QlFVTTFRaXhUUVVGUExFTkJRVU1zV1VGQldTeEhRVUZITEUxQlFVMHNRMEZCUXp0QlFVTTVRaXhUUVVGUExFTkJRVU1zVFVGQlRTeERRVUZETEUxQlFVMHNSVUZCUlN4TlFVRk5MRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03UTBGRGVrTXNRMEZCUXlJc0ltWnBiR1VpT2lKblpXNWxjbUYwWldRdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2lkbUZ5SUdGd2NFMWhhVzRnUFNCeVpYRjFhWEpsS0NjdUxpOWhjSEJOWVdsdUp5azdYRzUzYVc1a2IzY3VSbXhoY0hCNUlEMGdjbVZ4ZFdseVpTZ25MaTltYkdGd2NIa25LVHRjYm1sbUlDaDBlWEJsYjJZZ1oyeHZZbUZzSUNFOVBTQW5kVzVrWldacGJtVmtKeWtnZTF4dUlDQm5iRzlpWVd3dVJteGhjSEI1SUQwZ2QybHVaRzkzTGtac1lYQndlVHRjYm4xY2JuWmhjaUJpYkc5amEzTWdQU0J5WlhGMWFYSmxLQ2N1TDJKc2IyTnJjeWNwTzF4dWRtRnlJR3hsZG1Wc2N5QTlJSEpsY1hWcGNtVW9KeTR2YkdWMlpXeHpKeWs3WEc1MllYSWdjMnRwYm5NZ1BTQnlaWEYxYVhKbEtDY3VMM05yYVc1ekp5azdYRzVjYm5kcGJtUnZkeTVtYkdGd2NIbE5ZV2x1SUQwZ1puVnVZM1JwYjI0b2IzQjBhVzl1Y3lrZ2UxeHVJQ0J2Y0hScGIyNXpMbk5yYVc1elRXOWtkV3hsSUQwZ2MydHBibk03WEc0Z0lHOXdkR2x2Ym5NdVlteHZZMnR6VFc5a2RXeGxJRDBnWW14dlkydHpPMXh1SUNCaGNIQk5ZV2x1S0hkcGJtUnZkeTVHYkdGd2NIa3NJR3hsZG1Wc2N5d2diM0IwYVc5dWN5azdYRzU5TzF4dUlsMTkiLCIvKipcbiAqIExvYWQgU2tpbiBmb3IgRmxhcHB5LlxuICovXG4vLyBiYWNrZ3JvdW5kOiBOdW1iZXIgb2YgNDAweDQwMCBiYWNrZ3JvdW5kIGltYWdlcy4gUmFuZG9tbHkgc2VsZWN0IG9uZSBpZlxuLy8gc3BlY2lmaWVkLCBvdGhlcndpc2UsIHVzZSBiYWNrZ3JvdW5kLnBuZy5cbi8vIGdyYXBoOiBDb2xvdXIgb2Ygb3B0aW9uYWwgZ3JpZCBsaW5lcywgb3IgZmFsc2UuXG5cbnZhciBza2luc0Jhc2UgPSByZXF1aXJlKCcuLi9za2lucycpO1xuXG52YXIgQ09ORklHUyA9IHtcblxuICBmbGFwcHk6IHtcbiAgfVxuXG59O1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbihhc3NldFVybCwgaWQpIHtcbiAgdmFyIHNraW4gPSBza2luc0Jhc2UubG9hZChhc3NldFVybCwgaWQpO1xuICB2YXIgY29uZmlnID0gQ09ORklHU1tza2luLmlkXTtcblxuICAvLyB0b2RvOiB0aGUgd2F5IHRoZXNlIGFyZSBvcmdhbml6ZWQgZW5kcyB1cCBiZWluZyBhIGxpdHRsZSBiaXQgdWdseSBhc1xuICAvLyBsb3Qgb2Ygb3VyIGFzc2V0cyBhcmUgaW5kaXZpZHVhbCBpdGVtcyBub3QgbmVjZXNzYXJpbHkgYXR0YWNoZWQgdG8gYVxuICAvLyBzcGVjaWZpYyB0aGVtZVxuXG4gIHNraW4uc2NpZmkgPSB7XG4gICAgYmFja2dyb3VuZDogc2tpbi5hc3NldFVybCgnYmFja2dyb3VuZF9zY2lmaS5wbmcnKSxcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ2F2YXRhcl9zY2lmaS5wbmcnKSxcbiAgICBvYnN0YWNsZV9ib3R0b206IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbV9zY2lmaS5wbmcnKSxcbiAgICBvYnN0YWNsZV9ib3R0b21fdGh1bWI6IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbV9zY2lmaV90aHVtYi5wbmcnKSxcbiAgICBvYnN0YWNsZV90b3A6IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX3RvcF9zY2lmaS5wbmcnKSxcbiAgICBncm91bmQ6IHNraW4uYXNzZXRVcmwoJ2dyb3VuZF9zY2lmaS5wbmcnKSxcbiAgICBncm91bmRfdGh1bWI6IHNraW4uYXNzZXRVcmwoJ2dyb3VuZF9zY2lmaV90aHVtYi5wbmcnKVxuICB9O1xuXG4gIHNraW4udW5kZXJ3YXRlciA9IHtcbiAgICBiYWNrZ3JvdW5kOiBza2luLmFzc2V0VXJsKCdiYWNrZ3JvdW5kX3VuZGVyd2F0ZXIucG5nJyksXG4gICAgYXZhdGFyOiBza2luLmFzc2V0VXJsKCdhdmF0YXJfdW5kZXJ3YXRlci5wbmcnKSxcbiAgICBvYnN0YWNsZV9ib3R0b206IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbV91bmRlcndhdGVyLnBuZycpLFxuICAgIG9ic3RhY2xlX2JvdHRvbV90aHVtYjogc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfYm90dG9tX3VuZGVyd2F0ZXJfdGh1bWIucG5nJyksXG4gICAgb2JzdGFjbGVfdG9wOiBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV90b3BfdW5kZXJ3YXRlci5wbmcnKSxcbiAgICBncm91bmQ6IHNraW4uYXNzZXRVcmwoJ2dyb3VuZF91bmRlcndhdGVyLnBuZycpLFxuICAgIGdyb3VuZF90aHVtYjogc2tpbi5hc3NldFVybCgnZ3JvdW5kX3VuZGVyd2F0ZXJfdGh1bWIucG5nJylcbiAgfTtcblxuICBza2luLmNhdmUgPSB7XG4gICAgYmFja2dyb3VuZDogc2tpbi5hc3NldFVybCgnYmFja2dyb3VuZF9jYXZlLnBuZycpLFxuICAgIGF2YXRhcjogc2tpbi5hc3NldFVybCgnYXZhdGFyX2NhdmUucG5nJyksXG4gICAgb2JzdGFjbGVfYm90dG9tOiBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV9ib3R0b21fY2F2ZS5wbmcnKSxcbiAgICBvYnN0YWNsZV9ib3R0b21fdGh1bWI6IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbV9jYXZlX3RodW1iLnBuZycpLFxuICAgIG9ic3RhY2xlX3RvcDogc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfdG9wX2NhdmUucG5nJyksXG4gICAgZ3JvdW5kOiBza2luLmFzc2V0VXJsKCdncm91bmRfY2F2ZS5wbmcnKSxcbiAgICBncm91bmRfdGh1bWI6IHNraW4uYXNzZXRVcmwoJ2dyb3VuZF9jYXZlX3RodW1iLnBuZycpXG4gIH07XG5cbiAgc2tpbi5zYW50YSA9IHtcbiAgICBiYWNrZ3JvdW5kOiBza2luLmFzc2V0VXJsKCdiYWNrZ3JvdW5kX3NhbnRhLnBuZycpLFxuICAgIGF2YXRhcjogc2tpbi5hc3NldFVybCgnc2FudGEucG5nJyksXG4gICAgb2JzdGFjbGVfYm90dG9tOiBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV9ib3R0b21fc2FudGEucG5nJyksXG4gICAgb2JzdGFjbGVfYm90dG9tX3RodW1iOiBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV9ib3R0b21fc2FudGFfdGh1bWIucG5nJyksXG4gICAgb2JzdGFjbGVfdG9wOiBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV90b3Bfc2FudGEucG5nJyksXG4gICAgZ3JvdW5kOiBza2luLmFzc2V0VXJsKCdncm91bmRfc2FudGEucG5nJyksXG4gICAgZ3JvdW5kX3RodW1iOiBza2luLmFzc2V0VXJsKCdncm91bmRfc2FudGFfdGh1bWIucG5nJylcbiAgfTtcblxuICBza2luLm5pZ2h0ID0ge1xuICAgIGJhY2tncm91bmQ6IHNraW4uYXNzZXRVcmwoJ2JhY2tncm91bmRfbmlnaHQucG5nJylcbiAgfTtcblxuICBza2luLnJlZGJpcmQgPSB7XG4gICAgYXZhdGFyOiBza2luLmFzc2V0VXJsKCdhdmF0YXJfcmVkYmlyZC5wbmcnKVxuICB9O1xuXG4gIHNraW4ubGFzZXIgPSB7XG4gICAgb2JzdGFjbGVfYm90dG9tOiBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV9ib3R0b21fbGFzZXIucG5nJyksXG4gICAgb2JzdGFjbGVfYm90dG9tX3RodW1iOiBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV9ib3R0b21fbGFzZXJfdGh1bWIucG5nJyksXG4gICAgb2JzdGFjbGVfdG9wOiBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV90b3BfbGFzZXIucG5nJylcbiAgfTtcblxuICBza2luLmxhdmEgPSB7XG4gICAgZ3JvdW5kOiBza2luLmFzc2V0VXJsKCdncm91bmRfbGF2YS5wbmcnKSxcbiAgICBncm91bmRfdGh1bWI6IHNraW4uYXNzZXRVcmwoJ2dyb3VuZF9sYXZhX3RodW1iLnBuZycpXG4gIH07XG5cbiAgc2tpbi5zaGFyayA9IHtcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ3NoYXJrLnBuZycpXG4gIH07XG5cbiAgc2tpbi5lYXN0ZXIgPSB7XG4gICAgYXZhdGFyOiBza2luLmFzc2V0VXJsKCdlYXN0ZXJidW5ueS5wbmcnKVxuICB9O1xuXG4gIHNraW4uYmF0bWFuID0ge1xuICAgIGF2YXRhcjogc2tpbi5hc3NldFVybCgnYmF0bWFuLnBuZycpXG4gIH07XG5cbiAgc2tpbi5zdWJtYXJpbmUgPSB7XG4gICAgYXZhdGFyOiBza2luLmFzc2V0VXJsKCdzdWJtYXJpbmUucG5nJylcbiAgfTtcblxuICBza2luLnVuaWNvcm4gPSB7XG4gICAgYXZhdGFyOiBza2luLmFzc2V0VXJsKCd1bmljb3JuLnBuZycpXG4gIH07XG5cbiAgc2tpbi5mYWlyeSA9IHtcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ2ZhaXJ5LnBuZycpXG4gIH07XG5cbiAgc2tpbi5zdXBlcm1hbiA9IHtcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ3N1cGVybWFuLnBuZycpXG4gIH07XG5cbiAgc2tpbi50dXJrZXkgPSB7XG4gICAgYXZhdGFyOiBza2luLmFzc2V0VXJsKCd0dXJrZXkucG5nJylcbiAgfTtcblxuICAvLyBJbWFnZXNcbiAgc2tpbi5ncm91bmQgPSBza2luLmFzc2V0VXJsKCdncm91bmQucG5nJyk7XG4gIHNraW4uZ3JvdW5kX3RodW1iID0gc2tpbi5hc3NldFVybCgnZ3JvdW5kX3RodW1iLnBuZycpO1xuICBza2luLm9ic3RhY2xlX3RvcCA9IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX3RvcC5wbmcnKTtcbiAgc2tpbi5vYnN0YWNsZV9ib3R0b20gPSBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV9ib3R0b20ucG5nJyk7XG4gIHNraW4ub2JzdGFjbGVfYm90dG9tX3RodW1iID0gc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfYm90dG9tX3RodW1iLnBuZycpO1xuICBza2luLmluc3RydWN0aW9ucyA9IHNraW4uYXNzZXRVcmwoJ2luc3RydWN0aW9ucy5wbmcnKTtcbiAgc2tpbi5jbGlja3J1biA9IHNraW4uYXNzZXRVcmwoJ2NsaWNrcnVuLnBuZycpO1xuICBza2luLmdldHJlYWR5ID0gc2tpbi5hc3NldFVybCgnZ2V0cmVhZHkucG5nJyk7XG4gIHNraW4uZ2FtZW92ZXIgPSBza2luLmFzc2V0VXJsKCdnYW1lb3Zlci5wbmcnKTtcbiAgc2tpbi5mbGFwSWNvbiA9IHNraW4uYXNzZXRVcmwoJ2ZsYXAtYmlyZC5wbmcnKTtcbiAgc2tpbi5jcmFzaEljb24gPSBza2luLmFzc2V0VXJsKCd3aGVuLWNyYXNoLnBuZycpO1xuICBza2luLmNvbGxpZGVPYnN0YWNsZUljb24gPSBza2luLmFzc2V0VXJsKCd3aGVuLW9ic3RhY2xlLnBuZycpO1xuICBza2luLmNvbGxpZGVHcm91bmRJY29uID0gc2tpbi5hc3NldFVybCgnd2hlbi1jcmFzaC5wbmcnKTtcbiAgc2tpbi5lbnRlck9ic3RhY2xlSWNvbiA9IHNraW4uYXNzZXRVcmwoJ3doZW4tcGFzcy5wbmcnKTtcbiAgc2tpbi50aWxlcyA9IHNraW4uYXNzZXRVcmwoJ3RpbGVzLnBuZycpO1xuICBza2luLmdvYWwgPSBza2luLmFzc2V0VXJsKCdnb2FsLnBuZycpO1xuICBza2luLmdvYWxTdWNjZXNzID0gc2tpbi5hc3NldFVybCgnZ29hbF9zdWNjZXNzLnBuZycpO1xuICBza2luLm9ic3RhY2xlID0gc2tpbi5hc3NldFVybCgnb2JzdGFjbGUucG5nJyk7XG4gIHNraW4ub2JzdGFjbGVTY2FsZSA9IGNvbmZpZy5vYnN0YWNsZVNjYWxlIHx8IDEuMDtcbiAgc2tpbi5sYXJnZXJPYnN0YWNsZUFuaW1hdGlvblRpbGVzID1cbiAgICAgIHNraW4uYXNzZXRVcmwoY29uZmlnLmxhcmdlck9ic3RhY2xlQW5pbWF0aW9uVGlsZXMpO1xuICBza2luLmhpdHRpbmdXYWxsQW5pbWF0aW9uID1cbiAgICAgIHNraW4uYXNzZXRVcmwoY29uZmlnLmhpdHRpbmdXYWxsQW5pbWF0aW9uKTtcbiAgc2tpbi5hcHByb2FjaGluZ0dvYWxBbmltYXRpb24gPVxuICAgICAgc2tpbi5hc3NldFVybChjb25maWcuYXBwcm9hY2hpbmdHb2FsQW5pbWF0aW9uKTtcbiAgLy8gU291bmRzXG4gIHNraW4ub2JzdGFjbGVTb3VuZCA9XG4gICAgICBbc2tpbi5hc3NldFVybCgnb2JzdGFjbGUubXAzJyksIHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlLm9nZycpXTtcbiAgc2tpbi53YWxsU291bmQgPSBbc2tpbi5hc3NldFVybCgnd2FsbC5tcDMnKSwgc2tpbi5hc3NldFVybCgnd2FsbC5vZ2cnKV07XG4gIHNraW4ud2luR29hbFNvdW5kID0gW3NraW4uYXNzZXRVcmwoJ3dpbl9nb2FsLm1wMycpLFxuICAgICAgICAgICAgICAgICAgICAgICBza2luLmFzc2V0VXJsKCd3aW5fZ29hbC5vZ2cnKV07XG4gIHNraW4ud2FsbDBTb3VuZCA9IFtza2luLmFzc2V0VXJsKCd3YWxsMC5tcDMnKSwgc2tpbi5hc3NldFVybCgnd2FsbDAub2dnJyldO1xuXG4gIHNraW4uZGllU291bmQgPSBbc2tpbi5hc3NldFVybCgnc2Z4X2RpZS5tcDMnKSwgc2tpbi5hc3NldFVybCgnc2Z4X2RpZS5vZ2cnKV07XG4gIHNraW4uaGl0U291bmQgPSBbc2tpbi5hc3NldFVybCgnc2Z4X2hpdC5tcDMnKSwgc2tpbi5hc3NldFVybCgnc2Z4X2hpdC5vZ2cnKV07XG4gIHNraW4ucG9pbnRTb3VuZCA9IFtza2luLmFzc2V0VXJsKCdzZnhfcG9pbnQubXAzJyksIHNraW4uYXNzZXRVcmwoJ3NmeF9wb2ludC5vZ2cnKV07XG4gIHNraW4uc3dvb3NoaW5nU291bmQgPSBbc2tpbi5hc3NldFVybCgnc2Z4X3N3b29zaGluZy5tcDMnKSwgc2tpbi5hc3NldFVybCgnc2Z4X3N3b29zaGluZy5vZ2cnKV07XG4gIHNraW4ud2luZ1NvdW5kID0gW3NraW4uYXNzZXRVcmwoJ3NmeF93aW5nLm1wMycpLCBza2luLmFzc2V0VXJsKCdzZnhfd2luZy5vZ2cnKV07XG5cbiAgc2tpbi5qZXRTb3VuZCA9IFtza2luLmFzc2V0VXJsKCdqZXQubXAzJyksIHNraW4uYXNzZXRVcmwoJ2pldC5vZ2cnKV07XG4gIHNraW4uY3Jhc2hTb3VuZCA9IFtza2luLmFzc2V0VXJsKCdjcmFzaC5tcDMnKSwgc2tpbi5hc3NldFVybCgnY3Jhc2gub2dnJyldO1xuICBza2luLmppbmdsZVNvdW5kID0gW3NraW4uYXNzZXRVcmwoJ2ppbmdsZS5tcDMnKSwgc2tpbi5hc3NldFVybCgnamluZ2xlLm9nZycpXTtcbiAgc2tpbi5sYXNlclNvdW5kID0gW3NraW4uYXNzZXRVcmwoJ2xhc2VyLm1wMycpLCBza2luLmFzc2V0VXJsKCdsYXNlci5vZ2cnKV07XG4gIHNraW4uc3BsYXNoU291bmQgPSBbc2tpbi5hc3NldFVybCgnc3BsYXNoLm1wMycpLCBza2luLmFzc2V0VXJsKCdzcGxhc2gub2dnJyldO1xuXG4gIC8vIFNldHRpbmdzXG4gIHNraW4uZ3JhcGggPSBjb25maWcuZ3JhcGg7XG4gIHNraW4uYmFja2dyb3VuZCA9IHNraW4uYXNzZXRVcmwoJ2JhY2tncm91bmQucG5nJyk7XG5cbiAgcmV0dXJuIHNraW47XG59O1xuIiwiLypqc2hpbnQgbXVsdGlzdHI6IHRydWUgKi9cblxuLy8gdG9kbyAtIGkgdGhpbmsgb3VyIHByZXBvbHVhdGVkIGNvZGUgY291bnRzIGFzIExPQ3NcblxudmFyIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG52YXIgZmxhcHB5TXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciB0YiA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJykuY3JlYXRlVG9vbGJveDtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciBjYXRlZ29yeSA9IGZ1bmN0aW9uIChuYW1lLCBibG9ja3MpIHtcbiAgcmV0dXJuICc8Y2F0ZWdvcnkgaWQ9XCInICsgbmFtZSArICdcIiBuYW1lPVwiJyArIG5hbWUgKyAnXCI+JyArIGJsb2NrcyArICc8L2NhdGVnb3J5Pic7XG59O1xuXG52YXIgZmxhcEJsb2NrID0gJzxibG9jayB0eXBlPVwiZmxhcHB5X2ZsYXBcIj48L2Jsb2NrPic7XG52YXIgZmxhcEhlaWdodEJsb2NrID0gJzxibG9jayB0eXBlPVwiZmxhcHB5X2ZsYXBfaGVpZ2h0XCI+PC9ibG9jaz4nO1xudmFyIGVuZEdhbWVCbG9jayA9ICc8YmxvY2sgdHlwZT1cImZsYXBweV9lbmRHYW1lXCI+PC9ibG9jaz4nO1xudmFyIHBsYXlTb3VuZEJsb2NrID0gICc8YmxvY2sgdHlwZT1cImZsYXBweV9wbGF5U291bmRcIj48L2Jsb2NrPic7XG52YXIgaW5jcmVtZW50U2NvcmVCbG9jayA9ICc8YmxvY2sgdHlwZT1cImZsYXBweV9pbmNyZW1lbnRQbGF5ZXJTY29yZVwiPjwvYmxvY2s+JztcblxudmFyIHNldFNwZWVkQmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfc2V0U3BlZWRcIj48L2Jsb2NrPic7XG52YXIgc2V0QmFja2dyb3VuZEJsb2NrID0gJzxibG9jayB0eXBlPVwiZmxhcHB5X3NldEJhY2tncm91bmRcIj48L2Jsb2NrPic7XG52YXIgc2V0R2FwSGVpZ2h0QmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfc2V0R2FwSGVpZ2h0XCI+PC9ibG9jaz4nO1xudmFyIHNldFBsYXllckJsb2NrID0gJzxibG9jayB0eXBlPVwiZmxhcHB5X3NldFBsYXllclwiPjwvYmxvY2s+JztcbnZhciBzZXRPYnN0YWNsZUJsb2NrID0gJzxibG9jayB0eXBlPVwiZmxhcHB5X3NldE9ic3RhY2xlXCI+PC9ibG9jaz4nO1xudmFyIHNldEdyb3VuZEJsb2NrID0gJzxibG9jayB0eXBlPVwiZmxhcHB5X3NldEdyb3VuZFwiPjwvYmxvY2s+JztcbnZhciBzZXRHcmF2aXR5QmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfc2V0R3Jhdml0eVwiPjwvYmxvY2s+JztcbnZhciBzZXRTY29yZUJsb2NrID0gJzxibG9jayB0eXBlPVwiZmxhcHB5X3NldFNjb3JlXCI+PC9ibG9jaz4nO1xuXG52YXIgQVZBVEFSX0hFSUdIVCA9IGNvbnN0YW50cy5BVkFUQVJfSEVJR0hUO1xudmFyIEFWQVRBUl9XSURUSCA9IGNvbnN0YW50cy5BVkFUQVJfV0lEVEg7XG52YXIgQVZBVEFSX1lfT0ZGU0VUID0gY29uc3RhbnRzLkFWQVRBUl9ZX09GRlNFVDtcblxudmFyIGV2ZW50QmxvY2sgPSBmdW5jdGlvbiAodHlwZSwgY2hpbGQpIHtcbiAgcmV0dXJuICc8YmxvY2sgdHlwZT1cIicgKyB0eXBlICsgJ1wiIGRlbGV0YWJsZT1cImZhbHNlXCI+JyArXG4gICAgKGNoaWxkID8gJzxuZXh0PicgKyBjaGlsZCArICc8L25leHQ+JyA6ICcnKSArXG4gICAgJzwvYmxvY2s+Jztcbn07XG5cbi8vIG5vdCBtb3ZhYmxlIG9yIGRlbGV0YWJsZVxudmFyIGFuY2hvcmVkQmxvY2sgPSBmdW5jdGlvbiAodHlwZSwgY2hpbGQpIHtcbiAgcmV0dXJuICc8YmxvY2sgdHlwZT1cIicgKyB0eXBlICsgJ1wiIGRlbGV0YWJsZT1cImZhbHNlXCIgbW92YWJsZT1cImZhbHNlXCI+JyArXG4gICAgKGNoaWxkID8gJzxuZXh0PicgKyBjaGlsZCArICc8L25leHQ+JyA6ICcnKSArXG4gICAgJzwvYmxvY2s+Jztcbn07XG5cbi8qXG4gKiBDb25maWd1cmF0aW9uIGZvciBhbGwgbGV2ZWxzLlxuICovXG5cbiAvKipcbiAgKiBFeHBsYW5hdGlvbiBvZiBvcHRpb25zOlxuICAqIGdvYWwuc3RhcnRYL3N0YXJ0WVxuICAqIC0gc3RhcnQgbG9jYXRpb24gb2YgZmxhZyBpbWFnZVxuICAqIGdvYWwubW92aW5nXG4gICogLSB3aGV0aGVyIHRoZSBnb2FsIHN0YXlzIGluIG9uZSBzcG90IG9yIG1vdmVzIGF0IGxldmVsJ3Mgc3BlZWRcbiAgKiBnb2FsLnN1Y2Nlc3NDb25kaXRpb25cbiAgKiAtIGNvbmRpdGlvbihzKSwgd2hpY2ggaWYgdHJ1ZSBhdCBhbnkgcG9pbnQsIGluZGljYXRlIHVzZXIgaGFzIHN1Y2Nlc3NmdWxseVxuICAqICAgY29tcGxldGVkIHRoZSBwdXp6bGVcbiAgKiBnb2FsLmZhaWx1cmVDb25kaXRpb25cbiAgKiAtIGNvbmRpdGlvbihzKSwgd2hpY2ggaWYgdHJ1ZSBhdCBhbnkgcG9pbnQsIGluZGljYXRlcyB0aGUgcHV6emxlIGlzXG4gICAgICBjb21wbGV0ZSAoaW5kaWNhdGluZyBmYWlsdXJlIGlmIHN1Y2Nlc3MgY29uZGl0aW9uIG5vdCBtZXQpXG4gICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAnMSc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ2ZsYXAnLCAndHlwZSc6ICdmbGFwcHlfZmxhcCd9XVxuICAgIF0sXG4gICAgJ29ic3RhY2xlcyc6IGZhbHNlLFxuICAgICdncm91bmQnOiBmYWxzZSxcbiAgICAnc2NvcmUnOiBmYWxzZSxcbiAgICAnZnJlZVBsYXknOiBmYWxzZSxcbiAgICAnZ29hbCc6IHtcbiAgICAgIHN0YXJ0WCAgOiAxMDAsXG4gICAgICBzdGFydFk6IDAsXG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAoRmxhcHB5LmF2YXRhclkgIDw9IDQwKTtcbiAgICAgIH0sXG4gICAgICBmYWlsdXJlQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBGbGFwcHkuYXZhdGFyWSA+IEZsYXBweS5NQVpFX0hFSUdIVDtcbiAgICAgIH1cbiAgICB9LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoZmxhcEJsb2NrICsgcGxheVNvdW5kQmxvY2spLFxuICAgICdzdGFydEJsb2Nrcyc6XG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNsaWNrJyksXG4gICAgJ2FwcFNwZWNpZmljRmFpbEVycm9yJzpcbiAgICAgIGZsYXBweU1zZy5mbGFwcHlTcGVjaWZpY0ZhaWwoKVxuICB9LFxuXG4gICcyJzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFt7J3Rlc3QnOiAnZW5kR2FtZScsICd0eXBlJzogJ2ZsYXBweV9lbmRHYW1lJ31dXG4gICAgXSxcbiAgICAnb2JzdGFjbGVzJzogZmFsc2UsXG4gICAgJ2dyb3VuZCc6IHRydWUsXG4gICAgJ3Njb3JlJzogZmFsc2UsXG4gICAgJ2ZyZWVQbGF5JzogZmFsc2UsXG4gICAgJ2dvYWwnOiB7XG4gICAgICBzdGFydFg6IDEwMCxcbiAgICAgIHN0YXJ0WTogNDAwIC0gNDggLSA1NiAvIDIsXG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHRoaXMgb25seSBoYXBwZW5zIGFmdGVyIGF2YXRhciBoaXRzIGdyb3VuZCwgYW5kIHdlIHNwaW4gaGltIGJlY2F1c2Ugb2ZcbiAgICAgICAgLy8gZ2FtZSBvdmVyXG4gICAgICAgIHJldHVybiAoRmxhcHB5LmF2YXRhclkgID09PSAzMjIgJiYgRmxhcHB5LmF2YXRhclggPT09IDExMCk7XG4gICAgICB9LFxuICAgICAgZmFpbHVyZUNvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXZhdGFyQm90dG9tID0gRmxhcHB5LmF2YXRhclkgKyBBVkFUQVJfSEVJR0hUO1xuICAgICAgICB2YXIgZ3JvdW5kID0gRmxhcHB5Lk1BWkVfSEVJR0hUIC0gRmxhcHB5LkdST1VORF9IRUlHSFQ7XG4gICAgICAgIHJldHVybiAoYXZhdGFyQm90dG9tID49IGdyb3VuZCAmJiBGbGFwcHkuZ2FtZVN0YXRlID09PSBGbGFwcHkuR2FtZVN0YXRlcy5BQ1RJVkUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YihmbGFwQmxvY2sgKyBlbmRHYW1lQmxvY2sgKyBwbGF5U291bmRCbG9jayksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snLCBmbGFwQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZUdyb3VuZCcpXG4gIH0sXG5cbiAgJzMnOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdzZXRTcGVlZCcsICd0eXBlJzogJ2ZsYXBweV9zZXRTcGVlZCd9XVxuICAgIF0sXG4gICAgJ29ic3RhY2xlcyc6IGZhbHNlLFxuICAgICdncm91bmQnOiB0cnVlLFxuICAgICdzY29yZSc6IGZhbHNlLFxuICAgICdmcmVlUGxheSc6IGZhbHNlLFxuICAgICdnb2FsJzoge1xuICAgICAgc3RhcnRYOiA0MDAgLSA1NSxcbiAgICAgIHN0YXJ0WTogMCxcbiAgICAgIG1vdmluZzogdHJ1ZSxcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGF2YXRhckNlbnRlciA9IHtcbiAgICAgICAgICB4OiAoRmxhcHB5LmF2YXRhclggKyBBVkFUQVJfV0lEVEgpIC8gMixcbiAgICAgICAgICB5OiAoRmxhcHB5LmF2YXRhclkgKyBBVkFUQVJfSEVJR0hUKSAvIDJcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGdvYWxDZW50ZXIgPSB7XG4gICAgICAgICAgeDogKEZsYXBweS5nb2FsWCArIEZsYXBweS5HT0FMX1NJWkUpIC8gMixcbiAgICAgICAgICB5OiAoRmxhcHB5LmdvYWxZICsgRmxhcHB5LkdPQUxfU0laRSkgLyAyXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGRpZmYgPSB7XG4gICAgICAgICAgeDogTWF0aC5hYnMoYXZhdGFyQ2VudGVyLnggLSBnb2FsQ2VudGVyLngpLFxuICAgICAgICAgIHk6IE1hdGguYWJzKGF2YXRhckNlbnRlci55IC0gZ29hbENlbnRlci55KVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBkaWZmLnggPCAxNSAmJiBkaWZmLnkgPCAxNTtcbiAgICAgIH0sXG4gICAgICBmYWlsdXJlQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBGbGFwcHkuYWN0aXZlVGlja3MoKSA+PSAxMjAgJiYgRmxhcHB5LlNQRUVEID09PSAwO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YihmbGFwQmxvY2sgKyBwbGF5U291bmRCbG9jayArIHNldFNwZWVkQmxvY2spLFxuICAgICdzdGFydEJsb2Nrcyc6XG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNsaWNrJywgZmxhcEJsb2NrKSArXG4gICAgICBldmVudEJsb2NrKCd3aGVuX3J1bicpXG4gIH0sXG5cbiAgJzQnOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdlbmRHYW1lJywgJ3R5cGUnOiAnZmxhcHB5X2VuZEdhbWUnfV1cbiAgICBdLFxuICAgICdvYnN0YWNsZXMnOiB0cnVlLFxuICAgICdncm91bmQnOiB0cnVlLFxuICAgICdzY29yZSc6IGZhbHNlLFxuICAgICdmcmVlUGxheSc6IGZhbHNlLFxuICAgICdnb2FsJzoge1xuICAgICAgc3RhcnRYOiA2MDAgLSAoNTYgLyAyKSxcbiAgICAgIHN0YXJ0WTogNDAwIC0gNDggLSA1NiAvIDIsXG4gICAgICBtb3Zpbmc6IHRydWUsXG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBGbGFwcHkub2JzdGFjbGVzWzBdLmhpdEF2YXRhciAmJlxuICAgICAgICAgIEZsYXBweS5nYW1lU3RhdGUgPT09IEZsYXBweS5HYW1lU3RhdGVzLk9WRVI7XG4gICAgICB9LFxuICAgICAgZmFpbHVyZUNvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyB0b2RvIC0gd291bGQgYmUgbmljZSBpZiB3ZSBjb3VsZCBkaXN0aW5ndWlzaCBmZWVkYmFjayBmb3JcbiAgICAgICAgLy8gZmxldyB0aHJvdWdoIHBpcGUgdnMuIGRpZG50IGhvb2sgdXAgZW5kR2FtZSBibG9ja1xuICAgICAgICB2YXIgb2JzdGFjbGVFbmQgPSBGbGFwcHkub2JzdGFjbGVzWzBdLnggKyBGbGFwcHkuT0JTVEFDTEVfV0lEVEg7XG4gICAgICAgIHJldHVybiBvYnN0YWNsZUVuZCA8IEZsYXBweS5hdmF0YXJYO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YihmbGFwQmxvY2sgKyBlbmRHYW1lQmxvY2sgKyBwbGF5U291bmRCbG9jayArIHNldFNwZWVkQmxvY2spLFxuICAgICdzdGFydEJsb2Nrcyc6XG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNsaWNrJywgZmxhcEJsb2NrKSArXG4gICAgICBldmVudEJsb2NrKCd3aGVuX3J1bicsIHNldFNwZWVkQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZU9ic3RhY2xlJylcbiAgfSxcblxuICAnNSc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ2luY3JlbWVudFBsYXllclNjb3JlJywgJ3R5cGUnOiAnZmxhcHB5X2luY3JlbWVudFBsYXllclNjb3JlJ31dXG4gICAgXSxcbiAgICAnZGVmYXVsdEZsYXAnOiAnU01BTEwnLFxuICAgICdvYnN0YWNsZXMnOiB0cnVlLFxuICAgICdncm91bmQnOiB0cnVlLFxuICAgICdzY29yZSc6IHRydWUsXG4gICAgJ2ZyZWVQbGF5JzogZmFsc2UsXG4gICAgJ2dvYWwnOiB7XG4gICAgICAvLyB0b2RvIC0ga2luZCBvZiB1Z2x5IHRoYXQgd2UgZW5kIHVwIGxvb3BpbiB0aHJvdWdoIGFsbCBvYnN0YWNsZXMgdHdpY2UsXG4gICAgICAvLyBvbmNlIHRvIGNoZWNrIGZvciBzdWNjZXNzIGFuZCBhZ2FpbiB0byBjaGVjayBmb3IgZmFpbHVyZVxuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaW5zaWRlT2JzdGFjbGUgPSBmYWxzZTtcbiAgICAgICAgRmxhcHB5Lm9ic3RhY2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChvYnN0YWNsZSkge1xuICAgICAgICAgIGlmICghb2JzdGFjbGUuaGl0QXZhdGFyICYmIG9ic3RhY2xlLmNvbnRhaW5zQXZhdGFyKCkpIHtcbiAgICAgICAgICAgIGluc2lkZU9ic3RhY2xlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaW5zaWRlT2JzdGFjbGUgJiYgRmxhcHB5LnBsYXllclNjb3JlID4gMDtcbiAgICAgIH0sXG4gICAgICBmYWlsdXJlQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbnNpZGVPYnN0YWNsZSA9IGZhbHNlO1xuICAgICAgICBGbGFwcHkub2JzdGFjbGVzLmZvckVhY2goZnVuY3Rpb24gKG9ic3RhY2xlKSB7XG4gICAgICAgICAgaWYgKCFvYnN0YWNsZS5oaXRBdmF0YXIgJiYgb2JzdGFjbGUuY29udGFpbnNBdmF0YXIoKSkge1xuICAgICAgICAgICAgaW5zaWRlT2JzdGFjbGUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBpbnNpZGVPYnN0YWNsZSAmJiBGbGFwcHkucGxheWVyU2NvcmUgPT09IDA7XG4gICAgICB9XG4gICAgfSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKGZsYXBCbG9jayArIGVuZEdhbWVCbG9jayArIGluY3JlbWVudFNjb3JlQmxvY2sgKyBwbGF5U291bmRCbG9jayArIHNldFNwZWVkQmxvY2spLFxuICAgICdzdGFydEJsb2Nrcyc6XG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNsaWNrJywgZmxhcEJsb2NrKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUnKSArXG4gICAgICBldmVudEJsb2NrKCd3aGVuX3J1bicsIHNldFNwZWVkQmxvY2spXG4gIH0sXG5cbiAgJzYnOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdmbGFwJywgJ3R5cGUnOiAnZmxhcHB5X2ZsYXBfaGVpZ2h0J31dXG4gICAgXSxcbiAgICAnb2JzdGFjbGVzJzogdHJ1ZSxcbiAgICAnZ3JvdW5kJzogdHJ1ZSxcbiAgICAnc2NvcmUnOiB0cnVlLFxuICAgICdmcmVlUGxheSc6IGZhbHNlLFxuICAgICdnb2FsJzoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaW5zaWRlT2JzdGFjbGUgPSBmYWxzZTtcbiAgICAgICAgRmxhcHB5Lm9ic3RhY2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChvYnN0YWNsZSkge1xuICAgICAgICAgIGlmIChvYnN0YWNsZS5jb250YWluc0F2YXRhcigpKSB7XG4gICAgICAgICAgICBpbnNpZGVPYnN0YWNsZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGluc2lkZU9ic3RhY2xlICYmIEZsYXBweS5wbGF5ZXJTY29yZSA+IDA7XG4gICAgICB9LFxuICAgICAgZmFpbHVyZUNvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaW5zaWRlT2JzdGFjbGUgPSBmYWxzZTtcbiAgICAgICAgRmxhcHB5Lm9ic3RhY2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChvYnN0YWNsZSkge1xuICAgICAgICAgIGlmIChvYnN0YWNsZS5jb250YWluc0F2YXRhcigpKSB7XG4gICAgICAgICAgICBpbnNpZGVPYnN0YWNsZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGluc2lkZU9ic3RhY2xlICYmIEZsYXBweS5wbGF5ZXJTY29yZSA9PT0gMDtcbiAgICAgIH1cbiAgICB9LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoZmxhcEhlaWdodEJsb2NrICsgZW5kR2FtZUJsb2NrICsgaW5jcmVtZW50U2NvcmVCbG9jayArIHBsYXlTb3VuZEJsb2NrICsgc2V0U3BlZWRCbG9jayksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snKSArXG4gICAgICAvLyBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVHcm91bmQnLCBlbmRHYW1lQmxvY2spICtcbiAgICAgIC8vIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZU9ic3RhY2xlJywgZW5kR2FtZUJsb2NrKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUnLCBpbmNyZW1lbnRTY29yZUJsb2NrKSArXG4gICAgICBldmVudEJsb2NrKCd3aGVuX3J1bicsIHNldFNwZWVkQmxvY2spXG4gIH0sXG5cbiAgJzcnOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdzZXRCYWNrZ3JvdW5kJywgJ3R5cGUnOiAnZmxhcHB5X3NldEJhY2tncm91bmQnfV1cbiAgICBdLFxuICAgICdvYnN0YWNsZXMnOiB0cnVlLFxuICAgICdncm91bmQnOiB0cnVlLFxuICAgICdzY29yZSc6IHRydWUsXG4gICAgJ2ZyZWVQbGF5JzogZmFsc2UsXG4gICAgJ2dvYWwnOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAoRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuT1ZFUik7XG4gICAgICB9XG4gICAgfSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKGZsYXBIZWlnaHRCbG9jayArIGVuZEdhbWVCbG9jayArIGluY3JlbWVudFNjb3JlQmxvY2sgKyBwbGF5U291bmRCbG9jayArXG4gICAgICAgIHNldFNwZWVkQmxvY2sgKyBzZXRCYWNrZ3JvdW5kQmxvY2spLFxuICAgICdzdGFydEJsb2Nrcyc6XG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNsaWNrJywgZmxhcEhlaWdodEJsb2NrKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVHcm91bmQnLCBlbmRHYW1lQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZU9ic3RhY2xlJywgZW5kR2FtZUJsb2NrKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUnLCBpbmNyZW1lbnRTY29yZUJsb2NrKSArXG4gICAgICBldmVudEJsb2NrKCd3aGVuX3J1bicsIHNldFNwZWVkQmxvY2spXG4gIH0sXG5cbiAgJzgnOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3tcbiAgICAgICAgdGVzdDogZnVuY3Rpb24gKGJsb2NrKSB7XG4gICAgICAgICAgcmV0dXJuIChibG9jay50eXBlID09PSAnZmxhcHB5X3NldEJhY2tncm91bmQnIHx8XG4gICAgICAgICAgICBibG9jay50eXBlID09PSAnZmxhcHB5X3NldFBsYXllcicpICYmXG4gICAgICAgICAgICBibG9jay5nZXRUaXRsZVZhbHVlKCdWQUxVRScpID09PSAncmFuZG9tJztcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZTogJ2ZsYXBweV9zZXRCYWNrZ3JvdW5kJyxcbiAgICAgICAgdGl0bGVzOiB7XG4gICAgICAgICAgJ1ZBTFVFJzogJ3JhbmRvbSdcbiAgICAgICAgfVxuICAgICAgfV1cbiAgICBdLFxuICAgICdvYnN0YWNsZXMnOiB0cnVlLFxuICAgICdncm91bmQnOiB0cnVlLFxuICAgICdzY29yZSc6IHRydWUsXG4gICAgJ2ZyZWVQbGF5JzogZmFsc2UsXG4gICAgJ2dvYWwnOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAoRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuT1ZFUik7XG4gICAgICB9XG4gICAgfSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKGZsYXBIZWlnaHRCbG9jayArIGVuZEdhbWVCbG9jayArIGluY3JlbWVudFNjb3JlQmxvY2sgKyBwbGF5U291bmRCbG9jayArXG4gICAgICAgIHNldFNwZWVkQmxvY2sgKyBzZXRCYWNrZ3JvdW5kQmxvY2sgKyBzZXRQbGF5ZXJCbG9jayksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snLCBmbGFwSGVpZ2h0QmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZUdyb3VuZCcsIGVuZEdhbWVCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnLCBlbmRHYW1lQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScsIGluY3JlbWVudFNjb3JlQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJywgc2V0U3BlZWRCbG9jaylcbiAgfSxcblxuICAnOSc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbe1xuICAgICAgICB0ZXN0OiBmdW5jdGlvbiAoYmxvY2spIHtcbiAgICAgICAgICByZXR1cm4gYmxvY2sudHlwZSA9PT0gJ2ZsYXBweV9zZXRTY29yZSc7XG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6ICdmbGFwcHlfc2V0U2NvcmUnXG4gICAgICB9XVxuICAgIF0sXG4gICAgJ29ic3RhY2xlcyc6IHRydWUsXG4gICAgJ2dyb3VuZCc6IHRydWUsXG4gICAgJ3Njb3JlJzogdHJ1ZSxcbiAgICAnZnJlZVBsYXknOiBmYWxzZSxcbiAgICAnZ29hbCc6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIChGbGFwcHkuZ2FtZVN0YXRlID09PSBGbGFwcHkuR2FtZVN0YXRlcy5PVkVSKTtcbiAgICAgIH1cbiAgICB9LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoZmxhcEhlaWdodEJsb2NrICsgZW5kR2FtZUJsb2NrICsgaW5jcmVtZW50U2NvcmVCbG9jayArIHBsYXlTb3VuZEJsb2NrICtcbiAgICAgICAgc2V0U3BlZWRCbG9jayArIHNldEJhY2tncm91bmRCbG9jayArIHNldFBsYXllckJsb2NrICsgc2V0U2NvcmVCbG9jayksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snLCBmbGFwSGVpZ2h0QmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZUdyb3VuZCcsIGVuZEdhbWVCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUnLCBpbmNyZW1lbnRTY29yZUJsb2NrKSArXG4gICAgICBldmVudEJsb2NrKCd3aGVuX3J1bicsIHNldFNwZWVkQmxvY2spXG4gIH0sXG5cbiAgJzExJzoge1xuICAgIHNoYXJlYWJsZTogdHJ1ZSxcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgXSxcbiAgICAnb2JzdGFjbGVzJzogdHJ1ZSxcbiAgICAnZ3JvdW5kJzogdHJ1ZSxcbiAgICAnc2NvcmUnOiB0cnVlLFxuICAgICdmcmVlUGxheSc6IHRydWUsXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YihcbiAgICAgICAgZmxhcEhlaWdodEJsb2NrICtcbiAgICAgICAgcGxheVNvdW5kQmxvY2sgK1xuICAgICAgICBpbmNyZW1lbnRTY29yZUJsb2NrICtcbiAgICAgICAgZW5kR2FtZUJsb2NrICtcbiAgICAgICAgc2V0U3BlZWRCbG9jayArXG4gICAgICAgIHNldEJhY2tncm91bmRCbG9jayArXG4gICAgICAgIHNldFBsYXllckJsb2NrICtcbiAgICAgICAgc2V0T2JzdGFjbGVCbG9jayArXG4gICAgICAgIHNldEdyb3VuZEJsb2NrICtcbiAgICAgICAgc2V0R2FwSGVpZ2h0QmxvY2sgK1xuICAgICAgICBzZXRHcmF2aXR5QmxvY2sgK1xuICAgICAgICBzZXRTY29yZUJsb2NrXG4gICAgICApLFxuICAgICdzdGFydEJsb2Nrcyc6XG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNsaWNrJykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kJykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUnKSArXG4gICAgICBldmVudEJsb2NrKCd3aGVuX3J1bicpXG4gIH0sXG4gICdrMSc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgXSxcbiAgICAnb2JzdGFjbGVzJzogdHJ1ZSxcbiAgICAnZ3JvdW5kJzogdHJ1ZSxcbiAgICAnc2NvcmUnOiB0cnVlLFxuICAgICdmcmVlUGxheSc6IHRydWUsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKFxuICAgICAgICBmbGFwQmxvY2sgK1xuICAgICAgICBlbmRHYW1lQmxvY2sgK1xuICAgICAgICBzZXRCYWNrZ3JvdW5kQmxvY2sgK1xuICAgICAgICBzZXRQbGF5ZXJCbG9jayArXG4gICAgICAgIHNldE9ic3RhY2xlQmxvY2sgK1xuICAgICAgICBzZXRHcm91bmRCbG9jayArXG4gICAgICAgIHBsYXlTb3VuZEJsb2NrICtcbiAgICAgICAgZmxhcEhlaWdodEJsb2NrICtcbiAgICAgICAgc2V0U3BlZWRCbG9jayArXG4gICAgICAgIGluY3JlbWVudFNjb3JlQmxvY2sgK1xuICAgICAgICBzZXRHYXBIZWlnaHRCbG9jayArXG4gICAgICAgIHNldEdyYXZpdHlCbG9jayArXG4gICAgICAgIHNldFNjb3JlQmxvY2tcbiAgICAgICksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVHcm91bmQnKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZScpICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScpICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJylcbiAgfVxufTtcblxuXG5tb2R1bGUuZXhwb3J0cy5rMV8xID0ge1xuICAnaXNLMSc6IHRydWUsXG4gIGdyYXlPdXRVbmRlbGV0YWJsZUJsb2NrczogdHJ1ZSxcbiAgJ3JlcXVpcmVkQmxvY2tzJzogW10sXG4gICdvYnN0YWNsZXMnOiB0cnVlLFxuICAnZ3JvdW5kJzogdHJ1ZSxcbiAgJ3Njb3JlJzogdHJ1ZSxcbiAgJ2ZyZWVQbGF5JzogdHJ1ZSxcbiAgJ3NjYWxlJzoge1xuICAgICdzbmFwUmFkaXVzJzogMlxuICB9LFxuICAndG9vbGJveCc6ICcnLFxuICAnc3RhcnRCbG9ja3MnOlxuICAgIGFuY2hvcmVkQmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snLCBhbmNob3JlZEJsb2NrKCdmbGFwcHlfZmxhcCcpKSArXG4gICAgYW5jaG9yZWRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kJywgYW5jaG9yZWRCbG9jaygnZmxhcHB5X2VuZEdhbWUnKSkgK1xuICAgIGFuY2hvcmVkQmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZU9ic3RhY2xlJywgYW5jaG9yZWRCbG9jaygnZmxhcHB5X2VuZEdhbWUnKSkgK1xuICAgIGFuY2hvcmVkQmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScsIGFuY2hvcmVkQmxvY2soJ2ZsYXBweV9pbmNyZW1lbnRQbGF5ZXJTY29yZScpKSArXG4gICAgYW5jaG9yZWRCbG9jaygnd2hlbl9ydW4nLCBhbmNob3JlZEJsb2NrKCdmbGFwcHlfc2V0U3BlZWQnKSlcbn07XG5cbi8vIGZsYXAgdG8gZ29hbFxubW9kdWxlLmV4cG9ydHMuazFfMiA9IHV0aWxzLmV4dGVuZChtb2R1bGUuZXhwb3J0c1snMSddLCB7ICdpc0sxJzogdHJ1ZX0pO1xuXG4vLyBoaXQgZ3JvdW5kXG5tb2R1bGUuZXhwb3J0cy5rMV8zID0gdXRpbHMuZXh0ZW5kKG1vZHVsZS5leHBvcnRzWycyJ10sIHsgJ2lzSzEnOiB0cnVlfSk7XG5cbi8vIHNldCBzcGVlZFxubW9kdWxlLmV4cG9ydHMuazFfNCA9IHV0aWxzLmV4dGVuZChtb2R1bGUuZXhwb3J0c1snMyddLCB7ICdpc0sxJzogdHJ1ZX0pO1xuXG4vLyBjcmFzaCBpbnRvIG9ic3RhY2xlXG5tb2R1bGUuZXhwb3J0cy5rMV81ID0gdXRpbHMuZXh0ZW5kKG1vZHVsZS5leHBvcnRzWyc0J10sIHsgJ2lzSzEnOiB0cnVlfSk7XG5cbi8vIHBhc3MgdGhyb3VnaCBvYnN0YWNsZSwgc2NvcmUgYSBwb2ludFxubW9kdWxlLmV4cG9ydHMuazFfNiA9IHV0aWxzLmV4dGVuZChtb2R1bGUuZXhwb3J0c1snNSddLCB7ICdpc0sxJzogdHJ1ZX0pO1xuXG4vLyBzY29yZSBtdWx0aXBsZSBwb2ludHMgZm9yIGVhY2ggcGFzc1xubW9kdWxlLmV4cG9ydHMuazFfNyA9IHtcbiAgJ2lzSzEnOiB0cnVlLFxuICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgW3sndGVzdCc6ICdpbmNyZW1lbnRQbGF5ZXJTY29yZScsICd0eXBlJzogJ2ZsYXBweV9pbmNyZW1lbnRQbGF5ZXJTY29yZSd9XVxuICBdLFxuICAnZGVmYXVsdEZsYXAnOiAnU01BTEwnLFxuICAnb2JzdGFjbGVzJzogdHJ1ZSxcbiAgJ2dyb3VuZCc6IHRydWUsXG4gICdzY29yZSc6IHRydWUsXG4gICdmcmVlUGxheSc6IGZhbHNlLFxuICAnZ29hbCc6IHtcbiAgICAvLyB0b2RvIC0ga2luZCBvZiB1Z2x5IHRoYXQgd2UgZW5kIHVwIGxvb3BpbiB0aHJvdWdoIGFsbCBvYnN0YWNsZXMgdHdpY2UsXG4gICAgLy8gb25jZSB0byBjaGVjayBmb3Igc3VjY2VzcyBhbmQgYWdhaW4gdG8gY2hlY2sgZm9yIGZhaWx1cmVcbiAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgaW5zaWRlT2JzdGFjbGUgPSBmYWxzZTtcbiAgICAgIEZsYXBweS5vYnN0YWNsZXMuZm9yRWFjaChmdW5jdGlvbiAob2JzdGFjbGUpIHtcbiAgICAgICAgaWYgKCFvYnN0YWNsZS5oaXRBdmF0YXIgJiYgb2JzdGFjbGUuY29udGFpbnNBdmF0YXIoKSkge1xuICAgICAgICAgIGluc2lkZU9ic3RhY2xlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gaW5zaWRlT2JzdGFjbGUgJiYgRmxhcHB5LnBsYXllclNjb3JlID4gMTtcbiAgICB9LFxuICAgIGZhaWx1cmVDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpbnNpZGVPYnN0YWNsZSA9IGZhbHNlO1xuICAgICAgRmxhcHB5Lm9ic3RhY2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChvYnN0YWNsZSkge1xuICAgICAgICBpZiAoIW9ic3RhY2xlLmhpdEF2YXRhciAmJiBvYnN0YWNsZS5jb250YWluc0F2YXRhcigpKSB7XG4gICAgICAgICAgaW5zaWRlT2JzdGFjbGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBpbnNpZGVPYnN0YWNsZSAmJiBGbGFwcHkucGxheWVyU2NvcmUgPD0gMTtcbiAgICB9XG4gIH0sXG4gICdzY2FsZSc6IHtcbiAgICAnc25hcFJhZGl1cyc6IDJcbiAgfSxcbiAgJ3Rvb2xib3gnOlxuICAgIHRiKGZsYXBCbG9jayArIGVuZEdhbWVCbG9jayArIGluY3JlbWVudFNjb3JlQmxvY2sgKyBwbGF5U291bmRCbG9jayArIHNldFNwZWVkQmxvY2spLFxuICAnc3RhcnRCbG9ja3MnOlxuICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snLCBmbGFwQmxvY2spICtcbiAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUnKSArXG4gICAgZXZlbnRCbG9jaygnd2hlbl9ydW4nLCBzZXRTcGVlZEJsb2NrKVxufTtcblxuLy8gY2hhbmdlIHRoZSBzY2VuZVxubW9kdWxlLmV4cG9ydHMuazFfOCA9IHV0aWxzLmV4dGVuZChtb2R1bGUuZXhwb3J0c1snNyddLCB7XG4gICdpc0sxJzogdHJ1ZSxcbiAgLy8gb3ZlcnJpZGUgcmVndWxhciBmbGFwcHkgc28gdGhhdCB3ZSBkb250IHVzZSB2YXJpYWJsZSBmbGFwIGJsb2NrXG4gICd0b29sYm94JzpcbiAgICB0YihmbGFwQmxvY2sgKyBlbmRHYW1lQmxvY2sgKyBpbmNyZW1lbnRTY29yZUJsb2NrICsgcGxheVNvdW5kQmxvY2sgK1xuICAgICAgc2V0U3BlZWRCbG9jayArIHNldEJhY2tncm91bmRCbG9jayksXG4gICdzdGFydEJsb2Nrcyc6XG4gICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycsIGZsYXBCbG9jaykgK1xuICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZUdyb3VuZCcsIGVuZEdhbWVCbG9jaykgK1xuICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZU9ic3RhY2xlJywgZW5kR2FtZUJsb2NrKSArXG4gICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5FbnRlck9ic3RhY2xlJywgaW5jcmVtZW50U2NvcmVCbG9jaykgK1xuICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJywgc2V0U3BlZWRCbG9jaylcbn0pO1xuXG4vLyBjaGFuZ2luZyB0aGUgcGxheWVyXG5tb2R1bGUuZXhwb3J0cy5rMV85ID0ge1xuICAnaXNLMSc6IHRydWUsXG4gICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICBbeyd0ZXN0JzogJ3NldFBsYXllcicsICd0eXBlJzogJ2ZsYXBweV9zZXRQbGF5ZXInfV1cbiAgXSxcbiAgJ29ic3RhY2xlcyc6IHRydWUsXG4gICdncm91bmQnOiB0cnVlLFxuICAnc2NvcmUnOiB0cnVlLFxuICAnZnJlZVBsYXknOiBmYWxzZSxcbiAgJ2dvYWwnOiB7XG4gICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIChGbGFwcHkuZ2FtZVN0YXRlID09PSBGbGFwcHkuR2FtZVN0YXRlcy5PVkVSKTtcbiAgICB9XG4gIH0sXG4gICdzY2FsZSc6IHtcbiAgICAnc25hcFJhZGl1cyc6IDJcbiAgfSxcbiAgJ3Rvb2xib3gnOlxuICAgIHRiKGZsYXBCbG9jayArIGVuZEdhbWVCbG9jayArIGluY3JlbWVudFNjb3JlQmxvY2sgKyBwbGF5U291bmRCbG9jayArXG4gICAgICBzZXRTcGVlZEJsb2NrICsgc2V0QmFja2dyb3VuZEJsb2NrICsgc2V0UGxheWVyQmxvY2spLFxuICAnc3RhcnRCbG9ja3MnOlxuICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snLCBmbGFwQmxvY2spICtcbiAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVHcm91bmQnLCBlbmRHYW1lQmxvY2spICtcbiAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZScsIGVuZEdhbWVCbG9jaykgK1xuICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScsIGluY3JlbWVudFNjb3JlQmxvY2spICtcbiAgICBldmVudEJsb2NrKCd3aGVuX3J1bicsIHNldFNwZWVkQmxvY2spXG59O1xuIiwiLyoqXG4gKiBCbG9ja2x5IEFwcDogRmxhcHB5XG4gKlxuICogQ29weXJpZ2h0IDIwMTMgQ29kZS5vcmdcbiAqXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xudmFyIGZsYXBweU1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuLi9za2lucycpO1xudmFyIGNvZGVnZW4gPSByZXF1aXJlKCcuLi9jb2RlZ2VuJyk7XG52YXIgYXBpID0gcmVxdWlyZSgnLi9hcGknKTtcbnZhciBwYWdlID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3BhZ2UuaHRtbC5lanMnKTtcbnZhciBkb20gPSByZXF1aXJlKCcuLi9kb20nKTtcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBkcm9wbGV0VXRpbHMgPSByZXF1aXJlKCcuLi9kcm9wbGV0VXRpbHMnKTtcblxudmFyIFJlc3VsdFR5cGUgPSBzdHVkaW9BcHAuUmVzdWx0VHlwZTtcbnZhciBUZXN0UmVzdWx0cyA9IHN0dWRpb0FwcC5UZXN0UmVzdWx0cztcblxuLyoqXG4gKiBDcmVhdGUgYSBuYW1lc3BhY2UgZm9yIHRoZSBhcHBsaWNhdGlvbi5cbiAqL1xudmFyIEZsYXBweSA9IG1vZHVsZS5leHBvcnRzO1xuXG5GbGFwcHkuR2FtZVN0YXRlcyA9IHtcbiAgV0FJVElORzogMCxcbiAgQUNUSVZFOiAxLFxuICBFTkRJTkc6IDIsXG4gIE9WRVI6IDNcbn07XG5cbkZsYXBweS5nYW1lU3RhdGUgPSBGbGFwcHkuR2FtZVN0YXRlcy5XQUlUSU5HO1xuXG5GbGFwcHkuY2xpY2tQZW5kaW5nID0gZmFsc2U7XG5cbkZsYXBweS5hdmF0YXJWZWxvY2l0eSA9IDA7XG5cbnZhciBsZXZlbDtcbnZhciBza2luO1xuXG5GbGFwcHkub2JzdGFjbGVzID0gW107XG5cbi8qKlxuICogTWlsbGlzZWNvbmRzIGJldHdlZW4gZWFjaCBhbmltYXRpb24gZnJhbWUuXG4gKi9cbnZhciBzdGVwU3BlZWQ7XG5cbi8vIHdoZXRoZXIgdG8gc2hvdyBHZXQgUmVhZHkgYW5kIEdhbWUgT3ZlclxudmFyIGluZm9UZXh0O1xuXG4vL1RPRE86IE1ha2UgY29uZmlndXJhYmxlLlxuc3R1ZGlvQXBwLnNldENoZWNrRm9yRW1wdHlCbG9ja3ModHJ1ZSk7XG5cbnZhciByYW5kb21PYnN0YWNsZUhlaWdodCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1pbiA9IEZsYXBweS5NSU5fT0JTVEFDTEVfSEVJR0hUO1xuICB2YXIgbWF4ID0gRmxhcHB5Lk1BWkVfSEVJR0hUIC0gRmxhcHB5LkdST1VORF9IRUlHSFQgLSBGbGFwcHkuTUlOX09CU1RBQ0xFX0hFSUdIVCAtIEZsYXBweS5HQVBfU0laRTtcbiAgcmV0dXJuIE1hdGguZmxvb3IoKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW4pO1xufTtcblxuLy9UaGUgbnVtYmVyIG9mIGJsb2NrcyB0byBzaG93IGFzIGZlZWRiYWNrLlxuXG4vLyBEZWZhdWx0IFNjYWxpbmdzXG5GbGFwcHkuc2NhbGUgPSB7XG4gICdzbmFwUmFkaXVzJzogMSxcbiAgJ3N0ZXBTcGVlZCc6IDMzXG59O1xuXG52YXIgdHdpdHRlck9wdGlvbnMgPSB7XG4gIHRleHQ6IGZsYXBweU1zZy5zaGFyZUZsYXBweVR3aXR0ZXIoKSxcbiAgaGFzaHRhZzogXCJGbGFwcHlDb2RlXCJcbn07XG5cbnZhciBBVkFUQVJfSEVJR0hUID0gY29uc3RhbnRzLkFWQVRBUl9IRUlHSFQ7XG52YXIgQVZBVEFSX1dJRFRIID0gY29uc3RhbnRzLkFWQVRBUl9XSURUSDtcbnZhciBBVkFUQVJfWV9PRkZTRVQgPSBjb25zdGFudHMuQVZBVEFSX1lfT0ZGU0VUO1xuXG52YXIgbG9hZExldmVsID0gZnVuY3Rpb24oKSB7XG4gIC8vIExvYWQgbWFwcy5cbiAgaW5mb1RleHQgPSB1dGlscy52YWx1ZU9yKGxldmVsLmluZm9UZXh0LCB0cnVlKTtcbiAgaWYgKCFpbmZvVGV4dCkge1xuICAgIEZsYXBweS5nYW1lU3RhdGUgPSBGbGFwcHkuR2FtZVN0YXRlcy5BQ1RJVkU7XG4gIH1cblxuICAvLyBPdmVycmlkZSBzY2FsYXJzLlxuICBmb3IgKHZhciBrZXkgaW4gbGV2ZWwuc2NhbGUpIHtcbiAgICBGbGFwcHkuc2NhbGVba2V5XSA9IGxldmVsLnNjYWxlW2tleV07XG4gIH1cblxuICAvLyBIZWlnaHQgYW5kIHdpZHRoIG9mIHRoZSBnb2FsIGFuZCBvYnN0YWNsZXMuXG4gIEZsYXBweS5NQVJLRVJfSEVJR0hUID0gNDM7XG4gIEZsYXBweS5NQVJLRVJfV0lEVEggPSA1MDtcblxuICBGbGFwcHkuTUFaRV9XSURUSCA9IDQwMDtcbiAgRmxhcHB5Lk1BWkVfSEVJR0hUID0gNDAwO1xuXG4gIEZsYXBweS5HUk9VTkRfV0lEVEggPSA0MDA7XG4gIEZsYXBweS5HUk9VTkRfSEVJR0hUID0gNDg7XG5cbiAgRmxhcHB5LkdPQUxfU0laRSA9IDU1O1xuXG4gIEZsYXBweS5PQlNUQUNMRV9XSURUSCA9IDUyO1xuICBGbGFwcHkuT0JTVEFDTEVfSEVJR0hUID0gMzIwO1xuICBGbGFwcHkuTUlOX09CU1RBQ0xFX0hFSUdIVCA9IDQ4O1xuXG4gIEZsYXBweS5zZXRHYXBIZWlnaHQoYXBpLkdhcEhlaWdodC5OT1JNQUwpO1xuXG4gIEZsYXBweS5PQlNUQUNMRV9TUEFDSU5HID0gMjUwOyAvLyBudW1iZXIgb2YgaG9yaXpvbnRhbCBwaXhlbHMgYmV0d2VlbiB0aGUgc3RhcnQgb2Ygb2JzdGFjbGVzXG5cbiAgdmFyIG51bU9ic3RhY2xlcyA9IDIgKiBGbGFwcHkuTUFaRV9XSURUSCAvIEZsYXBweS5PQlNUQUNMRV9TUEFDSU5HO1xuICBpZiAoIWxldmVsLm9ic3RhY2xlcykge1xuICAgIG51bU9ic3RhY2xlcyA9IDA7XG4gIH1cblxuICB2YXIgcmVzZXRPYnN0YWNsZSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLmdhcFN0YXJ0ID0gcmFuZG9tT2JzdGFjbGVIZWlnaHQoKTtcbiAgICB0aGlzLmhpdEF2YXRhciA9IGZhbHNlO1xuICB9O1xuXG4gIHZhciBjb250YWluc0F2YXRhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmxhcHB5UmlnaHQgPSBGbGFwcHkuYXZhdGFyWCArIEFWQVRBUl9XSURUSDtcbiAgICB2YXIgZmxhcHB5Qm90dG9tID0gRmxhcHB5LmF2YXRhclkgKyBBVkFUQVJfSEVJR0hUO1xuICAgIHZhciBvYnN0YWNsZVJpZ2h0ID0gdGhpcy54ICsgRmxhcHB5Lk9CU1RBQ0xFX1dJRFRIO1xuICAgIHZhciBvYnN0YWNsZUJvdHRvbSA9IHRoaXMuZ2FwU3RhcnQgKyBGbGFwcHkuR0FQX1NJWkU7XG4gICAgcmV0dXJuIChmbGFwcHlSaWdodCA+IHRoaXMueCAmJlxuICAgICAgZmxhcHB5UmlnaHQgPCBvYnN0YWNsZVJpZ2h0ICYmXG4gICAgICBGbGFwcHkuYXZhdGFyWSA+IHRoaXMuZ2FwU3RhcnQgJiZcbiAgICAgIGZsYXBweUJvdHRvbSA8IG9ic3RhY2xlQm90dG9tKTtcbiAgfTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bU9ic3RhY2xlczsgaSsrKSB7XG4gICAgRmxhcHB5Lm9ic3RhY2xlcy5wdXNoKHtcbiAgICAgIHg6IEZsYXBweS5NQVpFX1dJRFRIICogMS41ICsgaSAqIEZsYXBweS5PQlNUQUNMRV9TUEFDSU5HLFxuICAgICAgZ2FwU3RhcnQ6IHJhbmRvbU9ic3RhY2xlSGVpZ2h0KCksIC8vIHkgY29vcmRpbmF0ZSBvZiB0aGUgdG9wIG9mIHRoZSBnYXBcbiAgICAgIGhpdEF2YXRhcjogZmFsc2UsXG4gICAgICByZXNldDogcmVzZXRPYnN0YWNsZSxcbiAgICAgIGNvbnRhaW5zQXZhdGFyOiBjb250YWluc0F2YXRhclxuICAgIH0pO1xuICB9XG59O1xuXG52YXIgZHJhd01hcCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3ZnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z0ZsYXBweScpO1xuICB2YXIgaSwgeCwgeSwgaywgdGlsZTtcblxuICAvLyBBZGp1c3Qgb3V0ZXIgZWxlbWVudCBzaXplLlxuICBzdmcuc2V0QXR0cmlidXRlKCd3aWR0aCcsIEZsYXBweS5NQVpFX1dJRFRIKTtcbiAgc3ZnLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgRmxhcHB5Lk1BWkVfSEVJR0hUKTtcblxuICAvLyBBZGp1c3QgdmlzdWFsaXphdGlvbkNvbHVtbiB3aWR0aC5cbiAgdmFyIHZpc3VhbGl6YXRpb25Db2x1bW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvbkNvbHVtbicpO1xuICB2aXN1YWxpemF0aW9uQ29sdW1uLnN0eWxlLndpZHRoID0gRmxhcHB5Lk1BWkVfV0lEVEggKyAncHgnO1xuXG4gIGlmIChza2luLmJhY2tncm91bmQpIHtcbiAgICB0aWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5iYWNrZ3JvdW5kKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZSgnaWQnLCAnYmFja2dyb3VuZCcpO1xuICAgIHRpbGUuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBGbGFwcHkuTUFaRV9IRUlHSFQpO1xuICAgIHRpbGUuc2V0QXR0cmlidXRlKCd3aWR0aCcsIEZsYXBweS5NQVpFX1dJRFRIKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZSgneCcsIDApO1xuICAgIHRpbGUuc2V0QXR0cmlidXRlKCd5JywgMCk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKHRpbGUpO1xuICB9XG5cbiAgLy8gQWRkIG9ic3RhY2xlc1xuICBGbGFwcHkub2JzdGFjbGVzLmZvckVhY2ggKGZ1bmN0aW9uIChvYnN0YWNsZSwgaW5kZXgpIHtcbiAgICB2YXIgb2JzdGFjbGVUb3BJY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICBvYnN0YWNsZVRvcEljb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLm9ic3RhY2xlX3RvcCk7XG4gICAgb2JzdGFjbGVUb3BJY29uLnNldEF0dHJpYnV0ZSgnaWQnLCAnb2JzdGFjbGVfdG9wJyArIGluZGV4KTtcbiAgICBvYnN0YWNsZVRvcEljb24uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBGbGFwcHkuT0JTVEFDTEVfSEVJR0hUKTtcbiAgICBvYnN0YWNsZVRvcEljb24uc2V0QXR0cmlidXRlKCd3aWR0aCcsIEZsYXBweS5PQlNUQUNMRV9XSURUSCk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKG9ic3RhY2xlVG9wSWNvbik7XG5cbiAgICB2YXIgb2JzdGFjbGVCb3R0b21JY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICBvYnN0YWNsZUJvdHRvbUljb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLm9ic3RhY2xlX2JvdHRvbSk7XG4gICAgb2JzdGFjbGVCb3R0b21JY29uLnNldEF0dHJpYnV0ZSgnaWQnLCAnb2JzdGFjbGVfYm90dG9tJyArIGluZGV4KTtcbiAgICBvYnN0YWNsZUJvdHRvbUljb24uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBGbGFwcHkuT0JTVEFDTEVfSEVJR0hUKTtcbiAgICBvYnN0YWNsZUJvdHRvbUljb24uc2V0QXR0cmlidXRlKCd3aWR0aCcsIEZsYXBweS5PQlNUQUNMRV9XSURUSCk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKG9ic3RhY2xlQm90dG9tSWNvbik7XG4gIH0pO1xuXG4gIGlmIChsZXZlbC5ncm91bmQpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgRmxhcHB5Lk1BWkVfV0lEVEggLyBGbGFwcHkuR1JPVU5EX1dJRFRIICsgMTsgaSsrKSB7XG4gICAgICB2YXIgZ3JvdW5kSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2ltYWdlJyk7XG4gICAgICBncm91bmRJY29uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5ncm91bmQpO1xuICAgICAgZ3JvdW5kSWNvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2dyb3VuZCcgKyBpKTtcbiAgICAgIGdyb3VuZEljb24uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBGbGFwcHkuR1JPVU5EX0hFSUdIVCk7XG4gICAgICBncm91bmRJY29uLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBGbGFwcHkuR1JPVU5EX1dJRFRIKTtcbiAgICAgIGdyb3VuZEljb24uc2V0QXR0cmlidXRlKCd4JywgMCk7XG4gICAgICBncm91bmRJY29uLnNldEF0dHJpYnV0ZSgneScsIEZsYXBweS5NQVpFX0hFSUdIVCAtIEZsYXBweS5HUk9VTkRfSEVJR0hUKTtcbiAgICAgIHN2Zy5hcHBlbmRDaGlsZChncm91bmRJY29uKTtcbiAgICB9XG4gIH1cblxuICBpZiAobGV2ZWwuZ29hbCAmJiBsZXZlbC5nb2FsLnN0YXJ0WCkge1xuICAgIHZhciBnb2FsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICBnb2FsLnNldEF0dHJpYnV0ZSgnaWQnLCAnZ29hbCcpO1xuICAgIGdvYWwuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5nb2FsKTtcbiAgICBnb2FsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgRmxhcHB5LkdPQUxfU0laRSk7XG4gICAgZ29hbC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgRmxhcHB5LkdPQUxfU0laRSk7XG4gICAgZ29hbC5zZXRBdHRyaWJ1dGUoJ3gnLCBsZXZlbC5nb2FsLnN0YXJ0WCk7XG4gICAgZ29hbC5zZXRBdHRyaWJ1dGUoJ3knLCBsZXZlbC5nb2FsLnN0YXJ0WSk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKGdvYWwpO1xuICB9XG5cbiAgdmFyIGF2YXRBcmNsaXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdjbGlwUGF0aCcpO1xuICBhdmF0QXJjbGlwLnNldEF0dHJpYnV0ZSgnaWQnLCAnYXZhdEFyY2xpcFBhdGgnKTtcbiAgdmFyIGF2YXRBcmNsaXBSZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAncmVjdCcpO1xuICBhdmF0QXJjbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2F2YXRBcmNsaXBSZWN0Jyk7XG4gIGF2YXRBcmNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBGbGFwcHkuTUFaRV9XSURUSCk7XG4gIGF2YXRBcmNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgRmxhcHB5Lk1BWkVfSEVJR0hUIC0gRmxhcHB5LkdST1VORF9IRUlHSFQpO1xuICBhdmF0QXJjbGlwLmFwcGVuZENoaWxkKGF2YXRBcmNsaXBSZWN0KTtcbiAgc3ZnLmFwcGVuZENoaWxkKGF2YXRBcmNsaXApO1xuXG4gIC8vIEFkZCBhdmF0YXIuXG4gIHZhciBhdmF0YXJJY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgYXZhdGFySWNvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2F2YXRhcicpO1xuICBhdmF0YXJJY29uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLmF2YXRhcik7XG4gIGF2YXRhckljb24uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBBVkFUQVJfSEVJR0hUKTtcbiAgYXZhdGFySWNvbi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgQVZBVEFSX1dJRFRIKTtcbiAgaWYgKGxldmVsLmdyb3VuZCkge1xuICAgIGF2YXRhckljb24uc2V0QXR0cmlidXRlKCdjbGlwLXBhdGgnLCAndXJsKCNhdmF0QXJjbGlwUGF0aCknKTtcbiAgfVxuICBzdmcuYXBwZW5kQ2hpbGQoYXZhdGFySWNvbik7XG5cbiAgdmFyIGluc3RydWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2ltYWdlJyk7XG4gIGluc3RydWN0aW9ucy5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uaW5zdHJ1Y3Rpb25zKTtcbiAgaW5zdHJ1Y3Rpb25zLnNldEF0dHJpYnV0ZSgnaWQnLCAnaW5zdHJ1Y3Rpb25zJyk7XG4gIGluc3RydWN0aW9ucy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIDUwKTtcbiAgaW5zdHJ1Y3Rpb25zLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAxNTkpO1xuICBpbnN0cnVjdGlvbnMuc2V0QXR0cmlidXRlKCd4JywgMTEwKTtcbiAgaW5zdHJ1Y3Rpb25zLnNldEF0dHJpYnV0ZSgneScsIDE3MCk7XG4gIGluc3RydWN0aW9ucy5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIHN2Zy5hcHBlbmRDaGlsZChpbnN0cnVjdGlvbnMpO1xuXG4gIHZhciBnZXRyZWFkeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2ltYWdlJyk7XG4gIGdldHJlYWR5LnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5nZXRyZWFkeSk7XG4gIGdldHJlYWR5LnNldEF0dHJpYnV0ZSgnaWQnLCAnZ2V0cmVhZHknKTtcbiAgZ2V0cmVhZHkuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCA1MCk7XG4gIGdldHJlYWR5LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAxODMpO1xuICBnZXRyZWFkeS5zZXRBdHRyaWJ1dGUoJ3gnLCAxMDgpO1xuICBnZXRyZWFkeS5zZXRBdHRyaWJ1dGUoJ3knLCA4MCk7XG4gIGdldHJlYWR5LnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgc3ZnLmFwcGVuZENoaWxkKGdldHJlYWR5KTtcblxuICB2YXIgY2xpY2tydW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICBjbGlja3J1bi5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uY2xpY2tydW4pO1xuICBjbGlja3J1bi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2NsaWNrcnVuJyk7XG4gIGNsaWNrcnVuLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgNDEpO1xuICBjbGlja3J1bi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgMjczKTtcbiAgY2xpY2tydW4uc2V0QXR0cmlidXRlKCd4JywgNjQpO1xuICBjbGlja3J1bi5zZXRBdHRyaWJ1dGUoJ3knLCAyMDApO1xuICBjbGlja3J1bi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJpbGUnKTtcbiAgc3ZnLmFwcGVuZENoaWxkKGNsaWNrcnVuKTtcblxuICB2YXIgZ2FtZW92ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICBnYW1lb3Zlci5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uZ2FtZW92ZXIpO1xuICBnYW1lb3Zlci5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2dhbWVvdmVyJyk7XG4gIGdhbWVvdmVyLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgNDEpO1xuICBnYW1lb3Zlci5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgMTkyKTtcbiAgZ2FtZW92ZXIuc2V0QXR0cmlidXRlKCd4JywgMTA0KTtcbiAgZ2FtZW92ZXIuc2V0QXR0cmlidXRlKCd5JywgODApO1xuICBnYW1lb3Zlci5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIHN2Zy5hcHBlbmRDaGlsZChnYW1lb3Zlcik7XG5cbiAgdmFyIHNjb3JlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAndGV4dCcpO1xuICBzY29yZS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3Njb3JlJyk7XG4gIHNjb3JlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnZmxhcHB5LXNjb3JlJyk7XG4gIHNjb3JlLnNldEF0dHJpYnV0ZSgneCcsIEZsYXBweS5NQVpFX1dJRFRIIC8gMik7XG4gIHNjb3JlLnNldEF0dHJpYnV0ZSgneScsIDYwKTtcbiAgc2NvcmUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJzAnKSk7XG4gIHNjb3JlLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgc3ZnLmFwcGVuZENoaWxkKHNjb3JlKTtcblxuICB2YXIgY2xpY2tSZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAncmVjdCcpO1xuICBjbGlja1JlY3Quc2V0QXR0cmlidXRlKCd3aWR0aCcsIEZsYXBweS5NQVpFX1dJRFRIKTtcbiAgY2xpY2tSZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgRmxhcHB5Lk1BWkVfSEVJR0hUKTtcbiAgY2xpY2tSZWN0LnNldEF0dHJpYnV0ZSgnZmlsbC1vcGFjaXR5JywgMCk7XG4gIGNsaWNrUmVjdC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24gKGUpIHtcbiAgICBGbGFwcHkub25Nb3VzZURvd24oZSk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpOyAvLyBkb24ndCB3YW50IHRvIHNlZSBtb3VzZSBkb3duXG4gIH0pO1xuICBjbGlja1JlY3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24gKGUpIHtcbiAgICBGbGFwcHkub25Nb3VzZURvd24oZSk7XG4gIH0pO1xuICBzdmcuYXBwZW5kQ2hpbGQoY2xpY2tSZWN0KTtcbn07XG5cbkZsYXBweS5jYWxjRGlzdGFuY2UgPSBmdW5jdGlvbih4RGlzdCwgeURpc3QpIHtcbiAgcmV0dXJuIE1hdGguc3FydCh4RGlzdCAqIHhEaXN0ICsgeURpc3QgKiB5RGlzdCk7XG59O1xuXG52YXIgZXNzZW50aWFsbHlFcXVhbCA9IGZ1bmN0aW9uKGZsb2F0MSwgZmxvYXQyLCBvcHRfdmFyaWFuY2UpIHtcbiAgdmFyIHZhcmlhbmNlID0gb3B0X3ZhcmlhbmNlIHx8IDAuMDE7XG4gIHJldHVybiAoTWF0aC5hYnMoZmxvYXQxIC0gZmxvYXQyKSA8IHZhcmlhbmNlKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgdG8gc2VlIGlmIGF2YXRhciBpcyBpbiBjb2xsaXNpb24gd2l0aCBnaXZlbiBvYnN0YWNsZVxuICogQHBhcmFtIG9ic3RhY2xlIE9iamVjdCA6IFRoZSBvYnN0YWNsZSBvYmplY3Qgd2UncmUgY2hlY2tpbmdcbiAqL1xudmFyIGNoZWNrRm9yT2JzdGFjbGVDb2xsaXNpb24gPSBmdW5jdGlvbiAob2JzdGFjbGUpIHtcbiAgdmFyIGluc2lkZU9ic3RhY2xlQ29sdW1uID0gRmxhcHB5LmF2YXRhclggKyBBVkFUQVJfV0lEVEggPj0gb2JzdGFjbGUueCAmJlxuICAgIEZsYXBweS5hdmF0YXJYIDw9IG9ic3RhY2xlLnggKyBGbGFwcHkuT0JTVEFDTEVfV0lEVEg7XG4gIGlmIChpbnNpZGVPYnN0YWNsZUNvbHVtbiAmJiAoRmxhcHB5LmF2YXRhclkgPD0gb2JzdGFjbGUuZ2FwU3RhcnQgfHxcbiAgICBGbGFwcHkuYXZhdGFyWSArIEFWQVRBUl9IRUlHSFQgPj0gb2JzdGFjbGUuZ2FwU3RhcnQgKyBGbGFwcHkuR0FQX1NJWkUpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuRmxhcHB5LmFjdGl2ZVRpY2tzID0gZnVuY3Rpb24gKCkge1xuICBpZiAoRmxhcHB5LmZpcnN0QWN0aXZlVGljayA8IDApIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHJldHVybiAoRmxhcHB5LnRpY2tDb3VudCAtIEZsYXBweS5maXJzdEFjdGl2ZVRpY2spO1xufTtcblxuLyoqXG4gKiBXZSB3YW50IHRvIHN3YWxsb3cgZXhjZXB0aW9ucyB3aGVuIGV4ZWN1dGluZyB1c2VyIGdlbmVyYXRlZCBjb2RlLiBUaGlzIHByb3ZpZGVzXG4gKiBhIHNpbmdsZSBwbGFjZSB0byBkbyBzby5cbiAqL1xuRmxhcHB5LmNhbGxVc2VyR2VuZXJhdGVkQ29kZSA9IGZ1bmN0aW9uIChmbikge1xuICB0cnkge1xuICAgIGZuLmNhbGwoRmxhcHB5LCBzdHVkaW9BcHAsIGFwaSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBzd2FsbG93IGVycm9yLiBzaG91bGQgd2UgYWxzbyBsb2cgdGhpcyBzb21ld2hlcmU/XG4gICAgaWYgKGNvbnNvbGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIH1cbiAgfVxufTtcblxuXG5GbGFwcHkub25UaWNrID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhdmF0YXJXYXNBYm92ZUdyb3VuZCwgYXZhdGFySXNBYm92ZUdyb3VuZDtcblxuICBpZiAoRmxhcHB5LmZpcnN0QWN0aXZlVGljayA8IDAgJiYgRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuQUNUSVZFKSB7XG4gICAgRmxhcHB5LmZpcnN0QWN0aXZlVGljayA9IEZsYXBweS50aWNrQ291bnQ7XG4gIH1cblxuICBGbGFwcHkudGlja0NvdW50Kys7XG5cbiAgaWYgKEZsYXBweS50aWNrQ291bnQgPT09IDEpIHtcbiAgICBGbGFwcHkuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEZsYXBweS53aGVuUnVuQnV0dG9uKTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBjbGlja1xuICBpZiAoRmxhcHB5LmNsaWNrUGVuZGluZyAmJiBGbGFwcHkuZ2FtZVN0YXRlIDw9IEZsYXBweS5HYW1lU3RhdGVzLkFDVElWRSkge1xuICAgIEZsYXBweS5jYWxsVXNlckdlbmVyYXRlZENvZGUoRmxhcHB5LndoZW5DbGljayk7XG4gICAgRmxhcHB5LmNsaWNrUGVuZGluZyA9IGZhbHNlO1xuICB9XG5cbiAgYXZhdGFyV2FzQWJvdmVHcm91bmQgPSAoRmxhcHB5LmF2YXRhclkgKyBBVkFUQVJfSEVJR0hUKSA8XG4gICAgKEZsYXBweS5NQVpFX0hFSUdIVCAtIEZsYXBweS5HUk9VTkRfSEVJR0hUKTtcblxuICAvLyBBY3Rpb24gZG9lc24ndCBzdGFydCB1bnRpbCB1c2VyJ3MgZmlyc3QgY2xpY2tcbiAgaWYgKEZsYXBweS5nYW1lU3RhdGUgPT09IEZsYXBweS5HYW1lU3RhdGVzLkFDVElWRSkge1xuICAgIC8vIFVwZGF0ZSBhdmF0YXIncyB2ZXJ0aWNhbCBwb3NpdGlvblxuICAgIEZsYXBweS5hdmF0YXJWZWxvY2l0eSArPSBGbGFwcHkuZ3Jhdml0eTtcbiAgICBGbGFwcHkuYXZhdGFyWSA9IEZsYXBweS5hdmF0YXJZICsgRmxhcHB5LmF2YXRhclZlbG9jaXR5O1xuXG4gICAgLy8gbmV2ZXIgbGV0IHRoZSBhdmF0YXIgZ28gdG9vIGZhciBvZmYgdGhlIHRvcCBvciBib3R0b21cbiAgICB2YXIgYm90dG9tTGltaXQgPSBsZXZlbC5ncm91bmQgP1xuICAgICAgKEZsYXBweS5NQVpFX0hFSUdIVCAtIEZsYXBweS5HUk9VTkRfSEVJR0hUIC0gQVZBVEFSX0hFSUdIVCArIDEpIDpcbiAgICAgIChGbGFwcHkuTUFaRV9IRUlHSFQgKiAxLjUpO1xuXG4gICAgRmxhcHB5LmF2YXRhclkgPSBNYXRoLm1pbihGbGFwcHkuYXZhdGFyWSwgYm90dG9tTGltaXQpO1xuICAgIEZsYXBweS5hdmF0YXJZID0gTWF0aC5tYXgoRmxhcHB5LmF2YXRhclksIEZsYXBweS5NQVpFX0hFSUdIVCAqIC0wLjUpO1xuXG4gICAgLy8gVXBkYXRlIG9ic3RhY2xlc1xuICAgIEZsYXBweS5vYnN0YWNsZXMuZm9yRWFjaChmdW5jdGlvbiAob2JzdGFjbGUsIGluZGV4KSB7XG4gICAgICB2YXIgd2FzUmlnaHRPZkF2YXRhciA9IG9ic3RhY2xlLnggPiAoRmxhcHB5LmF2YXRhclggKyBBVkFUQVJfV0lEVEgpO1xuXG4gICAgICBvYnN0YWNsZS54IC09IEZsYXBweS5TUEVFRDtcblxuICAgICAgdmFyIGlzUmlnaHRPZkF2YXRhciA9IG9ic3RhY2xlLnggPiAoRmxhcHB5LmF2YXRhclggKyBBVkFUQVJfV0lEVEgpO1xuICAgICAgaWYgKHdhc1JpZ2h0T2ZBdmF0YXIgJiYgIWlzUmlnaHRPZkF2YXRhcikge1xuICAgICAgICBpZiAoRmxhcHB5LmF2YXRhclkgPiBvYnN0YWNsZS5nYXBTdGFydCAmJlxuICAgICAgICAgIChGbGFwcHkuYXZhdGFyWSArIEFWQVRBUl9IRUlHSFQgPCBvYnN0YWNsZS5nYXBTdGFydCArIEZsYXBweS5HQVBfU0laRSkpIHtcbiAgICAgICAgICBGbGFwcHkuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEZsYXBweS53aGVuRW50ZXJPYnN0YWNsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFvYnN0YWNsZS5oaXRBdmF0YXIgJiYgY2hlY2tGb3JPYnN0YWNsZUNvbGxpc2lvbihvYnN0YWNsZSkpIHtcbiAgICAgICAgb2JzdGFjbGUuaGl0QXZhdGFyID0gdHJ1ZTtcbiAgICAgICAgdHJ5IHtGbGFwcHkud2hlbkNvbGxpZGVPYnN0YWNsZShzdHVkaW9BcHAsIGFwaSk7IH0gY2F0Y2ggKGUpIHsgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiBvYnN0YWNsZSBtb3ZlcyBvZmYgbGVmdCBzaWRlLCByZXB1cnBvc2UgYXMgYSBuZXcgb2JzdGFjbGUgdG8gb3VyIHJpZ2h0XG4gICAgICB2YXIgbnVtT2JzdGFjbGVzID0gRmxhcHB5Lm9ic3RhY2xlcy5sZW5ndGg7XG4gICAgICB2YXIgcHJldmlvdXNPYnN0YWNsZUluZGV4ID0gKGluZGV4IC0gMSArIG51bU9ic3RhY2xlcyApICUgbnVtT2JzdGFjbGVzO1xuICAgICAgaWYgKG9ic3RhY2xlLnggKyBGbGFwcHkuT0JTVEFDTEVfV0lEVEggPCAwKSB7XG4gICAgICAgIG9ic3RhY2xlLnJlc2V0KEZsYXBweS5vYnN0YWNsZXNbcHJldmlvdXNPYnN0YWNsZUluZGV4XS54ICsgRmxhcHB5Lk9CU1RBQ0xFX1NQQUNJTkcpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gY2hlY2sgZm9yIGdyb3VuZCBjb2xsaXNpb25cbiAgICBhdmF0YXJJc0Fib3ZlR3JvdW5kID0gKEZsYXBweS5hdmF0YXJZICsgQVZBVEFSX0hFSUdIVCkgPFxuICAgICAgKEZsYXBweS5NQVpFX0hFSUdIVCAtIEZsYXBweS5HUk9VTkRfSEVJR0hUKTtcbiAgICBpZiAoYXZhdGFyV2FzQWJvdmVHcm91bmQgJiYgIWF2YXRhcklzQWJvdmVHcm91bmQpIHtcbiAgICAgIEZsYXBweS5jYWxsVXNlckdlbmVyYXRlZENvZGUoRmxhcHB5LndoZW5Db2xsaWRlR3JvdW5kKTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgZ29hbFxuICAgIGlmIChsZXZlbC5nb2FsICYmIGxldmVsLmdvYWwubW92aW5nKSB7XG4gICAgICBGbGFwcHkuZ29hbFggLT0gRmxhcHB5LlNQRUVEO1xuICAgICAgaWYgKEZsYXBweS5nb2FsWCArIEZsYXBweS5HT0FMX1NJWkUgPCAwKSB7XG4gICAgICAgIC8vIGlmIGl0IGRpc2FwcGVhcnMgb2ZmIG9mIGxlZnQsIHJlYXBwZWFyIG9uIHJpZ2h0XG4gICAgICAgIEZsYXBweS5nb2FsWCA9IEZsYXBweS5NQVpFX1dJRFRIICsgRmxhcHB5LkdPQUxfU0laRTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuRU5ESU5HKSB7XG4gICAgRmxhcHB5LmF2YXRhclkgKz0gMTA7XG5cbiAgICAvLyB3ZSB1c2UgYXZhdGFyIHdpZHRoIGluc3RlYWQgb2YgaGVpZ2h0IGJjIGhlIGlzIHJvdGF0aW5nXG4gICAgLy8gdGhlIGV4dHJhIDQgaXMgc28gdGhhdCBoZSBidXJpZXMgaGlzIGJlYWsgKHNpbWlsYXIgdG8gbW9iaWxlIGdhbWUpXG4gICAgdmFyIG1heCA9IEZsYXBweS5NQVpFX0hFSUdIVCAtIEZsYXBweS5HUk9VTkRfSEVJR0hUIC0gQVZBVEFSX1dJRFRIICsgNDtcbiAgICBpZiAoRmxhcHB5LmF2YXRhclkgPj0gbWF4KSB7XG4gICAgICBGbGFwcHkuYXZhdGFyWSA9IG1heDtcbiAgICAgIEZsYXBweS5nYW1lU3RhdGUgPSBGbGFwcHkuR2FtZVN0YXRlcy5PVkVSO1xuICAgICAgRmxhcHB5LmdhbWVPdmVyVGljayA9IEZsYXBweS50aWNrQ291bnQ7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F2YXRhcicpLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyxcbiAgICAgICd0cmFuc2xhdGUoJyArIEFWQVRBUl9XSURUSCArICcsIDApICcgK1xuICAgICAgJ3JvdGF0ZSg5MCwgJyArIEZsYXBweS5hdmF0YXJYICsgJywgJyArIEZsYXBweS5hdmF0YXJZICsgJyknKTtcbiAgICBpZiAoaW5mb1RleHQpIHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lb3ZlcicpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmlsZScpO1xuICAgIH1cbiAgfVxuXG4gIEZsYXBweS5kaXNwbGF5QXZhdGFyKEZsYXBweS5hdmF0YXJYLCBGbGFwcHkuYXZhdGFyWSk7XG4gIEZsYXBweS5kaXNwbGF5T2JzdGFjbGVzKCk7XG4gIGlmIChGbGFwcHkuZ2FtZVN0YXRlIDw9IEZsYXBweS5HYW1lU3RhdGVzLkFDVElWRSkge1xuICAgIEZsYXBweS5kaXNwbGF5R3JvdW5kKEZsYXBweS50aWNrQ291bnQpO1xuICAgIEZsYXBweS5kaXNwbGF5R29hbCgpO1xuICB9XG5cbiAgaWYgKGNoZWNrRmluaXNoZWQoKSkge1xuICAgIEZsYXBweS5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH1cbn07XG5cbkZsYXBweS5vbk1vdXNlRG93biA9IGZ1bmN0aW9uIChlKSB7XG4gIGlmIChGbGFwcHkuaW50ZXJ2YWxJZCkge1xuICAgIEZsYXBweS5jbGlja1BlbmRpbmcgPSB0cnVlO1xuICAgIGlmIChGbGFwcHkuZ2FtZVN0YXRlID09PSBGbGFwcHkuR2FtZVN0YXRlcy5XQUlUSU5HKSB7XG4gICAgICBGbGFwcHkuZ2FtZVN0YXRlID0gRmxhcHB5LkdhbWVTdGF0ZXMuQUNUSVZFO1xuICAgIH0gZWxzZSBpZiAoRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuT1ZFUiAmJlxuICAgICAgRmxhcHB5LmdhbWVPdmVyVGljayArIDEwIDwgRmxhcHB5LnRpY2tDb3VudCkge1xuICAgICAgLy8gZG8gYSByZXNldFxuICAgICAgdmFyIHJlc2V0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0QnV0dG9uJyk7XG4gICAgICBpZiAocmVzZXRCdXR0b24pIHtcbiAgICAgICAgcmVzZXRCdXR0b24uY2xpY2soKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luc3RydWN0aW9ucycpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2V0cmVhZHknKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIH0gZWxzZSBpZiAoRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuV0FJVElORykge1xuICAgIEZsYXBweS5ydW5CdXR0b25DbGljaygpO1xuICB9XG59O1xuLyoqXG4gKiBJbml0aWFsaXplIEJsb2NrbHkgYW5kIHRoZSBGbGFwcHkgYXBwLiAgQ2FsbGVkIG9uIHBhZ2UgbG9hZC5cbiAqL1xuRmxhcHB5LmluaXQgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgLy8gcmVwbGFjZSBzdHVkaW9BcHAgbWV0aG9kcyB3aXRoIG91ciBvd25cbiAgc3R1ZGlvQXBwLnJlc2V0ID0gdGhpcy5yZXNldC5iaW5kKHRoaXMpO1xuICBzdHVkaW9BcHAucnVuQnV0dG9uQ2xpY2sgPSB0aGlzLnJ1bkJ1dHRvbkNsaWNrLmJpbmQodGhpcyk7XG5cbiAgRmxhcHB5LmNsZWFyRXZlbnRIYW5kbGVyc0tpbGxUaWNrTG9vcCgpO1xuICBza2luID0gY29uZmlnLnNraW47XG4gIGxldmVsID0gY29uZmlnLmxldmVsO1xuXG4gIGNvbmZpZy5ncmF5T3V0VW5kZWxldGFibGVCbG9ja3MgPSBsZXZlbC5ncmF5T3V0VW5kZWxldGFibGVCbG9ja3M7XG5cbiAgbG9hZExldmVsKCk7XG5cbiAgY29uZmlnLmh0bWwgPSBwYWdlKHtcbiAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgIGRhdGE6IHtcbiAgICAgIGxvY2FsZURpcmVjdGlvbjogc3R1ZGlvQXBwLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgdmlzdWFsaXphdGlvbjogcmVxdWlyZSgnLi92aXN1YWxpemF0aW9uLmh0bWwuZWpzJykoKSxcbiAgICAgIGNvbnRyb2xzOiByZXF1aXJlKCcuL2NvbnRyb2xzLmh0bWwuZWpzJykoe2Fzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsIHNoYXJlYWJsZTogbGV2ZWwuc2hhcmVhYmxlfSksXG4gICAgICBibG9ja1VzZWQ6IHVuZGVmaW5lZCxcbiAgICAgIGlkZWFsQmxvY2tOdW1iZXI6IHVuZGVmaW5lZCxcbiAgICAgIGVkaXRDb2RlOiBsZXZlbC5lZGl0Q29kZSxcbiAgICAgIGJsb2NrQ291bnRlckNsYXNzOiAnYmxvY2stY291bnRlci1kZWZhdWx0JyxcbiAgICAgIHJlYWRvbmx5V29ya3NwYWNlOiBjb25maWcucmVhZG9ubHlXb3Jrc3BhY2VcbiAgICB9XG4gIH0pO1xuXG4gIGNvbmZpZy5sb2FkQXVkaW8gPSBmdW5jdGlvbigpIHtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2luU291bmQsICd3aW4nKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uc3RhcnRTb3VuZCwgJ3N0YXJ0Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmZhaWx1cmVTb3VuZCwgJ2ZhaWx1cmUnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ub2JzdGFjbGVTb3VuZCwgJ29ic3RhY2xlJyk7XG5cbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uZGllU291bmQsICdzZnhfZGllJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmhpdFNvdW5kLCAnc2Z4X2hpdCcpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5wb2ludFNvdW5kLCAnc2Z4X3BvaW50Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLnN3b29zaGluZ1NvdW5kLCAnc2Z4X3N3b29zaGluZycpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi53aW5nU291bmQsICdzZnhfd2luZycpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi53aW5Hb2FsU291bmQsICd3aW5Hb2FsJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmpldFNvdW5kLCAnamV0Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmppbmdsZVNvdW5kLCAnamluZ2xlJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmNyYXNoU291bmQsICdjcmFzaCcpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5sYXNlclNvdW5kLCAnbGFzZXInKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uc3BsYXNoU291bmQsICdzcGxhc2gnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2FsbFNvdW5kLCAnd2FsbCcpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi53YWxsMFNvdW5kLCAnd2FsbDAnKTtcbiAgfTtcblxuICBjb25maWcuYWZ0ZXJJbmplY3QgPSBmdW5jdGlvbigpIHtcbiAgICAvKipcbiAgICAgKiBUaGUgcmljaG5lc3Mgb2YgYmxvY2sgY29sb3VycywgcmVnYXJkbGVzcyBvZiB0aGUgaHVlLlxuICAgICAqIE1PT0MgYmxvY2tzIHNob3VsZCBiZSBicmlnaHRlciAodGFyZ2V0IGF1ZGllbmNlIGlzIHlvdW5nZXIpLlxuICAgICAqIE11c3QgYmUgaW4gdGhlIHJhbmdlIG9mIDAgKGluY2x1c2l2ZSkgdG8gMSAoZXhjbHVzaXZlKS5cbiAgICAgKiBCbG9ja2x5J3MgZGVmYXVsdCBpcyAwLjQ1LlxuICAgICAqL1xuICAgIEJsb2NrbHkuSFNWX1NBVFVSQVRJT04gPSAwLjY7XG5cbiAgICBCbG9ja2x5LlNOQVBfUkFESVVTICo9IEZsYXBweS5zY2FsZS5zbmFwUmFkaXVzO1xuXG4gICAgZHJhd01hcCgpO1xuICB9O1xuXG4gIGNvbmZpZy50cmFzaGNhbiA9IGZhbHNlO1xuXG4gIGNvbmZpZy50d2l0dGVyID0gdHdpdHRlck9wdGlvbnM7XG5cbiAgLy8gZm9yIGZsYXBweSBzaG93IG1ha2UgeW91ciBvd24gYnV0dG9uIGlmIG9uIHNoYXJlIHBhZ2VcbiAgY29uZmlnLm1ha2VZb3VyT3duID0gY29uZmlnLnNoYXJlO1xuXG4gIGNvbmZpZy5tYWtlU3RyaW5nID0gY29tbW9uTXNnLm1ha2VZb3VyT3duRmxhcHB5KCk7XG4gIGNvbmZpZy5tYWtlVXJsID0gXCJodHRwOi8vY29kZS5vcmcvZmxhcHB5XCI7XG4gIGNvbmZpZy5tYWtlSW1hZ2UgPSBzdHVkaW9BcHAuYXNzZXRVcmwoJ21lZGlhL2ZsYXBweV9wcm9tby5wbmcnKTtcblxuICBjb25maWcuZW5hYmxlU2hvd0NvZGUgPSBmYWxzZTtcbiAgY29uZmlnLmVuYWJsZVNob3dCbG9ja0NvdW50ID0gZmFsc2U7XG5cbiAgaWYgKGxldmVsLmlzSzEpIHtcbiAgICAvLyBrMSBibG9ja3MgYXJlIHRhbGxlclxuICAgIGNvbnN0YW50cy5XT1JLU1BBQ0VfUk9XX0hFSUdIVCAqPSAxLjU7XG4gIH1cblxuICAvLyBkZWZpbmUgaG93IG91ciBibG9ja3Mgc2hvdWxkIGJlIGFycmFuZ2VkXG4gIHZhciBjb2wxID0gY29uc3RhbnRzLldPUktTUEFDRV9CVUZGRVI7XG4gIHZhciBjb2wyID0gY29sMSArIGNvbnN0YW50cy5XT1JLU1BBQ0VfQ09MX1dJRFRIO1xuICB2YXIgcm93MSA9IGNvbnN0YW50cy5XT1JLU1BBQ0VfQlVGRkVSO1xuICB2YXIgcm93MiA9IHJvdzEgKyBjb25zdGFudHMuV09SS1NQQUNFX1JPV19IRUlHSFQ7XG4gIHZhciByb3czID0gcm93MiArIGNvbnN0YW50cy5XT1JLU1BBQ0VfUk9XX0hFSUdIVDtcblxuICBjb25maWcuYmxvY2tBcnJhbmdlbWVudCA9IHtcbiAgICAnZmxhcHB5X3doZW5DbGljayc6IHsgeDogY29sMSwgeTogcm93MX0sXG4gICAgJ3doZW5fcnVuJzogeyB4OiBjb2wxLCB5OiByb3cxfSxcbiAgICAnZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kJzogeyB4OiBjb2wyLCB5OiByb3cxfSxcbiAgICAnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnOiB7IHg6IGNvbDIsIHk6IHJvdzJ9LFxuICAgICdmbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUnOiB7IHg6IGNvbDIsIHk6IHJvdzN9XG4gIH07XG5cbiAgLy8gaWYgd2UgZG9udCBoYXZlIGNvbGxpZGUgZXZlbnRzLCBoYXZlIGVudGVyIG9ic3RhY2xlIGluIHRvcCByb3dcbiAgaWYgKGxldmVsLnN0YXJ0QmxvY2tzLmluZGV4T2YoJ3doZW5Db2xsaWRlJykgPT09IC0xKSB7XG4gICAgY29uZmlnLmJsb2NrQXJyYW5nZW1lbnQuZmxhcHB5X3doZW5FbnRlck9ic3RhY2xlID0ge3g6IGNvbDIsIHk6IHJvdzF9O1xuICB9XG5cbiAgLy8gd2hlbiB3ZSBoYXZlIHdoZW5fcnVuIGFuZCB3aGVuX2NsaWNrLCBwdXQgd2hlbl9ydW4gaW4gdG9wIHJvd1xuICBpZiAobGV2ZWwuc3RhcnRCbG9ja3MuaW5kZXhPZignd2hlbl9ydW4nKSAhPT0gLTEpIHtcbiAgICBjb25maWcuYmxvY2tBcnJhbmdlbWVudC5mbGFwcHlfd2hlbkNsaWNrLnkgPSByb3cyO1xuICB9XG5cbiAgc3R1ZGlvQXBwLmluaXQoY29uZmlnKTtcblxuICB2YXIgcmlnaHRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmlnaHRCdXR0b24nKTtcbiAgZG9tLmFkZENsaWNrVG91Y2hFdmVudChyaWdodEJ1dHRvbiwgRmxhcHB5Lm9uUHV6emxlQ29tcGxldGUpO1xufTtcblxuLyoqXG4gKiBDbGVhciB0aGUgZXZlbnQgaGFuZGxlcnMgYW5kIHN0b3AgdGhlIG9uVGljayB0aW1lci5cbiAqL1xuRmxhcHB5LmNsZWFyRXZlbnRIYW5kbGVyc0tpbGxUaWNrTG9vcCA9IGZ1bmN0aW9uKCkge1xuICBGbGFwcHkud2hlbkNsaWNrID0gbnVsbDtcbiAgRmxhcHB5LndoZW5Db2xsaWRlR3JvdW5kID0gbnVsbDtcbiAgRmxhcHB5LndoZW5Db2xsaWRlT2JzdGFjbGUgPSBudWxsO1xuICBGbGFwcHkud2hlbkVudGVyT2JzdGFjbGUgPSBudWxsO1xuICBGbGFwcHkud2hlblJ1bkJ1dHRvbiA9IG51bGw7XG4gIGlmIChGbGFwcHkuaW50ZXJ2YWxJZCkge1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKEZsYXBweS5pbnRlcnZhbElkKTtcbiAgfVxuICBGbGFwcHkuaW50ZXJ2YWxJZCA9IDA7XG59O1xuXG4vKipcbiAqIFJlc2V0IHRoZSBhcHAgdG8gdGhlIHN0YXJ0IHBvc2l0aW9uIGFuZCBraWxsIGFueSBwZW5kaW5nIGFuaW1hdGlvbiB0YXNrcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZmlyc3QgVHJ1ZSBpZiBhbiBvcGVuaW5nIGFuaW1hdGlvbiBpcyB0byBiZSBwbGF5ZWQuXG4gKi9cbkZsYXBweS5yZXNldCA9IGZ1bmN0aW9uKGZpcnN0KSB7XG4gIHZhciBpO1xuICBGbGFwcHkuY2xlYXJFdmVudEhhbmRsZXJzS2lsbFRpY2tMb29wKCk7XG5cbiAgRmxhcHB5LmdhbWVTdGF0ZSA9IEZsYXBweS5HYW1lU3RhdGVzLldBSVRJTkc7XG5cbiAgLy8gUmVzZXQgdGhlIHNjb3JlLlxuICBGbGFwcHkucGxheWVyU2NvcmUgPSAwO1xuXG4gIEZsYXBweS5hdmF0YXJWZWxvY2l0eSA9IDA7XG5cbiAgLy8gUmVzZXQgb2JzdGFjbGVzXG4gIEZsYXBweS5vYnN0YWNsZXMuZm9yRWFjaChmdW5jdGlvbiAob2JzdGFjbGUsIGluZGV4KSB7XG4gICAgb2JzdGFjbGUucmVzZXQoRmxhcHB5Lk1BWkVfV0lEVEggKiAxLjUgKyBpbmRleCAqIEZsYXBweS5PQlNUQUNMRV9TUEFDSU5HKTtcbiAgfSk7XG5cbiAgLy8gcmVzZXQgY29uZmlndXJhYmxlIHZhbHVlc1xuICBGbGFwcHkuU1BFRUQgPSAwO1xuICBGbGFwcHkuRkxBUF9WRUxPQ0lUWSA9IC0xMTtcbiAgRmxhcHB5LnNldEJhY2tncm91bmQoJ2ZsYXBweScpO1xuICBGbGFwcHkuc2V0T2JzdGFjbGUoJ2ZsYXBweScpO1xuICBGbGFwcHkuc2V0UGxheWVyKCdmbGFwcHknKTtcbiAgRmxhcHB5LnNldEdyb3VuZCgnZmxhcHB5Jyk7XG4gIEZsYXBweS5zZXRHYXBIZWlnaHQoYXBpLkdhcEhlaWdodC5OT1JNQUwpO1xuICBGbGFwcHkuZ3Jhdml0eSA9IGFwaS5HcmF2aXR5Lk5PUk1BTDtcblxuICAvLyBNb3ZlIEF2YXRhciBpbnRvIHBvc2l0aW9uLlxuICBGbGFwcHkuYXZhdGFyWCA9IDExMDtcbiAgRmxhcHB5LmF2YXRhclkgPSAxNTA7XG5cbiAgaWYgKGxldmVsLmdvYWwgJiYgbGV2ZWwuZ29hbC5zdGFydFgpIHtcbiAgICBGbGFwcHkuZ29hbFggPSBsZXZlbC5nb2FsLnN0YXJ0WDtcbiAgICBGbGFwcHkuZ29hbFkgPSBsZXZlbC5nb2FsLnN0YXJ0WTtcbiAgfVxuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhdmF0YXInKS5zZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScsICcnKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Njb3JlJykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5zdHJ1Y3Rpb25zJykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpY2tydW4nKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2V0cmVhZHknKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lb3ZlcicpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcblxuICBGbGFwcHkuZGlzcGxheUF2YXRhcihGbGFwcHkuYXZhdGFyWCwgRmxhcHB5LmF2YXRhclkpO1xuICBGbGFwcHkuZGlzcGxheU9ic3RhY2xlcygpO1xuICBGbGFwcHkuZGlzcGxheUdyb3VuZCgwKTtcbiAgRmxhcHB5LmRpc3BsYXlHb2FsKCk7XG5cbiAgdmFyIHN2ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdmdGbGFwcHknKTtcbn07XG5cbi8qKlxuICogQ2xpY2sgdGhlIHJ1biBidXR0b24uICBTdGFydCB0aGUgcHJvZ3JhbS5cbiAqL1xuLy8gWFhYIFRoaXMgaXMgdGhlIG9ubHkgbWV0aG9kIHVzZWQgYnkgdGhlIHRlbXBsYXRlcyFcbkZsYXBweS5ydW5CdXR0b25DbGljayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcnVuQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bkJ1dHRvbicpO1xuICB2YXIgcmVzZXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXRCdXR0b24nKTtcbiAgLy8gRW5zdXJlIHRoYXQgUmVzZXQgYnV0dG9uIGlzIGF0IGxlYXN0IGFzIHdpZGUgYXMgUnVuIGJ1dHRvbi5cbiAgaWYgKCFyZXNldEJ1dHRvbi5zdHlsZS5taW5XaWR0aCkge1xuICAgIHJlc2V0QnV0dG9uLnN0eWxlLm1pbldpZHRoID0gcnVuQnV0dG9uLm9mZnNldFdpZHRoICsgJ3B4JztcbiAgfVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xpY2tydW4nKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnN0cnVjdGlvbnMnKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2V0cmVhZHknKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuXG4gIHN0dWRpb0FwcC50b2dnbGVSdW5SZXNldCgncmVzZXQnKTtcbiAgQmxvY2tseS5tYWluQmxvY2tTcGFjZS50cmFjZU9uKHRydWUpO1xuICAvLyBzdHVkaW9BcHAucmVzZXQoZmFsc2UpO1xuICBzdHVkaW9BcHAuYXR0ZW1wdHMrKztcbiAgRmxhcHB5LmV4ZWN1dGUoKTtcblxuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICB2YXIgcmlnaHRCdXR0b25DZWxsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JpZ2h0LWJ1dHRvbi1jZWxsJyk7XG4gICAgcmlnaHRCdXR0b25DZWxsLmNsYXNzTmFtZSA9ICdyaWdodC1idXR0b24tY2VsbC1lbmFibGVkJztcbiAgfVxuICBpZiAobGV2ZWwuc2NvcmUpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NvcmUnKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgIEZsYXBweS5kaXNwbGF5U2NvcmUoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBBcHAgc3BlY2lmaWMgZGlzcGxheUZlZWRiYWNrIGZ1bmN0aW9uIHRoYXQgY2FsbHMgaW50b1xuICogc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayB3aGVuIGFwcHJvcHJpYXRlXG4gKi9cbnZhciBkaXNwbGF5RmVlZGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFGbGFwcHkud2FpdGluZ0ZvclJlcG9ydCkge1xuICAgIHN0dWRpb0FwcC5kaXNwbGF5RmVlZGJhY2soe1xuICAgICAgYXBwOiAnZmxhcHB5JywgLy9YWFhcbiAgICAgIHNraW46IHNraW4uaWQsXG4gICAgICBmZWVkYmFja1R5cGU6IEZsYXBweS50ZXN0UmVzdWx0cyxcbiAgICAgIHJlc3BvbnNlOiBGbGFwcHkucmVzcG9uc2UsXG4gICAgICBsZXZlbDogbGV2ZWwsXG4gICAgICBzaG93aW5nU2hhcmluZzogbGV2ZWwuZnJlZVBsYXkgJiYgbGV2ZWwuc2hhcmVhYmxlLFxuICAgICAgdHdpdHRlcjogdHdpdHRlck9wdGlvbnMsXG4gICAgICBhcHBTdHJpbmdzOiB7XG4gICAgICAgIHJlaW5mRmVlZGJhY2tNc2c6IGZsYXBweU1zZy5yZWluZkZlZWRiYWNrTXNnKCksXG4gICAgICAgIHNoYXJpbmdUZXh0OiBmbGFwcHlNc2cuc2hhcmVHYW1lKClcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgc2VydmljZSByZXBvcnQgY2FsbCBpcyBjb21wbGV0ZVxuICogQHBhcmFtIHtvYmplY3R9IEpTT04gcmVzcG9uc2UgKGlmIGF2YWlsYWJsZSlcbiAqL1xuRmxhcHB5Lm9uUmVwb3J0Q29tcGxldGUgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICBGbGFwcHkucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgRmxhcHB5LndhaXRpbmdGb3JSZXBvcnQgPSBmYWxzZTtcbiAgc3R1ZGlvQXBwLm9uUmVwb3J0Q29tcGxldGUocmVzcG9uc2UpO1xuICBkaXNwbGF5RmVlZGJhY2soKTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuICBIZWF2ZW4gaGVscCB1cy4uLlxuICovXG5GbGFwcHkuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY29kZTtcbiAgRmxhcHB5LnJlc3VsdCA9IFJlc3VsdFR5cGUuVU5TRVQ7XG4gIEZsYXBweS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLk5PX1RFU1RTX1JVTjtcbiAgRmxhcHB5LndhaXRpbmdGb3JSZXBvcnQgPSBmYWxzZTtcbiAgRmxhcHB5LnJlc3BvbnNlID0gbnVsbDtcblxuICBpZiAobGV2ZWwuZWRpdENvZGUpIHtcbiAgICBjb2RlID0gZHJvcGxldFV0aWxzLmdlbmVyYXRlQ29kZUFsaWFzZXMobnVsbCwgJ0ZsYXBweScpO1xuICAgIGNvZGUgKz0gc3R1ZGlvQXBwLmVkaXRvci5nZXRWYWx1ZSgpO1xuICB9XG5cbiAgdmFyIGNvZGVDbGljayA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSmF2YVNjcmlwdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZmxhcHB5X3doZW5DbGljaycpO1xuICB2YXIgd2hlbkNsaWNrRnVuYyA9IGNvZGVnZW4uZnVuY3Rpb25Gcm9tQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZUNsaWNrLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0dWRpb0FwcDogc3R1ZGlvQXBwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGbGFwcHk6IGFwaSB9ICk7XG5cbiAgdmFyIGNvZGVDb2xsaWRlR3JvdW5kID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdKYXZhU2NyaXB0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmbGFwcHlfd2hlbkNvbGxpZGVHcm91bmQnKTtcbiAgdmFyIHdoZW5Db2xsaWRlR3JvdW5kRnVuYyA9IGNvZGVnZW4uZnVuY3Rpb25Gcm9tQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZUNvbGxpZGVHcm91bmQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZsYXBweTogYXBpIH0gKTtcblxuICB2YXIgY29kZUVudGVyT2JzdGFjbGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0phdmFTY3JpcHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScpO1xuICB2YXIgd2hlbkVudGVyT2JzdGFjbGVGdW5jID0gY29kZWdlbi5mdW5jdGlvbkZyb21Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlRW50ZXJPYnN0YWNsZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHVkaW9BcHA6IHN0dWRpb0FwcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRmxhcHB5OiBhcGkgfSApO1xuXG4gIHZhciBjb2RlQ29sbGlkZU9ic3RhY2xlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdKYXZhU2NyaXB0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZScpO1xuICB2YXIgd2hlbkNvbGxpZGVPYnN0YWNsZUZ1bmMgPSBjb2RlZ2VuLmZ1bmN0aW9uRnJvbUNvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVDb2xsaWRlT2JzdGFjbGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZsYXBweTogYXBpIH0gKTtcblxuICB2YXIgY29kZVdoZW5SdW5CdXR0b24gPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0phdmFTY3JpcHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3doZW5fcnVuJyk7XG4gIHZhciB3aGVuUnVuQnV0dG9uRnVuYyA9IGNvZGVnZW4uZnVuY3Rpb25Gcm9tQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZVdoZW5SdW5CdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZsYXBweTogYXBpIH0gKTtcblxuXG4gIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ3N0YXJ0Jyk7XG5cbiAgLy8gc3R1ZGlvQXBwLnJlc2V0KGZhbHNlKTtcblxuICAvLyBTZXQgZXZlbnQgaGFuZGxlcnMgYW5kIHN0YXJ0IHRoZSBvblRpY2sgdGltZXJcbiAgRmxhcHB5LndoZW5DbGljayA9IHdoZW5DbGlja0Z1bmM7XG4gIEZsYXBweS53aGVuQ29sbGlkZUdyb3VuZCA9IHdoZW5Db2xsaWRlR3JvdW5kRnVuYztcbiAgRmxhcHB5LndoZW5FbnRlck9ic3RhY2xlID0gd2hlbkVudGVyT2JzdGFjbGVGdW5jO1xuICBGbGFwcHkud2hlbkNvbGxpZGVPYnN0YWNsZSA9IHdoZW5Db2xsaWRlT2JzdGFjbGVGdW5jO1xuICBGbGFwcHkud2hlblJ1bkJ1dHRvbiA9IHdoZW5SdW5CdXR0b25GdW5jO1xuXG4gIEZsYXBweS50aWNrQ291bnQgPSAwO1xuICBGbGFwcHkuZmlyc3RBY3RpdmVUaWNrID0gLTE7XG4gIEZsYXBweS5nYW1lT3ZlclRpY2sgPSAwO1xuICBpZiAoRmxhcHB5LmludGVydmFsSWQpIHtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChGbGFwcHkuaW50ZXJ2YWxJZCk7XG4gIH1cbiAgRmxhcHB5LmludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoRmxhcHB5Lm9uVGljaywgRmxhcHB5LnNjYWxlLnN0ZXBTcGVlZCk7XG59O1xuXG5GbGFwcHkub25QdXp6bGVDb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICBGbGFwcHkucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICB9XG5cbiAgLy8gU3RvcCBldmVyeXRoaW5nIG9uIHNjcmVlblxuICBGbGFwcHkuY2xlYXJFdmVudEhhbmRsZXJzS2lsbFRpY2tMb29wKCk7XG5cbiAgLy8gSWYgd2Uga25vdyB0aGV5IHN1Y2NlZWRlZCwgbWFyayBsZXZlbENvbXBsZXRlIHRydWVcbiAgLy8gTm90ZSB0aGF0IHdlIGhhdmUgbm90IHlldCBhbmltYXRlZCB0aGUgc3VjY2VzZnVsIHJ1blxuICB2YXIgbGV2ZWxDb21wbGV0ZSA9IChGbGFwcHkucmVzdWx0ID09IFJlc3VsdFR5cGUuU1VDQ0VTUyk7XG5cbiAgLy8gSWYgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBmcmVlIHBsYXksIGFsd2F5cyByZXR1cm4gdGhlIGZyZWUgcGxheVxuICAvLyByZXN1bHQgdHlwZVxuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICBGbGFwcHkudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5GUkVFX1BMQVk7XG4gIH0gZWxzZSB7XG4gICAgRmxhcHB5LnRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLmdldFRlc3RSZXN1bHRzKGxldmVsQ29tcGxldGUpO1xuICB9XG5cbiAgLy8gU3BlY2lhbCBjYXNlIGZvciBGbGFwcHkgbGV2ZWwgMSB3aGVyZSB5b3UgaGF2ZSB0aGUgcmlnaHQgYmxvY2tzLCBidXQgeW91XG4gIC8vIGRvbid0IGZsYXAgdG8gdGhlIGdvYWwuICBOb3RlOiBTZWUgcGl2b3RhbCBpdGVtIDY2MzYyNTA0IGZvciB3aHkgd2VcbiAgLy8gY2hlY2sgZm9yIGJvdGggVE9PX0ZFV19CTE9DS1NfRkFJTCBhbmQgTEVWRUxfSU5DT01QTEVURV9GQUlMIGhlcmUuXG4gIGlmIChsZXZlbC5pZCA9PT0gXCIxXCIgJiZcbiAgICAoRmxhcHB5LnRlc3RSZXN1bHRzID09PSBUZXN0UmVzdWx0cy5UT09fRkVXX0JMT0NLU19GQUlMIHx8XG4gICAgIEZsYXBweS50ZXN0UmVzdWx0cyA9PT0gVGVzdFJlc3VsdHMuTEVWRUxfSU5DT01QTEVURV9GQUlMKSkge1xuICAgIC8vIEZlZWRiYWNrIG1lc3NhZ2UgaXMgZm91bmQgaW4gbGV2ZWwub3RoZXIxU3RhckVycm9yLlxuICAgIEZsYXBweS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuICB9XG5cbiAgaWYgKEZsYXBweS50ZXN0UmVzdWx0cyA+PSBUZXN0UmVzdWx0cy5GUkVFX1BMQVkpIHtcbiAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCd3aW4nKTtcbiAgfSBlbHNlIHtcbiAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCdmYWlsdXJlJyk7XG4gIH1cblxuICBpZiAobGV2ZWwuZWRpdENvZGUpIHtcbiAgICBGbGFwcHkudGVzdFJlc3VsdHMgPSBsZXZlbENvbXBsZXRlID9cbiAgICAgIFRlc3RSZXN1bHRzLkFMTF9QQVNTIDpcbiAgICAgIFRlc3RSZXN1bHRzLlRPT19GRVdfQkxPQ0tTX0ZBSUw7XG4gIH1cblxuICB2YXIgeG1sID0gQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICB2YXIgdGV4dEJsb2NrcyA9IEJsb2NrbHkuWG1sLmRvbVRvVGV4dCh4bWwpO1xuXG4gIEZsYXBweS53YWl0aW5nRm9yUmVwb3J0ID0gdHJ1ZTtcblxuICAvLyBSZXBvcnQgcmVzdWx0IHRvIHNlcnZlci5cbiAgc3R1ZGlvQXBwLnJlcG9ydCh7XG4gICAgICAgICAgICAgICAgICAgICBhcHA6ICdmbGFwcHknLFxuICAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IGxldmVsLmlkLFxuICAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBGbGFwcHkucmVzdWx0ID09PSBSZXN1bHRUeXBlLlNVQ0NFU1MsXG4gICAgICAgICAgICAgICAgICAgICB0ZXN0UmVzdWx0OiBGbGFwcHkudGVzdFJlc3VsdHMsXG4gICAgICAgICAgICAgICAgICAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQodGV4dEJsb2NrcyksXG4gICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlOiBGbGFwcHkub25SZXBvcnRDb21wbGV0ZVxuICAgICAgICAgICAgICAgICAgICAgfSk7XG59O1xuXG4vKipcbiAqIERpc3BsYXkgQXZhdGFyIGF0IHRoZSBzcGVjaWZpZWQgbG9jYXRpb25cbiAqIEBwYXJhbSB7bnVtYmVyfSB4IEhvcml6b250YWwgUGl4ZWwgbG9jYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0geSBWZXJ0aWNhbCBQaXhlbCBsb2NhdGlvbi5cbiAqL1xuRmxhcHB5LmRpc3BsYXlBdmF0YXIgPSBmdW5jdGlvbih4LCB5KSB7XG4gIHZhciBhdmF0YXJJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F2YXRhcicpO1xuICBhdmF0YXJJY29uLnNldEF0dHJpYnV0ZSgneCcsIHgpO1xuICBhdmF0YXJJY29uLnNldEF0dHJpYnV0ZSgneScsIHkpO1xufTtcblxuLyoqXG4gKiBkaXNwbGF5IG1vdmluZyBnb2FsXG4gKi9cbkZsYXBweS5kaXNwbGF5R29hbCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIUZsYXBweS5nb2FsWCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgZ29hbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnb2FsJyk7XG4gIGdvYWwuc2V0QXR0cmlidXRlKCd4JywgRmxhcHB5LmdvYWxYKTtcbiAgZ29hbC5zZXRBdHRyaWJ1dGUoJ3knLCBGbGFwcHkuZ29hbFkpO1xufTtcblxuXG4vKipcbiAqIERpc3BsYXkgZ3JvdW5kIGF0IGdpdmVuIHRpY2tDb3VudFxuICovXG5GbGFwcHkuZGlzcGxheUdyb3VuZCA9IGZ1bmN0aW9uKHRpY2tDb3VudCkge1xuICBpZiAoIWxldmVsLmdyb3VuZCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgb2Zmc2V0ID0gdGlja0NvdW50ICogRmxhcHB5LlNQRUVEO1xuICBvZmZzZXQgPSBvZmZzZXQgJSBGbGFwcHkuR1JPVU5EX1dJRFRIO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IEZsYXBweS5NQVpFX1dJRFRIIC8gRmxhcHB5LkdST1VORF9XSURUSCArIDE7IGkrKykge1xuICAgIHZhciBncm91bmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ3JvdW5kJyArIGkpO1xuICAgIGdyb3VuZC5zZXRBdHRyaWJ1dGUoJ3gnLCAtb2Zmc2V0ICsgaSAqIEZsYXBweS5HUk9VTkRfV0lEVEgpO1xuICAgIGdyb3VuZC5zZXRBdHRyaWJ1dGUoJ3knLCBGbGFwcHkuTUFaRV9IRUlHSFQgLSBGbGFwcHkuR1JPVU5EX0hFSUdIVCk7XG4gIH1cbn07XG5cbi8qKlxuICogRGlzcGxheSBhbGwgb2JzdGFjbGVzXG4gKi9cbkZsYXBweS5kaXNwbGF5T2JzdGFjbGVzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IEZsYXBweS5vYnN0YWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgb2JzdGFjbGUgPSBGbGFwcHkub2JzdGFjbGVzW2ldO1xuICAgIHZhciB0b3BJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29ic3RhY2xlX3RvcCcgKyBpKTtcbiAgICB0b3BJY29uLnNldEF0dHJpYnV0ZSgneCcsIG9ic3RhY2xlLngpO1xuICAgIHRvcEljb24uc2V0QXR0cmlidXRlKCd5Jywgb2JzdGFjbGUuZ2FwU3RhcnQgLSBGbGFwcHkuT0JTVEFDTEVfSEVJR0hUKTtcblxuICAgIHZhciBib3R0b21JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29ic3RhY2xlX2JvdHRvbScgKyBpKTtcbiAgICBib3R0b21JY29uLnNldEF0dHJpYnV0ZSgneCcsIG9ic3RhY2xlLngpO1xuICAgIGJvdHRvbUljb24uc2V0QXR0cmlidXRlKCd5Jywgb2JzdGFjbGUuZ2FwU3RhcnQgKyBGbGFwcHkuR0FQX1NJWkUpO1xuICB9XG59O1xuXG5GbGFwcHkuZGlzcGxheVNjb3JlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzY29yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZScpO1xuICBzY29yZS50ZXh0Q29udGVudCA9IEZsYXBweS5wbGF5ZXJTY29yZTtcbn07XG5cbkZsYXBweS5mbGFwID0gZnVuY3Rpb24gKGFtb3VudCkge1xuICB2YXIgZGVmYXVsdEZsYXAgPSBsZXZlbC5kZWZhdWx0RmxhcCB8fCBcIk5PUk1BTFwiO1xuICBGbGFwcHkuYXZhdGFyVmVsb2NpdHkgPSBhbW91bnQgfHwgYXBpLkZsYXBIZWlnaHRbZGVmYXVsdEZsYXBdO1xufTtcblxuRmxhcHB5LnNldEdhcEhlaWdodCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgbWluR2FwU2l6ZSA9IEZsYXBweS5NQVpFX0hFSUdIVCAtIEZsYXBweS5NSU5fT0JTVEFDTEVfSEVJR0hUIC1cbiAgICBGbGFwcHkuT0JTVEFDTEVfSEVJR0hUO1xuICBpZiAodmFsdWUgPCBtaW5HYXBTaXplKSB7XG4gICAgdmFsdWUgPSBtaW5HYXBTaXplO1xuICB9XG4gIEZsYXBweS5HQVBfU0laRSA9IHZhbHVlO1xufTtcblxudmFyIHNraW5UaGVtZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT09ICdmbGFwcHknKSB7XG4gICAgcmV0dXJuIHNraW47XG4gIH1cbiAgcmV0dXJuIHNraW5bdmFsdWVdO1xufTtcblxuRmxhcHB5LnNldEJhY2tncm91bmQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFja2dyb3VuZCcpO1xuICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgIHNraW5UaGVtZSh2YWx1ZSkuYmFja2dyb3VuZCk7XG59O1xuXG5GbGFwcHkuc2V0UGxheWVyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F2YXRhcicpO1xuICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgIHNraW5UaGVtZSh2YWx1ZSkuYXZhdGFyKTtcbn07XG5cbkZsYXBweS5zZXRPYnN0YWNsZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgZWxlbWVudDtcbiAgRmxhcHB5Lm9ic3RhY2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChvYnN0YWNsZSwgaW5kZXgpIHtcbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29ic3RhY2xlX3RvcCcgKyBpbmRleCk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgIHNraW5UaGVtZSh2YWx1ZSkub2JzdGFjbGVfdG9wKTtcblxuICAgIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2JzdGFjbGVfYm90dG9tJyArIGluZGV4KTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgc2tpblRoZW1lKHZhbHVlKS5vYnN0YWNsZV9ib3R0b20pO1xuICB9KTtcbn07XG5cbkZsYXBweS5zZXRHcm91bmQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKCFsZXZlbC5ncm91bmQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGVsZW1lbnQsIGk7XG4gIGZvciAoaSA9IDA7IGkgPCBGbGFwcHkuTUFaRV9XSURUSCAvIEZsYXBweS5HUk9VTkRfV0lEVEggKyAxOyBpKyspIHtcbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dyb3VuZCcgKyBpKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgc2tpblRoZW1lKHZhbHVlKS5ncm91bmQpO1xuICB9XG59O1xuXG52YXIgY2hlY2tUaWNrTGltaXQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFsZXZlbC50aWNrTGltaXQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoKEZsYXBweS50aWNrQ291bnQgLSBGbGFwcHkuZmlyc3RBY3RpdmVUaWNrKSA+PSBsZXZlbC50aWNrTGltaXQgJiZcbiAgICAoRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuQUNUSVZFIHx8XG4gICAgRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuT1ZFUikpIHtcbiAgICAvLyBXZSdsbCBpZ25vcmUgdGljayBsaW1pdCBpZiB3ZSdyZSBlbmRpbmcgc28gdGhhdCB3ZSBmdWxseSBmaW5pc2ggZW5kaW5nXG4gICAgLy8gc2VxdWVuY2VcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbnZhciBjaGVja0ZpbmlzaGVkID0gZnVuY3Rpb24gKCkge1xuICAvLyBpZiB3ZSBoYXZlIGEgc3VjY2Nlc3MgY29uZGl0aW9uIGFuZCBoYXZlIGFjY29tcGxpc2hlZCBpdCwgd2UncmUgZG9uZSBhbmQgc3VjY2Vzc2Z1bFxuICBpZiAobGV2ZWwuZ29hbCAmJiBsZXZlbC5nb2FsLnN1Y2Nlc3NDb25kaXRpb24gJiYgbGV2ZWwuZ29hbC5zdWNjZXNzQ29uZGl0aW9uKCkpIHtcbiAgICBGbGFwcHkucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gaWYgd2UgaGF2ZSBhIGZhaWx1cmUgY29uZGl0aW9uLCBhbmQgaXQncyBiZWVuIHJlYWNoZWQsIHdlJ3JlIGRvbmUgYW5kIGZhaWxlZFxuICBpZiAobGV2ZWwuZ29hbCAmJiBsZXZlbC5nb2FsLmZhaWx1cmVDb25kaXRpb24gJiYgbGV2ZWwuZ29hbC5mYWlsdXJlQ29uZGl0aW9uKCkpIHtcbiAgICBGbGFwcHkucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwic3ZnRmxhcHB5XCI+XFxuPC9zdmc+XFxuPGRpdiBpZD1cImNhcGFjaXR5QnViYmxlXCI+XFxuICA8ZGl2IGlkPVwiY2FwYWNpdHlcIj48L2Rpdj5cXG48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7IHZhciBtc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKSA7IGJ1Zi5wdXNoKCdcXG5cXG48ZGl2IGlkPVwicmlnaHQtYnV0dG9uLWNlbGxcIj5cXG4gIDxidXR0b24gaWQ9XCJyaWdodEJ1dHRvblwiIGNsYXNzPVwic2hhcmVcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDUsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+JywgZXNjYXBlKCg1LCAgbXNnLmZpbmlzaCgpICkpLCAnXFxuICA8L2J1dHRvbj5cXG48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgV09SS1NQQUNFX0JVRkZFUjogMjAsXG4gIFdPUktTUEFDRV9DT0xfV0lEVEg6IDIxMCxcbiAgV09SS1NQQUNFX1JPV19IRUlHSFQ6IDEyMCxcblxuICBBVkFUQVJfSEVJR0hUOiAyNCxcbiAgQVZBVEFSX1dJRFRIOiAzNCxcbiAgQVZBVEFSX1lfT0ZGU0VUOiAwXG59OyIsIi8qKlxuICogQmxvY2tseSBBcHA6IEZsYXBweVxuICpcbiAqIENvcHlyaWdodCAyMDEzIENvZGUub3JnXG4gKlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xuXG52YXIgRkxBUFBZX1ZBTFVFID0gJ1wiZmxhcHB5XCInO1xudmFyIFJBTkRPTV9WQUxVRSA9ICdyYW5kb20nO1xuXG52YXIgZ2VuZXJhdGVTZXR0ZXJDb2RlID0gZnVuY3Rpb24gKGN0eCwgbmFtZSkge1xuICB2YXIgdmFsdWUgPSBjdHguZ2V0VGl0bGVWYWx1ZSgnVkFMVUUnKTtcbiAgaWYgKHZhbHVlID09PSBSQU5ET01fVkFMVUUpIHtcbiAgICB2YXIgcG9zc2libGVWYWx1ZXMgPVxuICAgICAgXyhjdHguVkFMVUVTKVxuICAgICAgICAubWFwKGZ1bmN0aW9uIChpdGVtKSB7IHJldHVybiBpdGVtWzFdOyB9KVxuICAgICAgICAucmVqZWN0KGZ1bmN0aW9uIChpdGVtVmFsdWUpIHsgcmV0dXJuIGl0ZW1WYWx1ZSA9PT0gUkFORE9NX1ZBTFVFOyB9KTtcbiAgICB2YWx1ZSA9ICdGbGFwcHkucmFuZG9tKFsnICsgcG9zc2libGVWYWx1ZXMgKyAnXSknO1xuICB9XG5cbiAgcmV0dXJuICdGbGFwcHkuJyArIG5hbWUgKyAnKFxcJ2Jsb2NrX2lkXycgKyBjdHguaWQgKyAnXFwnLCAnICtcbiAgICB2YWx1ZSArICcpO1xcbic7XG59O1xuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIHNraW4gPSBibG9ja0luc3RhbGxPcHRpb25zLnNraW47XG4gIHZhciBpc0sxID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5pc0sxO1xuXG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV93aGVuQ2xpY2sgPSB7XG4gICAgLy8gQmxvY2sgdG8gaGFuZGxlIGV2ZW50IHdoZXJlIG1vdXNlIGlzIGNsaWNrZWRcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxNDAsIDEuMDAsIDAuNzQpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoY29tbW9uTXNnLndoZW4oKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShza2luLmNsaWNrSWNvbikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KCkuYXBwZW5kVGl0bGUobXNnLndoZW5DbGljaygpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQoZmFsc2UpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGVuQ2xpY2tUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3doZW5DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBoYW5kbGluZyBjbGljayBldmVudC5cbiAgICByZXR1cm4gJ1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kID0ge1xuICAgIC8vIEJsb2NrIHRvIGhhbmRsZSBldmVudCB3aGVyZSBmbGFwcHkgaGl0cyBncm91bmRcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxNDAsIDEuMDAsIDAuNzQpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoY29tbW9uTXNnLndoZW4oKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShza2luLmNvbGxpZGVHcm91bmRJY29uKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKS5hcHBlbmRUaXRsZShtc2cud2hlbkNvbGxpZGVHcm91bmQoKSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KGZhbHNlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2hlbkNvbGxpZGVHcm91bmRUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGhhbmRsaW5nIGNsaWNrIGV2ZW50LlxuICAgIHJldHVybiAnXFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZSA9IHtcbiAgICAvLyBCbG9jayB0byBoYW5kbGUgZXZlbnQgd2hlcmUgZmxhcHB5IGhpdHMgYSBPYnN0YWNsZVxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE0MCwgMS4wMCwgMC43NCk7XG4gICAgICBpZiAoaXNLMSkge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShjb21tb25Nc2cud2hlbigpKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZEltYWdlKHNraW4uY29sbGlkZU9ic3RhY2xlSWNvbikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KCkuYXBwZW5kVGl0bGUobXNnLndoZW5Db2xsaWRlT2JzdGFjbGUoKSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KGZhbHNlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2hlbkNvbGxpZGVPYnN0YWNsZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBoYW5kbGluZyBjb2xsaWRlIE9ic3RhY2xlIGV2ZW50LlxuICAgIHJldHVybiAnXFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUgPSB7XG4gICAgLy8gQmxvY2sgdG8gaGFuZGxlIGV2ZW50IHdoZXJlIGZsYXBweSBlbnRlcnMgYSBPYnN0YWNsZVxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE0MCwgMS4wMCwgMC43NCk7XG4gICAgICBpZiAoaXNLMSkge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShjb21tb25Nc2cud2hlbigpKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZEltYWdlKHNraW4uZW50ZXJPYnN0YWNsZUljb24pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy53aGVuRW50ZXJPYnN0YWNsZSgpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQoZmFsc2UpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGVuRW50ZXJPYnN0YWNsZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgaGFuZGxpbmcgZW50ZXIgT2JzdGFjbGUuXG4gICAgcmV0dXJuICdcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9mbGFwID0ge1xuICAgIC8vIEJsb2NrIGZvciBmbGFwcGluZyAoZmx5aW5nIHVwd2FyZHMpXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmZsYXAoKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShza2luLmZsYXBJY29uKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKS5hcHBlbmRUaXRsZShtc2cuZmxhcCgpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmZsYXBUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICAvLyAvLyB1c2VkIHRvIGhhdmUgYSBmbGFwcHlfd2hlblJ1bkJ1dHRvbkNsaWNrLlxuICAvLyBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfd2hlblJ1bkJ1dHRvbkNsaWNrID0gYmxvY2tseS5CbG9ja3Mud2hlbl9ydW47XG4gIC8vIGdlbmVyYXRvci5mbGFwcHlfd2hlblJ1bkJ1dHRvbkNsaWNrID0gZ2VuZXJhdG9yLndoZW5fcnVuO1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfZmxhcCA9IGZ1bmN0aW9uICh2ZWxvY2l0eSkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIG1vdmluZyBsZWZ0LlxuICAgIHJldHVybiAnRmxhcHB5LmZsYXAoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9mbGFwX2hlaWdodCA9IHtcbiAgICAvLyBCbG9jayBmb3IgZmxhcHBpbmcgKGZseWluZyB1cHdhcmRzKVxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFUyk7XG4gICAgICBkcm9wZG93bi5zZXRWYWx1ZSh0aGlzLlZBTFVFU1szXVsxXSk7IC8vIGRlZmF1bHQgdG8gbm9ybWFsXG5cbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1ZBTFVFJyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5mbGFwVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X2ZsYXBfaGVpZ2h0LlZBTFVFUyA9XG4gICAgICBbW21zZy5mbGFwUmFuZG9tKCksIFJBTkRPTV9WQUxVRV0sXG4gICAgICAgW21zZy5mbGFwVmVyeVNtYWxsKCksICdGbGFwcHkuRmxhcEhlaWdodC5WRVJZX1NNQUxMJ10sXG4gICAgICAgW21zZy5mbGFwU21hbGwoKSwgJ0ZsYXBweS5GbGFwSGVpZ2h0LlNNQUxMJ10sXG4gICAgICAgW21zZy5mbGFwTm9ybWFsKCksICdGbGFwcHkuRmxhcEhlaWdodC5OT1JNQUwnXSxcbiAgICAgICBbbXNnLmZsYXBMYXJnZSgpLCAnRmxhcHB5LkZsYXBIZWlnaHQuTEFSR0UnXSxcbiAgICAgICBbbXNnLmZsYXBWZXJ5TGFyZ2UoKSwgJ0ZsYXBweS5GbGFwSGVpZ2h0LlZFUllfTEFSR0UnXV07XG5cbiAgZ2VuZXJhdG9yLmZsYXBweV9mbGFwX2hlaWdodCA9IGZ1bmN0aW9uICh2ZWxvY2l0eSkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ2ZsYXAnKTtcbiAgfTtcblxuICBmdW5jdGlvbiBvblNvdW5kU2VsZWN0ZWQoc291bmRWYWx1ZSkge1xuICAgIGlmIChzb3VuZFZhbHVlID09PSBSQU5ET01fVkFMVUUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3R1ZGlvQXBwLnBsYXlBdWRpbyh1dGlscy5zdHJpcFF1b3Rlcyhzb3VuZFZhbHVlKSk7XG4gIH1cblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfcGxheVNvdW5kID0ge1xuICAgIC8vIEJsb2NrIGZvciBwbGF5aW5nIHNvdW5kLlxuICAgIFdJTkdfRkxBUF9TT1VORDogJ1wic2Z4X3dpbmdcIicsXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5WQUxVRVMgPSBpc0sxID8gdGhpcy5rMVNvdW5kQ2hvaWNlcyA6IHRoaXMuc291bmRDaG9pY2VzO1xuICAgICAgdmFyIHNvdW5kRHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUVTLCBvblNvdW5kU2VsZWN0ZWQpO1xuICAgICAgc291bmREcm9wZG93bi5zZXRWYWx1ZSh0aGlzLldJTkdfRkxBUF9TT1VORCk7XG5cbiAgICAgIGlmIChpc0sxKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGNvbW1vbk1zZy5wbGF5KCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkSW1hZ2Uoc2tpbi5zb3VuZEljb24pKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShzb3VuZERyb3Bkb3duLCAnVkFMVUUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpLmFwcGVuZFRpdGxlKHNvdW5kRHJvcGRvd24sICdWQUxVRScpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cucGxheVNvdW5kVG9vbHRpcCgpKTtcbiAgICB9LFxuICAgIGdldCBrMVNvdW5kQ2hvaWNlcygpIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIFttc2cuc291bmRSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICAgW21zZy5zb3VuZEJvdW5jZSgpLCAnXCJ3YWxsXCInXSxcbiAgICAgICAgW21zZy5zb3VuZENydW5jaCgpLCAnXCJ3YWxsMFwiJ10sXG4gICAgICAgIFttc2cuc291bmREaWUoKSwgJ1wic2Z4X2RpZVwiJ10sXG4gICAgICAgIFttc2cuc291bmRIaXQoKSwgJ1wic2Z4X2hpdFwiJ10sXG4gICAgICAgIFttc2cuc291bmRQb2ludCgpLCAnXCJzZnhfcG9pbnRcIiddLFxuICAgICAgICBbbXNnLnNvdW5kU3dvb3NoKCksICdcInNmeF9zd29vc2hpbmdcIiddLFxuICAgICAgICBbbXNnLnNvdW5kV2luZygpLCB0aGlzLldJTkdfRkxBUF9TT1VORF0sXG4gICAgICAgIFttc2cuc291bmRKZXQoKSwgJ1wiamV0XCInXSxcbiAgICAgICAgW21zZy5zb3VuZENyYXNoKCksICdcImNyYXNoXCInXSxcbiAgICAgICAgW21zZy5zb3VuZEppbmdsZSgpLCAnXCJqaW5nbGVcIiddLFxuICAgICAgICBbbXNnLnNvdW5kU3BsYXNoKCksICdcInNwbGFzaFwiJ10sXG4gICAgICAgIFttc2cuc291bmRMYXNlcigpLCAnXCJsYXNlclwiJ11cbiAgICAgIF07XG4gICAgfSxcbiAgICBnZXQgc291bmRDaG9pY2VzKCkge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgW21zZy5wbGF5U291bmRSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICAgW21zZy5wbGF5U291bmRCb3VuY2UoKSwgJ1wid2FsbFwiJ10sXG4gICAgICAgIFttc2cucGxheVNvdW5kQ3J1bmNoKCksICdcIndhbGwwXCInXSxcbiAgICAgICAgW21zZy5wbGF5U291bmREaWUoKSwgJ1wic2Z4X2RpZVwiJ10sXG4gICAgICAgIFttc2cucGxheVNvdW5kSGl0KCksICdcInNmeF9oaXRcIiddLFxuICAgICAgICBbbXNnLnBsYXlTb3VuZFBvaW50KCksICdcInNmeF9wb2ludFwiJ10sXG4gICAgICAgIFttc2cucGxheVNvdW5kU3dvb3NoKCksICdcInNmeF9zd29vc2hpbmdcIiddLFxuICAgICAgICBbbXNnLnBsYXlTb3VuZFdpbmcoKSwgdGhpcy5XSU5HX0ZMQVBfU09VTkRdLFxuICAgICAgICBbbXNnLnBsYXlTb3VuZEpldCgpLCAnXCJqZXRcIiddLFxuICAgICAgICBbbXNnLnBsYXlTb3VuZENyYXNoKCksICdcImNyYXNoXCInXSxcbiAgICAgICAgW21zZy5wbGF5U291bmRKaW5nbGUoKSwgJ1wiamluZ2xlXCInXSxcbiAgICAgICAgW21zZy5wbGF5U291bmRTcGxhc2goKSwgJ1wic3BsYXNoXCInXSxcbiAgICAgICAgW21zZy5wbGF5U291bmRMYXNlcigpLCAnXCJsYXNlclwiJ11cbiAgICAgIF07XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfcGxheVNvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlU2V0dGVyQ29kZSh0aGlzLCAncGxheVNvdW5kJyk7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X2luY3JlbWVudFBsYXllclNjb3JlID0ge1xuICAgIC8vIEJsb2NrIGZvciBpbmNyZW1lbnRpbmcgdGhlIHBsYXllcidzIHNjb3JlLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIGlmIChpc0sxKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGNvbW1vbk1zZy5zY29yZSgpKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZEltYWdlKHNraW4uc2NvcmVDYXJkKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuaW5jcmVtZW50UGxheWVyU2NvcmUoKSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmluY3JlbWVudFBsYXllclNjb3JlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmZsYXBweV9pbmNyZW1lbnRQbGF5ZXJTY29yZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGluY3JlbWVudGluZyB0aGUgcGxheWVyJ3Mgc2NvcmUuXG4gICAgcmV0dXJuICdGbGFwcHkuaW5jcmVtZW50UGxheWVyU2NvcmUoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9lbmRHYW1lID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIGlmIChpc0sxKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGNvbW1vbk1zZy5lbmQoKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShza2luLmVuZEljb24pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpLmFwcGVuZFRpdGxlKG1zZy5lbmRHYW1lKCkpO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuZW5kR2FtZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfZW5kR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGluY3JlbWVudGluZyB0aGUgcGxheWVyJ3Mgc2NvcmUuXG4gICAgcmV0dXJuICdGbGFwcHkuZW5kR2FtZShcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgLyoqXG4gICAqIHNldFNwZWVkXG4gICAqL1xuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0U3BlZWQgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigzMTIsIDAuMzIsIDAuNjIpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgdmFyIGZpZWxkSW1hZ2VEcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bih0aGlzLksxX1ZBTFVFUywgNjMsIDMzKTtcbiAgICAgICAgZmllbGRJbWFnZURyb3Bkb3duLnNldFZhbHVlKHRoaXMuSzFfVkFMVUVTWzFdWzFdKTsgLy8gZGVmYXVsdCB0byBub3JtYWxcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLnNldFNwZWVkKCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGZpZWxkSW1hZ2VEcm9wZG93biwgJ1ZBTFVFJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUVTKTtcbiAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5WQUxVRVNbM11bMV0pOyAvLyBkZWZhdWx0IHRvIG5vcm1hbFxuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKS5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1ZBTFVFJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnNldFNwZWVkVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldFNwZWVkLksxX1ZBTFVFUyA9XG4gICAgW1tza2luLnNwZWVkU2xvdywgJ0ZsYXBweS5MZXZlbFNwZWVkLlNMT1cnXSxcbiAgICAgIFtza2luLnNwZWVkTWVkaXVtLCAnRmxhcHB5LkxldmVsU3BlZWQuTk9STUFMJ10sXG4gICAgICBbc2tpbi5zcGVlZEZhc3QsICdGbGFwcHkuTGV2ZWxTcGVlZC5GQVNUJ11dO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRTcGVlZC5WQUxVRVMgPVxuICAgICAgW1ttc2cuc3BlZWRSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNwZWVkVmVyeVNsb3coKSwgJ0ZsYXBweS5MZXZlbFNwZWVkLlZFUllfU0xPVyddLFxuICAgICAgIFttc2cuc3BlZWRTbG93KCksICdGbGFwcHkuTGV2ZWxTcGVlZC5TTE9XJ10sXG4gICAgICAgW21zZy5zcGVlZE5vcm1hbCgpLCAnRmxhcHB5LkxldmVsU3BlZWQuTk9STUFMJ10sXG4gICAgICAgW21zZy5zcGVlZEZhc3QoKSwgJ0ZsYXBweS5MZXZlbFNwZWVkLkZBU1QnXSxcbiAgICAgICBbbXNnLnNwZWVkVmVyeUZhc3QoKSwgJ0ZsYXBweS5MZXZlbFNwZWVkLlZFUllfRkFTVCddXTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3NldFNwZWVkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlU2V0dGVyQ29kZSh0aGlzLCAnc2V0U3BlZWQnKTtcbiAgfTtcblxuICAvKipcbiAgICogc2V0R2FwSGVpZ2h0XG4gICAqL1xuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0R2FwSGVpZ2h0ID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFUyk7XG4gICAgICBkcm9wZG93bi5zZXRWYWx1ZSh0aGlzLlZBTFVFU1szXVsxXSk7ICAvLyBkZWZhdWx0IHRvIG5vcm1hbFxuXG4gICAgICB0aGlzLnNldEhTVigzMTIsIDAuMzIsIDAuNjIpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5zZXRHYXBIZWlnaHRUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0R2FwSGVpZ2h0LlZBTFVFUyA9XG4gICAgICBbW21zZy5zZXRHYXBSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldEdhcFZlcnlTbWFsbCgpLCAnRmxhcHB5LkdhcEhlaWdodC5WRVJZX1NNQUxMJ10sXG4gICAgICAgW21zZy5zZXRHYXBTbWFsbCgpLCAnRmxhcHB5LkdhcEhlaWdodC5TTUFMTCddLFxuICAgICAgIFttc2cuc2V0R2FwTm9ybWFsKCksICdGbGFwcHkuR2FwSGVpZ2h0Lk5PUk1BTCddLFxuICAgICAgIFttc2cuc2V0R2FwTGFyZ2UoKSwgJ0ZsYXBweS5HYXBIZWlnaHQuTEFSR0UnXSxcbiAgICAgICBbbXNnLnNldEdhcFZlcnlMYXJnZSgpLCAnRmxhcHB5LkdhcEhlaWdodC5WRVJZX0xBUkdFJ11dO1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfc2V0R2FwSGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlU2V0dGVyQ29kZSh0aGlzLCAnc2V0R2FwSGVpZ2h0Jyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIHNldEJhY2tncm91bmRcbiAgICovXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRCYWNrZ3JvdW5kID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHZhciBkcm9wZG93bjtcbiAgICAgIHZhciBpbnB1dCA9IHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobXNnLnNldEJhY2tncm91bmQoKSk7XG4gICAgICAgIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGRJbWFnZURyb3Bkb3duKHRoaXMuSzFfQ0hPSUNFUywgNTAsIDMwKTtcbiAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUoRkxBUFBZX1ZBTFVFKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFUyk7XG4gICAgICAgIGRyb3Bkb3duLnNldFZhbHVlKEZMQVBQWV9WQUxVRSk7XG4gICAgICB9XG5cbiAgICAgIGlucHV0LmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVkFMVUUnKTtcblxuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5zZXRCYWNrZ3JvdW5kVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldEJhY2tncm91bmQuVkFMVUVTID1cbiAgICAgIFtbbXNnLnNldEJhY2tncm91bmRSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldEJhY2tncm91bmRGbGFwcHkoKSwgRkxBUFBZX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldEJhY2tncm91bmROaWdodCgpLCAnXCJuaWdodFwiJ10sXG4gICAgICAgW21zZy5zZXRCYWNrZ3JvdW5kU2NpRmkoKSwgJ1wic2NpZmlcIiddLFxuICAgICAgIFttc2cuc2V0QmFja2dyb3VuZFVuZGVyd2F0ZXIoKSwgJ1widW5kZXJ3YXRlclwiJ10sXG4gICAgICAgW21zZy5zZXRCYWNrZ3JvdW5kQ2F2ZSgpLCAnXCJjYXZlXCInXSxcbiAgICAgICBbbXNnLnNldEJhY2tncm91bmRTYW50YSgpLCAnXCJzYW50YVwiJ11dO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRCYWNrZ3JvdW5kLksxX0NIT0lDRVMgPVxuICAgICAgW1tza2luLmJhY2tncm91bmQsIEZMQVBQWV9WQUxVRV0sXG4gICAgICAgW3NraW4ubmlnaHQuYmFja2dyb3VuZCwgJ1wibmlnaHRcIiddLFxuICAgICAgIFtza2luLnNjaWZpLmJhY2tncm91bmQsICdcInNjaWZpXCInXSxcbiAgICAgICBbc2tpbi51bmRlcndhdGVyLmJhY2tncm91bmQsICdcInVuZGVyd2F0ZXJcIiddLFxuICAgICAgIFtza2luLmNhdmUuYmFja2dyb3VuZCwgJ1wiY2F2ZVwiJ10sXG4gICAgICAgW3NraW4uc2FudGEuYmFja2dyb3VuZCwgJ1wic2FudGFcIiddLFxuICAgICAgIFtza2luLnJhbmRvbVB1cnBsZUljb24sIFJBTkRPTV9WQUxVRV1dO1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfc2V0QmFja2dyb3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ3NldEJhY2tncm91bmQnKTtcbiAgfTtcblxuICAvKipcbiAgICogc2V0UGxheWVyXG4gICAqL1xuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0UGxheWVyID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHZhciBkcm9wZG93bjtcbiAgICAgIHZhciBpbnB1dCA9IHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobXNnLnNldFBsYXllcigpKTtcbiAgICAgICAgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZEltYWdlRHJvcGRvd24odGhpcy5LMV9DSE9JQ0VTLCAzNCwgMjQpO1xuICAgICAgICBkcm9wZG93bi5zZXRWYWx1ZShGTEFQUFlfVkFMVUUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUVTKTtcbiAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUoRkxBUFBZX1ZBTFVFKTtcbiAgICAgIH1cbiAgICAgIGlucHV0LmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVkFMVUUnKTtcblxuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5zZXRQbGF5ZXJUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0UGxheWVyLlZBTFVFUyA9XG4gICAgICBbW21zZy5zZXRQbGF5ZXJSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldFBsYXllckZsYXBweSgpLCBGTEFQUFlfVkFMVUVdLFxuICAgICAgIFttc2cuc2V0UGxheWVyUmVkQmlyZCgpLCAnXCJyZWRiaXJkXCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllclNjaUZpKCksICdcInNjaWZpXCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllclVuZGVyd2F0ZXIoKSwgJ1widW5kZXJ3YXRlclwiJ10sXG4gICAgICAgW21zZy5zZXRQbGF5ZXJTYW50YSgpLCAnXCJzYW50YVwiJ10sXG4gICAgICAgW21zZy5zZXRQbGF5ZXJDYXZlKCksICdcImNhdmVcIiddLFxuICAgICAgIFttc2cuc2V0UGxheWVyU2hhcmsoKSwgJ1wic2hhcmtcIiddLFxuICAgICAgIFttc2cuc2V0UGxheWVyRWFzdGVyKCksICdcImVhc3RlclwiJ10sXG4gICAgICAgW21zZy5zZXRQbGF5ZXJCYXRtYW4oKSwgJ1wiYmF0bWFuXCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllclN1Ym1hcmluZSgpLCAnXCJzdWJtYXJpbmVcIiddLFxuICAgICAgIFttc2cuc2V0UGxheWVyVW5pY29ybigpLCAnXCJ1bmljb3JuXCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllckZhaXJ5KCksICdcImZhaXJ5XCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllclN1cGVybWFuKCksICdcInN1cGVybWFuXCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllclR1cmtleSgpLCAnXCJ0dXJrZXlcIiddXTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0UGxheWVyLksxX0NIT0lDRVMgPVxuICAgICAgW1tza2luLmF2YXRhciwgRkxBUFBZX1ZBTFVFXSxcbiAgICAgICBbc2tpbi5yZWRiaXJkLmF2YXRhciwgJ1wicmVkYmlyZFwiJ10sXG4gICAgICAgW3NraW4uc2NpZmkuYXZhdGFyLCAnXCJzY2lmaVwiJ10sXG4gICAgICAgW3NraW4udW5kZXJ3YXRlci5hdmF0YXIsICdcInVuZGVyd2F0ZXJcIiddLFxuICAgICAgIFtza2luLnNhbnRhLmF2YXRhciwgJ1wic2FudGFcIiddLFxuICAgICAgIFtza2luLmNhdmUuYXZhdGFyLCAnXCJjYXZlXCInXSxcbiAgICAgICBbc2tpbi5zaGFyay5hdmF0YXIsICdcInNoYXJrXCInXSxcbiAgICAgICBbc2tpbi5lYXN0ZXIuYXZhdGFyLCAnXCJlYXN0ZXJcIiddLFxuICAgICAgIFtza2luLmJhdG1hbi5hdmF0YXIsICdcImJhdG1hblwiJ10sXG4gICAgICAgW3NraW4uc3VibWFyaW5lLmF2YXRhciwgJ1wic3VibWFyaW5lXCInXSxcbiAgICAgICBbc2tpbi51bmljb3JuLmF2YXRhciwgJ1widW5pY29yblwiJ10sXG4gICAgICAgW3NraW4uZmFpcnkuYXZhdGFyLCAnXCJmYWlyeVwiJ10sXG4gICAgICAgW3NraW4uc3VwZXJtYW4uYXZhdGFyLCAnXCJzdXBlcm1hblwiJ10sXG4gICAgICAgW3NraW4udHVya2V5LmF2YXRhciwgJ1widHVya2V5XCInXSxcbiAgICAgICBbc2tpbi5yYW5kb21QdXJwbGVJY29uLCBSQU5ET01fVkFMVUVdXTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3NldFBsYXllciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ3NldFBsYXllcicpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBzZXRPYnN0YWNsZVxuICAgKi9cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldE9ic3RhY2xlID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHZhciBkcm9wZG93bjtcbiAgICAgIHZhciBpbnB1dCA9IHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobXNnLnNldE9ic3RhY2xlKCkpO1xuICAgICAgICBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bih0aGlzLksxX0NIT0lDRVMsIDUwLCAzMCk7XG4gICAgICAgIGRyb3Bkb3duLnNldFZhbHVlKEZMQVBQWV9WQUxVRSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRVMpO1xuICAgICAgICBkcm9wZG93bi5zZXRWYWx1ZShGTEFQUFlfVkFMVUUpO1xuICAgICAgfVxuXG4gICAgICBpbnB1dC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1ZBTFVFJyk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnNldE9ic3RhY2xlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldE9ic3RhY2xlLlZBTFVFUyA9XG4gICAgICBbW21zZy5zZXRPYnN0YWNsZVJhbmRvbSgpLCBSQU5ET01fVkFMVUVdLFxuICAgICAgIFttc2cuc2V0T2JzdGFjbGVGbGFwcHkoKSwgRkxBUFBZX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldE9ic3RhY2xlU2NpRmkoKSwgJ1wic2NpZmlcIiddLFxuICAgICAgIFttc2cuc2V0T2JzdGFjbGVVbmRlcndhdGVyKCksICdcInVuZGVyd2F0ZXJcIiddLFxuICAgICAgIFttc2cuc2V0T2JzdGFjbGVDYXZlKCksICdcImNhdmVcIiddLFxuICAgICAgIFttc2cuc2V0T2JzdGFjbGVTYW50YSgpLCAnXCJzYW50YVwiJ10sXG4gICAgICAgW21zZy5zZXRPYnN0YWNsZUxhc2VyKCksICdcImxhc2VyXCInXV07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldE9ic3RhY2xlLksxX0NIT0lDRVMgPVxuICAgICAgW1tza2luLm9ic3RhY2xlX2JvdHRvbV90aHVtYiwgRkxBUFBZX1ZBTFVFXSxcbiAgICAgICBbc2tpbi5zY2lmaS5vYnN0YWNsZV9ib3R0b21fdGh1bWIsICdcInNjaWZpXCInXSxcbiAgICAgICBbc2tpbi51bmRlcndhdGVyLm9ic3RhY2xlX2JvdHRvbV90aHVtYiwgJ1widW5kZXJ3YXRlclwiJ10sXG4gICAgICAgW3NraW4uY2F2ZS5vYnN0YWNsZV9ib3R0b21fdGh1bWIsICdcImNhdmVcIiddLFxuICAgICAgIFtza2luLnNhbnRhLm9ic3RhY2xlX2JvdHRvbV90aHVtYiwgJ1wic2FudGFcIiddLFxuICAgICAgIFtza2luLmxhc2VyLm9ic3RhY2xlX2JvdHRvbV90aHVtYiwgJ1wibGFzZXJcIiddLFxuICAgICAgIFtza2luLnJhbmRvbVB1cnBsZUljb24sIFJBTkRPTV9WQUxVRV1dO1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfc2V0T2JzdGFjbGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZ2VuZXJhdGVTZXR0ZXJDb2RlKHRoaXMsICdzZXRPYnN0YWNsZScpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBzZXRHcm91bmRcbiAgICovXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRHcm91bmQgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigzMTIsIDAuMzIsIDAuNjIpO1xuICAgICAgdmFyIGRyb3Bkb3duO1xuICAgICAgdmFyIGlucHV0ID0gdGhpcy5hcHBlbmREdW1teUlucHV0KCk7XG4gICAgICBpZiAoaXNLMSkge1xuICAgICAgICBpbnB1dC5hcHBlbmRUaXRsZShtc2cuc2V0R3JvdW5kKCkpO1xuICAgICAgICBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bih0aGlzLksxX0NIT0lDRVMsIDUwLCAzMCk7XG4gICAgICAgIGRyb3Bkb3duLnNldFZhbHVlKEZMQVBQWV9WQUxVRSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRVMpO1xuICAgICAgICBkcm9wZG93bi5zZXRWYWx1ZShGTEFQUFlfVkFMVUUpO1xuICAgICAgfVxuICAgICAgaW5wdXQuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuXG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnNldEdyb3VuZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRHcm91bmQuVkFMVUVTID1cbiAgICAgIFtbbXNnLnNldEdyb3VuZFJhbmRvbSgpLCBSQU5ET01fVkFMVUVdLFxuICAgICAgIFttc2cuc2V0R3JvdW5kRmxhcHB5KCksIEZMQVBQWV9WQUxVRV0sXG4gICAgICAgW21zZy5zZXRHcm91bmRTY2lGaSgpLCAnXCJzY2lmaVwiJ10sXG4gICAgICAgW21zZy5zZXRHcm91bmRVbmRlcndhdGVyKCksICdcInVuZGVyd2F0ZXJcIiddLFxuICAgICAgIFttc2cuc2V0R3JvdW5kQ2F2ZSgpLCAnXCJjYXZlXCInXSxcbiAgICAgICBbbXNnLnNldEdyb3VuZFNhbnRhKCksICdcInNhbnRhXCInXSxcbiAgICAgICBbbXNnLnNldEdyb3VuZExhdmEoKSwgJ1wibGF2YVwiJ11dO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRHcm91bmQuSzFfQ0hPSUNFUyA9XG4gICAgICBbW3NraW4uZ3JvdW5kX3RodW1iLCBGTEFQUFlfVkFMVUVdLFxuICAgICAgIFtza2luLnNjaWZpLmdyb3VuZF90aHVtYiwgJ1wic2NpZmlcIiddLFxuICAgICAgIFtza2luLnVuZGVyd2F0ZXIuZ3JvdW5kX3RodW1iLCAnXCJ1bmRlcndhdGVyXCInXSxcbiAgICAgICBbc2tpbi5jYXZlLmdyb3VuZF90aHVtYiwgJ1wiY2F2ZVwiJ10sXG4gICAgICAgW3NraW4uc2FudGEuZ3JvdW5kX3RodW1iLCAnXCJzYW50YVwiJ10sXG4gICAgICAgW3NraW4ubGF2YS5ncm91bmRfdGh1bWIsICdcImxhdmFcIiddLFxuICAgICAgIFtza2luLnJhbmRvbVB1cnBsZUljb24sIFJBTkRPTV9WQUxVRV1dO1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfc2V0R3JvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlU2V0dGVyQ29kZSh0aGlzLCAnc2V0R3JvdW5kJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIHNldEdyYXZpdHlcbiAgICovXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRHcmF2aXR5ID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFUyk7XG4gICAgICBkcm9wZG93bi5zZXRWYWx1ZSh0aGlzLlZBTFVFU1szXVsxXSk7ICAvLyBkZWZhdWx0IHRvIG5vcm1hbFxuXG4gICAgICB0aGlzLnNldEhTVigzMTIsIDAuMzIsIDAuNjIpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5zZXRHcmF2aXR5VG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldEdyYXZpdHkuVkFMVUVTID1cbiAgICAgIFtbbXNnLnNldEdyYXZpdHlSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldEdyYXZpdHlWZXJ5TG93KCksICdGbGFwcHkuR3Jhdml0eS5WRVJZX0xPVyddLFxuICAgICAgIFttc2cuc2V0R3Jhdml0eUxvdygpLCAnRmxhcHB5LkdyYXZpdHkuTE9XJ10sXG4gICAgICAgW21zZy5zZXRHcmF2aXR5Tm9ybWFsKCksICdGbGFwcHkuR3Jhdml0eS5OT1JNQUwnXSxcbiAgICAgICBbbXNnLnNldEdyYXZpdHlIaWdoKCksICdGbGFwcHkuR3Jhdml0eS5ISUdIJ10sXG4gICAgICAgW21zZy5zZXRHcmF2aXR5VmVyeUhpZ2goKSwgJ0ZsYXBweS5HcmF2aXR5LlZFUllfSElHSCddXG4gICAgICBdO1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfc2V0R3Jhdml0eSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ3NldEdyYXZpdHknKTtcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0U2NvcmUgPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXIgb2YgcGl4ZWxzLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRTY29yZSgpKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnMCcsXG4gICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdWQUxVRScpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5zZXRTY29yZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfc2V0U2NvcmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mXG4gICAgLy8gcGl4ZWxzLlxuICAgIHZhciB2YWx1ZSA9IHdpbmRvdy5wYXJzZUludCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJyksIDEwKTtcbiAgICByZXR1cm4gJ0ZsYXBweS5zZXRTY29yZShcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcsICcgKyB2YWx1ZSArICcpO1xcbic7XG4gIH07XG5cbiAgZGVsZXRlIGJsb2NrbHkuQmxvY2tzLnByb2NlZHVyZXNfZGVmcmV0dXJuO1xuICBkZWxldGUgYmxvY2tseS5CbG9ja3MucHJvY2VkdXJlc19pZnJldHVybjtcbn07XG4iLCIvLyBsb2NhbGUgZm9yIGZsYXBweVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5ibG9ja2x5LmZsYXBweV9sb2NhbGU7XG4iLCJ2YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xuXG5leHBvcnRzLkZsYXBIZWlnaHQgPSB7XG4gIFZFUllfU01BTEw6IC02LFxuICBTTUFMTDogLTgsXG4gIE5PUk1BTDogLTExLFxuICBMQVJHRTogLTEzLFxuICBWRVJZX0xBUkdFOiAtMTVcbn07XG5cbmV4cG9ydHMuTGV2ZWxTcGVlZCA9IHtcbiAgVkVSWV9TTE9XOiAxLFxuICBTTE9XOiAzLFxuICBOT1JNQUw6IDQsXG4gIEZBU1Q6IDYsXG4gIFZFUllfRkFTVDogOFxufTtcblxuZXhwb3J0cy5HYXBIZWlnaHQgPSB7XG4gIFZFUllfU01BTEw6IDY1LFxuICBTTUFMTDogNzUsXG4gIE5PUk1BTDogMTAwLFxuICBMQVJHRTogMTI1LFxuICBWRVJZX0xBUkdFOiAxNTBcbn07XG5cbmV4cG9ydHMuR3Jhdml0eSA9IHtcbiAgVkVSWV9MT1c6IDAuNSxcbiAgTE9XOiAwLjc1LFxuICBOT1JNQUw6IDEsXG4gIEhJR0g6IDEuMjUsXG4gIFZFUllfSElHSDogMS41XG59O1xuXG5leHBvcnRzLnJhbmRvbSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgdmFyIGtleSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHZhbHVlcy5sZW5ndGgpO1xuICByZXR1cm4gdmFsdWVzW2tleV07XG59O1xuXG5leHBvcnRzLnNldFNjb3JlID0gZnVuY3Rpb24gKGlkLCB2YWx1ZSkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgRmxhcHB5LnBsYXllclNjb3JlID0gdmFsdWU7XG4gIEZsYXBweS5kaXNwbGF5U2NvcmUoKTtcbn07XG5cbmV4cG9ydHMuc2V0R3Jhdml0eSA9IGZ1bmN0aW9uIChpZCwgdmFsdWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5ncmF2aXR5ID0gdmFsdWU7XG59O1xuXG5leHBvcnRzLnNldEdyb3VuZCA9IGZ1bmN0aW9uIChpZCwgdmFsdWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5zZXRHcm91bmQodmFsdWUpO1xufTtcblxuZXhwb3J0cy5zZXRPYnN0YWNsZSA9IGZ1bmN0aW9uIChpZCwgdmFsdWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5zZXRPYnN0YWNsZSh2YWx1ZSk7XG59O1xuXG5leHBvcnRzLnNldFBsYXllciA9IGZ1bmN0aW9uIChpZCwgdmFsdWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5zZXRQbGF5ZXIodmFsdWUpO1xufTtcblxuZXhwb3J0cy5zZXRHYXBIZWlnaHQgPSBmdW5jdGlvbiAoaWQsIHZhbHVlKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBGbGFwcHkuc2V0R2FwSGVpZ2h0KHZhbHVlKTtcbn07XG5cbmV4cG9ydHMuc2V0QmFja2dyb3VuZCA9IGZ1bmN0aW9uIChpZCwgdmFsdWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5zZXRCYWNrZ3JvdW5kKHZhbHVlKTtcbn07XG5cbmV4cG9ydHMuc2V0U3BlZWQgPSBmdW5jdGlvbiAoaWQsIHZhbHVlKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBGbGFwcHkuU1BFRUQgPSB2YWx1ZTtcbn07XG5cbmV4cG9ydHMucGxheVNvdW5kID0gZnVuY3Rpb24oaWQsIHNvdW5kTmFtZSkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgc3R1ZGlvQXBwLnBsYXlBdWRpbyhzb3VuZE5hbWUpO1xufTtcblxuZXhwb3J0cy5mbGFwID0gZnVuY3Rpb24gKGlkLCBhbW91bnQpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5mbGFwKGFtb3VudCk7XG59O1xuXG5leHBvcnRzLmVuZEdhbWUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5nYW1lU3RhdGUgPSBGbGFwcHkuR2FtZVN0YXRlcy5FTkRJTkc7XG59O1xuXG5leHBvcnRzLmluY3JlbWVudFBsYXllclNjb3JlID0gZnVuY3Rpb24oaWQpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5wbGF5ZXJTY29yZSsrO1xuICBGbGFwcHkuZGlzcGxheVNjb3JlKCk7XG59O1xuIl19
