
/**
 * @fileoverview Demonstration of Blockly: Minecraft
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var msg = require('../../locale/current/minecraft');
var commonMsg = require('../../locale/current/common');
var blockUtils = require('../block_utils');
var utils = require('../utils');

var generateSetterCode = function (ctx, name) {
  var value = ctx.getTitleValue('VALUE');
  return 'Minecraft.' + name + '(\'block_id_' + ctx.id + '\', ' +
    value + ');\n';
};

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;


  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'minecraft_log',
    helpUrl: 'http://google.com',
    title: "hello world", // TODO Localize
    tooltip: 'TODO Localize me', // TODO localize
    functionName: 'Minecraft.log'
  });


  function onSoundSelected(soundValue) {
    if (soundValue === 'random') {
      return;
    }
    BlocklyApps.playAudio(utils.stripQuotes(soundValue), {volume: 1.0});
  }

  blockly.Blocks.minecraft_playSound = {
    // Block for playing sound.
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput()
        .appendTitle('play sound')
        .appendTitle(new blockly.FieldDropdown(this.K1_SOUNDS, onSoundSelected), 'VALUE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('play sound');
    }
  };

  blockly.Blocks.minecraft_playSound.K1_SOUNDS =
    [
      ['win', 'win'],
      ['start', 'start'],
      ['failure', 'failure']
    ];

  generator.minecraft_playSound = function() {
    return generateSetterCode(this, 'playSound');
  };
};
