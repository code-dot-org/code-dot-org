/**
 * CodeOrgApp: Webapp
 *
 * Copyright 2014 Code.org
 *
 */
'use strict';

var msg = require('../../locale/current/webapp');
var commonMsg = require('../../locale/current/common');
var codegen = require('../codegen');
var utils = require('../utils');
var _ = utils.getLodash();

var RANDOM_VALUE = 'random';
var HIDDEN_VALUE = '"hidden"';
var CLICK_VALUE = '"click"';
var VISIBLE_VALUE = '"visible"';

var generateSetterCode = function (opts) {
  var value = opts.ctx.getTitleValue('VALUE');
  if (value === RANDOM_VALUE) {
    var possibleValues =
      _(opts.ctx.VALUES)
        .map(function (item) { return item[1]; })
        .without(RANDOM_VALUE, HIDDEN_VALUE, CLICK_VALUE);
    value = 'Webapp.random([' + possibleValues + '])';
  }

  return 'Webapp.' + opts.name + '(\'block_id_' + opts.ctx.id + '\', ' +
    (opts.extraParams ? opts.extraParams + ', ' : '') + value + ');\n';
};

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;
  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  generator.webapp_eventHandlerPrologue = function() {
    return '\n';
  };

  installTurnBlack(blockly, generator, blockInstallOptions);
  installCreateHtmlBlock(blockly, generator, blockInstallOptions);
};

function installTurnBlack(blockly, generator, blockInstallOptions) {
  blockly.Blocks.webapp_turnBlack = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.turnBlack());
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.turnBlackTooltip());
    }
  };

  generator.webapp_turnBlack = function() {
    return 'Webapp.turnBlack(\'block_id_' + this.id + '\');\n';
  };
}

function installCreateHtmlBlock(blockly, generator, blockInstallOptions) {
  blockly.Blocks.webapp_createHtmlBlock = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.00, 0.74);
      this.appendDummyInput().appendTitle(msg.createHtmlBlock());
      this.appendValueInput('ID');
      this.appendValueInput('HTML');
      this.setPreviousStatement(true);
      this.setInputsInline(true);
      this.setNextStatement(true);
      this.setTooltip(msg.createHtmlBlockTooltip());
    }
  };

  generator.webapp_createHtmlBlock = function() {
    var idParam = Blockly.JavaScript.valueToCode(this, 'ID',
        Blockly.JavaScript.ORDER_NONE) || '';
    var htmlParam = Blockly.JavaScript.valueToCode(this, 'HTML',
        Blockly.JavaScript.ORDER_NONE) || '';
    return 'Webapp.createHtmlBlock(\'block_id_' + this.id +
               '\', ' + idParam + ', ' + htmlParam + ');\n';
  };
}
