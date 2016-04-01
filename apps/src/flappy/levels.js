// todo - i think our prepoluated code counts as LOCs

var constants = require('./constants');
var flappyMsg = require('./locale');
var tb = require('../block_utils').createToolbox;
var utils = require('../utils');

var category = function (name, blocks) {
  return '<category id="' + name + '" name="' + name + '">' + blocks + '</category>';
};

var flapBlock = '<block type="flappy_flap"></block>';
var flapHeightBlock = '<block type="flappy_flap_height"></block>';
var endGameBlock = '<block type="flappy_endGame"></block>';
var playSoundBlock =  '<block type="flappy_playSound"></block>';
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

var eventBlock = function (type, child) {
  return '<block type="' + type + '" deletable="false">' +
    (child ? '<next>' + child + '</next>' : '') +
    '</block>';
};

// not movable or deletable
var anchoredBlock = function (type, child) {
  return '<block type="' + type + '" deletable="false" movable="false">' +
    (child ? '<next>' + child + '</next>' : '') +
    '</block>';
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
    'requiredBlocks': [
      [{'test': 'flap', 'type': 'flappy_flap'}]
    ],
    'obstacles': false,
    'ground': false,
    'score': false,
    'freePlay': false,
    'goal': {
      startX  : 100,
      startY: 0,
      successCondition: function () {
        return (Flappy.avatarY  <= 40);
      },
      failureCondition: function () {
        return Flappy.avatarY > Flappy.MAZE_HEIGHT;
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox':
      tb(flapBlock + playSoundBlock),
    'startBlocks':
      eventBlock('flappy_whenClick'),
    'appSpecificFailError':
      flappyMsg.flappySpecificFail()
  },

  '2': {
    'requiredBlocks': [
      [{'test': 'endGame', 'type': 'flappy_endGame'}]
    ],
    'obstacles': false,
    'ground': true,
    'score': false,
    'freePlay': false,
    'goal': {
      startX: 100,
      startY: 400 - 48 - 56 / 2,
      successCondition: function () {
        // this only happens after avatar hits ground, and we spin him because of
        // game over
        return (Flappy.avatarY  === 322 && Flappy.avatarX === 110);
      },
      failureCondition: function () {
        var avatarBottom = Flappy.avatarY + AVATAR_HEIGHT;
        var ground = Flappy.MAZE_HEIGHT - Flappy.GROUND_HEIGHT;
        return (avatarBottom >= ground && Flappy.gameState === Flappy.GameStates.ACTIVE);
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox':
      tb(flapBlock + endGameBlock + playSoundBlock),
    'startBlocks':
      eventBlock('flappy_whenClick', flapBlock) +
      eventBlock('flappy_whenCollideGround')
  },

  '3': {
    'requiredBlocks': [
      [{'test': 'setSpeed', 'type': 'flappy_setSpeed'}]
    ],
    'obstacles': false,
    'ground': true,
    'score': false,
    'freePlay': false,
    'goal': {
      startX: 400 - 55,
      startY: 0,
      moving: true,
      successCondition: function () {
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
      failureCondition: function () {
        return Flappy.activeTicks() >= 120 && Flappy.SPEED === 0;
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox':
      tb(flapBlock + playSoundBlock + setSpeedBlock),
    'startBlocks':
      eventBlock('flappy_whenClick', flapBlock) +
      eventBlock('when_run')
  },

  '4': {
    'requiredBlocks': [
      [{'test': 'endGame', 'type': 'flappy_endGame'}]
    ],
    'obstacles': true,
    'ground': true,
    'score': false,
    'freePlay': false,
    'goal': {
      startX: 600 - (56 / 2),
      startY: 400 - 48 - 56 / 2,
      moving: true,
      successCondition: function () {
        return Flappy.obstacles[0].hitAvatar &&
          Flappy.gameState === Flappy.GameStates.OVER;
      },
      failureCondition: function () {
        // todo - would be nice if we could distinguish feedback for
        // flew through pipe vs. didnt hook up endGame block
        var obstacleEnd = Flappy.obstacles[0].x + Flappy.OBSTACLE_WIDTH;
        return obstacleEnd < Flappy.avatarX;
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox':
      tb(flapBlock + endGameBlock + playSoundBlock + setSpeedBlock),
    'startBlocks':
      eventBlock('flappy_whenClick', flapBlock) +
      eventBlock('when_run', setSpeedBlock) +
      eventBlock('flappy_whenCollideObstacle')
  },

  '5': {
    'requiredBlocks': [
      [{'test': 'incrementPlayerScore', 'type': 'flappy_incrementPlayerScore'}]
    ],
    'defaultFlap': 'SMALL',
    'obstacles': true,
    'ground': true,
    'score': true,
    'freePlay': false,
    'goal': {
      // todo - kind of ugly that we end up loopin through all obstacles twice,
      // once to check for success and again to check for failure
      successCondition: function () {
        var insideObstacle = false;
        Flappy.obstacles.forEach(function (obstacle) {
          if (!obstacle.hitAvatar && obstacle.containsAvatar()) {
            insideObstacle = true;
          }
        });
        return insideObstacle && Flappy.playerScore > 0;
      },
      failureCondition: function () {
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
    'toolbox':
      tb(flapBlock + endGameBlock + incrementScoreBlock + playSoundBlock + setSpeedBlock),
    'startBlocks':
      eventBlock('flappy_whenClick', flapBlock) +
      eventBlock('flappy_whenEnterObstacle') +
      eventBlock('when_run', setSpeedBlock)
  },

  '6': {
    'requiredBlocks': [
      [{'test': 'flap', 'type': 'flappy_flap_height'}]
    ],
    'obstacles': true,
    'ground': true,
    'score': true,
    'freePlay': false,
    'goal': {
      successCondition: function () {
        var insideObstacle = false;
        Flappy.obstacles.forEach(function (obstacle) {
          if (obstacle.containsAvatar()) {
            insideObstacle = true;
          }
        });
        return insideObstacle && Flappy.playerScore > 0;
      },
      failureCondition: function () {
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
    'toolbox':
      tb(flapHeightBlock + endGameBlock + incrementScoreBlock + playSoundBlock + setSpeedBlock),
    'startBlocks':
      eventBlock('flappy_whenClick') +
      // eventBlock('flappy_whenCollideGround', endGameBlock) +
      // eventBlock('flappy_whenCollideObstacle', endGameBlock) +
      eventBlock('flappy_whenEnterObstacle', incrementScoreBlock) +
      eventBlock('when_run', setSpeedBlock)
  },

  '7': {
    'requiredBlocks': [
      [{'test': 'setBackground', 'type': 'flappy_setBackground'}]
    ],
    'obstacles': true,
    'ground': true,
    'score': true,
    'freePlay': false,
    'goal': {
      successCondition: function () {
        return (Flappy.gameState === Flappy.GameStates.OVER);
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox':
      tb(flapHeightBlock + endGameBlock + incrementScoreBlock + playSoundBlock +
        setSpeedBlock + setBackgroundBlock),
    'startBlocks':
      eventBlock('flappy_whenClick', flapHeightBlock) +
      eventBlock('flappy_whenCollideGround', endGameBlock) +
      eventBlock('flappy_whenCollideObstacle', endGameBlock) +
      eventBlock('flappy_whenEnterObstacle', incrementScoreBlock) +
      eventBlock('when_run', setSpeedBlock)
  },

  '8': {
    'requiredBlocks': [
      [{
        test: function (block) {
          return (block.type === 'flappy_setBackground' ||
            block.type === 'flappy_setPlayer') &&
            block.getTitleValue('VALUE') === 'random';
        },
        type: 'flappy_setBackground',
        titles: {
          'VALUE': 'random'
        }
      }]
    ],
    'obstacles': true,
    'ground': true,
    'score': true,
    'freePlay': false,
    'goal': {
      successCondition: function () {
        return (Flappy.gameState === Flappy.GameStates.OVER);
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox':
      tb(flapHeightBlock + endGameBlock + incrementScoreBlock + playSoundBlock +
        setSpeedBlock + setBackgroundBlock + setPlayerBlock),
    'startBlocks':
      eventBlock('flappy_whenClick', flapHeightBlock) +
      eventBlock('flappy_whenCollideGround', endGameBlock) +
      eventBlock('flappy_whenCollideObstacle', endGameBlock) +
      eventBlock('flappy_whenEnterObstacle', incrementScoreBlock) +
      eventBlock('when_run', setSpeedBlock)
  },

  '9': {
    'requiredBlocks': [
      [{
        test: function (block) {
          return block.type === 'flappy_setScore';
        },
        type: 'flappy_setScore'
      }]
    ],
    'obstacles': true,
    'ground': true,
    'score': true,
    'freePlay': false,
    'goal': {
      successCondition: function () {
        return (Flappy.gameState === Flappy.GameStates.OVER);
      }
    },
    'scale': {
      'snapRadius': 2
    },
    'toolbox':
      tb(flapHeightBlock + endGameBlock + incrementScoreBlock + playSoundBlock +
        setSpeedBlock + setBackgroundBlock + setPlayerBlock + setScoreBlock),
    'startBlocks':
      eventBlock('flappy_whenClick', flapHeightBlock) +
      eventBlock('flappy_whenCollideGround', endGameBlock) +
      eventBlock('flappy_whenCollideObstacle') +
      eventBlock('flappy_whenEnterObstacle', incrementScoreBlock) +
      eventBlock('when_run', setSpeedBlock)
  },

  '11': {
    shareable: true,
    'requiredBlocks': [
    ],
    'obstacles': true,
    'ground': true,
    'score': true,
    'freePlay': true,
    'scale': {
      'snapRadius': 2
    },
    'toolbox':
      tb(
        flapHeightBlock +
        playSoundBlock +
        incrementScoreBlock +
        endGameBlock +
        setSpeedBlock +
        setBackgroundBlock +
        setPlayerBlock +
        setObstacleBlock +
        setGroundBlock +
        setGapHeightBlock +
        setGravityBlock +
        setScoreBlock
      ),
    'startBlocks':
      eventBlock('flappy_whenClick') +
      eventBlock('flappy_whenCollideGround') +
      eventBlock('flappy_whenCollideObstacle') +
      eventBlock('flappy_whenEnterObstacle') +
      eventBlock('when_run')
  },
  'k1': {
    'requiredBlocks': [
    ],
    'obstacles': true,
    'ground': true,
    'score': true,
    'freePlay': true,
    isK1: true,
    'scale': {
      'snapRadius': 2
    },
    'toolbox':
      tb(
        flapBlock +
        endGameBlock +
        setBackgroundBlock +
        setPlayerBlock +
        setObstacleBlock +
        setGroundBlock +
        playSoundBlock +
        flapHeightBlock +
        setSpeedBlock +
        incrementScoreBlock +
        setGapHeightBlock +
        setGravityBlock +
        setScoreBlock
      ),
    'startBlocks':
      eventBlock('flappy_whenClick') +
      eventBlock('flappy_whenCollideGround') +
      eventBlock('flappy_whenCollideObstacle') +
      eventBlock('flappy_whenEnterObstacle') +
      eventBlock('when_run')
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
  'startBlocks':
    anchoredBlock('flappy_whenClick', anchoredBlock('flappy_flap')) +
    anchoredBlock('flappy_whenCollideGround', anchoredBlock('flappy_endGame')) +
    anchoredBlock('flappy_whenCollideObstacle', anchoredBlock('flappy_endGame')) +
    anchoredBlock('flappy_whenEnterObstacle', anchoredBlock('flappy_incrementPlayerScore')) +
    anchoredBlock('when_run', anchoredBlock('flappy_setSpeed'))
};

// flap to goal
module.exports.k1_2 = utils.extend(module.exports['1'], {'isK1': true});

// hit ground
module.exports.k1_3 = utils.extend(module.exports['2'], {'isK1': true});

// set speed
module.exports.k1_4 = utils.extend(module.exports['3'], {'isK1': true});

// crash into obstacle
module.exports.k1_5 = utils.extend(module.exports['4'], {'isK1': true});

// pass through obstacle, score a point
module.exports.k1_6 = utils.extend(module.exports['5'], {'isK1': true});

// score multiple points for each pass
module.exports.k1_7 = {
  'isK1': true,
  'requiredBlocks': [
    [{'test': 'incrementPlayerScore', 'type': 'flappy_incrementPlayerScore'}]
  ],
  'defaultFlap': 'SMALL',
  'obstacles': true,
  'ground': true,
  'score': true,
  'freePlay': false,
  'goal': {
    // todo - kind of ugly that we end up loopin through all obstacles twice,
    // once to check for success and again to check for failure
    successCondition: function () {
      var insideObstacle = false;
      Flappy.obstacles.forEach(function (obstacle) {
        if (!obstacle.hitAvatar && obstacle.containsAvatar()) {
          insideObstacle = true;
        }
      });
      return insideObstacle && Flappy.playerScore > 1;
    },
    failureCondition: function () {
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
  'toolbox':
    tb(flapBlock + endGameBlock + incrementScoreBlock + playSoundBlock + setSpeedBlock),
  'startBlocks':
    eventBlock('flappy_whenClick', flapBlock) +
    eventBlock('flappy_whenEnterObstacle') +
    eventBlock('when_run', setSpeedBlock)
};

// change the scene
module.exports.k1_8 = utils.extend(module.exports['7'], {
  'isK1': true,
  // override regular flappy so that we dont use variable flap block
  'toolbox':
    tb(flapBlock + endGameBlock + incrementScoreBlock + playSoundBlock +
      setSpeedBlock + setBackgroundBlock),
  'startBlocks':
    eventBlock('flappy_whenClick', flapBlock) +
    eventBlock('flappy_whenCollideGround', endGameBlock) +
    eventBlock('flappy_whenCollideObstacle', endGameBlock) +
    eventBlock('flappy_whenEnterObstacle', incrementScoreBlock) +
    eventBlock('when_run', setSpeedBlock)
});

// changing the player
module.exports.k1_9 = {
  'isK1': true,
  'requiredBlocks': [
    [{'test': 'setPlayer', 'type': 'flappy_setPlayer'}]
  ],
  'obstacles': true,
  'ground': true,
  'score': true,
  'freePlay': false,
  'goal': {
    successCondition: function () {
      return (Flappy.gameState === Flappy.GameStates.OVER);
    }
  },
  'scale': {
    'snapRadius': 2
  },
  'toolbox':
    tb(flapBlock + endGameBlock + incrementScoreBlock + playSoundBlock +
      setSpeedBlock + setBackgroundBlock + setPlayerBlock),
  'startBlocks':
    eventBlock('flappy_whenClick', flapBlock) +
    eventBlock('flappy_whenCollideGround', endGameBlock) +
    eventBlock('flappy_whenCollideObstacle', endGameBlock) +
    eventBlock('flappy_whenEnterObstacle', incrementScoreBlock) +
    eventBlock('when_run', setSpeedBlock)
};
