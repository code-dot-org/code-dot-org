'use strict';

goog.provide('Blockly.Playground');

goog.require('Blockly');

/**
 * in full compilation mode, these get built out into separate packages
 * (e.g., blocks_compressed.js / javascript_compressed.js)
 * for the test and playground no-build-required scenario,
 * require all example blocks
 */
goog.require('Blockly.Blocks.colour');
goog.require('Blockly.Blocks.functionalExamples');
goog.require('Blockly.Blocks.functionalParameters');
goog.require('Blockly.Blocks.functionalProcedures');
goog.require('Blockly.Blocks.lists');
goog.require('Blockly.Blocks.logic');
goog.require('Blockly.Blocks.loops');
goog.require('Blockly.Blocks.math');
goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Blocks.text');
goog.require('Blockly.Blocks.variables');
goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.colour');
goog.require('Blockly.JavaScript.functionalExamples');
goog.require('Blockly.JavaScript.functionalParameters');
goog.require('Blockly.JavaScript.functionalProcedures');
goog.require('Blockly.JavaScript.lists');
goog.require('Blockly.JavaScript.logic');
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.JavaScript.procedures');
goog.require('Blockly.JavaScript.text');
goog.require('Blockly.JavaScript.variables');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.Dialog.ButtonSet');

/**
 * @param {DialogOptions} dialogOptions
 */
Blockly.Playground.customSimpleDialog = function (dialogOptions) {
  var dialog = new goog.ui.Dialog();
  dialog.setTitle(dialogOptions.headerText);
  dialog.setContent(dialogOptions.bodyText);
  var buttons = new goog.ui.Dialog.ButtonSet();
  buttons.set(goog.ui.Dialog.DefaultButtonKeys.CANCEL,
      dialogOptions.cancelText,
      false,
      true);
  buttons.set(goog.ui.Dialog.DefaultButtonKeys.OK,
      dialogOptions.confirmText,
      true);
  goog.events.listen(dialog, goog.ui.Dialog.EventType.SELECT, function(e) {
      switch (e.key) {
        case goog.ui.Dialog.DefaultButtonKeys.CANCEL:
          if (dialogOptions.onCancel) {
            dialogOptions.onCancel();
          }
          break;
        case goog.ui.Dialog.DefaultButtonKeys.OK:
          if (dialogOptions.onConfirm) {
            dialogOptions.onConfirm();
          }
          break;
      }
    });
  dialog.setButtonSet(buttons);
  dialog.setVisible(true);
};
