/**
 * Blockly App: Bounce
 *
 * Copyright 2013 Code.org
 *
 */
var msg = require('./locale');

var generateSetterCode = function(ctx, name) {
  var value = ctx.getTitleValue('VALUE');
  if (value === 'random') {
    var allValues = ctx.VALUES.slice(1).map(function(item) {
      return item[1];
    });
    value = 'Bounce.random([' + allValues + '])';
  }

  return 'Bounce.' + name + "('block_id_" + ctx.id + "', " + value + ');\n';
};

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;

  var generator = blockly.getGenerator();
  blockly.JavaScript = generator;

  blockly.Blocks.bounce_whenLeft = {
    // Block to handle event when the Left arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.0, 0.74);
      this.appendDummyInput().appendTitle(msg.whenLeft());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenLeftTooltip());
    }
  };

  generator.bounce_whenLeft = function() {
    // Generate JavaScript for handling Left arrow button event.
    return '\n';
  };

  blockly.Blocks.bounce_whenRight = {
    // Block to handle event when the Right arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.0, 0.74);
      this.appendDummyInput().appendTitle(msg.whenRight());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenRightTooltip());
    }
  };

  generator.bounce_whenRight = function() {
    // Generate JavaScript for handling Right arrow button event.
    return '\n';
  };

  blockly.Blocks.bounce_whenUp = {
    // Block to handle event when the Up arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.0, 0.74);
      this.appendDummyInput().appendTitle(msg.whenUp());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenUpTooltip());
    }
  };

  generator.bounce_whenUp = function() {
    // Generate JavaScript for handling Up arrow button event.
    return '\n';
  };

  blockly.Blocks.bounce_whenDown = {
    // Block to handle event when the Down arrow button is pressed.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.0, 0.74);
      this.appendDummyInput().appendTitle(msg.whenDown());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenDownTooltip());
    }
  };

  generator.bounce_whenDown = function() {
    // Generate JavaScript for handling Down arrow button event.
    return '\n';
  };

  blockly.Blocks.bounce_whenWallCollided = {
    // Block to handle event when a wall/ball collision occurs.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.0, 0.74);
      this.appendDummyInput().appendTitle(msg.whenWallCollided());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenWallCollidedTooltip());
    }
  };

  generator.bounce_whenWallCollided = function() {
    // Generate JavaScript for handling when a wall/ball collision occurs.
    return '\n';
  };

  blockly.Blocks.bounce_whenBallInGoal = {
    // Block to handle event when a ball enters a goal.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.0, 0.74);
      this.appendDummyInput().appendTitle(msg.whenBallInGoal());
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenBallInGoalTooltip());
    }
  };

  generator.bounce_whenBallInGoal = function() {
    // Generate JavaScript for handling when a ball in goal event occurs.
    return '\n';
  };

  blockly.Blocks.bounce_whenBallMissesPaddle = {
    // Block to handle event when a ball misses the paddle.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.0, 0.74);
      this.appendDummyInput().appendTitle(skin.blockMsgs.paddleMiss);
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(msg.whenBallMissesPaddleTooltip());
    }
  };

  generator.bounce_whenBallMissesPaddle = function() {
    // Generate JavaScript for handling when a ball misses the paddle.
    return '\n';
  };

  blockly.Blocks.bounce_whenPaddleCollided = {
    // Block to handle event when a wall collision occurs.
    helpUrl: '',
    init: function() {
      this.setHSV(140, 1.0, 0.74);
      this.appendDummyInput().appendTitle(skin.blockMsgs.paddleCollide);
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      this.setTooltip(skin.blockMsgs.paddleCollideTooltip);
    }
  };

  generator.bounce_whenPaddleCollided = function() {
    // Generate JavaScript for handling when a paddle/ball collision occurs.
    return '\n';
  };

  blockly.Blocks.bounce_moveLeft = {
    // Block for moving left.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(msg.moveLeft());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveLeftTooltip());
    }
  };

  generator.bounce_moveLeft = function() {
    // Generate JavaScript for moving left.
    return "Bounce.moveLeft('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.bounce_moveRight = {
    // Block for moving right.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(msg.moveRight());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveRightTooltip());
    }
  };

  generator.bounce_moveRight = function() {
    // Generate JavaScript for moving right.
    return "Bounce.moveRight('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.bounce_moveUp = {
    // Block for moving up.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(msg.moveUp());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveUpTooltip());
    }
  };

  generator.bounce_moveUp = function() {
    // Generate JavaScript for moving up.
    return "Bounce.moveUp('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.bounce_moveDown = {
    // Block for moving down.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(msg.moveDown());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.moveDownTooltip());
    }
  };

  generator.bounce_moveDown = function() {
    // Generate JavaScript for moving down.
    return "Bounce.moveDown('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.bounce_playSound = {
    // Block for playing sound.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(this.SOUNDS),
        'SOUND'
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.playSoundTooltip());
    }
  };

  blockly.Blocks.bounce_playSound.SOUNDS = [];
  for (var sound in skin.customSounds) {
    if (skin.customSounds[sound].msg) {
      blockly.Blocks.bounce_playSound.SOUNDS.push([
        skin.customSounds[sound].msg,
        sound
      ]);
    }
  }

  generator.bounce_playSound = function() {
    // Generate JavaScript for playing a sound.
    return (
      "Bounce.playSound('block_id_" +
      this.id +
      "', '" +
      this.getTitleValue('SOUND') +
      "');\n"
    );
  };

  blockly.Blocks.bounce_incrementPlayerScore = {
    // Block for incrementing the player's score.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(msg.incrementPlayerScore());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.incrementPlayerScoreTooltip());
    }
  };

  generator.bounce_incrementPlayerScore = function() {
    // Generate JavaScript for incrementing the player's score.
    return "Bounce.incrementPlayerScore('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.bounce_incrementOpponentScore = {
    // Block for incrementing the opponent's score.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(msg.incrementOpponentScore());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.incrementOpponentScoreTooltip());
    }
  };

  generator.bounce_incrementOpponentScore = function() {
    // Generate JavaScript for incrementing the opponent's score.
    return "Bounce.incrementOpponentScore('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.bounce_bounceBall = {
    // Block for bouncing a ball.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(msg.bounceBall());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.bounceBallTooltip());
    }
  };

  generator.bounce_bounceBall = function() {
    // Generate JavaScript for bouncing a ball.
    return "Bounce.bounceBall('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.bounce_launchBall = {
    // Block for launching a ball.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(skin.blockMsgs.launchBall);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(skin.blockMsgs.launchBallTooltip);
    }
  };

  generator.bounce_launchBall = function() {
    // Generate JavaScript for launching a ball.
    return "Bounce.launchBall('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.bounce_setBallSpeed = {
    // Block for setting ball speed
    helpUrl: '',
    init: function() {
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[3][1]); // default to normal

      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setBallSpeedTooltip());
    }
  };

  blockly.Blocks.bounce_setBallSpeed.VALUES = [
    [msg.setBallSpeedRandom(), 'random'],
    [msg.setBallSpeedVerySlow(), 'Bounce.BallSpeed.VERY_SLOW'],
    [msg.setBallSpeedSlow(), 'Bounce.BallSpeed.SLOW'],
    [msg.setBallSpeedNormal(), 'Bounce.BallSpeed.NORMAL'],
    [msg.setBallSpeedFast(), 'Bounce.BallSpeed.FAST'],
    [msg.setBallSpeedVeryFast(), 'Bounce.BallSpeed.VERY_FAST']
  ];

  generator.bounce_setBallSpeed = function(velocity) {
    return generateSetterCode(this, 'setBallSpeed');
  };

  blockly.Blocks.bounce_setPaddleSpeed = {
    // Block for setting paddle speed
    helpUrl: '',
    init: function() {
      var dropdown = new blockly.FieldDropdown(this.VALUES);
      dropdown.setValue(this.VALUES[3][1]); // default to normal

      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(skin.blockMsgs.paddleSpeedTooltip);
    }
  };

  blockly.Blocks.bounce_setPaddleSpeed.VALUES = [
    [skin.blockMsgs.paddleSpeedRandom, 'random'],
    [skin.blockMsgs.paddleSpeedVerySlow, 'Bounce.PaddleSpeed.VERY_SLOW'],
    [skin.blockMsgs.paddleSpeedSlow, 'Bounce.PaddleSpeed.SLOW'],
    [skin.blockMsgs.paddleSpeedNormal, 'Bounce.PaddleSpeed.NORMAL'],
    [skin.blockMsgs.paddleSpeedFast, 'Bounce.PaddleSpeed.FAST'],
    [skin.blockMsgs.paddleSpeedVeryFast, 'Bounce.PaddleSpeed.VERY_FAST']
  ];

  generator.bounce_setPaddleSpeed = function(velocity) {
    return generateSetterCode(this, 'setPaddleSpeed');
  };

  /**
   * setBackground
   */
  blockly.Blocks.bounce_setBackground = {
    helpUrl: '',
    init: function() {
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

  blockly.Blocks.bounce_setBackground.VALUES = [
    [msg.setBackgroundRandom(), 'random']
  ].concat(
    skin.backgrounds.map(background => [
      msg.setBackground({background: background}),
      `"${background}"`
    ])
  );

  generator.bounce_setBackground = function() {
    return generateSetterCode(this, 'setBackground');
  };

  /**
   * setTeam
   */
  blockly.Blocks.bounce_setTeam = {
    helpUrl: '',
    init: function() {
      var dropdown = new blockly.FieldDropdown(this.VALUES);

      // default to warriors if we can
      if (this.VALUES.length > 14) {
        dropdown.setValue(this.VALUES[14][1]);
      }

      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setTeamTooltip());
    }
  };

  blockly.Blocks.bounce_setTeam.VALUES = [
    [msg.setTeamRandom(), 'random']
  ].concat(skin.teams.map(team => [msg.setTeam({team: team}), `"${team}"`]));

  generator.bounce_setTeam = function() {
    return generateSetterCode(this, 'setTeam');
  };

  /**
   * setBall
   */
  blockly.Blocks.bounce_setBall = {
    helpUrl: '',
    init: function() {
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

  blockly.Blocks.bounce_setBall.VALUES = [
    [msg.setBallRandom(), 'random']
  ].concat(skin.balls.map(ball => [msg.setBall({ball: ball}), `"${ball}"`]));

  generator.bounce_setBall = function() {
    return generateSetterCode(this, 'setBall');
  };

  /**
   * setPaddle
   */
  blockly.Blocks.bounce_setPaddle = {
    helpUrl: '',
    init: function() {
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

  blockly.Blocks.bounce_setPaddle.VALUES = [
    [msg.setPaddleRandom(), 'random'],
    [msg.setPaddleHardcourt(), '"hardcourt"'],
    [msg.setPaddleRetro(), '"retro"']
  ];

  generator.bounce_setPaddle = function() {
    return generateSetterCode(this, 'setPaddle');
  };

  /**
   * setPaddleDropdown
   */
  blockly.Blocks.bounce_setPaddleDropdown = {
    helpUrl: '',
    init: function() {
      var dropdown = new blockly.FieldImageDropdown(this.VALUES, 54, 61);
      if (this.VALUES.length > 1) {
        dropdown.setValue(this.VALUES[1][1]);
      }

      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput()
        .appendTitle(skin.blockMsgs.setPaddle)
        .appendTitle(dropdown, 'VALUE');
      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.setPaddleTooltip());
    }
  };

  blockly.Blocks.bounce_setPaddleDropdown.VALUES = skin.paddles.map(paddle => [
    skin[paddle].paddle,
    `"${paddle}"`
  ]);

  generator.bounce_setPaddleDropdown = function() {
    return generateSetterCode(this, 'setPaddle');
  };

  delete blockly.Blocks.procedures_defreturn;
  delete blockly.Blocks.procedures_ifreturn;
};
