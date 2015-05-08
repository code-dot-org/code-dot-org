/* global $ */

var DropletFunctionTooltipMarkup = require('./DropletParameterTooltip.html.ejs');
var tooltipUtils = require('./tooltipUtils.js');

/**
 * @fileoverview Displays tooltips for Droplet blocks
 */

/**
 * Handles displaying tooltips on Droplet's ACE editor when filling in
 * an empty parameter.
 * @param {DropletTooltipManager} dropletTooltipManager
 * @constructor
 */
var DropletAutocompleteParameterTooltipManager = function (dropletTooltipManager) {
  this.dropletTooltipManager = dropletTooltipManager;
};

var DEFAULT_TOOLTIP_CONFIG = {
  interactive: true,
  autoClose: false,
  trigger: 'custom',
  speed: 100,
  maxWidth: 450,
  position: 'bottom',
  contentAsHTML: true,
  theme: 'droplet-block-tooltipster',
  offsetY: 2,
  restoration: 'none',
  updateAnimation: false,
  positionTracker: true
};

/**
 * @param {Editor} dropletEditor
 */
DropletAutocompleteParameterTooltipManager.prototype.installTooltipsForEditor_ = function (dropletEditor) {
  if (!window.$) {
    return; // TODO(bjordan): remove when $ available on dev server
  }

  var aceEditor = dropletEditor.aceEditor;

  var cursorMovementHandler = this.onCursorMovement_.bind(this, aceEditor);
  aceEditor.commands.on('afterExec', cursorMovementHandler);
  aceEditor.on('mousedown', function(e) {
    this.getCursorTooltip_().tooltipster('hide');
  }.bind(this));
};

/**
 * @param editor - ace editor instance
 * @param changeEvent - event from aceEditor.session.selection.on('changeCursor')
 * @private
 */
DropletAutocompleteParameterTooltipManager.prototype.onCursorMovement_ = function (editor, changeEvent) {
  this.getCursorTooltip_().tooltipster('hide');

  if (!editor.selection.isEmpty()) {
    return;
  }

  var cursorPosition = editor.selection.getCursor();

  var currentParameterInfo = tooltipUtils.findFunctionAndParamNumber(editor, cursorPosition);
  if (!currentParameterInfo) {
    return;
  }

  this.updateParameterTooltip_(editor, currentParameterInfo.funcName,
    currentParameterInfo.currentParameterIndex);
};

DropletAutocompleteParameterTooltipManager.prototype.updateParameterTooltip_ = function (aceEditor, functionName, currentParameterIndex) {
  if (!this.dropletTooltipManager.hasDocFor(functionName)) {
    return;
  }

  var tooltipInfo = this.dropletTooltipManager.getDropletTooltip(functionName);

  if (currentParameterIndex >= tooltipInfo.parameterInfos.length) {
    return;
  }

  this.getCursorTooltip_().tooltipster('content',
    this.getTooltipHTML(tooltipInfo, currentParameterIndex));
  this.getCursorTooltip_().tooltipster('show');
};

DropletAutocompleteParameterTooltipManager.prototype.getCursorTooltip_ = function () {
  if (!this.cursorTooltip_) {
    this.cursorTooltip_ = $('.droplet-ace .ace_cursor');
    this.cursorTooltip_.tooltipster(DEFAULT_TOOLTIP_CONFIG);
  }
  return this.cursorTooltip_;
};

/**
 * @returns {String} HTML for tooltip
 */
DropletAutocompleteParameterTooltipManager.prototype.getTooltipHTML = function (tooltipInfo, currentParameterIndex) {
  return DropletFunctionTooltipMarkup({
    functionName: tooltipInfo.functionName,
    functionShortDescription: tooltipInfo.description,
    parameters: tooltipInfo.parameterInfos,
    signatureOverride: tooltipInfo.signatureOverride,
    fullDocumentationURL: tooltipInfo.getFullDocumentationURL(),
    currentParameterIndex: currentParameterIndex
  });
};

module.exports = DropletAutocompleteParameterTooltipManager;
