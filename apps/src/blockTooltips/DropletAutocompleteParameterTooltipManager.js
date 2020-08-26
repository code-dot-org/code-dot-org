/* global ace */
import $ from 'jquery';
var DropletFunctionTooltipMarkup = require('./DropletParameterTooltip.html.ejs');
var tooltipUtils = require('./tooltipUtils.js');
var dom = require('../dom');
import {getAllAvailableDropletBlocks} from '../dropletUtils';

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
var DropletAutocompleteParameterTooltipManager = function(
  dropletTooltipManager
) {
  this.dropletTooltipManager = dropletTooltipManager;
  this.showExamplesLink = dropletTooltipManager.dropletConfig.showExamplesLink;
  this.showParamDropdowns =
    dropletTooltipManager.dropletConfig.showParamDropdowns;
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
DropletAutocompleteParameterTooltipManager.prototype.installTooltipsForEditor_ = function(
  dropletEditor
) {
  var aceEditor = dropletEditor.aceEditor;

  var cursorMovementHandler = this.onCursorMovement_.bind(this, aceEditor);
  aceEditor.commands.on('afterExec', cursorMovementHandler);
  aceEditor.on(
    'mousedown',
    function(e) {
      this.hideTooltip_();
    }.bind(this)
  );
};

/**
 * @param editor - ace editor instance
 * @param changeEvent - event from aceEditor.session.selection.on('changeCursor')
 * @private
 */
DropletAutocompleteParameterTooltipManager.prototype.onCursorMovement_ = function(
  editor,
  changeEvent
) {
  this.hideTooltip_();

  if (!editor.selection.isEmpty()) {
    return;
  }

  var cursorPosition = editor.selection.getCursor();

  var currentParameterInfo = tooltipUtils.findFunctionAndParamNumber(
    editor,
    cursorPosition
  );
  if (!currentParameterInfo) {
    return;
  }

  if (this.blockDropdownsAndTooltips || this.startingAutoComplete) {
    // Guard against re-entrancy that occurs inside the showParamDropdownIfNeeded_() and the click
    // handlers below
    return;
  }

  // We check the command name to make sure that we aren't opening the param dropdown when users are
  // navigating through the code with arrow keys.
  // Otherwise, the cursor could get stuck in the dropdown.
  if (
    editor.completer &&
    this.showParamDropdowns &&
    !['golineup', 'golinedown', 'gotoleft', 'gotoright'].includes(
      changeEvent.command.name
    )
  ) {
    this.showParamDropdownIfNeeded_(editor, currentParameterInfo);
  }

  this.updateParameterTooltip_(editor, currentParameterInfo);
};

/**
 * @param editor - ace editor instance
 * @param paramInfo - parameter info already retrieved based on the cursor position
 * @private
 */
DropletAutocompleteParameterTooltipManager.prototype.showParamDropdownIfNeeded_ = function(
  editor,
  paramInfo
) {
  // Check the dropletConfig to see if we can find dropdown info for this parameter
  var dropdownList;
  getAllAvailableDropletBlocks(
    this.dropletTooltipManager.dropletConfig,
    this.dropletTooltipManager.codeFunctions,
    this.autocompletePaletteApisOnly
  ).forEach(function(block) {
    if (
      !block.dropdown ||
      (block.func !== paramInfo.funcName &&
        block.modeOptionName !== paramInfo.funcName &&
        block.func !== paramInfo.fullFuncName)
    ) {
      // Not the right block or no dropdown specified
      return;
    }
    if (block.noAutocomplete) {
      // Block doesn't want autocomplete, so ignore
      return;
    }
    if (
      this.dropletTooltipManager.autocompletePaletteApisOnly &&
      this.dropletTooltipManager.codeFunctions &&
      typeof this.dropletTooltipManager.codeFunctions[block.func] ===
        'undefined'
    ) {
      // In autocompletePaletteApisOnly mode and block is not in the palette:
      return;
    }
    if (typeof block.dropdown[paramInfo.currentParameterIndex] === 'function') {
      dropdownList = block.dropdown[paramInfo.currentParameterIndex](editor);
    } else {
      dropdownList = block.dropdown[paramInfo.currentParameterIndex];
    }
  }, this);

  if (dropdownList) {
    // The cursor is positioned where a parameter with a dropdown should appear,
    // so let's pop up a special dropdown autocomplete

    if (editor.completer.activated) {
      if (!editor.completer.lastGatheredWithOverride) {
        // autocomplete was active, but not with an override completer, so we must
        // have entered this autocomplete parameter state while still showing a
        // different type of autocomplete dropdown (e.g. a function). Let's
        // dismiss the function dropdown so we can present the parameter one...
        editor.completer.detach();
      } else {
        // A completer with an overrideCompleter is already active, which likely
        // means that the autocomplete parameter dropdown for this parameter is
        // already present - no need to show it again...
        return;
      }
    }

    // First, install our hooks to modify the normal ace AutoComplete (these are
    // safe to leave in place, and we can call this multiple times):
    this.installAceCompleterHooks_(editor);

    // Create a new ace completer based on the dropdown info and mark it as the
    // "overrideCompleter" which will stay in place for the next popup from
    // autocomplete only:
    var dropdownCompletions = [];
    dropdownList.forEach(function(listValue) {
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
    editor.execCommand('startAutocomplete');
    this.startingAutoComplete = false;
  }
};

DropletAutocompleteParameterTooltipManager.prototype.updateParameterTooltip_ = function(
  aceEditor,
  paramInfo
) {
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
  if (
    hasTooltipParams &&
    paramInfo.currentParameterIndex >= tooltipInfo.parameterInfos.length
  ) {
    return;
  }

  const cursorTooltip = this.createOrUpdateCursorTooltip_();

  cursorTooltip.tooltipster(
    'content',
    this.getTooltipHTML(tooltipInfo, paramInfo.currentParameterIndex)
  );
  cursorTooltip.tooltipster('show');

  if (this.showExamplesLink) {
    var seeExamplesLink = $(cursorTooltip.tooltipster('elementTooltip')).find(
      '.tooltip-example-link > a'
    )[0];
    dom.addClickTouchEvent(
      seeExamplesLink,
      function(event) {
        this.dropletTooltipManager.showDocFor(docFunc);
        event.stopPropagation();
      }.bind(this)
    );
  }

  if (!hasTooltipParams) {
    return;
  }

  var chooseAsset =
    tooltipInfo.parameterInfos[paramInfo.currentParameterIndex].assetTooltip;
  if (chooseAsset) {
    var chooseAssetLink = $(cursorTooltip.tooltipster('elementTooltip')).find(
      '.tooltip-choose-link > a'
    )[0];
    dom.addClickTouchEvent(
      chooseAssetLink,
      function(event) {
        this.hideTooltip_();
        chooseAsset(function(filename) {
          aceEditor.onTextInput('"' + filename + '"');
        });
        event.stopPropagation();
      }.bind(this)
    );
  }
};

DropletAutocompleteParameterTooltipManager.prototype.hideTooltip_ = function() {
  if (this.cursorTooltip_) {
    this.cursorTooltip_.tooltipster('hide');
  }
};

const SAFE_VERTICAL_DISTANCE_FOR_TOOLTIP = 150;
const LEFT_OFFSET_EXTRA_MARGIN = 100;
const ACE_AUTOCOMPLETE_WIDTH = 280;

DropletAutocompleteParameterTooltipManager.prototype.getDesiredTooltipPosition_ = function() {
  const aceRect = $('.ace_editor')[0].getBoundingClientRect();
  const cursorRect = this.cursorTooltip_[0].getBoundingClientRect();
  const showOnLeft =
    this.showParamDropdowns &&
    (cursorRect.top - aceRect.top < SAFE_VERTICAL_DISTANCE_FOR_TOOLTIP ||
      aceRect.bottom - cursorRect.bottom < SAFE_VERTICAL_DISTANCE_FOR_TOOLTIP);
  let offsetX = 0;
  let {position} = this.tooltipConfig;
  if (showOnLeft) {
    position = 'left';
    // Establish an offsetX to avoid having the tooltip overlap with the 280px wide ace dropdown,
    // which will be right-aligned against the right edge of the window when the cursor is near
    // the right edge.

    // We use an additional LEFT_OFFSET_EXTRA_MARGIN because the cursor may move to the right
    // between the time we measure it here and when the function name autocompletes (which causes
    // the cursor to shift futher to the right).
    offsetX = Math.max(
      0,
      cursorRect.left -
        (window.innerWidth - LEFT_OFFSET_EXTRA_MARGIN - ACE_AUTOCOMPLETE_WIDTH)
    );
  }
  return {position, offsetX};
};

DropletAutocompleteParameterTooltipManager.prototype.createOrUpdateCursorTooltip_ = function() {
  if (!this.cursorTooltip_) {
    this.cursorTooltip_ = $('.droplet-ace .ace_cursor');
  }
  const {position, offsetX} = this.getDesiredTooltipPosition_();
  let curPosition, curOffsetX;
  try {
    curPosition = this.cursorTooltip_.tooltipster('option', 'position');
    curOffsetX = this.cursorTooltip_.tooltipster('option', 'offsetX');
  } catch (e) {
    // Ignore errors if we haven't created a tooltip yet
  }
  if (position !== curPosition || offsetX !== curOffsetX) {
    // This is either a new tooltip or one of the properties has changed, so we need to recreate it:
    try {
      this.cursorTooltip_.tooltipster('destroy');
    } catch (e) {
      // Ignore errors if we haven't created a tooltip yet
    }
    this.cursorTooltip_.tooltipster({
      ...this.tooltipConfig,
      position,
      offsetX
    });
  }
  return this.cursorTooltip_;
};

/**
 * @returns {String} HTML for tooltip
 */
DropletAutocompleteParameterTooltipManager.prototype.getTooltipHTML = function(
  tooltipInfo,
  currentParameterIndex
) {
  return DropletFunctionTooltipMarkup({
    funcName: tooltipInfo.functionName,
    functionName: tooltipInfo.functionName,
    isProperty: tooltipInfo.isProperty,
    tipPrefix: tooltipInfo.tipPrefix,
    functionShortDescription: tooltipInfo.description,
    parameters: tooltipInfo.parameterInfos,
    signatureOverride: tooltipInfo.signatureOverride,
    showExamplesLink: this.showExamplesLink,
    currentParameterIndex: currentParameterIndex
  });
};

/**
 * @param editor - ace editor instance
 * @private
 */
DropletAutocompleteParameterTooltipManager.prototype.installAceCompleterHooks_ = function(
  editor
) {
  if (
    editor.completer.showPopup !==
    DropletAutocompleteParameterTooltipManager.showPopup
  ) {
    DropletAutocompleteParameterTooltipManager.originalShowPopup =
      editor.completer.showPopup;
    editor.completer.showPopup =
      DropletAutocompleteParameterTooltipManager.showPopup;
  }
  if (
    editor.completer.gatherCompletions !==
    DropletAutocompleteParameterTooltipManager.gatherCompletions
  ) {
    DropletAutocompleteParameterTooltipManager.originalGatherCompletions =
      editor.completer.gatherCompletions;
    editor.completer.gatherCompletions =
      DropletAutocompleteParameterTooltipManager.gatherCompletions;
  }
  if (!editor.completer.insertMatchOverride) {
    editor.completer.insertMatchOverride = DropletAutocompleteParameterTooltipManager.insertMatch.bind(
      editor.completer,
      this
    );
  }
  if (editor.completer.insertMatch !== editor.completer.insertMatchOverride) {
    DropletAutocompleteParameterTooltipManager.originalInsertMatch =
      editor.completer.insertMatch;
    editor.completer.insertMatch = editor.completer.insertMatchOverride;
  }
};

/**
 * @param this completer instance
 * @param editor ace editor
 * @param callback we pass this through
 */
DropletAutocompleteParameterTooltipManager.gatherCompletions = function(
  editor,
  callback
) {
  // Override normal ace AutoComplete behavior by using only overrideCompleter
  // instead of the normal set of completers when overrideCompleter is set
  if (this.overrideCompleter) {
    var allCompleters = editor.completers;
    editor.completers = [this.overrideCompleter];

    // Ensure that autoInsert is off so we don't insert immediately when there is only one option:
    editor.completer.autoInsert = false;
    // Mark that this set of completions were gathered with our overrideCompleter:
    editor.completer.lastGatheredWithOverride = true;

    DropletAutocompleteParameterTooltipManager.originalGatherCompletions.call(
      this,
      editor,
      callback
    );
    editor.completers = allCompleters;
  } else {
    // Mark that this set of completions were not gathered with our overrideCompleter:
    editor.completer.lastGatheredWithOverride = false;
    DropletAutocompleteParameterTooltipManager.originalGatherCompletions.call(
      this,
      editor,
      callback
    );
  }
};

/**
 * @param this completer instance
 * @param editor ace editor
 */
DropletAutocompleteParameterTooltipManager.showPopup = function(editor) {
  // Override normal ace AutoComplete behavior by guaranteeing that overrideCompleter is reset
  // after each call to showPopup()
  DropletAutocompleteParameterTooltipManager.originalShowPopup.call(
    this,
    editor
  );
  this.overrideCompleter = null;
};

/**
 * @param this completer instance
 * @param self DropletAutocompleteParameterTooltipManager instance
 * @param data info passed to ace's insertMatch
 */
DropletAutocompleteParameterTooltipManager.insertMatch = function(self, data) {
  // Modify normal ace AutoComplete behavior by calling our special 'click' handler when supplied
  // and passing it the default implementation of insertMatch() to be called within
  if (!data) {
    data = this.popup.getData(this.popup.getRow());
  }
  if (!data) {
    return false;
  }

  const insertMatch = (data, overrideCompletions) => {
    const origCompletions = this.editor.completer.completions;
    if (overrideCompletions) {
      // Temporary overwrite the completions (since the insertMatch functions
      // expect them to be on the editor's completer)
      this.editor.completer.completions = overrideCompletions;
    }
    if (this.editor.completer.lastGatheredWithOverride) {
      // Parameter autocomplete:
      DropletAutocompleteParameterTooltipManager.customInsertMatch(
        data,
        this.editor
      );
    } else {
      // Other, unrelated autocomplete:
      DropletAutocompleteParameterTooltipManager.originalInsertMatch.call(
        this,
        data
      );
    }
    // Put the editor's completer's completions back the way we found them:
    if (overrideCompletions) {
      this.editor.completer.completions = origCompletions;
    }
  };

  if (data.click) {
    // Store completions since they will have be removed when we call detach()
    const completions = this.editor.completer.completions;

    // Execute detach() method here to ensure that the popup goes
    // away before we call the click() method
    this.detach();

    // And hide our cursor tooltip as well:
    self.hideTooltip_();

    // Note: stop dropdowns and tooltips until the callback is complete...
    self.blockDropdownsAndTooltips = true;

    const lang = ace.require('./lib/lang');

    // Use delayedCall so the popup and tooltip disappear in the case where the
    // Enter key was pressed before we choose this autocomplete item

    const clickFunc = lang.delayedCall(() => {
      // We create a callback function which the click function will call, passing a
      // string which will be inserted.
      data.click(data => {
        insertMatch(data, completions);
        self.blockDropdownsAndTooltips = false;
      });
    });

    clickFunc.schedule();
  } else {
    insertMatch(data);
  }
};

/**
 * @param {string} line text containing code
 * @param {number} pos position within line to start searching
 * @param {string} character quote character: (e.g. ' or ")
 *
 * @returns {string} remainder of quoted text (starting from pos, including quote character)
 */
DropletAutocompleteParameterTooltipManager.retrieveToEndOfQuotedText = function(
  line,
  pos,
  character
) {
  const remainingLine = line.substring(pos);
  if (remainingLine) {
    const endQuotePos = remainingLine.indexOf(character);
    if (endQuotePos === -1) {
      return remainingLine;
    } else {
      return remainingLine.substring(0, endQuotePos + 1);
    }
  } else {
    return remainingLine;
  }
};

/**
 * @param {string} value new value to insert into editor
 * @param {ace editor} editor ace editor instance
 */
DropletAutocompleteParameterTooltipManager.customInsertMatch = function(
  data,
  editor
) {
  const acUtil = ace.require('ace/autocomplete/util');
  const {filterText} = editor.completer.completions;

  // Remove the filterText that was already typed (ace's built-in
  // insertMatch would normally do this automatically) plus the rest of
  // the identifier OR quotes text after the filterText...
  if (filterText) {
    const ranges = editor.selection.getAllRanges();
    for (let i = 0, range; !!(range = ranges[i]); i++) {
      range.start.column -= editor.completer.completions.filterText.length;
      const line = editor.session.getLine(range.end.row);
      const firstFilterChar = filterText[0];
      if (firstFilterChar === '"' || firstFilterChar === "'") {
        const lengthOfRestOfQuotedText = this.retrieveToEndOfQuotedText(
          line,
          range.end.column,
          firstFilterChar
        ).length;
        range.end.column += lengthOfRestOfQuotedText;
      } else {
        const lengthOfRestOfIdentifier = acUtil.retrieveFollowingIdentifier(
          line,
          range.end.column
        ).length;
        range.end.column += lengthOfRestOfIdentifier;
      }
      editor.session.remove(range);
    }
  }
  editor.execCommand('insertstring', data.value || data);
};

/**
 * @param {boolean} enabled if tooltips should be enabled
 */
DropletAutocompleteParameterTooltipManager.prototype.setTooltipsEnabled = function(
  enabled
) {
  this.tooltipConfig.tooltipsEnabled = !!enabled;
};

module.exports = DropletAutocompleteParameterTooltipManager;
