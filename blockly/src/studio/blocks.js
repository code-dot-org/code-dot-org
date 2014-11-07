/**
 * Blockly App: Studio
 *
 * Copyright 2014 Code.org
 *
 */
'use strict';

var msg = require('../../locale/current/studio');
var sharedFunctionalBlocks = require('../sharedFunctionalBlocks');
var commonMsg = require('../../locale/current/common');
var codegen = require('../codegen');
var functionalBlockUtils = require('../functionalBlockUtils');
var installFunctionalApiCallBlock = require('../functionalBlockUtils').installFunctionalApiCallBlock;
var tiles = require('./tiles');
var utils = require('../utils');
var _ = utils.getLodash();

var Direction = tiles.Direction;
var Position = tiles.Position;
var Emotions = tiles.Emotions;

var RANDOM_VALUE = 'random';
var HIDDEN_VALUE = '"hidden"';
var CLICK_VALUE = '"click"';
var VISIBLE_VALUE = '"visible"';
var CAVE_VALUE = '"cave"';

var generateSetterCode = function (opts) {
  var value = opts.ctx.getTitleValue('VALUE');
  if (value === RANDOM_VALUE) {
    var possibleValues =
      _(opts.ctx.VALUES)
        .map(function (item) { return item[1]; })
        .without(RANDOM_VALUE, HIDDEN_VALUE, CLICK_VALUE);
    value = 'Studio.random([' + possibleValues + '])';
  }

  return 'Studio.' + opts.name + '(\'block_id_' + opts.ctx.id + '\', ' +
    (opts.extraParams ? opts.extraParams + ', ' : '') + value + ');\n';
};

// These are set to the default values, but may be overridden
var spriteCount = 6;
var projectileCollisions = false;
var edgeCollisions = false;
var allowSpritesOutsidePlayspace = false;
var startAvatars = [];

exports.setSpriteCount = function(blockly, count) {
  spriteCount = count;
};

exports.enableProjectileCollisions = function(blockly) {
  projectileCollisions = true;
};

exports.enableEdgeCollisions = function(blockly) {
  edgeCollisions = true;
};

exports.enableSpritesOutsidePlayspace = function(blockly) {
  allowSpritesOutsidePlayspace = true;
};

exports.setStartAvatars = function (avatarList) {
  startAvatars = avatarList.slice(0);
};

/**
 * @param {function} stringGenerator A function that takes a spriteIndex and
 *   creates a string from it.
 * @returns {Array} An array of string, index pairs
 */
function spriteNumberTextArray(stringGenerator) {
  var spriteNumbers = _.range(0, spriteCount);
  return _.map(spriteNumbers, function (index) {
    return [stringGenerator({spriteIndex: index + 1}), index.toString()];
  });
}

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;
  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;
  startAvatars = skin.avatarList.slice(0); // copy avatar list

  generator.studio_eventHandlerPrologue = function() {
    return '\n';
  };

  /**
   * Creates a dropdown with options for each sprite number
   * @param {function} stringGenerator A function that takes a spriteIndex and
   *   creates a string from it.
   * @returns {Blockly.FieldDropdown}
   */
  function spriteNumberTextDropdown(stringGenerator) {
    return new blockly.FieldDropdown(spriteNumberTextArray(stringGenerator));
  }

  /**
   * Creates a dropdown with thumbnails for each starting sprite
   * @returns {Blockly.FieldImageDropdown}
   */
  function startingSpriteImageDropdown() {
    var spriteNumbers = _.range(0, spriteCount);
    var choices = _.map(spriteNumbers, function (index) {
      var skinId = startAvatars[index];
      return [skin[skinId].dropdownThumbnail, index.toString()];
    });
    return new blockly.FieldImageDropdown(choices, skin.dropdownThumbnailWidth,
      skin.dropdownThumbnailHeight);
  }

  // started separating block generation for each block into it's own function
  installVanish(blockly, generator, spriteNumberTextDropdown, startingSpriteImageDropdown, blockInstallOptions);

  generator.studio_eventHandlerPrologue = function() {
    return '\n';
  };

  blockly.Blocks.studio_whenLeft = {
    // Block to handle event when the Left arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.when())
          .appendTitle(new Blockly.FieldImage(skin.whenLeft));
      } else {
        this.appendDummyInput().appendTitle(msg.whenLeft());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenLeftTooltip());
    }
  };

  generator.studio_whenLeft = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenRight = {
    // Block to handle event when the Right arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.when())
          .appendTitle(new Blockly.FieldImage(skin.whenRight));
      } else {
        this.appendDummyInput().appendTitle(msg.whenRight());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenRightTooltip());
    }
  };

  generator.studio_whenRight = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenUp = {
    // Block to handle event when the Up arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.when())
          .appendTitle(new Blockly.FieldImage(skin.whenUp));
      } else {
        this.appendDummyInput().appendTitle(msg.whenUp());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenUpTooltip());
    }
  };

  generator.studio_whenUp = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenDown = {
    // Block to handle event when the Down arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.when())
          .appendTitle(new Blockly.FieldImage(skin.whenDown));
      } else {
        this.appendDummyInput().appendTitle(msg.whenDown());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenDownTooltip());
    }
  };

  generator.studio_whenDown = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenArrow = {
    // Block to handle event when an arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput().appendTitle(commonMsg.when());
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldImageDropdown(this.K1_VALUES), 'VALUE');
      } else {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      }
      this.setPreviousStatement(false);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whenArrowTooltip());
    }
  };

  blockly.Blocks.studio_whenArrow.K1_VALUES =
    [[skin.whenUp, 'up'],
     [skin.whenRight, 'right'],
     [skin.whenDown, 'down'],
     [skin.whenLeft, 'left']];

  blockly.Blocks.studio_whenArrow.VALUES =
      [[msg.whenArrowUp(),    'up'],
       [msg.whenArrowDown(),  'down'],
       [msg.whenArrowLeft(),  'left'],
       [msg.whenArrowRight(), 'right']];

  generator.studio_whenArrow = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_repeatForever = {
    // Block to handle the repeating tick event while the game is running.
    helpUrl: '',
    init: function () {
      this.setHSV(322, 0.90, 0.95);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.repeat());
        this.appendStatementInput('DO')
          .appendTitle(new blockly.FieldImage(skin.repeatImage));
      } else {
        this.appendDummyInput()
          .appendTitle(msg.repeatForever());
        this.appendStatementInput('DO')
          .appendTitle(msg.repeatDo());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(false);
      this.setTooltip(msg.repeatForeverTooltip());
    }
  };

  generator.studio_repeatForever = function () {
    var branch = Blockly.JavaScript.statementToCode(this, 'DO');
    return generator.studio_eventHandlerPrologue() + branch;
  };

  blockly.Blocks.studio_whenSpriteClicked = {
    // Block to handle event when sprite is clicked.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.00, 0.74);
      if (spriteCount > 1) {
        this.appendDummyInput()
          .appendTitle(spriteNumberTextDropdown(msg.whenSpriteClickedN),
                       'SPRITE');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.whenSpriteClicked());
      }
      this.setPreviousStatement(false);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whenSpriteClickedTooltip());
    }
  };

  generator.studio_whenSpriteClicked = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenSpriteCollided = {
    // Block to handle event when sprite collides with another sprite.
    helpUrl: '',
    init: function() {
      var dropdown1;
      var dropdown2;
      this.setHSV(140, 1.00, 0.74);

      if (isK1) {
        // NOTE: K1 block does not yet support projectile or edge collisions
        dropdown1 = startingSpriteImageDropdown();
        dropdown2 = startingSpriteImageDropdown();
        this.appendDummyInput().appendTitle(commonMsg.when())
          .appendTitle(new blockly.FieldImage(skin.collide))
          .appendTitle(dropdown1, 'SPRITE1');
        this.appendDummyInput()
          .appendTitle(commonMsg.and())
          .appendTitle(dropdown2, 'SPRITE2');
      } else {
        dropdown1 = spriteNumberTextDropdown(msg.whenSpriteCollidedN);
        var dropdownArray2 = [this.GROUPINGS[0]];
        dropdownArray2 = dropdownArray2.concat(
          spriteNumberTextArray(msg.whenSpriteCollidedWithN));
        dropdownArray2.unshift(this.GROUPINGS[1]);
        if (projectileCollisions) {
          dropdownArray2 = dropdownArray2.concat([this.GROUPINGS[2]]);
          dropdownArray2 = dropdownArray2.concat(this.PROJECTILES);
        }
        if (edgeCollisions) {
          dropdownArray2 = dropdownArray2.concat([this.GROUPINGS[3]]);
          dropdownArray2 = dropdownArray2.concat(this.EDGES);
        }
        dropdown2 = new blockly.FieldDropdown(dropdownArray2);
        this.appendDummyInput().appendTitle(dropdown1, 'SPRITE1');
        this.appendDummyInput().appendTitle(dropdown2, 'SPRITE2');
      }
      if (spriteCount > 1) {
        // default second dropdown to actor 2
        dropdown2.setValue('1');
      }

      this.setPreviousStatement(false);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whenSpriteCollidedTooltip());
    }
  };

  blockly.Blocks.studio_whenSpriteCollided.GROUPINGS =
      [[msg.whenSpriteCollidedWithAnything(), 'anything'],
       [msg.whenSpriteCollidedWithAnyActor(), 'any_actor'],
       [msg.whenSpriteCollidedWithAnyProjectile(), 'any_projectile'],
       [msg.whenSpriteCollidedWithAnyEdge(), 'any_edge']];

  blockly.Blocks.studio_whenSpriteCollided.PROJECTILES =
      [[msg.whenSpriteCollidedWithBlueFireball(), 'blue_fireball'],
       [msg.whenSpriteCollidedWithPurpleFireball(), 'purple_fireball'],
       [msg.whenSpriteCollidedWithRedFireball(), 'red_fireball'],
       [msg.whenSpriteCollidedWithYellowHearts(), 'yellow_hearts'],
       [msg.whenSpriteCollidedWithPurpleHearts(), 'purple_hearts'],
       [msg.whenSpriteCollidedWithRedHearts(), 'red_hearts']];

  blockly.Blocks.studio_whenSpriteCollided.EDGES =
      [[msg.whenSpriteCollidedWithTopEdge(), 'top'],
       [msg.whenSpriteCollidedWithLeftEdge(), 'left'],
       [msg.whenSpriteCollidedWithBottomEdge(), 'bottom'],
       [msg.whenSpriteCollidedWithRightEdge(), 'right']];

  generator.studio_whenSpriteCollided = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_stop = {
    // Block for stopping the movement of a sprite.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        this.appendDummyInput()
          .appendTitle(spriteNumberTextDropdown(msg.stopSpriteN), 'SPRITE');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.stopSprite());
      }
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.stopTooltip());
    }
  };

  generator.studio_stop = function() {
    // Generate JavaScript for stopping the movement of a sprite.
    return 'Studio.stop(\'block_id_' + this.id + '\', ' +
        (this.getTitleValue('SPRITE') || '0') + ');\n';
  };

  blockly.Blocks.studio_throw = {
    // Block for throwing a projectile from a sprite.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        this.appendDummyInput()
          .appendTitle(spriteNumberTextDropdown(msg.throwSpriteN), 'SPRITE');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.throwSprite());
      }
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      this.appendDummyInput()
        .appendTitle('\t');
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.DIR), 'DIR');
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.throwTooltip());
    }
  };

  blockly.Blocks.studio_throw.DIR =
        [[msg.moveDirectionUp(), Direction.NORTH.toString()],
         [msg.moveDirectionDown(), Direction.SOUTH.toString()],
         [msg.moveDirectionLeft(), Direction.WEST.toString()],
         [msg.moveDirectionRight(), Direction.EAST.toString()],
         [msg.moveDirectionRandom(), 'random']];

  blockly.Blocks.studio_throw.VALUES =
        [[msg.projectileBlueFireball(), '"blue_fireball"'],
         [msg.projectilePurpleFireball(), '"purple_fireball"'],
         [msg.projectileRedFireball(), '"red_fireball"'],
         [msg.projectileYellowHearts(), '"yellow_hearts"'],
         [msg.projectilePurpleHearts(), '"purple_hearts"'],
         [msg.projectileRedHearts(), '"red_hearts"'],
         [msg.projectileRandom(), 'random']];

  generator.studio_throw = function() {
    // Generate JavaScript for throwing a projectile from a sprite.
    var allDirections = this.DIR.slice(0, -1).map(function (item) {
      return item[1];
    });
    var dirParam = this.getTitleValue('DIR');
    if (dirParam === 'random') {
      dirParam = 'Studio.random([' + allDirections + '])';
    }
    var allValues = this.VALUES.slice(0, -1).map(function (item) {
      return item[1];
    });
    var valParam = this.getTitleValue('VALUE');
    if (valParam === 'random') {
      valParam = 'Studio.random([' + allValues + '])';
    }

    return 'Studio.throwProjectile(\'block_id_' + this.id +
        '\', ' +
        (this.getTitleValue('SPRITE') || '0') + ', ' +
        dirParam + ', ' +
        valParam + ');\n';
  };

  // Note: this block is for causing an action to happen to a projectile, not
  // to create a projectile
  blockly.Blocks.studio_makeProjectile = {
    // Block for making a projectile bounce or disappear.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      this.appendDummyInput()
        .appendTitle('\t');
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.ACTIONS), 'ACTION');
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.makeProjectileTooltip());
    }
  };

  blockly.Blocks.studio_makeProjectile.VALUES =
      [[msg.makeProjectileBlueFireball(), '"blue_fireball"'],
       [msg.makeProjectilePurpleFireball(), '"purple_fireball"'],
       [msg.makeProjectileRedFireball(), '"red_fireball"'],
       [msg.makeProjectileYellowHearts(), '"yellow_hearts"'],
       [msg.makeProjectilePurpleHearts(), '"purple_hearts"'],
       [msg.makeProjectileRedHearts(), '"red_hearts"']];

  blockly.Blocks.studio_makeProjectile.ACTIONS =
        [[msg.makeProjectileBounce(), '"bounce"'],
         [msg.makeProjectileDisappear(), '"disappear"']];

  generator.studio_makeProjectile = function() {
    // Generate JavaScript for making a projectile bounce or disappear.
    return 'Studio.makeProjectile(\'block_id_' + this.id + '\', ' +
        this.getTitleValue('VALUE') + ', ' +
        this.getTitleValue('ACTION') + ');\n';
  };

  blockly.Blocks.studio_setSpritePosition = {
    // Block for jumping a sprite to different position.
    helpUrl: '',
    init: function() {
      var dropdown;
      if (allowSpritesOutsidePlayspace) {
        dropdown = new blockly.FieldDropdown(this.VALUES_EXTENDED);
        dropdown.setValue(this.VALUES_EXTENDED[4][1]); // default to top-left
      } else {
        dropdown = new blockly.FieldDropdown(this.VALUES);
        dropdown.setValue(this.VALUES[1][1]); // default to top-left
      }
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        this.appendDummyInput()
          .appendTitle(spriteNumberTextDropdown(msg.setSpriteN), 'SPRITE');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.setSprite());
      }
      this.appendDummyInput()
        .appendTitle(dropdown, 'VALUE');
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setSpritePositionTooltip());
    }
  };

  // 9 possible positions in playspace (+ random):
  blockly.Blocks.studio_setSpritePosition.VALUES =
      [[msg.positionRandom(), RANDOM_VALUE],
       [msg.positionTopLeft(), Position.TOPLEFT.toString()],
       [msg.positionTopCenter(), Position.TOPCENTER.toString()],
       [msg.positionTopRight(), Position.TOPRIGHT.toString()],
       [msg.positionMiddleLeft(), Position.MIDDLELEFT.toString()],
       [msg.positionMiddleCenter(), Position.MIDDLECENTER.toString()],
       [msg.positionMiddleRight(), Position.MIDDLERIGHT.toString()],
       [msg.positionBottomLeft(), Position.BOTTOMLEFT.toString()],
       [msg.positionBottomCenter(), Position.BOTTOMCENTER.toString()],
       [msg.positionBottomRight(), Position.BOTTOMRIGHT.toString()]];

  // Still a slightly reduced set of 17 out of 25 possible positions (+ random):
  blockly.Blocks.studio_setSpritePosition.VALUES_EXTENDED =
      [[msg.positionRandom(), RANDOM_VALUE],
       [msg.positionOutTopLeft(), Position.OUTTOPLEFT.toString()],
       [msg.positionOutTopRight(), Position.OUTTOPRIGHT.toString()],
       [msg.positionTopOutLeft(), Position.TOPOUTLEFT.toString()],
       [msg.positionTopLeft(), Position.TOPLEFT.toString()],
       [msg.positionTopCenter(), Position.TOPCENTER.toString()],
       [msg.positionTopRight(), Position.TOPRIGHT.toString()],
       [msg.positionTopOutRight(), Position.TOPOUTRIGHT.toString()],
       [msg.positionMiddleLeft(), Position.MIDDLELEFT.toString()],
       [msg.positionMiddleCenter(), Position.MIDDLECENTER.toString()],
       [msg.positionMiddleRight(), Position.MIDDLERIGHT.toString()],
       [msg.positionBottomOutLeft(), Position.BOTTOMOUTLEFT.toString()],
       [msg.positionBottomLeft(), Position.BOTTOMLEFT.toString()],
       [msg.positionBottomCenter(), Position.BOTTOMCENTER.toString()],
       [msg.positionBottomRight(), Position.BOTTOMRIGHT.toString()],
       [msg.positionBottomOutRight(), Position.BOTTOMOUTRIGHT.toString()],
       [msg.positionOutBottomLeft(), Position.OUTBOTTOMLEFT.toString()],
       [msg.positionOutBottomRight(), Position.OUTBOTTOMRIGHT.toString()]];

  generator.studio_setSpritePosition = function() {
    return generateSetterCode({
      ctx: this,
      extraParams: (this.getTitleValue('SPRITE') || '0'),
      name: 'setSpritePosition'});
  };

  var SimpleMove = {
    DIRECTION_CONFIGS: {
      West: {
        letter: commonMsg.directionWestLetter(),
        image: skin.leftArrow,
        studioValue: Direction.WEST.toString(),
        tooltip: msg.moveLeftTooltip()
      },
      East: {
        letter: commonMsg.directionEastLetter(),
        image: skin.rightArrow,
        studioValue: Direction.EAST.toString(),
        tooltip: msg.moveRightTooltip()
      },
      North: {
        letter: commonMsg.directionNorthLetter(),
        image: skin.upArrow,
        studioValue: Direction.NORTH.toString(),
        tooltip: msg.moveUpTooltip()
      },
      South: { letter: commonMsg.directionSouthLetter(),
        image: skin.downArrow,
        studioValue: Direction.SOUTH.toString(),
        tooltip: msg.moveDownTooltip()
      }
    },
    DISTANCES: [
      [skin.shortLine, '25'],
      [skin.longLine, '400']
    ],
    DEFAULT_MOVE_DISTANCE: '100',
    generateBlocksForAllDirections: function() {
      SimpleMove.generateBlocksForDirection("North");
      SimpleMove.generateBlocksForDirection("South");
      SimpleMove.generateBlocksForDirection("West");
      SimpleMove.generateBlocksForDirection("East");
    },
    generateBlocksForDirection: function(direction) {
      generator["studio_move" + direction] = SimpleMove.generateCodeGenerator(direction, true);
      blockly.Blocks['studio_move' + direction] = SimpleMove.generateMoveBlock(direction, false);
      generator["studio_move" + direction + "Distance"] = SimpleMove.generateCodeGenerator(direction, false);
      blockly.Blocks['studio_move' + direction + "Distance"] = SimpleMove.generateMoveBlock(direction, false);
      generator["studio_move" + direction + "_length"] = SimpleMove.generateCodeGenerator(direction, false);
      blockly.Blocks['studio_move' + direction + "_length"] = SimpleMove.generateMoveBlock(direction, true);
    },
    generateMoveBlock: function(direction, hasLengthInput) {
      var directionConfig = SimpleMove.DIRECTION_CONFIGS[direction];

      return {
        helpUrl: '',
        init: function () {
          this.setHSV(184, 1.00, 0.74);
          this.appendDummyInput()
            .appendTitle(msg.moveSprite()) // move
            .appendTitle(new blockly.FieldImage(directionConfig.image)) // arrow
            .appendTitle(directionConfig.letter); // NESW

          if (spriteCount > 1) {
            this.appendDummyInput().appendTitle(startingSpriteImageDropdown(), 'SPRITE');
          }

          if (hasLengthInput) {
            this.appendDummyInput().appendTitle(new blockly.FieldImageDropdown(SimpleMove.DISTANCES), 'DISTANCE');
          }

          this.setPreviousStatement(true);
          this.setInputsInline(true);
          this.setNextStatement(true);
          this.setTooltip(directionConfig.tooltip);
        }
      };
    },
    generateCodeGenerator: function(direction, isEventMove) {
      var directionConfig = SimpleMove.DIRECTION_CONFIGS[direction];

      return function() {
        var sprite = this.getTitleValue('SPRITE') || '0';
        var direction = directionConfig.studioValue;
        var methodName = isEventMove ? 'move' : 'moveDistance';
        var distance = this.getTitleValue('DISTANCE') || SimpleMove.DEFAULT_MOVE_DISTANCE;
        return 'Studio.' + methodName + '(\'block_id_' + this.id + '\'' +
          ', ' + sprite +
          ', ' + direction +
          (isEventMove ? '' : (', ' + distance)) +
          ');\n';
      };
    }
  };

  SimpleMove.generateBlocksForAllDirections();

  blockly.Blocks.studio_move = {
    // Block for moving one frame a time.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        if (isK1) {
          this.appendDummyInput().appendTitle(msg.moveSprite())
            .appendTitle(startingSpriteImageDropdown(), 'SPRITE');
        } else {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.moveSpriteN), 'SPRITE');
        }
        this.appendDummyInput()
          .appendTitle('\t');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.moveSprite());
      }

      if (isK1) {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldImageDropdown(this.K1_DIR), 'DIR');
      } else {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.DIR), 'DIR');
      }
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveTooltip());
    }
  };

  blockly.Blocks.studio_move.K1_DIR =
      [[skin.upArrow, Direction.NORTH.toString()],
       [skin.rightArrow, Direction.EAST.toString()],
       [skin.downArrow, Direction.SOUTH.toString()],
       [skin.leftArrow, Direction.WEST.toString()]];

  blockly.Blocks.studio_move.DIR =
      [[msg.moveDirectionUp(), Direction.NORTH.toString()],
       [msg.moveDirectionDown(), Direction.SOUTH.toString()],
       [msg.moveDirectionLeft(), Direction.WEST.toString()],
       [msg.moveDirectionRight(), Direction.EAST.toString()]];

  generator.studio_move = function() {
    // Generate JavaScript for moving.
    return 'Studio.move(\'block_id_' + this.id + '\', ' +
        (this.getTitleValue('SPRITE') || '0') + ', ' +
        this.getTitleValue('DIR') + ');\n';
  };

  var initMoveDistanceBlock = function (block) {
    // Block for moving/gliding a specific distance.
    block.helpUrl = '';
    block.init = function() {
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        if (isK1) {
          this.appendDummyInput().appendTitle(msg.moveSprite())
            .appendTitle(startingSpriteImageDropdown(), 'SPRITE');
        } else {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.moveSpriteN), 'SPRITE');
        }
        this.appendDummyInput()
          .appendTitle('\t');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.moveSprite());
      }

      if (isK1) {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldImageDropdown(this.K1_DIR), 'DIR');
      } else {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.DIR), 'DIR');
      }

      this.appendDummyInput()
        .appendTitle('\t');
      if (block.params) {
        this.appendValueInput('DISTANCE')
          .setCheck('Number');
        this.appendDummyInput()
          .appendTitle(msg.moveDistancePixels());
      } else {
        if (isK1) {
          this.appendDummyInput()
            .appendTitle(new blockly.FieldImageDropdown(this.K1_DISTANCE), 'DISTANCE');
        } else {
          this.appendDummyInput()
            .appendTitle(new blockly.FieldDropdown(this.DISTANCE), 'DISTANCE');
        }
      }
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveDistanceTooltip());
    };

    block.K1_DIR =
        [[skin.upArrow, Direction.NORTH.toString()],
          [skin.rightArrow, Direction.EAST.toString()],
          [skin.downArrow, Direction.SOUTH.toString()],
          [skin.leftArrow, Direction.WEST.toString()]];

    block.DIR =
        [[msg.moveDirectionUp(), Direction.NORTH.toString()],
         [msg.moveDirectionDown(), Direction.SOUTH.toString()],
         [msg.moveDirectionLeft(), Direction.WEST.toString()],
         [msg.moveDirectionRight(), Direction.EAST.toString()],
         [msg.moveDirectionRandom(), 'random']];

    if (!block.params) {
      block.DISTANCE =
          [[msg.moveDistance25(), '25'],
           [msg.moveDistance50(), '50'],
           [msg.moveDistance100(), '100'],
           [msg.moveDistance200(), '200'],
           [msg.moveDistance400(), '400'],
           [msg.moveDistanceRandom(), 'random']];

      block.K1_DISTANCE =
        [[skin.shortLine, '25'],
        [skin.longLine, '400']];
    }
  };

  blockly.Blocks.studio_moveDistance = {};
  initMoveDistanceBlock(blockly.Blocks.studio_moveDistance);
  blockly.Blocks.studio_moveDistanceParams = { 'params': true };
  initMoveDistanceBlock(blockly.Blocks.studio_moveDistanceParams);

  generator.studio_moveDistance = function() {
    // Generate JavaScript for moving.

    var allDistances = this.DISTANCE.slice(0, -1).map(function (item) {
      return item[1];
    });
    var distParam = this.getTitleValue('DISTANCE');
    if (distParam === 'random') {
      distParam = 'Studio.random([' + allDistances + '])';
    }
    var allDirections = this.DIR.slice(0, -1).map(function (item) {
      return item[1];
    });
    var dirParam = this.getTitleValue('DIR');
    if (dirParam === 'random') {
      dirParam = 'Studio.random([' + allDirections + '])';
    }

    return 'Studio.moveDistance(\'block_id_' + this.id +
        '\', ' +
        (this.getTitleValue('SPRITE') || '0') + ', ' +
        dirParam + ', ' +
        distParam + ');\n';
  };

  generator.studio_moveDistanceParams = function() {
    // Generate JavaScript for moving (params version).

    var allDirections = this.DIR.slice(0, -1).map(function (item) {
      return item[1];
    });
    var dirParam = this.getTitleValue('DIR');
    if (dirParam === 'random') {
      dirParam = 'Studio.random([' + allDirections + '])';
    }
    var distParam = Blockly.JavaScript.valueToCode(this, 'DISTANCE',
        Blockly.JavaScript.ORDER_NONE) || '0';

    return 'Studio.moveDistance(\'block_id_' + this.id +
        '\', ' +
        (this.getTitleValue('SPRITE') || '0') + ', ' +
        dirParam + ', ' +
        distParam + ');\n';
  };

  function onSoundSelected(soundValue) {
    if (soundValue === RANDOM_VALUE) {
      return;
    }
    BlocklyApps.playAudio(utils.stripQuotes(soundValue), {volume: 1.0});
  }

  blockly.Blocks.studio_playSound = {
    // Block for playing sound.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.play())
          .appendTitle(new blockly.FieldImage(skin.soundIcon))
          .appendTitle(new blockly.FieldDropdown(this.K1_SOUNDS, onSoundSelected), 'SOUND');
      } else {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.SOUNDS, onSoundSelected), 'SOUND');
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.playSoundTooltip());
    }
  };

  blockly.Blocks.studio_playSound.K1_SOUNDS =
      [[msg.soundHit(), 'hit'],
       [msg.soundWood(), 'wood'],
       [msg.soundRetro(), 'retro'],
       [msg.soundSlap(), 'slap'],
       [msg.soundRubber(), 'rubber'],
       [msg.soundCrunch(), 'crunch'],
       [msg.soundWinPoint(), 'winpoint'],
       [msg.soundWinPoint2(), 'winpoint2'],
       [msg.soundLosePoint(), 'losepoint'],
       [msg.soundLosePoint2(), 'losepoint2'],
       [msg.soundGoal1(), 'goal1'],
       [msg.soundGoal2(), 'goal2']];

  blockly.Blocks.studio_playSound.SOUNDS =
      [[msg.playSoundHit(), 'hit'],
       [msg.playSoundWood(), 'wood'],
       [msg.playSoundRetro(), 'retro'],
       [msg.playSoundSlap(), 'slap'],
       [msg.playSoundRubber(), 'rubber'],
       [msg.playSoundCrunch(), 'crunch'],
       [msg.playSoundWinPoint(), 'winpoint'],
       [msg.playSoundWinPoint2(), 'winpoint2'],
       [msg.playSoundLosePoint(), 'losepoint'],
       [msg.playSoundLosePoint2(), 'losepoint2'],
       [msg.playSoundGoal1(), 'goal1'],
       [msg.playSoundGoal2(), 'goal2']];

  generator.studio_playSound = function() {
    // Generate JavaScript for playing a sound.
    return 'Studio.playSound(\'block_id_' + this.id + '\', \'' +
               this.getTitleValue('SOUND') + '\');\n';
  };

  blockly.Blocks.studio_changeScore = {
    // Block for changing the score.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.score())
          .appendTitle(new blockly.FieldImage(skin.scoreCard));
      } else {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(isK1 ?
                        msg.changeScoreTooltipK1() :
                        msg.changeScoreTooltip());
    }
  };

  blockly.Blocks.studio_changeScore.VALUES =
      [[msg.incrementPlayerScore(), '1'],
       [msg.decrementPlayerScore(), '-1']];

  generator.studio_changeScore = function() {
    // Generate JavaScript for changing the score.
    return 'Studio.changeScore(\'block_id_' + this.id + '\', \'' +
                (this.getTitleValue('VALUE') || '1') + '\');\n';
  };

  blockly.Blocks.studio_setScoreText = {
    // Block for setting the score text.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('TEXT')
        .appendTitle(msg.setScoreText());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setScoreTextTooltip());
    }
  };

  generator.studio_setScoreText = function() {
    // Generate JavaScript for setting the score text.
    var arg = Blockly.JavaScript.valueToCode(this, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || '';
    return 'Studio.setScoreText(\'block_id_' + this.id + '\', ' + arg + ');\n';
  };

  blockly.Blocks.studio_showCoordinates = {
    // Block for showing the protagonist's coordinates.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
        this.appendDummyInput().appendTitle(msg.showCoordinates());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.showCoordinatesTooltip());
    }
  };

  generator.studio_showCoordinates = function() {
    // Generate JavaScript for showing the protagonist's coordinates.
    return 'Studio.showCoordinates(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.studio_setSpriteSpeed = {
    // Block for setting sprite speed
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);

      if (spriteCount > 1) {
        if (isK1) {
          this.appendDummyInput().appendTitle(msg.setSprite())
            .appendTitle(startingSpriteImageDropdown(), 'SPRITE');
        } else {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.setSpriteN), 'SPRITE');
        }
      } else {
        this.appendDummyInput()
          .appendTitle(msg.setSprite());
      }

      if (isK1) {
        var fieldImageDropdown = new blockly.FieldImageDropdown(this.K1_VALUES);
        fieldImageDropdown.setValue(this.K1_VALUES[1][1]); // default to normal
        this.appendDummyInput()
          .appendTitle(msg.speed())
          .appendTitle(fieldImageDropdown, 'VALUE');
      } else {
        var dropdown = new blockly.FieldDropdown(this.VALUES);
        dropdown.setValue(this.VALUES[3][1]); // default to normal
        this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      }

      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setSpriteSpeedTooltip());
    }
  };

  blockly.Blocks.studio_setSpriteSpeed.K1_VALUES =
      [[skin.speedSlow, 'Studio.SpriteSpeed.SLOW'],
       [skin.speedMedium, 'Studio.SpriteSpeed.NORMAL'],
       [skin.speedFast, 'Studio.SpriteSpeed.FAST']];

  blockly.Blocks.studio_setSpriteSpeed.VALUES =
      [[msg.setSpriteSpeedRandom(), RANDOM_VALUE],
       [msg.setSpriteSpeedVerySlow(), 'Studio.SpriteSpeed.VERY_SLOW'],
       [msg.setSpriteSpeedSlow(), 'Studio.SpriteSpeed.SLOW'],
       [msg.setSpriteSpeedNormal(), 'Studio.SpriteSpeed.NORMAL'],
       [msg.setSpriteSpeedFast(), 'Studio.SpriteSpeed.FAST'],
       [msg.setSpriteSpeedVeryFast(), 'Studio.SpriteSpeed.VERY_FAST']];

  generator.studio_setSpriteSpeed = function () {
    return generateSetterCode({
      ctx: this,
      extraParams: (this.getTitleValue('SPRITE') || '0'),
      name: 'setSpriteSpeed'});
  };

  blockly.Blocks.studio_setSpriteSize = {
    // Block for setting sprite size
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);

      if (spriteCount > 1) {
        this.appendDummyInput()
          .appendTitle(spriteNumberTextDropdown(msg.setSpriteN), 'SPRITE');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.setSprite());
      }

      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[3][1]); // default to normal
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');

      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setSpriteSizeTooltip());
    }
  };

  blockly.Blocks.studio_setSpriteSize.VALUES =
      [[msg.setSpriteSizeRandom(), RANDOM_VALUE],
       [msg.setSpriteSizeVerySmall(), 'Studio.SpriteSize.VERY_SMALL'],
       [msg.setSpriteSizeSmall(), 'Studio.SpriteSize.SMALL'],
       [msg.setSpriteSizeNormal(), 'Studio.SpriteSize.NORMAL'],
       [msg.setSpriteSizeLarge(), 'Studio.SpriteSize.LARGE'],
       [msg.setSpriteSizeVeryLarge(), 'Studio.SpriteSize.VERY_LARGE']];

  generator.studio_setSpriteSize = function () {
    return generateSetterCode({
      ctx: this,
      extraParams: (this.getTitleValue('SPRITE') || '0'),
      name: 'setSpriteSize'});
  };
  /**
   * setBackground
   */
  blockly.Blocks.studio_setBackground = {
    helpUrl: '',
    init: function() {
      this.setHSV(312, 0.32, 0.62);

      var dropdown;
      if (isK1) {
        dropdown = new blockly.FieldImageDropdown(
                                  this.IMAGE_CHOICES,
                                  skin.dropdownThumbnailWidth,
                                  skin.dropdownThumbnailHeight);
        this.appendDummyInput()
          .appendTitle(msg.setBackground())
          .appendTitle(dropdown, 'VALUE');
      } else {
        dropdown = new blockly.FieldDropdown(this.VALUES);
        this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      }
      dropdown.setValue(CAVE_VALUE);  // default to cave
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setBackgroundTooltip());
    }
  };

  blockly.Blocks.studio_setBackground.VALUES =
      [[msg.setBackgroundRandom(), RANDOM_VALUE],
       [msg.setBackgroundCave(), CAVE_VALUE],
       [msg.setBackgroundNight(), '"night"'],
       [msg.setBackgroundCloudy(), '"cloudy"'],
       [msg.setBackgroundUnderwater(), '"underwater"'],
       [msg.setBackgroundHardcourt(), '"hardcourt"'],
       [msg.setBackgroundBlack(), '"black"'],
       [msg.setBackgroundCity(), '"city"'],
       [msg.setBackgroundDesert(), '"desert"'],
       [msg.setBackgroundRainbow(), '"rainbow"'],
       [msg.setBackgroundSoccer(), '"soccer"'],
       [msg.setBackgroundSpace(), '"space"'],
       [msg.setBackgroundTennis(), '"tennis"'],
       [msg.setBackgroundWinter(), '"winter"']
       ];

  blockly.Blocks.studio_setBackground.IMAGE_CHOICES =
      [[skin.cave.background, CAVE_VALUE],
       [skin.night.background, '"night"'],
       [skin.cloudy.background, '"cloudy"'],
       [skin.underwater.background, '"underwater"'],
       [skin.hardcourt.background, '"hardcourt"'],
       [skin.black.background, '"black"'],
       [skin.city.background, '"city"'],
       [skin.desert.background, '"desert"'],
       [skin.rainbow.background, '"rainbow"'],
       [skin.soccer.background, '"soccer"'],
       [skin.space.background, '"space"'],
       [skin.tennis.background, '"tennis"'],
       [skin.winter.background, '"winter"'],
       [skin.randomPurpleIcon, RANDOM_VALUE]];

  generator.studio_setBackground = function() {
    return generateSetterCode({ctx: this, name: 'setBackground'});
  };

  /**
   * showTitleScreen
   */
  var initShowTitleScreenBlock = function (block) {
    block.helpUrl = '';
    block.init = function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(msg.showTitleScreen());
      if (block.params) {
        this.appendValueInput('TITLE')
          .setCheck('String')
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendTitle(msg.showTitleScreenTitle());
        this.appendValueInput('TEXT')
          .setCheck('String')
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendTitle(msg.showTitleScreenText());
      } else {
        this.appendDummyInput()
          .appendTitle(msg.showTitleScreenTitle())
          .appendTitle(new Blockly.FieldImage(
                  Blockly.assetUrl('media/quote0.png'), 12, 12))
          .appendTitle(new Blockly.FieldTextInput(
              msg.showTSDefTitle()),
              'TITLE')
          .appendTitle(new Blockly.FieldImage(
                  Blockly.assetUrl('media/quote1.png'), 12, 12));
        this.appendDummyInput()
          .appendTitle(msg.showTitleScreenText())
          .appendTitle(new Blockly.FieldImage(
                  Blockly.assetUrl('media/quote0.png'), 12, 12))
          .appendTitle(new Blockly.FieldTextInput(msg.showTSDefText()), 'TEXT')
          .appendTitle(new Blockly.FieldImage(
                  Blockly.assetUrl('media/quote1.png'), 12, 12));
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.showTitleScreenTooltip());
    };
  };

  blockly.Blocks.studio_showTitleScreen = {};
  initShowTitleScreenBlock(blockly.Blocks.studio_showTitleScreen);
  blockly.Blocks.studio_showTitleScreenParams = { 'params': true };
  initShowTitleScreenBlock(blockly.Blocks.studio_showTitleScreenParams);

  generator.studio_showTitleScreen = function() {
    // Generate JavaScript for showing title screen.
    return 'Studio.showTitleScreen(\'block_id_' + this.id +
               '\', ' +
               blockly.JavaScript.quote_(this.getTitleValue('TITLE')) + ', ' +
               blockly.JavaScript.quote_(this.getTitleValue('TEXT')) + ');\n';
  };

  generator.studio_showTitleScreenParams = function() {
    // Generate JavaScript for showing title screen (param version).
    var titleParam = Blockly.JavaScript.valueToCode(this, 'TITLE',
        Blockly.JavaScript.ORDER_NONE) || '';
    var textParam = Blockly.JavaScript.valueToCode(this, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || '';
    return 'Studio.showTitleScreen(\'block_id_' + this.id +
               '\', ' + titleParam + ', ' + textParam + ');\n';
  };

  if (isK1) {
    /**
     * setSprite (K1 version: only sets visible/hidden)
     */
    blockly.Blocks.studio_setSprite = {
      helpUrl: '',
      init: function() {
        this.setHSV(312, 0.32, 0.62);
        var visibilityTextDropdown = new blockly.FieldDropdown(this.VALUES);
        visibilityTextDropdown.setValue(VISIBLE_VALUE);  // default to visible
        this.appendDummyInput().appendTitle(visibilityTextDropdown, 'VALUE');
        if (spriteCount > 1) {
            this.appendDummyInput()
              .appendTitle(startingSpriteImageDropdown(), 'SPRITE');
        }
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(msg.setSpriteK1Tooltip());
      }
    };

    blockly.Blocks.studio_setSprite.VALUES =
        [[msg.setSpriteHideK1(), HIDDEN_VALUE],
         [msg.setSpriteShowK1(), VISIBLE_VALUE]];
  } else {
    /**
     * setSprite
     */
    blockly.Blocks.studio_setSprite = {
      helpUrl: '',
      init: function() {
        var dropdown = new blockly.FieldDropdown(this.VALUES);
        dropdown.setValue(this.VALUES[2][1]);  // default to witch

        this.setHSV(312, 0.32, 0.62);
        if (spriteCount > 1) {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.setSpriteN), 'SPRITE');
        } else {
          this.appendDummyInput()
            .appendTitle(msg.setSprite());
        }
        this.appendDummyInput()
          .appendTitle(dropdown, 'VALUE');
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(msg.setSpriteTooltip());
      }
    };

    blockly.Blocks.studio_setSprite.VALUES =
        [[msg.setSpriteHidden(), HIDDEN_VALUE],
         [msg.setSpriteRandom(), RANDOM_VALUE],
         [msg.setSpriteWitch(), '"witch"'],
         [msg.setSpriteCat(), '"cat"'],
         [msg.setSpriteDinosaur(), '"dinosaur"'],
         [msg.setSpriteDog(), '"dog"'],
         [msg.setSpriteOctopus(), '"octopus"'],
         [msg.setSpritePenguin(), '"penguin"'],
         [msg.setSpriteBat(), '"bat"'],
         [msg.setSpriteBird(), '"bird"'],
         [msg.setSpriteDragon(), '"dragon"'],
         [msg.setSpriteSquirrel(), '"squirrel"'],
         [msg.setSpriteWizard(), '"wizard"'],
         [msg.setSpriteAlien(), '"alien"'],
         [msg.setSpriteGhost(), '"ghost"'],
         [msg.setSpriteMonster(), '"monster"'],
         [msg.setSpriteRobot(), '"robot"'],
         [msg.setSpriteUnicorn(), '"unicorn"'],
         [msg.setSpriteZombie(), '"zombie"'],
         [msg.setSpriteKnight(), '"knight"'],
         [msg.setSpriteNinja(), '"ninja"'],
         [msg.setSpritePirate(), '"pirate"'],
         [msg.setSpriteCaveBoy(), '"caveboy"'],
         [msg.setSpriteCaveGirl(), '"cavegirl"'],
         [msg.setSpritePrincess(), '"princess"'],
         [msg.setSpriteSpacebot(), '"spacebot"'],
         [msg.setSpriteSoccerGirl(), '"soccergirl"'],
         [msg.setSpriteSoccerBoy(), '"soccerboy"'],
         [msg.setSpriteTennisGirl(), '"tennisgirl"'],
         [msg.setSpriteTennisBoy(), '"tennisboy"']];
  }

  generator.studio_setSprite = function() {
    var value = this.getTitleValue('VALUE');
    var indexString = this.getTitleValue('SPRITE') || '0';
    return generateSetterCode({
      ctx: this,
      extraParams: indexString,
      name: 'setSprite'});
  };

  blockly.Blocks.studio_setSpriteEmotion = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        if (isK1) {
          this.appendDummyInput().appendTitle(msg.setSprite())
            .appendTitle(startingSpriteImageDropdown(), 'SPRITE');
        } else {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.setSpriteN), 'SPRITE');
        }
      } else {
        this.appendDummyInput()
          .appendTitle(msg.setSprite());
      }

      if (isK1) {
        var fieldImageDropdown = new blockly.FieldImageDropdown(this.K1_VALUES, 34, 34);
        fieldImageDropdown.setValue(this.K1_VALUES[0][1]); // default to normal
        this.appendDummyInput()
          .appendTitle(msg.emotion())
          .appendTitle(fieldImageDropdown, 'VALUE');
      } else {
        var dropdown = new blockly.FieldDropdown(this.VALUES);
        dropdown.setValue(this.VALUES[1][1]);  // default to normal
        this.appendDummyInput()
          .appendTitle(dropdown, 'VALUE');
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setSpriteEmotionTooltip());
    }
  };

  blockly.Blocks.studio_setSpriteEmotion.VALUES =
      [[msg.setSpriteEmotionRandom(), RANDOM_VALUE],
       [msg.setSpriteEmotionNormal(), Emotions.NORMAL.toString()],
       [msg.setSpriteEmotionHappy(), Emotions.HAPPY.toString()],
       [msg.setSpriteEmotionAngry(), Emotions.ANGRY.toString()],
       [msg.setSpriteEmotionSad(), Emotions.SAD.toString()]];

  blockly.Blocks.studio_setSpriteEmotion.K1_VALUES =
      [[skin.emotionNormal, Emotions.NORMAL.toString()],
       [skin.emotionHappy, Emotions.HAPPY.toString()],
       [skin.emotionAngry, Emotions.ANGRY.toString()],
       [skin.emotionSad, Emotions.SAD.toString()],
       [skin.randomPurpleIcon, RANDOM_VALUE]];

  generator.studio_setSpriteEmotion = function() {
    return generateSetterCode({
      ctx: this,
      extraParams: (this.getTitleValue('SPRITE') || '0'),
      name: 'setSpriteEmotion'});
  };

  var initSayBlock = function (block) {
    // Block for waiting a specific amount of time.
    block.helpUrl = '';
    block.init = function() {
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        if (isK1) {
          this.appendDummyInput().appendTitle(msg.saySprite())
            .appendTitle(startingSpriteImageDropdown(), 'SPRITE');
        } else {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.saySpriteN), 'SPRITE');
        }
      } else {
        this.appendDummyInput()
          .appendTitle(msg.saySprite());
      }
      if (block.params) {
        this.appendValueInput('TEXT');
      } else {
        var quotedTextInput = this.appendDummyInput();
        if (isK1) {
          quotedTextInput.appendTitle(new Blockly.FieldImage(skin.speechBubble));
        }
        quotedTextInput.appendTitle(new Blockly.FieldImage(
              Blockly.assetUrl('media/quote0.png'), 12, 12))
          .appendTitle(new Blockly.FieldTextInput(msg.defaultSayText()), 'TEXT')
          .appendTitle(new Blockly.FieldImage(
              Blockly.assetUrl('media/quote1.png'), 12, 12));
      }
      if (block.time) {
        this.appendValueInput('TIME').setCheck('Number').appendTitle(msg.for());
        this.appendDummyInput().appendTitle(msg.waitSeconds());
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.saySpriteTooltip());
    };
  };

  blockly.Blocks.studio_saySprite = {};
  initSayBlock(blockly.Blocks.studio_saySprite);
  blockly.Blocks.studio_saySpriteParams = { 'params': true };
  initSayBlock(blockly.Blocks.studio_saySpriteParams);
  blockly.Blocks.studio_saySpriteParamsTime = { 'params': true, 'time': true };
  initSayBlock(blockly.Blocks.studio_saySpriteParamsTime);

  generator.studio_saySprite = function() {
    // Generate JavaScript for saying.
    return 'Studio.saySprite(\'block_id_' + this.id +
               '\', ' +
               (this.getTitleValue('SPRITE') || '0') + ', ' +
               blockly.JavaScript.quote_(this.getTitleValue('TEXT')) + ');\n';
  };

  generator.studio_saySpriteParams = function() {
    // Generate JavaScript for saying (param version).
    var textParam = Blockly.JavaScript.valueToCode(this, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || '';
    return 'Studio.saySprite(\'block_id_' + this.id +
               '\', ' +
               (this.getTitleValue('SPRITE') || '0') + ', ' +
               textParam + ');\n';
  };

  generator.studio_saySpriteParamsTime = function() {
    // Generate JavaScript for saying (param version).
    var textParam = Blockly.JavaScript.valueToCode(this, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || '';
    var secondsParam = Blockly.JavaScript.valueToCode(this, 'TIME',
        Blockly.JavaScript.ORDER_NONE) || 1;
    return 'Studio.saySprite(\'block_id_' + this.id +
        '\', ' +
        (this.getTitleValue('SPRITE') || '0') + ', ' +
        textParam + ',' + secondsParam + ');\n';
  };

  var initWaitBlock = function (block) {
    // Block for waiting a specific amount of time.
    block.helpUrl = '';
    block.init = function() {
      this.setHSV(184, 1.00, 0.74);
      if (block.params) {
        this.appendDummyInput()
          .appendTitle(msg.waitFor());
        this.appendValueInput('VALUE')
          .setCheck('Number');
        this.appendDummyInput()
          .appendTitle(msg.waitSeconds());
      } else {
        var dropdown = new blockly.FieldDropdown(this.VALUES);
        dropdown.setValue(this.VALUES[2][1]);  // default to half second

        this.appendDummyInput()
          .appendTitle(dropdown, 'VALUE');
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(block.params ?
                        msg.waitParamsTooltip() :
                        msg.waitTooltip());
    };

    if (!block.params) {
      block.VALUES =
        [[msg.waitForClick(), '"click"'],
         [msg.waitForRandom(), 'random'],
         [msg.waitForHalfSecond(), '500'],
         [msg.waitFor1Second(), '1000'],
         [msg.waitFor2Seconds(), '2000'],
         [msg.waitFor5Seconds(), '5000'],
         [msg.waitFor10Seconds(), '10000']];
    }
  };

  blockly.Blocks.studio_wait = {};
  initWaitBlock(blockly.Blocks.studio_wait);
  blockly.Blocks.studio_waitParams = { 'params': true };
  initWaitBlock(blockly.Blocks.studio_waitParams);

  generator.studio_wait = function() {
    return generateSetterCode({
      ctx: this,
      name: 'wait'});
  };

  generator.studio_waitParams = function() {
    // Generate JavaScript for wait (params version).
    var valueParam = Blockly.JavaScript.valueToCode(this, 'VALUE',
        Blockly.JavaScript.ORDER_NONE) || '0';
    return 'Studio.wait(\'block_id_' + this.id +
        '\', (' + valueParam + ' * 1000));\n';
  };

  //
  // Install functional blocks
  //

  installFunctionalApiCallBlock(blockly, generator, {
    blockName: 'functional_setBackground',
    blockTitle: msg.setBackground(),
    apiName: 'Studio.setBackground',
    args: [{ name: 'BACKGROUND', type: 'string', default: 'space'}]
  });

  installFunctionalApiCallBlock(blockly, generator, {
    blockName: 'functional_setPlayerSpeed',
    blockTitle: msg.setPlayerSpeed(),
    apiName: 'Studio.setSpriteSpeed',
    args: [{constantValue: '0'}, // spriteIndex
           {name: 'SPEED', type: 'Number', default:'7'}]
  });

  installFunctionalApiCallBlock(blockly, generator, {
    blockName: 'functional_setEnemySpeed',
    blockTitle: msg.setEnemySpeed(),
    apiName: 'Studio.setSpriteSpeed',
    args: [{constantValue: '1'}, // spriteIndex
           {name: 'SPEED', type: 'Number', default:'7'}]
  });

  installFunctionalApiCallBlock(blockly, generator, {
    blockName: 'functional_showTitleScreen',
    blockTitle: msg.showTitleScreen(),
    apiName: 'Studio.showTitleScreen',
    args: [{name: 'TITLE', type: 'string', default:'\'\''},
           {name: 'TEXT', type: 'string', default:'\'\''}]
  });

  // install number and string
  sharedFunctionalBlocks.install(blockly, generator);

  // Note: in other languages, the translated values won't be accepted
  // as valid backgrounds if they are typed in as free text. Also this
  // block will have the effect of translating the selected text to
  // english if not connected to the functional_setBackground block.
  // TODO(i18n): translate these strings in the Studio.setBackground
  // API instead of here.
  var functional_background_values = [
    [msg.backgroundCave(), 'cave'],
    [msg.backgroundNight(), 'night'],
    [msg.backgroundCloudy(), 'cloudy'],
    [msg.backgroundUnderwater(), 'underwater'],
    [msg.backgroundHardcourt(), 'hardcourt'],
    [msg.backgroundBlack(), 'black'],
    [msg.backgroundCity(), 'city'],
    [msg.backgroundDesert(), 'desert'],
    [msg.backgroundRainbow(), 'rainbow'],
    [msg.backgroundSoccer(), 'soccer'],
    [msg.backgroundSpace(), 'space'],
    [msg.backgroundTennis(), 'tennis'],
    [msg.backgroundWinter(), 'winter']
  ];

  functionalBlockUtils.installStringPicker(blockly, generator, {
    blockName: 'functional_background_string_picker',
    values: functional_background_values
  });
};

function installVanish(blockly, generator, spriteNumberTextDropdown, startingSpriteImageDropdown, blockInstallOptions) {
  blockly.Blocks.studio_vanish = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      if (blockInstallOptions.isK1) {
        this.appendDummyInput()
          .appendTitle(msg.vanish())
          .appendTitle(new blockly.FieldImage(blockInstallOptions.skin.explosionThumbnail))
          .appendTitle(startingSpriteImageDropdown(), 'SPRITE');
      } else {
        this.appendDummyInput()
          .appendTitle(spriteNumberTextDropdown(msg.vanishActorN), 'SPRITE');
      }
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.vanishTooltip());
    }
  };

  generator.studio_vanish = function() {
    var sprite = this.getTitleValue('SPRITE');
    return 'Studio.vanish(\'block_id_' + this.id + '\', ' + sprite + ');\n';
  };
}
