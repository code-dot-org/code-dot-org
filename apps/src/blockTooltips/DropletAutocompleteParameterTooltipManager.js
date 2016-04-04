/* global ace */
var DropletFunctionTooltipMarkup = require('./DropletParameterTooltip.html.ejs');
var tooltipUtils = require('./tooltipUtils.js');
var dom = require('../dom');
var dropletUtils = require('../dropletUtils');

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
  this.showExamplesLink = dropletTooltipManager.dropletConfig.showExamplesLink;
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
    positionTracker: true,
    tooltipsEnabled: true
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

  if (this.blockDropdownsAndTooltips || this.startingAutoComplete) {
    // Guard against re-entrancy that occurs inside the showParamDropdownIfNeeded_() and the click
    // handlers below
    return;
  }

  if (editor.completer && this.showParamDropdowns) {
    this.showParamDropdownIfNeeded_(editor, currentParameterInfo);
  }

  this.updateParameterTooltip_(editor, currentParameterInfo);
};

/**
 * @param editor - ace editor instance
 * @param paramInfo - parameter info already retrieved based on the cursor position
 * @private
 */
DropletAutocompleteParameterTooltipManager.prototype.showParamDropdownIfNeeded_ = function (editor, paramInfo) {
  // Check the dropletConfig to see if we can find dropdown info for this parameter
  var dropdownList;
  dropletUtils.getAllAvailableDropletBlocks(
    this.dropletTooltipManager.dropletConfig,
    this.dropletTooltipManager.codeFunctions,
    this.autocompletePaletteApisOnly).forEach(function (block) {
      if (!block.dropdown ||
          (block.func !== paramInfo.funcName && block.func !== paramInfo.fullFuncName)) {
        // Not the right block or no dropdown specified
        return;
      }
      if (block.noAutocomplete) {
        // Block doesn't want autocomplete, so ignore
        return;
      }
      if (this.dropletTooltipManager.autocompletePaletteApisOnly &&
          this.dropletTooltipManager.codeFunctions &&
          typeof this.dropletTooltipManager.codeFunctions[block.func] === 'undefined') {
        // In autocompletePaletteApisOnly mode and block is not in the palette:
        return;
      }
      if (typeof block.dropdown[paramInfo.currentParameterIndex] === 'function') {
        dropdownList = block.dropdown[paramInfo.currentParameterIndex](editor);
      } else {
        dropdownList = block.dropdown[paramInfo.currentParameterIndex];
      }
    },
    this);

  if (dropdownList && !editor.completer.activated) {
    // The cursor is positioned where a parameter with a dropdown should appear
    // and autocomplete is not already active, so let's pop up a special dropdown
    // autocomplete

    // First, install our hooks to modify the normal ace AutoComplete (these are
    // safe to leave in place, and we can call this multiple times):
    this.installAceCompleterHooks_(editor);

    // Create a new ace completer based on the dropdown info and mark it as the
    // "overrideCompleter" which will stay in place for the next popup from
    // autocomplete only:
    var dropdownCompletions = [];
    dropdownList.forEach(function (listValue) {
      var valString, valClick;
      if (typeof listValue === 'string') {
        valString = listValue;
      } else {
        // Support the { text: x, display: x } form, but ignore the display field
        valString = listValue.text;
        // Tack on the special click handler if present
        valClick = listValue.click;
      }
      dropdownCompletions.push({
        name: 'dropdown',
        value: valString,
        click: valClick
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

DropletAutocompleteParameterTooltipManager.prototype.updateParameterTooltip_ = function (aceEditor, paramInfo) {
  if (!this.tooltipConfig.tooltipsEnabled) {
    return;
  }

  var docFunc;
  if (this.dropletTooltipManager.getDocFor(paramInfo.funcName)) {
    docFunc = paramInfo.funcName;
  } else if (this.dropletTooltipManager.getDocFor(paramInfo.fullFuncName)) {
    docFunc = paramInfo.fullFuncName;
  } else {
    return;
  }
  var tooltipInfo = this.dropletTooltipManager.getDropletTooltip(docFunc);

  var hasTooltipParams = tooltipInfo.parameterInfos.length > 0;
  if ((hasTooltipParams && paramInfo.currentParameterIndex >= tooltipInfo.parameterInfos.length)) {
    return;
  }

  var cursorTooltip = this.getCursorTooltip_();

  cursorTooltip.tooltipster('content', this.getTooltipHTML(tooltipInfo, paramInfo.currentParameterIndex));
  cursorTooltip.tooltipster('show');

  if (this.showExamplesLink) {
    var seeExamplesLink = $(cursorTooltip.tooltipster('elementTooltip')).find('.tooltip-example-link > a')[0];
    dom.addClickTouchEvent(seeExamplesLink, function (event) {
      this.dropletTooltipManager.showDocFor(docFunc);
      event.stopPropagation();
    }.bind(this));
  }

  if (!hasTooltipParams) {
    return;
  }

  var chooseAsset = tooltipInfo.parameterInfos[paramInfo.currentParameterIndex].assetTooltip;
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
    isProperty: tooltipInfo.isProperty,
    tipPrefix: tooltipInfo.tipPrefix,
    functionShortDescription: tooltipInfo.description,
    parameters: tooltipInfo.parameterInfos,
    signatureOverride: tooltipInfo.signatureOverride,
    showExamplesLink : this.showExamplesLink,
    currentParameterIndex: currentParameterIndex
  });
};

/**
 * @param editor - ace editor instance
 * @private
 */
DropletAutocompleteParameterTooltipManager.prototype.installAceCompleterHooks_ = function (editor) {
  if (editor.completer.showPopup !== DropletAutocompleteParameterTooltipManager.showPopup) {
    DropletAutocompleteParameterTooltipManager.originalShowPopup = editor.completer.showPopup;
    editor.completer.showPopup = DropletAutocompleteParameterTooltipManager.showPopup;
  }
  if (editor.completer.gatherCompletions !== DropletAutocompleteParameterTooltipManager.gatherCompletions) {
    DropletAutocompleteParameterTooltipManager.originalGatherCompletions = editor.completer.gatherCompletions;
    editor.completer.gatherCompletions = DropletAutocompleteParameterTooltipManager.gatherCompletions;
  }
  if (!editor.completer.insertMatchOverride) {
    editor.completer.insertMatchOverride =
      DropletAutocompleteParameterTooltipManager.insertMatch.bind(editor.completer, this);
  }
  if (editor.completer.insertMatch !== editor.completer.insertMatchOverride) {
    DropletAutocompleteParameterTooltipManager.originalInsertMatch = editor.completer.insertMatch;
    editor.completer.insertMatch = editor.completer.insertMatchOverride;
  }
};

/**
 * @param this completer instance
 * @param editor ace editor
 * @param callback we pass this through
 */
DropletAutocompleteParameterTooltipManager.gatherCompletions = function (editor, callback) {
  // Override normal ace AutoComplete behavior by using only overrideCompleter
  // instead of the normal set of completers when overrideCompleter is set
  if (this.overrideCompleter) {
    var allCompleters = editor.completers;
    editor.completers = [this.overrideCompleter];

    // Ensure that autoInsert is off so we don't insert immediately when there is only one option:
    editor.completer.autoInsert = false;

    DropletAutocompleteParameterTooltipManager.originalGatherCompletions.call(this, editor, callback);
    editor.completers = allCompleters;
  } else {
    DropletAutocompleteParameterTooltipManager.originalGatherCompletions.call(this, editor, callback);
  }
};

/**
 * @param this completer instance
 * @param editor ace editor
 */
DropletAutocompleteParameterTooltipManager.showPopup = function (editor) {
  // Override normal ace AutoComplete behavior by guaranteeing that overrideCompleter is reset
  // after each call to showPopup()
  DropletAutocompleteParameterTooltipManager.originalShowPopup.call(this, editor);
  this.overrideCompleter = null;
};

/**
 * @param this completer instance
 * @param self DropletAutocompleteParameterTooltipManager instance
 * @param data info passed to ace's insertMatch
 */
DropletAutocompleteParameterTooltipManager.insertMatch = function (self, data) {
  // Modify normal ace AutoComplete behavior by calling our special 'click' handler when supplied
  // and passing it the default implementation of insertMatch() to be called within
  if (!data) {
    data = this.popup.getData(this.popup.getRow());
  }
  if (!data) {
    return false;
  }

  if (data.click) {
    // Execute detach() method here to ensure that the popup goes
    // away before we call the click() method
    this.detach();

    // And hide our cursor tooltip as well:
    self.getCursorTooltip_().tooltipster('hide');

    // Note: stop dropdowns and tooltips until the callback is complete...
    self.blockDropdownsAndTooltips = true;

    var lang = ace.require("./lib/lang");

    // Use delayedCall so the popup and tooltip disappear in the case where the
    // Enter key was pressed before we choose this autocomplete item
    var clickFunc = lang.delayedCall(function () {
      // We create a callback function which the click function will call, passing a
      // string which will be inserted.
      data.click(function (data) {
        this.editor.execCommand("insertstring", data);
        self.blockDropdownsAndTooltips = false;
      }.bind(this));
    }.bind(this));

    clickFunc.schedule();
  } else {
    DropletAutocompleteParameterTooltipManager.originalInsertMatch.call(this, data);
  }
};


/**
 * @param {boolean} enabled if tooltips should be enabled
 */
DropletAutocompleteParameterTooltipManager.prototype.setTooltipsEnabled = function (enabled) {
  this.tooltipConfig.tooltipsEnabled = !!enabled;
};

module.exports = DropletAutocompleteParameterTooltipManager;
