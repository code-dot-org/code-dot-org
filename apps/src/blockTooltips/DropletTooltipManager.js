/* global $ */

var DropletFunctionTooltip = require('./DropletFunctionTooltip');
var DropletBlockTooltipManager = require('./DropletBlockTooltipManager');
var DropletAutocompletePopupTooltipManager = require('./DropletAutocompletePopupTooltipManager');
var DropletAutocompleteParameterTooltipManager = require('./DropletAutocompleteParameterTooltipManager');

/**
 * @fileoverview Manages a store of known blocks and tooltips
 */

/**
 * Store for finding tooltips for blocks
 * @constructor
 */
function DropletTooltipManager(appMsg) {
  /**
   * App-specific strings (to override common msg)
   * @type {Object.<String, Function>}
   */
  this.appMsg = appMsg || {};

  /**
   * Map of block types to tooltip objects
   * @type {Object.<String, DropletFunctionTooltip>}
   */
  this.blockTypeToTooltip = {};

  /**
   * @type {DropletBlockTooltipManager}
   * @private
   */
  this.dropletBlockTooltipManager_ = new DropletBlockTooltipManager(this);

  /**
   * @type {DropletAutocompletePopupTooltipManager}
   * @private
   */
  this.dropletAutocompletePopupTooltipManager_ = new DropletAutocompletePopupTooltipManager(this);

  /**
   * @type {DropletAutocompletePopupTooltipManager}
   * @private
   */
  this.dropletAutocompleteParameterTooltipManager_ = new DropletAutocompleteParameterTooltipManager(this);
}

/**
 * Registers handlers for droplet block tooltips.
 * @param dropletEditor
 */
DropletTooltipManager.prototype.registerDropletBlockModeHandlers = function (dropletEditor) {
  this.dropletBlockTooltipManager_.installTooltipsForEditor_(dropletEditor);
};

/**
 * Registers handlers for ACE mode tooltips
 * @param dropletEditor
 */
DropletTooltipManager.prototype.registerDropletTextModeHandlers = function (dropletEditor) {
  this.dropletAutocompletePopupTooltipManager_.installTooltipsForEditor_(dropletEditor);
  this.dropletAutocompleteParameterTooltipManager_.installTooltipsForEditor_(dropletEditor);
};

/**
 * @param {DropletBlock[]} dropletBlocks list of Droplet block definitions for
 *    which to register documentation
 */
DropletTooltipManager.prototype.registerBlocksFromList = function (dropletBlocks) {
  dropletBlocks.forEach(function (dropletBlockDefinition) {
    this.blockTypeToTooltip[dropletBlockDefinition.func] =
      new DropletFunctionTooltip(this.appMsg, dropletBlockDefinition);
  }, this);
};

DropletTooltipManager.prototype.hasDocFor = function (functionName) {
  return this.blockTypeToTooltip.hasOwnProperty(functionName);
};

DropletTooltipManager.prototype.showDocFor = function (functionName) {
  $('.tooltipstered').tooltipster('hide');
  var dialog = new window.Dialog({
    body: $('<iframe>')
      .addClass('markdown-instructions-container')
      .width('100%')
      .attr('src', this.getDropletTooltip(functionName).getFullDocumentationURL()),
    autoResizeScrollableElement: '.markdown-instructions-container',
    id: 'block-documentation-lightbox'
  });
  dialog.show();
};

/**
 * @param {String} functionName
 * @returns {DropletFunctionTooltip}
 */
DropletTooltipManager.prototype.getDropletTooltip = function (functionName) {
  if (!this.blockTypeToTooltip.hasOwnProperty(functionName)) {
    throw "Function name " + functionName + " not registered in documentation manager.";
  }

  return this.blockTypeToTooltip[functionName];
};

module.exports = DropletTooltipManager;
