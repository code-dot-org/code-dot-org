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
var _ = require('../lodash');
var studioApp = require('../StudioApp').singleton;

var FLAPPY_VALUE = '"flappy"';
var RANDOM_VALUE = 'random';

var generateSetterCode = function (ctx, name) {
  var value = ctx.getTitleValue('VALUE');
  if (value === RANDOM_VALUE) {
    var possibleValues =
      _(ctx.VALUES)
        .map(function (item) { return item[1]; })
        .reject(function (itemValue) { return itemValue === RANDOM_VALUE; });
    value = 'Flappy.random([' + possibleValues + '])';
  }

  return 'Flappy.' + name + '(\'block_id_' + ctx.id + '\', ' +
    value + ');\n';
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
    init: function () {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.when())
          .appendTitle(new blockly.FieldImage(skin.clickIcon));
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
    init: function () {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.when())
          .appendTitle(new blockly.FieldImage(skin.collideGroundIcon));
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
    init: function () {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.when())
          .appendTitle(new blockly.FieldImage(skin.collideObstacleIcon));
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
    init: function () {
      this.setHSV(140, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.when())
          .appendTitle(new blockly.FieldImage(skin.enterObstacleIcon));
      } else {
        this.appendDummyInput()
          .appendTitle(msg.whenEnterObstacle());
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
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(msg.flap())
          .appendTitle(new blockly.FieldImage(skin.flapIcon));
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
    init: function () {
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[3][1]); // default to normal

      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
          .appendTitle(dropdown, 'VALUE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.flapTooltip());
    }
  };

  blockly.Blocks.flappy_flap_height.VALUES =
      [[msg.flapRandom(), RANDOM_VALUE],
       [msg.flapVerySmall(), 'Flappy.FlapHeight.VERY_SMALL'],
       [msg.flapSmall(), 'Flappy.FlapHeight.SMALL'],
       [msg.flapNormal(), 'Flappy.FlapHeight.NORMAL'],
       [msg.flapLarge(), 'Flappy.FlapHeight.LARGE'],
       [msg.flapVeryLarge(), 'Flappy.FlapHeight.VERY_LARGE']];

  generator.flappy_flap_height = function (velocity) {
    return generateSetterCode(this, 'flap');
  };

  function onSoundSelected(soundValue) {
    if (soundValue === RANDOM_VALUE) {
      return;
    }
    studioApp.playAudio(utils.stripQuotes(soundValue));
  }

  blockly.Blocks.flappy_playSound = {
    // Block for playing sound.
    WING_FLAP_SOUND: '"sfx_wing"',
    helpUrl: '',
    init: function () {
      this.VALUES = isK1 ? this.k1SoundChoices : this.soundChoices;
      var soundDropdown = new blockly.FieldDropdown(this.VALUES, onSoundSelected);
      soundDropdown.setValue(this.WING_FLAP_SOUND);

      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.play())
          .appendTitle(new blockly.FieldImage(skin.soundIcon))
          .appendTitle(soundDropdown, 'VALUE');
      } else {
        this.appendDummyInput().appendTitle(soundDropdown, 'VALUE');
      }

      this.setHSV(184, 1.00, 0.74);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.playSoundTooltip());
    },
    get k1SoundChoices() {
      return [
        [msg.soundRandom(), RANDOM_VALUE],
        [msg.soundBounce(), '"wall"'],
        [msg.soundCrunch(), '"wall0"'],
        [msg.soundDie(), '"sfx_die"'],
        [msg.soundHit(), '"sfx_hit"'],
        [msg.soundPoint(), '"sfx_point"'],
        [msg.soundSwoosh(), '"sfx_swooshing"'],
        [msg.soundWing(), this.WING_FLAP_SOUND],
        [msg.soundJet(), '"jet"'],
        [msg.soundCrash(), '"crash"'],
        [msg.soundJingle(), '"jingle"'],
        [msg.soundSplash(), '"splash"'],
        [msg.soundLaser(), '"laser"']
      ];
    },
    get soundChoices() {
      return [
        [msg.playSoundRandom(), RANDOM_VALUE],
        [msg.playSoundBounce(), '"wall"'],
        [msg.playSoundCrunch(), '"wall0"'],
        [msg.playSoundDie(), '"sfx_die"'],
        [msg.playSoundHit(), '"sfx_hit"'],
        [msg.playSoundPoint(), '"sfx_point"'],
        [msg.playSoundSwoosh(), '"sfx_swooshing"'],
        [msg.playSoundWing(), this.WING_FLAP_SOUND],
        [msg.playSoundJet(), '"jet"'],
        [msg.playSoundCrash(), '"crash"'],
        [msg.playSoundJingle(), '"jingle"'],
        [msg.playSoundSplash(), '"splash"'],
        [msg.playSoundLaser(), '"laser"']
      ];
    }
  };

  generator.flappy_playSound = function () {
    return generateSetterCode(this, 'playSound');
  };

  blockly.Blocks.flappy_incrementPlayerScore = {
    // Block for incrementing the player's score.
    helpUrl: '',
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.score())
          .appendTitle(new blockly.FieldImage(skin.scoreCard));
      } else {
        this.appendDummyInput()
          .appendTitle(msg.incrementPlayerScore());
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
    init: function () {
      this.setHSV(184, 1.00, 0.74);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.end())
          .appendTitle(new blockly.FieldImage(skin.endIcon));
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
    init: function () {
      this.setHSV(312, 0.32, 0.62);
      if (isK1) {
        var fieldImageDropdown = new blockly.FieldImageDropdown(this.K1_VALUES, 63, 33);
        fieldImageDropdown.setValue(this.K1_VALUES[1][1]); // default to normal
        this.appendDummyInput()
          .appendTitle(msg.setSpeed())
          .appendTitle(fieldImageDropdown, 'VALUE');
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

  blockly.Blocks.flappy_setSpeed.K1_VALUES =
    [[skin.speedSlow, 'Flappy.LevelSpeed.SLOW'],
      [skin.speedMedium, 'Flappy.LevelSpeed.NORMAL'],
      [skin.speedFast, 'Flappy.LevelSpeed.FAST']];

  blockly.Blocks.flappy_setSpeed.VALUES =
      [[msg.speedRandom(), RANDOM_VALUE],
       [msg.speedVerySlow(), 'Flappy.LevelSpeed.VERY_SLOW'],
       [msg.speedSlow(), 'Flappy.LevelSpeed.SLOW'],
       [msg.speedNormal(), 'Flappy.LevelSpeed.NORMAL'],
       [msg.speedFast(), 'Flappy.LevelSpeed.FAST'],
       [msg.speedVeryFast(), 'Flappy.LevelSpeed.VERY_FAST']];

  generator.flappy_setSpeed = function () {
    return generateSetterCode(this, 'setSpeed');
  };

  /**
   * setGapHeight
   */
  blockly.Blocks.flappy_setGapHeight = {
    helpUrl: '',
    init: function () {
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[3][1]);  // default to normal

      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput()
          .appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setGapHeightTooltip());
    }
  };

  blockly.Blocks.flappy_setGapHeight.VALUES =
      [[msg.setGapRandom(), RANDOM_VALUE],
       [msg.setGapVerySmall(), 'Flappy.GapHeight.VERY_SMALL'],
       [msg.setGapSmall(), 'Flappy.GapHeight.SMALL'],
       [msg.setGapNormal(), 'Flappy.GapHeight.NORMAL'],
       [msg.setGapLarge(), 'Flappy.GapHeight.LARGE'],
       [msg.setGapVeryLarge(), 'Flappy.GapHeight.VERY_LARGE']];

  generator.flappy_setGapHeight = function () {
    return generateSetterCode(this, 'setGapHeight');
  };

  /**
   * setBackground
   */
  blockly.Blocks.flappy_setBackground = {
    helpUrl: '',
    init: function () {
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

  blockly.Blocks.flappy_setBackground.VALUES =
      [[msg.setBackgroundRandom(), RANDOM_VALUE],
       [msg.setBackgroundFlappy(), FLAPPY_VALUE],
       [msg.setBackgroundNight(), '"night"'],
       [msg.setBackgroundSciFi(), '"scifi"'],
       [msg.setBackgroundUnderwater(), '"underwater"'],
       [msg.setBackgroundCave(), '"cave"'],
       [msg.setBackgroundSanta(), '"santa"']];

  blockly.Blocks.flappy_setBackground.K1_CHOICES =
      [[skin.background, FLAPPY_VALUE],
       [skin.night.background, '"night"'],
       [skin.scifi.background, '"scifi"'],
       [skin.underwater.background, '"underwater"'],
       [skin.cave.background, '"cave"'],
       [skin.santa.background, '"santa"'],
       [skin.randomPurpleIcon, RANDOM_VALUE]];

  generator.flappy_setBackground = function () {
    return generateSetterCode(this, 'setBackground');
  };

  /**
   * setPlayer
   */
  blockly.Blocks.flappy_setPlayer = {
    helpUrl: '',
    init: function () {
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

  blockly.Blocks.flappy_setPlayer.VALUES =
      [[msg.setPlayerRandom(), RANDOM_VALUE],
       [msg.setPlayerFlappy(), FLAPPY_VALUE],
       [msg.setPlayerRedBird(), '"redbird"'],
       [msg.setPlayerSciFi(), '"scifi"'],
       [msg.setPlayerUnderwater(), '"underwater"'],
       [msg.setPlayerSanta(), '"santa"'],
       [msg.setPlayerCave(), '"cave"'],
       [msg.setPlayerShark(), '"shark"'],
       [msg.setPlayerEaster(), '"easter"'],
       [msg.setPlayerBatman(), '"batman"'],
       [msg.setPlayerSubmarine(), '"submarine"'],
       [msg.setPlayerUnicorn(), '"unicorn"'],
       [msg.setPlayerFairy(), '"fairy"'],
       [msg.setPlayerSuperman(), '"superman"'],
       [msg.setPlayerTurkey(), '"turkey"']];

  blockly.Blocks.flappy_setPlayer.K1_CHOICES =
      [[skin.avatar, FLAPPY_VALUE],
       [skin.redbird.avatar, '"redbird"'],
       [skin.scifi.avatar, '"scifi"'],
       [skin.underwater.avatar, '"underwater"'],
       [skin.santa.avatar, '"santa"'],
       [skin.cave.avatar, '"cave"'],
       [skin.shark.avatar, '"shark"'],
       [skin.easter.avatar, '"easter"'],
       [skin.batman.avatar, '"batman"'],
       [skin.submarine.avatar, '"submarine"'],
       [skin.unicorn.avatar, '"unicorn"'],
       [skin.fairy.avatar, '"fairy"'],
       [skin.superman.avatar, '"superman"'],
       [skin.turkey.avatar, '"turkey"'],
       [skin.randomPurpleIcon, RANDOM_VALUE]];

  generator.flappy_setPlayer = function () {
    return generateSetterCode(this, 'setPlayer');
  };

  /**
   * setObstacle
   */
  blockly.Blocks.flappy_setObstacle = {
    helpUrl: '',
    init: function () {
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

  blockly.Blocks.flappy_setObstacle.VALUES =
      [[msg.setObstacleRandom(), RANDOM_VALUE],
       [msg.setObstacleFlappy(), FLAPPY_VALUE],
       [msg.setObstacleSciFi(), '"scifi"'],
       [msg.setObstacleUnderwater(), '"underwater"'],
       [msg.setObstacleCave(), '"cave"'],
       [msg.setObstacleSanta(), '"santa"'],
       [msg.setObstacleLaser(), '"laser"']];

  blockly.Blocks.flappy_setObstacle.K1_CHOICES =
      [[skin.obstacle_bottom_thumb, FLAPPY_VALUE],
       [skin.scifi.obstacle_bottom_thumb, '"scifi"'],
       [skin.underwater.obstacle_bottom_thumb, '"underwater"'],
       [skin.cave.obstacle_bottom_thumb, '"cave"'],
       [skin.santa.obstacle_bottom_thumb, '"santa"'],
       [skin.laser.obstacle_bottom_thumb, '"laser"'],
       [skin.randomPurpleIcon, RANDOM_VALUE]];

  generator.flappy_setObstacle = function () {
    return generateSetterCode(this, 'setObstacle');
  };

  /**
   * setGround
   */
  blockly.Blocks.flappy_setGround = {
    helpUrl: '',
    init: function () {
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

  blockly.Blocks.flappy_setGround.VALUES =
      [[msg.setGroundRandom(), RANDOM_VALUE],
       [msg.setGroundFlappy(), FLAPPY_VALUE],
       [msg.setGroundSciFi(), '"scifi"'],
       [msg.setGroundUnderwater(), '"underwater"'],
       [msg.setGroundCave(), '"cave"'],
       [msg.setGroundSanta(), '"santa"'],
       [msg.setGroundLava(), '"lava"']];

  blockly.Blocks.flappy_setGround.K1_CHOICES =
      [[skin.ground_thumb, FLAPPY_VALUE],
       [skin.scifi.ground_thumb, '"scifi"'],
       [skin.underwater.ground_thumb, '"underwater"'],
       [skin.cave.ground_thumb, '"cave"'],
       [skin.santa.ground_thumb, '"santa"'],
       [skin.lava.ground_thumb, '"lava"'],
       [skin.randomPurpleIcon, RANDOM_VALUE]];

  generator.flappy_setGround = function () {
    return generateSetterCode(this, 'setGround');
  };

  /**
   * setGravity
   */
  blockly.Blocks.flappy_setGravity = {
    helpUrl: '',
    init: function () {
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[3][1]);  // default to normal

      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput()
          .appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setGravityTooltip());
    }
  };

  blockly.Blocks.flappy_setGravity.VALUES =
      [[msg.setGravityRandom(), RANDOM_VALUE],
       [msg.setGravityVeryLow(), 'Flappy.Gravity.VERY_LOW'],
       [msg.setGravityLow(), 'Flappy.Gravity.LOW'],
       [msg.setGravityNormal(), 'Flappy.Gravity.NORMAL'],
       [msg.setGravityHigh(), 'Flappy.Gravity.HIGH'],
       [msg.setGravityVeryHigh(), 'Flappy.Gravity.VERY_HIGH']
      ];

  generator.flappy_setGravity = function () {
    return generateSetterCode(this, 'setGravity');
  };

  blockly.Blocks.flappy_setScore = {
    // Block for moving forward or backward the internal number of pixels.
    init: function () {
      this.setHSV(312, 0.32, 0.62);
      this.appendDummyInput()
          .appendTitle(msg.setScore())
          .appendTitle(new blockly.FieldTextInput('0',
            blockly.FieldTextInput.numberValidator), 'VALUE');
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
