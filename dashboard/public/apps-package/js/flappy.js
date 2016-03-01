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
var AppView = require('../templates/AppView.jsx');
var codeWorkspaceEjs = require('../templates/codeWorkspace.html.ejs');
var visualizationColumnEjs = require('../templates/visualizationColumn.html.ejs');
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

  var renderCodeWorkspace = function renderCodeWorkspace() {
    return codeWorkspaceEjs({
      assetUrl: studioApp.assetUrl,
      data: {
        localeDirection: studioApp.localeDirection(),
        blockUsed: undefined,
        idealBlockNumber: undefined,
        editCode: level.editCode,
        blockCounterClass: 'block-counter-default',
        readonlyWorkspace: config.readonlyWorkspace
      }
    });
  };

  var renderVisualizationColumn = function renderVisualizationColumn() {
    return visualizationColumnEjs({
      assetUrl: studioApp.assetUrl,
      data: {
        visualization: require('./visualization.html.ejs')(),
        controls: require('./controls.html.ejs')({ assetUrl: studioApp.assetUrl, shareable: level.shareable })
      }
    });
  };

  var onMount = function onMount() {
    studioApp.init(config);

    var rightButton = document.getElementById('rightButton');
    dom.addClickTouchEvent(rightButton, Flappy.onPuzzleComplete);
  };

  React.render(React.createElement(AppView, {
    assetUrl: studioApp.assetUrl,
    isEmbedView: !!config.embed,
    isShareView: !!config.share,
    renderCodeWorkspace: renderCodeWorkspace,
    renderVisualizationColumn: renderVisualizationColumn,
    onMount: onMount
  }), document.getElementById(config.containerId));
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

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../codegen":"/home/ubuntu/staging/apps/build/js/codegen.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../dropletUtils":"/home/ubuntu/staging/apps/build/js/dropletUtils.js","../locale":"/home/ubuntu/staging/apps/build/js/locale.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../templates/AppView.jsx":"/home/ubuntu/staging/apps/build/js/templates/AppView.jsx","../templates/codeWorkspace.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/codeWorkspace.html.ejs","../templates/visualizationColumn.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/visualizationColumn.html.ejs","../utils":"/home/ubuntu/staging/apps/build/js/utils.js","./api":"/home/ubuntu/staging/apps/build/js/flappy/api.js","./constants":"/home/ubuntu/staging/apps/build/js/flappy/constants.js","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/flappy/controls.html.ejs","./locale":"/home/ubuntu/staging/apps/build/js/flappy/locale.js","./visualization.html.ejs":"/home/ubuntu/staging/apps/build/js/flappy/visualization.html.ejs"}],"/home/ubuntu/staging/apps/build/js/flappy/visualization.html.ejs":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9mbGFwcHkvbWFpbi5qcyIsImJ1aWxkL2pzL2ZsYXBweS9za2lucy5qcyIsImJ1aWxkL2pzL2ZsYXBweS9sZXZlbHMuanMiLCJidWlsZC9qcy9mbGFwcHkvZmxhcHB5LmpzIiwiYnVpbGQvanMvZmxhcHB5L3Zpc3VhbGl6YXRpb24uaHRtbC5lanMiLCJidWlsZC9qcy9mbGFwcHkvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9mbGFwcHkvY29uc3RhbnRzLmpzIiwiYnVpbGQvanMvZmxhcHB5L2Jsb2Nrcy5qcyIsImJ1aWxkL2pzL2ZsYXBweS9sb2NhbGUuanMiLCJidWlsZC9qcy9mbGFwcHkvYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUNaQSxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRXBDLElBQUksT0FBTyxHQUFHOztBQUVaLFFBQU0sRUFBRSxFQUNQOztDQUVGLENBQUM7O0FBRUYsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUU7QUFDcEMsTUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEMsTUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7Ozs7O0FBTTlCLE1BQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxjQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQztBQUNqRCxVQUFNLEVBQUUsSUFBSSxD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QUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDOUMsYUFBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ2xELGFBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQzs7QUFFcEQsYUFBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQzlDLGFBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUM5QyxhQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDbEQsYUFBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQzFELGFBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNoRCxhQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDbEQsYUFBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzFDLGFBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNoRCxhQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDOUMsYUFBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzlDLGFBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNoRCxhQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDNUMsYUFBUyxD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QUFFLENBQUM7Q0FDdkIsQ0FBQzs7QUFFRixPQUFPLENBQUMsVUFBVSxHQUFHLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRTtBQUN4QyxXQUFTLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLFFBQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0NBQ3hCLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsR0FBRyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUU7QUFDdkMsV0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixRQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ3pCLENBQUM7O0FBRUYsT0FBTyxDQUFDLFdBQVcsR0FBRyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUU7QUFDekMsV0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixRQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQzNCLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsR0FBRyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUU7QUFDdkMsV0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixRQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ3pCLENBQUM7O0FBRUYsT0FBTyxDQUFDLFlBQVksR0FBRyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUU7QUFDMUMsV0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixRQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQzVCLENBQUM7O0FBRUYsT0FBTyxDQUFDLGFBQWEsR0FBRyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUU7QUFDM0MsV0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixRQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQzdCLENBQUM7O0FBRUYsT0FBTyxDQUFDLFFBQVEsR0FBRyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUU7QUFDdEMsV0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixRQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztDQUN0QixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLEdBQUcsVUFBUyxFQUFFLEVBQUUsU0FBUyxFQUFFO0FBQzFDLFdBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsV0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztDQUNoQyxDQUFDOztBQUVGLE9BQU8sQ0FBQyxJQUFJLEdBQUcsVUFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFO0FBQ25DLFdBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsUUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUNyQixDQUFDOztBQUVGLE9BQU8sQ0FBQyxPQUFPLEdBQUcsVUFBVSxFQUFFLEVBQUU7QUFDOUIsV0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixRQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO0NBQzdDLENBQUM7O0FBRUYsT0FBTyxDQUFDLG9CQUFvQixHQUFHLFVBQVMsRUFBRSxFQUFFO0FBQzFDLFdBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsUUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3JCLFFBQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztDQUN2QixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuRmxhcHB5ID0gcmVxdWlyZSgnLi9mbGFwcHknKTtcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICBnbG9iYWwuRmxhcHB5ID0gd2luZG93LkZsYXBweTtcbn1cbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuL3NraW5zJyk7XG5cbndpbmRvdy5mbGFwcHlNYWluID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgYXBwTWFpbih3aW5kb3cuRmxhcHB5LCBsZXZlbHMsIG9wdGlvbnMpO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbUoxYVd4a0wycHpMMlpzWVhCd2VTOXRZV2x1TG1weklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN096dEJRVUZCTEVsQlFVa3NUMEZCVHl4SFFVRkhMRTlCUVU4c1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF6dEJRVU53UXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0QlFVTndReXhKUVVGSkxFOUJRVThzVFVGQlRTeExRVUZMTEZkQlFWY3NSVUZCUlR0QlFVTnFReXhSUVVGTkxFTkJRVU1zVFVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNN1EwRkRMMEk3UVVGRFJDeEpRVUZKTEUxQlFVMHNSMEZCUnl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03UVVGRGFrTXNTVUZCU1N4TlFVRk5MRWRCUVVjc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzBGQlEycERMRWxCUVVrc1MwRkJTeXhIUVVGSExFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXpzN1FVRkZMMElzVFVGQlRTeERRVUZETEZWQlFWVXNSMEZCUnl4VlFVRlRMRTlCUVU4c1JVRkJSVHRCUVVOd1F5eFRRVUZQTEVOQlFVTXNWMEZCVnl4SFFVRkhMRXRCUVVzc1EwRkJRenRCUVVNMVFpeFRRVUZQTEVOQlFVTXNXVUZCV1N4SFFVRkhMRTFCUVUwc1EwRkJRenRCUVVNNVFpeFRRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRTFCUVUwc1JVRkJSU3hOUVVGTkxFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdRMEZEZWtNc1EwRkJReUlzSW1acGJHVWlPaUpuWlc1bGNtRjBaV1F1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaWRtRnlJR0Z3Y0UxaGFXNGdQU0J5WlhGMWFYSmxLQ2N1TGk5aGNIQk5ZV2x1SnlrN1hHNTNhVzVrYjNjdVJteGhjSEI1SUQwZ2NtVnhkV2x5WlNnbkxpOW1iR0Z3Y0hrbktUdGNibWxtSUNoMGVYQmxiMllnWjJ4dlltRnNJQ0U5UFNBbmRXNWtaV1pwYm1Wa0p5a2dlMXh1SUNCbmJHOWlZV3d1Um14aGNIQjVJRDBnZDJsdVpHOTNMa1pzWVhCd2VUdGNibjFjYm5aaGNpQmliRzlqYTNNZ1BTQnlaWEYxYVhKbEtDY3VMMkpzYjJOcmN5Y3BPMXh1ZG1GeUlHeGxkbVZzY3lBOUlISmxjWFZwY21Vb0p5NHZiR1YyWld4ekp5azdYRzUyWVhJZ2MydHBibk1nUFNCeVpYRjFhWEpsS0NjdUwzTnJhVzV6SnlrN1hHNWNibmRwYm1SdmR5NW1iR0Z3Y0hsTllXbHVJRDBnWm5WdVkzUnBiMjRvYjNCMGFXOXVjeWtnZTF4dUlDQnZjSFJwYjI1ekxuTnJhVzV6VFc5a2RXeGxJRDBnYzJ0cGJuTTdYRzRnSUc5d2RHbHZibk11WW14dlkydHpUVzlrZFd4bElEMGdZbXh2WTJ0ek8xeHVJQ0JoY0hCTllXbHVLSGRwYm1SdmR5NUdiR0Z3Y0hrc0lHeGxkbVZzY3l3Z2IzQjBhVzl1Y3lrN1hHNTlPMXh1SWwxOSIsIi8qKlxuICogTG9hZCBTa2luIGZvciBGbGFwcHkuXG4gKi9cbi8vIGJhY2tncm91bmQ6IE51bWJlciBvZiA0MDB4NDAwIGJhY2tncm91bmQgaW1hZ2VzLiBSYW5kb21seSBzZWxlY3Qgb25lIGlmXG4vLyBzcGVjaWZpZWQsIG90aGVyd2lzZSwgdXNlIGJhY2tncm91bmQucG5nLlxuLy8gZ3JhcGg6IENvbG91ciBvZiBvcHRpb25hbCBncmlkIGxpbmVzLCBvciBmYWxzZS5cblxudmFyIHNraW5zQmFzZSA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG5cbnZhciBDT05GSUdTID0ge1xuXG4gIGZsYXBweToge1xuICB9XG5cbn07XG5cbmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uKGFzc2V0VXJsLCBpZCkge1xuICB2YXIgc2tpbiA9IHNraW5zQmFzZS5sb2FkKGFzc2V0VXJsLCBpZCk7XG4gIHZhciBjb25maWcgPSBDT05GSUdTW3NraW4uaWRdO1xuXG4gIC8vIHRvZG86IHRoZSB3YXkgdGhlc2UgYXJlIG9yZ2FuaXplZCBlbmRzIHVwIGJlaW5nIGEgbGl0dGxlIGJpdCB1Z2x5IGFzXG4gIC8vIGxvdCBvZiBvdXIgYXNzZXRzIGFyZSBpbmRpdmlkdWFsIGl0ZW1zIG5vdCBuZWNlc3NhcmlseSBhdHRhY2hlZCB0byBhXG4gIC8vIHNwZWNpZmljIHRoZW1lXG5cbiAgc2tpbi5zY2lmaSA9IHtcbiAgICBiYWNrZ3JvdW5kOiBza2luLmFzc2V0VXJsKCdiYWNrZ3JvdW5kX3NjaWZpLnBuZycpLFxuICAgIGF2YXRhcjogc2tpbi5hc3NldFVybCgnYXZhdGFyX3NjaWZpLnBuZycpLFxuICAgIG9ic3RhY2xlX2JvdHRvbTogc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfYm90dG9tX3NjaWZpLnBuZycpLFxuICAgIG9ic3RhY2xlX2JvdHRvbV90aHVtYjogc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfYm90dG9tX3NjaWZpX3RodW1iLnBuZycpLFxuICAgIG9ic3RhY2xlX3RvcDogc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfdG9wX3NjaWZpLnBuZycpLFxuICAgIGdyb3VuZDogc2tpbi5hc3NldFVybCgnZ3JvdW5kX3NjaWZpLnBuZycpLFxuICAgIGdyb3VuZF90aHVtYjogc2tpbi5hc3NldFVybCgnZ3JvdW5kX3NjaWZpX3RodW1iLnBuZycpXG4gIH07XG5cbiAgc2tpbi51bmRlcndhdGVyID0ge1xuICAgIGJhY2tncm91bmQ6IHNraW4uYXNzZXRVcmwoJ2JhY2tncm91bmRfdW5kZXJ3YXRlci5wbmcnKSxcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ2F2YXRhcl91bmRlcndhdGVyLnBuZycpLFxuICAgIG9ic3RhY2xlX2JvdHRvbTogc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfYm90dG9tX3VuZGVyd2F0ZXIucG5nJyksXG4gICAgb2JzdGFjbGVfYm90dG9tX3RodW1iOiBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV9ib3R0b21fdW5kZXJ3YXRlcl90aHVtYi5wbmcnKSxcbiAgICBvYnN0YWNsZV90b3A6IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX3RvcF91bmRlcndhdGVyLnBuZycpLFxuICAgIGdyb3VuZDogc2tpbi5hc3NldFVybCgnZ3JvdW5kX3VuZGVyd2F0ZXIucG5nJyksXG4gICAgZ3JvdW5kX3RodW1iOiBza2luLmFzc2V0VXJsKCdncm91bmRfdW5kZXJ3YXRlcl90aHVtYi5wbmcnKVxuICB9O1xuXG4gIHNraW4uY2F2ZSA9IHtcbiAgICBiYWNrZ3JvdW5kOiBza2luLmFzc2V0VXJsKCdiYWNrZ3JvdW5kX2NhdmUucG5nJyksXG4gICAgYXZhdGFyOiBza2luLmFzc2V0VXJsKCdhdmF0YXJfY2F2ZS5wbmcnKSxcbiAgICBvYnN0YWNsZV9ib3R0b206IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbV9jYXZlLnBuZycpLFxuICAgIG9ic3RhY2xlX2JvdHRvbV90aHVtYjogc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfYm90dG9tX2NhdmVfdGh1bWIucG5nJyksXG4gICAgb2JzdGFjbGVfdG9wOiBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV90b3BfY2F2ZS5wbmcnKSxcbiAgICBncm91bmQ6IHNraW4uYXNzZXRVcmwoJ2dyb3VuZF9jYXZlLnBuZycpLFxuICAgIGdyb3VuZF90aHVtYjogc2tpbi5hc3NldFVybCgnZ3JvdW5kX2NhdmVfdGh1bWIucG5nJylcbiAgfTtcblxuICBza2luLnNhbnRhID0ge1xuICAgIGJhY2tncm91bmQ6IHNraW4uYXNzZXRVcmwoJ2JhY2tncm91bmRfc2FudGEucG5nJyksXG4gICAgYXZhdGFyOiBza2luLmFzc2V0VXJsKCdzYW50YS5wbmcnKSxcbiAgICBvYnN0YWNsZV9ib3R0b206IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbV9zYW50YS5wbmcnKSxcbiAgICBvYnN0YWNsZV9ib3R0b21fdGh1bWI6IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbV9zYW50YV90aHVtYi5wbmcnKSxcbiAgICBvYnN0YWNsZV90b3A6IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX3RvcF9zYW50YS5wbmcnKSxcbiAgICBncm91bmQ6IHNraW4uYXNzZXRVcmwoJ2dyb3VuZF9zYW50YS5wbmcnKSxcbiAgICBncm91bmRfdGh1bWI6IHNraW4uYXNzZXRVcmwoJ2dyb3VuZF9zYW50YV90aHVtYi5wbmcnKVxuICB9O1xuXG4gIHNraW4ubmlnaHQgPSB7XG4gICAgYmFja2dyb3VuZDogc2tpbi5hc3NldFVybCgnYmFja2dyb3VuZF9uaWdodC5wbmcnKVxuICB9O1xuXG4gIHNraW4ucmVkYmlyZCA9IHtcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ2F2YXRhcl9yZWRiaXJkLnBuZycpXG4gIH07XG5cbiAgc2tpbi5sYXNlciA9IHtcbiAgICBvYnN0YWNsZV9ib3R0b206IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbV9sYXNlci5wbmcnKSxcbiAgICBvYnN0YWNsZV9ib3R0b21fdGh1bWI6IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbV9sYXNlcl90aHVtYi5wbmcnKSxcbiAgICBvYnN0YWNsZV90b3A6IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX3RvcF9sYXNlci5wbmcnKVxuICB9O1xuXG4gIHNraW4ubGF2YSA9IHtcbiAgICBncm91bmQ6IHNraW4uYXNzZXRVcmwoJ2dyb3VuZF9sYXZhLnBuZycpLFxuICAgIGdyb3VuZF90aHVtYjogc2tpbi5hc3NldFVybCgnZ3JvdW5kX2xhdmFfdGh1bWIucG5nJylcbiAgfTtcblxuICBza2luLnNoYXJrID0ge1xuICAgIGF2YXRhcjogc2tpbi5hc3NldFVybCgnc2hhcmsucG5nJylcbiAgfTtcblxuICBza2luLmVhc3RlciA9IHtcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ2Vhc3RlcmJ1bm55LnBuZycpXG4gIH07XG5cbiAgc2tpbi5iYXRtYW4gPSB7XG4gICAgYXZhdGFyOiBza2luLmFzc2V0VXJsKCdiYXRtYW4ucG5nJylcbiAgfTtcblxuICBza2luLnN1Ym1hcmluZSA9IHtcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ3N1Ym1hcmluZS5wbmcnKVxuICB9O1xuXG4gIHNraW4udW5pY29ybiA9IHtcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ3VuaWNvcm4ucG5nJylcbiAgfTtcblxuICBza2luLmZhaXJ5ID0ge1xuICAgIGF2YXRhcjogc2tpbi5hc3NldFVybCgnZmFpcnkucG5nJylcbiAgfTtcblxuICBza2luLnN1cGVybWFuID0ge1xuICAgIGF2YXRhcjogc2tpbi5hc3NldFVybCgnc3VwZXJtYW4ucG5nJylcbiAgfTtcblxuICBza2luLnR1cmtleSA9IHtcbiAgICBhdmF0YXI6IHNraW4uYXNzZXRVcmwoJ3R1cmtleS5wbmcnKVxuICB9O1xuXG4gIC8vIEltYWdlc1xuICBza2luLmdyb3VuZCA9IHNraW4uYXNzZXRVcmwoJ2dyb3VuZC5wbmcnKTtcbiAgc2tpbi5ncm91bmRfdGh1bWIgPSBza2luLmFzc2V0VXJsKCdncm91bmRfdGh1bWIucG5nJyk7XG4gIHNraW4ub2JzdGFjbGVfdG9wID0gc2tpbi5hc3NldFVybCgnb2JzdGFjbGVfdG9wLnBuZycpO1xuICBza2luLm9ic3RhY2xlX2JvdHRvbSA9IHNraW4uYXNzZXRVcmwoJ29ic3RhY2xlX2JvdHRvbS5wbmcnKTtcbiAgc2tpbi5vYnN0YWNsZV9ib3R0b21fdGh1bWIgPSBza2luLmFzc2V0VXJsKCdvYnN0YWNsZV9ib3R0b21fdGh1bWIucG5nJyk7XG4gIHNraW4uaW5zdHJ1Y3Rpb25zID0gc2tpbi5hc3NldFVybCgnaW5zdHJ1Y3Rpb25zLnBuZycpO1xuICBza2luLmNsaWNrcnVuID0gc2tpbi5hc3NldFVybCgnY2xpY2tydW4ucG5nJyk7XG4gIHNraW4uZ2V0cmVhZHkgPSBza2luLmFzc2V0VXJsKCdnZXRyZWFkeS5wbmcnKTtcbiAgc2tpbi5nYW1lb3ZlciA9IHNraW4uYXNzZXRVcmwoJ2dhbWVvdmVyLnBuZycpO1xuICBza2luLmZsYXBJY29uID0gc2tpbi5hc3NldFVybCgnZmxhcC1iaXJkLnBuZycpO1xuICBza2luLmNyYXNoSWNvbiA9IHNraW4uYXNzZXRVcmwoJ3doZW4tY3Jhc2gucG5nJyk7XG4gIHNraW4uY29sbGlkZU9ic3RhY2xlSWNvbiA9IHNraW4uYXNzZXRVcmwoJ3doZW4tb2JzdGFjbGUucG5nJyk7XG4gIHNraW4uY29sbGlkZUdyb3VuZEljb24gPSBza2luLmFzc2V0VXJsKCd3aGVuLWNyYXNoLnBuZycpO1xuICBza2luLmVudGVyT2JzdGFjbGVJY29uID0gc2tpbi5hc3NldFVybCgnd2hlbi1wYXNzLnBuZycpO1xuICBza2luLnRpbGVzID0gc2tpbi5hc3NldFVybCgndGlsZXMucG5nJyk7XG4gIHNraW4uZ29hbCA9IHNraW4uYXNzZXRVcmwoJ2dvYWwucG5nJyk7XG4gIHNraW4uZ29hbFN1Y2Nlc3MgPSBza2luLmFzc2V0VXJsKCdnb2FsX3N1Y2Nlc3MucG5nJyk7XG4gIHNraW4ub2JzdGFjbGUgPSBza2luLmFzc2V0VXJsKCdvYnN0YWNsZS5wbmcnKTtcbiAgc2tpbi5vYnN0YWNsZVNjYWxlID0gY29uZmlnLm9ic3RhY2xlU2NhbGUgfHwgMS4wO1xuICBza2luLmxhcmdlck9ic3RhY2xlQW5pbWF0aW9uVGlsZXMgPVxuICAgICAgc2tpbi5hc3NldFVybChjb25maWcubGFyZ2VyT2JzdGFjbGVBbmltYXRpb25UaWxlcyk7XG4gIHNraW4uaGl0dGluZ1dhbGxBbmltYXRpb24gPVxuICAgICAgc2tpbi5hc3NldFVybChjb25maWcuaGl0dGluZ1dhbGxBbmltYXRpb24pO1xuICBza2luLmFwcHJvYWNoaW5nR29hbEFuaW1hdGlvbiA9XG4gICAgICBza2luLmFzc2V0VXJsKGNvbmZpZy5hcHByb2FjaGluZ0dvYWxBbmltYXRpb24pO1xuICAvLyBTb3VuZHNcbiAgc2tpbi5vYnN0YWNsZVNvdW5kID1cbiAgICAgIFtza2luLmFzc2V0VXJsKCdvYnN0YWNsZS5tcDMnKSwgc2tpbi5hc3NldFVybCgnb2JzdGFjbGUub2dnJyldO1xuICBza2luLndhbGxTb3VuZCA9IFtza2luLmFzc2V0VXJsKCd3YWxsLm1wMycpLCBza2luLmFzc2V0VXJsKCd3YWxsLm9nZycpXTtcbiAgc2tpbi53aW5Hb2FsU291bmQgPSBbc2tpbi5hc3NldFVybCgnd2luX2dvYWwubXAzJyksXG4gICAgICAgICAgICAgICAgICAgICAgIHNraW4uYXNzZXRVcmwoJ3dpbl9nb2FsLm9nZycpXTtcbiAgc2tpbi53YWxsMFNvdW5kID0gW3NraW4uYXNzZXRVcmwoJ3dhbGwwLm1wMycpLCBza2luLmFzc2V0VXJsKCd3YWxsMC5vZ2cnKV07XG5cbiAgc2tpbi5kaWVTb3VuZCA9IFtza2luLmFzc2V0VXJsKCdzZnhfZGllLm1wMycpLCBza2luLmFzc2V0VXJsKCdzZnhfZGllLm9nZycpXTtcbiAgc2tpbi5oaXRTb3VuZCA9IFtza2luLmFzc2V0VXJsKCdzZnhfaGl0Lm1wMycpLCBza2luLmFzc2V0VXJsKCdzZnhfaGl0Lm9nZycpXTtcbiAgc2tpbi5wb2ludFNvdW5kID0gW3NraW4uYXNzZXRVcmwoJ3NmeF9wb2ludC5tcDMnKSwgc2tpbi5hc3NldFVybCgnc2Z4X3BvaW50Lm9nZycpXTtcbiAgc2tpbi5zd29vc2hpbmdTb3VuZCA9IFtza2luLmFzc2V0VXJsKCdzZnhfc3dvb3NoaW5nLm1wMycpLCBza2luLmFzc2V0VXJsKCdzZnhfc3dvb3NoaW5nLm9nZycpXTtcbiAgc2tpbi53aW5nU291bmQgPSBbc2tpbi5hc3NldFVybCgnc2Z4X3dpbmcubXAzJyksIHNraW4uYXNzZXRVcmwoJ3NmeF93aW5nLm9nZycpXTtcblxuICBza2luLmpldFNvdW5kID0gW3NraW4uYXNzZXRVcmwoJ2pldC5tcDMnKSwgc2tpbi5hc3NldFVybCgnamV0Lm9nZycpXTtcbiAgc2tpbi5jcmFzaFNvdW5kID0gW3NraW4uYXNzZXRVcmwoJ2NyYXNoLm1wMycpLCBza2luLmFzc2V0VXJsKCdjcmFzaC5vZ2cnKV07XG4gIHNraW4uamluZ2xlU291bmQgPSBbc2tpbi5hc3NldFVybCgnamluZ2xlLm1wMycpLCBza2luLmFzc2V0VXJsKCdqaW5nbGUub2dnJyldO1xuICBza2luLmxhc2VyU291bmQgPSBbc2tpbi5hc3NldFVybCgnbGFzZXIubXAzJyksIHNraW4uYXNzZXRVcmwoJ2xhc2VyLm9nZycpXTtcbiAgc2tpbi5zcGxhc2hTb3VuZCA9IFtza2luLmFzc2V0VXJsKCdzcGxhc2gubXAzJyksIHNraW4uYXNzZXRVcmwoJ3NwbGFzaC5vZ2cnKV07XG5cbiAgLy8gU2V0dGluZ3NcbiAgc2tpbi5ncmFwaCA9IGNvbmZpZy5ncmFwaDtcbiAgc2tpbi5iYWNrZ3JvdW5kID0gc2tpbi5hc3NldFVybCgnYmFja2dyb3VuZC5wbmcnKTtcblxuICByZXR1cm4gc2tpbjtcbn07XG4iLCIvKmpzaGludCBtdWx0aXN0cjogdHJ1ZSAqL1xuXG4vLyB0b2RvIC0gaSB0aGluayBvdXIgcHJlcG9sdWF0ZWQgY29kZSBjb3VudHMgYXMgTE9Dc1xuXG52YXIgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcbnZhciBmbGFwcHlNc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIHRiID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKS5jcmVhdGVUb29sYm94O1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIGNhdGVnb3J5ID0gZnVuY3Rpb24gKG5hbWUsIGJsb2Nrcykge1xuICByZXR1cm4gJzxjYXRlZ29yeSBpZD1cIicgKyBuYW1lICsgJ1wiIG5hbWU9XCInICsgbmFtZSArICdcIj4nICsgYmxvY2tzICsgJzwvY2F0ZWdvcnk+Jztcbn07XG5cbnZhciBmbGFwQmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfZmxhcFwiPjwvYmxvY2s+JztcbnZhciBmbGFwSGVpZ2h0QmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfZmxhcF9oZWlnaHRcIj48L2Jsb2NrPic7XG52YXIgZW5kR2FtZUJsb2NrID0gJzxibG9jayB0eXBlPVwiZmxhcHB5X2VuZEdhbWVcIj48L2Jsb2NrPic7XG52YXIgcGxheVNvdW5kQmxvY2sgPSAgJzxibG9jayB0eXBlPVwiZmxhcHB5X3BsYXlTb3VuZFwiPjwvYmxvY2s+JztcbnZhciBpbmNyZW1lbnRTY29yZUJsb2NrID0gJzxibG9jayB0eXBlPVwiZmxhcHB5X2luY3JlbWVudFBsYXllclNjb3JlXCI+PC9ibG9jaz4nO1xuXG52YXIgc2V0U3BlZWRCbG9jayA9ICc8YmxvY2sgdHlwZT1cImZsYXBweV9zZXRTcGVlZFwiPjwvYmxvY2s+JztcbnZhciBzZXRCYWNrZ3JvdW5kQmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfc2V0QmFja2dyb3VuZFwiPjwvYmxvY2s+JztcbnZhciBzZXRHYXBIZWlnaHRCbG9jayA9ICc8YmxvY2sgdHlwZT1cImZsYXBweV9zZXRHYXBIZWlnaHRcIj48L2Jsb2NrPic7XG52YXIgc2V0UGxheWVyQmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfc2V0UGxheWVyXCI+PC9ibG9jaz4nO1xudmFyIHNldE9ic3RhY2xlQmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfc2V0T2JzdGFjbGVcIj48L2Jsb2NrPic7XG52YXIgc2V0R3JvdW5kQmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfc2V0R3JvdW5kXCI+PC9ibG9jaz4nO1xudmFyIHNldEdyYXZpdHlCbG9jayA9ICc8YmxvY2sgdHlwZT1cImZsYXBweV9zZXRHcmF2aXR5XCI+PC9ibG9jaz4nO1xudmFyIHNldFNjb3JlQmxvY2sgPSAnPGJsb2NrIHR5cGU9XCJmbGFwcHlfc2V0U2NvcmVcIj48L2Jsb2NrPic7XG5cbnZhciBBVkFUQVJfSEVJR0hUID0gY29uc3RhbnRzLkFWQVRBUl9IRUlHSFQ7XG52YXIgQVZBVEFSX1dJRFRIID0gY29uc3RhbnRzLkFWQVRBUl9XSURUSDtcbnZhciBBVkFUQVJfWV9PRkZTRVQgPSBjb25zdGFudHMuQVZBVEFSX1lfT0ZGU0VUO1xuXG52YXIgZXZlbnRCbG9jayA9IGZ1bmN0aW9uICh0eXBlLCBjaGlsZCkge1xuICByZXR1cm4gJzxibG9jayB0eXBlPVwiJyArIHR5cGUgKyAnXCIgZGVsZXRhYmxlPVwiZmFsc2VcIj4nICtcbiAgICAoY2hpbGQgPyAnPG5leHQ+JyArIGNoaWxkICsgJzwvbmV4dD4nIDogJycpICtcbiAgICAnPC9ibG9jaz4nO1xufTtcblxuLy8gbm90IG1vdmFibGUgb3IgZGVsZXRhYmxlXG52YXIgYW5jaG9yZWRCbG9jayA9IGZ1bmN0aW9uICh0eXBlLCBjaGlsZCkge1xuICByZXR1cm4gJzxibG9jayB0eXBlPVwiJyArIHR5cGUgKyAnXCIgZGVsZXRhYmxlPVwiZmFsc2VcIiBtb3ZhYmxlPVwiZmFsc2VcIj4nICtcbiAgICAoY2hpbGQgPyAnPG5leHQ+JyArIGNoaWxkICsgJzwvbmV4dD4nIDogJycpICtcbiAgICAnPC9ibG9jaz4nO1xufTtcblxuLypcbiAqIENvbmZpZ3VyYXRpb24gZm9yIGFsbCBsZXZlbHMuXG4gKi9cblxuIC8qKlxuICAqIEV4cGxhbmF0aW9uIG9mIG9wdGlvbnM6XG4gICogZ29hbC5zdGFydFgvc3RhcnRZXG4gICogLSBzdGFydCBsb2NhdGlvbiBvZiBmbGFnIGltYWdlXG4gICogZ29hbC5tb3ZpbmdcbiAgKiAtIHdoZXRoZXIgdGhlIGdvYWwgc3RheXMgaW4gb25lIHNwb3Qgb3IgbW92ZXMgYXQgbGV2ZWwncyBzcGVlZFxuICAqIGdvYWwuc3VjY2Vzc0NvbmRpdGlvblxuICAqIC0gY29uZGl0aW9uKHMpLCB3aGljaCBpZiB0cnVlIGF0IGFueSBwb2ludCwgaW5kaWNhdGUgdXNlciBoYXMgc3VjY2Vzc2Z1bGx5XG4gICogICBjb21wbGV0ZWQgdGhlIHB1enpsZVxuICAqIGdvYWwuZmFpbHVyZUNvbmRpdGlvblxuICAqIC0gY29uZGl0aW9uKHMpLCB3aGljaCBpZiB0cnVlIGF0IGFueSBwb2ludCwgaW5kaWNhdGVzIHRoZSBwdXp6bGUgaXNcbiAgICAgIGNvbXBsZXRlIChpbmRpY2F0aW5nIGZhaWx1cmUgaWYgc3VjY2VzcyBjb25kaXRpb24gbm90IG1ldClcbiAgKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICcxJzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFt7J3Rlc3QnOiAnZmxhcCcsICd0eXBlJzogJ2ZsYXBweV9mbGFwJ31dXG4gICAgXSxcbiAgICAnb2JzdGFjbGVzJzogZmFsc2UsXG4gICAgJ2dyb3VuZCc6IGZhbHNlLFxuICAgICdzY29yZSc6IGZhbHNlLFxuICAgICdmcmVlUGxheSc6IGZhbHNlLFxuICAgICdnb2FsJzoge1xuICAgICAgc3RhcnRYICA6IDEwMCxcbiAgICAgIHN0YXJ0WTogMCxcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIChGbGFwcHkuYXZhdGFyWSAgPD0gNDApO1xuICAgICAgfSxcbiAgICAgIGZhaWx1cmVDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIEZsYXBweS5hdmF0YXJZID4gRmxhcHB5Lk1BWkVfSEVJR0hUO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YihmbGFwQmxvY2sgKyBwbGF5U291bmRCbG9jayksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snKSxcbiAgICAnYXBwU3BlY2lmaWNGYWlsRXJyb3InOlxuICAgICAgZmxhcHB5TXNnLmZsYXBweVNwZWNpZmljRmFpbCgpXG4gIH0sXG5cbiAgJzInOiB7XG4gICAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgICAgW3sndGVzdCc6ICdlbmRHYW1lJywgJ3R5cGUnOiAnZmxhcHB5X2VuZEdhbWUnfV1cbiAgICBdLFxuICAgICdvYnN0YWNsZXMnOiBmYWxzZSxcbiAgICAnZ3JvdW5kJzogdHJ1ZSxcbiAgICAnc2NvcmUnOiBmYWxzZSxcbiAgICAnZnJlZVBsYXknOiBmYWxzZSxcbiAgICAnZ29hbCc6IHtcbiAgICAgIHN0YXJ0WDogMTAwLFxuICAgICAgc3RhcnRZOiA0MDAgLSA0OCAtIDU2IC8gMixcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gdGhpcyBvbmx5IGhhcHBlbnMgYWZ0ZXIgYXZhdGFyIGhpdHMgZ3JvdW5kLCBhbmQgd2Ugc3BpbiBoaW0gYmVjYXVzZSBvZlxuICAgICAgICAvLyBnYW1lIG92ZXJcbiAgICAgICAgcmV0dXJuIChGbGFwcHkuYXZhdGFyWSAgPT09IDMyMiAmJiBGbGFwcHkuYXZhdGFyWCA9PT0gMTEwKTtcbiAgICAgIH0sXG4gICAgICBmYWlsdXJlQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhdmF0YXJCb3R0b20gPSBGbGFwcHkuYXZhdGFyWSArIEFWQVRBUl9IRUlHSFQ7XG4gICAgICAgIHZhciBncm91bmQgPSBGbGFwcHkuTUFaRV9IRUlHSFQgLSBGbGFwcHkuR1JPVU5EX0hFSUdIVDtcbiAgICAgICAgcmV0dXJuIChhdmF0YXJCb3R0b20gPj0gZ3JvdW5kICYmIEZsYXBweS5nYW1lU3RhdGUgPT09IEZsYXBweS5HYW1lU3RhdGVzLkFDVElWRSk7XG4gICAgICB9XG4gICAgfSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKGZsYXBCbG9jayArIGVuZEdhbWVCbG9jayArIHBsYXlTb3VuZEJsb2NrKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycsIGZsYXBCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kJylcbiAgfSxcblxuICAnMyc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ3NldFNwZWVkJywgJ3R5cGUnOiAnZmxhcHB5X3NldFNwZWVkJ31dXG4gICAgXSxcbiAgICAnb2JzdGFjbGVzJzogZmFsc2UsXG4gICAgJ2dyb3VuZCc6IHRydWUsXG4gICAgJ3Njb3JlJzogZmFsc2UsXG4gICAgJ2ZyZWVQbGF5JzogZmFsc2UsXG4gICAgJ2dvYWwnOiB7XG4gICAgICBzdGFydFg6IDQwMCAtIDU1LFxuICAgICAgc3RhcnRZOiAwLFxuICAgICAgbW92aW5nOiB0cnVlLFxuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXZhdGFyQ2VudGVyID0ge1xuICAgICAgICAgIHg6IChGbGFwcHkuYXZhdGFyWCArIEFWQVRBUl9XSURUSCkgLyAyLFxuICAgICAgICAgIHk6IChGbGFwcHkuYXZhdGFyWSArIEFWQVRBUl9IRUlHSFQpIC8gMlxuICAgICAgICB9O1xuICAgICAgICB2YXIgZ29hbENlbnRlciA9IHtcbiAgICAgICAgICB4OiAoRmxhcHB5LmdvYWxYICsgRmxhcHB5LkdPQUxfU0laRSkgLyAyLFxuICAgICAgICAgIHk6IChGbGFwcHkuZ29hbFkgKyBGbGFwcHkuR09BTF9TSVpFKSAvIDJcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgZGlmZiA9IHtcbiAgICAgICAgICB4OiBNYXRoLmFicyhhdmF0YXJDZW50ZXIueCAtIGdvYWxDZW50ZXIueCksXG4gICAgICAgICAgeTogTWF0aC5hYnMoYXZhdGFyQ2VudGVyLnkgLSBnb2FsQ2VudGVyLnkpXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGRpZmYueCA8IDE1ICYmIGRpZmYueSA8IDE1O1xuICAgICAgfSxcbiAgICAgIGZhaWx1cmVDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIEZsYXBweS5hY3RpdmVUaWNrcygpID49IDEyMCAmJiBGbGFwcHkuU1BFRUQgPT09IDA7XG4gICAgICB9XG4gICAgfSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKGZsYXBCbG9jayArIHBsYXlTb3VuZEJsb2NrICsgc2V0U3BlZWRCbG9jayksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snLCBmbGFwQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJylcbiAgfSxcblxuICAnNCc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ2VuZEdhbWUnLCAndHlwZSc6ICdmbGFwcHlfZW5kR2FtZSd9XVxuICAgIF0sXG4gICAgJ29ic3RhY2xlcyc6IHRydWUsXG4gICAgJ2dyb3VuZCc6IHRydWUsXG4gICAgJ3Njb3JlJzogZmFsc2UsXG4gICAgJ2ZyZWVQbGF5JzogZmFsc2UsXG4gICAgJ2dvYWwnOiB7XG4gICAgICBzdGFydFg6IDYwMCAtICg1NiAvIDIpLFxuICAgICAgc3RhcnRZOiA0MDAgLSA0OCAtIDU2IC8gMixcbiAgICAgIG1vdmluZzogdHJ1ZSxcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIEZsYXBweS5vYnN0YWNsZXNbMF0uaGl0QXZhdGFyICYmXG4gICAgICAgICAgRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuT1ZFUjtcbiAgICAgIH0sXG4gICAgICBmYWlsdXJlQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHRvZG8gLSB3b3VsZCBiZSBuaWNlIGlmIHdlIGNvdWxkIGRpc3Rpbmd1aXNoIGZlZWRiYWNrIGZvclxuICAgICAgICAvLyBmbGV3IHRocm91Z2ggcGlwZSB2cy4gZGlkbnQgaG9vayB1cCBlbmRHYW1lIGJsb2NrXG4gICAgICAgIHZhciBvYnN0YWNsZUVuZCA9IEZsYXBweS5vYnN0YWNsZXNbMF0ueCArIEZsYXBweS5PQlNUQUNMRV9XSURUSDtcbiAgICAgICAgcmV0dXJuIG9ic3RhY2xlRW5kIDwgRmxhcHB5LmF2YXRhclg7XG4gICAgICB9XG4gICAgfSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKGZsYXBCbG9jayArIGVuZEdhbWVCbG9jayArIHBsYXlTb3VuZEJsb2NrICsgc2V0U3BlZWRCbG9jayksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snLCBmbGFwQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJywgc2V0U3BlZWRCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnKVxuICB9LFxuXG4gICc1Jzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFt7J3Rlc3QnOiAnaW5jcmVtZW50UGxheWVyU2NvcmUnLCAndHlwZSc6ICdmbGFwcHlfaW5jcmVtZW50UGxheWVyU2NvcmUnfV1cbiAgICBdLFxuICAgICdkZWZhdWx0RmxhcCc6ICdTTUFMTCcsXG4gICAgJ29ic3RhY2xlcyc6IHRydWUsXG4gICAgJ2dyb3VuZCc6IHRydWUsXG4gICAgJ3Njb3JlJzogdHJ1ZSxcbiAgICAnZnJlZVBsYXknOiBmYWxzZSxcbiAgICAnZ29hbCc6IHtcbiAgICAgIC8vIHRvZG8gLSBraW5kIG9mIHVnbHkgdGhhdCB3ZSBlbmQgdXAgbG9vcGluIHRocm91Z2ggYWxsIG9ic3RhY2xlcyB0d2ljZSxcbiAgICAgIC8vIG9uY2UgdG8gY2hlY2sgZm9yIHN1Y2Nlc3MgYW5kIGFnYWluIHRvIGNoZWNrIGZvciBmYWlsdXJlXG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbnNpZGVPYnN0YWNsZSA9IGZhbHNlO1xuICAgICAgICBGbGFwcHkub2JzdGFjbGVzLmZvckVhY2goZnVuY3Rpb24gKG9ic3RhY2xlKSB7XG4gICAgICAgICAgaWYgKCFvYnN0YWNsZS5oaXRBdmF0YXIgJiYgb2JzdGFjbGUuY29udGFpbnNBdmF0YXIoKSkge1xuICAgICAgICAgICAgaW5zaWRlT2JzdGFjbGUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBpbnNpZGVPYnN0YWNsZSAmJiBGbGFwcHkucGxheWVyU2NvcmUgPiAwO1xuICAgICAgfSxcbiAgICAgIGZhaWx1cmVDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGluc2lkZU9ic3RhY2xlID0gZmFsc2U7XG4gICAgICAgIEZsYXBweS5vYnN0YWNsZXMuZm9yRWFjaChmdW5jdGlvbiAob2JzdGFjbGUpIHtcbiAgICAgICAgICBpZiAoIW9ic3RhY2xlLmhpdEF2YXRhciAmJiBvYnN0YWNsZS5jb250YWluc0F2YXRhcigpKSB7XG4gICAgICAgICAgICBpbnNpZGVPYnN0YWNsZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGluc2lkZU9ic3RhY2xlICYmIEZsYXBweS5wbGF5ZXJTY29yZSA9PT0gMDtcbiAgICAgIH1cbiAgICB9LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoZmxhcEJsb2NrICsgZW5kR2FtZUJsb2NrICsgaW5jcmVtZW50U2NvcmVCbG9jayArIHBsYXlTb3VuZEJsb2NrICsgc2V0U3BlZWRCbG9jayksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snLCBmbGFwQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScpICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJywgc2V0U3BlZWRCbG9jaylcbiAgfSxcblxuICAnNic6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ2ZsYXAnLCAndHlwZSc6ICdmbGFwcHlfZmxhcF9oZWlnaHQnfV1cbiAgICBdLFxuICAgICdvYnN0YWNsZXMnOiB0cnVlLFxuICAgICdncm91bmQnOiB0cnVlLFxuICAgICdzY29yZSc6IHRydWUsXG4gICAgJ2ZyZWVQbGF5JzogZmFsc2UsXG4gICAgJ2dvYWwnOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbnNpZGVPYnN0YWNsZSA9IGZhbHNlO1xuICAgICAgICBGbGFwcHkub2JzdGFjbGVzLmZvckVhY2goZnVuY3Rpb24gKG9ic3RhY2xlKSB7XG4gICAgICAgICAgaWYgKG9ic3RhY2xlLmNvbnRhaW5zQXZhdGFyKCkpIHtcbiAgICAgICAgICAgIGluc2lkZU9ic3RhY2xlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaW5zaWRlT2JzdGFjbGUgJiYgRmxhcHB5LnBsYXllclNjb3JlID4gMDtcbiAgICAgIH0sXG4gICAgICBmYWlsdXJlQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbnNpZGVPYnN0YWNsZSA9IGZhbHNlO1xuICAgICAgICBGbGFwcHkub2JzdGFjbGVzLmZvckVhY2goZnVuY3Rpb24gKG9ic3RhY2xlKSB7XG4gICAgICAgICAgaWYgKG9ic3RhY2xlLmNvbnRhaW5zQXZhdGFyKCkpIHtcbiAgICAgICAgICAgIGluc2lkZU9ic3RhY2xlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaW5zaWRlT2JzdGFjbGUgJiYgRmxhcHB5LnBsYXllclNjb3JlID09PSAwO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YihmbGFwSGVpZ2h0QmxvY2sgKyBlbmRHYW1lQmxvY2sgKyBpbmNyZW1lbnRTY29yZUJsb2NrICsgcGxheVNvdW5kQmxvY2sgKyBzZXRTcGVlZEJsb2NrKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycpICtcbiAgICAgIC8vIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZUdyb3VuZCcsIGVuZEdhbWVCbG9jaykgK1xuICAgICAgLy8gZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnLCBlbmRHYW1lQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScsIGluY3JlbWVudFNjb3JlQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJywgc2V0U3BlZWRCbG9jaylcbiAgfSxcblxuICAnNyc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbeyd0ZXN0JzogJ3NldEJhY2tncm91bmQnLCAndHlwZSc6ICdmbGFwcHlfc2V0QmFja2dyb3VuZCd9XVxuICAgIF0sXG4gICAgJ29ic3RhY2xlcyc6IHRydWUsXG4gICAgJ2dyb3VuZCc6IHRydWUsXG4gICAgJ3Njb3JlJzogdHJ1ZSxcbiAgICAnZnJlZVBsYXknOiBmYWxzZSxcbiAgICAnZ29hbCc6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIChGbGFwcHkuZ2FtZVN0YXRlID09PSBGbGFwcHkuR2FtZVN0YXRlcy5PVkVSKTtcbiAgICAgIH1cbiAgICB9LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoZmxhcEhlaWdodEJsb2NrICsgZW5kR2FtZUJsb2NrICsgaW5jcmVtZW50U2NvcmVCbG9jayArIHBsYXlTb3VuZEJsb2NrICtcbiAgICAgICAgc2V0U3BlZWRCbG9jayArIHNldEJhY2tncm91bmRCbG9jayksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snLCBmbGFwSGVpZ2h0QmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZUdyb3VuZCcsIGVuZEdhbWVCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnLCBlbmRHYW1lQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScsIGluY3JlbWVudFNjb3JlQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJywgc2V0U3BlZWRCbG9jaylcbiAgfSxcblxuICAnOCc6IHtcbiAgICAncmVxdWlyZWRCbG9ja3MnOiBbXG4gICAgICBbe1xuICAgICAgICB0ZXN0OiBmdW5jdGlvbiAoYmxvY2spIHtcbiAgICAgICAgICByZXR1cm4gKGJsb2NrLnR5cGUgPT09ICdmbGFwcHlfc2V0QmFja2dyb3VuZCcgfHxcbiAgICAgICAgICAgIGJsb2NrLnR5cGUgPT09ICdmbGFwcHlfc2V0UGxheWVyJykgJiZcbiAgICAgICAgICAgIGJsb2NrLmdldFRpdGxlVmFsdWUoJ1ZBTFVFJykgPT09ICdyYW5kb20nO1xuICAgICAgICB9LFxuICAgICAgICB0eXBlOiAnZmxhcHB5X3NldEJhY2tncm91bmQnLFxuICAgICAgICB0aXRsZXM6IHtcbiAgICAgICAgICAnVkFMVUUnOiAncmFuZG9tJ1xuICAgICAgICB9XG4gICAgICB9XVxuICAgIF0sXG4gICAgJ29ic3RhY2xlcyc6IHRydWUsXG4gICAgJ2dyb3VuZCc6IHRydWUsXG4gICAgJ3Njb3JlJzogdHJ1ZSxcbiAgICAnZnJlZVBsYXknOiBmYWxzZSxcbiAgICAnZ29hbCc6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIChGbGFwcHkuZ2FtZVN0YXRlID09PSBGbGFwcHkuR2FtZVN0YXRlcy5PVkVSKTtcbiAgICAgIH1cbiAgICB9LFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoZmxhcEhlaWdodEJsb2NrICsgZW5kR2FtZUJsb2NrICsgaW5jcmVtZW50U2NvcmVCbG9jayArIHBsYXlTb3VuZEJsb2NrICtcbiAgICAgICAgc2V0U3BlZWRCbG9jayArIHNldEJhY2tncm91bmRCbG9jayArIHNldFBsYXllckJsb2NrKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycsIGZsYXBIZWlnaHRCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kJywgZW5kR2FtZUJsb2NrKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZScsIGVuZEdhbWVCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5FbnRlck9ic3RhY2xlJywgaW5jcmVtZW50U2NvcmVCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnd2hlbl9ydW4nLCBzZXRTcGVlZEJsb2NrKVxuICB9LFxuXG4gICc5Jzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICAgIFt7XG4gICAgICAgIHRlc3Q6IGZ1bmN0aW9uIChibG9jaykge1xuICAgICAgICAgIHJldHVybiBibG9jay50eXBlID09PSAnZmxhcHB5X3NldFNjb3JlJztcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZTogJ2ZsYXBweV9zZXRTY29yZSdcbiAgICAgIH1dXG4gICAgXSxcbiAgICAnb2JzdGFjbGVzJzogdHJ1ZSxcbiAgICAnZ3JvdW5kJzogdHJ1ZSxcbiAgICAnc2NvcmUnOiB0cnVlLFxuICAgICdmcmVlUGxheSc6IGZhbHNlLFxuICAgICdnb2FsJzoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gKEZsYXBweS5nYW1lU3RhdGUgPT09IEZsYXBweS5HYW1lU3RhdGVzLk9WRVIpO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ3NjYWxlJzoge1xuICAgICAgJ3NuYXBSYWRpdXMnOiAyXG4gICAgfSxcbiAgICAndG9vbGJveCc6XG4gICAgICB0YihmbGFwSGVpZ2h0QmxvY2sgKyBlbmRHYW1lQmxvY2sgKyBpbmNyZW1lbnRTY29yZUJsb2NrICsgcGxheVNvdW5kQmxvY2sgK1xuICAgICAgICBzZXRTcGVlZEJsb2NrICsgc2V0QmFja2dyb3VuZEJsb2NrICsgc2V0UGxheWVyQmxvY2sgKyBzZXRTY29yZUJsb2NrKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycsIGZsYXBIZWlnaHRCbG9jaykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kJywgZW5kR2FtZUJsb2NrKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZScpICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScsIGluY3JlbWVudFNjb3JlQmxvY2spICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJywgc2V0U3BlZWRCbG9jaylcbiAgfSxcblxuICAnMTEnOiB7XG4gICAgc2hhcmVhYmxlOiB0cnVlLFxuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICBdLFxuICAgICdvYnN0YWNsZXMnOiB0cnVlLFxuICAgICdncm91bmQnOiB0cnVlLFxuICAgICdzY29yZSc6IHRydWUsXG4gICAgJ2ZyZWVQbGF5JzogdHJ1ZSxcbiAgICAnc2NhbGUnOiB7XG4gICAgICAnc25hcFJhZGl1cyc6IDJcbiAgICB9LFxuICAgICd0b29sYm94JzpcbiAgICAgIHRiKFxuICAgICAgICBmbGFwSGVpZ2h0QmxvY2sgK1xuICAgICAgICBwbGF5U291bmRCbG9jayArXG4gICAgICAgIGluY3JlbWVudFNjb3JlQmxvY2sgK1xuICAgICAgICBlbmRHYW1lQmxvY2sgK1xuICAgICAgICBzZXRTcGVlZEJsb2NrICtcbiAgICAgICAgc2V0QmFja2dyb3VuZEJsb2NrICtcbiAgICAgICAgc2V0UGxheWVyQmxvY2sgK1xuICAgICAgICBzZXRPYnN0YWNsZUJsb2NrICtcbiAgICAgICAgc2V0R3JvdW5kQmxvY2sgK1xuICAgICAgICBzZXRHYXBIZWlnaHRCbG9jayArXG4gICAgICAgIHNldEdyYXZpdHlCbG9jayArXG4gICAgICAgIHNldFNjb3JlQmxvY2tcbiAgICAgICksXG4gICAgJ3N0YXJ0QmxvY2tzJzpcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ2xpY2snKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVHcm91bmQnKSArXG4gICAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZScpICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScpICtcbiAgICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJylcbiAgfSxcbiAgJ2sxJzoge1xuICAgICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICBdLFxuICAgICdvYnN0YWNsZXMnOiB0cnVlLFxuICAgICdncm91bmQnOiB0cnVlLFxuICAgICdzY29yZSc6IHRydWUsXG4gICAgJ2ZyZWVQbGF5JzogdHJ1ZSxcbiAgICBpc0sxOiB0cnVlLFxuICAgICdzY2FsZSc6IHtcbiAgICAgICdzbmFwUmFkaXVzJzogMlxuICAgIH0sXG4gICAgJ3Rvb2xib3gnOlxuICAgICAgdGIoXG4gICAgICAgIGZsYXBCbG9jayArXG4gICAgICAgIGVuZEdhbWVCbG9jayArXG4gICAgICAgIHNldEJhY2tncm91bmRCbG9jayArXG4gICAgICAgIHNldFBsYXllckJsb2NrICtcbiAgICAgICAgc2V0T2JzdGFjbGVCbG9jayArXG4gICAgICAgIHNldEdyb3VuZEJsb2NrICtcbiAgICAgICAgcGxheVNvdW5kQmxvY2sgK1xuICAgICAgICBmbGFwSGVpZ2h0QmxvY2sgK1xuICAgICAgICBzZXRTcGVlZEJsb2NrICtcbiAgICAgICAgaW5jcmVtZW50U2NvcmVCbG9jayArXG4gICAgICAgIHNldEdhcEhlaWdodEJsb2NrICtcbiAgICAgICAgc2V0R3Jhdml0eUJsb2NrICtcbiAgICAgICAgc2V0U2NvcmVCbG9ja1xuICAgICAgKSxcbiAgICAnc3RhcnRCbG9ja3MnOlxuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycpICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZUdyb3VuZCcpICtcbiAgICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZU9ic3RhY2xlJykgK1xuICAgICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5FbnRlck9ic3RhY2xlJykgK1xuICAgICAgZXZlbnRCbG9jaygnd2hlbl9ydW4nKVxuICB9XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzLmsxXzEgPSB7XG4gICdpc0sxJzogdHJ1ZSxcbiAgZ3JheU91dFVuZGVsZXRhYmxlQmxvY2tzOiB0cnVlLFxuICAncmVxdWlyZWRCbG9ja3MnOiBbXSxcbiAgJ29ic3RhY2xlcyc6IHRydWUsXG4gICdncm91bmQnOiB0cnVlLFxuICAnc2NvcmUnOiB0cnVlLFxuICAnZnJlZVBsYXknOiB0cnVlLFxuICAnc2NhbGUnOiB7XG4gICAgJ3NuYXBSYWRpdXMnOiAyXG4gIH0sXG4gICd0b29sYm94JzogJycsXG4gICdzdGFydEJsb2Nrcyc6XG4gICAgYW5jaG9yZWRCbG9jaygnZmxhcHB5X3doZW5DbGljaycsIGFuY2hvcmVkQmxvY2soJ2ZsYXBweV9mbGFwJykpICtcbiAgICBhbmNob3JlZEJsb2NrKCdmbGFwcHlfd2hlbkNvbGxpZGVHcm91bmQnLCBhbmNob3JlZEJsb2NrKCdmbGFwcHlfZW5kR2FtZScpKSArXG4gICAgYW5jaG9yZWRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnLCBhbmNob3JlZEJsb2NrKCdmbGFwcHlfZW5kR2FtZScpKSArXG4gICAgYW5jaG9yZWRCbG9jaygnZmxhcHB5X3doZW5FbnRlck9ic3RhY2xlJywgYW5jaG9yZWRCbG9jaygnZmxhcHB5X2luY3JlbWVudFBsYXllclNjb3JlJykpICtcbiAgICBhbmNob3JlZEJsb2NrKCd3aGVuX3J1bicsIGFuY2hvcmVkQmxvY2soJ2ZsYXBweV9zZXRTcGVlZCcpKVxufTtcblxuLy8gZmxhcCB0byBnb2FsXG5tb2R1bGUuZXhwb3J0cy5rMV8yID0gdXRpbHMuZXh0ZW5kKG1vZHVsZS5leHBvcnRzWycxJ10sIHsgJ2lzSzEnOiB0cnVlfSk7XG5cbi8vIGhpdCBncm91bmRcbm1vZHVsZS5leHBvcnRzLmsxXzMgPSB1dGlscy5leHRlbmQobW9kdWxlLmV4cG9ydHNbJzInXSwgeyAnaXNLMSc6IHRydWV9KTtcblxuLy8gc2V0IHNwZWVkXG5tb2R1bGUuZXhwb3J0cy5rMV80ID0gdXRpbHMuZXh0ZW5kKG1vZHVsZS5leHBvcnRzWyczJ10sIHsgJ2lzSzEnOiB0cnVlfSk7XG5cbi8vIGNyYXNoIGludG8gb2JzdGFjbGVcbm1vZHVsZS5leHBvcnRzLmsxXzUgPSB1dGlscy5leHRlbmQobW9kdWxlLmV4cG9ydHNbJzQnXSwgeyAnaXNLMSc6IHRydWV9KTtcblxuLy8gcGFzcyB0aHJvdWdoIG9ic3RhY2xlLCBzY29yZSBhIHBvaW50XG5tb2R1bGUuZXhwb3J0cy5rMV82ID0gdXRpbHMuZXh0ZW5kKG1vZHVsZS5leHBvcnRzWyc1J10sIHsgJ2lzSzEnOiB0cnVlfSk7XG5cbi8vIHNjb3JlIG11bHRpcGxlIHBvaW50cyBmb3IgZWFjaCBwYXNzXG5tb2R1bGUuZXhwb3J0cy5rMV83ID0ge1xuICAnaXNLMSc6IHRydWUsXG4gICdyZXF1aXJlZEJsb2Nrcyc6IFtcbiAgICBbeyd0ZXN0JzogJ2luY3JlbWVudFBsYXllclNjb3JlJywgJ3R5cGUnOiAnZmxhcHB5X2luY3JlbWVudFBsYXllclNjb3JlJ31dXG4gIF0sXG4gICdkZWZhdWx0RmxhcCc6ICdTTUFMTCcsXG4gICdvYnN0YWNsZXMnOiB0cnVlLFxuICAnZ3JvdW5kJzogdHJ1ZSxcbiAgJ3Njb3JlJzogdHJ1ZSxcbiAgJ2ZyZWVQbGF5JzogZmFsc2UsXG4gICdnb2FsJzoge1xuICAgIC8vIHRvZG8gLSBraW5kIG9mIHVnbHkgdGhhdCB3ZSBlbmQgdXAgbG9vcGluIHRocm91Z2ggYWxsIG9ic3RhY2xlcyB0d2ljZSxcbiAgICAvLyBvbmNlIHRvIGNoZWNrIGZvciBzdWNjZXNzIGFuZCBhZ2FpbiB0byBjaGVjayBmb3IgZmFpbHVyZVxuICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpbnNpZGVPYnN0YWNsZSA9IGZhbHNlO1xuICAgICAgRmxhcHB5Lm9ic3RhY2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChvYnN0YWNsZSkge1xuICAgICAgICBpZiAoIW9ic3RhY2xlLmhpdEF2YXRhciAmJiBvYnN0YWNsZS5jb250YWluc0F2YXRhcigpKSB7XG4gICAgICAgICAgaW5zaWRlT2JzdGFjbGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBpbnNpZGVPYnN0YWNsZSAmJiBGbGFwcHkucGxheWVyU2NvcmUgPiAxO1xuICAgIH0sXG4gICAgZmFpbHVyZUNvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGluc2lkZU9ic3RhY2xlID0gZmFsc2U7XG4gICAgICBGbGFwcHkub2JzdGFjbGVzLmZvckVhY2goZnVuY3Rpb24gKG9ic3RhY2xlKSB7XG4gICAgICAgIGlmICghb2JzdGFjbGUuaGl0QXZhdGFyICYmIG9ic3RhY2xlLmNvbnRhaW5zQXZhdGFyKCkpIHtcbiAgICAgICAgICBpbnNpZGVPYnN0YWNsZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGluc2lkZU9ic3RhY2xlICYmIEZsYXBweS5wbGF5ZXJTY29yZSA8PSAxO1xuICAgIH1cbiAgfSxcbiAgJ3NjYWxlJzoge1xuICAgICdzbmFwUmFkaXVzJzogMlxuICB9LFxuICAndG9vbGJveCc6XG4gICAgdGIoZmxhcEJsb2NrICsgZW5kR2FtZUJsb2NrICsgaW5jcmVtZW50U2NvcmVCbG9jayArIHBsYXlTb3VuZEJsb2NrICsgc2V0U3BlZWRCbG9jayksXG4gICdzdGFydEJsb2Nrcyc6XG4gICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycsIGZsYXBCbG9jaykgK1xuICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZScpICtcbiAgICBldmVudEJsb2NrKCd3aGVuX3J1bicsIHNldFNwZWVkQmxvY2spXG59O1xuXG4vLyBjaGFuZ2UgdGhlIHNjZW5lXG5tb2R1bGUuZXhwb3J0cy5rMV84ID0gdXRpbHMuZXh0ZW5kKG1vZHVsZS5leHBvcnRzWyc3J10sIHtcbiAgJ2lzSzEnOiB0cnVlLFxuICAvLyBvdmVycmlkZSByZWd1bGFyIGZsYXBweSBzbyB0aGF0IHdlIGRvbnQgdXNlIHZhcmlhYmxlIGZsYXAgYmxvY2tcbiAgJ3Rvb2xib3gnOlxuICAgIHRiKGZsYXBCbG9jayArIGVuZEdhbWVCbG9jayArIGluY3JlbWVudFNjb3JlQmxvY2sgKyBwbGF5U291bmRCbG9jayArXG4gICAgICBzZXRTcGVlZEJsb2NrICsgc2V0QmFja2dyb3VuZEJsb2NrKSxcbiAgJ3N0YXJ0QmxvY2tzJzpcbiAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkNsaWNrJywgZmxhcEJsb2NrKSArXG4gICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kJywgZW5kR2FtZUJsb2NrKSArXG4gICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnLCBlbmRHYW1lQmxvY2spICtcbiAgICBldmVudEJsb2NrKCdmbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUnLCBpbmNyZW1lbnRTY29yZUJsb2NrKSArXG4gICAgZXZlbnRCbG9jaygnd2hlbl9ydW4nLCBzZXRTcGVlZEJsb2NrKVxufSk7XG5cbi8vIGNoYW5naW5nIHRoZSBwbGF5ZXJcbm1vZHVsZS5leHBvcnRzLmsxXzkgPSB7XG4gICdpc0sxJzogdHJ1ZSxcbiAgJ3JlcXVpcmVkQmxvY2tzJzogW1xuICAgIFt7J3Rlc3QnOiAnc2V0UGxheWVyJywgJ3R5cGUnOiAnZmxhcHB5X3NldFBsYXllcid9XVxuICBdLFxuICAnb2JzdGFjbGVzJzogdHJ1ZSxcbiAgJ2dyb3VuZCc6IHRydWUsXG4gICdzY29yZSc6IHRydWUsXG4gICdmcmVlUGxheSc6IGZhbHNlLFxuICAnZ29hbCc6IHtcbiAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gKEZsYXBweS5nYW1lU3RhdGUgPT09IEZsYXBweS5HYW1lU3RhdGVzLk9WRVIpO1xuICAgIH1cbiAgfSxcbiAgJ3NjYWxlJzoge1xuICAgICdzbmFwUmFkaXVzJzogMlxuICB9LFxuICAndG9vbGJveCc6XG4gICAgdGIoZmxhcEJsb2NrICsgZW5kR2FtZUJsb2NrICsgaW5jcmVtZW50U2NvcmVCbG9jayArIHBsYXlTb3VuZEJsb2NrICtcbiAgICAgIHNldFNwZWVkQmxvY2sgKyBzZXRCYWNrZ3JvdW5kQmxvY2sgKyBzZXRQbGF5ZXJCbG9jayksXG4gICdzdGFydEJsb2Nrcyc6XG4gICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5DbGljaycsIGZsYXBCbG9jaykgK1xuICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZUdyb3VuZCcsIGVuZEdhbWVCbG9jaykgK1xuICAgIGV2ZW50QmxvY2soJ2ZsYXBweV93aGVuQ29sbGlkZU9ic3RhY2xlJywgZW5kR2FtZUJsb2NrKSArXG4gICAgZXZlbnRCbG9jaygnZmxhcHB5X3doZW5FbnRlck9ic3RhY2xlJywgaW5jcmVtZW50U2NvcmVCbG9jaykgK1xuICAgIGV2ZW50QmxvY2soJ3doZW5fcnVuJywgc2V0U3BlZWRCbG9jaylcbn07XG4iLCIvKipcbiAqIEJsb2NrbHkgQXBwOiBGbGFwcHlcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMyBDb2RlLm9yZ1xuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHVkaW9BcHAgPSByZXF1aXJlKCcuLi9TdHVkaW9BcHAnKS5zaW5nbGV0b247XG52YXIgY29tbW9uTXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJyk7XG52YXIgZmxhcHB5TXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG52YXIgY29kZWdlbiA9IHJlcXVpcmUoJy4uL2NvZGVnZW4nKTtcbnZhciBhcGkgPSByZXF1aXJlKCcuL2FwaScpO1xudmFyIEFwcFZpZXcgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvQXBwVmlldy5qc3gnKTtcbnZhciBjb2RlV29ya3NwYWNlRWpzID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL2NvZGVXb3Jrc3BhY2UuaHRtbC5lanMnKTtcbnZhciB2aXN1YWxpemF0aW9uQ29sdW1uRWpzID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3Zpc3VhbGl6YXRpb25Db2x1bW4uaHRtbC5lanMnKTtcbnZhciBkb20gPSByZXF1aXJlKCcuLi9kb20nKTtcbnZhciBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBkcm9wbGV0VXRpbHMgPSByZXF1aXJlKCcuLi9kcm9wbGV0VXRpbHMnKTtcblxudmFyIFJlc3VsdFR5cGUgPSBzdHVkaW9BcHAuUmVzdWx0VHlwZTtcbnZhciBUZXN0UmVzdWx0cyA9IHN0dWRpb0FwcC5UZXN0UmVzdWx0cztcblxuLyoqXG4gKiBDcmVhdGUgYSBuYW1lc3BhY2UgZm9yIHRoZSBhcHBsaWNhdGlvbi5cbiAqL1xudmFyIEZsYXBweSA9IG1vZHVsZS5leHBvcnRzO1xuXG5GbGFwcHkuR2FtZVN0YXRlcyA9IHtcbiAgV0FJVElORzogMCxcbiAgQUNUSVZFOiAxLFxuICBFTkRJTkc6IDIsXG4gIE9WRVI6IDNcbn07XG5cbkZsYXBweS5nYW1lU3RhdGUgPSBGbGFwcHkuR2FtZVN0YXRlcy5XQUlUSU5HO1xuXG5GbGFwcHkuY2xpY2tQZW5kaW5nID0gZmFsc2U7XG5cbkZsYXBweS5hdmF0YXJWZWxvY2l0eSA9IDA7XG5cbnZhciBsZXZlbDtcbnZhciBza2luO1xuXG5GbGFwcHkub2JzdGFjbGVzID0gW107XG5cbi8qKlxuICogTWlsbGlzZWNvbmRzIGJldHdlZW4gZWFjaCBhbmltYXRpb24gZnJhbWUuXG4gKi9cbnZhciBzdGVwU3BlZWQ7XG5cbi8vIHdoZXRoZXIgdG8gc2hvdyBHZXQgUmVhZHkgYW5kIEdhbWUgT3ZlclxudmFyIGluZm9UZXh0O1xuXG4vL1RPRE86IE1ha2UgY29uZmlndXJhYmxlLlxuc3R1ZGlvQXBwLnNldENoZWNrRm9yRW1wdHlCbG9ja3ModHJ1ZSk7XG5cbnZhciByYW5kb21PYnN0YWNsZUhlaWdodCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1pbiA9IEZsYXBweS5NSU5fT0JTVEFDTEVfSEVJR0hUO1xuICB2YXIgbWF4ID0gRmxhcHB5Lk1BWkVfSEVJR0hUIC0gRmxhcHB5LkdST1VORF9IRUlHSFQgLSBGbGFwcHkuTUlOX09CU1RBQ0xFX0hFSUdIVCAtIEZsYXBweS5HQVBfU0laRTtcbiAgcmV0dXJuIE1hdGguZmxvb3IoKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW4pO1xufTtcblxuLy9UaGUgbnVtYmVyIG9mIGJsb2NrcyB0byBzaG93IGFzIGZlZWRiYWNrLlxuXG4vLyBEZWZhdWx0IFNjYWxpbmdzXG5GbGFwcHkuc2NhbGUgPSB7XG4gICdzbmFwUmFkaXVzJzogMSxcbiAgJ3N0ZXBTcGVlZCc6IDMzXG59O1xuXG52YXIgdHdpdHRlck9wdGlvbnMgPSB7XG4gIHRleHQ6IGZsYXBweU1zZy5zaGFyZUZsYXBweVR3aXR0ZXIoKSxcbiAgaGFzaHRhZzogXCJGbGFwcHlDb2RlXCJcbn07XG5cbnZhciBBVkFUQVJfSEVJR0hUID0gY29uc3RhbnRzLkFWQVRBUl9IRUlHSFQ7XG52YXIgQVZBVEFSX1dJRFRIID0gY29uc3RhbnRzLkFWQVRBUl9XSURUSDtcbnZhciBBVkFUQVJfWV9PRkZTRVQgPSBjb25zdGFudHMuQVZBVEFSX1lfT0ZGU0VUO1xuXG52YXIgbG9hZExldmVsID0gZnVuY3Rpb24oKSB7XG4gIC8vIExvYWQgbWFwcy5cbiAgaW5mb1RleHQgPSB1dGlscy52YWx1ZU9yKGxldmVsLmluZm9UZXh0LCB0cnVlKTtcbiAgaWYgKCFpbmZvVGV4dCkge1xuICAgIEZsYXBweS5nYW1lU3RhdGUgPSBGbGFwcHkuR2FtZVN0YXRlcy5BQ1RJVkU7XG4gIH1cblxuICAvLyBPdmVycmlkZSBzY2FsYXJzLlxuICBmb3IgKHZhciBrZXkgaW4gbGV2ZWwuc2NhbGUpIHtcbiAgICBGbGFwcHkuc2NhbGVba2V5XSA9IGxldmVsLnNjYWxlW2tleV07XG4gIH1cblxuICAvLyBIZWlnaHQgYW5kIHdpZHRoIG9mIHRoZSBnb2FsIGFuZCBvYnN0YWNsZXMuXG4gIEZsYXBweS5NQVJLRVJfSEVJR0hUID0gNDM7XG4gIEZsYXBweS5NQVJLRVJfV0lEVEggPSA1MDtcblxuICBGbGFwcHkuTUFaRV9XSURUSCA9IDQwMDtcbiAgRmxhcHB5Lk1BWkVfSEVJR0hUID0gNDAwO1xuXG4gIEZsYXBweS5HUk9VTkRfV0lEVEggPSA0MDA7XG4gIEZsYXBweS5HUk9VTkRfSEVJR0hUID0gNDg7XG5cbiAgRmxhcHB5LkdPQUxfU0laRSA9IDU1O1xuXG4gIEZsYXBweS5PQlNUQUNMRV9XSURUSCA9IDUyO1xuICBGbGFwcHkuT0JTVEFDTEVfSEVJR0hUID0gMzIwO1xuICBGbGFwcHkuTUlOX09CU1RBQ0xFX0hFSUdIVCA9IDQ4O1xuXG4gIEZsYXBweS5zZXRHYXBIZWlnaHQoYXBpLkdhcEhlaWdodC5OT1JNQUwpO1xuXG4gIEZsYXBweS5PQlNUQUNMRV9TUEFDSU5HID0gMjUwOyAvLyBudW1iZXIgb2YgaG9yaXpvbnRhbCBwaXhlbHMgYmV0d2VlbiB0aGUgc3RhcnQgb2Ygb2JzdGFjbGVzXG5cbiAgdmFyIG51bU9ic3RhY2xlcyA9IDIgKiBGbGFwcHkuTUFaRV9XSURUSCAvIEZsYXBweS5PQlNUQUNMRV9TUEFDSU5HO1xuICBpZiAoIWxldmVsLm9ic3RhY2xlcykge1xuICAgIG51bU9ic3RhY2xlcyA9IDA7XG4gIH1cblxuICB2YXIgcmVzZXRPYnN0YWNsZSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLmdhcFN0YXJ0ID0gcmFuZG9tT2JzdGFjbGVIZWlnaHQoKTtcbiAgICB0aGlzLmhpdEF2YXRhciA9IGZhbHNlO1xuICB9O1xuXG4gIHZhciBjb250YWluc0F2YXRhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmxhcHB5UmlnaHQgPSBGbGFwcHkuYXZhdGFyWCArIEFWQVRBUl9XSURUSDtcbiAgICB2YXIgZmxhcHB5Qm90dG9tID0gRmxhcHB5LmF2YXRhclkgKyBBVkFUQVJfSEVJR0hUO1xuICAgIHZhciBvYnN0YWNsZVJpZ2h0ID0gdGhpcy54ICsgRmxhcHB5Lk9CU1RBQ0xFX1dJRFRIO1xuICAgIHZhciBvYnN0YWNsZUJvdHRvbSA9IHRoaXMuZ2FwU3RhcnQgKyBGbGFwcHkuR0FQX1NJWkU7XG4gICAgcmV0dXJuIChmbGFwcHlSaWdodCA+IHRoaXMueCAmJlxuICAgICAgZmxhcHB5UmlnaHQgPCBvYnN0YWNsZVJpZ2h0ICYmXG4gICAgICBGbGFwcHkuYXZhdGFyWSA+IHRoaXMuZ2FwU3RhcnQgJiZcbiAgICAgIGZsYXBweUJvdHRvbSA8IG9ic3RhY2xlQm90dG9tKTtcbiAgfTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bU9ic3RhY2xlczsgaSsrKSB7XG4gICAgRmxhcHB5Lm9ic3RhY2xlcy5wdXNoKHtcbiAgICAgIHg6IEZsYXBweS5NQVpFX1dJRFRIICogMS41ICsgaSAqIEZsYXBweS5PQlNUQUNMRV9TUEFDSU5HLFxuICAgICAgZ2FwU3RhcnQ6IHJhbmRvbU9ic3RhY2xlSGVpZ2h0KCksIC8vIHkgY29vcmRpbmF0ZSBvZiB0aGUgdG9wIG9mIHRoZSBnYXBcbiAgICAgIGhpdEF2YXRhcjogZmFsc2UsXG4gICAgICByZXNldDogcmVzZXRPYnN0YWNsZSxcbiAgICAgIGNvbnRhaW5zQXZhdGFyOiBjb250YWluc0F2YXRhclxuICAgIH0pO1xuICB9XG59O1xuXG52YXIgZHJhd01hcCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3ZnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N2Z0ZsYXBweScpO1xuICB2YXIgaSwgeCwgeSwgaywgdGlsZTtcblxuICAvLyBBZGp1c3Qgb3V0ZXIgZWxlbWVudCBzaXplLlxuICBzdmcuc2V0QXR0cmlidXRlKCd3aWR0aCcsIEZsYXBweS5NQVpFX1dJRFRIKTtcbiAgc3ZnLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgRmxhcHB5Lk1BWkVfSEVJR0hUKTtcblxuICAvLyBBZGp1c3QgdmlzdWFsaXphdGlvbkNvbHVtbiB3aWR0aC5cbiAgdmFyIHZpc3VhbGl6YXRpb25Db2x1bW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvbkNvbHVtbicpO1xuICB2aXN1YWxpemF0aW9uQ29sdW1uLnN0eWxlLndpZHRoID0gRmxhcHB5Lk1BWkVfV0lEVEggKyAncHgnO1xuXG4gIGlmIChza2luLmJhY2tncm91bmQpIHtcbiAgICB0aWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5iYWNrZ3JvdW5kKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZSgnaWQnLCAnYmFja2dyb3VuZCcpO1xuICAgIHRpbGUuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBGbGFwcHkuTUFaRV9IRUlHSFQpO1xuICAgIHRpbGUuc2V0QXR0cmlidXRlKCd3aWR0aCcsIEZsYXBweS5NQVpFX1dJRFRIKTtcbiAgICB0aWxlLnNldEF0dHJpYnV0ZSgneCcsIDApO1xuICAgIHRpbGUuc2V0QXR0cmlidXRlKCd5JywgMCk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKHRpbGUpO1xuICB9XG5cbiAgLy8gQWRkIG9ic3RhY2xlc1xuICBGbGFwcHkub2JzdGFjbGVzLmZvckVhY2ggKGZ1bmN0aW9uIChvYnN0YWNsZSwgaW5kZXgpIHtcbiAgICB2YXIgb2JzdGFjbGVUb3BJY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICBvYnN0YWNsZVRvcEljb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLm9ic3RhY2xlX3RvcCk7XG4gICAgb2JzdGFjbGVUb3BJY29uLnNldEF0dHJpYnV0ZSgnaWQnLCAnb2JzdGFjbGVfdG9wJyArIGluZGV4KTtcbiAgICBvYnN0YWNsZVRvcEljb24uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBGbGFwcHkuT0JTVEFDTEVfSEVJR0hUKTtcbiAgICBvYnN0YWNsZVRvcEljb24uc2V0QXR0cmlidXRlKCd3aWR0aCcsIEZsYXBweS5PQlNUQUNMRV9XSURUSCk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKG9ic3RhY2xlVG9wSWNvbik7XG5cbiAgICB2YXIgb2JzdGFjbGVCb3R0b21JY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICBvYnN0YWNsZUJvdHRvbUljb24uc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLm9ic3RhY2xlX2JvdHRvbSk7XG4gICAgb2JzdGFjbGVCb3R0b21JY29uLnNldEF0dHJpYnV0ZSgnaWQnLCAnb2JzdGFjbGVfYm90dG9tJyArIGluZGV4KTtcbiAgICBvYnN0YWNsZUJvdHRvbUljb24uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBGbGFwcHkuT0JTVEFDTEVfSEVJR0hUKTtcbiAgICBvYnN0YWNsZUJvdHRvbUljb24uc2V0QXR0cmlidXRlKCd3aWR0aCcsIEZsYXBweS5PQlNUQUNMRV9XSURUSCk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKG9ic3RhY2xlQm90dG9tSWNvbik7XG4gIH0pO1xuXG4gIGlmIChsZXZlbC5ncm91bmQpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgRmxhcHB5Lk1BWkVfV0lEVEggLyBGbGFwcHkuR1JPVU5EX1dJRFRIICsgMTsgaSsrKSB7XG4gICAgICB2YXIgZ3JvdW5kSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2ltYWdlJyk7XG4gICAgICBncm91bmRJY29uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5ncm91bmQpO1xuICAgICAgZ3JvdW5kSWNvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2dyb3VuZCcgKyBpKTtcbiAgICAgIGdyb3VuZEljb24uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBGbGFwcHkuR1JPVU5EX0hFSUdIVCk7XG4gICAgICBncm91bmRJY29uLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBGbGFwcHkuR1JPVU5EX1dJRFRIKTtcbiAgICAgIGdyb3VuZEljb24uc2V0QXR0cmlidXRlKCd4JywgMCk7XG4gICAgICBncm91bmRJY29uLnNldEF0dHJpYnV0ZSgneScsIEZsYXBweS5NQVpFX0hFSUdIVCAtIEZsYXBweS5HUk9VTkRfSEVJR0hUKTtcbiAgICAgIHN2Zy5hcHBlbmRDaGlsZChncm91bmRJY29uKTtcbiAgICB9XG4gIH1cblxuICBpZiAobGV2ZWwuZ29hbCAmJiBsZXZlbC5nb2FsLnN0YXJ0WCkge1xuICAgIHZhciBnb2FsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgICBnb2FsLnNldEF0dHJpYnV0ZSgnaWQnLCAnZ29hbCcpO1xuICAgIGdvYWwuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5nb2FsKTtcbiAgICBnb2FsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgRmxhcHB5LkdPQUxfU0laRSk7XG4gICAgZ29hbC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgRmxhcHB5LkdPQUxfU0laRSk7XG4gICAgZ29hbC5zZXRBdHRyaWJ1dGUoJ3gnLCBsZXZlbC5nb2FsLnN0YXJ0WCk7XG4gICAgZ29hbC5zZXRBdHRyaWJ1dGUoJ3knLCBsZXZlbC5nb2FsLnN0YXJ0WSk7XG4gICAgc3ZnLmFwcGVuZENoaWxkKGdvYWwpO1xuICB9XG5cbiAgdmFyIGF2YXRBcmNsaXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdjbGlwUGF0aCcpO1xuICBhdmF0QXJjbGlwLnNldEF0dHJpYnV0ZSgnaWQnLCAnYXZhdEFyY2xpcFBhdGgnKTtcbiAgdmFyIGF2YXRBcmNsaXBSZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAncmVjdCcpO1xuICBhdmF0QXJjbGlwUmVjdC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2F2YXRBcmNsaXBSZWN0Jyk7XG4gIGF2YXRBcmNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBGbGFwcHkuTUFaRV9XSURUSCk7XG4gIGF2YXRBcmNsaXBSZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgRmxhcHB5Lk1BWkVfSEVJR0hUIC0gRmxhcHB5LkdST1VORF9IRUlHSFQpO1xuICBhdmF0QXJjbGlwLmFwcGVuZENoaWxkKGF2YXRBcmNsaXBSZWN0KTtcbiAgc3ZnLmFwcGVuZENoaWxkKGF2YXRBcmNsaXApO1xuXG4gIC8vIEFkZCBhdmF0YXIuXG4gIHZhciBhdmF0YXJJY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAnaW1hZ2UnKTtcbiAgYXZhdGFySWNvbi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2F2YXRhcicpO1xuICBhdmF0YXJJY29uLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBza2luLmF2YXRhcik7XG4gIGF2YXRhckljb24uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBBVkFUQVJfSEVJR0hUKTtcbiAgYXZhdGFySWNvbi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgQVZBVEFSX1dJRFRIKTtcbiAgaWYgKGxldmVsLmdyb3VuZCkge1xuICAgIGF2YXRhckljb24uc2V0QXR0cmlidXRlKCdjbGlwLXBhdGgnLCAndXJsKCNhdmF0QXJjbGlwUGF0aCknKTtcbiAgfVxuICBzdmcuYXBwZW5kQ2hpbGQoYXZhdGFySWNvbik7XG5cbiAgdmFyIGluc3RydWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2ltYWdlJyk7XG4gIGluc3RydWN0aW9ucy5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uaW5zdHJ1Y3Rpb25zKTtcbiAgaW5zdHJ1Y3Rpb25zLnNldEF0dHJpYnV0ZSgnaWQnLCAnaW5zdHJ1Y3Rpb25zJyk7XG4gIGluc3RydWN0aW9ucy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIDUwKTtcbiAgaW5zdHJ1Y3Rpb25zLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAxNTkpO1xuICBpbnN0cnVjdGlvbnMuc2V0QXR0cmlidXRlKCd4JywgMTEwKTtcbiAgaW5zdHJ1Y3Rpb25zLnNldEF0dHJpYnV0ZSgneScsIDE3MCk7XG4gIGluc3RydWN0aW9ucy5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIHN2Zy5hcHBlbmRDaGlsZChpbnN0cnVjdGlvbnMpO1xuXG4gIHZhciBnZXRyZWFkeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhCbG9ja2x5LlNWR19OUywgJ2ltYWdlJyk7XG4gIGdldHJlYWR5LnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbi5nZXRyZWFkeSk7XG4gIGdldHJlYWR5LnNldEF0dHJpYnV0ZSgnaWQnLCAnZ2V0cmVhZHknKTtcbiAgZ2V0cmVhZHkuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCA1MCk7XG4gIGdldHJlYWR5LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAxODMpO1xuICBnZXRyZWFkeS5zZXRBdHRyaWJ1dGUoJ3gnLCAxMDgpO1xuICBnZXRyZWFkeS5zZXRBdHRyaWJ1dGUoJ3knLCA4MCk7XG4gIGdldHJlYWR5LnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgc3ZnLmFwcGVuZENoaWxkKGdldHJlYWR5KTtcblxuICB2YXIgY2xpY2tydW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICBjbGlja3J1bi5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uY2xpY2tydW4pO1xuICBjbGlja3J1bi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2NsaWNrcnVuJyk7XG4gIGNsaWNrcnVuLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgNDEpO1xuICBjbGlja3J1bi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgMjczKTtcbiAgY2xpY2tydW4uc2V0QXR0cmlidXRlKCd4JywgNjQpO1xuICBjbGlja3J1bi5zZXRBdHRyaWJ1dGUoJ3knLCAyMDApO1xuICBjbGlja3J1bi5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAndmlzaWJpbGUnKTtcbiAgc3ZnLmFwcGVuZENoaWxkKGNsaWNrcnVuKTtcblxuICB2YXIgZ2FtZW92ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoQmxvY2tseS5TVkdfTlMsICdpbWFnZScpO1xuICBnYW1lb3Zlci5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uZ2FtZW92ZXIpO1xuICBnYW1lb3Zlci5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2dhbWVvdmVyJyk7XG4gIGdhbWVvdmVyLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgNDEpO1xuICBnYW1lb3Zlci5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgMTkyKTtcbiAgZ2FtZW92ZXIuc2V0QXR0cmlidXRlKCd4JywgMTA0KTtcbiAgZ2FtZW92ZXIuc2V0QXR0cmlidXRlKCd5JywgODApO1xuICBnYW1lb3Zlci5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIHN2Zy5hcHBlbmRDaGlsZChnYW1lb3Zlcik7XG5cbiAgdmFyIHNjb3JlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAndGV4dCcpO1xuICBzY29yZS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3Njb3JlJyk7XG4gIHNjb3JlLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnZmxhcHB5LXNjb3JlJyk7XG4gIHNjb3JlLnNldEF0dHJpYnV0ZSgneCcsIEZsYXBweS5NQVpFX1dJRFRIIC8gMik7XG4gIHNjb3JlLnNldEF0dHJpYnV0ZSgneScsIDYwKTtcbiAgc2NvcmUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJzAnKSk7XG4gIHNjb3JlLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgc3ZnLmFwcGVuZENoaWxkKHNjb3JlKTtcblxuICB2YXIgY2xpY2tSZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKEJsb2NrbHkuU1ZHX05TLCAncmVjdCcpO1xuICBjbGlja1JlY3Quc2V0QXR0cmlidXRlKCd3aWR0aCcsIEZsYXBweS5NQVpFX1dJRFRIKTtcbiAgY2xpY2tSZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgRmxhcHB5Lk1BWkVfSEVJR0hUKTtcbiAgY2xpY2tSZWN0LnNldEF0dHJpYnV0ZSgnZmlsbC1vcGFjaXR5JywgMCk7XG4gIGNsaWNrUmVjdC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24gKGUpIHtcbiAgICBGbGFwcHkub25Nb3VzZURvd24oZSk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpOyAvLyBkb24ndCB3YW50IHRvIHNlZSBtb3VzZSBkb3duXG4gIH0pO1xuICBjbGlja1JlY3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24gKGUpIHtcbiAgICBGbGFwcHkub25Nb3VzZURvd24oZSk7XG4gIH0pO1xuICBzdmcuYXBwZW5kQ2hpbGQoY2xpY2tSZWN0KTtcbn07XG5cbkZsYXBweS5jYWxjRGlzdGFuY2UgPSBmdW5jdGlvbih4RGlzdCwgeURpc3QpIHtcbiAgcmV0dXJuIE1hdGguc3FydCh4RGlzdCAqIHhEaXN0ICsgeURpc3QgKiB5RGlzdCk7XG59O1xuXG52YXIgZXNzZW50aWFsbHlFcXVhbCA9IGZ1bmN0aW9uKGZsb2F0MSwgZmxvYXQyLCBvcHRfdmFyaWFuY2UpIHtcbiAgdmFyIHZhcmlhbmNlID0gb3B0X3ZhcmlhbmNlIHx8IDAuMDE7XG4gIHJldHVybiAoTWF0aC5hYnMoZmxvYXQxIC0gZmxvYXQyKSA8IHZhcmlhbmNlKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgdG8gc2VlIGlmIGF2YXRhciBpcyBpbiBjb2xsaXNpb24gd2l0aCBnaXZlbiBvYnN0YWNsZVxuICogQHBhcmFtIG9ic3RhY2xlIE9iamVjdCA6IFRoZSBvYnN0YWNsZSBvYmplY3Qgd2UncmUgY2hlY2tpbmdcbiAqL1xudmFyIGNoZWNrRm9yT2JzdGFjbGVDb2xsaXNpb24gPSBmdW5jdGlvbiAob2JzdGFjbGUpIHtcbiAgdmFyIGluc2lkZU9ic3RhY2xlQ29sdW1uID0gRmxhcHB5LmF2YXRhclggKyBBVkFUQVJfV0lEVEggPj0gb2JzdGFjbGUueCAmJlxuICAgIEZsYXBweS5hdmF0YXJYIDw9IG9ic3RhY2xlLnggKyBGbGFwcHkuT0JTVEFDTEVfV0lEVEg7XG4gIGlmIChpbnNpZGVPYnN0YWNsZUNvbHVtbiAmJiAoRmxhcHB5LmF2YXRhclkgPD0gb2JzdGFjbGUuZ2FwU3RhcnQgfHxcbiAgICBGbGFwcHkuYXZhdGFyWSArIEFWQVRBUl9IRUlHSFQgPj0gb2JzdGFjbGUuZ2FwU3RhcnQgKyBGbGFwcHkuR0FQX1NJWkUpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuRmxhcHB5LmFjdGl2ZVRpY2tzID0gZnVuY3Rpb24gKCkge1xuICBpZiAoRmxhcHB5LmZpcnN0QWN0aXZlVGljayA8IDApIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHJldHVybiAoRmxhcHB5LnRpY2tDb3VudCAtIEZsYXBweS5maXJzdEFjdGl2ZVRpY2spO1xufTtcblxuLyoqXG4gKiBXZSB3YW50IHRvIHN3YWxsb3cgZXhjZXB0aW9ucyB3aGVuIGV4ZWN1dGluZyB1c2VyIGdlbmVyYXRlZCBjb2RlLiBUaGlzIHByb3ZpZGVzXG4gKiBhIHNpbmdsZSBwbGFjZSB0byBkbyBzby5cbiAqL1xuRmxhcHB5LmNhbGxVc2VyR2VuZXJhdGVkQ29kZSA9IGZ1bmN0aW9uIChmbikge1xuICB0cnkge1xuICAgIGZuLmNhbGwoRmxhcHB5LCBzdHVkaW9BcHAsIGFwaSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBzd2FsbG93IGVycm9yLiBzaG91bGQgd2UgYWxzbyBsb2cgdGhpcyBzb21ld2hlcmU/XG4gICAgaWYgKGNvbnNvbGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIH1cbiAgfVxufTtcblxuXG5GbGFwcHkub25UaWNrID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhdmF0YXJXYXNBYm92ZUdyb3VuZCwgYXZhdGFySXNBYm92ZUdyb3VuZDtcblxuICBpZiAoRmxhcHB5LmZpcnN0QWN0aXZlVGljayA8IDAgJiYgRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuQUNUSVZFKSB7XG4gICAgRmxhcHB5LmZpcnN0QWN0aXZlVGljayA9IEZsYXBweS50aWNrQ291bnQ7XG4gIH1cblxuICBGbGFwcHkudGlja0NvdW50Kys7XG5cbiAgaWYgKEZsYXBweS50aWNrQ291bnQgPT09IDEpIHtcbiAgICBGbGFwcHkuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEZsYXBweS53aGVuUnVuQnV0dG9uKTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBjbGlja1xuICBpZiAoRmxhcHB5LmNsaWNrUGVuZGluZyAmJiBGbGFwcHkuZ2FtZVN0YXRlIDw9IEZsYXBweS5HYW1lU3RhdGVzLkFDVElWRSkge1xuICAgIEZsYXBweS5jYWxsVXNlckdlbmVyYXRlZENvZGUoRmxhcHB5LndoZW5DbGljayk7XG4gICAgRmxhcHB5LmNsaWNrUGVuZGluZyA9IGZhbHNlO1xuICB9XG5cbiAgYXZhdGFyV2FzQWJvdmVHcm91bmQgPSAoRmxhcHB5LmF2YXRhclkgKyBBVkFUQVJfSEVJR0hUKSA8XG4gICAgKEZsYXBweS5NQVpFX0hFSUdIVCAtIEZsYXBweS5HUk9VTkRfSEVJR0hUKTtcblxuICAvLyBBY3Rpb24gZG9lc24ndCBzdGFydCB1bnRpbCB1c2VyJ3MgZmlyc3QgY2xpY2tcbiAgaWYgKEZsYXBweS5nYW1lU3RhdGUgPT09IEZsYXBweS5HYW1lU3RhdGVzLkFDVElWRSkge1xuICAgIC8vIFVwZGF0ZSBhdmF0YXIncyB2ZXJ0aWNhbCBwb3NpdGlvblxuICAgIEZsYXBweS5hdmF0YXJWZWxvY2l0eSArPSBGbGFwcHkuZ3Jhdml0eTtcbiAgICBGbGFwcHkuYXZhdGFyWSA9IEZsYXBweS5hdmF0YXJZICsgRmxhcHB5LmF2YXRhclZlbG9jaXR5O1xuXG4gICAgLy8gbmV2ZXIgbGV0IHRoZSBhdmF0YXIgZ28gdG9vIGZhciBvZmYgdGhlIHRvcCBvciBib3R0b21cbiAgICB2YXIgYm90dG9tTGltaXQgPSBsZXZlbC5ncm91bmQgP1xuICAgICAgKEZsYXBweS5NQVpFX0hFSUdIVCAtIEZsYXBweS5HUk9VTkRfSEVJR0hUIC0gQVZBVEFSX0hFSUdIVCArIDEpIDpcbiAgICAgIChGbGFwcHkuTUFaRV9IRUlHSFQgKiAxLjUpO1xuXG4gICAgRmxhcHB5LmF2YXRhclkgPSBNYXRoLm1pbihGbGFwcHkuYXZhdGFyWSwgYm90dG9tTGltaXQpO1xuICAgIEZsYXBweS5hdmF0YXJZID0gTWF0aC5tYXgoRmxhcHB5LmF2YXRhclksIEZsYXBweS5NQVpFX0hFSUdIVCAqIC0wLjUpO1xuXG4gICAgLy8gVXBkYXRlIG9ic3RhY2xlc1xuICAgIEZsYXBweS5vYnN0YWNsZXMuZm9yRWFjaChmdW5jdGlvbiAob2JzdGFjbGUsIGluZGV4KSB7XG4gICAgICB2YXIgd2FzUmlnaHRPZkF2YXRhciA9IG9ic3RhY2xlLnggPiAoRmxhcHB5LmF2YXRhclggKyBBVkFUQVJfV0lEVEgpO1xuXG4gICAgICBvYnN0YWNsZS54IC09IEZsYXBweS5TUEVFRDtcblxuICAgICAgdmFyIGlzUmlnaHRPZkF2YXRhciA9IG9ic3RhY2xlLnggPiAoRmxhcHB5LmF2YXRhclggKyBBVkFUQVJfV0lEVEgpO1xuICAgICAgaWYgKHdhc1JpZ2h0T2ZBdmF0YXIgJiYgIWlzUmlnaHRPZkF2YXRhcikge1xuICAgICAgICBpZiAoRmxhcHB5LmF2YXRhclkgPiBvYnN0YWNsZS5nYXBTdGFydCAmJlxuICAgICAgICAgIChGbGFwcHkuYXZhdGFyWSArIEFWQVRBUl9IRUlHSFQgPCBvYnN0YWNsZS5nYXBTdGFydCArIEZsYXBweS5HQVBfU0laRSkpIHtcbiAgICAgICAgICBGbGFwcHkuY2FsbFVzZXJHZW5lcmF0ZWRDb2RlKEZsYXBweS53aGVuRW50ZXJPYnN0YWNsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFvYnN0YWNsZS5oaXRBdmF0YXIgJiYgY2hlY2tGb3JPYnN0YWNsZUNvbGxpc2lvbihvYnN0YWNsZSkpIHtcbiAgICAgICAgb2JzdGFjbGUuaGl0QXZhdGFyID0gdHJ1ZTtcbiAgICAgICAgdHJ5IHtGbGFwcHkud2hlbkNvbGxpZGVPYnN0YWNsZShzdHVkaW9BcHAsIGFwaSk7IH0gY2F0Y2ggKGUpIHsgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiBvYnN0YWNsZSBtb3ZlcyBvZmYgbGVmdCBzaWRlLCByZXB1cnBvc2UgYXMgYSBuZXcgb2JzdGFjbGUgdG8gb3VyIHJpZ2h0XG4gICAgICB2YXIgbnVtT2JzdGFjbGVzID0gRmxhcHB5Lm9ic3RhY2xlcy5sZW5ndGg7XG4gICAgICB2YXIgcHJldmlvdXNPYnN0YWNsZUluZGV4ID0gKGluZGV4IC0gMSArIG51bU9ic3RhY2xlcyApICUgbnVtT2JzdGFjbGVzO1xuICAgICAgaWYgKG9ic3RhY2xlLnggKyBGbGFwcHkuT0JTVEFDTEVfV0lEVEggPCAwKSB7XG4gICAgICAgIG9ic3RhY2xlLnJlc2V0KEZsYXBweS5vYnN0YWNsZXNbcHJldmlvdXNPYnN0YWNsZUluZGV4XS54ICsgRmxhcHB5Lk9CU1RBQ0xFX1NQQUNJTkcpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gY2hlY2sgZm9yIGdyb3VuZCBjb2xsaXNpb25cbiAgICBhdmF0YXJJc0Fib3ZlR3JvdW5kID0gKEZsYXBweS5hdmF0YXJZICsgQVZBVEFSX0hFSUdIVCkgPFxuICAgICAgKEZsYXBweS5NQVpFX0hFSUdIVCAtIEZsYXBweS5HUk9VTkRfSEVJR0hUKTtcbiAgICBpZiAoYXZhdGFyV2FzQWJvdmVHcm91bmQgJiYgIWF2YXRhcklzQWJvdmVHcm91bmQpIHtcbiAgICAgIEZsYXBweS5jYWxsVXNlckdlbmVyYXRlZENvZGUoRmxhcHB5LndoZW5Db2xsaWRlR3JvdW5kKTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgZ29hbFxuICAgIGlmIChsZXZlbC5nb2FsICYmIGxldmVsLmdvYWwubW92aW5nKSB7XG4gICAgICBGbGFwcHkuZ29hbFggLT0gRmxhcHB5LlNQRUVEO1xuICAgICAgaWYgKEZsYXBweS5nb2FsWCArIEZsYXBweS5HT0FMX1NJWkUgPCAwKSB7XG4gICAgICAgIC8vIGlmIGl0IGRpc2FwcGVhcnMgb2ZmIG9mIGxlZnQsIHJlYXBwZWFyIG9uIHJpZ2h0XG4gICAgICAgIEZsYXBweS5nb2FsWCA9IEZsYXBweS5NQVpFX1dJRFRIICsgRmxhcHB5LkdPQUxfU0laRTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuRU5ESU5HKSB7XG4gICAgRmxhcHB5LmF2YXRhclkgKz0gMTA7XG5cbiAgICAvLyB3ZSB1c2UgYXZhdGFyIHdpZHRoIGluc3RlYWQgb2YgaGVpZ2h0IGJjIGhlIGlzIHJvdGF0aW5nXG4gICAgLy8gdGhlIGV4dHJhIDQgaXMgc28gdGhhdCBoZSBidXJpZXMgaGlzIGJlYWsgKHNpbWlsYXIgdG8gbW9iaWxlIGdhbWUpXG4gICAgdmFyIG1heCA9IEZsYXBweS5NQVpFX0hFSUdIVCAtIEZsYXBweS5HUk9VTkRfSEVJR0hUIC0gQVZBVEFSX1dJRFRIICsgNDtcbiAgICBpZiAoRmxhcHB5LmF2YXRhclkgPj0gbWF4KSB7XG4gICAgICBGbGFwcHkuYXZhdGFyWSA9IG1heDtcbiAgICAgIEZsYXBweS5nYW1lU3RhdGUgPSBGbGFwcHkuR2FtZVN0YXRlcy5PVkVSO1xuICAgICAgRmxhcHB5LmdhbWVPdmVyVGljayA9IEZsYXBweS50aWNrQ291bnQ7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F2YXRhcicpLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJyxcbiAgICAgICd0cmFuc2xhdGUoJyArIEFWQVRBUl9XSURUSCArICcsIDApICcgK1xuICAgICAgJ3JvdGF0ZSg5MCwgJyArIEZsYXBweS5hdmF0YXJYICsgJywgJyArIEZsYXBweS5hdmF0YXJZICsgJyknKTtcbiAgICBpZiAoaW5mb1RleHQpIHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lb3ZlcicpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICd2aXNpYmlsZScpO1xuICAgIH1cbiAgfVxuXG4gIEZsYXBweS5kaXNwbGF5QXZhdGFyKEZsYXBweS5hdmF0YXJYLCBGbGFwcHkuYXZhdGFyWSk7XG4gIEZsYXBweS5kaXNwbGF5T2JzdGFjbGVzKCk7XG4gIGlmIChGbGFwcHkuZ2FtZVN0YXRlIDw9IEZsYXBweS5HYW1lU3RhdGVzLkFDVElWRSkge1xuICAgIEZsYXBweS5kaXNwbGF5R3JvdW5kKEZsYXBweS50aWNrQ291bnQpO1xuICAgIEZsYXBweS5kaXNwbGF5R29hbCgpO1xuICB9XG5cbiAgaWYgKGNoZWNrRmluaXNoZWQoKSkge1xuICAgIEZsYXBweS5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH1cbn07XG5cbkZsYXBweS5vbk1vdXNlRG93biA9IGZ1bmN0aW9uIChlKSB7XG4gIGlmIChGbGFwcHkuaW50ZXJ2YWxJZCkge1xuICAgIEZsYXBweS5jbGlja1BlbmRpbmcgPSB0cnVlO1xuICAgIGlmIChGbGFwcHkuZ2FtZVN0YXRlID09PSBGbGFwcHkuR2FtZVN0YXRlcy5XQUlUSU5HKSB7XG4gICAgICBGbGFwcHkuZ2FtZVN0YXRlID0gRmxhcHB5LkdhbWVTdGF0ZXMuQUNUSVZFO1xuICAgIH0gZWxzZSBpZiAoRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuT1ZFUiAmJlxuICAgICAgRmxhcHB5LmdhbWVPdmVyVGljayArIDEwIDwgRmxhcHB5LnRpY2tDb3VudCkge1xuICAgICAgLy8gZG8gYSByZXNldFxuICAgICAgdmFyIHJlc2V0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0QnV0dG9uJyk7XG4gICAgICBpZiAocmVzZXRCdXR0b24pIHtcbiAgICAgICAgcmVzZXRCdXR0b24uY2xpY2soKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luc3RydWN0aW9ucycpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2V0cmVhZHknKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gIH0gZWxzZSBpZiAoRmxhcHB5LmdhbWVTdGF0ZSA9PT0gRmxhcHB5LkdhbWVTdGF0ZXMuV0FJVElORykge1xuICAgIEZsYXBweS5ydW5CdXR0b25DbGljaygpO1xuICB9XG59O1xuLyoqXG4gKiBJbml0aWFsaXplIEJsb2NrbHkgYW5kIHRoZSBGbGFwcHkgYXBwLiAgQ2FsbGVkIG9uIHBhZ2UgbG9hZC5cbiAqL1xuRmxhcHB5LmluaXQgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgLy8gcmVwbGFjZSBzdHVkaW9BcHAgbWV0aG9kcyB3aXRoIG91ciBvd25cbiAgc3R1ZGlvQXBwLnJlc2V0ID0gdGhpcy5yZXNldC5iaW5kKHRoaXMpO1xuICBzdHVkaW9BcHAucnVuQnV0dG9uQ2xpY2sgPSB0aGlzLnJ1bkJ1dHRvbkNsaWNrLmJpbmQodGhpcyk7XG5cbiAgRmxhcHB5LmNsZWFyRXZlbnRIYW5kbGVyc0tpbGxUaWNrTG9vcCgpO1xuICBza2luID0gY29uZmlnLnNraW47XG4gIGxldmVsID0gY29uZmlnLmxldmVsO1xuXG4gIGNvbmZpZy5ncmF5T3V0VW5kZWxldGFibGVCbG9ja3MgPSBsZXZlbC5ncmF5T3V0VW5kZWxldGFibGVCbG9ja3M7XG5cbiAgbG9hZExldmVsKCk7XG5cbiAgY29uZmlnLmxvYWRBdWRpbyA9IGZ1bmN0aW9uKCkge1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi53aW5Tb3VuZCwgJ3dpbicpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5zdGFydFNvdW5kLCAnc3RhcnQnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uZmFpbHVyZVNvdW5kLCAnZmFpbHVyZScpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5vYnN0YWNsZVNvdW5kLCAnb2JzdGFjbGUnKTtcblxuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5kaWVTb3VuZCwgJ3NmeF9kaWUnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uaGl0U291bmQsICdzZnhfaGl0Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLnBvaW50U291bmQsICdzZnhfcG9pbnQnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uc3dvb3NoaW5nU291bmQsICdzZnhfc3dvb3NoaW5nJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndpbmdTb3VuZCwgJ3NmeF93aW5nJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndpbkdvYWxTb3VuZCwgJ3dpbkdvYWwnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uamV0U291bmQsICdqZXQnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uamluZ2xlU291bmQsICdqaW5nbGUnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uY3Jhc2hTb3VuZCwgJ2NyYXNoJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmxhc2VyU291bmQsICdsYXNlcicpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5zcGxhc2hTb3VuZCwgJ3NwbGFzaCcpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi53YWxsU291bmQsICd3YWxsJyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLndhbGwwU291bmQsICd3YWxsMCcpO1xuICB9O1xuXG4gIGNvbmZpZy5hZnRlckluamVjdCA9IGZ1bmN0aW9uKCkge1xuICAgIC8qKlxuICAgICAqIFRoZSByaWNobmVzcyBvZiBibG9jayBjb2xvdXJzLCByZWdhcmRsZXNzIG9mIHRoZSBodWUuXG4gICAgICogTU9PQyBibG9ja3Mgc2hvdWxkIGJlIGJyaWdodGVyICh0YXJnZXQgYXVkaWVuY2UgaXMgeW91bmdlcikuXG4gICAgICogTXVzdCBiZSBpbiB0aGUgcmFuZ2Ugb2YgMCAoaW5jbHVzaXZlKSB0byAxIChleGNsdXNpdmUpLlxuICAgICAqIEJsb2NrbHkncyBkZWZhdWx0IGlzIDAuNDUuXG4gICAgICovXG4gICAgQmxvY2tseS5IU1ZfU0FUVVJBVElPTiA9IDAuNjtcblxuICAgIEJsb2NrbHkuU05BUF9SQURJVVMgKj0gRmxhcHB5LnNjYWxlLnNuYXBSYWRpdXM7XG5cbiAgICBkcmF3TWFwKCk7XG4gIH07XG5cbiAgY29uZmlnLnRyYXNoY2FuID0gZmFsc2U7XG5cbiAgY29uZmlnLnR3aXR0ZXIgPSB0d2l0dGVyT3B0aW9ucztcblxuICAvLyBmb3IgZmxhcHB5IHNob3cgbWFrZSB5b3VyIG93biBidXR0b24gaWYgb24gc2hhcmUgcGFnZVxuICBjb25maWcubWFrZVlvdXJPd24gPSBjb25maWcuc2hhcmU7XG5cbiAgY29uZmlnLm1ha2VTdHJpbmcgPSBjb21tb25Nc2cubWFrZVlvdXJPd25GbGFwcHkoKTtcbiAgY29uZmlnLm1ha2VVcmwgPSBcImh0dHA6Ly9jb2RlLm9yZy9mbGFwcHlcIjtcbiAgY29uZmlnLm1ha2VJbWFnZSA9IHN0dWRpb0FwcC5hc3NldFVybCgnbWVkaWEvZmxhcHB5X3Byb21vLnBuZycpO1xuXG4gIGNvbmZpZy5lbmFibGVTaG93Q29kZSA9IGZhbHNlO1xuICBjb25maWcuZW5hYmxlU2hvd0Jsb2NrQ291bnQgPSBmYWxzZTtcblxuICBpZiAobGV2ZWwuaXNLMSkge1xuICAgIC8vIGsxIGJsb2NrcyBhcmUgdGFsbGVyXG4gICAgY29uc3RhbnRzLldPUktTUEFDRV9ST1dfSEVJR0hUICo9IDEuNTtcbiAgfVxuXG4gIC8vIGRlZmluZSBob3cgb3VyIGJsb2NrcyBzaG91bGQgYmUgYXJyYW5nZWRcbiAgdmFyIGNvbDEgPSBjb25zdGFudHMuV09SS1NQQUNFX0JVRkZFUjtcbiAgdmFyIGNvbDIgPSBjb2wxICsgY29uc3RhbnRzLldPUktTUEFDRV9DT0xfV0lEVEg7XG4gIHZhciByb3cxID0gY29uc3RhbnRzLldPUktTUEFDRV9CVUZGRVI7XG4gIHZhciByb3cyID0gcm93MSArIGNvbnN0YW50cy5XT1JLU1BBQ0VfUk9XX0hFSUdIVDtcbiAgdmFyIHJvdzMgPSByb3cyICsgY29uc3RhbnRzLldPUktTUEFDRV9ST1dfSEVJR0hUO1xuXG4gIGNvbmZpZy5ibG9ja0FycmFuZ2VtZW50ID0ge1xuICAgICdmbGFwcHlfd2hlbkNsaWNrJzogeyB4OiBjb2wxLCB5OiByb3cxfSxcbiAgICAnd2hlbl9ydW4nOiB7IHg6IGNvbDEsIHk6IHJvdzF9LFxuICAgICdmbGFwcHlfd2hlbkNvbGxpZGVHcm91bmQnOiB7IHg6IGNvbDIsIHk6IHJvdzF9LFxuICAgICdmbGFwcHlfd2hlbkNvbGxpZGVPYnN0YWNsZSc6IHsgeDogY29sMiwgeTogcm93Mn0sXG4gICAgJ2ZsYXBweV93aGVuRW50ZXJPYnN0YWNsZSc6IHsgeDogY29sMiwgeTogcm93M31cbiAgfTtcblxuICAvLyBpZiB3ZSBkb250IGhhdmUgY29sbGlkZSBldmVudHMsIGhhdmUgZW50ZXIgb2JzdGFjbGUgaW4gdG9wIHJvd1xuICBpZiAobGV2ZWwuc3RhcnRCbG9ja3MuaW5kZXhPZignd2hlbkNvbGxpZGUnKSA9PT0gLTEpIHtcbiAgICBjb25maWcuYmxvY2tBcnJhbmdlbWVudC5mbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUgPSB7eDogY29sMiwgeTogcm93MX07XG4gIH1cblxuICAvLyB3aGVuIHdlIGhhdmUgd2hlbl9ydW4gYW5kIHdoZW5fY2xpY2ssIHB1dCB3aGVuX3J1biBpbiB0b3Agcm93XG4gIGlmIChsZXZlbC5zdGFydEJsb2Nrcy5pbmRleE9mKCd3aGVuX3J1bicpICE9PSAtMSkge1xuICAgIGNvbmZpZy5ibG9ja0FycmFuZ2VtZW50LmZsYXBweV93aGVuQ2xpY2sueSA9IHJvdzI7XG4gIH1cblxuICB2YXIgcmVuZGVyQ29kZVdvcmtzcGFjZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY29kZVdvcmtzcGFjZUVqcyh7XG4gICAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgICAgZGF0YToge1xuICAgICAgICBsb2NhbGVEaXJlY3Rpb246IHN0dWRpb0FwcC5sb2NhbGVEaXJlY3Rpb24oKSxcbiAgICAgICAgYmxvY2tVc2VkOiB1bmRlZmluZWQsXG4gICAgICAgIGlkZWFsQmxvY2tOdW1iZXI6IHVuZGVmaW5lZCxcbiAgICAgICAgZWRpdENvZGU6IGxldmVsLmVkaXRDb2RlLFxuICAgICAgICBibG9ja0NvdW50ZXJDbGFzczogJ2Jsb2NrLWNvdW50ZXItZGVmYXVsdCcsXG4gICAgICAgIHJlYWRvbmx5V29ya3NwYWNlOiBjb25maWcucmVhZG9ubHlXb3Jrc3BhY2VcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICB2YXIgcmVuZGVyVmlzdWFsaXphdGlvbkNvbHVtbiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdmlzdWFsaXphdGlvbkNvbHVtbkVqcyh7XG4gICAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgICAgZGF0YToge1xuICAgICAgICB2aXN1YWxpemF0aW9uOiByZXF1aXJlKCcuL3Zpc3VhbGl6YXRpb24uaHRtbC5lanMnKSgpLFxuICAgICAgICBjb250cm9sczogcmVxdWlyZSgnLi9jb250cm9scy5odG1sLmVqcycpKHthc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLCBzaGFyZWFibGU6IGxldmVsLnNoYXJlYWJsZX0pXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIG9uTW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgc3R1ZGlvQXBwLmluaXQoY29uZmlnKTtcblxuICAgIHZhciByaWdodEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyaWdodEJ1dHRvbicpO1xuICAgIGRvbS5hZGRDbGlja1RvdWNoRXZlbnQocmlnaHRCdXR0b24sIEZsYXBweS5vblB1enpsZUNvbXBsZXRlKTtcbiAgfTtcblxuICBSZWFjdC5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChBcHBWaWV3LCB7XG4gICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICBpc0VtYmVkVmlldzogISFjb25maWcuZW1iZWQsXG4gICAgaXNTaGFyZVZpZXc6ICEhY29uZmlnLnNoYXJlLFxuICAgIHJlbmRlckNvZGVXb3Jrc3BhY2U6IHJlbmRlckNvZGVXb3Jrc3BhY2UsXG4gICAgcmVuZGVyVmlzdWFsaXphdGlvbkNvbHVtbjogcmVuZGVyVmlzdWFsaXphdGlvbkNvbHVtbixcbiAgICBvbk1vdW50OiBvbk1vdW50XG4gIH0pLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuY29udGFpbmVySWQpKTtcbn07XG5cbi8qKlxuICogQ2xlYXIgdGhlIGV2ZW50IGhhbmRsZXJzIGFuZCBzdG9wIHRoZSBvblRpY2sgdGltZXIuXG4gKi9cbkZsYXBweS5jbGVhckV2ZW50SGFuZGxlcnNLaWxsVGlja0xvb3AgPSBmdW5jdGlvbigpIHtcbiAgRmxhcHB5LndoZW5DbGljayA9IG51bGw7XG4gIEZsYXBweS53aGVuQ29sbGlkZUdyb3VuZCA9IG51bGw7XG4gIEZsYXBweS53aGVuQ29sbGlkZU9ic3RhY2xlID0gbnVsbDtcbiAgRmxhcHB5LndoZW5FbnRlck9ic3RhY2xlID0gbnVsbDtcbiAgRmxhcHB5LndoZW5SdW5CdXR0b24gPSBudWxsO1xuICBpZiAoRmxhcHB5LmludGVydmFsSWQpIHtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChGbGFwcHkuaW50ZXJ2YWxJZCk7XG4gIH1cbiAgRmxhcHB5LmludGVydmFsSWQgPSAwO1xufTtcblxuLyoqXG4gKiBSZXNldCB0aGUgYXBwIHRvIHRoZSBzdGFydCBwb3NpdGlvbiBhbmQga2lsbCBhbnkgcGVuZGluZyBhbmltYXRpb24gdGFza3MuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGZpcnN0IFRydWUgaWYgYW4gb3BlbmluZyBhbmltYXRpb24gaXMgdG8gYmUgcGxheWVkLlxuICovXG5GbGFwcHkucmVzZXQgPSBmdW5jdGlvbihmaXJzdCkge1xuICB2YXIgaTtcbiAgRmxhcHB5LmNsZWFyRXZlbnRIYW5kbGVyc0tpbGxUaWNrTG9vcCgpO1xuXG4gIEZsYXBweS5nYW1lU3RhdGUgPSBGbGFwcHkuR2FtZVN0YXRlcy5XQUlUSU5HO1xuXG4gIC8vIFJlc2V0IHRoZSBzY29yZS5cbiAgRmxhcHB5LnBsYXllclNjb3JlID0gMDtcblxuICBGbGFwcHkuYXZhdGFyVmVsb2NpdHkgPSAwO1xuXG4gIC8vIFJlc2V0IG9ic3RhY2xlc1xuICBGbGFwcHkub2JzdGFjbGVzLmZvckVhY2goZnVuY3Rpb24gKG9ic3RhY2xlLCBpbmRleCkge1xuICAgIG9ic3RhY2xlLnJlc2V0KEZsYXBweS5NQVpFX1dJRFRIICogMS41ICsgaW5kZXggKiBGbGFwcHkuT0JTVEFDTEVfU1BBQ0lORyk7XG4gIH0pO1xuXG4gIC8vIHJlc2V0IGNvbmZpZ3VyYWJsZSB2YWx1ZXNcbiAgRmxhcHB5LlNQRUVEID0gMDtcbiAgRmxhcHB5LkZMQVBfVkVMT0NJVFkgPSAtMTE7XG4gIEZsYXBweS5zZXRCYWNrZ3JvdW5kKCdmbGFwcHknKTtcbiAgRmxhcHB5LnNldE9ic3RhY2xlKCdmbGFwcHknKTtcbiAgRmxhcHB5LnNldFBsYXllcignZmxhcHB5Jyk7XG4gIEZsYXBweS5zZXRHcm91bmQoJ2ZsYXBweScpO1xuICBGbGFwcHkuc2V0R2FwSGVpZ2h0KGFwaS5HYXBIZWlnaHQuTk9STUFMKTtcbiAgRmxhcHB5LmdyYXZpdHkgPSBhcGkuR3Jhdml0eS5OT1JNQUw7XG5cbiAgLy8gTW92ZSBBdmF0YXIgaW50byBwb3NpdGlvbi5cbiAgRmxhcHB5LmF2YXRhclggPSAxMTA7XG4gIEZsYXBweS5hdmF0YXJZID0gMTUwO1xuXG4gIGlmIChsZXZlbC5nb2FsICYmIGxldmVsLmdvYWwuc3RhcnRYKSB7XG4gICAgRmxhcHB5LmdvYWxYID0gbGV2ZWwuZ29hbC5zdGFydFg7XG4gICAgRmxhcHB5LmdvYWxZID0gbGV2ZWwuZ29hbC5zdGFydFk7XG4gIH1cblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXZhdGFyJykuc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLCAnJyk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZScpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luc3RydWN0aW9ucycpLnNldEF0dHJpYnV0ZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaWNrcnVuJykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dldHJlYWR5Jykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZW92ZXInKS5zZXRBdHRyaWJ1dGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG5cbiAgRmxhcHB5LmRpc3BsYXlBdmF0YXIoRmxhcHB5LmF2YXRhclgsIEZsYXBweS5hdmF0YXJZKTtcbiAgRmxhcHB5LmRpc3BsYXlPYnN0YWNsZXMoKTtcbiAgRmxhcHB5LmRpc3BsYXlHcm91bmQoMCk7XG4gIEZsYXBweS5kaXNwbGF5R29hbCgpO1xuXG4gIHZhciBzdmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnRmxhcHB5Jyk7XG59O1xuXG4vKipcbiAqIENsaWNrIHRoZSBydW4gYnV0dG9uLiAgU3RhcnQgdGhlIHByb2dyYW0uXG4gKi9cbi8vIFhYWCBUaGlzIGlzIHRoZSBvbmx5IG1ldGhvZCB1c2VkIGJ5IHRoZSB0ZW1wbGF0ZXMhXG5GbGFwcHkucnVuQnV0dG9uQ2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJ1bkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW5CdXR0b24nKTtcbiAgdmFyIHJlc2V0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0QnV0dG9uJyk7XG4gIC8vIEVuc3VyZSB0aGF0IFJlc2V0IGJ1dHRvbiBpcyBhdCBsZWFzdCBhcyB3aWRlIGFzIFJ1biBidXR0b24uXG4gIGlmICghcmVzZXRCdXR0b24uc3R5bGUubWluV2lkdGgpIHtcbiAgICByZXNldEJ1dHRvbi5zdHlsZS5taW5XaWR0aCA9IHJ1bkJ1dHRvbi5vZmZzZXRXaWR0aCArICdweCc7XG4gIH1cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaWNrcnVuJykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5zdHJ1Y3Rpb25zJykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dldHJlYWR5Jykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcblxuICBzdHVkaW9BcHAudG9nZ2xlUnVuUmVzZXQoJ3Jlc2V0Jyk7XG4gIEJsb2NrbHkubWFpbkJsb2NrU3BhY2UudHJhY2VPbih0cnVlKTtcbiAgLy8gc3R1ZGlvQXBwLnJlc2V0KGZhbHNlKTtcbiAgc3R1ZGlvQXBwLmF0dGVtcHRzKys7XG4gIEZsYXBweS5leGVjdXRlKCk7XG5cbiAgaWYgKGxldmVsLmZyZWVQbGF5KSB7XG4gICAgdmFyIHJpZ2h0QnV0dG9uQ2VsbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyaWdodC1idXR0b24tY2VsbCcpO1xuICAgIHJpZ2h0QnV0dG9uQ2VsbC5jbGFzc05hbWUgPSAncmlnaHQtYnV0dG9uLWNlbGwtZW5hYmxlZCc7XG4gIH1cbiAgaWYgKGxldmVsLnNjb3JlKSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Njb3JlJykuc2V0QXR0cmlidXRlKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICBGbGFwcHkuZGlzcGxheVNjb3JlKCk7XG4gIH1cbn07XG5cbi8qKlxuICogQXBwIHNwZWNpZmljIGRpc3BsYXlGZWVkYmFjayBmdW5jdGlvbiB0aGF0IGNhbGxzIGludG9cbiAqIHN0dWRpb0FwcC5kaXNwbGF5RmVlZGJhY2sgd2hlbiBhcHByb3ByaWF0ZVxuICovXG52YXIgZGlzcGxheUZlZWRiYWNrID0gZnVuY3Rpb24oKSB7XG4gIGlmICghRmxhcHB5LndhaXRpbmdGb3JSZXBvcnQpIHtcbiAgICBzdHVkaW9BcHAuZGlzcGxheUZlZWRiYWNrKHtcbiAgICAgIGFwcDogJ2ZsYXBweScsIC8vWFhYXG4gICAgICBza2luOiBza2luLmlkLFxuICAgICAgZmVlZGJhY2tUeXBlOiBGbGFwcHkudGVzdFJlc3VsdHMsXG4gICAgICByZXNwb25zZTogRmxhcHB5LnJlc3BvbnNlLFxuICAgICAgbGV2ZWw6IGxldmVsLFxuICAgICAgc2hvd2luZ1NoYXJpbmc6IGxldmVsLmZyZWVQbGF5ICYmIGxldmVsLnNoYXJlYWJsZSxcbiAgICAgIHR3aXR0ZXI6IHR3aXR0ZXJPcHRpb25zLFxuICAgICAgYXBwU3RyaW5nczoge1xuICAgICAgICByZWluZkZlZWRiYWNrTXNnOiBmbGFwcHlNc2cucmVpbmZGZWVkYmFja01zZygpLFxuICAgICAgICBzaGFyaW5nVGV4dDogZmxhcHB5TXNnLnNoYXJlR2FtZSgpXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHNlcnZpY2UgcmVwb3J0IGNhbGwgaXMgY29tcGxldGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBKU09OIHJlc3BvbnNlIChpZiBhdmFpbGFibGUpXG4gKi9cbkZsYXBweS5vblJlcG9ydENvbXBsZXRlID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgRmxhcHB5LnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIEZsYXBweS53YWl0aW5nRm9yUmVwb3J0ID0gZmFsc2U7XG4gIHN0dWRpb0FwcC5vblJlcG9ydENvbXBsZXRlKHJlc3BvbnNlKTtcbiAgZGlzcGxheUZlZWRiYWNrKCk7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgdGhlIHVzZXIncyBjb2RlLiAgSGVhdmVuIGhlbHAgdXMuLi5cbiAqL1xuRmxhcHB5LmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNvZGU7XG4gIEZsYXBweS5yZXN1bHQgPSBSZXN1bHRUeXBlLlVOU0VUO1xuICBGbGFwcHkudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5OT19URVNUU19SVU47XG4gIEZsYXBweS53YWl0aW5nRm9yUmVwb3J0ID0gZmFsc2U7XG4gIEZsYXBweS5yZXNwb25zZSA9IG51bGw7XG5cbiAgaWYgKGxldmVsLmVkaXRDb2RlKSB7XG4gICAgY29kZSA9IGRyb3BsZXRVdGlscy5nZW5lcmF0ZUNvZGVBbGlhc2VzKG51bGwsICdGbGFwcHknKTtcbiAgICBjb2RlICs9IHN0dWRpb0FwcC5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgfVxuXG4gIHZhciBjb2RlQ2xpY2sgPSBCbG9ja2x5LkdlbmVyYXRvci5ibG9ja1NwYWNlVG9Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0phdmFTY3JpcHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2ZsYXBweV93aGVuQ2xpY2snKTtcbiAgdmFyIHdoZW5DbGlja0Z1bmMgPSBjb2RlZ2VuLmZ1bmN0aW9uRnJvbUNvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVDbGljaywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHVkaW9BcHA6IHN0dWRpb0FwcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRmxhcHB5OiBhcGkgfSApO1xuXG4gIHZhciBjb2RlQ29sbGlkZUdyb3VuZCA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSmF2YVNjcmlwdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZmxhcHB5X3doZW5Db2xsaWRlR3JvdW5kJyk7XG4gIHZhciB3aGVuQ29sbGlkZUdyb3VuZEZ1bmMgPSBjb2RlZ2VuLmZ1bmN0aW9uRnJvbUNvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVDb2xsaWRlR3JvdW5kLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0dWRpb0FwcDogc3R1ZGlvQXBwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGbGFwcHk6IGFwaSB9ICk7XG5cbiAgdmFyIGNvZGVFbnRlck9ic3RhY2xlID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdKYXZhU2NyaXB0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmbGFwcHlfd2hlbkVudGVyT2JzdGFjbGUnKTtcbiAgdmFyIHdoZW5FbnRlck9ic3RhY2xlRnVuYyA9IGNvZGVnZW4uZnVuY3Rpb25Gcm9tQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZUVudGVyT2JzdGFjbGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3R1ZGlvQXBwOiBzdHVkaW9BcHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZsYXBweTogYXBpIH0gKTtcblxuICB2YXIgY29kZUNvbGxpZGVPYnN0YWNsZSA9IEJsb2NrbHkuR2VuZXJhdG9yLmJsb2NrU3BhY2VUb0NvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSmF2YVNjcmlwdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUnKTtcbiAgdmFyIHdoZW5Db2xsaWRlT2JzdGFjbGVGdW5jID0gY29kZWdlbi5mdW5jdGlvbkZyb21Db2RlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlQ29sbGlkZU9ic3RhY2xlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0dWRpb0FwcDogc3R1ZGlvQXBwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGbGFwcHk6IGFwaSB9ICk7XG5cbiAgdmFyIGNvZGVXaGVuUnVuQnV0dG9uID0gQmxvY2tseS5HZW5lcmF0b3IuYmxvY2tTcGFjZVRvQ29kZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdKYXZhU2NyaXB0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd3aGVuX3J1bicpO1xuICB2YXIgd2hlblJ1bkJ1dHRvbkZ1bmMgPSBjb2RlZ2VuLmZ1bmN0aW9uRnJvbUNvZGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVXaGVuUnVuQnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0dWRpb0FwcDogc3R1ZGlvQXBwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGbGFwcHk6IGFwaSB9ICk7XG5cblxuICBzdHVkaW9BcHAucGxheUF1ZGlvKCdzdGFydCcpO1xuXG4gIC8vIHN0dWRpb0FwcC5yZXNldChmYWxzZSk7XG5cbiAgLy8gU2V0IGV2ZW50IGhhbmRsZXJzIGFuZCBzdGFydCB0aGUgb25UaWNrIHRpbWVyXG4gIEZsYXBweS53aGVuQ2xpY2sgPSB3aGVuQ2xpY2tGdW5jO1xuICBGbGFwcHkud2hlbkNvbGxpZGVHcm91bmQgPSB3aGVuQ29sbGlkZUdyb3VuZEZ1bmM7XG4gIEZsYXBweS53aGVuRW50ZXJPYnN0YWNsZSA9IHdoZW5FbnRlck9ic3RhY2xlRnVuYztcbiAgRmxhcHB5LndoZW5Db2xsaWRlT2JzdGFjbGUgPSB3aGVuQ29sbGlkZU9ic3RhY2xlRnVuYztcbiAgRmxhcHB5LndoZW5SdW5CdXR0b24gPSB3aGVuUnVuQnV0dG9uRnVuYztcblxuICBGbGFwcHkudGlja0NvdW50ID0gMDtcbiAgRmxhcHB5LmZpcnN0QWN0aXZlVGljayA9IC0xO1xuICBGbGFwcHkuZ2FtZU92ZXJUaWNrID0gMDtcbiAgaWYgKEZsYXBweS5pbnRlcnZhbElkKSB7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwoRmxhcHB5LmludGVydmFsSWQpO1xuICB9XG4gIEZsYXBweS5pbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKEZsYXBweS5vblRpY2ssIEZsYXBweS5zY2FsZS5zdGVwU3BlZWQpO1xufTtcblxuRmxhcHB5Lm9uUHV6emxlQ29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKGxldmVsLmZyZWVQbGF5KSB7XG4gICAgRmxhcHB5LnJlc3VsdCA9IFJlc3VsdFR5cGUuU1VDQ0VTUztcbiAgfVxuXG4gIC8vIFN0b3AgZXZlcnl0aGluZyBvbiBzY3JlZW5cbiAgRmxhcHB5LmNsZWFyRXZlbnRIYW5kbGVyc0tpbGxUaWNrTG9vcCgpO1xuXG4gIC8vIElmIHdlIGtub3cgdGhleSBzdWNjZWVkZWQsIG1hcmsgbGV2ZWxDb21wbGV0ZSB0cnVlXG4gIC8vIE5vdGUgdGhhdCB3ZSBoYXZlIG5vdCB5ZXQgYW5pbWF0ZWQgdGhlIHN1Y2Nlc2Z1bCBydW5cbiAgdmFyIGxldmVsQ29tcGxldGUgPSAoRmxhcHB5LnJlc3VsdCA9PSBSZXN1bHRUeXBlLlNVQ0NFU1MpO1xuXG4gIC8vIElmIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgZnJlZSBwbGF5LCBhbHdheXMgcmV0dXJuIHRoZSBmcmVlIHBsYXlcbiAgLy8gcmVzdWx0IHR5cGVcbiAgaWYgKGxldmVsLmZyZWVQbGF5KSB7XG4gICAgRmxhcHB5LnRlc3RSZXN1bHRzID0gVGVzdFJlc3VsdHMuRlJFRV9QTEFZO1xuICB9IGVsc2Uge1xuICAgIEZsYXBweS50ZXN0UmVzdWx0cyA9IHN0dWRpb0FwcC5nZXRUZXN0UmVzdWx0cyhsZXZlbENvbXBsZXRlKTtcbiAgfVxuXG4gIC8vIFNwZWNpYWwgY2FzZSBmb3IgRmxhcHB5IGxldmVsIDEgd2hlcmUgeW91IGhhdmUgdGhlIHJpZ2h0IGJsb2NrcywgYnV0IHlvdVxuICAvLyBkb24ndCBmbGFwIHRvIHRoZSBnb2FsLiAgTm90ZTogU2VlIHBpdm90YWwgaXRlbSA2NjM2MjUwNCBmb3Igd2h5IHdlXG4gIC8vIGNoZWNrIGZvciBib3RoIFRPT19GRVdfQkxPQ0tTX0ZBSUwgYW5kIExFVkVMX0lOQ09NUExFVEVfRkFJTCBoZXJlLlxuICBpZiAobGV2ZWwuaWQgPT09IFwiMVwiICYmXG4gICAgKEZsYXBweS50ZXN0UmVzdWx0cyA9PT0gVGVzdFJlc3VsdHMuVE9PX0ZFV19CTE9DS1NfRkFJTCB8fFxuICAgICBGbGFwcHkudGVzdFJlc3VsdHMgPT09IFRlc3RSZXN1bHRzLkxFVkVMX0lOQ09NUExFVEVfRkFJTCkpIHtcbiAgICAvLyBGZWVkYmFjayBtZXNzYWdlIGlzIGZvdW5kIGluIGxldmVsLm90aGVyMVN0YXJFcnJvci5cbiAgICBGbGFwcHkudGVzdFJlc3VsdHMgPSBUZXN0UmVzdWx0cy5BUFBfU1BFQ0lGSUNfRkFJTDtcbiAgfVxuXG4gIGlmIChGbGFwcHkudGVzdFJlc3VsdHMgPj0gVGVzdFJlc3VsdHMuRlJFRV9QTEFZKSB7XG4gICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnd2luJyk7XG4gIH0gZWxzZSB7XG4gICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnZmFpbHVyZScpO1xuICB9XG5cbiAgaWYgKGxldmVsLmVkaXRDb2RlKSB7XG4gICAgRmxhcHB5LnRlc3RSZXN1bHRzID0gbGV2ZWxDb21wbGV0ZSA/XG4gICAgICBUZXN0UmVzdWx0cy5BTExfUEFTUyA6XG4gICAgICBUZXN0UmVzdWx0cy5UT09fRkVXX0JMT0NLU19GQUlMO1xuICB9XG5cbiAgdmFyIHhtbCA9IEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKTtcbiAgdmFyIHRleHRCbG9ja3MgPSBCbG9ja2x5LlhtbC5kb21Ub1RleHQoeG1sKTtcblxuICBGbGFwcHkud2FpdGluZ0ZvclJlcG9ydCA9IHRydWU7XG5cbiAgLy8gUmVwb3J0IHJlc3VsdCB0byBzZXJ2ZXIuXG4gIHN0dWRpb0FwcC5yZXBvcnQoe1xuICAgICAgICAgICAgICAgICAgICAgYXBwOiAnZmxhcHB5JyxcbiAgICAgICAgICAgICAgICAgICAgIGxldmVsOiBsZXZlbC5pZCxcbiAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogRmxhcHB5LnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5TVUNDRVNTLFxuICAgICAgICAgICAgICAgICAgICAgdGVzdFJlc3VsdDogRmxhcHB5LnRlc3RSZXN1bHRzLFxuICAgICAgICAgICAgICAgICAgICAgcHJvZ3JhbTogZW5jb2RlVVJJQ29tcG9uZW50KHRleHRCbG9ja3MpLFxuICAgICAgICAgICAgICAgICAgICAgb25Db21wbGV0ZTogRmxhcHB5Lm9uUmVwb3J0Q29tcGxldGVcbiAgICAgICAgICAgICAgICAgICAgIH0pO1xufTtcblxuLyoqXG4gKiBEaXNwbGF5IEF2YXRhciBhdCB0aGUgc3BlY2lmaWVkIGxvY2F0aW9uXG4gKiBAcGFyYW0ge251bWJlcn0geCBIb3Jpem9udGFsIFBpeGVsIGxvY2F0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IHkgVmVydGljYWwgUGl4ZWwgbG9jYXRpb24uXG4gKi9cbkZsYXBweS5kaXNwbGF5QXZhdGFyID0gZnVuY3Rpb24oeCwgeSkge1xuICB2YXIgYXZhdGFySWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhdmF0YXInKTtcbiAgYXZhdGFySWNvbi5zZXRBdHRyaWJ1dGUoJ3gnLCB4KTtcbiAgYXZhdGFySWNvbi5zZXRBdHRyaWJ1dGUoJ3knLCB5KTtcbn07XG5cbi8qKlxuICogZGlzcGxheSBtb3ZpbmcgZ29hbFxuICovXG5GbGFwcHkuZGlzcGxheUdvYWwgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFGbGFwcHkuZ29hbFgpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGdvYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ29hbCcpO1xuICBnb2FsLnNldEF0dHJpYnV0ZSgneCcsIEZsYXBweS5nb2FsWCk7XG4gIGdvYWwuc2V0QXR0cmlidXRlKCd5JywgRmxhcHB5LmdvYWxZKTtcbn07XG5cblxuLyoqXG4gKiBEaXNwbGF5IGdyb3VuZCBhdCBnaXZlbiB0aWNrQ291bnRcbiAqL1xuRmxhcHB5LmRpc3BsYXlHcm91bmQgPSBmdW5jdGlvbih0aWNrQ291bnQpIHtcbiAgaWYgKCFsZXZlbC5ncm91bmQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG9mZnNldCA9IHRpY2tDb3VudCAqIEZsYXBweS5TUEVFRDtcbiAgb2Zmc2V0ID0gb2Zmc2V0ICUgRmxhcHB5LkdST1VORF9XSURUSDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBGbGFwcHkuTUFaRV9XSURUSCAvIEZsYXBweS5HUk9VTkRfV0lEVEggKyAxOyBpKyspIHtcbiAgICB2YXIgZ3JvdW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dyb3VuZCcgKyBpKTtcbiAgICBncm91bmQuc2V0QXR0cmlidXRlKCd4JywgLW9mZnNldCArIGkgKiBGbGFwcHkuR1JPVU5EX1dJRFRIKTtcbiAgICBncm91bmQuc2V0QXR0cmlidXRlKCd5JywgRmxhcHB5Lk1BWkVfSEVJR0hUIC0gRmxhcHB5LkdST1VORF9IRUlHSFQpO1xuICB9XG59O1xuXG4vKipcbiAqIERpc3BsYXkgYWxsIG9ic3RhY2xlc1xuICovXG5GbGFwcHkuZGlzcGxheU9ic3RhY2xlcyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBGbGFwcHkub2JzdGFjbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIG9ic3RhY2xlID0gRmxhcHB5Lm9ic3RhY2xlc1tpXTtcbiAgICB2YXIgdG9wSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvYnN0YWNsZV90b3AnICsgaSk7XG4gICAgdG9wSWNvbi5zZXRBdHRyaWJ1dGUoJ3gnLCBvYnN0YWNsZS54KTtcbiAgICB0b3BJY29uLnNldEF0dHJpYnV0ZSgneScsIG9ic3RhY2xlLmdhcFN0YXJ0IC0gRmxhcHB5Lk9CU1RBQ0xFX0hFSUdIVCk7XG5cbiAgICB2YXIgYm90dG9tSWNvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvYnN0YWNsZV9ib3R0b20nICsgaSk7XG4gICAgYm90dG9tSWNvbi5zZXRBdHRyaWJ1dGUoJ3gnLCBvYnN0YWNsZS54KTtcbiAgICBib3R0b21JY29uLnNldEF0dHJpYnV0ZSgneScsIG9ic3RhY2xlLmdhcFN0YXJ0ICsgRmxhcHB5LkdBUF9TSVpFKTtcbiAgfVxufTtcblxuRmxhcHB5LmRpc3BsYXlTY29yZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2NvcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NvcmUnKTtcbiAgc2NvcmUudGV4dENvbnRlbnQgPSBGbGFwcHkucGxheWVyU2NvcmU7XG59O1xuXG5GbGFwcHkuZmxhcCA9IGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgdmFyIGRlZmF1bHRGbGFwID0gbGV2ZWwuZGVmYXVsdEZsYXAgfHwgXCJOT1JNQUxcIjtcbiAgRmxhcHB5LmF2YXRhclZlbG9jaXR5ID0gYW1vdW50IHx8IGFwaS5GbGFwSGVpZ2h0W2RlZmF1bHRGbGFwXTtcbn07XG5cbkZsYXBweS5zZXRHYXBIZWlnaHQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIG1pbkdhcFNpemUgPSBGbGFwcHkuTUFaRV9IRUlHSFQgLSBGbGFwcHkuTUlOX09CU1RBQ0xFX0hFSUdIVCAtXG4gICAgRmxhcHB5Lk9CU1RBQ0xFX0hFSUdIVDtcbiAgaWYgKHZhbHVlIDwgbWluR2FwU2l6ZSkge1xuICAgIHZhbHVlID0gbWluR2FwU2l6ZTtcbiAgfVxuICBGbGFwcHkuR0FQX1NJWkUgPSB2YWx1ZTtcbn07XG5cbnZhciBza2luVGhlbWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09PSAnZmxhcHB5Jykge1xuICAgIHJldHVybiBza2luO1xuICB9XG4gIHJldHVybiBza2luW3ZhbHVlXTtcbn07XG5cbkZsYXBweS5zZXRCYWNrZ3JvdW5kID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhY2tncm91bmQnKTtcbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICBza2luVGhlbWUodmFsdWUpLmJhY2tncm91bmQpO1xufTtcblxuRmxhcHB5LnNldFBsYXllciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhdmF0YXInKTtcbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICBza2luVGhlbWUodmFsdWUpLmF2YXRhcik7XG59O1xuXG5GbGFwcHkuc2V0T2JzdGFjbGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIGVsZW1lbnQ7XG4gIEZsYXBweS5vYnN0YWNsZXMuZm9yRWFjaChmdW5jdGlvbiAob2JzdGFjbGUsIGluZGV4KSB7XG4gICAgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvYnN0YWNsZV90b3AnICsgaW5kZXgpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICBza2luVGhlbWUodmFsdWUpLm9ic3RhY2xlX3RvcCk7XG5cbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29ic3RhY2xlX2JvdHRvbScgKyBpbmRleCk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgIHNraW5UaGVtZSh2YWx1ZSkub2JzdGFjbGVfYm90dG9tKTtcbiAgfSk7XG59O1xuXG5GbGFwcHkuc2V0R3JvdW5kID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGlmICghbGV2ZWwuZ3JvdW5kKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBlbGVtZW50LCBpO1xuICBmb3IgKGkgPSAwOyBpIDwgRmxhcHB5Lk1BWkVfV0lEVEggLyBGbGFwcHkuR1JPVU5EX1dJRFRIICsgMTsgaSsrKSB7XG4gICAgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdncm91bmQnICsgaSk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgIHNraW5UaGVtZSh2YWx1ZSkuZ3JvdW5kKTtcbiAgfVxufTtcblxudmFyIGNoZWNrVGlja0xpbWl0ID0gZnVuY3Rpb24oKSB7XG4gIGlmICghbGV2ZWwudGlja0xpbWl0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKChGbGFwcHkudGlja0NvdW50IC0gRmxhcHB5LmZpcnN0QWN0aXZlVGljaykgPj0gbGV2ZWwudGlja0xpbWl0ICYmXG4gICAgKEZsYXBweS5nYW1lU3RhdGUgPT09IEZsYXBweS5HYW1lU3RhdGVzLkFDVElWRSB8fFxuICAgIEZsYXBweS5nYW1lU3RhdGUgPT09IEZsYXBweS5HYW1lU3RhdGVzLk9WRVIpKSB7XG4gICAgLy8gV2UnbGwgaWdub3JlIHRpY2sgbGltaXQgaWYgd2UncmUgZW5kaW5nIHNvIHRoYXQgd2UgZnVsbHkgZmluaXNoIGVuZGluZ1xuICAgIC8vIHNlcXVlbmNlXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG52YXIgY2hlY2tGaW5pc2hlZCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gaWYgd2UgaGF2ZSBhIHN1Y2NjZXNzIGNvbmRpdGlvbiBhbmQgaGF2ZSBhY2NvbXBsaXNoZWQgaXQsIHdlJ3JlIGRvbmUgYW5kIHN1Y2Nlc3NmdWxcbiAgaWYgKGxldmVsLmdvYWwgJiYgbGV2ZWwuZ29hbC5zdWNjZXNzQ29uZGl0aW9uICYmIGxldmVsLmdvYWwuc3VjY2Vzc0NvbmRpdGlvbigpKSB7XG4gICAgRmxhcHB5LnJlc3VsdCA9IFJlc3VsdFR5cGUuU1VDQ0VTUztcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIGlmIHdlIGhhdmUgYSBmYWlsdXJlIGNvbmRpdGlvbiwgYW5kIGl0J3MgYmVlbiByZWFjaGVkLCB3ZSdyZSBkb25lIGFuZCBmYWlsZWRcbiAgaWYgKGxldmVsLmdvYWwgJiYgbGV2ZWwuZ29hbC5mYWlsdXJlQ29uZGl0aW9uICYmIGxldmVsLmdvYWwuZmFpbHVyZUNvbmRpdGlvbigpKSB7XG4gICAgRmxhcHB5LnJlc3VsdCA9IFJlc3VsdFR5cGUuRkFJTFVSRTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIiBpZD1cInN2Z0ZsYXBweVwiPlxcbjwvc3ZnPlxcbjxkaXYgaWQ9XCJjYXBhY2l0eUJ1YmJsZVwiPlxcbiAgPGRpdiBpZD1cImNhcGFjaXR5XCI+PC9kaXY+XFxuPC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxOyB2YXIgbXNnID0gcmVxdWlyZSgnLi4vbG9jYWxlJykgOyBidWYucHVzaCgnXFxuXFxuPGRpdiBpZD1cInJpZ2h0LWJ1dHRvbi1jZWxsXCI+XFxuICA8YnV0dG9uIGlkPVwicmlnaHRCdXR0b25cIiBjbGFzcz1cInNoYXJlXCI+XFxuICAgIDxpbWcgc3JjPVwiJywgZXNjYXBlKCg1LCAgYXNzZXRVcmwoJ21lZGlhLzF4MS5naWYnKSApKSwgJ1wiPicsIGVzY2FwZSgoNSwgIG1zZy5maW5pc2goKSApKSwgJ1xcbiAgPC9idXR0b24+XFxuPC9kaXY+XFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFdPUktTUEFDRV9CVUZGRVI6IDIwLFxuICBXT1JLU1BBQ0VfQ09MX1dJRFRIOiAyMTAsXG4gIFdPUktTUEFDRV9ST1dfSEVJR0hUOiAxMjAsXG5cbiAgQVZBVEFSX0hFSUdIVDogMjQsXG4gIEFWQVRBUl9XSURUSDogMzQsXG4gIEFWQVRBUl9ZX09GRlNFVDogMFxufTsiLCIvKipcbiAqIEJsb2NrbHkgQXBwOiBGbGFwcHlcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMyBDb2RlLm9yZ1xuICpcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBjb21tb25Nc2cgPSByZXF1aXJlKCcuLi9sb2NhbGUnKTtcbnZhciBibG9ja1V0aWxzID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgXyA9IHV0aWxzLmdldExvZGFzaCgpO1xudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcblxudmFyIEZMQVBQWV9WQUxVRSA9ICdcImZsYXBweVwiJztcbnZhciBSQU5ET01fVkFMVUUgPSAncmFuZG9tJztcblxudmFyIGdlbmVyYXRlU2V0dGVyQ29kZSA9IGZ1bmN0aW9uIChjdHgsIG5hbWUpIHtcbiAgdmFyIHZhbHVlID0gY3R4LmdldFRpdGxlVmFsdWUoJ1ZBTFVFJyk7XG4gIGlmICh2YWx1ZSA9PT0gUkFORE9NX1ZBTFVFKSB7XG4gICAgdmFyIHBvc3NpYmxlVmFsdWVzID1cbiAgICAgIF8oY3R4LlZBTFVFUylcbiAgICAgICAgLm1hcChmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gaXRlbVsxXTsgfSlcbiAgICAgICAgLnJlamVjdChmdW5jdGlvbiAoaXRlbVZhbHVlKSB7IHJldHVybiBpdGVtVmFsdWUgPT09IFJBTkRPTV9WQUxVRTsgfSk7XG4gICAgdmFsdWUgPSAnRmxhcHB5LnJhbmRvbShbJyArIHBvc3NpYmxlVmFsdWVzICsgJ10pJztcbiAgfVxuXG4gIHJldHVybiAnRmxhcHB5LicgKyBuYW1lICsgJyhcXCdibG9ja19pZF8nICsgY3R4LmlkICsgJ1xcJywgJyArXG4gICAgdmFsdWUgKyAnKTtcXG4nO1xufTtcblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBza2luID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5za2luO1xuICB2YXIgaXNLMSA9IGJsb2NrSW5zdGFsbE9wdGlvbnMuaXNLMTtcblxuICB2YXIgZ2VuZXJhdG9yID0gYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0Jyk7XG4gIGJsb2NrbHkuSmF2YVNjcmlwdCA9IGdlbmVyYXRvcjtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfd2hlbkNsaWNrID0ge1xuICAgIC8vIEJsb2NrIHRvIGhhbmRsZSBldmVudCB3aGVyZSBtb3VzZSBpcyBjbGlja2VkXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTQwLCAxLjAwLCAwLjc0KTtcbiAgICAgIGlmIChpc0sxKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGNvbW1vbk1zZy53aGVuKCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkSW1hZ2Uoc2tpbi5jbGlja0ljb24pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpLmFwcGVuZFRpdGxlKG1zZy53aGVuQ2xpY2soKSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KGZhbHNlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2hlbkNsaWNrVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmZsYXBweV93aGVuQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgaGFuZGxpbmcgY2xpY2sgZXZlbnQuXG4gICAgcmV0dXJuICdcXG4nO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV93aGVuQ29sbGlkZUdyb3VuZCA9IHtcbiAgICAvLyBCbG9jayB0byBoYW5kbGUgZXZlbnQgd2hlcmUgZmxhcHB5IGhpdHMgZ3JvdW5kXG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTQwLCAxLjAwLCAwLjc0KTtcbiAgICAgIGlmIChpc0sxKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGNvbW1vbk1zZy53aGVuKCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkSW1hZ2Uoc2tpbi5jb2xsaWRlR3JvdW5kSWNvbikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KCkuYXBwZW5kVGl0bGUobXNnLndoZW5Db2xsaWRlR3JvdW5kKCkpO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudChmYWxzZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndoZW5Db2xsaWRlR3JvdW5kVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgZ2VuZXJhdG9yLmZsYXBweV93aGVuQ29sbGlkZUdyb3VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBoYW5kbGluZyBjbGljayBldmVudC5cbiAgICByZXR1cm4gJ1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUgPSB7XG4gICAgLy8gQmxvY2sgdG8gaGFuZGxlIGV2ZW50IHdoZXJlIGZsYXBweSBoaXRzIGEgT2JzdGFjbGVcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxNDAsIDEuMDAsIDAuNzQpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoY29tbW9uTXNnLndoZW4oKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShza2luLmNvbGxpZGVPYnN0YWNsZUljb24pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpLmFwcGVuZFRpdGxlKG1zZy53aGVuQ29sbGlkZU9ic3RhY2xlKCkpO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudChmYWxzZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLndoZW5Db2xsaWRlT2JzdGFjbGVUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3doZW5Db2xsaWRlT2JzdGFjbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgaGFuZGxpbmcgY29sbGlkZSBPYnN0YWNsZSBldmVudC5cbiAgICByZXR1cm4gJ1xcbic7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3doZW5FbnRlck9ic3RhY2xlID0ge1xuICAgIC8vIEJsb2NrIHRvIGhhbmRsZSBldmVudCB3aGVyZSBmbGFwcHkgZW50ZXJzIGEgT2JzdGFjbGVcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVigxNDAsIDEuMDAsIDAuNzQpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoY29tbW9uTXNnLndoZW4oKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShza2luLmVudGVyT2JzdGFjbGVJY29uKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cud2hlbkVudGVyT2JzdGFjbGUoKSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KGZhbHNlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cud2hlbkVudGVyT2JzdGFjbGVUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3doZW5FbnRlck9ic3RhY2xlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEdlbmVyYXRlIEphdmFTY3JpcHQgZm9yIGhhbmRsaW5nIGVudGVyIE9ic3RhY2xlLlxuICAgIHJldHVybiAnXFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfZmxhcCA9IHtcbiAgICAvLyBCbG9jayBmb3IgZmxhcHBpbmcgKGZseWluZyB1cHdhcmRzKVxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIGlmIChpc0sxKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5mbGFwKCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkSW1hZ2Uoc2tpbi5mbGFwSWNvbikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KCkuYXBwZW5kVGl0bGUobXNnLmZsYXAoKSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5mbGFwVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gLy8gdXNlZCB0byBoYXZlIGEgZmxhcHB5X3doZW5SdW5CdXR0b25DbGljay5cbiAgLy8gYmxvY2tseS5CbG9ja3MuZmxhcHB5X3doZW5SdW5CdXR0b25DbGljayA9IGJsb2NrbHkuQmxvY2tzLndoZW5fcnVuO1xuICAvLyBnZW5lcmF0b3IuZmxhcHB5X3doZW5SdW5CdXR0b25DbGljayA9IGdlbmVyYXRvci53aGVuX3J1bjtcblxuICBnZW5lcmF0b3IuZmxhcHB5X2ZsYXAgPSBmdW5jdGlvbiAodmVsb2NpdHkpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBtb3ZpbmcgbGVmdC5cbiAgICByZXR1cm4gJ0ZsYXBweS5mbGFwKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfZmxhcF9oZWlnaHQgPSB7XG4gICAgLy8gQmxvY2sgZm9yIGZsYXBwaW5nIChmbHlpbmcgdXB3YXJkcylcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRVMpO1xuICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5WQUxVRVNbM11bMV0pOyAvLyBkZWZhdWx0IHRvIG5vcm1hbFxuXG4gICAgICB0aGlzLnNldEhTVigxODQsIDEuMDAsIDAuNzQpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuZmxhcFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9mbGFwX2hlaWdodC5WQUxVRVMgPVxuICAgICAgW1ttc2cuZmxhcFJhbmRvbSgpLCBSQU5ET01fVkFMVUVdLFxuICAgICAgIFttc2cuZmxhcFZlcnlTbWFsbCgpLCAnRmxhcHB5LkZsYXBIZWlnaHQuVkVSWV9TTUFMTCddLFxuICAgICAgIFttc2cuZmxhcFNtYWxsKCksICdGbGFwcHkuRmxhcEhlaWdodC5TTUFMTCddLFxuICAgICAgIFttc2cuZmxhcE5vcm1hbCgpLCAnRmxhcHB5LkZsYXBIZWlnaHQuTk9STUFMJ10sXG4gICAgICAgW21zZy5mbGFwTGFyZ2UoKSwgJ0ZsYXBweS5GbGFwSGVpZ2h0LkxBUkdFJ10sXG4gICAgICAgW21zZy5mbGFwVmVyeUxhcmdlKCksICdGbGFwcHkuRmxhcEhlaWdodC5WRVJZX0xBUkdFJ11dO1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfZmxhcF9oZWlnaHQgPSBmdW5jdGlvbiAodmVsb2NpdHkpIHtcbiAgICByZXR1cm4gZ2VuZXJhdGVTZXR0ZXJDb2RlKHRoaXMsICdmbGFwJyk7XG4gIH07XG5cbiAgZnVuY3Rpb24gb25Tb3VuZFNlbGVjdGVkKHNvdW5kVmFsdWUpIHtcbiAgICBpZiAoc291bmRWYWx1ZSA9PT0gUkFORE9NX1ZBTFVFKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHN0dWRpb0FwcC5wbGF5QXVkaW8odXRpbHMuc3RyaXBRdW90ZXMoc291bmRWYWx1ZSkpO1xuICB9XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3BsYXlTb3VuZCA9IHtcbiAgICAvLyBCbG9jayBmb3IgcGxheWluZyBzb3VuZC5cbiAgICBXSU5HX0ZMQVBfU09VTkQ6ICdcInNmeF93aW5nXCInLFxuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuVkFMVUVTID0gaXNLMSA/IHRoaXMuazFTb3VuZENob2ljZXMgOiB0aGlzLnNvdW5kQ2hvaWNlcztcbiAgICAgIHZhciBzb3VuZERyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFUywgb25Tb3VuZFNlbGVjdGVkKTtcbiAgICAgIHNvdW5kRHJvcGRvd24uc2V0VmFsdWUodGhpcy5XSU5HX0ZMQVBfU09VTkQpO1xuXG4gICAgICBpZiAoaXNLMSkge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShjb21tb25Nc2cucGxheSgpKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZEltYWdlKHNraW4uc291bmRJY29uKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUoc291bmREcm9wZG93biwgJ1ZBTFVFJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKS5hcHBlbmRUaXRsZShzb3VuZERyb3Bkb3duLCAnVkFMVUUnKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRIU1YoMTg0LCAxLjAwLCAwLjc0KTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLnBsYXlTb3VuZFRvb2x0aXAoKSk7XG4gICAgfSxcbiAgICBnZXQgazFTb3VuZENob2ljZXMoKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBbbXNnLnNvdW5kUmFuZG9tKCksIFJBTkRPTV9WQUxVRV0sXG4gICAgICAgIFttc2cuc291bmRCb3VuY2UoKSwgJ1wid2FsbFwiJ10sXG4gICAgICAgIFttc2cuc291bmRDcnVuY2goKSwgJ1wid2FsbDBcIiddLFxuICAgICAgICBbbXNnLnNvdW5kRGllKCksICdcInNmeF9kaWVcIiddLFxuICAgICAgICBbbXNnLnNvdW5kSGl0KCksICdcInNmeF9oaXRcIiddLFxuICAgICAgICBbbXNnLnNvdW5kUG9pbnQoKSwgJ1wic2Z4X3BvaW50XCInXSxcbiAgICAgICAgW21zZy5zb3VuZFN3b29zaCgpLCAnXCJzZnhfc3dvb3NoaW5nXCInXSxcbiAgICAgICAgW21zZy5zb3VuZFdpbmcoKSwgdGhpcy5XSU5HX0ZMQVBfU09VTkRdLFxuICAgICAgICBbbXNnLnNvdW5kSmV0KCksICdcImpldFwiJ10sXG4gICAgICAgIFttc2cuc291bmRDcmFzaCgpLCAnXCJjcmFzaFwiJ10sXG4gICAgICAgIFttc2cuc291bmRKaW5nbGUoKSwgJ1wiamluZ2xlXCInXSxcbiAgICAgICAgW21zZy5zb3VuZFNwbGFzaCgpLCAnXCJzcGxhc2hcIiddLFxuICAgICAgICBbbXNnLnNvdW5kTGFzZXIoKSwgJ1wibGFzZXJcIiddXG4gICAgICBdO1xuICAgIH0sXG4gICAgZ2V0IHNvdW5kQ2hvaWNlcygpIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIFttc2cucGxheVNvdW5kUmFuZG9tKCksIFJBTkRPTV9WQUxVRV0sXG4gICAgICAgIFttc2cucGxheVNvdW5kQm91bmNlKCksICdcIndhbGxcIiddLFxuICAgICAgICBbbXNnLnBsYXlTb3VuZENydW5jaCgpLCAnXCJ3YWxsMFwiJ10sXG4gICAgICAgIFttc2cucGxheVNvdW5kRGllKCksICdcInNmeF9kaWVcIiddLFxuICAgICAgICBbbXNnLnBsYXlTb3VuZEhpdCgpLCAnXCJzZnhfaGl0XCInXSxcbiAgICAgICAgW21zZy5wbGF5U291bmRQb2ludCgpLCAnXCJzZnhfcG9pbnRcIiddLFxuICAgICAgICBbbXNnLnBsYXlTb3VuZFN3b29zaCgpLCAnXCJzZnhfc3dvb3NoaW5nXCInXSxcbiAgICAgICAgW21zZy5wbGF5U291bmRXaW5nKCksIHRoaXMuV0lOR19GTEFQX1NPVU5EXSxcbiAgICAgICAgW21zZy5wbGF5U291bmRKZXQoKSwgJ1wiamV0XCInXSxcbiAgICAgICAgW21zZy5wbGF5U291bmRDcmFzaCgpLCAnXCJjcmFzaFwiJ10sXG4gICAgICAgIFttc2cucGxheVNvdW5kSmluZ2xlKCksICdcImppbmdsZVwiJ10sXG4gICAgICAgIFttc2cucGxheVNvdW5kU3BsYXNoKCksICdcInNwbGFzaFwiJ10sXG4gICAgICAgIFttc2cucGxheVNvdW5kTGFzZXIoKSwgJ1wibGFzZXJcIiddXG4gICAgICBdO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3BsYXlTb3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ3BsYXlTb3VuZCcpO1xuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9pbmNyZW1lbnRQbGF5ZXJTY29yZSA9IHtcbiAgICAvLyBCbG9jayBmb3IgaW5jcmVtZW50aW5nIHRoZSBwbGF5ZXIncyBzY29yZS5cbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICBpZiAoaXNLMSkge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShjb21tb25Nc2cuc2NvcmUoKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShza2luLnNjb3JlQ2FyZCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobXNnLmluY3JlbWVudFBsYXllclNjb3JlKCkpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5pbmNyZW1lbnRQbGF5ZXJTY29yZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGdlbmVyYXRvci5mbGFwcHlfaW5jcmVtZW50UGxheWVyU2NvcmUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBpbmNyZW1lbnRpbmcgdGhlIHBsYXllcidzIHNjb3JlLlxuICAgIHJldHVybiAnRmxhcHB5LmluY3JlbWVudFBsYXllclNjb3JlKFxcJ2Jsb2NrX2lkXycgKyB0aGlzLmlkICsgJ1xcJyk7XFxuJztcbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfZW5kR2FtZSA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDE4NCwgMS4wMCwgMC43NCk7XG4gICAgICBpZiAoaXNLMSkge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShjb21tb25Nc2cuZW5kKCkpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkSW1hZ2Uoc2tpbi5lbmRJY29uKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKS5hcHBlbmRUaXRsZShtc2cuZW5kR2FtZSgpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICB0aGlzLnNldFRvb2x0aXAobXNnLmVuZEdhbWVUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X2VuZEdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBHZW5lcmF0ZSBKYXZhU2NyaXB0IGZvciBpbmNyZW1lbnRpbmcgdGhlIHBsYXllcidzIHNjb3JlLlxuICAgIHJldHVybiAnRmxhcHB5LmVuZEdhbWUoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnKTtcXG4nO1xuICB9O1xuXG4gIC8qKlxuICAgKiBzZXRTcGVlZFxuICAgKi9cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldFNwZWVkID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIGlmIChpc0sxKSB7XG4gICAgICAgIHZhciBmaWVsZEltYWdlRHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZEltYWdlRHJvcGRvd24odGhpcy5LMV9WQUxVRVMsIDYzLCAzMyk7XG4gICAgICAgIGZpZWxkSW1hZ2VEcm9wZG93bi5zZXRWYWx1ZSh0aGlzLksxX1ZBTFVFU1sxXVsxXSk7IC8vIGRlZmF1bHQgdG8gbm9ybWFsXG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG1zZy5zZXRTcGVlZCgpKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShmaWVsZEltYWdlRHJvcGRvd24sICdWQUxVRScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFUyk7XG4gICAgICAgIGRyb3Bkb3duLnNldFZhbHVlKHRoaXMuVkFMVUVTWzNdWzFdKTsgLy8gZGVmYXVsdCB0byBub3JtYWxcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KCkuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5zZXRTcGVlZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRTcGVlZC5LMV9WQUxVRVMgPVxuICAgIFtbc2tpbi5zcGVlZFNsb3csICdGbGFwcHkuTGV2ZWxTcGVlZC5TTE9XJ10sXG4gICAgICBbc2tpbi5zcGVlZE1lZGl1bSwgJ0ZsYXBweS5MZXZlbFNwZWVkLk5PUk1BTCddLFxuICAgICAgW3NraW4uc3BlZWRGYXN0LCAnRmxhcHB5LkxldmVsU3BlZWQuRkFTVCddXTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0U3BlZWQuVkFMVUVTID1cbiAgICAgIFtbbXNnLnNwZWVkUmFuZG9tKCksIFJBTkRPTV9WQUxVRV0sXG4gICAgICAgW21zZy5zcGVlZFZlcnlTbG93KCksICdGbGFwcHkuTGV2ZWxTcGVlZC5WRVJZX1NMT1cnXSxcbiAgICAgICBbbXNnLnNwZWVkU2xvdygpLCAnRmxhcHB5LkxldmVsU3BlZWQuU0xPVyddLFxuICAgICAgIFttc2cuc3BlZWROb3JtYWwoKSwgJ0ZsYXBweS5MZXZlbFNwZWVkLk5PUk1BTCddLFxuICAgICAgIFttc2cuc3BlZWRGYXN0KCksICdGbGFwcHkuTGV2ZWxTcGVlZC5GQVNUJ10sXG4gICAgICAgW21zZy5zcGVlZFZlcnlGYXN0KCksICdGbGFwcHkuTGV2ZWxTcGVlZC5WRVJZX0ZBU1QnXV07XG5cbiAgZ2VuZXJhdG9yLmZsYXBweV9zZXRTcGVlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ3NldFNwZWVkJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIHNldEdhcEhlaWdodFxuICAgKi9cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldEdhcEhlaWdodCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRVMpO1xuICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5WQUxVRVNbM11bMV0pOyAgLy8gZGVmYXVsdCB0byBub3JtYWxcblxuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVkFMVUUnKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuc2V0R2FwSGVpZ2h0VG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldEdhcEhlaWdodC5WQUxVRVMgPVxuICAgICAgW1ttc2cuc2V0R2FwUmFuZG9tKCksIFJBTkRPTV9WQUxVRV0sXG4gICAgICAgW21zZy5zZXRHYXBWZXJ5U21hbGwoKSwgJ0ZsYXBweS5HYXBIZWlnaHQuVkVSWV9TTUFMTCddLFxuICAgICAgIFttc2cuc2V0R2FwU21hbGwoKSwgJ0ZsYXBweS5HYXBIZWlnaHQuU01BTEwnXSxcbiAgICAgICBbbXNnLnNldEdhcE5vcm1hbCgpLCAnRmxhcHB5LkdhcEhlaWdodC5OT1JNQUwnXSxcbiAgICAgICBbbXNnLnNldEdhcExhcmdlKCksICdGbGFwcHkuR2FwSGVpZ2h0LkxBUkdFJ10sXG4gICAgICAgW21zZy5zZXRHYXBWZXJ5TGFyZ2UoKSwgJ0ZsYXBweS5HYXBIZWlnaHQuVkVSWV9MQVJHRSddXTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3NldEdhcEhlaWdodCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ3NldEdhcEhlaWdodCcpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBzZXRCYWNrZ3JvdW5kXG4gICAqL1xuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0QmFja2dyb3VuZCA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB2YXIgZHJvcGRvd247XG4gICAgICB2YXIgaW5wdXQgPSB0aGlzLmFwcGVuZER1bW15SW5wdXQoKTtcbiAgICAgIGlmIChpc0sxKSB7XG4gICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKG1zZy5zZXRCYWNrZ3JvdW5kKCkpO1xuICAgICAgICBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkSW1hZ2VEcm9wZG93bih0aGlzLksxX0NIT0lDRVMsIDUwLCAzMCk7XG4gICAgICAgIGRyb3Bkb3duLnNldFZhbHVlKEZMQVBQWV9WQUxVRSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRVMpO1xuICAgICAgICBkcm9wZG93bi5zZXRWYWx1ZShGTEFQUFlfVkFMVUUpO1xuICAgICAgfVxuXG4gICAgICBpbnB1dC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1ZBTFVFJyk7XG5cbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuc2V0QmFja2dyb3VuZFRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRCYWNrZ3JvdW5kLlZBTFVFUyA9XG4gICAgICBbW21zZy5zZXRCYWNrZ3JvdW5kUmFuZG9tKCksIFJBTkRPTV9WQUxVRV0sXG4gICAgICAgW21zZy5zZXRCYWNrZ3JvdW5kRmxhcHB5KCksIEZMQVBQWV9WQUxVRV0sXG4gICAgICAgW21zZy5zZXRCYWNrZ3JvdW5kTmlnaHQoKSwgJ1wibmlnaHRcIiddLFxuICAgICAgIFttc2cuc2V0QmFja2dyb3VuZFNjaUZpKCksICdcInNjaWZpXCInXSxcbiAgICAgICBbbXNnLnNldEJhY2tncm91bmRVbmRlcndhdGVyKCksICdcInVuZGVyd2F0ZXJcIiddLFxuICAgICAgIFttc2cuc2V0QmFja2dyb3VuZENhdmUoKSwgJ1wiY2F2ZVwiJ10sXG4gICAgICAgW21zZy5zZXRCYWNrZ3JvdW5kU2FudGEoKSwgJ1wic2FudGFcIiddXTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0QmFja2dyb3VuZC5LMV9DSE9JQ0VTID1cbiAgICAgIFtbc2tpbi5iYWNrZ3JvdW5kLCBGTEFQUFlfVkFMVUVdLFxuICAgICAgIFtza2luLm5pZ2h0LmJhY2tncm91bmQsICdcIm5pZ2h0XCInXSxcbiAgICAgICBbc2tpbi5zY2lmaS5iYWNrZ3JvdW5kLCAnXCJzY2lmaVwiJ10sXG4gICAgICAgW3NraW4udW5kZXJ3YXRlci5iYWNrZ3JvdW5kLCAnXCJ1bmRlcndhdGVyXCInXSxcbiAgICAgICBbc2tpbi5jYXZlLmJhY2tncm91bmQsICdcImNhdmVcIiddLFxuICAgICAgIFtza2luLnNhbnRhLmJhY2tncm91bmQsICdcInNhbnRhXCInXSxcbiAgICAgICBbc2tpbi5yYW5kb21QdXJwbGVJY29uLCBSQU5ET01fVkFMVUVdXTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3NldEJhY2tncm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZ2VuZXJhdGVTZXR0ZXJDb2RlKHRoaXMsICdzZXRCYWNrZ3JvdW5kJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIHNldFBsYXllclxuICAgKi9cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldFBsYXllciA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB2YXIgZHJvcGRvd247XG4gICAgICB2YXIgaW5wdXQgPSB0aGlzLmFwcGVuZER1bW15SW5wdXQoKTtcbiAgICAgIGlmIChpc0sxKSB7XG4gICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKG1zZy5zZXRQbGF5ZXIoKSk7XG4gICAgICAgIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGRJbWFnZURyb3Bkb3duKHRoaXMuSzFfQ0hPSUNFUywgMzQsIDI0KTtcbiAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUoRkxBUFBZX1ZBTFVFKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRyb3Bkb3duID0gbmV3IGJsb2NrbHkuRmllbGREcm9wZG93bih0aGlzLlZBTFVFUyk7XG4gICAgICAgIGRyb3Bkb3duLnNldFZhbHVlKEZMQVBQWV9WQUxVRSk7XG4gICAgICB9XG4gICAgICBpbnB1dC5hcHBlbmRUaXRsZShkcm9wZG93biwgJ1ZBTFVFJyk7XG5cbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuc2V0UGxheWVyVG9vbHRpcCgpKTtcbiAgICB9XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldFBsYXllci5WQUxVRVMgPVxuICAgICAgW1ttc2cuc2V0UGxheWVyUmFuZG9tKCksIFJBTkRPTV9WQUxVRV0sXG4gICAgICAgW21zZy5zZXRQbGF5ZXJGbGFwcHkoKSwgRkxBUFBZX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldFBsYXllclJlZEJpcmQoKSwgJ1wicmVkYmlyZFwiJ10sXG4gICAgICAgW21zZy5zZXRQbGF5ZXJTY2lGaSgpLCAnXCJzY2lmaVwiJ10sXG4gICAgICAgW21zZy5zZXRQbGF5ZXJVbmRlcndhdGVyKCksICdcInVuZGVyd2F0ZXJcIiddLFxuICAgICAgIFttc2cuc2V0UGxheWVyU2FudGEoKSwgJ1wic2FudGFcIiddLFxuICAgICAgIFttc2cuc2V0UGxheWVyQ2F2ZSgpLCAnXCJjYXZlXCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllclNoYXJrKCksICdcInNoYXJrXCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllckVhc3RlcigpLCAnXCJlYXN0ZXJcIiddLFxuICAgICAgIFttc2cuc2V0UGxheWVyQmF0bWFuKCksICdcImJhdG1hblwiJ10sXG4gICAgICAgW21zZy5zZXRQbGF5ZXJTdWJtYXJpbmUoKSwgJ1wic3VibWFyaW5lXCInXSxcbiAgICAgICBbbXNnLnNldFBsYXllclVuaWNvcm4oKSwgJ1widW5pY29yblwiJ10sXG4gICAgICAgW21zZy5zZXRQbGF5ZXJGYWlyeSgpLCAnXCJmYWlyeVwiJ10sXG4gICAgICAgW21zZy5zZXRQbGF5ZXJTdXBlcm1hbigpLCAnXCJzdXBlcm1hblwiJ10sXG4gICAgICAgW21zZy5zZXRQbGF5ZXJUdXJrZXkoKSwgJ1widHVya2V5XCInXV07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldFBsYXllci5LMV9DSE9JQ0VTID1cbiAgICAgIFtbc2tpbi5hdmF0YXIsIEZMQVBQWV9WQUxVRV0sXG4gICAgICAgW3NraW4ucmVkYmlyZC5hdmF0YXIsICdcInJlZGJpcmRcIiddLFxuICAgICAgIFtza2luLnNjaWZpLmF2YXRhciwgJ1wic2NpZmlcIiddLFxuICAgICAgIFtza2luLnVuZGVyd2F0ZXIuYXZhdGFyLCAnXCJ1bmRlcndhdGVyXCInXSxcbiAgICAgICBbc2tpbi5zYW50YS5hdmF0YXIsICdcInNhbnRhXCInXSxcbiAgICAgICBbc2tpbi5jYXZlLmF2YXRhciwgJ1wiY2F2ZVwiJ10sXG4gICAgICAgW3NraW4uc2hhcmsuYXZhdGFyLCAnXCJzaGFya1wiJ10sXG4gICAgICAgW3NraW4uZWFzdGVyLmF2YXRhciwgJ1wiZWFzdGVyXCInXSxcbiAgICAgICBbc2tpbi5iYXRtYW4uYXZhdGFyLCAnXCJiYXRtYW5cIiddLFxuICAgICAgIFtza2luLnN1Ym1hcmluZS5hdmF0YXIsICdcInN1Ym1hcmluZVwiJ10sXG4gICAgICAgW3NraW4udW5pY29ybi5hdmF0YXIsICdcInVuaWNvcm5cIiddLFxuICAgICAgIFtza2luLmZhaXJ5LmF2YXRhciwgJ1wiZmFpcnlcIiddLFxuICAgICAgIFtza2luLnN1cGVybWFuLmF2YXRhciwgJ1wic3VwZXJtYW5cIiddLFxuICAgICAgIFtza2luLnR1cmtleS5hdmF0YXIsICdcInR1cmtleVwiJ10sXG4gICAgICAgW3NraW4ucmFuZG9tUHVycGxlSWNvbiwgUkFORE9NX1ZBTFVFXV07XG5cbiAgZ2VuZXJhdG9yLmZsYXBweV9zZXRQbGF5ZXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZ2VuZXJhdGVTZXR0ZXJDb2RlKHRoaXMsICdzZXRQbGF5ZXInKTtcbiAgfTtcblxuICAvKipcbiAgICogc2V0T2JzdGFjbGVcbiAgICovXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRPYnN0YWNsZSA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB2YXIgZHJvcGRvd247XG4gICAgICB2YXIgaW5wdXQgPSB0aGlzLmFwcGVuZER1bW15SW5wdXQoKTtcbiAgICAgIGlmIChpc0sxKSB7XG4gICAgICAgIGlucHV0LmFwcGVuZFRpdGxlKG1zZy5zZXRPYnN0YWNsZSgpKTtcbiAgICAgICAgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZEltYWdlRHJvcGRvd24odGhpcy5LMV9DSE9JQ0VTLCA1MCwgMzApO1xuICAgICAgICBkcm9wZG93bi5zZXRWYWx1ZShGTEFQUFlfVkFMVUUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUVTKTtcbiAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUoRkxBUFBZX1ZBTFVFKTtcbiAgICAgIH1cblxuICAgICAgaW5wdXQuYXBwZW5kVGl0bGUoZHJvcGRvd24sICdWQUxVRScpO1xuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5zZXRPYnN0YWNsZVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRPYnN0YWNsZS5WQUxVRVMgPVxuICAgICAgW1ttc2cuc2V0T2JzdGFjbGVSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldE9ic3RhY2xlRmxhcHB5KCksIEZMQVBQWV9WQUxVRV0sXG4gICAgICAgW21zZy5zZXRPYnN0YWNsZVNjaUZpKCksICdcInNjaWZpXCInXSxcbiAgICAgICBbbXNnLnNldE9ic3RhY2xlVW5kZXJ3YXRlcigpLCAnXCJ1bmRlcndhdGVyXCInXSxcbiAgICAgICBbbXNnLnNldE9ic3RhY2xlQ2F2ZSgpLCAnXCJjYXZlXCInXSxcbiAgICAgICBbbXNnLnNldE9ic3RhY2xlU2FudGEoKSwgJ1wic2FudGFcIiddLFxuICAgICAgIFttc2cuc2V0T2JzdGFjbGVMYXNlcigpLCAnXCJsYXNlclwiJ11dO1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRPYnN0YWNsZS5LMV9DSE9JQ0VTID1cbiAgICAgIFtbc2tpbi5vYnN0YWNsZV9ib3R0b21fdGh1bWIsIEZMQVBQWV9WQUxVRV0sXG4gICAgICAgW3NraW4uc2NpZmkub2JzdGFjbGVfYm90dG9tX3RodW1iLCAnXCJzY2lmaVwiJ10sXG4gICAgICAgW3NraW4udW5kZXJ3YXRlci5vYnN0YWNsZV9ib3R0b21fdGh1bWIsICdcInVuZGVyd2F0ZXJcIiddLFxuICAgICAgIFtza2luLmNhdmUub2JzdGFjbGVfYm90dG9tX3RodW1iLCAnXCJjYXZlXCInXSxcbiAgICAgICBbc2tpbi5zYW50YS5vYnN0YWNsZV9ib3R0b21fdGh1bWIsICdcInNhbnRhXCInXSxcbiAgICAgICBbc2tpbi5sYXNlci5vYnN0YWNsZV9ib3R0b21fdGh1bWIsICdcImxhc2VyXCInXSxcbiAgICAgICBbc2tpbi5yYW5kb21QdXJwbGVJY29uLCBSQU5ET01fVkFMVUVdXTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3NldE9ic3RhY2xlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlU2V0dGVyQ29kZSh0aGlzLCAnc2V0T2JzdGFjbGUnKTtcbiAgfTtcblxuICAvKipcbiAgICogc2V0R3JvdW5kXG4gICAqL1xuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0R3JvdW5kID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHZhciBkcm9wZG93bjtcbiAgICAgIHZhciBpbnB1dCA9IHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpO1xuICAgICAgaWYgKGlzSzEpIHtcbiAgICAgICAgaW5wdXQuYXBwZW5kVGl0bGUobXNnLnNldEdyb3VuZCgpKTtcbiAgICAgICAgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZEltYWdlRHJvcGRvd24odGhpcy5LMV9DSE9JQ0VTLCA1MCwgMzApO1xuICAgICAgICBkcm9wZG93bi5zZXRWYWx1ZShGTEFQUFlfVkFMVUUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZHJvcGRvd24gPSBuZXcgYmxvY2tseS5GaWVsZERyb3Bkb3duKHRoaXMuVkFMVUVTKTtcbiAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUoRkxBUFBZX1ZBTFVFKTtcbiAgICAgIH1cbiAgICAgIGlucHV0LmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVkFMVUUnKTtcblxuICAgICAgdGhpcy5zZXRJbnB1dHNJbmxpbmUodHJ1ZSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgICAgdGhpcy5zZXRUb29sdGlwKG1zZy5zZXRHcm91bmRUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0R3JvdW5kLlZBTFVFUyA9XG4gICAgICBbW21zZy5zZXRHcm91bmRSYW5kb20oKSwgUkFORE9NX1ZBTFVFXSxcbiAgICAgICBbbXNnLnNldEdyb3VuZEZsYXBweSgpLCBGTEFQUFlfVkFMVUVdLFxuICAgICAgIFttc2cuc2V0R3JvdW5kU2NpRmkoKSwgJ1wic2NpZmlcIiddLFxuICAgICAgIFttc2cuc2V0R3JvdW5kVW5kZXJ3YXRlcigpLCAnXCJ1bmRlcndhdGVyXCInXSxcbiAgICAgICBbbXNnLnNldEdyb3VuZENhdmUoKSwgJ1wiY2F2ZVwiJ10sXG4gICAgICAgW21zZy5zZXRHcm91bmRTYW50YSgpLCAnXCJzYW50YVwiJ10sXG4gICAgICAgW21zZy5zZXRHcm91bmRMYXZhKCksICdcImxhdmFcIiddXTtcblxuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0R3JvdW5kLksxX0NIT0lDRVMgPVxuICAgICAgW1tza2luLmdyb3VuZF90aHVtYiwgRkxBUFBZX1ZBTFVFXSxcbiAgICAgICBbc2tpbi5zY2lmaS5ncm91bmRfdGh1bWIsICdcInNjaWZpXCInXSxcbiAgICAgICBbc2tpbi51bmRlcndhdGVyLmdyb3VuZF90aHVtYiwgJ1widW5kZXJ3YXRlclwiJ10sXG4gICAgICAgW3NraW4uY2F2ZS5ncm91bmRfdGh1bWIsICdcImNhdmVcIiddLFxuICAgICAgIFtza2luLnNhbnRhLmdyb3VuZF90aHVtYiwgJ1wic2FudGFcIiddLFxuICAgICAgIFtza2luLmxhdmEuZ3JvdW5kX3RodW1iLCAnXCJsYXZhXCInXSxcbiAgICAgICBbc2tpbi5yYW5kb21QdXJwbGVJY29uLCBSQU5ET01fVkFMVUVdXTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3NldEdyb3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBnZW5lcmF0ZVNldHRlckNvZGUodGhpcywgJ3NldEdyb3VuZCcpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBzZXRHcmF2aXR5XG4gICAqL1xuICBibG9ja2x5LkJsb2Nrcy5mbGFwcHlfc2V0R3Jhdml0eSA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkcm9wZG93biA9IG5ldyBibG9ja2x5LkZpZWxkRHJvcGRvd24odGhpcy5WQUxVRVMpO1xuICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5WQUxVRVNbM11bMV0pOyAgLy8gZGVmYXVsdCB0byBub3JtYWxcblxuICAgICAgdGhpcy5zZXRIU1YoMzEyLCAwLjMyLCAwLjYyKTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKGRyb3Bkb3duLCAnVkFMVUUnKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuc2V0R3Jhdml0eVRvb2x0aXAoKSk7XG4gICAgfVxuICB9O1xuXG4gIGJsb2NrbHkuQmxvY2tzLmZsYXBweV9zZXRHcmF2aXR5LlZBTFVFUyA9XG4gICAgICBbW21zZy5zZXRHcmF2aXR5UmFuZG9tKCksIFJBTkRPTV9WQUxVRV0sXG4gICAgICAgW21zZy5zZXRHcmF2aXR5VmVyeUxvdygpLCAnRmxhcHB5LkdyYXZpdHkuVkVSWV9MT1cnXSxcbiAgICAgICBbbXNnLnNldEdyYXZpdHlMb3coKSwgJ0ZsYXBweS5HcmF2aXR5LkxPVyddLFxuICAgICAgIFttc2cuc2V0R3Jhdml0eU5vcm1hbCgpLCAnRmxhcHB5LkdyYXZpdHkuTk9STUFMJ10sXG4gICAgICAgW21zZy5zZXRHcmF2aXR5SGlnaCgpLCAnRmxhcHB5LkdyYXZpdHkuSElHSCddLFxuICAgICAgIFttc2cuc2V0R3Jhdml0eVZlcnlIaWdoKCksICdGbGFwcHkuR3Jhdml0eS5WRVJZX0hJR0gnXVxuICAgICAgXTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3NldEdyYXZpdHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZ2VuZXJhdGVTZXR0ZXJDb2RlKHRoaXMsICdzZXRHcmF2aXR5Jyk7XG4gIH07XG5cbiAgYmxvY2tseS5CbG9ja3MuZmxhcHB5X3NldFNjb3JlID0ge1xuICAgIC8vIEJsb2NrIGZvciBtb3ZpbmcgZm9yd2FyZCBvciBiYWNrd2FyZCB0aGUgaW50ZXJuYWwgbnVtYmVyIG9mIHBpeGVscy5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0SFNWKDMxMiwgMC4zMiwgMC42Mik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShtc2cuc2V0U2NvcmUoKSlcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRUZXh0SW5wdXQoJzAnLFxuICAgICAgICAgICAgYmxvY2tseS5GaWVsZFRleHRJbnB1dC5udW1iZXJWYWxpZGF0b3IpLCAnVkFMVUUnKTtcbiAgICAgIHRoaXMuc2V0SW5wdXRzSW5saW5lKHRydWUpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICAgIHRoaXMuc2V0VG9vbHRpcChtc2cuc2V0U2NvcmVUb29sdGlwKCkpO1xuICAgIH1cbiAgfTtcblxuICBnZW5lcmF0b3IuZmxhcHB5X3NldFNjb3JlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gR2VuZXJhdGUgSmF2YVNjcmlwdCBmb3IgbW92aW5nIGZvcndhcmQgb3IgYmFja3dhcmQgdGhlIGludGVybmFsIG51bWJlciBvZlxuICAgIC8vIHBpeGVscy5cbiAgICB2YXIgdmFsdWUgPSB3aW5kb3cucGFyc2VJbnQodGhpcy5nZXRUaXRsZVZhbHVlKCdWQUxVRScpLCAxMCk7XG4gICAgcmV0dXJuICdGbGFwcHkuc2V0U2NvcmUoXFwnYmxvY2tfaWRfJyArIHRoaXMuaWQgKyAnXFwnLCAnICsgdmFsdWUgKyAnKTtcXG4nO1xuICB9O1xuXG4gIGRlbGV0ZSBibG9ja2x5LkJsb2Nrcy5wcm9jZWR1cmVzX2RlZnJldHVybjtcbiAgZGVsZXRlIGJsb2NrbHkuQmxvY2tzLnByb2NlZHVyZXNfaWZyZXR1cm47XG59O1xuIiwiLy8gbG9jYWxlIGZvciBmbGFwcHlcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS5mbGFwcHlfbG9jYWxlO1xuIiwidmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcblxuZXhwb3J0cy5GbGFwSGVpZ2h0ID0ge1xuICBWRVJZX1NNQUxMOiAtNixcbiAgU01BTEw6IC04LFxuICBOT1JNQUw6IC0xMSxcbiAgTEFSR0U6IC0xMyxcbiAgVkVSWV9MQVJHRTogLTE1XG59O1xuXG5leHBvcnRzLkxldmVsU3BlZWQgPSB7XG4gIFZFUllfU0xPVzogMSxcbiAgU0xPVzogMyxcbiAgTk9STUFMOiA0LFxuICBGQVNUOiA2LFxuICBWRVJZX0ZBU1Q6IDhcbn07XG5cbmV4cG9ydHMuR2FwSGVpZ2h0ID0ge1xuICBWRVJZX1NNQUxMOiA2NSxcbiAgU01BTEw6IDc1LFxuICBOT1JNQUw6IDEwMCxcbiAgTEFSR0U6IDEyNSxcbiAgVkVSWV9MQVJHRTogMTUwXG59O1xuXG5leHBvcnRzLkdyYXZpdHkgPSB7XG4gIFZFUllfTE9XOiAwLjUsXG4gIExPVzogMC43NSxcbiAgTk9STUFMOiAxLFxuICBISUdIOiAxLjI1LFxuICBWRVJZX0hJR0g6IDEuNVxufTtcblxuZXhwb3J0cy5yYW5kb20gPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gIHZhciBrZXkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB2YWx1ZXMubGVuZ3RoKTtcbiAgcmV0dXJuIHZhbHVlc1trZXldO1xufTtcblxuZXhwb3J0cy5zZXRTY29yZSA9IGZ1bmN0aW9uIChpZCwgdmFsdWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIEZsYXBweS5wbGF5ZXJTY29yZSA9IHZhbHVlO1xuICBGbGFwcHkuZGlzcGxheVNjb3JlKCk7XG59O1xuXG5leHBvcnRzLnNldEdyYXZpdHkgPSBmdW5jdGlvbiAoaWQsIHZhbHVlKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBGbGFwcHkuZ3Jhdml0eSA9IHZhbHVlO1xufTtcblxuZXhwb3J0cy5zZXRHcm91bmQgPSBmdW5jdGlvbiAoaWQsIHZhbHVlKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBGbGFwcHkuc2V0R3JvdW5kKHZhbHVlKTtcbn07XG5cbmV4cG9ydHMuc2V0T2JzdGFjbGUgPSBmdW5jdGlvbiAoaWQsIHZhbHVlKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBGbGFwcHkuc2V0T2JzdGFjbGUodmFsdWUpO1xufTtcblxuZXhwb3J0cy5zZXRQbGF5ZXIgPSBmdW5jdGlvbiAoaWQsIHZhbHVlKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBGbGFwcHkuc2V0UGxheWVyKHZhbHVlKTtcbn07XG5cbmV4cG9ydHMuc2V0R2FwSGVpZ2h0ID0gZnVuY3Rpb24gKGlkLCB2YWx1ZSkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgRmxhcHB5LnNldEdhcEhlaWdodCh2YWx1ZSk7XG59O1xuXG5leHBvcnRzLnNldEJhY2tncm91bmQgPSBmdW5jdGlvbiAoaWQsIHZhbHVlKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBGbGFwcHkuc2V0QmFja2dyb3VuZCh2YWx1ZSk7XG59O1xuXG5leHBvcnRzLnNldFNwZWVkID0gZnVuY3Rpb24gKGlkLCB2YWx1ZSkge1xuICBzdHVkaW9BcHAuaGlnaGxpZ2h0KGlkKTtcbiAgRmxhcHB5LlNQRUVEID0gdmFsdWU7XG59O1xuXG5leHBvcnRzLnBsYXlTb3VuZCA9IGZ1bmN0aW9uKGlkLCBzb3VuZE5hbWUpIHtcbiAgc3R1ZGlvQXBwLmhpZ2hsaWdodChpZCk7XG4gIHN0dWRpb0FwcC5wbGF5QXVkaW8oc291bmROYW1lKTtcbn07XG5cbmV4cG9ydHMuZmxhcCA9IGZ1bmN0aW9uIChpZCwgYW1vdW50KSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBGbGFwcHkuZmxhcChhbW91bnQpO1xufTtcblxuZXhwb3J0cy5lbmRHYW1lID0gZnVuY3Rpb24gKGlkKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBGbGFwcHkuZ2FtZVN0YXRlID0gRmxhcHB5LkdhbWVTdGF0ZXMuRU5ESU5HO1xufTtcblxuZXhwb3J0cy5pbmNyZW1lbnRQbGF5ZXJTY29yZSA9IGZ1bmN0aW9uKGlkKSB7XG4gIHN0dWRpb0FwcC5oaWdobGlnaHQoaWQpO1xuICBGbGFwcHkucGxheWVyU2NvcmUrKztcbiAgRmxhcHB5LmRpc3BsYXlTY29yZSgpO1xufTtcbiJdfQ==
