require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ubuntu/adhoc/apps/build/js/flappy/main.js":[function(require,module,exports){
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
},{"../appMain":"/home/ubuntu/adhoc/apps/build/js/appMain.js","./blocks":"/home/ubuntu/adhoc/apps/build/js/flappy/blocks.js","./flappy":"/home/ubuntu/adhoc/apps/build/js/flappy/flappy.js","./levels":"/home/ubuntu/adhoc/apps/build/js/flappy/levels.js","./skins":"/home/ubuntu/adhoc/apps/build/js/flappy/skins.js"}],"/home/ubuntu/adhoc/apps/build/js/flappy/skins.js":[function(require,module,exports){
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

},{"../skins":"/home/ubuntu/adhoc/apps/build/js/skins.js"}],"/home/ubuntu/adhoc/apps/build/js/flappy/levels.js":[function(require,module,exports){
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

},{"../block_utils":"/home/ubuntu/adhoc/apps/build/js/block_utils.js","../utils":"/home/ubuntu/adhoc/apps/build/js/utils.js","./constants":"/home/ubuntu/adhoc/apps/build/js/flappy/constants.js","./locale":"/home/ubuntu/adhoc/apps/build/js/flappy/locale.js"}],"/home/ubuntu/adhoc/apps/build/js/flappy/flappy.js":[function(require,module,exports){
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

},{"../StudioApp":"/home/ubuntu/adhoc/apps/build/js/StudioApp.js","../codegen":"/home/ubuntu/adhoc/apps/build/js/codegen.js","../dom":"/home/ubuntu/adhoc/apps/build/js/dom.js","../dropletUtils":"/home/ubuntu/adhoc/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/adhoc/apps/build/js/locale.js","../skins":"/home/ubuntu/adhoc/apps/build/js/skins.js","../templates/page.html.ejs":"/home/ubuntu/adhoc/apps/build/js/templates/page.html.ejs","../utils":"/home/ubuntu/adhoc/apps/build/js/utils.js","./api":"/home/ubuntu/adhoc/apps/build/js/flappy/api.js","./constants":"/home/ubuntu/adhoc/apps/build/js/flappy/constants.js","./controls.html.ejs":"/home/ubuntu/adhoc/apps/build/js/flappy/controls.html.ejs","./locale":"/home/ubuntu/adhoc/apps/build/js/flappy/locale.js","./visualization.html.ejs":"/home/ubuntu/adhoc/apps/build/js/flappy/visualization.html.ejs"}],"/home/ubuntu/adhoc/apps/build/js/flappy/visualization.html.ejs":[function(require,module,exports){
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
},{"ejs":"/home/ubuntu/adhoc/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/adhoc/apps/build/js/flappy/controls.html.ejs":[function(require,module,exports){
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
},{"../locale":"/home/ubuntu/adhoc/apps/build/js/locale.js","ejs":"/home/ubuntu/adhoc/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/adhoc/apps/build/js/flappy/constants.js":[function(require,module,exports){
"use strict";

module.exports = {
  WORKSPACE_BUFFER: 20,
  WORKSPACE_COL_WIDTH: 210,
  WORKSPACE_ROW_HEIGHT: 120,

  AVATAR_HEIGHT: 24,
  AVATAR_WIDTH: 34,
  AVATAR_Y_OFFSET: 0
};

},{}],"/home/ubuntu/adhoc/apps/build/js/flappy/blocks.js":[function(require,module,exports){
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

},{"../StudioApp":"/home/ubuntu/adhoc/apps/build/js/StudioApp.js","../block_utils":"/home/ubuntu/adhoc/apps/build/js/block_utils.js","../locale":"/home/ubuntu/adhoc/apps/build/js/locale.js","../utils":"/home/ubuntu/adhoc/apps/build/js/utils.js","./locale":"/home/ubuntu/adhoc/apps/build/js/flappy/locale.js"}],"/home/ubuntu/adhoc/apps/build/js/flappy/locale.js":[function(require,module,exports){
// locale for flappy

"use strict";

module.exports = window.blockly.flappy_locale;

},{}],"/home/ubuntu/adhoc/apps/build/js/flappy/api.js":[function(require,module,exports){
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

},{"../StudioApp":"/home/ubuntu/adhoc/apps/build/js/StudioApp.js"}]},{},["/home/ubuntu/adhoc/apps/build/js/flappy/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9mbGFwcHkvbWFpbi5qcyIsImJ1aWxkL2pzL2ZsYXBweS9za2lucy5qcyIsImJ1aWxkL2pzL2ZsYXBweS9sZXZlbHMuanMiLCJidWlsZC9qcy9mbGFwcHkvZmxhcHB5LmpzIiwiYnVpbGQvanMvZmxhcHB5L3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9mbGFwcHkvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9mbGFwcHkvY29uc3RhbnRzLmpzIiwiYnVpbGQvanMvZmxhcHB5L2Jsb2Nrcy5qcyIsImJ1aWxkL2pzL2ZsYXBweS9sb2NhbGUuanMiLCJidWlsZC9qcy9mbGFwcHkvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUNaQSxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRXBDLElBQUksT0FBTyxHQUFHOztBQUVaLFFBQU0sRUFBRSxFQUNQOztDQUVGLENBQUM7O0FBRUYsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDcEMsTUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEMsTUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7Ozs7O0FBTTlCLE1BQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxjQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQztBQUNqRCxVQUFNLEVBQUUsSUFBSSxD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QU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztDQUN2QixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuRmxhcHB5ID0gcmVxdWlyZSgnLi9mbGFwcHknKTtcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICBnbG9iYWwuRmxhcHB5ID0gd2luZG93LkZsYXBweTtcbn1cbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuL3NraW5zJyk7XG5cbndpbmRvdy5mbGFwcHlNYWluID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgYXBwTWFpbih3aW5kb3cuRmxhcHB5LCBsZXZlbHMsIG9wdGlvbnMpO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbUoxYVd4a0wycHpMMlpzWVhCd2VTOXRZV2x1TG1weklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN096dEJRVUZCTEVsQlFVa3NUMEZCVHl4SFFVRkhMRTlCUVU4c1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF6dEJRVU53UXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0QlFVTndReXhKUVVGSkxFOUJRVThzVFVGQlRTeExRVUZMTEZkQlFWY3NSVUZCUlR0QlFVTnFReXhSUVVGTkxFTkJRVU1zVFVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNN1EwRkRMMEk3UVVGRFJDeEpRVUZKTEUxQlFVMHNSMEZCUnl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03UVVGRGFrTXNTVUZCU1N4TlFVRk5MRWRCUVVjc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzBGQlEycERMRWxCUVVrc1MwRkJTeXhIUVVGSExFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXpzN1FVRkZMMElzVFVGQlRTeERRVUZETEZWQlFWVXNSMEZCUnl4VlFVRlRMRTlCUVU4c1JVRkJSVHRCUVVOd1F5eFRRVUZQTEVOQlFVTXNWMEZCVnl4SFFVRkhMRXRCUVVzc1EwRkJRenRCUVVNMVFpeFRRVUZQTEVOQlFVTXNXVUZCV1N4SFFVRkhMRTFCUVUwc1EwRkJRenRCUVVNNVFpeFRRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRTFCUVUwc1JVRkJSU3hOUVVGTkxFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdRMEZEZWtNc1EwRkJReUlzSW1acGJHVWlPaUpuWlc1bGNtRjBaV1F1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaWRtRnlJR0Z3Y0UxaGFXNGdQU0J5WlhGMWFYSmxLQ2N1TGk5aGNIQk5ZV2x1SnlrN1hHNTNhVzVrYjNjdVJteGhjSEI1SUQwZ2NtVnhkV2x5WlNnbkxpOW1iR0Z3Y0hrbktUdGNibWxtSUNoMGVYQmxiMllnWjJ4dlltRnNJQ0U5UFNBbmRXNWtaV1pwYm1Wa0p5a2dlMXh1SUNCbmJHOWlZV3d1Um14aGNIQjVJRDBnZDJsdVpHOTNMa1pzWVhCd2VUdGNibjFjYm5aaGNpQmliRzlqYTNNZ1BTQnlaWEYxYVhKbEtDY3VMMkpzYjJOcmN5Y3BPMXh1ZG1GeUlHeGxkbVZzY3lBOUlISmxjWFZwY21Vb0p5NHZiR1YyWld4ekp5azdYRzUyWVhJZ2MydHBibk1nUFNCeVpYRjFhWEpsS0NjdUwzTnJhVzV6SnlrN1hHNWNibmRwYm1SdmR5NW1iR0Z3Y0hsTllXbHVJRDBnWm5WdVkzUnBiMjRvYjNCMGFXOXVjeWtnZTF4dUlDQnZjSFJwYjI1ekxuTnJhVzV6VFc5a2RXeGxJRDBnYzJ0cGJuTTdYRzRnSUc5d2RHbHZibk11WW14dlkydHpUVzlrZFd4bElEMGdZbXh2WTJ0ek8xeHVJQ0JoY0hCTllXbHVLSGRwYm1SdmR5NUdiR0Z3Y0hrc0lHeGxkbVZzY3l3Z2IzQjBhVzl1Y3lrN1hHNTlPMXh1SWwxOSIsIi8qKlxuICogTG9hZCBTa2luIGZvciBGbGFwcHkuXG4gKi9cbi8vIGJhY2tncm91bmQ6IE51bWJlciBvZiA0MDB4NDAwIGJhY2tncm91bmQgaW1hZ2VzLiBSYW5kb21seSBzZWxlY3Qgb25lIGlmXG4vLyBzcGVjaWZpZWQsIG90aGVyd2lzZSwgdXNlIGJhY2tncm91bmQucG5nLlxuLy8gZ3JhcGg6IENvbG91ciBvZiBvcHRpb25hbCBncmlkIGxpbmVzLCBvciBmYWxzZS5cblxudmFyIHNraW5zQmFzZSA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG5cbnZhciBDT05GSUdTID0ge1xuXG4gIGZsYXBweToge1xuICB9XG5cbn07XG5cbmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uKGFzc2V0VXJsLCBpZCkge1xuICB2YXIgc2tpbiA9IHNraW5zQmFzZS5sb2FkKGFzc2V0VXJsLCBpZCk7XG4gIHZhciBjb25maWcgPSBDT05GSUdTW3NraW4uaWRdO1xuXG4gIC8vIHRvZG86IHRoZSB3YXkgdGhlc2UgYXJlIG9yZ2FuaXplZCBlbmRzIHVwIGJlaW5nIGEgbGl0dGxlIGJpdCB1Z2x5IGFzXG4gIC8vIGxvdCBvZiBvdXIgYXNzZXRzIGFyZSBpbmRpdmlkdWFsIGl0ZW1zIG5vdCBuZWNlc3NhcmlseSBhdHRhY2hlZCB0byBhXG4gIC8vIHNwZWNpZmljIHRoZW1lXG5cbiAgc2tpbi5zY2lmaSA9IHtcbiAgICBiYWNrZ3JvdW5kOiBza2luLmFzc2V0VXJsKCdiYWNrZ3JvdW5kX3NjaWZpLnBuZycpLFxuICAgIGF2YXRhcjogc2tpbi5hc3NldFVybCgnYXZhdGFyX3NjaWZpLnBuZycpLFxuICAgIG9ic3RhY2xlX2JvdHRvbTogc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfYm90dG9tX3NjaWZpLnBuZycpLFxuICAgIG9ic3RhY2xlX2JvdHRvbV90aHVtYjogc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfYm90dG9tX3NjaWZpX3RodW1iLnBuZycpLFxuICAgIG9ic3RhY2xlX3RvcDogc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfdG9wX3NjaWZpLnBuZycpLFxuICAgIGdyb3VuZDogc2tpbi5hc3NldFVybCgnZ3JvdW5kX3NjaWZpLnBuZycpLFxuICAgIGdyb3VuZF90aHVtYjogc2tpbi5hc3NldFVybCgnZ3JvdW5kX3NjaWZpX3RodW1iLnBuZycpXG4gIH07XG5cbiAgc2tpbi51bmRlcndhdGVyID0ge1xuICAgIGJhY2tncm91bmQ6IHNraW4uYXNzZXRVcmwoJ2JhY2tncm91bmRfdW5kZXJ3YXRlci5wbmcnKSxcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ2F2YXRhcl91bmRlcndhdGVyLnBuZycpLFxuICAgIG9ic3RhY2xlX2JvdHRvbTogc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfYm90dG9tX3VuZGVyd2F0ZXIucG5nJyksXG4gICAgb2JzdGFjbGVfYm90dG9tX3RodW1iOiBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV9ib3R0b21fdW5kZXJ3YXRlcl90aHVtYi5wbmcnKSxcbiAgICBvYnN0YWNsZV90b3A6IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX3RvcF91bmRlcndhdGVyLnBuZycpLFxuICAgIGdyb3VuZDogc2tpbi5hc3NldFVybCgnZ3JvdW5kX3VuZGVyd2F0ZXIucG5nJyksXG4gICAgZ3JvdW5kX3RodW1iOiBza2luLmFzc2V0VXJsKCdncm91bmRfdW5kZXJ3YXRlcl90aHVtYi5wbmcnKVxuICB9O1xuXG4gIHNraW4uY2F2ZSA9IHtcbiAgICBiYWNrZ3JvdW5kOiBza2luLmFzc2V0VXJsKCdiYWNrZ3JvdW5kX2NhdmUucG5nJyksXG4gICAgYXZhdGFyOiBza2luLmFzc2V0VXJsKCdhdmF0YXJfY2F2ZS5wbmcnKSxcbiAgICBvYnN0YWNsZV9ib3R0b206IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbV9jYXZlLnBuZycpLFxuICAgIG9ic3RhY2xlX2JvdHRvbV90aHVtYjogc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfYm90dG9tX2NhdmVfdGh1bWIucG5nJyksXG4gICAgb2JzdGFjbGVfdG9wOiBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV90b3BfY2F2ZS5wbmcnKSxcbiAgICBncm91bmQ6IHNraW4uYXNzZXRVcmwoJ2dyb3VuZF9jYXZlLnBuZycpLFxuICAgIGdyb3VuZF90aHVtYjogc2tpbi5hc3NldFVybCgnZ3JvdW5kX2NhdmVfdGh1bWIucG5nJylcbiAgfTtcblxuICBza2luLnNhbnRhID0ge1xuICAgIGJhY2tncm91bmQ6IHNraW4uYXNzZXRVcmwoJ2JhY2tncm91bmRfc2FudGEucG5nJyksXG4gICAgYXZhdGFyOiBza2luLmFzc2V0VXJsKCdzYW50YS5wbmcnKSxcbiAgICBvYnN0YWNsZV9ib3R0b206IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbV9zYW50YS5wbmcnKSxcbiAgICBvYnN0YWNsZV9ib3R0b21fdGh1bWI6IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbV9zYW50YV90aHVtYi5wbmcnKSxcbiAgICBvYnN0YWNsZV90b3A6IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX3RvcF9zYW50YS5wbmcnKSxcbiAgICBncm91bmQ6IHNraW4uYXNzZXRVcmwoJ2dyb3VuZF9zYW50YS5wbmcnKSxcbiAgICBncm91bmRfdGh1bWI6IHNraW4uYXNzZXRVcmwoJ2dyb3VuZF9zYW50YV90aHVtYi5wbmcnKVxuICB9O1xuXG4gIHNraW4ubmlnaHQgPSB7XG4gICAgYmFja2dyb3VuZDogc2tpbi5hc3NldFVybCgnYmFja2dyb3VuZF9uaWdodC5wbmcnKVxuICB9O1xuXG4gIHNraW4ucmVkYmlyZCA9IHtcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ2F2YXRhcl9yZWRiaXJkLnBuZycpXG4gIH07XG5cbiAgc2tpbi5sYXNlciA9IHtcbiAgICBvYnN0YWNsZV9ib3R0b206IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbV9sYXNlci5wbmcnKSxcbiAgICBvYnN0YWNsZV9ib3R0b21fdGh1bWI6IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbV9sYXNlcl90aHVtYi5wbmcnKSxcbiAgICBvYnN0YWNsZV90b3A6IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX3RvcF9sYXNlci5wbmcnKVxuICB9O1xuXG4gIHNraW4ubGF2YSA9IHtcbiAgICBncm91bmQ6IHNraW4uYXNzZXRVcmwoJ2dyb3VuZF9sYXZhLnBuZycpLFxuICAgIGdyb3VuZF90aHVtYjogc2tpbi5hc3NldFVybCgnZ3JvdW5kX2xhdmFfdGh1bWIucG5nJylcbiAgfTtcblxuICBza2luLnNoYXJrID0ge1xuICAgIGF2YXRhcjogc2tpbi5hc3NldFVybCgnc2hhcmsucG5nJylcbiAgfTtcblxuICBza2luLmVhc3RlciA9IHtcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ2Vhc3RlcmJ1bm55LnBuZycpXG4gIH07XG5cbiAgc2tpbi5iYXRtYW4gPSB7XG4gICAgYXZhdGFyOiBza2luLmFzc2V0VXJsKCdiYXRtYW4ucG5nJylcbiAgfTtcblxuICBza2luLnN1Ym1hcmluZSA9IHtcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ3N1Ym1hcmluZS5wbmcnKVxuICB9O1xuXG4gIHNraW4udW5pY29ybiA9IHtcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ3VuaWNvcm4ucG5nJylcbiAgfTtcblxuICBza2luLmZhaXJ5ID0ge1xuICAgIGF2YXRhcjogc2tpbi5hc3NldFVybCgnZmFpcnkucG5nJylcbiAgfTtcblxuICBza2luLnN1cGVybWFuID0ge1xuICAgIGF2YXRhcjogc2tpbi5hc3NldFVybCgnc3VwZXJtYW4ucG5nJylcbiAgfTtcblxuICBza2luLnR1cmtleSA9IHtcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ3R1cmtleS5wbmcnKVxuICB9O1xuXG4gIC8vIEltYWdlc1xuICBza2luLmdyb3VuZCA9IHNraW4uYXNzZXRVcmwoJ2dyb3VuZC5wbmcnKTtcbiAgc2tpbi5ncm91bmRfdGh1bWIgPSBza2luLmFzc2V0VXJsKCdncm91bmRfdGh1bWIucG5nJyk7XG4gIHNraW4ub2JzdGFjbGVfdG9wID0gc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfdG9wLnBuZycpO1xuICBza2luLm9ic3RhY2xlX2JvdHRvbSA9IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbS5wbmcnKTtcbiAgc2tpbi5vYnN0YWNsZV9ib3R0b21fdGh1bWIgPSBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV9ib3R0b21fdGh1bWIucG5nJyk7XG4gIHNraW4uaW5zdHJ1Y3Rpb25zID0gc2tpbi5hc3NldFVybCgnaW5zdHJ1Y3Rpb25zLnBuZycpO1xuICBza2luLmNsaWNrcnVuID0gc2tpbi5hc3NldFVybCgnY2xpY2tydW4ucG5nJyk7XG4gIHNraW4uZ2V0cmVhZHkgPSBza2luLmFzc2V0VXJsKCdnZXRyZWFkeS5wbmcnKTtcbiAgc2tpbi5nYW1lb3ZlciA9IHNraW4uYXNzZXRVcmwoJ2dhbWVvdmVyLnBuZycpO1xuICBza2luLmZsYXBJY29uID0gc2tpbi5hc3NldFVybCgnZmxhcC1iaXJkLnBuZycpO1xuICBza2luLmNyYXNoSWNvbiA9IHNraW4uYXNzZXRVcmwoJ3doZW4tY3Jhc2gucG5nJyk7XG4gIHNraW4uY29sbGlkZU9ic3RhY2xlSWNvbiA9IHNraW4uYXNzZXRVcmwoJ3doZW4tb2JzdGFjbGUucG5nJyk7XG4gIHNraW4uY29sbGlkZUdyb3VuZEljb24gPSBza2luLmFzc2V0VXJsKCd3aGVuLWNyYXNoLnBuZycpO1xuICBza2luLmVudGVyT2JzdGFjbGVJY29uID0gc2tpbi5hc3NldFVybCgnd2hlbi1wYXNzLnBuZycpO1xuICBza2luLnRpbGVzID0gc2tpbi5hc3NldFVybCgndGlsZXMucG5nJyk7XG4gIHNraW4uZ29hbCA9IHNraW4uYXNzZXRVcmwoJ2dvYWwucG5nJyk7XG4gIHNraW4uZ29hbFN1Y2Nlc3MgPSBza2luLmFzc2V0VXJsKCdnb2FsX3N1Y2Nlc3MucG5nJyk7XG4gIHNraW4ub2JzdGFjbGUgPSBza2luLmFzc2V0VXJsKCdvYnN0YWNsZS5wbmcnKTtcbiAgc2tpbi5vYnN0YWNsZVNjYWxlID0gY29uZmlnLm9ic3RhY2xlU2NhbGUgfHwgMS4wO1xuICBza2luLmxhcmdlck9ic3RhY2xlQW5pbWF0aW9uVGlsZXMgPVxuICAgICAgc2tpbi5hc3NldFVybChjb25maWcubGFyZ2VyT2JzdGFjbGVBbmltYXRpb25UaWxlcyk7XG4gIHNraW4uaGl0dGluZ1dhbGxBbmltYXRpb24gPVxuICAgICAgc2tpbi5hc3NldFVybChjb25maWcuaGl0dGluZ1dhbGxBbmltYXRpb24pO1xuICBza2luLmFwcHJvYWNoaW5nR29hbEFuaW1hdGlvbiA9XG4gICAgICBza2luLmFzc2V0VXJsKGNvbmZpZy5hcHByb2FjaGluZ0dvYWxBbmltYXRpb24pO1xuICAvLyBTb3VuZHNcbiAgc2tpbi5vYnN0YWNsZVNvdW5kID1cbiAgICAgIFtza2luLmFzc2V0VXJsKCdvYnN0YWNsZS5tcDMnKSwgc2tpbi5hc3NldFVybCgnb2JzdGFjbGUub2dnJyldO1xuICBza2luLndhbGxTb3VuZCA9IFtza2luLmFzc2V0VXJsKCd3YWxsLm1wMycpLCBza2luLmFzc2V0VXJsKCd3YWxsLm9nZycpXTtcbiAgc2tpbi53aW5Hb2FsU291bmQgPSBbc2tpbi5hc3NldFVybCgnd2luX2dvYWwubXAzJyksXG4gICAgICAgICAgICAgICAgICAgICAgIHNraW4uYXNzZXRVcmwoJ3dpbl9nb2FsLm9nZycpXTtcbiAgc2tpbi53YWxsMFNvdW5kID0gW3NraW4uYXNzZXRVcmwoJ3dhbGwwLm1wMycpLCBza2luLmFzc2V0VXJsKCd3YWxsMC5vZ2cnKV07XG5cbiAgc2tpbi5kaWVTb3VuZCA9IFtza2luLmFzc2V0VXJsKCdzZnhfZGllLm1wMycpLCBza2luLmFzc2V0VXJsKCdzZnhfZGllLm9nZycpXTtcbiAgc2tpbi5oaXRTb3VuZCA9IFtza2luLmFzc2V0VXJsKCdzZnhfaGl0Lm1wMycpLCBza2luLmFzc2V0VXJsKCdzZnhfaGl0Lm9nZycpXTtcbiAgc2tpbi5wb2ludFNvdW5kID0gW3NraW4uYXNzZXRVcmwoJ3NmeF9wb2ludC5tcDMnKSwgc2tpbi5hc3NldFVybCgnc2Z4X3BvaW50Lm9nZycpXTtcbiAgc2tpbi5zd29vc2hpbmdTb3VuZCA9IFtza2luLmFzc2V0VXJsKCdzZnhfc3dvb3NoaW5nLm1wMycpLCBza2luLmFzc2V0VXJsKCdzZnhfc3dvb3NoaW5nLm9nZycpXTtcbiAgc2tpbi53aW5nU291bmQgPSBbc2tpbi5hc3NldFVybCgnc2Z4X3dpbmcubXAzJyksIHNraW4uYXNzZXRVcmwoJ3NmeF93aW5nLm9nZycpXTtcblxuICBza2luLmpldFNvdW5kID0gW3NraW4uYXNzZXRVcmwoJ2pldC5tcDMnKSwgc2tpbi5hc3NldFVybCgnamV0Lm9nZycpXTtcbiAgc2tpbi5jcmFzaFNvdW5kID0gW3NraW4uYXNzZXRVcmwoJ2NyYXNoLm1wMycpLCBza2luLmFzc2V0VXJsKCdjcmFzaC5vZ2cnKV07XG4gIHNraW4uamluZ2xlU291bmQgPSBbc2tpbi5hc3NldFVybCgnamluZ2xlLm1wMycpLCBza2luLmFzc2V0VXJsKCdqaW5nbGUub2dnJyldO1xuICBza2luLmxhc2VyU291bmQgPSBbc2tpbi5hc3NldFVybCgnbGFzZXIubXAzJyksIHNraW4uYXNzZXRVcmwoJ2xhc2VyLm9nZycpXTtcbiAgc2tpbi5zcGxhc2hTb3VuZCA9IFtza2luLmFzc2V0VXJsKCdzcGxhc2gubXAzJyksIHNraW4uYXNzZXRVcmwoJ3NwbGFzaC5vZ2cnKV07XG5cbiAgLy8gU2V0dGluZ3NcbiAgc2tpbi5ncmFwaCA9IGNvbmZpZy5ncmFwaDtcbiAgc2tpbi5iYWNrZ3JvdW5kID0gc2tpbi5hc3NldFVybCgnYmFja2dyb3VuZC5wbmcnKTtcblxuICByZXR1cm4gc2tpbjtcbn07XG4iLCIvKmpzaGludCBtdWx0aXN0cjogdHJ1ZSAqL1xuXG4vLyB0b2RvIC0gaSB0aGluayBvdXIgcHJlcG9sdWF0ZWQgY29kZSBjb3VudHMgYXMgTE9Dc1xuXG52YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcbnZhciBmbGFwcHlNc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIHRiID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKS5jcmVhdGVUb29sYm94O1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIGNhdGVnb3J5ID0gZnVuY3Rpb24gKG5hbWUsIGJsb2Nrcykge1xuICByZXR1cm4gJzxjYXRlZ29yeSBpZD1cIicgKyBuYW1lICsgJ1wiIG5hbWU9XCInICsgbmFtZSArICdcIj4nICsgYmxvY2tzICsgJzwvY2F0ZWdvcnk+Jztcbn07XG5cbnZhciBmbGFwQmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfZmxhcFwiPjwvYmxvY2s+JztcbnZhciBmbGFwSGVpZ2h0QmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfZmxhcF9oZWlnaHRcIj48L2Jsb2NrPic7XG52YXIgZW5kR2FtZUJsb2NrID0gJzxibG9jayB0eXBlPVwiZmxhcHB5X2VuZEdhbWVcIj48L2Jsb2NrPic7XG52YXIgcGxheVNvdW5kQmxvY2sgPSAgJzxibG9jayB0eXBlPVwiZmxhcHB5X3BsYXlTb3VuZFwiPjwvYmxvY2s+JztcbnZhciBpbmNyZW1lbnRTY29yZUJsb2NrID0gJzxibG9jayB0eXBlPVwiZmxhcHB5X2luY3JlbWVudFBsYXllclNjb3JlXCI+PC9ibG9jaz4nO1xuXG52YXIgc2V0U3BlZWRCbG9jayA9ICc8YmxvY2sgdHlwZT1cImZsYXBweV9zZXRTcGVlZFwiPjwvYmxvY2s+JztcbnZhciBzZXRCYWNrZ3JvdW5kQmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfc2V0QmFja2dyb3VuZFwiPjwvYmxvY2s+JztcbnZhciBzZXRHYXBIZWlnaHRCbG9jayA9ICc8YmxvY2sgdHlwZT1cImZsYXBweV9zZXRHYXBIZWlnaHRcIj48L2Jsb2NrPic7XG52YXIgc2V0UGxheWVyQmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfc2V0UGxheWVyXCI+PC9ibG9jaz4nO1xudmFyIHNldE9ic3RhY2xlQmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfc2V0T2JzdGFjbGVcIj48L2Jsb2NrPic7XG52YXIgc2V0R3JvdW5kQmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfc2V0R3JvdW5kXCI+PC9ibG9jaz4nO1xudmFyIHNldEdyYXZpdHlCbG9jayA9ICc8YmxvY2sgdHlwZT1cImZsYXBweV9zZXRHcmF2aXR5XCI+PC9ibG9jaz4nO1xudmFyIHNldFNjb3JlQmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfc2V0U2NvcmVcIj48L2Jsb2NrPic7XG5cbnZhciBBVkFUQVJfSEVJR0hUID0gY29uc3RhbnRzLkFWQVRBUl9IRUlHSFQ7XG52YXIgQVZBVEFSX1dJRFRIID0gY29uc3RhbnRzLkFWQVRBUl9XSURUSDtcbnZhciBBVkFUQVJfWV9PRkZTRVQgPSBjb25zdGFudHMuQVZBVEFSX1lfT0ZGU0VUO1xuXG52YXIgZXZlbnRCbG9jayA9IGZ1bmN0aW9uICh0eXBlLCBjaGlsZCkge1xuICByZXR1cm4gJzxibG9jayB0eXBlPVwiJyArIHR5cGUgKyAnXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj4nICtcbiAgICAoY2hpbGQgPyAnPG5leHQ+JyArIGNoaWxkICsgJzwvbmV4dD4nIDogJycpICtcbiAgICAnPC9ibG9jaz4nO1xufTtcblxuLy8gbm90IG1vdmFibGUgb3IgZGVsZXRhYmxlXG52YXIgYW5jaG9yZWRCbG9jayA9IGZ1bmN0aW9uICh0eXBlLCBjaGlsZCkge1xuICByZXR1cm4gJzxibG9jayB0eXBlPVwiJyArIHR5cGUgKyAnXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwiZmFsc2VcIj4nICtcbiAgICAoY2hpbGQgPyAnPG5leHQ+JyArIGNoaWxkICsgJzwvbmV4dD4nIDogJycpICtcbiAgICAnPC9ibG9jaz4nO1xufTtcblxuLypcbiAqIENvbmZpZ3VyYXRpb24gZm9yIGFsbCBsZXZlbHMuXG4gKi9cblxuIC8qKlxuICAqIEV4cGxhbmF0aW9uIG9mIG9wdGlvbnM6XG4gICogZ29hbC5zdGFydFgvc3RhcnRZXG4gICogLSBzdGFydCBsb2NhdGlvbiBvZiBmbGFnIGltYWdlXG4gICogZ29hbC5tb3ZpbmdcbiAgKiAtIHdoZXRoZXIgdGhlIGdvYWwgc3RheXMgaW4gb25lIHNwb3Qgb3IgbW92ZXMgYXQgbGV2ZWwncyBzcGVlZFxuICAqIGdvYWwuc3VjY2Vzc0NvbmRpdGlvblxuICAqIC0gY29uZGl0aW9uKHMpLCB3aGljaCBpZiB0cnVlIGF0IGFueSBwb2ludCwgaW5kaWNhdGUgdXNlciBoYXMgc3VjY2Vzc2Z1bGx5XG4gICogICBjb21wbGV0ZWQgdGhlIHB1enpsZVxuICAqIGdvYWwuZmFpbHVyZUNvbmRpdGlvblxuICAqIC0gY29uZGl0aW9uKHMpLCB3aGljaCBpZiB0cnVlIGF0IGFueSBwb2ludCwgaW5kaWNhdGVzIHRoZSBwdXp6bGUgaXNcbiAgICAgIGNvbXBsZXRlIChpbmRpY2F0aW5nIGZhaWx1cmUgaWYgc3VjY2VzcyBjb25kaXRpb24gbm90IG1ldClcbiAgKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICcxJzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFt7J3Rlc3QnOiAnZmxhcCcsICd0eXBlJzogJ2ZsYXBweV9mbGFwJ31dXG4gICAgXSxcbiAgICAnb2JzdGFjbGVzJzogZmFsc2UsXG4gICAgJ2dyb3VuZCc6IGZhbHNlLFxuICAgICdzY29yZSc6IGZhbHNlLFxuICAgICdmcmVlUGxheSc6IGZhbHNlLFxuICAgICdnb2FsJzoge1xuICAgICAgc3RhcnRYICA6IDEwMCxcbiAgICAgIHN0YXJ0WTogMCxcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIChGbGFwcHkuYXZhdGFyWSAgPD0gNDApO1xuICAgICAgfSxcbiAgICAgIGZhaWx1cmVDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIEZsYXBweS5hdmF0YXJZID4gRmxhcHB5Lk1BWkVfSEVJR0hUO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YihmbGFwQmxvY2sgKyBwbGF5U291bmRCbG9jayksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snKSxcbiAgICAnYXBwU3BlY2lmaWNGYWlsRXJyb3InOlxuICAgICAgZmxhcHB5TXNnLmZsYXBweVNwZWNpZmljRmFpbCgpXG4gIH0sXG5cbiAgJzInOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdlbmRHYW1lJywgJ3R5cGUnOiAnZmxhcHB5X2VuZEdhbWUnfV1cbiAgICBdLFxuICAgICdvYnN0YWNsZXMnOiBmYWxzZSxcbiAgICAnZ3JvdW5kJzogdHJ1ZSxcbiAgICAnc2NvcmUnOiBmYWxzZSxcbiAgICAnZnJlZVBsYXknOiBmYWxzZSxcbiAgICAnZ29hbCc6IHtcbiAgICAgIHN0YXJ0WDogMTAwLFxuICAgICAgc3RhcnRZOiA0MDAgLSA0OCAtIDU2IC8gMixcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gdGhpcyBvbmx5IGhhcHBlbnMgYWZ0ZXIgYXZhdGFyIGhpdHMgZ3JvdW5kLCBhbmQgd2Ugc3BpbiBoaW0gYmVjYXVzZSBvZlxuICAgICAgICAvLyBnYW1lIG92ZXJcbiAgICAgICAgcmV0dXJuIChGbGFwcHkuYXZhdGFyWSAgPT09IDMyMiAmJiBGbGFwcHkuYXZhdGFyWCA9PT0gMTEwKTtcbiAgICAgIH0sXG4gICAgICBmYWlsdXJlQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhdmF0YXJCb3R0b20gPSBGbGFwcHkuYXZhdGFyWSArIEFWQVRBUl9IRUlHSFQ7XG4gICAgICAgIHZhciBncm91bmQgPSBGbGFwcHkuTUFaRV9IRUlHSFQgLSBGbGFwcHkuR1JPVU5EX0hFSUdIVDtcbiAgICAgICAgcmV0dXJuIChhdmF0YXJCb3R0b20gPj0gZ3JvdW5kICYmIEZsYXBweS5nYW1lU3RhdGUgPT09IEZsYXBweS5HYW1lU3RhdGVzLkFDVElWRSk7XG4gICAgICB9XG4gICAgfSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKGZsYXBCbG9jayArIGVuZEdhbWVCbG9jayArIHBsYXlTb3VuZEJsb2NrKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycsIGZsYXBCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kJylcbiAgfSxcblxuICAnMyc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ3NldFNwZWVkJywgJ3R5cGUnOiAnZmxhcHB5X3NldFNwZWVkJ31dXG4gICAgXSxcbiAgICAnb2JzdGFjbGVzJzogZmFsc2UsXG4gICAgJ2dyb3VuZCc6IHRydWUsXG4gICAgJ3Njb3JlJzogZmFsc2UsXG4gICAgJ2ZyZWVQbGF5JzogZmFsc2UsXG4gICAgJ2dvYWwnOiB7XG4gICAgICBzdGFydFg6IDQwMCAtIDU1LFxuICAgICAgc3RhcnRZOiAwLFxuICAgICAgbW92aW5nOiB0cnVlLFxuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXZhdGFyQ2VudGVyID0ge1xuICAgICAgICAgIHg6IChGbGFwcHkuYXZhdGFyWCArIEFWQVRBUl9XSURUSCkgLyAyLFxuICAgICAgICAgIHk6IChGbGFwcHkuYXZhdGFyWSArIEFWQVRBUl9IRUlHSFQpIC8gMlxuICAgICAgICB9O1xuICAgICAgICB2YXIgZ29hbENlbnRlciA9IHtcbiAgICAgICAgICB4OiAoRmxhcHB5LmdvYWxYICsgRmxhcHB5LkdPQUxfU0laRSkgLyAyLFxuICAgICAgICAgIHk6IChGbGFwcHkuZ29hbFkgKyBGbGFwcHkuR09BTF9TSVpFKSAvIDJcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgZGlmZiA9IHtcbiAgICAgICAgICB4OiBNYXRoLmFicyhhdmF0YXJDZW50ZXIueCAtIGdvYWxDZW50ZXIueCksXG4gICAgICAgICAgeTogTWF0aC5hYnMoYXZhdGFyQ2VudGVyLnkgLSBnb2FsQ2VudGVyLnkpXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGRpZmYueCA8IDE1ICYmIGRpZmYueSA8IDE1O1xuICAgICAgfSxcbiAgICAgIGZhaWx1cmVDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIEZsYXBweS5hY3RpdmVUaWNrcygpID49IDEyMCAmJiBGbGFwcHkuU1BFRUQgPT09IDA7XG4gICAgICB9XG4gICAgfSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKGZsYXBCbG9jayArIHBsYXlTb3VuZEJsb2NrICsgc2V0U3BlZWRCbG9jayksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snLCBmbGFwQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJylcbiAgfSxcblxuICAnNCc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ2VuZEdhbWUnLCAndHlwZSc6ICdmbGFwcHlfZW5kR2FtZSd9XVxuICAgIF0sXG4gICAgJ29ic3RhY2xlcyc6IHRydWUsXG4gICAgJ2dyb3VuZCc6IHRydWUsXG4gICAgJ3Njb3JlJzogZmFsc2UsXG4gICAgJ2ZyZWVQbGF5JzogZmFsc2UsXG4gICAgJ2dvYWwnOiB7XG4gICAgICBzdGFydFg6IDYwMCAtICg1NiAvIDIpLFxuICAgICAgc3RhcnRZOiA0MDAgLSA0OCAtIDU2IC8gMixcbiAgICAgIG1vdmluZzogdHJ1ZSxcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIEZsYXBweS5vYnN0YWNsZXNbMF0uaGl0QXZhdGFyICYmXG4gICAgICAgICAgRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuT1ZFUjtcbiAgICAgIH0sXG4gICAgICBmYWlsdXJlQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHRvZG8gLSB3b3VsZCBiZSBuaWNlIGlmIHdlIGNvdWxkIGRpc3Rpbmd1aXNoIGZlZWRiYWNrIGZvclxuICAgICAgICAvLyBmbGV3IHRocm91Z2ggcGlwZSB2cy4gZGlkbnQgaG9vayB1cCBlbmRHYW1lIGJsb2NrXG4gICAgICAgIHZhciBvYnN0YWNsZUVuZCA9IEZsYXBweS5vYnN0YWNsZXNbMF0ueCArIEZsYXBweS5PQlNUQUNMRV9XSURUSDtcbiAgICAgICAgcmV0dXJuIG9ic3RhY2xlRW5kIDwgRmxhcHB5LmF2YXRhclg7XG4gICAgICB9XG4gICAgfSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKGZsYXBCbG9jayArIGVuZEdhbWVCbG9jayArIHBsYXlTb3VuZEJsb2NrICsgc2V0U3BlZWRCbG9jayksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snLCBmbGFwQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJywgc2V0U3BlZWRCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnKVxuICB9LFxuXG4gICc1Jzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFt7J3Rlc3QnOiAnaW5jcmVtZW50UGxheWVyU2NvcmUnLCAndHlwZSc6ICdmbGFwcHlfaW5jcmVtZW50UGxheWVyU2NvcmUnfV1cbiAgICBdLFxuICAgICdkZWZhdWx0RmxhcCc6ICdTTUFMTCcsXG4gICAgJ29ic3RhY2xlcyc6IHRydWUsXG4gICAgJ2dyb3VuZCc6IHRydWUsXG4gICAgJ3Njb3JlJzogdHJ1ZSxcbiAgICAnZnJlZVBsYXknOiBmYWxzZSxcbiAgICAnZ29hbCc6IHtcbiAgICAgIC8vIHRvZG8gLSBraW5kIG9mIHVnbHkgdGhhdCB3ZSBlbmQgdXAgbG9vcGluIHRocm91Z2ggYWxsIG9ic3RhY2xlcyB0d2ljZSxcbiAgICAgIC8vIG9uY2UgdG8gY2hlY2sgZm9yIHN1Y2Nlc3MgYW5kIGFnYWluIHRvIGNoZWNrIGZvciBmYWlsdXJlXG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbnNpZGVPYnN0YWNsZSA9IGZhbHNlO1xuICAgICAgICBGbGFwcHkub2JzdGFjbGVzLmZvckVhY2goZnVuY3Rpb24gKG9ic3RhY2xlKSB7XG4gICAgICAgICAgaWYgKCFvYnN0YWNsZS5oaXRBdmF0YXIgJiYgb2JzdGFjbGUuY29udGFpbnNBdmF0YXIoKSkge1xuICAgICAgICAgICAgaW5zaWRlT2JzdGFjbGUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBpbnNpZGVPYnN0YWNsZSAmJiBGbGFwcHkucGxheWVyU2NvcmUgPiAwO1xuICAgICAgfSxcbiAgICAgIGZhaWx1cmVDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGluc2lkZU9ic3RhY2xlID0gZmFsc2U7XG4gICAgICAgIEZsYXBweS5vYnN0YWNsZXMuZm9yRWFjaChmdW5jdGlvbiAob2JzdGFjbGUpIHtcbiAgICAgICAgICBpZiAoIW9ic3RhY2xlLmhpdEF2YXRhciAmJiBvYnN0YWNsZS5jb250YWluc0F2YXRhcigpKSB7XG4gICAgICAgICAgICBpbnNpZGVPYnN0YWNsZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGluc2lkZU9ic3RhY2xlICYmIEZsYXBweS5wbGF5ZXJTY29yZSA9PT0gMDtcbiAgICAgIH1cbiAgICB9LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoZmxhcEJsb2NrICsgZW5kR2FtZUJsb2NrICsgaW5jcmVtZW50U2NvcmVCbG9jayArIHBsYXlTb3VuZEJsb2NrICsgc2V0U3BlZWRCbG9jayksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snLCBmbGFwQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScpICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJywgc2V0U3BlZWRCbG9jaylcbiAgfSxcblxuICAnNic6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ2ZsYXAnLCAndHlwZSc6ICdmbGFwcHlfZmxhcF9oZWlnaHQnfV1cbiAgICBdLFxuICAgICdvYnN0YWNsZXMnOiB0cnVlLFxuICAgICdncm91bmQnOiB0cnVlLFxuICAgICdzY29yZSc6IHRydWUsXG4gICAgJ2ZyZWVQbGF5JzogZmFsc2UsXG4gICAgJ2dvYWwnOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbnNpZGVPYnN0YWNsZSA9IGZhbHNlO1xuICAgICAgICBGbGFwcHkub2JzdGFjbGVzLmZvckVhY2goZnVuY3Rpb24gKG9ic3RhY2xlKSB7XG4gICAgICAgICAgaWYgKG9ic3RhY2xlLmNvbnRhaW5zQXZhdGFyKCkpIHtcbiAgICAgICAgICAgIGluc2lkZU9ic3RhY2xlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaW5zaWRlT2JzdGFjbGUgJiYgRmxhcHB5LnBsYXllclNjb3JlID4gMDtcbiAgICAgIH0sXG4gICAgICBmYWlsdXJlQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbnNpZGVPYnN0YWNsZSA9IGZhbHNlO1xuICAgICAgICBGbGFwcHkub2JzdGFjbGVzLmZvckVhY2goZnVuY3Rpb24gKG9ic3RhY2xlKSB7XG4gICAgICAgICAgaWYgKG9ic3RhY2xlLmNvbnRhaW5zQXZhdGFyKCkpIHtcbiAgICAgICAgICAgIGluc2lkZU9ic3RhY2xlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaW5zaWRlT2JzdGFjbGUgJiYgRmxhcHB5LnBsYXllclNjb3JlID09PSAwO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YihmbGFwSGVpZ2h0QmxvY2sgKyBlbmRHYW1lQmxvY2sgKyBpbmNyZW1lbnRTY29yZUJsb2NrICsgcGxheVNvdW5kQmxvY2sgKyBzZXRTcGVlZEJsb2NrKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycpICtcbiAgICAgIC8vIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZUdyb3VuZCcsIGVuZEdhbWVCbG9jaykgK1xuICAgICAgLy8gZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnLCBlbmRHYW1lQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScsIGluY3JlbWVudFNjb3JlQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJywgc2V0U3BlZWRCbG9jaylcbiAgfSxcblxuICAnNyc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ3NldEJhY2tncm91bmQnLCAndHlwZSc6ICdmbGFwcHlfc2V0QmFja2dyb3VuZCd9XVxuICAgIF0sXG4gICAgJ29ic3RhY2xlcyc6IHRydWUsXG4gICAgJ2dyb3VuZCc6IHRydWUsXG4gICAgJ3Njb3JlJzogdHJ1ZSxcbiAgICAnZnJlZVBsYXknOiBmYWxzZSxcbiAgICAnZ29hbCc6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIChGbGFwcHkuZ2FtZVN0YXRlID09PSBGbGFwcHkuR2FtZVN0YXRlcy5PVkVSKTtcbiAgICAgIH1cbiAgICB9LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoZmxhcEhlaWdodEJsb2NrICsgZW5kR2FtZUJsb2NrICsgaW5jcmVtZW50U2NvcmVCbG9jayArIHBsYXlTb3VuZEJsb2NrICtcbiAgICAgICAgc2V0U3BlZWRCbG9jayArIHNldEJhY2tncm91bmRCbG9jayksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snLCBmbGFwSGVpZ2h0QmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZUdyb3VuZCcsIGVuZEdhbWVCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnLCBlbmRHYW1lQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScsIGluY3JlbWVudFNjb3JlQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJywgc2V0U3BlZWRCbG9jaylcbiAgfSxcblxuICAnOCc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbe1xuICAgICAgICB0ZXN0OiBmdW5jdGlvbiAoYmxvY2spIHtcbiAgICAgICAgICByZXR1cm4gKGJsb2NrLnR5cGUgPT09ICdmbGFwcHlfc2V0QmFja2dyb3VuZCcgfHxcbiAgICAgICAgICAgIGJsb2NrLnR5cGUgPT09ICdmbGFwcHlfc2V0UGxheWVyJykgJiZcbiAgICAgICAgICAgIGJsb2NrLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykgPT09ICdyYW5kb20nO1xuICAgICAgICB9LFxuICAgICAgICB0eXBlOiAnZmxhcHB5X3NldEJhY2tncm91bmQnLFxuICAgICAgICB0aXRsZXM6IHtcbiAgICAgICAgICAnVkFMVUUnOiAncmFuZG9tJ1xuICAgICAgICB9XG4gICAgICB9XVxuICAgIF0sXG4gICAgJ29ic3RhY2xlcyc6IHRydWUsXG4gICAgJ2dyb3VuZCc6IHRydWUsXG4gICAgJ3Njb3JlJzogdHJ1ZSxcbiAgICAnZnJlZVBsYXknOiBmYWxzZSxcbiAgICAnZ29hbCc6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIChGbGFwcHkuZ2FtZVN0YXRlID09PSBGbGFwcHkuR2FtZVN0YXRlcy5PVkVSKTtcbiAgICAgIH1cbiAgICB9LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoZmxhcEhlaWdodEJsb2NrICsgZW5kR2FtZUJsb2NrICsgaW5jcmVtZW50U2NvcmVCbG9jayArIHBsYXlTb3VuZEJsb2NrICtcbiAgICAgICAgc2V0U3BlZWRCbG9jayArIHNldEJhY2tncm91bmRCbG9jayArIHNldFBsYXllckJsb2NrKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycsIGZsYXBIZWlnaHRCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kJywgZW5kR2FtZUJsb2NrKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZScsIGVuZEdhbWVCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5FbnRlck9ic3RhY2xlJywgaW5jcmVtZW50U2NvcmVCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnd2hlbl9ydW4nLCBzZXRTcGVlZEJsb2NrKVxuICB9LFxuXG4gICc5Jzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFt7XG4gICAgICAgIHRlc3Q6IGZ1bmN0aW9uIChibG9jaykge1xuICAgICAgICAgIHJldHVybiBibG9jay50eXBlID09PSAnZmxhcHB5X3NldFNjb3JlJztcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZTogJ2ZsYXBweV9zZXRTY29yZSdcbiAgICAgIH1dXG4gICAgXSxcbiAgICAnb2JzdGFjbGVzJzogdHJ1ZSxcbiAgICAnZ3JvdW5kJzogdHJ1ZSxcbiAgICAnc2NvcmUnOiB0cnVlLFxuICAgICdmcmVlUGxheSc6IGZhbHNlLFxuICAgICdnb2FsJzoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gKEZsYXBweS5nYW1lU3RhdGUgPT09IEZsYXBweS5HYW1lU3RhdGVzLk9WRVIpO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YihmbGFwSGVpZ2h0QmxvY2sgKyBlbmRHYW1lQmxvY2sgKyBpbmNyZW1lbnRTY29yZUJsb2NrICsgcGxheVNvdW5kQmxvY2sgK1xuICAgICAgICBzZXRTcGVlZEJsb2NrICsgc2V0QmFja2dyb3VuZEJsb2NrICsgc2V0UGxheWVyQmxvY2sgKyBzZXRTY29yZUJsb2NrKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycsIGZsYXBIZWlnaHRCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kJywgZW5kR2FtZUJsb2NrKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZScpICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScsIGluY3JlbWVudFNjb3JlQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJywgc2V0U3BlZWRCbG9jaylcbiAgfSxcblxuICAnMTEnOiB7XG4gICAgc2hhcmVhYmxlOiB0cnVlLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICBdLFxuICAgICdvYnN0YWNsZXMnOiB0cnVlLFxuICAgICdncm91bmQnOiB0cnVlLFxuICAgICdzY29yZSc6IHRydWUsXG4gICAgJ2ZyZWVQbGF5JzogdHJ1ZSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKFxuICAgICAgICBmbGFwSGVpZ2h0QmxvY2sgK1xuICAgICAgICBwbGF5U291bmRCbG9jayArXG4gICAgICAgIGluY3JlbWVudFNjb3JlQmxvY2sgK1xuICAgICAgICBlbmRHYW1lQmxvY2sgK1xuICAgICAgICBzZXRTcGVlZEJsb2NrICtcbiAgICAgICAgc2V0QmFja2dyb3VuZEJsb2NrICtcbiAgICAgICAgc2V0UGxheWVyQmxvY2sgK1xuICAgICAgICBzZXRPYnN0YWNsZUJsb2NrICtcbiAgICAgICAgc2V0R3JvdW5kQmxvY2sgK1xuICAgICAgICBzZXRHYXBIZWlnaHRCbG9jayArXG4gICAgICAgIHNldEdyYXZpdHlCbG9jayArXG4gICAgICAgIHNldFNjb3JlQmxvY2tcbiAgICAgICksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVHcm91bmQnKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZScpICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScpICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJylcbiAgfSxcbiAgJ2sxJzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICBdLFxuICAgICdvYnN0YWNsZXMnOiB0cnVlLFxuICAgICdncm91bmQnOiB0cnVlLFxuICAgICdzY29yZSc6IHRydWUsXG4gICAgJ2ZyZWVQbGF5JzogdHJ1ZSxcbiAgICBpc0sxOiB0cnVlLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoXG4gICAgICAgIGZsYXBCbG9jayArXG4gICAgICAgIGVuZEdhbWVCbG9jayArXG4gICAgICAgIHNldEJhY2tncm91bmRCbG9jayArXG4gICAgICAgIHNldFBsYXllckJsb2NrICtcbiAgICAgICAgc2V0T2JzdGFjbGVCbG9jayArXG4gICAgICAgIHNldEdyb3VuZEJsb2NrICtcbiAgICAgICAgcGxheVNvdW5kQmxvY2sgK1xuICAgICAgICBmbGFwSGVpZ2h0QmxvY2sgK1xuICAgICAgICBzZXRTcGVlZEJsb2NrICtcbiAgICAgICAgaW5jcmVtZW50U2NvcmVCbG9jayArXG4gICAgICAgIHNldEdhcEhlaWdodEJsb2NrICtcbiAgICAgICAgc2V0R3Jhdml0eUJsb2NrICtcbiAgICAgICAgc2V0U2NvcmVCbG9ja1xuICAgICAgKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycpICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZUdyb3VuZCcpICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZU9ic3RhY2xlJykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5FbnRlck9ic3RhY2xlJykgK1xuICAgICAgZXZlbnRCbG9jaygnd2hlbl9ydW4nKVxuICB9XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzLmsxXzEgPSB7XG4gICdpc0sxJzogdHJ1ZSxcbiAgZ3JheU91dFVuZGVsZXRhYmxlQmxvY2tzOiB0cnVlLFxuICAncmVxdWlyZWRCbG9ja3MnOiBbXSxcbiAgJ29ic3RhY2xlcyc6IHRydWUsXG4gICdncm91bmQnOiB0cnVlLFxuICAnc2NvcmUnOiB0cnVlLFxuICAnZnJlZVBsYXknOiB0cnVlLFxuICAnc2NhbGUnOiB7XG4gICAgJ3NuYXBSYWRpdXMnOiAyXG4gIH0sXG4gICd0b29sYm94JzogJycsXG4gICdzdGFydEJsb2Nrcyc6XG4gICAgYW5jaG9yZWRCbG9jaygnZmxhcHB5X3doZW5DbGljaycsIGFuY2hvcmVkQmxvY2soJ2ZsYXBweV9mbGFwJykpICtcbiAgICBhbmNob3JlZEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVHcm91bmQnLCBhbmNob3JlZEJsb2NrKCdmbGFwcHlfZW5kR2FtZScpKSArXG4gICAgYW5jaG9yZWRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnLCBhbmNob3JlZEJsb2NrKCdmbGFwcHlfZW5kR2FtZScpKSArXG4gICAgYW5jaG9yZWRCbG9jaygnZmxhcHB5X3doZW5FbnRlck9ic3RhY2xlJywgYW5jaG9yZWRCbG9jaygnZmxhcHB5X2luY3JlbWVudFBsYXllclNjb3JlJykpICtcbiAgICBhbmNob3JlZEJsb2NrKCd3aGVuX3J1bicsIGFuY2hvcmVkQmxvY2soJ2ZsYXBweV9zZXRTcGVlZCcpKVxufTtcblxuLy8gZmxhcCB0byBnb2FsXG5tb2R1bGUuZXhwb3J0cy5rMV8yID0gdXRpbHMuZXh0ZW5kKG1vZHVsZS5leHBvcnRzWycxJ10sIHsgJ2lzSzEnOiB0cnVlfSk7XG5cbi8vIGhpdCBncm91bmRcbm1vZHVsZS5leHBvcnRzLmsxXzMgPSB1dGlscy5leHRlbmQobW9kdWxlLmV4cG9ydHNbJzInXSwgeyAnaXNLMSc6IHRydWV9KTtcblxuLy8gc2V0IHNwZWVkXG5tb2R1bGUuZXhwb3J0cy5rMV80ID0gdXRpbHMuZXh0ZW5kKG1vZHVsZS5leHBvcnRzWyczJ10sIHsgJ2lzSzEnOiB0cnVlfSk7XG5cbi8vIGNyYXNoIGludG8gb2JzdGFjbGVcbm1vZHVsZS5leHBvcnRzLmsxXzUgPSB1dGlscy5leHRlbmQobW9kdWxlLmV4cG9ydHNbJzQnXSwgeyAnaXNLMSc6IHRydWV9KTtcblxuLy8gcGFzcyB0aHJvdWdoIG9ic3RhY2xlLCBzY29yZSBhIHBvaW50XG5tb2R1bGUuZXhwb3J0cy5rMV82ID0gdXRpbHMuZXh0ZW5kKG1vZHVsZS5leHBvcnRzWyc1J10sIHsgJ2lzSzEnOiB0cnVlfSk7XG5cbi8vIHNjb3JlIG11bHRpcGxlIHBvaW50cyBmb3IgZWFjaCBwYXNzXG5tb2R1bGUuZXhwb3J0cy5rMV83ID0ge1xuICAnaXNLMSc6IHRydWUsXG4gICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICBbeyd0ZXN0JzogJ2luY3JlbWVudFBsYXllclNjb3JlJywgJ3R5cGUnOiAnZmxhcHB5X2luY3JlbWVudFBsYXllclNjb3JlJ31dXG4gIF0sXG4gICdkZWZhdWx0RmxhcCc6ICdTTUFMTCcsXG4gICdvYnN0YWNsZXMnOiB0cnVlLFxuICAnZ3JvdW5kJzogdHJ1ZSxcbiAgJ3Njb3JlJzogdHJ1ZSxcbiAgJ2ZyZWVQbGF5JzogZmFsc2UsXG4gICdnb2FsJzoge1xuICAgIC8vIHRvZG8gLSBraW5kIG9mIHVnbHkgdGhhdCB3ZSBlbmQgdXAgbG9vcGluIHRocm91Z2ggYWxsIG9ic3RhY2xlcyB0d2ljZSxcbiAgICAvLyBvbmNlIHRvIGNoZWNrIGZvciBzdWNjZXNzIGFuZCBhZ2FpbiB0byBjaGVjayBmb3IgZmFpbHVyZVxuICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpbnNpZGVPYnN0YWNsZSA9IGZhbHNlO1xuICAgICAgRmxhcHB5Lm9ic3RhY2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChvYnN0YWNsZSkge1xuICAgICAgICBpZiAoIW9ic3RhY2xlLmhpdEF2YXRhciAmJiBvYnN0YWNsZS5jb250YWluc0F2YXRhcigpKSB7XG4gICAgICAgICAgaW5zaWRlT2JzdGFjbGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBpbnNpZGVPYnN0YWNsZSAmJiBGbGFwcHkucGxheWVyU2NvcmUgPiAxO1xuICAgIH0sXG4gICAgZmFpbHVyZUNvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGluc2lkZU9ic3RhY2xlID0gZmFsc2U7XG4gICAgICBGbGFwcHkub2JzdGFjbGVzLmZvckVhY2goZnVuY3Rpb24gKG9ic3RhY2xlKSB7XG4gICAgICAgIGlmICghb2JzdGFjbGUuaGl0QXZhdGFyICYmIG9ic3RhY2xlLmNvbnRhaW5zQXZhdGFyKCkpIHtcbiAgICAgICAgICBpbnNpZGVPYnN0YWNsZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGluc2lkZU9ic3RhY2xlICYmIEZsYXBweS5wbGF5ZXJTY29yZSA8PSAxO1xuICAgIH1cbiAgfSxcbiAgJ3NjYWxlJzoge1xuICAgICdzbmFwUmFkaXVzJzogMlxuICB9LFxuICAndG9vbGJveCc6XG4gICAgdGIoZmxhcEJsb2NrICsgZW5kR2FtZUJsb2NrICsgaW5jcmVtZW50U2NvcmVCbG9jayArIHBsYXlTb3VuZEJsb2NrICsgc2V0U3BlZWRCbG9jayksXG4gICdzdGFydEJsb2Nrcyc6XG4gICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycsIGZsYXBCbG9jaykgK1xuICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScpICtcbiAgICBldmVudEJsb2NrKCd3aGVuX3J1bicsIHNldFNwZWVkQmxvY2spXG59O1xuXG4vLyBjaGFuZ2UgdGhlIHNjZW5lXG5tb2R1bGUuZXhwb3J0cy5rMV84ID0gdXRpbHMuZXh0ZW5kKG1vZHVsZS5leHBvcnRzWyc3J10sIHtcbiAgJ2lzSzEnOiB0cnVlLFxuICAvLyBvdmVycmlkZSByZWd1bGFyIGZsYXBweSBzbyB0aGF0IHdlIGRvbnQgdXNlIHZhcmlhYmxlIGZsYXAgYmxvY2tcbiAgJ3Rvb2xib3gnOlxuICAgIHRiKGZsYXBCbG9jayArIGVuZEdhbWVCbG9jayArIGluY3JlbWVudFNjb3JlQmxvY2sgKyBwbGF5U291bmRCbG9jayArXG4gICAgICBzZXRTcGVlZEJsb2NrICsgc2V0QmFja2dyb3VuZEJsb2NrKSxcbiAgJ3N0YXJ0QmxvY2tzJzpcbiAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNsaWNrJywgZmxhcEJsb2NrKSArXG4gICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kJywgZW5kR2FtZUJsb2NrKSArXG4gICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnLCBlbmRHYW1lQmxvY2spICtcbiAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUnLCBpbmNyZW1lbnRTY29yZUJsb2NrKSArXG4gICAgZXZlbnRCbG9jaygnd2hlbl9ydW4nLCBzZXRTcGVlZEJsb2NrKVxufSk7XG5cbi8vIGNoYW5naW5nIHRoZSBwbGF5ZXJcbm1vZHVsZS5leHBvcnRzLmsxXzkgPSB7XG4gICdpc0sxJzogdHJ1ZSxcbiAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgIFt7J3Rlc3QnOiAnc2V0UGxheWVyJywgJ3R5cGUnOiAnZmxhcHB5X3NldFBsYXllcid9XVxuICBdLFxuICAnb2JzdGFjbGVzJzogdHJ1ZSxcbiAgJ2dyb3VuZCc6IHRydWUsXG4gICdzY29yZSc6IHRydWUsXG4gICdmcmVlUGxheSc6IGZhbHNlLFxuICAnZ29hbCc6IHtcbiAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gKEZsYXBweS5nYW1lU3RhdGUgPT09IEZsYXBweS5HYW1lU3RhdGVzLk9WRVIpO1xuICAgIH1cbiAgfSxcbiAgJ3NjYWxlJzoge1xuICAgICdzbmFwUmFkaXVzJzogMlxuICB9LFxuICAndG9vbGJveCc6XG4gICAgdGIoZmxhcEJsb2NrICsgZW5kR2FtZUJsb2NrICsgaW5jcmVtZW50U2NvcmVCbG9jayArIHBsYXlTb3VuZEJsb2NrICtcbiAgICAgIHNldFNwZWVkQmxvY2sgKyBzZXRCYWNrZ3JvdW5kQmxvY2sgKyBzZXRQbGF5ZXJCbG9jayksXG4gICdzdGFydEJsb2Nrcyc6XG4gICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycsIGZsYXBCbG9jaykgK1xuICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZUdyb3VuZCcsIGVuZEdhbWVCbG9jaykgK1xuICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZU9ic3RhY2xlJywgZW5kR2FtZUJsb2NrKSArXG4gICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5FbnRlck9ic3RhY2xlJywgaW5jcmVtZW50U2NvcmVCbG9jaykgK1xuICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJywgc2V0U3BlZWRCbG9jaylcbn07XG4iLCIvKipcbiAqIEJsb2NrbHkgQXBwOiBGbGFwcHlcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMyBDb2RlLm9yZ1xuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHVkaW9BcHAgPSByZXF1aXJlKCcuLi9TdHVkaW9BcHAnKS5zaW5nbGV0b247XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgZmxhcHB5TXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG52YXIgY29kZWdlbiA9IHJlcXVpcmUoJy4uL2NvZGVnZW4nKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaScpO1xudmFyIHBhZ2UgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvcGFnZS5odG1sLmVqcycpO1xudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2RvbScpO1xudmFyIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIGRyb3BsZXRVdGlscyA9IHJlcXVpcmUoJy4uL2Ryb3BsZXRVdGlscycpO1xuXG52YXIgUmVzdWx0VHlwZSA9IHN0dWRpb0FwcC5SZXN1bHRUeXBlO1xudmFyIFRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLlRlc3RSZXN1bHRzO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5hbWVzcGFjZSBmb3IgdGhlIGFwcGxpY2F0aW9uLlxuICovXG52YXIgRmxhcHB5ID0gbW9kdWxlLmV4cG9ydHM7XG5cbkZsYXBweS5HYW1lU3RhdGVzID0ge1xuICBXQUlUSU5HOiAwLFxuICBBQ1RJVkU6IDEsXG4gIEVORElORzogMixcbiAgT1ZFUjogM1xufTtcblxuRmxhcHB5LmdhbWVTdGF0ZSA9IEZsYXBweS5HYW1lU3RhdGVzLldBSVRJTkc7XG5cbkZsYXBweS5jbGlja1BlbmRpbmcgPSBmYWxzZTtcblxuRmxhcHB5LmF2YXRhclZlbG9jaXR5ID0gMDtcblxudmFyIGxldmVsO1xudmFyIHNraW47XG5cbkZsYXBweS5vYnN0YWNsZXMgPSBbXTtcblxuLyoqXG4gKiBNaWxsaXNlY29uZHMgYmV0d2VlbiBlYWNoIGFuaW1hdGlvbiBmcmFtZS5cbiAqL1xudmFyIHN0ZXBTcGVlZDtcblxuLy8gd2hldGhlciB0byBzaG93IEdldCBSZWFkeSBhbmQgR2FtZSBPdmVyXG52YXIgaW5mb1RleHQ7XG5cbi8vVE9ETzogTWFrZSBjb25maWd1cmFibGUuXG5zdHVkaW9BcHAuc2V0Q2hlY2tGb3JFbXB0eUJsb2Nrcyh0cnVlKTtcblxudmFyIHJhbmRvbU9ic3RhY2xlSGVpZ2h0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWluID0gRmxhcHB5Lk1JTl9PQlNUQUNMRV9IRUlHSFQ7XG4gIHZhciBtYXggPSBGbGFwcHkuTUFaRV9IRUlHSFQgLSBGbGFwcHkuR1JPVU5EX0hFSUdIVCAtIEZsYXBweS5NSU5fT0JTVEFDTEVfSEVJR0hUIC0gRmxhcHB5LkdBUF9TSVpFO1xuICByZXR1cm4gTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbik7XG59O1xuXG4vL1RoZSBudW1iZXIgb2YgYmxvY2tzIHRvIHNob3cgYXMgZmVlZGJhY2suXG5cbi8vIERlZmF1bHQgU2NhbGluZ3NcbkZsYXBweS5zY2FsZSA9IHtcbiAgJ3NuYXBSYWRpdXMnOiAxLFxuICAnc3RlcFNwZWVkJzogMzNcbn07XG5cbnZhciB0d2l0dGVyT3B0aW9ucyA9IHtcbiAgdGV4dDogZmxhcHB5TXNnLnNoYXJlRmxhcHB5VHdpdHRlcigpLFxuICBoYXNodGFnOiBcIkZsYXBweUNvZGVcIlxufTtcblxudmFyIEFWQVRBUl9IRUlHSFQgPSBjb25zdGFudHMuQVZBVEFSX0hFSUdIVDtcbnZhciBBVkFUQVJfV0lEVEggPSBjb25zdGFudHMuQVZBVEFSX1dJRFRIO1xudmFyIEFWQVRBUl9ZX09GRlNFVCA9IGNvbnN0YW50cy5BVkFUQVJfWV9PRkZTRVQ7XG5cbnZhciBsb2FkTGV2ZWwgPSBmdW5jdGlvbigpIHtcbiAgLy8gTG9hZCBtYXBzLlxuICBpbmZvVGV4dCA9IHV0aWxzLnZhbHVlT3IobGV2ZWwuaW5mb1RleHQsIHRydWUpO1xuICBpZiAoIWluZm9UZXh0KSB7XG4gICAgRmxhcHB5LmdhbWVTdGF0ZSA9IEZsYXBweS5HYW1lU3RhdGVzLkFDVElWRTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIHNjYWxhcnMuXG4gIGZvciAodmFyIGtleSBpbiBsZXZlbC5zY2FsZSkge1xuICAgIEZsYXBweS5zY2FsZVtrZXldID0gbGV2ZWwuc2NhbGVba2V5XTtcbiAgfVxuXG4gIC8vIEhlaWdodCBhbmQgd2lkdGggb2YgdGhlIGdvYWwgYW5kIG9ic3RhY2xlcy5cbiAgRmxhcHB5Lk1BUktFUl9IRUlHSFQgPSA0MztcbiAgRmxhcHB5Lk1BUktFUl9XSURUSCA9IDUwO1xuXG4gIEZsYXBweS5NQVpFX1dJRFRIID0gNDAwO1xuICBGbGFwcHkuTUFaRV9IRUlHSFQgPSA0MDA7XG5cbiAgRmxhcHB5LkdST1VORF9XSURUSCA9IDQwMDtcbiAgRmxhcHB5LkdST1VORF9IRUlHSFQgPSA0ODtcblxuICBGbGFwcHkuR09BTF9TSVpFID0gNTU7XG5cbiAgRmxhcHB5Lk9CU1RBQ0xFX1dJRFRIID0gNTI7XG4gIEZsYXBweS5PQlNUQUNMRV9IRUlHSFQgPSAzMjA7XG4gIEZsYXBweS5NSU5fT0JTVEFDTEVfSEVJR0hUID0gNDg7XG5cbiAgRmxhcHB5LnNldEdhcEhlaWdodChhcGkuR2FwSGVpZ2h0Lk5PUk1BTCk7XG5cbiAgRmxhcHB5Lk9CU1RBQ0xFX1NQQUNJTkcgPSAyNTA7IC8vIG51bWJlciBvZiBob3Jpem9udGFsIHBpeGVscyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBvYnN0YWNsZXNcblxuICB2YXIgbnVtT2JzdGFjbGVzID0gMiAqIEZsYXBweS5NQVpFX1dJRFRIIC8gRmxhcHB5Lk9CU1RBQ0xFX1NQQUNJTkc7XG4gIGlmICghbGV2ZWwub2JzdGFjbGVzKSB7XG4gICAgbnVtT2JzdGFjbGVzID0gMDtcbiAgfVxuXG4gIHZhciByZXNldE9ic3RhY2xlID0gZnVuY3Rpb24gKHgpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMuZ2FwU3RhcnQgPSByYW5kb21PYnN0YWNsZUhlaWdodCgpO1xuICAgIHRoaXMuaGl0QXZhdGFyID0gZmFsc2U7XG4gIH07XG5cbiAgdmFyIGNvbnRhaW5zQXZhdGFyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmbGFwcHlSaWdodCA9IEZsYXBweS5hdmF0YXJYICsgQVZBVEFSX1dJRFRIO1xuICAgIHZhciBmbGFwcHlCb3R0b20gPSBGbGFwcHkuYXZhdGFyWSArIEFWQVRBUl9IRUlHSFQ7XG4gICAgdmFyIG9ic3RhY2xlUmlnaHQgPSB0aGlzLnggKyBGbGFwcHkuT0JTVEFDTEVfV0lEVEg7XG4gICAgdmFyIG9ic3RhY2xlQm90dG9tID0gdGhpcy5nYXBTdGFydCArIEZsYXBweS5HQVBfU0laRTtcbiAgICByZXR1cm4gKGZsYXBweVJpZ2h0ID4gdGhpcy54ICYmXG4gICAgICBmbGFwcHlSaWdodCA8IG9ic3RhY2xlUmlnaHQgJiZcbiAgICAgIEZsYXBweS5hdmF0YXJZID4gdGhpcy5nYXBTdGFydCAmJlxuICAgICAgZmxhcHB5Qm90dG9tIDwgb2JzdGFjbGVCb3R0b20pO1xuICB9O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtT2JzdGFjbGVzOyBpKyspIHtcbiAgICBGbGFwcHkub2JzdGFjbGVzLnB1c2goe1xuICAgICAgeDogRmxhcHB5Lk1BWkVfV0lEVEggKiAxLjUgKyBpICogRmxhcHB5Lk9CU1RBQ0xFX1NQQUNJTkcsXG4gICAgICBnYXBTdGFydDogcmFuZG9tT2JzdGFjbGVIZWlnaHQoKSwgLy8geSBjb29yZGluYXRlIG9mIHRoZSB0b3Agb2YgdGhlIGdhcFxuICAgICAgaGl0QXZhdGFyOiBmYWxzZSxcbiAgICAgIHJlc2V0OiByZXNldE9ic3RhY2xlLFxuICAgICAgY29udGFpbnNBdmF0YXI6IGNvbnRhaW5zQXZhdGFyXG4gICAgfSk7XG4gIH1cbn07XG5cbnZhciBkcmF3TWFwID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnRmxhcHB5Jyk7XG4gIHZhciBpLCB4LCB5LCBrLCB0aWxlO1xuXG4gIC8vIEFkanVzdCBvdXRlciBlbGVtZW50IHNpemUuXG4gIHN2Zy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgRmxhcHB5Lk1BWkVfV0lEVEgpO1xuICBzdmcuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBGbGFwcHkuTUFaRV9IRUlHSFQpO1xuXG4gIC8vIEFkanVzdCB2aXN1YWxpemF0aW9uQ29sdW1uIHdpZHRoLlxuICB2YXIgdmlzdWFsaXphdGlvbkNvbHVtbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aXN1YWxpemF0aW9uQ29sdW1uJyk7XG4gIHZpc3VhbGl6YXRpb25Db2x1bW4uc3R5bGUud2lkdGggPSBGbGFwcHkuTUFaRV9XSURUSCArICdweCc7XG5cbiAgaWYgKHNraW4uYmFja2dyb3VuZCkge1xuICAgIHRpbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICAgIHRpbGUuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICBza2luLmJhY2tncm91bmQpO1xuICAgIHRpbGUuc2V0QXR0cmlidXRlKCdpZCcsICdiYWNrZ3JvdW5kJyk7XG4gICAgdGlsZS5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIEZsYXBweS5NQVpFX0hFSUdIVCk7XG4gICAgdGlsZS5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgRmxhcHB5Lk1BWkVfV0lEVEgpO1xuICAgIHRpbGUuc2V0QXR0cmlidXRlKCd4JywgMCk7XG4gICAgdGlsZS5zZXRBdHRyaWJ1dGUoJ3knLCAwKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQodGlsZSk7XG4gIH1cblxuICAvLyBBZGQgb2JzdGFjbGVzXG4gIEZsYXBweS5vYnN0YWNsZXMuZm9yRWFjaCAoZnVuY3Rpb24gKG9ic3RhY2xlLCBpbmRleCkge1xuICAgIHZhciBvYnN0YWNsZVRvcEljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICAgIG9ic3RhY2xlVG9wSWNvbi5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4ub2JzdGFjbGVfdG9wKTtcbiAgICBvYnN0YWNsZVRvcEljb24uc2V0QXR0cmlidXRlKCdpZCcsICdvYnN0YWNsZV90b3AnICsgaW5kZXgpO1xuICAgIG9ic3RhY2xlVG9wSWNvbi5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIEZsYXBweS5PQlNUQUNMRV9IRUlHSFQpO1xuICAgIG9ic3RhY2xlVG9wSWNvbi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgRmxhcHB5Lk9CU1RBQ0xFX1dJRFRIKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQob2JzdGFjbGVUb3BJY29uKTtcblxuICAgIHZhciBvYnN0YWNsZUJvdHRvbUljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICAgIG9ic3RhY2xlQm90dG9tSWNvbi5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4ub2JzdGFjbGVfYm90dG9tKTtcbiAgICBvYnN0YWNsZUJvdHRvbUljb24uc2V0QXR0cmlidXRlKCdpZCcsICdvYnN0YWNsZV9ib3R0b20nICsgaW5kZXgpO1xuICAgIG9ic3RhY2xlQm90dG9tSWNvbi5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIEZsYXBweS5PQlNUQUNMRV9IRUlHSFQpO1xuICAgIG9ic3RhY2xlQm90dG9tSWNvbi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgRmxhcHB5Lk9CU1RBQ0xFX1dJRFRIKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQob2JzdGFjbGVCb3R0b21JY29uKTtcbiAgfSk7XG5cbiAgaWYgKGxldmVsLmdyb3VuZCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBGbGFwcHkuTUFaRV9XSURUSCAvIEZsYXBweS5HUk9VTkRfV0lEVEggKyAxOyBpKyspIHtcbiAgICAgIHZhciBncm91bmRJY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICAgIGdyb3VuZEljb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLmdyb3VuZCk7XG4gICAgICBncm91bmRJY29uLnNldEF0dHJpYnV0ZSgnaWQnLCAnZ3JvdW5kJyArIGkpO1xuICAgICAgZ3JvdW5kSWNvbi5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIEZsYXBweS5HUk9VTkRfSEVJR0hUKTtcbiAgICAgIGdyb3VuZEljb24uc2V0QXR0cmlidXRlKCd3aWR0aCcsIEZsYXBweS5HUk9VTkRfV0lEVEgpO1xuICAgICAgZ3JvdW5kSWNvbi5zZXRBdHRyaWJ1dGUoJ3gnLCAwKTtcbiAgICAgIGdyb3VuZEljb24uc2V0QXR0cmlidXRlKCd5JywgRmxhcHB5Lk1BWkVfSEVJR0hUIC0gRmxhcHB5LkdST1VORF9IRUlHSFQpO1xuICAgICAgc3ZnLmFwcGVuZENoaWxkKGdyb3VuZEljb24pO1xuICAgIH1cbiAgfVxuXG4gIGlmIChsZXZlbC5nb2FsICYmIGxldmVsLmdvYWwuc3RhcnRYKSB7XG4gICAgdmFyIGdvYWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICAgIGdvYWwuc2V0QXR0cmlidXRlKCdpZCcsICdnb2FsJyk7XG4gICAgZ29hbC5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLmdvYWwpO1xuICAgIGdvYWwuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBGbGFwcHkuR09BTF9TSVpFKTtcbiAgICBnb2FsLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBGbGFwcHkuR09BTF9TSVpFKTtcbiAgICBnb2FsLnNldEF0dHJpYnV0ZSgneCcsIGxldmVsLmdvYWwuc3RhcnRYKTtcbiAgICBnb2FsLnNldEF0dHJpYnV0ZSgneScsIGxldmVsLmdvYWwuc3RhcnRZKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoZ29hbCk7XG4gIH1cblxuICB2YXIgYXZhdEFyY2xpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2NsaXBQYXRoJyk7XG4gIGF2YXRBcmNsaXAuc2V0QXR0cmlidXRlKCdpZCcsICdhdmF0QXJjbGlwUGF0aCcpO1xuICB2YXIgYXZhdEFyY2xpcFJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdyZWN0Jyk7XG4gIGF2YXRBcmNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnaWQnLCAnYXZhdEFyY2xpcFJlY3QnKTtcbiAgYXZhdEFyY2xpcFJlY3Quc2V0QXR0cmlidXRlKCd3aWR0aCcsIEZsYXBweS5NQVpFX1dJRFRIKTtcbiAgYXZhdEFyY2xpcFJlY3Quc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBGbGFwcHkuTUFaRV9IRUlHSFQgLSBGbGFwcHkuR1JPVU5EX0hFSUdIVCk7XG4gIGF2YXRBcmNsaXAuYXBwZW5kQ2hpbGQoYXZhdEFyY2xpcFJlY3QpO1xuICBzdmcuYXBwZW5kQ2hpbGQoYXZhdEFyY2xpcCk7XG5cbiAgLy8gQWRkIGF2YXRhci5cbiAgdmFyIGF2YXRhckljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICBhdmF0YXJJY29uLnNldEF0dHJpYnV0ZSgnaWQnLCAnYXZhdGFyJyk7XG4gIGF2YXRhckljb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uYXZhdGFyKTtcbiAgYXZhdGFySWNvbi5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIEFWQVRBUl9IRUlHSFQpO1xuICBhdmF0YXJJY29uLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBBVkFUQVJfV0lEVEgpO1xuICBpZiAobGV2ZWwuZ3JvdW5kKSB7XG4gICAgYXZhdGFySWNvbi5zZXRBdHRyaWJ1dGUoJ2NsaXAtcGF0aCcsICd1cmwoI2F2YXRBcmNsaXBQYXRoKScpO1xuICB9XG4gIHN2Zy5hcHBlbmRDaGlsZChhdmF0YXJJY29uKTtcblxuICB2YXIgaW5zdHJ1Y3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgaW5zdHJ1Y3Rpb25zLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5pbnN0cnVjdGlvbnMpO1xuICBpbnN0cnVjdGlvbnMuc2V0QXR0cmlidXRlKCdpZCcsICdpbnN0cnVjdGlvbnMnKTtcbiAgaW5zdHJ1Y3Rpb25zLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgNTApO1xuICBpbnN0cnVjdGlvbnMuc2V0QXR0cmlidXRlKCd3aWR0aCcsIDE1OSk7XG4gIGluc3RydWN0aW9ucy5zZXRBdHRyaWJ1dGUoJ3gnLCAxMTApO1xuICBpbnN0cnVjdGlvbnMuc2V0QXR0cmlidXRlKCd5JywgMTcwKTtcbiAgaW5zdHJ1Y3Rpb25zLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgc3ZnLmFwcGVuZENoaWxkKGluc3RydWN0aW9ucyk7XG5cbiAgdmFyIGdldHJlYWR5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgZ2V0cmVhZHkuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLmdldHJlYWR5KTtcbiAgZ2V0cmVhZHkuc2V0QXR0cmlidXRlKCdpZCcsICdnZXRyZWFkeScpO1xuICBnZXRyZWFkeS5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIDUwKTtcbiAgZ2V0cmVhZHkuc2V0QXR0cmlidXRlKCd3aWR0aCcsIDE4Myk7XG4gIGdldHJlYWR5LnNldEF0dHJpYnV0ZSgneCcsIDEwOCk7XG4gIGdldHJlYWR5LnNldEF0dHJpYnV0ZSgneScsIDgwKTtcbiAgZ2V0cmVhZHkuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICBzdmcuYXBwZW5kQ2hpbGQoZ2V0cmVhZHkpO1xuXG4gIHZhciBjbGlja3J1biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2ltYWdlJyk7XG4gIGNsaWNrcnVuLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5jbGlja3J1bik7XG4gIGNsaWNrcnVuLnNldEF0dHJpYnV0ZSgnaWQnLCAnY2xpY2tydW4nKTtcbiAgY2xpY2tydW4uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCA0MSk7XG4gIGNsaWNrcnVuLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAyNzMpO1xuICBjbGlja3J1bi5zZXRBdHRyaWJ1dGUoJ3gnLCA2NCk7XG4gIGNsaWNrcnVuLnNldEF0dHJpYnV0ZSgneScsIDIwMCk7XG4gIGNsaWNrcnVuLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmlsZScpO1xuICBzdmcuYXBwZW5kQ2hpbGQoY2xpY2tydW4pO1xuXG4gIHZhciBnYW1lb3ZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2ltYWdlJyk7XG4gIGdhbWVvdmVyLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5nYW1lb3Zlcik7XG4gIGdhbWVvdmVyLnNldEF0dHJpYnV0ZSgnaWQnLCAnZ2FtZW92ZXInKTtcbiAgZ2FtZW92ZXIuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCA0MSk7XG4gIGdhbWVvdmVyLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAxOTIpO1xuICBnYW1lb3Zlci5zZXRBdHRyaWJ1dGUoJ3gnLCAxMDQpO1xuICBnYW1lb3Zlci5zZXRBdHRyaWJ1dGUoJ3knLCA4MCk7XG4gIGdhbWVvdmVyLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgc3ZnLmFwcGVuZENoaWxkKGdhbWVvdmVyKTtcblxuICB2YXIgc2NvcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICd0ZXh0Jyk7XG4gIHNjb3JlLnNldEF0dHJpYnV0ZSgnaWQnLCAnc2NvcmUnKTtcbiAgc2NvcmUuc2V0QXR0cmlidXRlKCdjbGFzcycsICdmbGFwcHktc2NvcmUnKTtcbiAgc2NvcmUuc2V0QXR0cmlidXRlKCd4JywgRmxhcHB5Lk1BWkVfV0lEVEggLyAyKTtcbiAgc2NvcmUuc2V0QXR0cmlidXRlKCd5JywgNjApO1xuICBzY29yZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnMCcpKTtcbiAgc2NvcmUuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICBzdmcuYXBwZW5kQ2hpbGQoc2NvcmUpO1xuXG4gIHZhciBjbGlja1JlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdyZWN0Jyk7XG4gIGNsaWNrUmVjdC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgRmxhcHB5Lk1BWkVfV0lEVEgpO1xuICBjbGlja1JlY3Quc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBGbGFwcHkuTUFaRV9IRUlHSFQpO1xuICBjbGlja1JlY3Quc2V0QXR0cmlidXRlKCdmaWxsLW9wYWNpdHknLCAwKTtcbiAgY2xpY2tSZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbiAoZSkge1xuICAgIEZsYXBweS5vbk1vdXNlRG93bihlKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIGRvbid0IHdhbnQgdG8gc2VlIG1vdXNlIGRvd25cbiAgfSk7XG4gIGNsaWNrUmVjdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgIEZsYXBweS5vbk1vdXNlRG93bihlKTtcbiAgfSk7XG4gIHN2Zy5hcHBlbmRDaGlsZChjbGlja1JlY3QpO1xufTtcblxuRmxhcHB5LmNhbGNEaXN0YW5jZSA9IGZ1bmN0aW9uKHhEaXN0LCB5RGlzdCkge1xuICByZXR1cm4gTWF0aC5zcXJ0KHhEaXN0ICogeERpc3QgKyB5RGlzdCAqIHlEaXN0KTtcbn07XG5cbnZhciBlc3NlbnRpYWxseUVxdWFsID0gZnVuY3Rpb24oZmxvYXQxLCBmbG9hdDIsIG9wdF92YXJpYW5jZSkge1xuICB2YXIgdmFyaWFuY2UgPSBvcHRfdmFyaWFuY2UgfHwgMC4wMTtcbiAgcmV0dXJuIChNYXRoLmFicyhmbG9hdDEgLSBmbG9hdDIpIDwgdmFyaWFuY2UpO1xufTtcblxuLyoqXG4gKiBDaGVjayB0byBzZWUgaWYgYXZhdGFyIGlzIGluIGNvbGxpc2lvbiB3aXRoIGdpdmVuIG9ic3RhY2xlXG4gKiBAcGFyYW0gb2JzdGFjbGUgT2JqZWN0IDogVGhlIG9ic3RhY2xlIG9iamVjdCB3ZSdyZSBjaGVja2luZ1xuICovXG52YXIgY2hlY2tGb3JPYnN0YWNsZUNvbGxpc2lvbiA9IGZ1bmN0aW9uIChvYnN0YWNsZSkge1xuICB2YXIgaW5zaWRlT2JzdGFjbGVDb2x1bW4gPSBGbGFwcHkuYXZhdGFyWCArIEFWQVRBUl9XSURUSCA+PSBvYnN0YWNsZS54ICYmXG4gICAgRmxhcHB5LmF2YXRhclggPD0gb2JzdGFjbGUueCArIEZsYXBweS5PQlNUQUNMRV9XSURUSDtcbiAgaWYgKGluc2lkZU9ic3RhY2xlQ29sdW1uICYmIChGbGFwcHkuYXZhdGFyWSA8PSBvYnN0YWNsZS5nYXBTdGFydCB8fFxuICAgIEZsYXBweS5hdmF0YXJZICsgQVZBVEFSX0hFSUdIVCA+PSBvYnN0YWNsZS5nYXBTdGFydCArIEZsYXBweS5HQVBfU0laRSkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5GbGFwcHkuYWN0aXZlVGlja3MgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChGbGFwcHkuZmlyc3RBY3RpdmVUaWNrIDwgMCkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgcmV0dXJuIChGbGFwcHkudGlja0NvdW50IC0gRmxhcHB5LmZpcnN0QWN0aXZlVGljayk7XG59O1xuXG4vKipcbiAqIFdlIHdhbnQgdG8gc3dhbGxvdyBleGNlcHRpb25zIHdoZW4gZXhlY3V0aW5nIHVzZXIgZ2VuZXJhdGVkIGNvZGUuIFRoaXMgcHJvdmlkZXNcbiAqIGEgc2luZ2xlIHBsYWNlIHRvIGRvIHNvLlxuICovXG5GbGFwcHkuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlID0gZnVuY3Rpb24gKGZuKSB7XG4gIHRyeSB7XG4gICAgZm4uY2FsbChGbGFwcHksIHN0dWRpb0FwcCwgYXBpKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIHN3YWxsb3cgZXJyb3IuIHNob3VsZCB3ZSBhbHNvIGxvZyB0aGlzIHNvbWV3aGVyZT9cbiAgICBpZiAoY29uc29sZSkge1xuICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgfVxuICB9XG59O1xuXG5cbkZsYXBweS5vblRpY2sgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGF2YXRhcldhc0Fib3ZlR3JvdW5kLCBhdmF0YXJJc0Fib3ZlR3JvdW5kO1xuXG4gIGlmIChGbGFwcHkuZmlyc3RBY3RpdmVUaWNrIDwgMCAmJiBGbGFwcHkuZ2FtZVN0YXRlID09PSBGbGFwcHkuR2FtZVN0YXRlcy5BQ1RJVkUpIHtcbiAgICBGbGFwcHkuZmlyc3RBY3RpdmVUaWNrID0gRmxhcHB5LnRpY2tDb3VudDtcbiAgfVxuXG4gIEZsYXBweS50aWNrQ291bnQrKztcblxuICBpZiAoRmxhcHB5LnRpY2tDb3VudCA9PT0gMSkge1xuICAgIEZsYXBweS5jYWxsVXNlckdlbmVyYXRlZENvZGUoRmxhcHB5LndoZW5SdW5CdXR0b24pO1xuICB9XG5cbiAgLy8gQ2hlY2sgZm9yIGNsaWNrXG4gIGlmIChGbGFwcHkuY2xpY2tQZW5kaW5nICYmIEZsYXBweS5nYW1lU3RhdGUgPD0gRmxhcHB5LkdhbWVTdGF0ZXMuQUNUSVZFKSB7XG4gICAgRmxhcHB5LmNhbGxVc2VyR2VuZXJhdGVkQ29kZShGbGFwcHkud2hlbkNsaWNrKTtcbiAgICBGbGFwcHkuY2xpY2tQZW5kaW5nID0gZmFsc2U7XG4gIH1cblxuICBhdmF0YXJXYXNBYm92ZUdyb3VuZCA9IChGbGFwcHkuYXZhdGFyWSArIEFWQVRBUl9IRUlHSFQpIDxcbiAgICAoRmxhcHB5Lk1BWkVfSEVJR0hUIC0gRmxhcHB5LkdST1VORF9IRUlHSFQpO1xuXG4gIC8vIEFjdGlvbiBkb2Vzbid0IHN0YXJ0IHVudGlsIHVzZXIncyBmaXJzdCBjbGlja1xuICBpZiAoRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuQUNUSVZFKSB7XG4gICAgLy8gVXBkYXRlIGF2YXRhcidzIHZlcnRpY2FsIHBvc2l0aW9uXG4gICAgRmxhcHB5LmF2YXRhclZlbG9jaXR5ICs9IEZsYXBweS5ncmF2aXR5O1xuICAgIEZsYXBweS5hdmF0YXJZID0gRmxhcHB5LmF2YXRhclkgKyBGbGFwcHkuYXZhdGFyVmVsb2NpdHk7XG5cbiAgICAvLyBuZXZlciBsZXQgdGhlIGF2YXRhciBnbyB0b28gZmFyIG9mZiB0aGUgdG9wIG9yIGJvdHRvbVxuICAgIHZhciBib3R0b21MaW1pdCA9IGxldmVsLmdyb3VuZCA/XG4gICAgICAoRmxhcHB5Lk1BWkVfSEVJR0hUIC0gRmxhcHB5LkdST1VORF9IRUlHSFQgLSBBVkFUQVJfSEVJR0hUICsgMSkgOlxuICAgICAgKEZsYXBweS5NQVpFX0hFSUdIVCAqIDEuNSk7XG5cbiAgICBGbGFwcHkuYXZhdGFyWSA9IE1hdGgubWluKEZsYXBweS5hdmF0YXJZLCBib3R0b21MaW1pdCk7XG4gICAgRmxhcHB5LmF2YXRhclkgPSBNYXRoLm1heChGbGFwcHkuYXZhdGFyWSwgRmxhcHB5Lk1BWkVfSEVJR0hUICogLTAuNSk7XG5cbiAgICAvLyBVcGRhdGUgb2JzdGFjbGVzXG4gICAgRmxhcHB5Lm9ic3RhY2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChvYnN0YWNsZSwgaW5kZXgpIHtcbiAgICAgIHZhciB3YXNSaWdodE9mQXZhdGFyID0gb2JzdGFjbGUueCA+IChGbGFwcHkuYXZhdGFyWCArIEFWQVRBUl9XSURUSCk7XG5cbiAgICAgIG9ic3RhY2xlLnggLT0gRmxhcHB5LlNQRUVEO1xuXG4gICAgICB2YXIgaXNSaWdodE9mQXZhdGFyID0gb2JzdGFjbGUueCA+IChGbGFwcHkuYXZhdGFyWCArIEFWQVRBUl9XSURUSCk7XG4gICAgICBpZiAod2FzUmlnaHRPZkF2YXRhciAmJiAhaXNSaWdodE9mQXZhdGFyKSB7XG4gICAgICAgIGlmIChGbGFwcHkuYXZhdGFyWSA+IG9ic3RhY2xlLmdhcFN0YXJ0ICYmXG4gICAgICAgICAgKEZsYXBweS5hdmF0YXJZICsgQVZBVEFSX0hFSUdIVCA8IG9ic3RhY2xlLmdhcFN0YXJ0ICsgRmxhcHB5LkdBUF9TSVpFKSkge1xuICAgICAgICAgIEZsYXBweS5jYWxsVXNlckdlbmVyYXRlZENvZGUoRmxhcHB5LndoZW5FbnRlck9ic3RhY2xlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIW9ic3RhY2xlLmhpdEF2YXRhciAmJiBjaGVja0Zvck9ic3RhY2xlQ29sbGlzaW9uKG9ic3RhY2xlKSkge1xuICAgICAgICBvYnN0YWNsZS5oaXRBdmF0YXIgPSB0cnVlO1xuICAgICAgICB0cnkge0ZsYXBweS53aGVuQ29sbGlkZU9ic3RhY2xlKHN0dWRpb0FwcCwgYXBpKTsgfSBjYXRjaCAoZSkgeyB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG9ic3RhY2xlIG1vdmVzIG9mZiBsZWZ0IHNpZGUsIHJlcHVycG9zZSBhcyBhIG5ldyBvYnN0YWNsZSB0byBvdXIgcmlnaHRcbiAgICAgIHZhciBudW1PYnN0YWNsZXMgPSBGbGFwcHkub2JzdGFjbGVzLmxlbmd0aDtcbiAgICAgIHZhciBwcmV2aW91c09ic3RhY2xlSW5kZXggPSAoaW5kZXggLSAxICsgbnVtT2JzdGFjbGVzICkgJSBudW1PYnN0YWNsZXM7XG4gICAgICBpZiAob2JzdGFjbGUueCArIEZsYXBweS5PQlNUQUNMRV9XSURUSCA8IDApIHtcbiAgICAgICAgb2JzdGFjbGUucmVzZXQoRmxhcHB5Lm9ic3RhY2xlc1twcmV2aW91c09ic3RhY2xlSW5kZXhdLnggKyBGbGFwcHkuT0JTVEFDTEVfU1BBQ0lORyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBjaGVjayBmb3IgZ3JvdW5kIGNvbGxpc2lvblxuICAgIGF2YXRhcklzQWJvdmVHcm91bmQgPSAoRmxhcHB5LmF2YXRhclkgKyBBVkFUQVJfSEVJR0hUKSA8XG4gICAgICAoRmxhcHB5Lk1BWkVfSEVJR0hUIC0gRmxhcHB5LkdST1VORF9IRUlHSFQpO1xuICAgIGlmIChhdmF0YXJXYXNBYm92ZUdyb3VuZCAmJiAhYXZhdGFySXNBYm92ZUdyb3VuZCkge1xuICAgICAgRmxhcHB5LmNhbGxVc2VyR2VuZXJhdGVkQ29kZShGbGFwcHkud2hlbkNvbGxpZGVHcm91bmQpO1xuICAgIH1cblxuICAgIC8vIHVwZGF0ZSBnb2FsXG4gICAgaWYgKGxldmVsLmdvYWwgJiYgbGV2ZWwuZ29hbC5tb3ZpbmcpIHtcbiAgICAgIEZsYXBweS5nb2FsWCAtPSBGbGFwcHkuU1BFRUQ7XG4gICAgICBpZiAoRmxhcHB5LmdvYWxYICsgRmxhcHB5LkdPQUxfU0laRSA8IDApIHtcbiAgICAgICAgLy8gaWYgaXQgZGlzYXBwZWFycyBvZmYgb2YgbGVmdCwgcmVhcHBlYXIgb24gcmlnaHRcbiAgICAgICAgRmxhcHB5LmdvYWxYID0gRmxhcHB5Lk1BWkVfV0lEVEggKyBGbGFwcHkuR09BTF9TSVpFO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChGbGFwcHkuZ2FtZVN0YXRlID09PSBGbGFwcHkuR2FtZVN0YXRlcy5FTkRJTkcpIHtcbiAgICBGbGFwcHkuYXZhdGFyWSArPSAxMDtcblxuICAgIC8vIHdlIHVzZSBhdmF0YXIgd2lkdGggaW5zdGVhZCBvZiBoZWlnaHQgYmMgaGUgaXMgcm90YXRpbmdcbiAgICAvLyB0aGUgZXh0cmEgNCBpcyBzbyB0aGF0IGhlIGJ1cmllcyBoaXMgYmVhayAoc2ltaWxhciB0byBtb2JpbGUgZ2FtZSlcbiAgICB2YXIgbWF4ID0gRmxhcHB5Lk1BWkVfSEVJR0hUIC0gRmxhcHB5LkdST1VORF9IRUlHSFQgLSBBVkFUQVJfV0lEVEggKyA0O1xuICAgIGlmIChGbGFwcHkuYXZhdGFyWSA+PSBtYXgpIHtcbiAgICAgIEZsYXBweS5hdmF0YXJZID0gbWF4O1xuICAgICAgRmxhcHB5LmdhbWVTdGF0ZSA9IEZsYXBweS5HYW1lU3RhdGVzLk9WRVI7XG4gICAgICBGbGFwcHkuZ2FtZU92ZXJUaWNrID0gRmxhcHB5LnRpY2tDb3VudDtcbiAgICB9XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXZhdGFyJykuc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLFxuICAgICAgJ3RyYW5zbGF0ZSgnICsgQVZBVEFSX1dJRFRIICsgJywgMCkgJyArXG4gICAgICAncm90YXRlKDkwLCAnICsgRmxhcHB5LmF2YXRhclggKyAnLCAnICsgRmxhcHB5LmF2YXRhclkgKyAnKScpO1xuICAgIGlmIChpbmZvVGV4dCkge1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVvdmVyJykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2liaWxlJyk7XG4gICAgfVxuICB9XG5cbiAgRmxhcHB5LmRpc3BsYXlBdmF0YXIoRmxhcHB5LmF2YXRhclgsIEZsYXBweS5hdmF0YXJZKTtcbiAgRmxhcHB5LmRpc3BsYXlPYnN0YWNsZXMoKTtcbiAgaWYgKEZsYXBweS5nYW1lU3RhdGUgPD0gRmxhcHB5LkdhbWVTdGF0ZXMuQUNUSVZFKSB7XG4gICAgRmxhcHB5LmRpc3BsYXlHcm91bmQoRmxhcHB5LnRpY2tDb3VudCk7XG4gICAgRmxhcHB5LmRpc3BsYXlHb2FsKCk7XG4gIH1cblxuICBpZiAoY2hlY2tGaW5pc2hlZCgpKSB7XG4gICAgRmxhcHB5Lm9uUHV6emxlQ29tcGxldGUoKTtcbiAgfVxufTtcblxuRmxhcHB5Lm9uTW91c2VEb3duID0gZnVuY3Rpb24gKGUpIHtcbiAgaWYgKEZsYXBweS5pbnRlcnZhbElkKSB7XG4gICAgRmxhcHB5LmNsaWNrUGVuZGluZyA9IHRydWU7XG4gICAgaWYgKEZsYXBweS5nYW1lU3RhdGUgPT09IEZsYXBweS5HYW1lU3RhdGVzLldBSVRJTkcpIHtcbiAgICAgIEZsYXBweS5nYW1lU3RhdGUgPSBGbGFwcHkuR2FtZVN0YXRlcy5BQ1RJVkU7XG4gICAgfSBlbHNlIGlmIChGbGFwcHkuZ2FtZVN0YXRlID09PSBGbGFwcHkuR2FtZVN0YXRlcy5PVkVSICYmXG4gICAgICBGbGFwcHkuZ2FtZU92ZXJUaWNrICsgMTAgPCBGbGFwcHkudGlja0NvdW50KSB7XG4gICAgICAvLyBkbyBhIHJlc2V0XG4gICAgICB2YXIgcmVzZXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXRCdXR0b24nKTtcbiAgICAgIGlmIChyZXNldEJ1dHRvbikge1xuICAgICAgICByZXNldEJ1dHRvbi5jbGljaygpO1xuICAgICAgfVxuICAgIH1cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5zdHJ1Y3Rpb25zJykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnZXRyZWFkeScpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgfSBlbHNlIGlmIChGbGFwcHkuZ2FtZVN0YXRlID09PSBGbGFwcHkuR2FtZVN0YXRlcy5XQUlUSU5HKSB7XG4gICAgRmxhcHB5LnJ1bkJ1dHRvbkNsaWNrKCk7XG4gIH1cbn07XG4vKipcbiAqIEluaXRpYWxpemUgQmxvY2tseSBhbmQgdGhlIEZsYXBweSBhcHAuICBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5GbGFwcHkuaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAvLyByZXBsYWNlIHN0dWRpb0FwcCBtZXRob2RzIHdpdGggb3VyIG93blxuICBzdHVkaW9BcHAucmVzZXQgPSB0aGlzLnJlc2V0LmJpbmQodGhpcyk7XG4gIHN0dWRpb0FwcC5ydW5CdXR0b25DbGljayA9IHRoaXMucnVuQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcblxuICBGbGFwcHkuY2xlYXJFdmVudEhhbmRsZXJzS2lsbFRpY2tMb29wKCk7XG4gIHNraW4gPSBjb25maWcuc2tpbjtcbiAgbGV2ZWwgPSBjb25maWcubGV2ZWw7XG5cbiAgY29uZmlnLmdyYXlPdXRVbmRlbGV0YWJsZUJsb2NrcyA9IGxldmVsLmdyYXlPdXRVbmRlbGV0YWJsZUJsb2NrcztcblxuICBsb2FkTGV2ZWwoKTtcblxuICBjb25maWcuaHRtbCA9IHBhZ2Uoe1xuICAgIGFzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmwsXG4gICAgZGF0YToge1xuICAgICAgbG9jYWxlRGlyZWN0aW9uOiBzdHVkaW9BcHAubG9jYWxlRGlyZWN0aW9uKCksXG4gICAgICB2aXN1YWxpemF0aW9uOiByZXF1aXJlKCcuL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMnKSgpLFxuICAgICAgY29udHJvbHM6IHJlcXVpcmUoJy4vY29udHJvbHMuaHRtbC5lanMnKSh7YXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCwgc2hhcmVhYmxlOiBsZXZlbC5zaGFyZWFibGV9KSxcbiAgICAgIGJsb2NrVXNlZDogdW5kZWZpbmVkLFxuICAgICAgaWRlYWxCbG9ja051bWJlcjogdW5kZWZpbmVkLFxuICAgICAgZWRpdENvZGU6IGxldmVsLmVkaXRDb2RlLFxuICAgICAgYmxvY2tDb3VudGVyQ2xhc3M6ICdibG9jay1jb3VudGVyLWRlZmF1bHQnLFxuICAgICAgcmVhZG9ubHlXb3Jrc3BhY2U6IGNvbmZpZy5yZWFkb25seVdvcmtzcGFjZVxuICAgIH1cbiAgfSk7XG5cbiAgY29uZmlnLmxvYWRBdWRpbyA9IGZ1bmN0aW9uKCkge1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi53aW5Tb3VuZCwgJ3dpbicpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5zdGFydFNvdW5kLCAnc3RhcnQnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uZmFpbHVyZVNvdW5kLCAnZmFpbHVyZScpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5vYnN0YWNsZVNvdW5kLCAnb2JzdGFjbGUnKTtcblxuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5kaWVTb3VuZCwgJ3NmeF9kaWUnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uaGl0U291bmQsICdzZnhfaGl0Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLnBvaW50U291bmQsICdzZnhfcG9pbnQnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uc3dvb3NoaW5nU291bmQsICdzZnhfc3dvb3NoaW5nJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndpbmdTb3VuZCwgJ3NmeF93aW5nJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndpbkdvYWxTb3VuZCwgJ3dpbkdvYWwnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uamV0U291bmQsICdqZXQnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uamluZ2xlU291bmQsICdqaW5nbGUnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uY3Jhc2hTb3VuZCwgJ2NyYXNoJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmxhc2VyU291bmQsICdsYXNlcicpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5zcGxhc2hTb3VuZCwgJ3NwbGFzaCcpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi53YWxsU291bmQsICd3YWxsJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndhbGwwU291bmQsICd3YWxsMCcpO1xuICB9O1xuXG4gIGNvbmZpZy5hZnRlckluamVjdCA9IGZ1bmN0aW9uKCkge1xuICAgIC8qKlxuICAgICAqIFRoZSByaWNobmVzcyBvZiBibG9jayBjb2xvdXJzLCByZWdhcmRsZXNzIG9mIHRoZSBodWUuXG4gICAgICogTU9PQyBibG9ja3Mgc2hvdWxkIGJlIGJyaWdodGVyICh0YXJnZXQgYXVkaWVuY2UgaXMgeW91bmdlcikuXG4gICAgICogTXVzdCBiZSBpbiB0aGUgcmFuZ2Ugb2YgMCAoaW5jbHVzaXZlKSB0byAxIChleGNsdXNpdmUpLlxuICAgICAqIEJsb2NrbHkncyBkZWZhdWx0IGlzIDAuNDUuXG4gICAgICovXG4gICAgQmxvY2tseS5IU1ZfU0FUVVJBVElPTiA9IDAuNjtcblxuICAgIEJsb2NrbHkuU05BUF9SQURJVVMgKj0gRmxhcHB5LnNjYWxlLnNuYXBSYWRpdXM7XG5cbiAgICBkcmF3TWFwKCk7XG4gIH07XG5cbiAgY29uZmlnLnRyYXNoY2FuID0gZmFsc2U7XG5cbiAgY29uZmlnLnR3aXR0ZXIgPSB0d2l0dGVyT3B0aW9ucztcblxuICAvLyBmb3IgZmxhcHB5IHNob3cgbWFrZSB5b3VyIG93biBidXR0b24gaWYgb24gc2hhcmUgcGFnZVxuICBjb25maWcubWFrZVlvdXJPd24gPSBjb25maWcuc2hhcmU7XG5cbiAgY29uZmlnLm1ha2VTdHJpbmcgPSBjb21tb25Nc2cubWFrZVlvdXJPd25GbGFwcHkoKTtcbiAgY29uZmlnLm1ha2VVcmwgPSBcImh0dHA6Ly9jb2RlLm9yZy9mbGFwcHlcIjtcbiAgY29uZmlnLm1ha2VJbWFnZSA9IHN0dWRpb0FwcC5hc3NldFVybCgnbWVkaWEvZmxhcHB5X3Byb21vLnBuZycpO1xuXG4gIGNvbmZpZy5lbmFibGVTaG93Q29kZSA9IGZhbHNlO1xuICBjb25maWcuZW5hYmxlU2hvd0Jsb2NrQ291bnQgPSBmYWxzZTtcblxuICBpZiAobGV2ZWwuaXNLMSkge1xuICAgIC8vIGsxIGJsb2NrcyBhcmUgdGFsbGVyXG4gICAgY29uc3RhbnRzLldPUktTUEFDRV9ST1dfSEVJR0hUICo9IDEuNTtcbiAgfVxuXG4gIC8vIGRlZmluZSBob3cgb3VyIGJsb2NrcyBzaG91bGQgYmUgYXJyYW5nZWRcbiAgdmFyIGNvbDEgPSBjb25zdGFudHMuV09SS1NQQUNFX0JVRkZFUjtcbiAgdmFyIGNvbDIgPSBjb2wxICsgY29uc3RhbnRzLldPUktTUEFDRV9DT0xfV0lEVEg7XG4gIHZhciByb3cxID0gY29uc3RhbnRzLldPUktTUEFDRV9CVUZGRVI7XG4gIHZhciByb3cyID0gcm93MSArIGNvbnN0YW50cy5XT1JLU1BBQ0VfUk9XX0hFSUdIVDtcbiAgdmFyIHJvdzMgPSByb3cyICsgY29uc3RhbnRzLldPUktTUEFDRV9ST1dfSEVJR0hUO1xuXG4gIGNvbmZpZy5ibG9ja0FycmFuZ2VtZW50ID0ge1xuICAgICdmbGFwcHlfd2hlbkNsaWNrJzogeyB4OiBjb2wxLCB5OiByb3cxfSxcbiAgICAnd2hlbl9ydW4nOiB7IHg6IGNvbDEsIHk6IHJvdzF9LFxuICAgICdmbGFwcHlfd2hlbkNvbGxpZGVHcm91bmQnOiB7IHg6IGNvbDIsIHk6IHJvdzF9LFxuICAgICdmbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZSc6IHsgeDogY29sMiwgeTogcm93Mn0sXG4gICAgJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZSc6IHsgeDogY29sMiwgeTogcm93M31cbiAgfTtcblxuICAvLyBpZiB3ZSBkb250IGhhdmUgY29sbGlkZSBldmVudHMsIGhhdmUgZW50ZXIgb2JzdGFjbGUgaW4gdG9wIHJvd1xuICBpZiAobGV2ZWwuc3RhcnRCbG9ja3MuaW5kZXhPZignd2hlbkNvbGxpZGUnKSA9PT0gLTEpIHtcbiAgICBjb25maWcuYmxvY2tBcnJhbmdlbWVudC5mbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUgPSB7eDogY29sMiwgeTogcm93MX07XG4gIH1cblxuICAvLyB3aGVuIHdlIGhhdmUgd2hlbl9ydW4gYW5kIHdoZW5fY2xpY2ssIHB1dCB3aGVuX3J1biBpbiB0b3Agcm93XG4gIGlmIChsZXZlbC5zdGFydEJsb2Nrcy5pbmRleE9mKCd3aGVuX3J1bicpICE9PSAtMSkge1xuICAgIGNvbmZpZy5ibG9ja0FycmFuZ2VtZW50LmZsYXBweV93aGVuQ2xpY2sueSA9IHJvdzI7XG4gIH1cblxuICBzdHVkaW9BcHAuaW5pdChjb25maWcpO1xuXG4gIHZhciByaWdodEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyaWdodEJ1dHRvbicpO1xuICBkb20uYWRkQ2xpY2tUb3VjaEV2ZW50KHJpZ2h0QnV0dG9uLCBGbGFwcHkub25QdXp6bGVDb21wbGV0ZSk7XG59O1xuXG4vKipcbiAqIENsZWFyIHRoZSBldmVudCBoYW5kbGVycyBhbmQgc3RvcCB0aGUgb25UaWNrIHRpbWVyLlxuICovXG5GbGFwcHkuY2xlYXJFdmVudEhhbmRsZXJzS2lsbFRpY2tMb29wID0gZnVuY3Rpb24oKSB7XG4gIEZsYXBweS53aGVuQ2xpY2sgPSBudWxsO1xuICBGbGFwcHkud2hlbkNvbGxpZGVHcm91bmQgPSBudWxsO1xuICBGbGFwcHkud2hlbkNvbGxpZGVPYnN0YWNsZSA9IG51bGw7XG4gIEZsYXBweS53aGVuRW50ZXJPYnN0YWNsZSA9IG51bGw7XG4gIEZsYXBweS53aGVuUnVuQnV0dG9uID0gbnVsbDtcbiAgaWYgKEZsYXBweS5pbnRlcnZhbElkKSB7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwoRmxhcHB5LmludGVydmFsSWQpO1xuICB9XG4gIEZsYXBweS5pbnRlcnZhbElkID0gMDtcbn07XG5cbi8qKlxuICogUmVzZXQgdGhlIGFwcCB0byB0aGUgc3RhcnQgcG9zaXRpb24gYW5kIGtpbGwgYW55IHBlbmRpbmcgYW5pbWF0aW9uIHRhc2tzLlxuICogQHBhcmFtIHtib29sZWFufSBmaXJzdCBUcnVlIGlmIGFuIG9wZW5pbmcgYW5pbWF0aW9uIGlzIHRvIGJlIHBsYXllZC5cbiAqL1xuRmxhcHB5LnJlc2V0ID0gZnVuY3Rpb24oZmlyc3QpIHtcbiAgdmFyIGk7XG4gIEZsYXBweS5jbGVhckV2ZW50SGFuZGxlcnNLaWxsVGlja0xvb3AoKTtcblxuICBGbGFwcHkuZ2FtZVN0YXRlID0gRmxhcHB5LkdhbWVTdGF0ZXMuV0FJVElORztcblxuICAvLyBSZXNldCB0aGUgc2NvcmUuXG4gIEZsYXBweS5wbGF5ZXJTY29yZSA9IDA7XG5cbiAgRmxhcHB5LmF2YXRhclZlbG9jaXR5ID0gMDtcblxuICAvLyBSZXNldCBvYnN0YWNsZXNcbiAgRmxhcHB5Lm9ic3RhY2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChvYnN0YWNsZSwgaW5kZXgpIHtcbiAgICBvYnN0YWNsZS5yZXNldChGbGFwcHkuTUFaRV9XSURUSCAqIDEuNSArIGluZGV4ICogRmxhcHB5Lk9CU1RBQ0xFX1NQQUNJTkcpO1xuICB9KTtcblxuICAvLyByZXNldCBjb25maWd1cmFibGUgdmFsdWVzXG4gIEZsYXBweS5TUEVFRCA9IDA7XG4gIEZsYXBweS5GTEFQX1ZFTE9DSVRZID0gLTExO1xuICBGbGFwcHkuc2V0QmFja2dyb3VuZCgnZmxhcHB5Jyk7XG4gIEZsYXBweS5zZXRPYnN0YWNsZSgnZmxhcHB5Jyk7XG4gIEZsYXBweS5zZXRQbGF5ZXIoJ2ZsYXBweScpO1xuICBGbGFwcHkuc2V0R3JvdW5kKCdmbGFwcHknKTtcbiAgRmxhcHB5LnNldEdhcEhlaWdodChhcGkuR2FwSGVpZ2h0Lk5PUk1BTCk7XG4gIEZsYXBweS5ncmF2aXR5ID0gYXBpLkdyYXZpdHkuTk9STUFMO1xuXG4gIC8vIE1vdmUgQXZhdGFyIGludG8gcG9zaXRpb24uXG4gIEZsYXBweS5hdmF0YXJYID0gMTEwO1xuICBGbGFwcHkuYXZhdGFyWSA9IDE1MDtcblxuICBpZiAobGV2ZWwuZ29hbCAmJiBsZXZlbC5nb2FsLnN0YXJ0WCkge1xuICAgIEZsYXBweS5nb2FsWCA9IGxldmVsLmdvYWwuc3RhcnRYO1xuICAgIEZsYXBweS5nb2FsWSA9IGxldmVsLmdvYWwuc3RhcnRZO1xuICB9XG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F2YXRhcicpLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJywgJycpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NvcmUnKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnN0cnVjdGlvbnMnKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGlja3J1bicpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnZXRyZWFkeScpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVvdmVyJykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuXG4gIEZsYXBweS5kaXNwbGF5QXZhdGFyKEZsYXBweS5hdmF0YXJYLCBGbGFwcHkuYXZhdGFyWSk7XG4gIEZsYXBweS5kaXNwbGF5T2JzdGFjbGVzKCk7XG4gIEZsYXBweS5kaXNwbGF5R3JvdW5kKDApO1xuICBGbGFwcHkuZGlzcGxheUdvYWwoKTtcblxuICB2YXIgc3ZnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z0ZsYXBweScpO1xufTtcblxuLyoqXG4gKiBDbGljayB0aGUgcnVuIGJ1dHRvbi4gIFN0YXJ0IHRoZSBwcm9ncmFtLlxuICovXG4vLyBYWFggVGhpcyBpcyB0aGUgb25seSBtZXRob2QgdXNlZCBieSB0aGUgdGVtcGxhdGVzIVxuRmxhcHB5LnJ1bkJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oKSB7XG4gIHZhciBydW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncnVuQnV0dG9uJyk7XG4gIHZhciByZXNldEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldEJ1dHRvbicpO1xuICAvLyBFbnN1cmUgdGhhdCBSZXNldCBidXR0b24gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBSdW4gYnV0dG9uLlxuICBpZiAoIXJlc2V0QnV0dG9uLnN0eWxlLm1pbldpZHRoKSB7XG4gICAgcmVzZXRCdXR0b24uc3R5bGUubWluV2lkdGggPSBydW5CdXR0b24ub2Zmc2V0V2lkdGggKyAncHgnO1xuICB9XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGlja3J1bicpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luc3RydWN0aW9ucycpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnZXRyZWFkeScpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG5cbiAgc3R1ZGlvQXBwLnRvZ2dsZVJ1blJlc2V0KCdyZXNldCcpO1xuICBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLnRyYWNlT24odHJ1ZSk7XG4gIC8vIHN0dWRpb0FwcC5yZXNldChmYWxzZSk7XG4gIHN0dWRpb0FwcC5hdHRlbXB0cysrO1xuICBGbGFwcHkuZXhlY3V0ZSgpO1xuXG4gIGlmIChsZXZlbC5mcmVlUGxheSkge1xuICAgIHZhciByaWdodEJ1dHRvbkNlbGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmlnaHQtYnV0dG9uLWNlbGwnKTtcbiAgICByaWdodEJ1dHRvbkNlbGwuY2xhc3NOYW1lID0gJ3JpZ2h0LWJ1dHRvbi1jZWxsLWVuYWJsZWQnO1xuICB9XG4gIGlmIChsZXZlbC5zY29yZSkge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZScpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gICAgRmxhcHB5LmRpc3BsYXlTY29yZSgpO1xuICB9XG59O1xuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyBkaXNwbGF5RmVlZGJhY2sgZnVuY3Rpb24gdGhhdCBjYWxscyBpbnRvXG4gKiBzdHVkaW9BcHAuZGlzcGxheUZlZWRiYWNrIHdoZW4gYXBwcm9wcmlhdGVcbiAqL1xudmFyIGRpc3BsYXlGZWVkYmFjayA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIUZsYXBweS53YWl0aW5nRm9yUmVwb3J0KSB7XG4gICAgc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayh7XG4gICAgICBhcHA6ICdmbGFwcHknLCAvL1hYWFxuICAgICAgc2tpbjogc2tpbi5pZCxcbiAgICAgIGZlZWRiYWNrVHlwZTogRmxhcHB5LnRlc3RSZXN1bHRzLFxuICAgICAgcmVzcG9uc2U6IEZsYXBweS5yZXNwb25zZSxcbiAgICAgIGxldmVsOiBsZXZlbCxcbiAgICAgIHNob3dpbmdTaGFyaW5nOiBsZXZlbC5mcmVlUGxheSAmJiBsZXZlbC5zaGFyZWFibGUsXG4gICAgICB0d2l0dGVyOiB0d2l0dGVyT3B0aW9ucyxcbiAgICAgIGFwcFN0cmluZ3M6IHtcbiAgICAgICAgcmVpbmZGZWVkYmFja01zZzogZmxhcHB5TXNnLnJlaW5mRmVlZGJhY2tNc2coKSxcbiAgICAgICAgc2hhcmluZ1RleHQ6IGZsYXBweU1zZy5zaGFyZUdhbWUoKVxuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBzZXJ2aWNlIHJlcG9ydCBjYWxsIGlzIGNvbXBsZXRlXG4gKiBAcGFyYW0ge29iamVjdH0gSlNPTiByZXNwb25zZSAoaWYgYXZhaWxhYmxlKVxuICovXG5GbGFwcHkub25SZXBvcnRDb21wbGV0ZSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gIEZsYXBweS5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBGbGFwcHkud2FpdGluZ0ZvclJlcG9ydCA9IGZhbHNlO1xuICBkaXNwbGF5RmVlZGJhY2soKTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuICBIZWF2ZW4gaGVscCB1cy4uLlxuICovXG5GbGFwcHkuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY29kZTtcbiAgRmxhcHB5LnJlc3VsdCA9IFJlc3VsdFR5cGUuVU5TRVQ7XG4gIEZsYXBweS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLk5PX1RFU1RTX1JVTjtcbiAgRmxhcHB5LndhaXRpbmdGb3JSZXBvcnQgPSBmYWxzZTtcbiAgRmxhcHB5LnJlc3BvbnNlID0gbnVsbDtcblxuICBpZiAobGV2ZWwuZWRpdENvZGUpIHtcbiAgICBjb2RlID0gZHJvcGxldFV0aWxzLmdlbmVyYXRlQ29kZUFsaWFzZXMobnVsbCwgJ0ZsYXBweScpO1xuICAgIGNvZGUgKz0gc3R1ZGlvQXBwLmVkaXRvci5nZXRWYWx1ZSgpO1xuICB9XG5cbiAgdmFyIGNvZGVDbGljayA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSmF2YVNjcmlwdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZmxhcHB5X3doZW5DbGljaycpO1xuICB2YXIgd2hlbkNsaWNrRnVuYyA9IGNvZGVnZW4uZnVuY3Rpb25Gcm9tQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZUNsaWNrLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0dWRpb0FwcDogc3R1ZGlvQXBwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGbGFwcHk6IGFwaSB9ICk7XG5cbiAgdmFyIGNvZGVDb2xsaWRlR3JvdW5kID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdKYXZhU2NyaXB0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmbGFwcHlfd2hlbkNvbGxpZGVHcm91bmQnKTtcbiAgdmFyIHdoZW5Db2xsaWRlR3JvdW5kRnVuYyA9IGNvZGVnZW4uZnVuY3Rpb25Gcm9tQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZUNvbGxpZGVHcm91bmQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZsYXBweTogYXBpIH0gKTtcblxuICB2YXIgY29kZUVudGVyT2JzdGFjbGUgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0phdmFTY3JpcHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScpO1xuICB2YXIgd2hlbkVudGVyT2JzdGFjbGVGdW5jID0gY29kZWdlbi5mdW5jdGlvbkZyb21Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlRW50ZXJPYnN0YWNsZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHVkaW9BcHA6IHN0dWRpb0FwcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRmxhcHB5OiBhcGkgfSApO1xuXG4gIHZhciBjb2RlQ29sbGlkZU9ic3RhY2xlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdKYXZhU2NyaXB0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZScpO1xuICB2YXIgd2hlbkNvbGxpZGVPYnN0YWNsZUZ1bmMgPSBjb2RlZ2VuLmZ1bmN0aW9uRnJvbUNvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVDb2xsaWRlT2JzdGFjbGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZsYXBweTogYXBpIH0gKTtcblxuICB2YXIgY29kZVdoZW5SdW5CdXR0b24gPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0phdmFTY3JpcHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3doZW5fcnVuJyk7XG4gIHZhciB3aGVuUnVuQnV0dG9uRnVuYyA9IGNvZGVnZW4uZnVuY3Rpb25Gcm9tQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZVdoZW5SdW5CdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZsYXBweTogYXBpIH0gKTtcblxuXG4gIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ3N0YXJ0Jyk7XG5cbiAgLy8gc3R1ZGlvQXBwLnJlc2V0KGZhbHNlKTtcblxuICAvLyBTZXQgZXZlbnQgaGFuZGxlcnMgYW5kIHN0YXJ0IHRoZSBvblRpY2sgdGltZXJcbiAgRmxhcHB5LndoZW5DbGljayA9IHdoZW5DbGlja0Z1bmM7XG4gIEZsYXBweS53aGVuQ29sbGlkZUdyb3VuZCA9IHdoZW5Db2xsaWRlR3JvdW5kRnVuYztcbiAgRmxhcHB5LndoZW5FbnRlck9ic3RhY2xlID0gd2hlbkVudGVyT2JzdGFjbGVGdW5jO1xuICBGbGFwcHkud2hlbkNvbGxpZGVPYnN0YWNsZSA9IHdoZW5Db2xsaWRlT2JzdGFjbGVGdW5jO1xuICBGbGFwcHkud2hlblJ1bkJ1dHRvbiA9IHdoZW5SdW5CdXR0b25GdW5jO1xuXG4gIEZsYXBweS50aWNrQ291bnQgPSAwO1xuICBGbGFwcHkuZmlyc3RBY3RpdmVUaWNrID0gLTE7XG4gIEZsYXBweS5nYW1lT3ZlclRpY2sgPSAwO1xuICBpZiAoRmxhcHB5LmludGVydmFsSWQpIHtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChGbGFwcHkuaW50ZXJ2YWxJZCk7XG4gIH1cbiAgRmxhcHB5LmludGVydmFsSWQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoRmxhcHB5Lm9uVGljaywgRmxhcHB5LnNjYWxlLnN0ZXBTcGVlZCk7XG59O1xuXG5GbGFwcHkub25QdXp6bGVDb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICBGbGFwcHkucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICB9XG5cbiAgLy8gU3RvcCBldmVyeXRoaW5nIG9uIHNjcmVlblxuICBGbGFwcHkuY2xlYXJFdmVudEhhbmRsZXJzS2lsbFRpY2tMb29wKCk7XG5cbiAgLy8gSWYgd2Uga25vdyB0aGV5IHN1Y2NlZWRlZCwgbWFyayBsZXZlbENvbXBsZXRlIHRydWVcbiAgLy8gTm90ZSB0aGF0IHdlIGhhdmUgbm90IHlldCBhbmltYXRlZCB0aGUgc3VjY2VzZnVsIHJ1blxuICB2YXIgbGV2ZWxDb21wbGV0ZSA9IChGbGFwcHkucmVzdWx0ID09IFJlc3VsdFR5cGUuU1VDQ0VTUyk7XG5cbiAgLy8gSWYgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBmcmVlIHBsYXksIGFsd2F5cyByZXR1cm4gdGhlIGZyZWUgcGxheVxuICAvLyByZXN1bHQgdHlwZVxuICBpZiAobGV2ZWwuZnJlZVBsYXkpIHtcbiAgICBGbGFwcHkudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5GUkVFX1BMQVk7XG4gIH0gZWxzZSB7XG4gICAgRmxhcHB5LnRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLmdldFRlc3RSZXN1bHRzKGxldmVsQ29tcGxldGUpO1xuICB9XG5cbiAgLy8gU3BlY2lhbCBjYXNlIGZvciBGbGFwcHkgbGV2ZWwgMSB3aGVyZSB5b3UgaGF2ZSB0aGUgcmlnaHQgYmxvY2tzLCBidXQgeW91XG4gIC8vIGRvbid0IGZsYXAgdG8gdGhlIGdvYWwuICBOb3RlOiBTZWUgcGl2b3RhbCBpdGVtIDY2MzYyNTA0IGZvciB3aHkgd2VcbiAgLy8gY2hlY2sgZm9yIGJvdGggVE9PX0ZFV19CTE9DS1NfRkFJTCBhbmQgTEVWRUxfSU5DT01QTEVURV9GQUlMIGhlcmUuXG4gIGlmIChsZXZlbC5pZCA9PT0gXCIxXCIgJiZcbiAgICAoRmxhcHB5LnRlc3RSZXN1bHRzID09PSBUZXN0UmVzdWx0cy5UT09fRkVXX0JMT0NLU19GQUlMIHx8XG4gICAgIEZsYXBweS50ZXN0UmVzdWx0cyA9PT0gVGVzdFJlc3VsdHMuTEVWRUxfSU5DT01QTEVURV9GQUlMKSkge1xuICAgIC8vIEZlZWRiYWNrIG1lc3NhZ2UgaXMgZm91bmQgaW4gbGV2ZWwub3RoZXIxU3RhckVycm9yLlxuICAgIEZsYXBweS50ZXN0UmVzdWx0cyA9IFRlc3RSZXN1bHRzLkFQUF9TUEVDSUZJQ19GQUlMO1xuICB9XG5cbiAgaWYgKEZsYXBweS50ZXN0UmVzdWx0cyA+PSBUZXN0UmVzdWx0cy5GUkVFX1BMQVkpIHtcbiAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCd3aW4nKTtcbiAgfSBlbHNlIHtcbiAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCdmYWlsdXJlJyk7XG4gIH1cblxuICBpZiAobGV2ZWwuZWRpdENvZGUpIHtcbiAgICBGbGFwcHkudGVzdFJlc3VsdHMgPSBsZXZlbENvbXBsZXRlID9cbiAgICAgIFRlc3RSZXN1bHRzLkFMTF9QQVNTIDpcbiAgICAgIFRlc3RSZXN1bHRzLlRPT19GRVdfQkxPQ0tTX0ZBSUw7XG4gIH1cblxuICB2YXIgeG1sID0gQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICB2YXIgdGV4dEJsb2NrcyA9IEJsb2NrbHkuWG1sLmRvbVRvVGV4dCh4bWwpO1xuXG4gIEZsYXBweS53YWl0aW5nRm9yUmVwb3J0ID0gdHJ1ZTtcblxuICAvLyBSZXBvcnQgcmVzdWx0IHRvIHNlcnZlci5cbiAgc3R1ZGlvQXBwLnJlcG9ydCh7XG4gICAgICAgICAgICAgICAgICAgICBhcHA6ICdmbGFwcHknLFxuICAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IGxldmVsLmlkLFxuICAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBGbGFwcHkucmVzdWx0ID09PSBSZXN1bHRUeXBlLlNVQ0NFU1MsXG4gICAgICAgICAgICAgICAgICAgICB0ZXN0UmVzdWx0OiBGbGFwcHkudGVzdFJlc3VsdHMsXG4gICAgICAgICAgICAgICAgICAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQodGV4dEJsb2NrcyksXG4gICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlOiBGbGFwcHkub25SZXBvcnRDb21wbGV0ZVxuICAgICAgICAgICAgICAgICAgICAgfSk7XG59O1xuXG4vKipcbiAqIERpc3BsYXkgQXZhdGFyIGF0IHRoZSBzcGVjaWZpZWQgbG9jYXRpb25cbiAqIEBwYXJhbSB7bnVtYmVyfSB4IEhvcml6b250YWwgUGl4ZWwgbG9jYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0geSBWZXJ0aWNhbCBQaXhlbCBsb2NhdGlvbi5cbiAqL1xuRmxhcHB5LmRpc3BsYXlBdmF0YXIgPSBmdW5jdGlvbih4LCB5KSB7XG4gIHZhciBhdmF0YXJJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F2YXRhcicpO1xuICBhdmF0YXJJY29uLnNldEF0dHJpYnV0ZSgneCcsIHgpO1xuICBhdmF0YXJJY29uLnNldEF0dHJpYnV0ZSgneScsIHkpO1xufTtcblxuLyoqXG4gKiBkaXNwbGF5IG1vdmluZyBnb2FsXG4gKi9cbkZsYXBweS5kaXNwbGF5R29hbCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIUZsYXBweS5nb2FsWCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgZ29hbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnb2FsJyk7XG4gIGdvYWwuc2V0QXR0cmlidXRlKCd4JywgRmxhcHB5LmdvYWxYKTtcbiAgZ29hbC5zZXRBdHRyaWJ1dGUoJ3knLCBGbGFwcHkuZ29hbFkpO1xufTtcblxuXG4vKipcbiAqIERpc3BsYXkgZ3JvdW5kIGF0IGdpdmVuIHRpY2tDb3VudFxuICovXG5GbGFwcHkuZGlzcGxheUdyb3VuZCA9IGZ1bmN0aW9uKHRpY2tDb3VudCkge1xuICBpZiAoIWxldmVsLmdyb3VuZCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgb2Zmc2V0ID0gdGlja0NvdW50ICogRmxhcHB5LlNQRUVEO1xuICBvZmZzZXQgPSBvZmZzZXQgJSBGbGFwcHkuR1JPVU5EX1dJRFRIO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IEZsYXBweS5NQVpFX1dJRFRIIC8gRmxhcHB5LkdST1VORF9XSURUSCArIDE7IGkrKykge1xuICAgIHZhciBncm91bmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ3JvdW5kJyArIGkpO1xuICAgIGdyb3VuZC5zZXRBdHRyaWJ1dGUoJ3gnLCAtb2Zmc2V0ICsgaSAqIEZsYXBweS5HUk9VTkRfV0lEVEgpO1xuICAgIGdyb3VuZC5zZXRBdHRyaWJ1dGUoJ3knLCBGbGFwcHkuTUFaRV9IRUlHSFQgLSBGbGFwcHkuR1JPVU5EX0hFSUdIVCk7XG4gIH1cbn07XG5cbi8qKlxuICogRGlzcGxheSBhbGwgb2JzdGFjbGVzXG4gKi9cbkZsYXBweS5kaXNwbGF5T2JzdGFjbGVzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IEZsYXBweS5vYnN0YWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgb2JzdGFjbGUgPSBGbGFwcHkub2JzdGFjbGVzW2ldO1xuICAgIHZhciB0b3BJY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29ic3RhY2xlX3RvcCcgKyBpKTtcbiAgICB0b3BJY29uLnNldEF0dHJpYnV0ZSgneCcsIG9ic3RhY2xlLngpO1xuICAgIHRvcEljb24uc2V0QXR0cmlidXRlKCd5Jywgb2JzdGFjbGUuZ2FwU3RhcnQgLSBGbGFwcHkuT0JTVEFDTEVfSEVJR0hUKTtcblxuICAgIHZhciBib3R0b21JY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29ic3RhY2xlX2JvdHRvbScgKyBpKTtcbiAgICBib3R0b21JY29uLnNldEF0dHJpYnV0ZSgneCcsIG9ic3RhY2xlLngpO1xuICAgIGJvdHRvbUljb24uc2V0QXR0cmlidXRlKCd5Jywgb2JzdGFjbGUuZ2FwU3RhcnQgKyBGbGFwcHkuR0FQX1NJWkUpO1xuICB9XG59O1xuXG5GbGFwcHkuZGlzcGxheVNjb3JlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzY29yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZScpO1xuICBzY29yZS50ZXh0Q29udGVudCA9IEZsYXBweS5wbGF5ZXJTY29yZTtcbn07XG5cbkZsYXBweS5mbGFwID0gZnVuY3Rpb24gKGFtb3VudCkge1xuICB2YXIgZGVmYXVsdEZsYXAgPSBsZXZlbC5kZWZhdWx0RmxhcCB8fCBcIk5PUk1BTFwiO1xuICBGbGFwcHkuYXZhdGFyVmVsb2NpdHkgPSBhbW91bnQgfHwgYXBpLkZsYXBIZWlnaHRbZGVmYXVsdEZsYXBdO1xufTtcblxuRmxhcHB5LnNldEdhcEhlaWdodCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgbWluR2FwU2l6ZSA9IEZsYXBweS5NQVpFX0hFSUdIVCAtIEZsYXBweS5NSU5fT0JTVEFDTEVfSEVJR0hUIC1cbiAgICBGbGFwcHkuT0JTVEFDTEVfSEVJR0hUO1xuICBpZiAodmFsdWUgPCBtaW5HYXBTaXplKSB7XG4gICAgdmFsdWUgPSBtaW5HYXBTaXplO1xuICB9XG4gIEZsYXBweS5HQVBfU0laRSA9IHZhbHVlO1xufTtcblxudmFyIHNraW5UaGVtZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT09ICdmbGFwcHknKSB7XG4gICAgcmV0dXJuIHNraW47XG4gIH1cbiAgcmV0dXJuIHNraW5bdmFsdWVdO1xufTtcblxuRmxhcHB5LnNldEJhY2tncm91bmQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFja2dyb3VuZCcpO1xuICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgIHNraW5UaGVtZSh2YWx1ZSkuYmFja2dyb3VuZCk7XG59O1xuXG5GbGFwcHkuc2V0UGxheWVyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F2YXRhcicpO1xuICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgIHNraW5UaGVtZSh2YWx1ZSkuYXZhdGFyKTtcbn07XG5cbkZsYXBweS5zZXRPYnN0YWNsZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgZWxlbWVudDtcbiAgRmxhcHB5Lm9ic3RhY2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChvYnN0YWNsZSwgaW5kZXgpIHtcbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29ic3RhY2xlX3RvcCcgKyBpbmRleCk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgIHNraW5UaGVtZSh2YWx1ZSkub2JzdGFjbGVfdG9wKTtcblxuICAgIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2JzdGFjbGVfYm90dG9tJyArIGluZGV4KTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgc2tpblRoZW1lKHZhbHVlKS5vYnN0YWNsZV9ib3R0b20pO1xuICB9KTtcbn07XG5cbkZsYXBweS5zZXRHcm91bmQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKCFsZXZlbC5ncm91bmQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGVsZW1lbnQsIGk7XG4gIGZvciAoaSA9IDA7IGkgPCBGbGFwcHkuTUFaRV9XSURUSCAvIEZsYXBweS5HUk9VTkRfV0lEVEggKyAxOyBpKyspIHtcbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dyb3VuZCcgKyBpKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgc2tpblRoZW1lKHZhbHVlKS5ncm91bmQpO1xuICB9XG59O1xuXG52YXIgY2hlY2tUaWNrTGltaXQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFsZXZlbC50aWNrTGltaXQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoKEZsYXBweS50aWNrQ291bnQgLSBGbGFwcHkuZmlyc3RBY3RpdmVUaWNrKSA+PSBsZXZlbC50aWNrTGltaXQgJiZcbiAgICAoRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuQUNUSVZFIHx8XG4gICAgRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuT1ZFUikpIHtcbiAgICAvLyBXZSdsbCBpZ25vcmUgdGljayBsaW1pdCBpZiB3ZSdyZSBlbmRpbmcgc28gdGhhdCB3ZSBmdWxseSBmaW5pc2ggZW5kaW5nXG4gICAgLy8gc2VxdWVuY2VcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbnZhciBjaGVja0ZpbmlzaGVkID0gZnVuY3Rpb24gKCkge1xuICAvLyBpZiB3ZSBoYXZlIGEgc3VjY2Nlc3MgY29uZGl0aW9uIGFuZCBoYXZlIGFjY29tcGxpc2hlZCBpdCwgd2UncmUgZG9uZSBhbmQgc3VjY2Vzc2Z1bFxuICBpZiAobGV2ZWwuZ29hbCAmJiBsZXZlbC5nb2FsLnN1Y2Nlc3NDb25kaXRpb24gJiYgbGV2ZWwuZ29hbC5zdWNjZXNzQ29uZGl0aW9uKCkpIHtcbiAgICBGbGFwcHkucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gaWYgd2UgaGF2ZSBhIGZhaWx1cmUgY29uZGl0aW9uLCBhbmQgaXQncyBiZWVuIHJlYWNoZWQsIHdlJ3JlIGRvbmUgYW5kIGZhaWxlZFxuICBpZiAobGV2ZWwuZ29hbCAmJiBsZXZlbC5nb2FsLmZhaWx1cmVDb25kaXRpb24gJiYgbGV2ZWwuZ29hbC5mYWlsdXJlQ29uZGl0aW9uKCkpIHtcbiAgICBGbGFwcHkucmVzdWx0ID0gUmVzdWx0VHlwZS5GQUlMVVJFO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmVyc2lvbj1cIjEuMVwiIGlkPVwic3ZnRmxhcHB5XCI+XFxuPC9zdmc+XFxuPGRpdiBpZD1cImNhcGFjaXR5QnViYmxlXCI+XFxuICA8ZGl2IGlkPVwiY2FwYWNpdHlcIj48L2Rpdj5cXG48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7IHZhciBtc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKSA7IGJ1Zi5wdXNoKCdcXG5cXG48ZGl2IGlkPVwicmlnaHQtYnV0dG9uLWNlbGxcIj5cXG4gIDxidXR0b24gaWQ9XCJyaWdodEJ1dHRvblwiIGNsYXNzPVwic2hhcmVcIj5cXG4gICAgPGltZyBzcmM9XCInLCBlc2NhcGUoKDUsICBhc3NldFVybCgnbWVkaWEvMXgxLmdpZicpICkpLCAnXCI+JywgZXNjYXBlKCg1LCAgbXNnLmZpbmlzaCgpICkpLCAnXFxuICA8L2J1dHRvbj5cXG48L2Rpdj5cXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgV09SS1NQQUNFX0JVRkZFUjogMjAsXG4gIFdPUktTUEFDRV9DT0xfV0lEVEg6IDIxMCxcbiAgV09SS1NQQUNFX1JPV19IRUlHSFQ6IDEyMCxcblxuICBBVkFUQVJfSEVJR0hUOiAyNCxcbiAgQVZBVEFSX1dJRFRIOiAzNCxcbiAgQVZBVEFSX1lfT0ZGU0VUOiAwXG59OyIsIi8qKlxuICogQmxvY2tseSBBcHA6IEZsYXBweVxuICpcbiAqIENvcHlyaWdodCAyMDEzIENvZGUub3JnXG4gKlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGNvbW1vbk1zZyA9IHJlcXVpcmUoJy4uL2xvY2FsZScpO1xudmFyIGJsb2NrVXRpbHMgPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBfID0gdXRpbHMuZ2V0TG9kYXNoKCk7XG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xuXG52YXIgRkxBUFBZX1ZBTFVFID0gJ1wiZmxhcHB5XCInO1xudmFyIFJBTkRPTV9WQUxVRSA9ICdyYW5kb20nO1xuXG52YXIgZ2VuZXJhdGVTZXR0ZXJDb2RlID0gZnVuY3Rpb24gKGN0eCwgbmFtZSkge1xuICB2YXIgdmFsdWUgPSBjdHguZ2V0VGl0bGVWYWx1ZSgnVkFMVUUnKTtcbiAgaWYgKHZhbHVlID09PSBSQU5ET01fVkFMVUUpIHtcbiAgICB2YXIgcG9zc2libGVWYWx1ZXMgPVxuICAgICAgXyhjdHguVkFMVUVTKVxuICAgICAgICAubWFwKGZ1bmN0aW9uIChpdGVtKSB7IHJldHVybiBpdGVtWzFdOyB9KVxuICAgICAgICAucmVqZWN0KGZ1bmN0aW9uIChpdGVtVmFsdWUpIHsgcmV0dXJuIGl0ZW1WYWx1ZSA9PT0gUkFORE9NX1ZBTFVFOyB9KTtcbiAgICB2YWx1ZSA9ICdGbGFwcHkucmFuZG9tKFsnICsgcG9zc2libGVWYWx1ZXMgKyAnXSknO1xuICB9XG5cbiAgcmV0dXJuICdGbGFwcHkuJyArIG5hbWUgKyAnKFxcJ2Jsb2NrX2lkXycgKyBjdHguaWQgKyAnXFwnLCAnICtcbiAgICB2YWx1ZSArICcpO1xcbic7XG59O1xuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIHNraW4gPSBibG9ja0luc3RhbGxPcHRpb25zLnNraW47XG4gIHZhciBpc0sxID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5pc0sxO1xuXG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV93aGVuQ2xpY2sgPSB7XG4gICAgLy8gQmxvY2sgdG8gaGFuZGxlIGV2ZW50IHdoZXJlIG1vdXNlIGlzIGNsaWNrZWRcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxNDAsIDEuMDAsIDAuNzQpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoY29tbW9uTXNnLndoZW4oKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShza2luLmNsaWNrSWNvbikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KCkuYXBwZW5kVGl0bGUobXNnLndoZW5DbGljaygpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQoZmFsc2UpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGVuQ2xpY2tUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3doZW5DbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBoYW5kbGluZyBjbGljayBldmVudC5cbiAgICByZXR1cm4gJ1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kID0ge1xuICAgIC8vIEJsb2NrIHRvIGhhbmRsZSBldmVudCB3aGVyZSBmbGFwcHkgaGl0cyBncm91bmRcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxNDAsIDEuMDAsIDAuNzQpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoY29tbW9uTXNnLndoZW4oKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShza2luLmNvbGxpZGVHcm91bmRJY29uKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKS5hcHBlbmRUaXRsZShtc2cud2hlbkNvbGxpZGVHcm91bmQoKSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KGZhbHNlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2hlbkNvbGxpZGVHcm91bmRUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGhhbmRsaW5nIGNsaWNrIGV2ZW50LlxuICAgIHJldHVybiAnXFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZSA9IHtcbiAgICAvLyBCbG9jayB0byBoYW5kbGUgZXZlbnQgd2hlcmUgZmxhcHB5IGhpdHMgYSBPYnN0YWNsZVxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE0MCwgMS4wMCwgMC43NCk7XG4gICAgICBpZiAoaXNLMSkge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShjb21tb25Nc2cud2hlbigpKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZEltYWdlKHNraW4uY29sbGlkZU9ic3RhY2xlSWNvbikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KCkuYXBwZW5kVGl0bGUobXNnLndoZW5Db2xsaWRlT2JzdGFjbGUoKSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KGZhbHNlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2hlbkNvbGxpZGVPYnN0YWNsZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBoYW5kbGluZyBjb2xsaWRlIE9ic3RhY2xlIGV2ZW50LlxuICAgIHJldHVybiAnXFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUgPSB7XG4gICAgLy8gQmxvY2sgdG8gaGFuZGxlIGV2ZW50IHdoZXJlIGZsYXBweSBlbnRlcnMgYSBPYnN0YWNsZVxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE0MCwgMS4wMCwgMC43NCk7XG4gICAgICBpZiAoaXNLMSkge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShjb21tb25Nc2cud2hlbigpKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZEltYWdlKHNraW4uZW50ZXJPYnN0YWNsZUljb24pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy53aGVuRW50ZXJPYnN0YWNsZSgpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQoZmFsc2UpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy53aGVuRW50ZXJPYnN0YWNsZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgaGFuZGxpbmcgZW50ZXIgT2JzdGFjbGUuXG4gICAgcmV0dXJuICdcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9mbGFwID0ge1xuICAgIC8vIEJsb2NrIGZvciBmbGFwcGluZyAoZmx5aW5nIHVwd2FyZHMpXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmZsYXAoKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShza2luLmZsYXBJY29uKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKS5hcHBlbmRUaXRsZShtc2cuZmxhcCgpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmZsYXBUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICAvLyAvLyB1c2VkIHRvIGhhdmUgYSBmbGFwcHlfd2hlblJ1bkJ1dHRvbkNsaWNrLlxuICAvLyBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfd2hlblJ1bkJ1dHRvbkNsaWNrID0gYmxvY2tseS5CbG9ja3Mud2hlbl9ydW47XG4gIC8vIGdlbmVyYXRvci5mbGFwcHlfd2hlblJ1bkJ1dHRvbkNsaWNrID0gZ2VuZXJhdG9yLndoZW5fcnVuO1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfZmxhcCA9IGZ1bmN0aW9uICh2ZWxvY2l0eSkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIG1vdmluZyBsZWZ0LlxuICAgIHJldHVybiAnRmxhcHB5LmZsYXAoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9mbGFwX2hlaWdodCA9IHtcbiAgICAvLyBCbG9jayBmb3IgZmxhcHBpbmcgKGZseWluZyB1cHdhcmRzKVxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFUyk7XG4gICAgICBkcm9wZG93bi5zZXRWYWx1ZSh0aGlzLlZBTFVFU1szXVsxXSk7IC8vIGRlZmF1bHQgdG8gbm9ybWFsXG5cbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1ZBTFVFJyk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5mbGFwVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X2ZsYXBfaGVpZ2h0LlZBTFVFUyA9XG4gICAgICBbW21zZy5mbGFwUmFuZG9tKCksIFJBTkRPTV9WQUxVRV0sXG4gICAgICAgW21zZy5mbGFwVmVyeVNtYWxsKCksICdGbGFwcHkuRmxhcEhlaWdodC5WRVJZX1NNQUxMJ10sXG4gICAgICAgW21zZy5mbGFwU21hbGwoKSwgJ0ZsYXBweS5GbGFwSGVpZ2h0LlNNQUxMJ10sXG4gICAgICAgW21zZy5mbGFwTm9ybWFsKCksICdGbGFwcHkuRmxhcEhlaWdodC5OT1JNQUwnXSxcbiAgICAgICBbbXNnLmZsYXBMYXJnZSgpLCAnRmxhcHB5LkZsYXBIZWlnaHQuTEFSR0UnXSxcbiAgICAgICBbbXNnLmZsYXBWZXJ5TGFyZ2UoKSwgJ0ZsYXBweS5GbGFwSGVpZ2h0LlZFUllfTEFSR0UnXV07XG5cbiAgZ2VuZXJhdG9yLmZsYXBweV9mbGFwX2hlaWdodCA9IGZ1bmN0aW9uICh2ZWxvY2l0eSkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ2ZsYXAnKTtcbiAgfTtcblxuICBmdW5jdGlvbiBvblNvdW5kU2VsZWN0ZWQoc291bmRWYWx1ZSkge1xuICAgIGlmIChzb3VuZFZhbHVlID09PSBSQU5ET01fVkFMVUUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3R1ZGlvQXBwLnBsYXlBdWRpbyh1dGlscy5zdHJpcFF1b3Rlcyhzb3VuZFZhbHVlKSk7XG4gIH1cblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfcGxheVNvdW5kID0ge1xuICAgIC8vIEJsb2NrIGZvciBwbGF5aW5nIHNvdW5kLlxuICAgIFdJTkdfRkxBUF9TT1VORDogJ1wic2Z4X3dpbmdcIicsXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5WQUxVRVMgPSBpc0sxID8gdGhpcy5rMVNvdW5kQ2hvaWNlcyA6IHRoaXMuc291bmRDaG9pY2VzO1xuICAgICAgdmFyIHNvdW5kRHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUVTLCBvblNvdW5kU2VsZWN0ZWQpO1xuICAgICAgc291bmREcm9wZG93bi5zZXRWYWx1ZSh0aGlzLldJTkdfRkxBUF9TT1VORCk7XG5cbiAgICAgIGlmIChpc0sxKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGNvbW1vbk1zZy5wbGF5KCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkSW1hZ2Uoc2tpbi5zb3VuZEljb24pKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShzb3VuZERyb3Bkb3duLCAnVkFMVUUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpLmFwcGVuZFRpdGxlKHNvdW5kRHJvcGRvd24sICdWQUxVRScpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cucGxheVNvdW5kVG9vbHRpcCgpKTtcbiAgICB9LFxuICAgIGdldCBrMVNvdW5kQ2hvaWNlcygpIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIFttc2cuc291bmRSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICAgW21zZy5zb3VuZEJvdW5jZSgpLCAnXCJ3YWxsXCInXSxcbiAgICAgICAgW21zZy5zb3VuZENydW5jaCgpLCAnXCJ3YWxsMFwiJ10sXG4gICAgICAgIFttc2cuc291bmREaWUoKSwgJ1wic2Z4X2RpZVwiJ10sXG4gICAgICAgIFttc2cuc291bmRIaXQoKSwgJ1wic2Z4X2hpdFwiJ10sXG4gICAgICAgIFttc2cuc291bmRQb2ludCgpLCAnXCJzZnhfcG9pbnRcIiddLFxuICAgICAgICBbbXNnLnNvdW5kU3dvb3NoKCksICdcInNmeF9zd29vc2hpbmdcIiddLFxuICAgICAgICBbbXNnLnNvdW5kV2luZygpLCB0aGlzLldJTkdfRkxBUF9TT1VORF0sXG4gICAgICAgIFttc2cuc291bmRKZXQoKSwgJ1wiamV0XCInXSxcbiAgICAgICAgW21zZy5zb3VuZENyYXNoKCksICdcImNyYXNoXCInXSxcbiAgICAgICAgW21zZy5zb3VuZEppbmdsZSgpLCAnXCJqaW5nbGVcIiddLFxuICAgICAgICBbbXNnLnNvdW5kU3BsYXNoKCksICdcInNwbGFzaFwiJ10sXG4gICAgICAgIFttc2cuc291bmRMYXNlcigpLCAnXCJsYXNlclwiJ11cbiAgICAgIF07XG4gICAgfSxcbiAgICBnZXQgc291bmRDaG9pY2VzKCkge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgW21zZy5wbGF5U291bmRSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICAgW21zZy5wbGF5U291bmRCb3VuY2UoKSwgJ1wid2FsbFwiJ10sXG4gICAgICAgIFttc2cucGxheVNvdW5kQ3J1bmNoKCksICdcIndhbGwwXCInXSxcbiAgICAgICAgW21zZy5wbGF5U291bmREaWUoKSwgJ1wic2Z4X2RpZVwiJ10sXG4gICAgICAgIFttc2cucGxheVNvdW5kSGl0KCksICdcInNmeF9oaXRcIiddLFxuICAgICAgICBbbXNnLnBsYXlTb3VuZFBvaW50KCksICdcInNmeF9wb2ludFwiJ10sXG4gICAgICAgIFttc2cucGxheVNvdW5kU3dvb3NoKCksICdcInNmeF9zd29vc2hpbmdcIiddLFxuICAgICAgICBbbXNnLnBsYXlTb3VuZFdpbmcoKSwgdGhpcy5XSU5HX0ZMQVBfU09VTkRdLFxuICAgICAgICBbbXNnLnBsYXlTb3VuZEpldCgpLCAnXCJqZXRcIiddLFxuICAgICAgICBbbXNnLnBsYXlTb3VuZENyYXNoKCksICdcImNyYXNoXCInXSxcbiAgICAgICAgW21zZy5wbGF5U291bmRKaW5nbGUoKSwgJ1wiamluZ2xlXCInXSxcbiAgICAgICAgW21zZy5wbGF5U291bmRTcGxhc2goKSwgJ1wic3BsYXNoXCInXSxcbiAgICAgICAgW21zZy5wbGF5U291bmRMYXNlcigpLCAnXCJsYXNlclwiJ11cbiAgICAgIF07XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfcGxheVNvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlU2V0dGVyQ29kZSh0aGlzLCAncGxheVNvdW5kJyk7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X2luY3JlbWVudFBsYXllclNjb3JlID0ge1xuICAgIC8vIEJsb2NrIGZvciBpbmNyZW1lbnRpbmcgdGhlIHBsYXllcidzIHNjb3JlLlxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIGlmIChpc0sxKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGNvbW1vbk1zZy5zY29yZSgpKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZEltYWdlKHNraW4uc2NvcmVDYXJkKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuaW5jcmVtZW50UGxheWVyU2NvcmUoKSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmluY3JlbWVudFBsYXllclNjb3JlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmZsYXBweV9pbmNyZW1lbnRQbGF5ZXJTY29yZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGluY3JlbWVudGluZyB0aGUgcGxheWVyJ3Mgc2NvcmUuXG4gICAgcmV0dXJuICdGbGFwcHkuaW5jcmVtZW50UGxheWVyU2NvcmUoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9lbmRHYW1lID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIGlmIChpc0sxKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGNvbW1vbk1zZy5lbmQoKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShza2luLmVuZEljb24pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpLmFwcGVuZFRpdGxlKG1zZy5lbmRHYW1lKCkpO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuZW5kR2FtZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfZW5kR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGluY3JlbWVudGluZyB0aGUgcGxheWVyJ3Mgc2NvcmUuXG4gICAgcmV0dXJuICdGbGFwcHkuZW5kR2FtZShcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcpO1xcbic7XG4gIH07XG5cbiAgLyoqXG4gICAqIHNldFNwZWVkXG4gICAqL1xuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0U3BlZWQgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigzMTIsIDAuMzIsIDAuNjIpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgdmFyIGZpZWxkSW1hZ2VEcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bih0aGlzLksxX1ZBTFVFUywgNjMsIDMzKTtcbiAgICAgICAgZmllbGRJbWFnZURyb3Bkb3duLnNldFZhbHVlKHRoaXMuSzFfVkFMVUVTWzFdWzFdKTsgLy8gZGVmYXVsdCB0byBub3JtYWxcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLnNldFNwZWVkKCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGZpZWxkSW1hZ2VEcm9wZG93biwgJ1ZBTFVFJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUVTKTtcbiAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5WQUxVRVNbM11bMV0pOyAvLyBkZWZhdWx0IHRvIG5vcm1hbFxuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKS5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1ZBTFVFJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnNldFNwZWVkVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldFNwZWVkLksxX1ZBTFVFUyA9XG4gICAgW1tza2luLnNwZWVkU2xvdywgJ0ZsYXBweS5MZXZlbFNwZWVkLlNMT1cnXSxcbiAgICAgIFtza2luLnNwZWVkTWVkaXVtLCAnRmxhcHB5LkxldmVsU3BlZWQuTk9STUFMJ10sXG4gICAgICBbc2tpbi5zcGVlZEZhc3QsICdGbGFwcHkuTGV2ZWxTcGVlZC5GQVNUJ11dO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRTcGVlZC5WQUxVRVMgPVxuICAgICAgW1ttc2cuc3BlZWRSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNwZWVkVmVyeVNsb3coKSwgJ0ZsYXBweS5MZXZlbFNwZWVkLlZFUllfU0xPVyddLFxuICAgICAgIFttc2cuc3BlZWRTbG93KCksICdGbGFwcHkuTGV2ZWxTcGVlZC5TTE9XJ10sXG4gICAgICAgW21zZy5zcGVlZE5vcm1hbCgpLCAnRmxhcHB5LkxldmVsU3BlZWQuTk9STUFMJ10sXG4gICAgICAgW21zZy5zcGVlZEZhc3QoKSwgJ0ZsYXBweS5MZXZlbFNwZWVkLkZBU1QnXSxcbiAgICAgICBbbXNnLnNwZWVkVmVyeUZhc3QoKSwgJ0ZsYXBweS5MZXZlbFNwZWVkLlZFUllfRkFTVCddXTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3NldFNwZWVkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlU2V0dGVyQ29kZSh0aGlzLCAnc2V0U3BlZWQnKTtcbiAgfTtcblxuICAvKipcbiAgICogc2V0R2FwSGVpZ2h0XG4gICAqL1xuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0R2FwSGVpZ2h0ID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFUyk7XG4gICAgICBkcm9wZG93bi5zZXRWYWx1ZSh0aGlzLlZBTFVFU1szXVsxXSk7ICAvLyBkZWZhdWx0IHRvIG5vcm1hbFxuXG4gICAgICB0aGlzLnNldEhTVigzMTIsIDAuMzIsIDAuNjIpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5zZXRHYXBIZWlnaHRUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0R2FwSGVpZ2h0LlZBTFVFUyA9XG4gICAgICBbW21zZy5zZXRHYXBSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldEdhcFZlcnlTbWFsbCgpLCAnRmxhcHB5LkdhcEhlaWdodC5WRVJZX1NNQUxMJ10sXG4gICAgICAgW21zZy5zZXRHYXBTbWFsbCgpLCAnRmxhcHB5LkdhcEhlaWdodC5TTUFMTCddLFxuICAgICAgIFttc2cuc2V0R2FwTm9ybWFsKCksICdGbGFwcHkuR2FwSGVpZ2h0Lk5PUk1BTCddLFxuICAgICAgIFttc2cuc2V0R2FwTGFyZ2UoKSwgJ0ZsYXBweS5HYXBIZWlnaHQuTEFSR0UnXSxcbiAgICAgICBbbXNnLnNldEdhcFZlcnlMYXJnZSgpLCAnRmxhcHB5LkdhcEhlaWdodC5WRVJZX0xBUkdFJ11dO1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfc2V0R2FwSGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlU2V0dGVyQ29kZSh0aGlzLCAnc2V0R2FwSGVpZ2h0Jyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIHNldEJhY2tncm91bmRcbiAgICovXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRCYWNrZ3JvdW5kID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHZhciBkcm9wZG93bjtcbiAgICAgIHZhciBpbnB1dCA9IHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobXNnLnNldEJhY2tncm91bmQoKSk7XG4gICAgICAgIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGRJbWFnZURyb3Bkb3duKHRoaXMuSzFfQ0hPSUNFUywgNTAsIDMwKTtcbiAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUoRkxBUFBZX1ZBTFVFKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFUyk7XG4gICAgICAgIGRyb3Bkb3duLnNldFZhbHVlKEZMQVBQWV9WQUxVRSk7XG4gICAgICB9XG5cbiAgICAgIGlucHV0LmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVkFMVUUnKTtcblxuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5zZXRCYWNrZ3JvdW5kVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldEJhY2tncm91bmQuVkFMVUVTID1cbiAgICAgIFtbbXNnLnNldEJhY2tncm91bmRSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldEJhY2tncm91bmRGbGFwcHkoKSwgRkxBUFBZX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldEJhY2tncm91bmROaWdodCgpLCAnXCJuaWdodFwiJ10sXG4gICAgICAgW21zZy5zZXRCYWNrZ3JvdW5kU2NpRmkoKSwgJ1wic2NpZmlcIiddLFxuICAgICAgIFttc2cuc2V0QmFja2dyb3VuZFVuZGVyd2F0ZXIoKSwgJ1widW5kZXJ3YXRlclwiJ10sXG4gICAgICAgW21zZy5zZXRCYWNrZ3JvdW5kQ2F2ZSgpLCAnXCJjYXZlXCInXSxcbiAgICAgICBbbXNnLnNldEJhY2tncm91bmRTYW50YSgpLCAnXCJzYW50YVwiJ11dO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRCYWNrZ3JvdW5kLksxX0NIT0lDRVMgPVxuICAgICAgW1tza2luLmJhY2tncm91bmQsIEZMQVBQWV9WQUxVRV0sXG4gICAgICAgW3NraW4ubmlnaHQuYmFja2dyb3VuZCwgJ1wibmlnaHRcIiddLFxuICAgICAgIFtza2luLnNjaWZpLmJhY2tncm91bmQsICdcInNjaWZpXCInXSxcbiAgICAgICBbc2tpbi51bmRlcndhdGVyLmJhY2tncm91bmQsICdcInVuZGVyd2F0ZXJcIiddLFxuICAgICAgIFtza2luLmNhdmUuYmFja2dyb3VuZCwgJ1wiY2F2ZVwiJ10sXG4gICAgICAgW3NraW4uc2FudGEuYmFja2dyb3VuZCwgJ1wic2FudGFcIiddLFxuICAgICAgIFtza2luLnJhbmRvbVB1cnBsZUljb24sIFJBTkRPTV9WQUxVRV1dO1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfc2V0QmFja2dyb3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ3NldEJhY2tncm91bmQnKTtcbiAgfTtcblxuICAvKipcbiAgICogc2V0UGxheWVyXG4gICAqL1xuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0UGxheWVyID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHZhciBkcm9wZG93bjtcbiAgICAgIHZhciBpbnB1dCA9IHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobXNnLnNldFBsYXllcigpKTtcbiAgICAgICAgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZEltYWdlRHJvcGRvd24odGhpcy5LMV9DSE9JQ0VTLCAzNCwgMjQpO1xuICAgICAgICBkcm9wZG93bi5zZXRWYWx1ZShGTEFQUFlfVkFMVUUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUVTKTtcbiAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUoRkxBUFBZX1ZBTFVFKTtcbiAgICAgIH1cbiAgICAgIGlucHV0LmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVkFMVUUnKTtcblxuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5zZXRQbGF5ZXJUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0UGxheWVyLlZBTFVFUyA9XG4gICAgICBbW21zZy5zZXRQbGF5ZXJSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldFBsYXllckZsYXBweSgpLCBGTEFQUFlfVkFMVUVdLFxuICAgICAgIFttc2cuc2V0UGxheWVyUmVkQmlyZCgpLCAnXCJyZWRiaXJkXCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllclNjaUZpKCksICdcInNjaWZpXCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllclVuZGVyd2F0ZXIoKSwgJ1widW5kZXJ3YXRlclwiJ10sXG4gICAgICAgW21zZy5zZXRQbGF5ZXJTYW50YSgpLCAnXCJzYW50YVwiJ10sXG4gICAgICAgW21zZy5zZXRQbGF5ZXJDYXZlKCksICdcImNhdmVcIiddLFxuICAgICAgIFttc2cuc2V0UGxheWVyU2hhcmsoKSwgJ1wic2hhcmtcIiddLFxuICAgICAgIFttc2cuc2V0UGxheWVyRWFzdGVyKCksICdcImVhc3RlclwiJ10sXG4gICAgICAgW21zZy5zZXRQbGF5ZXJCYXRtYW4oKSwgJ1wiYmF0bWFuXCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllclN1Ym1hcmluZSgpLCAnXCJzdWJtYXJpbmVcIiddLFxuICAgICAgIFttc2cuc2V0UGxheWVyVW5pY29ybigpLCAnXCJ1bmljb3JuXCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllckZhaXJ5KCksICdcImZhaXJ5XCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllclN1cGVybWFuKCksICdcInN1cGVybWFuXCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllclR1cmtleSgpLCAnXCJ0dXJrZXlcIiddXTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0UGxheWVyLksxX0NIT0lDRVMgPVxuICAgICAgW1tza2luLmF2YXRhciwgRkxBUFBZX1ZBTFVFXSxcbiAgICAgICBbc2tpbi5yZWRiaXJkLmF2YXRhciwgJ1wicmVkYmlyZFwiJ10sXG4gICAgICAgW3NraW4uc2NpZmkuYXZhdGFyLCAnXCJzY2lmaVwiJ10sXG4gICAgICAgW3NraW4udW5kZXJ3YXRlci5hdmF0YXIsICdcInVuZGVyd2F0ZXJcIiddLFxuICAgICAgIFtza2luLnNhbnRhLmF2YXRhciwgJ1wic2FudGFcIiddLFxuICAgICAgIFtza2luLmNhdmUuYXZhdGFyLCAnXCJjYXZlXCInXSxcbiAgICAgICBbc2tpbi5zaGFyay5hdmF0YXIsICdcInNoYXJrXCInXSxcbiAgICAgICBbc2tpbi5lYXN0ZXIuYXZhdGFyLCAnXCJlYXN0ZXJcIiddLFxuICAgICAgIFtza2luLmJhdG1hbi5hdmF0YXIsICdcImJhdG1hblwiJ10sXG4gICAgICAgW3NraW4uc3VibWFyaW5lLmF2YXRhciwgJ1wic3VibWFyaW5lXCInXSxcbiAgICAgICBbc2tpbi51bmljb3JuLmF2YXRhciwgJ1widW5pY29yblwiJ10sXG4gICAgICAgW3NraW4uZmFpcnkuYXZhdGFyLCAnXCJmYWlyeVwiJ10sXG4gICAgICAgW3NraW4uc3VwZXJtYW4uYXZhdGFyLCAnXCJzdXBlcm1hblwiJ10sXG4gICAgICAgW3NraW4udHVya2V5LmF2YXRhciwgJ1widHVya2V5XCInXSxcbiAgICAgICBbc2tpbi5yYW5kb21QdXJwbGVJY29uLCBSQU5ET01fVkFMVUVdXTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3NldFBsYXllciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ3NldFBsYXllcicpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBzZXRPYnN0YWNsZVxuICAgKi9cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldE9ic3RhY2xlID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHZhciBkcm9wZG93bjtcbiAgICAgIHZhciBpbnB1dCA9IHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobXNnLnNldE9ic3RhY2xlKCkpO1xuICAgICAgICBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bih0aGlzLksxX0NIT0lDRVMsIDUwLCAzMCk7XG4gICAgICAgIGRyb3Bkb3duLnNldFZhbHVlKEZMQVBQWV9WQUxVRSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRVMpO1xuICAgICAgICBkcm9wZG93bi5zZXRWYWx1ZShGTEFQUFlfVkFMVUUpO1xuICAgICAgfVxuXG4gICAgICBpbnB1dC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1ZBTFVFJyk7XG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnNldE9ic3RhY2xlVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldE9ic3RhY2xlLlZBTFVFUyA9XG4gICAgICBbW21zZy5zZXRPYnN0YWNsZVJhbmRvbSgpLCBSQU5ET01fVkFMVUVdLFxuICAgICAgIFttc2cuc2V0T2JzdGFjbGVGbGFwcHkoKSwgRkxBUFBZX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldE9ic3RhY2xlU2NpRmkoKSwgJ1wic2NpZmlcIiddLFxuICAgICAgIFttc2cuc2V0T2JzdGFjbGVVbmRlcndhdGVyKCksICdcInVuZGVyd2F0ZXJcIiddLFxuICAgICAgIFttc2cuc2V0T2JzdGFjbGVDYXZlKCksICdcImNhdmVcIiddLFxuICAgICAgIFttc2cuc2V0T2JzdGFjbGVTYW50YSgpLCAnXCJzYW50YVwiJ10sXG4gICAgICAgW21zZy5zZXRPYnN0YWNsZUxhc2VyKCksICdcImxhc2VyXCInXV07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldE9ic3RhY2xlLksxX0NIT0lDRVMgPVxuICAgICAgW1tza2luLm9ic3RhY2xlX2JvdHRvbV90aHVtYiwgRkxBUFBZX1ZBTFVFXSxcbiAgICAgICBbc2tpbi5zY2lmaS5vYnN0YWNsZV9ib3R0b21fdGh1bWIsICdcInNjaWZpXCInXSxcbiAgICAgICBbc2tpbi51bmRlcndhdGVyLm9ic3RhY2xlX2JvdHRvbV90aHVtYiwgJ1widW5kZXJ3YXRlclwiJ10sXG4gICAgICAgW3NraW4uY2F2ZS5vYnN0YWNsZV9ib3R0b21fdGh1bWIsICdcImNhdmVcIiddLFxuICAgICAgIFtza2luLnNhbnRhLm9ic3RhY2xlX2JvdHRvbV90aHVtYiwgJ1wic2FudGFcIiddLFxuICAgICAgIFtza2luLmxhc2VyLm9ic3RhY2xlX2JvdHRvbV90aHVtYiwgJ1wibGFzZXJcIiddLFxuICAgICAgIFtza2luLnJhbmRvbVB1cnBsZUljb24sIFJBTkRPTV9WQUxVRV1dO1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfc2V0T2JzdGFjbGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZ2VuZXJhdGVTZXR0ZXJDb2RlKHRoaXMsICdzZXRPYnN0YWNsZScpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBzZXRHcm91bmRcbiAgICovXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRHcm91bmQgPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldEhTVigzMTIsIDAuMzIsIDAuNjIpO1xuICAgICAgdmFyIGRyb3Bkb3duO1xuICAgICAgdmFyIGlucHV0ID0gdGhpcy5hcHBlbmREdW1teUlucHV0KCk7XG4gICAgICBpZiAoaXNLMSkge1xuICAgICAgICBpbnB1dC5hcHBlbmRUaXRsZShtc2cuc2V0R3JvdW5kKCkpO1xuICAgICAgICBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bih0aGlzLksxX0NIT0lDRVMsIDUwLCAzMCk7XG4gICAgICAgIGRyb3Bkb3duLnNldFZhbHVlKEZMQVBQWV9WQUxVRSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRVMpO1xuICAgICAgICBkcm9wZG93bi5zZXRWYWx1ZShGTEFQUFlfVkFMVUUpO1xuICAgICAgfVxuICAgICAgaW5wdXQuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuXG4gICAgICB0aGlzLnNldElucHV0c0lubGluZSh0cnVlKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnNldEdyb3VuZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRHcm91bmQuVkFMVUVTID1cbiAgICAgIFtbbXNnLnNldEdyb3VuZFJhbmRvbSgpLCBSQU5ET01fVkFMVUVdLFxuICAgICAgIFttc2cuc2V0R3JvdW5kRmxhcHB5KCksIEZMQVBQWV9WQUxVRV0sXG4gICAgICAgW21zZy5zZXRHcm91bmRTY2lGaSgpLCAnXCJzY2lmaVwiJ10sXG4gICAgICAgW21zZy5zZXRHcm91bmRVbmRlcndhdGVyKCksICdcInVuZGVyd2F0ZXJcIiddLFxuICAgICAgIFttc2cuc2V0R3JvdW5kQ2F2ZSgpLCAnXCJjYXZlXCInXSxcbiAgICAgICBbbXNnLnNldEdyb3VuZFNhbnRhKCksICdcInNhbnRhXCInXSxcbiAgICAgICBbbXNnLnNldEdyb3VuZExhdmEoKSwgJ1wibGF2YVwiJ11dO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRHcm91bmQuSzFfQ0hPSUNFUyA9XG4gICAgICBbW3NraW4uZ3JvdW5kX3RodW1iLCBGTEFQUFlfVkFMVUVdLFxuICAgICAgIFtza2luLnNjaWZpLmdyb3VuZF90aHVtYiwgJ1wic2NpZmlcIiddLFxuICAgICAgIFtza2luLnVuZGVyd2F0ZXIuZ3JvdW5kX3RodW1iLCAnXCJ1bmRlcndhdGVyXCInXSxcbiAgICAgICBbc2tpbi5jYXZlLmdyb3VuZF90aHVtYiwgJ1wiY2F2ZVwiJ10sXG4gICAgICAgW3NraW4uc2FudGEuZ3JvdW5kX3RodW1iLCAnXCJzYW50YVwiJ10sXG4gICAgICAgW3NraW4ubGF2YS5ncm91bmRfdGh1bWIsICdcImxhdmFcIiddLFxuICAgICAgIFtza2luLnJhbmRvbVB1cnBsZUljb24sIFJBTkRPTV9WQUxVRV1dO1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfc2V0R3JvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlU2V0dGVyQ29kZSh0aGlzLCAnc2V0R3JvdW5kJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIHNldEdyYXZpdHlcbiAgICovXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRHcmF2aXR5ID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFUyk7XG4gICAgICBkcm9wZG93bi5zZXRWYWx1ZSh0aGlzLlZBTFVFU1szXVsxXSk7ICAvLyBkZWZhdWx0IHRvIG5vcm1hbFxuXG4gICAgICB0aGlzLnNldEhTVigzMTIsIDAuMzIsIDAuNjIpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5zZXRHcmF2aXR5VG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldEdyYXZpdHkuVkFMVUVTID1cbiAgICAgIFtbbXNnLnNldEdyYXZpdHlSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldEdyYXZpdHlWZXJ5TG93KCksICdGbGFwcHkuR3Jhdml0eS5WRVJZX0xPVyddLFxuICAgICAgIFttc2cuc2V0R3Jhdml0eUxvdygpLCAnRmxhcHB5LkdyYXZpdHkuTE9XJ10sXG4gICAgICAgW21zZy5zZXRHcmF2aXR5Tm9ybWFsKCksICdGbGFwcHkuR3Jhdml0eS5OT1JNQUwnXSxcbiAgICAgICBbbXNnLnNldEdyYXZpdHlIaWdoKCksICdGbGFwcHkuR3Jhdml0eS5ISUdIJ10sXG4gICAgICAgW21zZy5zZXRHcmF2aXR5VmVyeUhpZ2goKSwgJ0ZsYXBweS5HcmF2aXR5LlZFUllfSElHSCddXG4gICAgICBdO1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfc2V0R3Jhdml0eSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ3NldEdyYXZpdHknKTtcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0U2NvcmUgPSB7XG4gICAgLy8gQmxvY2sgZm9yIG1vdmluZyBmb3J3YXJkIG9yIGJhY2t3YXJkIHRoZSBpbnRlcm5hbCBudW1iZXIgb2YgcGl4ZWxzLlxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRTY29yZSgpKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZFRleHRJbnB1dCgnMCcsXG4gICAgICAgICAgICBibG9ja2x5LkZpZWxkVGV4dElucHV0Lm51bWJlclZhbGlkYXRvciksICdWQUxVRScpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5zZXRTY29yZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfc2V0U2NvcmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mXG4gICAgLy8gcGl4ZWxzLlxuICAgIHZhciB2YWx1ZSA9IHdpbmRvdy5wYXJzZUludCh0aGlzLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJyksIDEwKTtcbiAgICByZXR1cm4gJ0ZsYXBweS5zZXRTY29yZShcXCdibG9ja19pZF8nICsgdGhpcy5pZCArICdcXCcsICcgKyB2YWx1ZSArICcpO1xcbic7XG4gIH07XG5cbiAgZGVsZXRlIGJsb2NrbHkuQmxvY2tzLnByb2NlZHVyZXNfZGVmcmV0dXJuO1xuICBkZWxldGUgYmxvY2tseS5CbG9ja3MucHJvY2VkdXJlc19pZnJldHVybjtcbn07XG4iLCIvLyBsb2NhbGUgZm9yIGZsYXBweVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5ibG9ja2x5LmZsYXBweV9sb2NhbGU7XG4iLCJ2YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xuXG5leHBvcnRzLkZsYXBIZWlnaHQgPSB7XG4gIFZFUllfU01BTEw6IC02LFxuICBTTUFMTDogLTgsXG4gIE5PUk1BTDogLTExLFxuICBMQVJHRTogLTEzLFxuICBWRVJZX0xBUkdFOiAtMTVcbn07XG5cbmV4cG9ydHMuTGV2ZWxTcGVlZCA9IHtcbiAgVkVSWV9TTE9XOiAxLFxuICBTTE9XOiAzLFxuICBOT1JNQUw6IDQsXG4gIEZBU1Q6IDYsXG4gIFZFUllfRkFTVDogOFxufTtcblxuZXhwb3J0cy5HYXBIZWlnaHQgPSB7XG4gIFZFUllfU01BTEw6IDY1LFxuICBTTUFMTDogNzUsXG4gIE5PUk1BTDogMTAwLFxuICBMQVJHRTogMTI1LFxuICBWRVJZX0xBUkdFOiAxNTBcbn07XG5cbmV4cG9ydHMuR3Jhdml0eSA9IHtcbiAgVkVSWV9MT1c6IDAuNSxcbiAgTE9XOiAwLjc1LFxuICBOT1JNQUw6IDEsXG4gIEhJR0g6IDEuMjUsXG4gIFZFUllfSElHSDogMS41XG59O1xuXG5leHBvcnRzLnJhbmRvbSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgdmFyIGtleSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHZhbHVlcy5sZW5ndGgpO1xuICByZXR1cm4gdmFsdWVzW2tleV07XG59O1xuXG5leHBvcnRzLnNldFNjb3JlID0gZnVuY3Rpb24gKGlkLCB2YWx1ZSkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgRmxhcHB5LnBsYXllclNjb3JlID0gdmFsdWU7XG4gIEZsYXBweS5kaXNwbGF5U2NvcmUoKTtcbn07XG5cbmV4cG9ydHMuc2V0R3Jhdml0eSA9IGZ1bmN0aW9uIChpZCwgdmFsdWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5ncmF2aXR5ID0gdmFsdWU7XG59O1xuXG5leHBvcnRzLnNldEdyb3VuZCA9IGZ1bmN0aW9uIChpZCwgdmFsdWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5zZXRHcm91bmQodmFsdWUpO1xufTtcblxuZXhwb3J0cy5zZXRPYnN0YWNsZSA9IGZ1bmN0aW9uIChpZCwgdmFsdWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5zZXRPYnN0YWNsZSh2YWx1ZSk7XG59O1xuXG5leHBvcnRzLnNldFBsYXllciA9IGZ1bmN0aW9uIChpZCwgdmFsdWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5zZXRQbGF5ZXIodmFsdWUpO1xufTtcblxuZXhwb3J0cy5zZXRHYXBIZWlnaHQgPSBmdW5jdGlvbiAoaWQsIHZhbHVlKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBGbGFwcHkuc2V0R2FwSGVpZ2h0KHZhbHVlKTtcbn07XG5cbmV4cG9ydHMuc2V0QmFja2dyb3VuZCA9IGZ1bmN0aW9uIChpZCwgdmFsdWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5zZXRCYWNrZ3JvdW5kKHZhbHVlKTtcbn07XG5cbmV4cG9ydHMuc2V0U3BlZWQgPSBmdW5jdGlvbiAoaWQsIHZhbHVlKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBGbGFwcHkuU1BFRUQgPSB2YWx1ZTtcbn07XG5cbmV4cG9ydHMucGxheVNvdW5kID0gZnVuY3Rpb24oaWQsIHNvdW5kTmFtZSkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgc3R1ZGlvQXBwLnBsYXlBdWRpbyhzb3VuZE5hbWUpO1xufTtcblxuZXhwb3J0cy5mbGFwID0gZnVuY3Rpb24gKGlkLCBhbW91bnQpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5mbGFwKGFtb3VudCk7XG59O1xuXG5leHBvcnRzLmVuZEdhbWUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5nYW1lU3RhdGUgPSBGbGFwcHkuR2FtZVN0YXRlcy5FTkRJTkc7XG59O1xuXG5leHBvcnRzLmluY3JlbWVudFBsYXllclNjb3JlID0gZnVuY3Rpb24oaWQpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5wbGF5ZXJTY29yZSsrO1xuICBGbGFwcHkuZGlzcGxheVNjb3JlKCk7XG59O1xuIl19
