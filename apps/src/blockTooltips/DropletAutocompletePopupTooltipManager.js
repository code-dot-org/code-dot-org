var DropletFunctionTooltipMarkup = require('./DropletFunctionTooltip.html.ejs');
var dom = require('../dom');

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
  this.showExamplesLink = dropletTooltipManager.dropletConfig.showExamplesLink;
  this.tooltipsEnabled = true;
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
DropletAutocompletePopupTooltipManager.prototype.installTooltipsForEditor_ = function (dropletEditor) {
  var aceEditor = dropletEditor.aceEditor;

  this.editorChangedEventHandler_ = this.setupOnPopupShown_.bind(this, aceEditor);
  aceEditor.commands.on("afterExec", this.editorChangedEventHandler_);
};

/**
 * When an autocomplete popup has been shown the first time, register event
 * handlers to show and hide tooltips during autocomplete popup usage.
 * @param aceEditor - ace editor instance
 * @param changeEvent - event from aceEditor.commands.on("afterExec")
 * @private
 */
DropletAutocompletePopupTooltipManager.prototype.setupOnPopupShown_ = function (aceEditor, changeEvent) {
  if (changeEvent.command.name !== 'insertstring') {
    return;
  }

  var popupHasBeenShownOnce = aceEditor.completer && aceEditor.completer.popup;
  if (!popupHasBeenShownOnce) {
    return;
  }

  this.setupForEditorPopup_(aceEditor);

  aceEditor.commands.removeListener("afterExec", this.editorChangedEventHandler_);
  this.editorChangedEventHandler_ = null;
};

DropletAutocompletePopupTooltipManager.prototype.setupForEditorPopup_ = function (aceEditor) {
  aceEditor.completer.popup.setSelectOnHover(true);

  aceEditor.completer.popup.renderer.on("afterRender", function () {
    this.updateAutocompletePopupTooltip(aceEditor);
  }.bind(this));

  aceEditor.completer.popup.on("hide", function () {
    this.destroyAutocompleteTooltips_();
  }.bind(this));
};

DropletAutocompletePopupTooltipManager.prototype.updateAutocompletePopupTooltip = function (aceEditor) {
  if (!this.tooltipsEnabled || !aceEditor.completer.completions) {
    return;
  }

  var keyboardRow = aceEditor.completer.popup.getRow();

  if (keyboardRow < 0) {
    return;
  }

  var filteredCompletions = aceEditor.completer.completions.filtered;
  var funcName = filteredCompletions[keyboardRow].docFunc || filteredCompletions[keyboardRow].value;

  this.destroyAutocompleteTooltips_();

  if (!this.dropletTooltipManager.getDocFor(funcName)) {
    return;
  }

  this.attachTooltipForFunction(funcName);
};

DropletAutocompletePopupTooltipManager.prototype.attachTooltipForFunction = function (funcName) {
  var tooltipDOM = this.getTooltipHTML(funcName);
  var configuration = $.extend({}, DEFAULT_TOOLTIP_CONFIG, {
    content: tooltipDOM,
    functionReady: function (_, contents) {
      if (!this.showExamplesLink) {
        return;
      }
      var seeExamplesLink = contents.find('.tooltip-example-link > a')[0];
      // Important this binds to mouseDown/touchDown rather than click, needs to
      // happen before `blur` which triggers the ace editor completer popup
      // hide which in turn would hide the link and not show the docs.
      dom.addClickTouchEvent(seeExamplesLink, function (event) {
        this.dropletTooltipManager.showDocFor(funcName);
        event.stopPropagation();
      }.bind(this));
    }.bind(this)
  });

  var rowOverlayDiv = $('.ace_selected');
  rowOverlayDiv.tooltipster(configuration);
  rowOverlayDiv.tooltipster('show');
};

DropletAutocompletePopupTooltipManager.prototype.destroyAutocompleteTooltips_ = function () {
  $('.ace_autocomplete .tooltipstered').tooltipster('destroy');
};

/**
 * @returns {String} HTML for tooltip
 */
DropletAutocompletePopupTooltipManager.prototype.getTooltipHTML = function (functionName) {
  var tooltipInfo = this.dropletTooltipManager.getDropletTooltip(functionName);
  var dropletFunctionTooltipMarkup = DropletFunctionTooltipMarkup({
    functionName: tooltipInfo.functionName,
    isProperty: tooltipInfo.isProperty,
    tipPrefix: tooltipInfo.tipPrefix,
    functionShortDescription: tooltipInfo.description,
    parameters: tooltipInfo.parameterInfos,
    signatureOverride: tooltipInfo.signatureOverride,
    showExamplesLink: this.showExamplesLink
  });
  return dropletFunctionTooltipMarkup;
};

/**
 * @param {boolean} enabled if tooltips are enabled
 */

DropletAutocompletePopupTooltipManager.prototype.setTooltipsEnabled = function (enabled) {
  this.tooltipsEnabled = !!enabled;
};

module.exports = DropletAutocompletePopupTooltipManager;
