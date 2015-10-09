var DropletFunctionTooltipMarkup = require('./DropletParameterTooltip.html.ejs');
var tooltipUtils = require('./tooltipUtils.js');
var dom = require('../dom');

/**
 * @fileoverview Displays tooltips for Droplet blocks
 */

/**
 * Handles displaying tooltips on Droplet's ACE editor when filling in
 * an empty parameter.
 * Also will augment ACE editor's Live autocomplete by invoking scoped
 * autocomplete dropdowns for each parameter.
 * @param {DropletTooltipManager} dropletTooltipManager
 * @constructor
 */
var DropletAutocompleteParameterTooltipManager = function (dropletTooltipManager) {
  this.dropletTooltipManager = dropletTooltipManager;
  this.showParamDropdowns = dropletTooltipManager.dropletConfig.showParamDropdowns;
  this.tooltipConfig = {
    interactive: true,
    autoClose: false,
    trigger: 'custom',
    speed: 100,
    maxWidth: 450,
    position: this.showParamDropdowns ? 'top' : 'bottom',
    contentAsHTML: true,
    theme: 'droplet-block-tooltipster',
    offsetY: 2,
    restoration: 'none',
    updateAnimation: false,
    positionTracker: true
  };
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

  if (this.startingAutoComplete) {
    // Guard against re-entrancy that occurs inside the showParamDropdownIfNeeded_() below
    return;
  }

  if (editor.completer && this.showParamDropdowns) {
    this.showParamDropdownIfNeeded_(editor, currentParameterInfo);
  }

  this.updateParameterTooltip_(editor, currentParameterInfo.funcName,
      currentParameterInfo.currentParameterIndex);
};

/**
 * @param editor - ace editor instance
 * @param paramInfo - parameter info already retrieved based on the cursor position
 * @private
 */
DropletAutocompleteParameterTooltipManager.prototype.showParamDropdownIfNeeded_ = function (editor, paramInfo) {
  // Check the dropletConfig to see if we can find dropdown info for this parameter
  var dropdownList;
  this.dropletTooltipManager.dropletConfig.blocks.forEach(function (block) {
    if (block.func === paramInfo.funcName && block.dropdown) {
      dropdownList = block.dropdown[paramInfo.currentParameterIndex];
    }
  });

  if (dropdownList && !editor.completer.activated) {
    // The cursor is positioned where a parameter with a dropdown should appear
    // and autocomplete is not already active, so let's pop up a special dropdown
    // autocomplete

    // First, install our hooks to modify the normal ace AutoComplete (these are
    // safe to leave in place, and we can call this multiple times):
    DropletAutocompleteParameterTooltipManager.installAceCompleterHooks_(editor);

    // Create a new ace completer based on the dropdown info and mark it as the
    // "overrideCompleter" which will stay in place for the next popup from
    // autocomplete only:
    var dropdownCompletions = [];
    dropdownList.forEach(function (listValue) {
      dropdownCompletions.push({
        name: 'dropdown',
        value: listValue
      });
    });
    editor.completer.overrideCompleter = {
      getCompletions: function(editor, session, pos, prefix, callback) {
        callback(null, dropdownCompletions);
      }
    };
    // Mark the we are starting auto-complete so that we can guard against
    // re-entrancy when we see more cursor movement events:
    this.startingAutoComplete = true;
    editor.execCommand("startAutocomplete");
    this.startingAutoComplete = false;
  }
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
    this.cursorTooltip_.tooltipster(this.tooltipConfig);
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

/**
 * @param editor - ace editor instance
 * @private
 */
DropletAutocompleteParameterTooltipManager.installAceCompleterHooks_ = function (editor) {
  if (editor.completer.showPopup !== DropletAutocompleteParameterTooltipManager.showPopup) {
    DropletAutocompleteParameterTooltipManager.originalShowPopup = editor.completer.showPopup;
    editor.completer.showPopup = DropletAutocompleteParameterTooltipManager.showPopup;
  }
  if (editor.completer.gatherCompletions !== DropletAutocompleteParameterTooltipManager.gatherCompletions) {
    DropletAutocompleteParameterTooltipManager.originalGatherCompletions = editor.completer.gatherCompletions;
    editor.completer.gatherCompletions = DropletAutocompleteParameterTooltipManager.gatherCompletions;
  }
};

DropletAutocompleteParameterTooltipManager.gatherCompletions = function (editor, callback) {
  // Override normal ace AutoComplete behavior by using only overrideCompleter
  // instead of the normal set of completers when overrideCompleter is set
  if (this.overrideCompleter) {
    var allCompleters = editor.completers;
    editor.completers = [ this.overrideCompleter ];
    DropletAutocompleteParameterTooltipManager.originalGatherCompletions.call(this, editor, callback);
    editor.completers = allCompleters;
  } else {
    DropletAutocompleteParameterTooltipManager.originalGatherCompletions.call(this, editor, callback);
  }
};

DropletAutocompleteParameterTooltipManager.showPopup = function (editor) {
  // Override normal ace AutoComplete behavior by guaranteeing that overrideCompleter is reset
  // after each call to showPopup()
  DropletAutocompleteParameterTooltipManager.originalShowPopup.call(this, editor);
  this.overrideCompleter = null;
};

module.exports = DropletAutocompleteParameterTooltipManager;
