var DropletFunctionTooltip = require('./DropletFunctionTooltip');
var DropletBlockTooltipManager = require('./DropletBlockTooltipManager');
var DropletAutocompletePopupTooltipManager = require('./DropletAutocompletePopupTooltipManager');
var DropletAutocompleteParameterTooltipManager = require('./DropletAutocompleteParameterTooltipManager');
var dropletUtils = require('../dropletUtils');

/**
 * @fileoverview Manages a store of known blocks and tooltips
 */

/**
 * Store for finding tooltips for blocks
 * @constructor
 */
function DropletTooltipManager(appMsg, dropletConfig, codeFunctions, autocompletePaletteApisOnly) {
  /**
   * App-specific strings (to override common msg)
   * @type {Object.<String, Function>}
   */
  this.appMsg = appMsg || {};
  this.tooltipsEnabled = true;

  /**
   * Droplet config for this app
   */
  this.dropletConfig = dropletConfig || {};

  /**
   * Code functions
   * @type {Object.<String>} optional object with keys to modify the blocks
   */
  this.codeFunctions = codeFunctions;

  /**
   * Flag to limit the number of APIs that see autocomplete behavior
   */
  this.autocompletePaletteApisOnly = autocompletePaletteApisOnly;

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
 * Registers blocks based on the dropletBlocks and codeFunctions passed to the constructor
 */
DropletTooltipManager.prototype.registerBlocks = function () {
  dropletUtils.getAllAvailableDropletBlocks(
    this.dropletConfig,
    this.codeFunctions,
    this.autocompletePaletteApisOnly).forEach(
    function (dropletBlockDefinition) {
      if (this.autocompletePaletteApisOnly &&
          this.codeFunctions &&
          typeof this.codeFunctions[dropletBlockDefinition.func] === 'undefined') {
        // autocompletePaletteApisOnly mode enabled and block is not in palette:
        return;
      }
      this.blockTypeToTooltip[dropletBlockDefinition.func] =
        new DropletFunctionTooltip(this.appMsg, dropletBlockDefinition);
    },
    this);
};

DropletTooltipManager.prototype.hasDocFor = function (functionName) {
  return this.blockTypeToTooltip.hasOwnProperty(functionName);
};

DropletTooltipManager.prototype.showDocFor = function (functionName) {
  if (!this.tooltipsEnabled) {
    return;
  }
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

/**
 * @param {boolean} enabled if tooltips should be enabled.
 */
DropletTooltipManager.prototype.setTooltipsEnabled = function (enabled) {
  this.tooltipsEnabled = !!enabled;
  this.dropletAutocompletePopupTooltipManager_.setTooltipsEnabled(enabled);
  this.dropletAutocompleteParameterTooltipManager_.setTooltipsEnabled(enabled);
  this.dropletBlockTooltipManager_.setTooltipsEnabled(enabled);
};

module.exports = DropletTooltipManager;
