/* global $ */

var DropletFunctionTooltipMarkup = require('./DropletParameterTooltip.html.ejs');
var tooltipUtils = require('./tooltipUtils.js');
var dom = require('../dom');

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

  var cursorTooltip = this.getCursorTooltip_();

  cursorTooltip.tooltipster('content', this.getTooltipHTML(tooltipInfo, currentParameterIndex));
  cursorTooltip.tooltipster('show');

  var seeExamplesLink = $(cursorTooltip.tooltipster('elementTooltip')).find('.tooltip-example-link > a')[0];
  dom.addClickTouchEvent(seeExamplesLink, function (event) {
    this.dropletTooltipManager.showDocFor(functionName);
    event.stopPropagation();
  }.bind(this));

  var chooseAsset = tooltipInfo.parameterInfos[currentParameterIndex].assetTooltip;
  if (chooseAsset) {
    var chooseAssetLink = $(cursorTooltip.tooltipster('elementTooltip')).find('.tooltip-choose-link > a')[0];
    dom.addClickTouchEvent(chooseAssetLink, function(event) {
      cursorTooltip.tooltipster('hide');
      chooseAsset(function(filename) {
        aceEditor.onTextInput('"' + filename + '"');
      });
      event.stopPropagation();
    }.bind(this));
  }
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
    funcName: tooltipInfo.functionName,
    functionName: tooltipInfo.functionName,
    functionShortDescription: tooltipInfo.description,
    parameters: tooltipInfo.parameterInfos,
    signatureOverride: tooltipInfo.signatureOverride,
    fullDocumentationURL: tooltipInfo.getFullDocumentationURL(),
    currentParameterIndex: currentParameterIndex
  });
};

module.exports = DropletAutocompleteParameterTooltipManager;
