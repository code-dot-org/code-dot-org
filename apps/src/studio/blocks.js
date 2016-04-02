/**
 * Blockly App: Studio
 *
 * Copyright 2014 Code.org
 *
 */
'use strict';
/* global Studio */

var studioApp = require('../StudioApp').singleton;
var msg = require('./locale');
var sharedFunctionalBlocks = require('../sharedFunctionalBlocks');
var commonMsg = require('../locale');
var codegen = require('../codegen');
var constants = require('./constants');
var utils = require('../utils');
var _ = utils.getLodash();
var paramLists = require('./paramLists');

var Direction = constants.Direction;
var Position = constants.Position;
var Emotions = constants.Emotions;

var RANDOM_VALUE = constants.RANDOM_VALUE;
var HIDDEN_VALUE = constants.HIDDEN_VALUE;
var CLICK_VALUE = constants.CLICK_VALUE;
var VISIBLE_VALUE = constants.VISIBLE_VALUE;

var generateSetterCode = function (opts) {
  var value = opts.value || opts.ctx.getTitleValue('VALUE');
  if (value === RANDOM_VALUE) {
    var possibleValues =
      _(opts.ctx.VALUES)
        .map(function (item) { return item[1]; })
        .without(RANDOM_VALUE, HIDDEN_VALUE, CLICK_VALUE);
    value = 'Studio.random([' + possibleValues + '])';
  }

  if (opts.returnValue) {
    return value;
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

var customGameLogic = null;

exports.setSpriteCount = function (blockly, count) {
  spriteCount = count;
};

exports.enableProjectileCollisions = function (blockly) {
  projectileCollisions = true;
};

exports.enableEdgeCollisions = function (blockly) {
  edgeCollisions = true;
};

exports.enableSpritesOutsidePlayspace = function (blockly) {
  allowSpritesOutsidePlayspace = true;
};

exports.setStartAvatars = function (avatarList) {
  startAvatars = avatarList.slice(0);
};

exports.registerCustomGameLogic = function (customGameLogicToRegister) {
  customGameLogic = customGameLogicToRegister;
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
exports.install = function (blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;
  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;
  startAvatars = skin.avatarList.slice(0); // copy avatar list

  generator.studio_eventHandlerPrologue = function () {
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

  /**
   * Get the value of the 'SPRITE' input, converting 1->0 indexed.
   * @param block
   * @returns {string}
   */
  function getSpriteIndex(block) {
    var index = Blockly.JavaScript.valueToCode(block, 'SPRITE',
        Blockly.JavaScript.ORDER_NONE) || '1';
    return index + '-1';
  }

  // started separating block generation for each block into it's own function
  installVanish(blockly, generator, spriteNumberTextDropdown, startingSpriteImageDropdown, blockInstallOptions);

  generator.studio_eventHandlerPrologue = function () {
    return '\n';
  };

  blockly.Blocks.studio_whenLeft = {
    // Block to handle event when the Left arrow button is pressed.
    helpUrl: '',
    init: function () {
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
    init: function () {
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
    init: function () {
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
    init: function () {
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
    init: function () {
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
    init: function () {
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

  blockly.Blocks.studio_whenTouchCharacter = {
    // Block to handle event when sprite touches an item.
    helpUrl: '',
    init: function () {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(msg.whenTouchCharacter());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenTouchCharacterTooltip());
    }
  };

  generator.studio_whenTouchCharacter = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenTouchObstacle = {
    // Block to handle event when sprite touches a wall.
    helpUrl: '',
    init: function () {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(msg.whenTouchObstacle());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenTouchObstacleTooltip());
    }
  };

  generator.studio_whenTouchObstacle = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenTouchGoal = {
    // Block to handle event when sprite touches a goal.
    helpUrl: '',
    init: function () {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(msg.whenTouchGoal());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenTouchGoalTooltip());
    }
  };

  generator.studio_whenTouchGoal = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenGetCharacter = {
    // Block to handle event when the primary sprite gets a character.
    helpUrl: '',
    init: function () {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      this.setPreviousStatement(false);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whenGetCharacterTooltip());
    }
  };

  blockly.Blocks.studio_whenGetCharacter.VALUES =
      [[msg.whenGetCharacterAnyItem(),      'any_item'],
       [msg.whenGetCharacterPufferPig(),    'pufferpig'],
       [msg.whenGetCharacterStormtrooper(), 'stormtrooper'],
       [msg.whenGetCharacterTauntaun(),     'tauntaun'],
       [msg.whenGetCharacterMynock(),       'mynock'],
       [msg.whenGetCharacterProbot(),       'probot'],
       [msg.whenGetCharacterMouseDroid(),   'mousedroid'],
       [msg.whenGetCharacterRebelPilot(),   'rebelpilot']];

  generator.studio_whenGetCharacter = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenGetAllCharacters = {
    // Block to handle event when the primary sprite gets all characters.
    helpUrl: '',
    init: function () {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(msg.whenGetAllCharacters());
      this.setPreviousStatement(false);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whenGetAllCharactersTooltip());
    }
  };

  generator.studio_whenGetAllCharacters = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenGetAllCharacterClass = {
    // Block to handle event when the primary sprite gets all characters of a class.
    helpUrl: '',
    init: function () {
      this.setHSV(140, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      this.setPreviousStatement(false);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whenGetAllCharacterClassTooltip());
    }
  };

  blockly.Blocks.studio_whenGetAllCharacterClass.VALUES =
      [[msg.whenGetAllCharacterPufferPig(),    'pufferpig'],
       [msg.whenGetAllCharacterStormtrooper(), 'stormtrooper'],
       [msg.whenGetAllCharacterTauntaun(),     'tauntaun'],
       [msg.whenGetAllCharacterMynock(),       'mynock'],
       [msg.whenGetAllCharacterProbot(),       'probot'],
       [msg.whenGetAllCharacterMouseDroid(),   'mousedroid'],
       [msg.whenGetAllCharacterRebelPilot(),   'rebelpilot']];

  generator.studio_whenGetAllCharacterClass = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_whenSpriteCollided = {
    // Block to handle event when sprite collides with another sprite.
    helpUrl: '',
    init: function () {
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

  blockly.Blocks.studio_whenSpriteCollided.PROJECTILES = skin.whenProjectileCollidedChoices;

  blockly.Blocks.studio_whenSpriteCollided.EDGES =
      [[msg.whenSpriteCollidedWithTopEdge(), 'top'],
       [msg.whenSpriteCollidedWithLeftEdge(), 'left'],
       [msg.whenSpriteCollidedWithBottomEdge(), 'bottom'],
       [msg.whenSpriteCollidedWithRightEdge(), 'right']];

  generator.studio_whenSpriteCollided = generator.studio_eventHandlerPrologue;

  blockly.Blocks.studio_stop = {
    // Block for stopping the movement of a sprite.
    helpUrl: '',
    init: function () {
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

  blockly.Blocks.studio_stopSprite = {
    // Block for stopping the movement of a sprite.
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('SPRITE')
          .setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.stopSpriteN({spriteIndex: ''}));
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.stopTooltip());
    }
  };

  generator.studio_stop = function () {
    // Generate JavaScript for stopping the movement of a sprite.
    return 'Studio.stop(\'block_id_' + this.id + '\', ' +
        (this.getTitleValue('SPRITE') || '0') + ');\n';
  };

  generator.studio_stopSprite = function () {
    // Generate JavaScript for stopping the movement of a sprite.
    var spriteParam = getSpriteIndex(this);
    return 'Studio.stop(\'block_id_' + this.id + '\', ' +
        spriteParam + ');\n';
  };

  blockly.Blocks.studio_addCharacter = {
    // Block for adding a character to the scene.
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(msg.addCharacter());
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(skin.itemChoices), 'VALUE');
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.addCharacterTooltip());
    }
  };

  generator.studio_addCharacter = function () {
    // Generate JavaScript for adding a character to the scene.
    var allValues = skin.itemChoices.slice(0, -1).map(function (item) {
      return item[1];
    });
    var valParam = this.getTitleValue('VALUE');
    if (valParam === 'random') {
      valParam = 'Studio.random([' + allValues + '])';
    }

    return 'Studio.addCharacter(\'block_id_' + this.id + '\', ' + valParam + ');\n';
  };

  blockly.Blocks.studio_setItemActivity = {
    // Block for setting the activity type on a class of items.
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(skin.activityChoices), 'TYPE');
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(skin.itemChoices), 'VALUE');
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setActivityTooltip());
    }
  };

  generator.studio_setItemActivity = function () {
    // Generate JavaScript for adding items to a scene.
    var allValues = skin.itemChoices.slice(0, -1).map(function (item) {
      return item[1];
    });
    var valParam = this.getTitleValue('VALUE');
    if (valParam === 'random') {
      valParam = 'Studio.random([' + allValues + '])';
    }
    var allTypes = skin.activityChoices.slice(0, -1).map(function (item) {
      return item[1];
    });
    var typeParam = this.getTitleValue('TYPE');
    if (typeParam === 'random') {
      typeParam = 'Studio.random([' + allTypes + '])';
    }

    return 'Studio.setItemActivity(\'block_id_' + this.id +
        '\', ' +
        valParam + ', ' +
        typeParam + ');\n';
  };

  blockly.Blocks.studio_setItemSpeed = {
    // Block for setting item speed
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);

      this.appendDummyInput().appendTitle(msg.setItemSpeedSet());
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(skin.itemChoices), 'CLASS');

      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[1][1]); // default to slow
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');

      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setItemSpeedTooltip());
    }
  };

  blockly.Blocks.studio_setItemSpeed.VALUES =
      [[msg.setSpriteSpeedRandom(), RANDOM_VALUE],
       [msg.setSpriteSpeedSlow(), '"slow"'],
       [msg.setSpriteSpeedNormal(), '"normal"'],
       [msg.setSpriteSpeedFast(), '"fast"']];

  generator.studio_setItemSpeed = function () {
    return generateSetterCode({
      ctx: this,
      extraParams: this.getTitleValue('CLASS'),
      name: 'setItemSpeed'});
  };

  blockly.Blocks.studio_throw = {
    // Block for throwing a projectile from a sprite.
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        this.appendDummyInput()
          .appendTitle(spriteNumberTextDropdown(msg.throwSpriteN), 'SPRITE');
      } else {
        this.appendDummyInput()
          .appendTitle(msg.throwSprite());
      }
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(skin.projectileChoices), 'VALUE');
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

  generator.studio_throw = function () {
    // Generate JavaScript for throwing a projectile from a sprite.
    var allDirections = this.DIR.slice(0, -1).map(function (item) {
      return item[1];
    });
    var dirParam = this.getTitleValue('DIR');
    if (dirParam === 'random') {
      dirParam = 'Studio.random([' + allDirections + '])';
    }
    var allValues = skin.projectileChoices.slice(0, -1).map(function (item) {
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
    init: function () {
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

  blockly.Blocks.studio_makeProjectile.VALUES = skin.makeProjectileChoices;

  blockly.Blocks.studio_makeProjectile.ACTIONS =
        [[msg.makeProjectileBounce(), '"bounce"'],
         [msg.makeProjectileDisappear(), '"disappear"']];

  generator.studio_makeProjectile = function () {
    // Generate JavaScript for making a projectile bounce or disappear.
    return 'Studio.makeProjectile(\'block_id_' + this.id + '\', ' +
        this.getTitleValue('VALUE') + ', ' +
        this.getTitleValue('ACTION') + ');\n';
  };

  blockly.Blocks.studio_setSpritePosition = {
    // Block for jumping a sprite to different position.
    helpUrl: '',
    init: function () {
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

  generator.studio_setSpritePosition = function () {
    return generateSetterCode({
      ctx: this,
      extraParams: (this.getTitleValue('SPRITE') || '0'),
      name: 'setSpritePosition'});
  };

  blockly.Blocks.studio_setSpriteXY = {
    // Block for jumping a sprite to specific XY location.
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      if (spriteCount > 1) {
        this.appendValueInput('SPRITE')
          .setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.moveSpriteN({spriteIndex: ''}));
      } else {
        this.appendDummyInput()
          .appendTitle(msg.setSprite());
      }
      this.appendDummyInput()
        .appendTitle(msg.toXY());
      this.appendValueInput('XPOS')
        .setCheck(blockly.BlockValueType.NUMBER);
      this.appendValueInput('YPOS')
        .setCheck(blockly.BlockValueType.NUMBER);
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
    }
  };

  generator.studio_setSpriteXY = function () {
    var spriteParam = getSpriteIndex(this);
    var xParam = Blockly.JavaScript.valueToCode(this, 'XPOS',
        Blockly.JavaScript.ORDER_NONE) || '0';
    var yParam = Blockly.JavaScript.valueToCode(this, 'YPOS',
        Blockly.JavaScript.ORDER_NONE) || '0';
    return 'Studio.setSpriteXY(\'block_id_' + this.id +
      '\', ' +
      spriteParam + ', ' +
      xParam + ', ' +
      yParam + ');\n';
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
      South: {letter: commonMsg.directionSouthLetter(),
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
    generateBlocksForAllDirections: function () {
      SimpleMove.generateBlocksForDirection("North");
      SimpleMove.generateBlocksForDirection("South");
      SimpleMove.generateBlocksForDirection("West");
      SimpleMove.generateBlocksForDirection("East");
    },
    generateBlocksForDirection: function (direction) {
      generator["studio_move" + direction] = SimpleMove.generateCodeGenerator(direction, true);
      blockly.Blocks['studio_move' + direction] = SimpleMove.generateMoveBlock(direction, false);
      generator["studio_move" + direction + "Distance"] = SimpleMove.generateCodeGenerator(direction, false);
      blockly.Blocks['studio_move' + direction + "Distance"] = SimpleMove.generateMoveBlock(direction, false);
      generator["studio_move" + direction + "_length"] = SimpleMove.generateCodeGenerator(direction, false);
      blockly.Blocks['studio_move' + direction + "_length"] = SimpleMove.generateMoveBlock(direction, true);
    },
    generateMoveBlock: function (direction, hasLengthInput) {
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
    generateCodeGenerator: function (direction, isEventMove) {
      var directionConfig = SimpleMove.DIRECTION_CONFIGS[direction];

      return function () {
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
    init: function () {
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

  generator.studio_move = function () {
    // Generate JavaScript for moving.
    return 'Studio.move(\'block_id_' + this.id + '\', ' +
        (this.getTitleValue('SPRITE') || '0') + ', ' +
        this.getTitleValue('DIR') + ');\n';
  };

  var initMoveDistanceBlock = function (options) {
    var block = {};
    // Block for moving/gliding a specific distance.
    block.helpUrl = '';
    block.init = function () {
      this.setHSV(184, 1.00, 0.74);
      if (options.sprite) {
        this.appendValueInput('SPRITE')
            .setCheck(blockly.BlockValueType.NUMBER)
            .appendTitle(msg.moveSpriteN({spriteIndex: ''}));
      } else if (spriteCount > 1) {
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
      if (options.params) {
        this.appendValueInput('DISTANCE')
          .setCheck(blockly.BlockValueType.NUMBER);
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

    if (!options.params) {
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

    return block;
  };

  blockly.Blocks.studio_moveDistance = initMoveDistanceBlock({});
  blockly.Blocks.studio_moveDistanceParams = initMoveDistanceBlock({
    'params': true
  });
  blockly.Blocks.studio_moveDistanceParamsSprite = initMoveDistanceBlock({
    'params': true,
    'sprite': true
  });

  generator.studio_moveDistance = function () {
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

  generator.studio_moveDistanceParams = function () {
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

  generator.studio_moveDistanceParamsSprite = function () {
    // Generate JavaScript for moving (params version).

    var spriteParam = getSpriteIndex(this);

    var allDirections = this.DIR.slice(0, -1).map(function (item) {
      return item[1];
    });
    var dirParam = this.getTitleValue('DIR');
    if (dirParam === 'random') {
      dirParam = 'Studio.random([' + allDirections + '])';
    }
    var distParam = Blockly.JavaScript.valueToCode(this, 'DISTANCE',
        Blockly.JavaScript.ORDER_NONE) || '0';

    return 'Studio.moveDistance(\'block_id_' + this.id + '\', ' +
        spriteParam + ', ' + dirParam + ', ' + distParam + ');\n';
  };

  function onSoundSelected(soundValue) {
    var lowercaseSound = utils.stripQuotes(soundValue).toLowerCase().trim();

    if (lowercaseSound === RANDOM_VALUE) {
      return;
    }
    var skinSoundMetadata = utils.valueOr(skin.soundMetadata, []);
    var playbackOptions = $.extend({
      volume: 1.0
    }, _.find(skinSoundMetadata, function (metadata) {
      return metadata.name.toLowerCase().trim() === lowercaseSound;
    }));

    studioApp.playAudio(lowercaseSound, playbackOptions);
  }

  blockly.Blocks.studio_playSound = {
    // Block for playing sound.
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.play())
          .appendTitle(new blockly.FieldImage(skin.soundIcon))
          .appendTitle(new blockly.FieldDropdown(this.soundChoices(), onSoundSelected), 'SOUND');
      } else {
        this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(this.soundChoices(), onSoundSelected), 'SOUND');
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.playSoundTooltip());
    }
  };

  blockly.Blocks.studio_playSound.soundChoices = function () {
    var fullChoices = isK1 ? skin.soundChoicesK1 : skin.soundChoices;
    var permittedValues = paramLists.getPlaySoundValues(true);
    return fullChoices.filter(function (choice) {
      for (var i = 0; i < permittedValues.length; i++) {
        if (choice[1] === permittedValues[i]) {
          return true;
        }
      }
      return false;
    });
  };

  generator.studio_playSound = function () {
    // Generate JavaScript for playing a sound.
    return 'Studio.playSound(\'block_id_' + this.id + '\', \'' +
               this.getTitleValue('SOUND') + '\');\n';
  };

  blockly.Blocks.studio_changeScore = {
    // Block for changing the score.
    helpUrl: '',
    init: function () {
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

  generator.studio_changeScore = function () {
    // Generate JavaScript for changing the score.
    return 'Studio.changeScore(\'block_id_' + this.id + '\', \'' +
                (this.getTitleValue('VALUE') || '1') + '\');\n';
  };

  blockly.Blocks.studio_addPoints = {
    // Block for adding points.
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.addPointsTooltip());
    }
  };

  blockly.Blocks.studio_addPoints.VALUES =
      [[msg.addPoints10(),   '10'],
       [msg.addPoints50(),   '50'],
       [msg.addPoints100(),  '100'],
       [msg.addPoints300(),  '300'],
       [msg.addPoints1000(), '1000']];

  generator.studio_addPoints = function () {
    // Generate JavaScript for adding points.
    return 'Studio.addPoints(\'block_id_' + this.id + '\', \'' +
                (this.getTitleValue('VALUE') || '1') + '\');\n';
  };

  blockly.Blocks.studio_removePoints = {
    // Block for removing points.
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(this.VALUES), 'VALUE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.removePointsTooltip());
    }
  };

  blockly.Blocks.studio_removePoints.VALUES =
      [[msg.removePoints10(),   '10'],
       [msg.removePoints50(),   '50'],
       [msg.removePoints100(),  '100'],
       [msg.removePoints300(),  '300'],
       [msg.removePoints1000(), '1000']];

  generator.studio_removePoints = function () {
    // Generate JavaScript for removing points.
    return 'Studio.removePoints(\'block_id_' + this.id + '\', \'' +
                (this.getTitleValue('VALUE') || '1') + '\');\n';
  };

  blockly.Blocks.studio_setScoreText = {
    // Block for setting the score text.
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('TEXT')
        .appendTitle(msg.setScoreText());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setScoreTextTooltip());
    }
  };

  generator.studio_setScoreText = function () {
    // Generate JavaScript for setting the score text.
    var arg = Blockly.JavaScript.valueToCode(this, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || '';
    return 'Studio.setScoreText(\'block_id_' + this.id + '\', ' + arg + ');\n';
  };

  blockly.Blocks.studio_showCoordinates = {
    // Block for showing the protagonist's coordinates.
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
        this.appendDummyInput().appendTitle(msg.showCoordinates());
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.showCoordinatesTooltip());
    }
  };

  generator.studio_showCoordinates = function () {
    // Generate JavaScript for showing the protagonist's coordinates.
    return 'Studio.showCoordinates(\'block_id_' + this.id + '\');\n';
  };

  blockly.Blocks.studio_setDroidSpeed = {
    // Block for setting droid speed
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[2][1]); // default to normal
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setDroidSpeedTooltip());
    }
  };

  blockly.Blocks.studio_setDroidSpeed.VALUES =
      [[msg.setDroidSpeedRandom(), 'random'],
       [msg.setDroidSpeedSlow(), 'slow'],
       [msg.setDroidSpeedNormal(), 'normal'],
       [msg.setDroidSpeedFast(), 'fast']];

  generator.studio_setDroidSpeed = function () {
    return 'Studio.setDroidSpeed(\'block_id_' + this.id + '\', "' +
      this.getTitleValue('VALUE') + '");\n';
  };

  blockly.Blocks.studio_setSpriteSpeed = {
    // Block for setting sprite speed
    helpUrl: '',
    init: function () {
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

  blockly.Blocks.studio_setSpriteSpeedParams = {
    // Block for setting sprite speed
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('SPRITE').setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.setSpriteN({spriteIndex: ''}));
      this.appendValueInput('VALUE').setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.speed());
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

  generator.studio_setSpriteSpeedParams = function () {
    // Generate JavaScript for setting sprite speed.
    var spriteParam = getSpriteIndex(this);
    var valueParam = Blockly.JavaScript.valueToCode(this, 'VALUE',
        Blockly.JavaScript.ORDER_NONE) || '5';
    return 'Studio.setSpriteSpeed(\'block_id_' + this.id + '\', ' +
        spriteParam + ',' + valueParam + ');\n';
  };

  blockly.Blocks.studio_setSpriteSize = {
    // Block for setting sprite size
    helpUrl: '',
    init: function () {
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

  blockly.Blocks.studio_setSpriteSizeParams = {
    // Block for setting sprite size
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('SPRITE').setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.setSpriteN({spriteIndex: ''}));
      this.appendValueInput('VALUE').setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.size());
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

  generator.studio_setSpriteSizeParams = function () {
    // Generate JavaScript for setting sprite speed.
    var spriteParam = getSpriteIndex(this);
    var valueParam = Blockly.JavaScript.valueToCode(this, 'VALUE',
        Blockly.JavaScript.ORDER_NONE) || '5';
    return 'Studio.setSpriteSize(\'block_id_' + this.id + '\', ' +
        spriteParam + ',' + valueParam + ');\n';
  };

  /**
   * setBackground
   */
  blockly.Blocks.studio_setBackground = {
    helpUrl: '',
    init: function () {
      this.setHSV(312, 0.32, 0.62);
      this.VALUES = [];

      var dropdown;
      if (isK1) {
        this.VALUES = skin.backgroundChoicesK1;
        dropdown = new blockly.FieldImageDropdown(
                                  skin.backgroundChoicesK1,
                                  skin.dropdownThumbnailWidth,
                                  skin.dropdownThumbnailHeight);
        this.appendDummyInput()
          .appendTitle(msg.setBackground())
          .appendTitle(dropdown, 'VALUE');
      } else {
        this.VALUES = skin.backgroundChoices;
        dropdown = new blockly.FieldDropdown(skin.backgroundChoices);
        this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      }
      dropdown.setValue('"' + skin.defaultBackground + '"');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setBackgroundTooltip());
    }
  };

  blockly.Blocks.studio_setBackgroundParam = {
    helpUrl: '',
    init: function () {
      this.setHSV(312, 0.32, 0.62);
      this.VALUES = skin.backgroundChoices;

      this.appendDummyInput()
        .appendTitle(msg.setBackground());
      this.appendValueInput('VALUE');

      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setBackgroundTooltip());
    }
  };

  generator.studio_setBackground = function () {
    return generateSetterCode({ctx: this, name: 'setBackground'});
  };
  generator.studio_setBackgroundParam = function () {
    var backgroundValue = blockly.JavaScript.valueToCode(this, 'VALUE',
      Blockly.JavaScript.ORDER_NONE);

    return generateSetterCode({
      value: backgroundValue,
      ctx: this,
      name: 'setBackground'});
  };

  /**
   * setMap
   */
  blockly.Blocks.studio_setMap = {
    helpUrl: '',
    init: function () {
      this.setHSV(312, 0.32, 0.62);
      this.VALUES = skin.mapChoices;

      var dropdown = new blockly.FieldDropdown(skin.mapChoices);
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      // default to first item after random
      dropdown.setValue(skin.mapChoices[1][1]);

      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setMapTooltip());
    }
  };

  generator.studio_setMap = function () {
    return generateSetterCode({ctx: this, name: 'setMap'});
  };

  /**
   * showTitleScreen
   */
  var initShowTitleScreenBlock = function (options) {
    var block = {};

    block.helpUrl = '';
    block.init = function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle(msg.showTitleScreen());
      if (options.params) {
        this.appendValueInput('TITLE')
          .setCheck(blockly.BlockValueType.STRING)
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendTitle(msg.showTitleScreenTitle());
        this.appendValueInput('TEXT')
          .setCheck(blockly.BlockValueType.STRING)
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
    return block;
  };

  blockly.Blocks.studio_showTitleScreen = initShowTitleScreenBlock({});
  blockly.Blocks.studio_showTitleScreenParams = initShowTitleScreenBlock({
    'params': true
  });

  generator.studio_showTitleScreen = function () {
    // Generate JavaScript for showing title screen.
    return 'Studio.showTitleScreen(\'block_id_' + this.id +
               '\', ' +
               blockly.JavaScript.quote_(this.getTitleValue('TITLE')) + ', ' +
               blockly.JavaScript.quote_(this.getTitleValue('TEXT')) + ');\n';
  };

  generator.studio_showTitleScreenParams = function () {
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
      init: function () {
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
      init: function () {
        // shallow copy array:
        this.VALUES = [].concat(skin.spriteChoices);
        this.setHSV(312, 0.32, 0.62);
        if (spriteCount > 1) {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.setSpriteN), 'SPRITE');
        } else {
          // Modify the dropdownValues array to contain combined text
          // (blockly renders this better than two adjacent text blocks)
          var prefix = skin.setSpritePrefix + ' ';
          for (var i = 0; i < this.VALUES.length; i++) {
            // shallow copy this array within the larger array, then modify
            // the string to be displayed to include the prefix:
            this.VALUES[i] = [].concat(skin.spriteChoices[i]);
            this.VALUES[i][0] = prefix + this.VALUES[i][0];
          }
        }
        var dropdown = new blockly.FieldDropdown(this.VALUES);
        // default to first item after random/hidden
        dropdown.setValue(skin.spriteChoices[2][1]);
        this.appendDummyInput()
          .appendTitle(dropdown, 'VALUE');
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(msg.setSpriteTooltip());
      }
    };

    blockly.Blocks.studio_setSpriteParams = {
      helpUrl: '',
      init: function () {
        this.VALUES = skin.spriteChoices;
        var dropdown = new blockly.FieldDropdown(skin.spriteChoices);
        // default to first item after random/hidden
        dropdown.setValue(skin.spriteChoices[2][1]);

        this.setHSV(312, 0.32, 0.62);
        this.appendValueInput('SPRITE')
            .setCheck(blockly.BlockValueType.NUMBER)
            .appendTitle(msg.setSpriteN({spriteIndex: ''}));
        this.appendDummyInput()
            .appendTitle(dropdown, 'VALUE');
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(msg.setSpriteTooltip());
      }
    };

    blockly.Blocks.studio_setSpriteParamValue = {
      helpUrl: '',
      init: function () {
        this.setHSV(312, 0.32, 0.62);
        if (spriteCount > 1) {
          this.appendDummyInput()
            .appendTitle(spriteNumberTextDropdown(msg.setSpriteN), 'SPRITE');
        } else {
          this.appendDummyInput()
            .appendTitle(msg.setSprite());
        }
        this.appendValueInput('VALUE');
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(msg.setSpriteTooltip());
      }
    };
  }

  generator.studio_setSprite = function () {
    var indexString = this.getTitleValue('SPRITE') || '0';
    return generateSetterCode({
      ctx: this,
      extraParams: indexString,
      name: 'setSprite'});
  };

  generator.studio_setSpriteParams = function () {
    var indexString = getSpriteIndex(this);
    return generateSetterCode({
      ctx: this,
      extraParams: indexString,
      name: 'setSprite'});
  };

  generator.studio_setSpriteParamValue = function () {
    var indexString = this.getTitleValue('SPRITE') || '0';
    var spriteValue = blockly.JavaScript.valueToCode(this, 'VALUE',
      Blockly.JavaScript.ORDER_NONE);

    return generateSetterCode({
      value: spriteValue,
      ctx: this,
      extraParams: indexString,
      name: 'setSprite'});
  };

  blockly.Blocks.studio_setSpriteEmotion = {
    helpUrl: '',
    init: function () {
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

  blockly.Blocks.studio_setSpriteEmotionParams = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('SPRITE').setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.setSpriteN({spriteIndex: ''}));
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[1][1]);  // default to normal
      this.appendDummyInput()
          .appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setSpriteEmotionTooltip());
    }
  };

  blockly.Blocks.studio_setSpriteEmotion.VALUES =
      blockly.Blocks.studio_setSpriteEmotionParams.VALUES =
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

  generator.studio_setSpriteEmotion = function () {
    return generateSetterCode({
      ctx: this,
      extraParams: (this.getTitleValue('SPRITE') || '0'),
      name: 'setSpriteEmotion'});
  };

  generator.studio_setSpriteEmotionParams = function () {
    var indexString = getSpriteIndex(this);
    return generateSetterCode({
      ctx: this,
      extraParams: indexString,
      name: 'setSpriteEmotion'});
  };

  var initSayBlock = function (options) {
    var block = {};
    // Block for waiting a specific amount of time.
    block.helpUrl = '';
    block.init = function () {
      this.setHSV(184, 1.00, 0.74);
      if (options.time) {
        this.appendValueInput('SPRITE').setCheck(blockly.BlockValueType.NUMBER)
            .appendTitle(msg.actor());
        this.appendDummyInput()
            .appendTitle(msg.saySprite());
      } else if (spriteCount > 1) {
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
      if (options.restrictedDialog) {
        var functionArray = [];
        var numRestrictedSayChoices = 59;
        for (var i = 0; i < numRestrictedSayChoices; i++) {
          var functionElement = functionArray[i] = [];
          var string = msg["saySpriteChoices_" + i]();
          functionElement[0] = functionElement[1] = string;
        }
        var dropdown = new blockly.FieldDropdown(functionArray);
        this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      } else if (options.params) {
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
      if (options.time) {
        this.appendValueInput('TIME').setCheck(blockly.BlockValueType.NUMBER).appendTitle(msg.for());
        this.appendDummyInput().appendTitle(msg.waitSeconds());
      }
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.saySpriteTooltip());
    };

    return block;
  };

  blockly.Blocks.studio_saySprite = initSayBlock({});
  blockly.Blocks.studio_saySpriteChoices = initSayBlock({'restrictedDialog': true});
  blockly.Blocks.studio_saySpriteParams = initSayBlock({'params': true});
  blockly.Blocks.studio_saySpriteParamsTime = initSayBlock({'params': true, 'time': true});

  generator.studio_saySprite = function () {
    // Generate JavaScript for saying.
    return 'Studio.saySprite(\'block_id_' + this.id +
               '\', ' +
               (this.getTitleValue('SPRITE') || '0') + ', ' +
               blockly.JavaScript.quote_(this.getTitleValue('TEXT')) + ');\n';
  };

  generator.studio_saySpriteChoices = function () {
    // Generate JavaScript for saying (choices version).
    return 'Studio.saySprite(\'block_id_' + this.id +
               '\', ' +
               (this.getTitleValue('SPRITE') || '0') + ', \'' +
               (this.getTitleValue('VALUE') || ' ') + '\');\n';
  };

  generator.studio_saySpriteParams = function () {
    // Generate JavaScript for saying (param version).
    var textParam = Blockly.JavaScript.valueToCode(this, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || '';
    return 'Studio.saySprite(\'block_id_' + this.id +
               '\', ' +
               (this.getTitleValue('SPRITE') || '0') + ', ' +
               textParam + ');\n';
  };

  generator.studio_saySpriteParamsTime = function () {
    // Generate JavaScript for saying (param version).
    var spriteParam = getSpriteIndex(this);
    var textParam = Blockly.JavaScript.valueToCode(this, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || '';
    var secondsParam = Blockly.JavaScript.valueToCode(this, 'TIME',
        Blockly.JavaScript.ORDER_NONE) || 1;
    return 'Studio.saySprite(\'block_id_' + this.id + '\', ' +
        spriteParam + ', ' + textParam + ',' + secondsParam + ');\n';
  };

  var initWaitBlock = function (options) {
    var block = {};
    // Block for waiting a specific amount of time.
    block.helpUrl = '';
    block.init = function () {
      this.setHSV(184, 1.00, 0.74);
      if (options.params) {
        this.appendDummyInput()
          .appendTitle(msg.waitFor());
        this.appendValueInput('VALUE')
          .setCheck(blockly.BlockValueType.NUMBER);
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
      this.setTooltip(options.params ? msg.waitParamsTooltip() :
        msg.waitTooltip());
    };

    if (!options.params) {
      block.VALUES =
        [[msg.waitForClick(), '"click"'],
         [msg.waitForRandom(), 'random'],
         [msg.waitForHalfSecond(), '500'],
         [msg.waitFor1Second(), '1000'],
         [msg.waitFor2Seconds(), '2000'],
         [msg.waitFor5Seconds(), '5000'],
         [msg.waitFor10Seconds(), '10000']];
    }

    return block;
  };

  blockly.Blocks.studio_wait = initWaitBlock({});
  blockly.Blocks.studio_waitParams = initWaitBlock({'params': true});

  generator.studio_wait = function () {
    return generateSetterCode({
      ctx: this,
      name: 'wait'});
  };

  generator.studio_waitParams = function () {
    // Generate JavaScript for wait (params version).
    var valueParam = Blockly.JavaScript.valueToCode(this, 'VALUE',
        Blockly.JavaScript.ORDER_NONE) || '0';
    return 'Studio.wait(\'block_id_' + this.id +
        '\', (' + valueParam + ' * 1000));\n';
  };

  blockly.Blocks.studio_endGame = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[0][1]); // default to win
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.endGameTooltip());
    }
  };

  blockly.Blocks.studio_endGame.VALUES =
    [[msg.endGameWin(), 'win'],
     [msg.endGameLose(), 'lose']];

  generator.studio_endGame = function () {
    // Generate JavaScript for ending the game.
    return 'Studio.endGame(\'block_id_' + this.id + '\',\'' +
      this.getTitleValue('VALUE') + '\');\n';
  };

  //
  // Install functional start blocks
  //

  blockly.Blocks.functional_start_setValue = {
    init: function () {
      var blockName = msg.startSetValue();
      var blockType = blockly.BlockValueType.NONE;
      var blockArgs = [{name: 'VALUE', type: blockly.BlockValueType.FUNCTION}];
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, blockName, blockType, blockArgs);
    }
  };

  generator.functional_start_setValue = function () {
    // For each of our inputs (i.e. update-target, update-danger, etc.) get
    // the attached block and figure out what it's function name is. Store
    // that on BigGameLogic so we can know what functions to call later.
    if (customGameLogic) {
      customGameLogic.cacheBlock('VALUE', this.getInputTargetBlock('VALUE'));
    } else {
      throw new Error('must register custom game logic');
    }
  };

  blockly.Blocks.functional_start_setVars = {
    init: function () {
      var blockName = msg.startSetVars();
      var blockType = blockly.BlockValueType.NONE;
      var blockArgs = [
        {name: 'title', type: blockly.BlockValueType.STRING},
        {name: 'subtitle', type: blockly.BlockValueType.STRING},
        {name: 'background', type: blockly.BlockValueType.IMAGE},
        {name: 'player', type: blockly.BlockValueType.IMAGE},
        {name: 'target', type: blockly.BlockValueType.IMAGE},
        {name: 'danger', type: blockly.BlockValueType.IMAGE}
      ];
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, blockName, blockType, blockArgs);
    }
  };

  generator.functional_start_setVars = function () {
    // For the current design, this doesn't need to generate any code.
    // Though we pass in a function, we're not actually using that passed in
    // function, and instead depend on a function of the required name existing
    // in the global space. This may change in the future.
  };

  /**
   * functional_start_setFuncs
   * Even those this is called setFuncs, we are passed both functions and
   * variables. Our generator stashes the passed values on our customLogic
   * object (which is BigGameLogic).
   */
  blockly.Blocks.functional_start_setFuncs = {
    init: function () {
      this.blockArgs = [
        {name: 'title', type: blockly.BlockValueType.STRING},
        {name: 'subtitle', type: blockly.BlockValueType.STRING},
        {name: 'background', type: blockly.BlockValueType.IMAGE},
        {name: 'target', type: blockly.BlockValueType.IMAGE},
        {name: 'danger', type: blockly.BlockValueType.IMAGE},
        {name: 'player', type: blockly.BlockValueType.IMAGE},
        {name: 'update-target', type: blockly.BlockValueType.FUNCTION},
        {name: 'update-danger', type: blockly.BlockValueType.FUNCTION},
        {name: 'update-player', type: blockly.BlockValueType.FUNCTION},
        {name: 'collide?', type: blockly.BlockValueType.FUNCTION},
        {name: 'on-screen?', type: blockly.BlockValueType.FUNCTION}
      ];
      this.setFunctional(true, {
        headerHeight: 30
      });
      this.setHSV.apply(this, blockly.FunctionalTypeColors[blockly.BlockValueType.NONE]);

      var options = {
        fixedSize: {height: 35}
      };

      this.appendDummyInput()
        .appendTitle(new Blockly.FieldLabel('game_funcs', options))
        .setAlign(Blockly.ALIGN_LEFT);

      var rows = [
        'title, subtitle, background',
        [this.blockArgs[0], this.blockArgs[1], this.blockArgs[2]],
        'target, danger, player',
        [this.blockArgs[3], this.blockArgs[4], this.blockArgs[5]],
        'update-target, update-danger, update-player',
        [this.blockArgs[6], this.blockArgs[7], this.blockArgs[8]],
        'collide?, onscreen?',
        [this.blockArgs[9], this.blockArgs[10]]
      ];

      rows.forEach(function (row) {
        if (typeof(row) === 'string') {
          this.appendDummyInput()
            .appendTitle(new Blockly.FieldLabel(row));
        } else {
          row.forEach(function (blockArg, index) {
            var input = this.appendFunctionalInput(blockArg.name);
            if (index !== 0) {
              input.setInline(true);
            }
            input.setHSV.apply(input, blockly.FunctionalTypeColors[blockArg.type]);
            input.setCheck(blockArg.type);
            input.setAlign(Blockly.ALIGN_LEFT);
          }, this);
        }
      }, this);

      this.setFunctionalOutput(false);
    }
  };

  generator.functional_start_setFuncs = function () {
    if (!customGameLogic) {
      throw new Error('must register custom game logic');
    }

    // For each of our inputs (i.e. update-target, update-danger, etc.) get
    // the attached block and figure out what it's function name is. Store
    // that on BigGameLogic so we can know what functions to call later.
    this.blockArgs.forEach(function (arg) {
      var inputBlock = this.getInputTargetBlock(arg.name);
      if (!inputBlock) {
        return;
      }

      customGameLogic.cacheBlock(arg.name, inputBlock);
    }, this);
  };

  blockly.Blocks.functional_start_setSpeeds = {
    init: function () {
      var blockName = 'start (player-speed, enemy-speed)';
      var blockType = blockly.BlockValueType.NONE;
      var blockArgs = [
        {name: 'PLAYER_SPEED', type: 'Number'},
        {name: 'ENEMY_SPEED', type: 'Number'}
      ];
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, blockName, blockType, blockArgs);
    }
  };

  generator.functional_start_setSpeeds = function () {
    var defaultSpeed = 7;
    var playerSpeed = Blockly.JavaScript.statementToCode(this, 'PLAYER_SPEED', false) || defaultSpeed;
    var enemySpeed = Blockly.JavaScript.statementToCode(this, 'ENEMY_SPEED', false) || defaultSpeed;
    var playerSpriteIndex = '0';
    var enemySpriteIndex = '1';
    var code = 'Studio.setSpriteSpeed(\'block_id_' + this.id + '\',' +
        playerSpriteIndex + ',' + playerSpeed + ');\n';
    code += 'Studio.setSpriteSpeed(\'block_id_' + this.id + '\',' +
        enemySpriteIndex + ',' + enemySpeed + ');\n';
    return code;
  };

  blockly.Blocks.functional_start_setBackgroundAndSpeeds = {
    init: function () {
      var blockName = 'start (background, player-speed, enemy-speed)';
      var blockType = blockly.BlockValueType.NONE;
      var blockArgs = [
        {name: 'BACKGROUND', type: blockly.BlockValueType.STRING},
        {name: 'PLAYER_SPEED', type: 'Number'},
        {name: 'ENEMY_SPEED', type: 'Number'}
      ];
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, blockName, blockType, blockArgs);
    }
  };

  generator.functional_start_setBackgroundAndSpeeds = function () {
    var background = Blockly.JavaScript.statementToCode(this, 'BACKGROUND', false) || 'cave';
    var defaultSpeed = 7;
    var playerSpeed = Blockly.JavaScript.statementToCode(this, 'PLAYER_SPEED', false) || defaultSpeed;
    var enemySpeed = Blockly.JavaScript.statementToCode(this, 'ENEMY_SPEED', false) || defaultSpeed;
    var code =  'Studio.setBackground(\'block_id_' + this.id + '\'' +
        ',' + background + ');\n';
    code += 'Studio.setSpriteSpeed(\'block_id_' + this.id + '\',0' +
        ',' + playerSpeed + ');\n';
    code += 'Studio.setSpriteSpeed(\'block_id_' + this.id + '\',1' +
        ',' + enemySpeed + ');\n';
    return code;
  };

  // install number and string
  sharedFunctionalBlocks.install(blockly, generator);

  // Note: in other languages, the translated values won't be accepted
  // as valid backgrounds if they are typed in as free text. Also this
  // block will have the effect of translating the selected text to
  // english if not connected to the functional_setBackground block.
  // TODO(i18n): translate these strings in the Studio.setBackground
  // API instead of here.
  var functional_background_values = skin.backgroundChoices.slice(1);

  blockly.FunctionalBlockUtils.installStringPicker(blockly, generator, {
    blockName: 'functional_background_string_picker',
    values: functional_background_values
  });

  blockly.Blocks.studio_vanishSprite = {
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      this.appendValueInput('SPRITE').setCheck(blockly.BlockValueType.NUMBER)
          .appendTitle(msg.vanishActorN({spriteIndex: ''}));
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.vanishTooltip());
    }
  };

  generator.studio_vanishSprite = function () {
    var spriteParam = getSpriteIndex(this);
    return 'Studio.vanish(\'block_id_' + this.id + '\', ' + spriteParam +
        ');\n';
  };

  /**
   * functional_sprite_dropdown
   */
  blockly.Blocks.functional_sprite_dropdown = {
    helpUrl: '',
    init: function () {
      this.setHSV.apply(this, blockly.FunctionalTypeColors[blockly.BlockValueType.IMAGE]);

      this.VALUES = skin.spriteChoices;

      var choices = _.map(startAvatars, function (skinId) {
        return [skin[skinId].dropdownThumbnail, skinId];
      });
      var dropdown = new blockly.FieldImageDropdown(choices,
        skin.dropdownThumbnailWidth, skin.dropdownThumbnailHeight);

      this.appendDummyInput()
        .appendTitle(dropdown, 'SPRITE_INDEX');

      this.setFunctionalOutput(true);
    }
  };

  generator.functional_sprite_dropdown = function () {
    // returns the sprite index
    return blockly.JavaScript.quote_(this.getTitleValue('SPRITE_INDEX'));
  };

  /**
   * functional_background_dropdown
   */
  blockly.Blocks.functional_background_dropdown = {
    helpUrl: '',
    init: function () {
      this.setHSV.apply(this, blockly.FunctionalTypeColors[blockly.BlockValueType.IMAGE]);

      this.VALUES = skin.backgroundChoicesK1;
      var dropdown = new blockly.FieldImageDropdown(skin.backgroundChoicesK1,
        skin.dropdownThumbnailWidth, skin.dropdownThumbnailHeight);

      this.appendDummyInput()
        .appendTitle(dropdown, 'BACKGROUND');

      this.setFunctionalOutput(true);
    }
  };

  generator.functional_background_dropdown = function () {
    // returns the sprite index
    return generateSetterCode({
      value: this.getTitleValue('BACKGROUND'),
      ctx: this,
      returnValue: true
    });
  };

  /**
   * functional_keydown
   */
  blockly.Blocks.functional_keydown = {
    helpUrl: '',
    init: function () {
      // todo = localize
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, 'keydown?', blockly.BlockValueType.BOOLEAN, [
        {name: 'ARG1', type: 'Number'}
      ]);
    }
  };

  generator.functional_keydown = function () {
    var keyCode = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || - 1;
    return 'Studio.isKeyDown(' + keyCode + ');';
  };
};

function installVanish(blockly, generator, spriteNumberTextDropdown, startingSpriteImageDropdown, blockInstallOptions) {
  blockly.Blocks.studio_vanish = {
    helpUrl: '',
    init: function () {
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

  generator.studio_vanish = function () {
    var sprite = this.getTitleValue('SPRITE');
    return 'Studio.vanish(\'block_id_' + this.id + '\', ' + sprite + ');\n';
  };
}
