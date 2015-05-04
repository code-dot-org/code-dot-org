var DropletFunctionTooltipMarkup = require('./DropletFunctionTooltip.html.ejs');

/**
 * @fileoverview Displays tooltips for Droplet blocks
 */

/**
 * Handles displaying tooltips on Droplet's ACE editor autocomplete dropdown
 * @param {DropletTooltipManager} dropletTooltipManager
 * @constructor
 */
var DropletAutocompletePopupTooltipManager = function (dropletTooltipManager) {
  this.dropletTooltipManager = dropletTooltipManager;
};

var DEFAULT_TOOLTIP_CONFIG = {
  interactive: true,
  autoClose: false,
  trigger: 'custom',
  speed: 100,
  maxWidth: 450,
  position: 'left',
  contentAsHTML: true,
  theme: 'droplet-block-tooltipster',
  offsetY: 2,
  restoration: 'none',
  updateAnimation: false
};

/**
 * @param {Editor} dropletEditor
 */
DropletAutocompletePopupTooltipManager.prototype.registerHandlers = function (dropletEditor) {
  if (!window.$) {
    return; // TODO(bjordan): remove when $ available on dev server
  }

  var aceEditor = dropletEditor.aceEditor;

  var registerOnEditorChanged = function (e) {
    if (e.command.name !== 'insertstring') {
      return;
    }

    var popupHasBeenShown = aceEditor.completer && aceEditor.completer.popup;
    if (!popupHasBeenShown) {
      return;
    }

    this.registerPopupHandlers_(aceEditor);
    aceEditor.commands.off("afterExec", registerOnEditorChanged);
  }.bind(this);

  aceEditor.commands.on("afterExec", registerOnEditorChanged);
};

DropletAutocompletePopupTooltipManager.prototype.registerPopupHandlers_ = function (aceEditor) {
  this.installAfterRenderHandler_(aceEditor);
  this.installHideHandler_(aceEditor);
};

DropletAutocompletePopupTooltipManager.prototype.installAfterRenderHandler_ = function (aceEditor) {
  aceEditor.completer.popup.setSelectOnHover(true);

  aceEditor.completer.popup.renderer.on("afterRender", function () {
    this.updateAutocompletePopupTooltip(aceEditor);
  }.bind(this));
};

DropletAutocompletePopupTooltipManager.prototype.installHideHandler_ = function (aceEditor) {
  aceEditor.completer.popup.on("hide", function () {
    this.destroyAutocompleteTooltips_();
  }.bind(this));
};

DropletAutocompletePopupTooltipManager.prototype.updateAutocompletePopupTooltip = function (aceEditor) {
  if (!aceEditor.completer.completions) {
    return;
  }

  var keyboardRow = aceEditor.completer.popup.getRow();

  var filteredCompletions = aceEditor.completer.completions.filtered;

  if (keyboardRow >= 0) {
    var funcName = filteredCompletions[keyboardRow].value;

    this.destroyAutocompleteTooltips_();

    if (!this.dropletTooltipManager.hasDocFor(funcName)) {
      return;
    }

    var configuration = $.extend({}, DEFAULT_TOOLTIP_CONFIG, {
      content: this.getTooltipHTML(funcName)
    });

    var rowOverlayDiv = $('.ace_selected');
    rowOverlayDiv.tooltipster(configuration);
    rowOverlayDiv.tooltipster('show');
  }
};

DropletAutocompletePopupTooltipManager.prototype.destroyAutocompleteTooltips_ = function () {
  $('.ace_editor .tooltipstered').tooltipster('destroy');
};

/**
 * @returns {String} HTML for tooltip
 */
DropletAutocompletePopupTooltipManager.prototype.getTooltipHTML = function (functionName) {
  var tooltipInfo = this.dropletTooltipManager.getDropletTooltip(functionName);
  return DropletFunctionTooltipMarkup({
    functionName: tooltipInfo.functionName,
    functionShortDescription: tooltipInfo.description,
    parameters: tooltipInfo.paramNames,
    signatureOverride: tooltipInfo.signatureOverride,
    fullDocumentationURL: tooltipInfo.getFullDocumentationURL()
  });
};

module.exports = DropletAutocompletePopupTooltipManager;
