
/**
 * @fileoverview Demonstration of Blockly: Minecraft
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var msg = require('../../locale/current/minecraft');
var commonMsg = require('../../locale/current/common');
var blockUtils = require('../block_utils');

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
//  var skin = blockInstallOptions.skin;
  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;


  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'minecraft_log',
    helpUrl: 'http://google.com',
    title: "Log something", // TODO Localize
    tooltip: 'TODO Localize me', // TODO localize
    functionName: 'Minecraft.log'
  });

};
