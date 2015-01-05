/**
 * @fileoverview Object representing a separate function editor. This function
 * editor provides a separate modal workspace where a user can modify a given
 * function definition.
 */
'use strict';

goog.provide('Blockly.FunctionEditor');

goog.require('Blockly.BlockSpace');
goog.require('Blockly.HorizontalFlyout');
goog.require('goog.style');
goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.structs.LinkedMap');

/**
 * Class for a modal function editor.
 * @constructor
 */
Blockly.FunctionEditor = function() {
  /**
   * Whether this editor has been initialized
   * @type {boolean}
   * @private
   */
  this.created_ = false;

  /**
   * Current blocks in the editor's parameter toolbox
   * @type {goog.structs.LinkedMap.<string,Blockly.Block>}
   * @protected
   */
  this.orderedParamIDsToBlocks_ = new goog.structs.LinkedMap();

  /**
   * Current block being edited
   * @type {?Blockly.Block}
   */
  this.functionDefinitionBlock = null;

  /**
   * Enclosing container div for the function editor, shown and hidden as
   * editor is toggled.
   * Note: visibility is used as indicator of modal open state.
   * @type {?Element}
   * @private
   */
  this.container_ = null;

  this.closeButton_ = null;
  this.contractDiv_ = null;
  this.flyout_ = null;
  this.frameBase_ = null;
  this.frameInner_ = null;
  this.frameText_ = null;
  this.modalBackground_ = null;
  this.onResizeWrapper_ = null;
};


/**
 * The type of block to instantiate in the function editing area
 * @type {string}
 * @protected
 */
Blockly.FunctionEditor.prototype.definitionBlockType = 'procedures_defnoreturn';

/**
 * The type of block to instantiate for parameter definition
 * @type {string}
 */
Blockly.FunctionEditor.prototype.parameterBlockType = 'parameters_get';

Blockly.FunctionEditor.prototype.openAndEditFunction = function(functionName) {
  var targetFunctionDefinitionBlock = Blockly.mainBlockSpace.findFunction(
      functionName);
  if (!targetFunctionDefinitionBlock) {
    throw new Error("Can't find definition block to edit");
  }

  this.show();
  this.setupUIForBlock_(targetFunctionDefinitionBlock);
  this.functionDefinitionBlock = this.moveToModalBlockSpace_(targetFunctionDefinitionBlock);
  this.populateParamToolbox_();

  goog.dom.getElement('functionNameText').value = functionName;
  goog.dom.getElement('functionDescriptionText').value =
      this.functionDefinitionBlock.description_ || '';

  Blockly.fireUiEvent(window, 'function_editor_opened');
};

/**
 * Lets subclass tweak the UI based on the given target block
 * @param targetFunctionDefinitionBlock
 * @protected
 */
Blockly.FunctionEditor.prototype.setupUIForBlock_ = function(targetFunctionDefinitionBlock) {
};

Blockly.FunctionEditor.prototype.populateParamToolbox_ = function() {
  this.orderedParamIDsToBlocks_.clear();
  this.addParamsFromProcedure_();
  this.resetParamIDs_();
  this.refreshParamsEverywhere();
};

/** @protected */
Blockly.FunctionEditor.prototype.addParamsFromProcedure_ = function() {
  var procedureInfo = this.functionDefinitionBlock.getProcedureInfo();
  for (var i = 0; i < procedureInfo.parameterNames.length; i++) {
    this.addParameter(procedureInfo.parameterNames[i]);
  }
};

/**
 * @param {?Function} opt_blockCreationCallback function to call on newly created block
 *  just before opening the editor
 */
Blockly.FunctionEditor.prototype.openWithNewFunction = function(opt_blockCreationCallback) {
  this.ensureCreated_();

  var tempFunctionDefinitionBlock = Blockly.Xml.domToBlock_(Blockly.mainBlockSpace,
    Blockly.createSvgElement('block', {type: this.definitionBlockType}));
  tempFunctionDefinitionBlock.userCreated = true;
  if (opt_blockCreationCallback) {
    opt_blockCreationCallback(tempFunctionDefinitionBlock);
  }
  this.openAndEditFunction(tempFunctionDefinitionBlock.getTitleValue('NAME'));
};

Blockly.FunctionEditor.prototype.bindToolboxHandlers_ = function() {
  var paramAddTextElement = goog.dom.getElement('paramAddText');
  var paramAddButton = goog.dom.getElement('paramAddButton');
  if (paramAddTextElement && paramAddButton) {
    Blockly.bindEvent_(paramAddButton, 'mousedown', this,
        goog.bind(this.addParamFromInputField_, this, paramAddTextElement));
    Blockly.bindEvent_(paramAddTextElement, 'keydown', this, function(e) {
      if (e.keyCode === goog.events.KeyCodes.ENTER) {
        this.addParamFromInputField_(paramAddTextElement);
      }
    });
  }
};

Blockly.FunctionEditor.prototype.addParamFromInputField_ = function(
    parameterTextElement) {
  var newParamName = parameterTextElement.value;
  parameterTextElement.value = '';
  this.addParameter(newParamName);
  this.refreshParamsEverywhere();
};

Blockly.FunctionEditor.prototype.addParameter = function(newParameterName) {
  this.orderedParamIDsToBlocks_.set(goog.events.getUniqueId('parameter'), this.newParameterBlock(newParameterName));
};

Blockly.FunctionEditor.prototype.newParameterBlock = function(newParameterName) {
  var param = Blockly.createSvgElement('block', {type: this.parameterBlockType});
  var v = Blockly.createSvgElement('title', {name: 'VAR'}, param);
  v.textContent = newParameterName;
  return param;
};

Blockly.FunctionEditor.prototype.renameParameter = function(oldName, newName) {
  this.orderedParamIDsToBlocks_.forEach(function(block, paramID, linkedMap) {
    if (block.firstElementChild &&
        block.firstElementChild.textContent === oldName) {
      block.firstElementChild.textContent = newName;
    }
  });
};

/**
 * Remove procedure parameter from the toolbox and everywhere it is used
 * @param {String} nameToRemove
 */
Blockly.FunctionEditor.prototype.removeParameter = function(nameToRemove) {
  var keysToDelete = [];
  this.orderedParamIDsToBlocks_.forEach(function(block, paramID) {
    if (block.firstElementChild && block.firstElementChild.textContent === nameToRemove) {
      keysToDelete.push(paramID);
    }
  });
  keysToDelete.forEach(function(key) { this.orderedParamIDsToBlocks_.remove(key); }, this);
  this.refreshParamsEverywhere();
};

Blockly.FunctionEditor.prototype.refreshParamsEverywhere = function() {
  this.refreshParamsInFlyout_();
  this.refreshParamsOnFunction_();
};

Blockly.FunctionEditor.prototype.refreshParamsInFlyout_ = function() {
  this.flyout_.hide();
  this.flyout_.show(this.orderedParamIDsToBlocks_.getValues());
};

Blockly.FunctionEditor.prototype.resetParamIDs_ = function() {
  var paramArrays = this.paramsAsParallelArrays_();
  paramArrays.paramIDs = null; // No IDs causes next update to initialize IDs
  this.functionDefinitionBlock.updateParamsFromArrays(
    paramArrays.paramNames, paramArrays.paramIDs, paramArrays.paramTypes);
};

Blockly.FunctionEditor.prototype.refreshParamsOnFunction_ = function() {
  var paramArrays = this.paramsAsParallelArrays_();
  this.functionDefinitionBlock.updateParamsFromArrays(
    paramArrays.paramNames, paramArrays.paramIDs, paramArrays.paramTypes);
};

/**
 * @returns {{paramNames: Array, paramIDs: Array, paramTypes: Array}}
 *    parallel arrays of parameter names, IDs, types
 */
Blockly.FunctionEditor.prototype.paramsAsParallelArrays_ = function() {
  var paramNames = [];
  var paramIDs = [];
  var paramTypes = [];

  this.orderedParamIDsToBlocks_.forEach(function(blockXML, paramID) {
    // <mutation><name></name><outputtype></outputtype></mutation>
    paramNames.push(blockXML.firstElementChild.textContent);
    paramIDs.push(paramID);
    if (blockXML.childNodes.length > 1) {
      paramTypes.push(blockXML.childNodes[1].textContent);
    }
  }, this);
  return {paramNames: paramNames, paramIDs: paramIDs, paramTypes: paramTypes};
};

Blockly.FunctionEditor.prototype.show = function() {
  this.ensureCreated_();
  goog.style.showElement(this.container_, true);
  goog.style.showElement(this.modalBackground_, true);
  Blockly.focusedBlockSpace = Blockly.modalBlockSpace;
  if (Blockly.selected) {
    Blockly.selected.unselect();
  }
};

/**
 * Is the function editor currently open?
 */
Blockly.FunctionEditor.prototype.isOpen = function() {
  return this.isCreated() && goog.style.isElementShown(this.container_);
};

Blockly.FunctionEditor.prototype.isCreated = function() {
  return !!this.container_;
};

Blockly.FunctionEditor.prototype.ensureCreated_ = function() {
  if (!this.isCreated()) {
    this.create_();
  }
};

Blockly.FunctionEditor.prototype.hideIfOpen = function() {
  if (!this.isOpen()) {
    return;
  }
  this.hideAndRestoreBlocks_();
  Blockly.modalBlockSpace.clear();
};

/**
 * Hides the function editor, moving existing blocks to the
 * main BlockSpace
 * @protected
 */
Blockly.FunctionEditor.prototype.hideAndRestoreBlocks_ = function() {
  goog.style.showElement(this.container_, false);
  goog.style.showElement(this.modalBackground_, false);

  this.moveToMainBlockSpace_(this.functionDefinitionBlock);
  this.functionDefinitionBlock = null;

  goog.dom.getElement('functionNameText').value = '';
  goog.dom.getElement('functionDescriptionText').value = '';
  if (goog.dom.getElement('paramAddText')) {
    goog.dom.getElement('paramAddText').value = '';
  }

  Blockly.focusedBlockSpace = Blockly.mainBlockSpace;
  Blockly.fireUiEvent(window, 'function_editor_closed');
};

/**
 * Moves a block in the modal BlockSpace to the main BlockSpace.
 * Note: destroys the existing Block object in the process
 * @param blockToMove
 * @private
 */
Blockly.FunctionEditor.prototype.moveToMainBlockSpace_ = function(blockToMove) {
  blockToMove.setUserVisible(false);
  blockToMove.setMovable(true);
  var dom = Blockly.Xml.blockToDom_(blockToMove);
  blockToMove.dispose(false, false, true);
  Blockly.Xml.domToBlock_(Blockly.mainBlockSpace, dom);
};

/**
 * Moves an existing block to this modal BlockSpace.
 * Note: destroys the existing Block object in the process
 * @param {Blockly.Block} blockToMove
 * @returns {Blockly.Block} copy of block in modal BlockSpace
 */
Blockly.FunctionEditor.prototype.moveToModalBlockSpace_ = function(blockToMove) {
  blockToMove.setUserVisible(true);
  var dom = Blockly.Xml.blockToDom_(blockToMove);
  blockToMove.dispose(false, false, true);
  var newCopyOfBlock = Blockly.Xml.domToBlock_(Blockly.modalBlockSpace, dom);
  newCopyOfBlock.moveTo(Blockly.RTL
    ? Blockly.modalBlockSpace.getMetrics().viewWidth - FRAME_MARGIN_SIDE
    : FRAME_MARGIN_SIDE, FRAME_MARGIN_TOP);
  newCopyOfBlock.setMovable(false);
  return newCopyOfBlock;
};

Blockly.FunctionEditor.prototype.create_ = function() {
  if (this.created_) {
    throw "Attempting to re-create already created Function Editor";
  }

  this.container_ = document.createElement('div');
  this.container_.setAttribute('id', 'modalContainer');
  goog.dom.getElement('blockly').appendChild(this.container_);
  Blockly.modalBlockSpaceEditor =
      new Blockly.BlockSpaceEditor(this.container_,
        goog.bind(this.calculateMetrics_, this));
  Blockly.modalBlockSpace = Blockly.modalBlockSpaceEditor.blockSpace;
  Blockly.modalBlockSpace.customFlyoutMetrics_ = Blockly.mainBlockSpace.getMetrics;

  Blockly.modalBlockSpaceEditor.addChangeListener(
      Blockly.mainBlockSpace.fireChangeEvent);

  // Add modal background and close button
  this.modalBackground_ =
      Blockly.createSvgElement('g', {'class': 'modalBackground'});
  Blockly.mainBlockSpaceEditor.appendSVGChild(this.modalBackground_);

  this.addCloseButton_();

  // Set up contract definition HTML section
  this.createContractDom_();

  // The function editor block space passes clicks through via
  // pointer-events:none, so register the unselect handler on lower elements
  Blockly.bindEvent_(goog.dom.getElement('modalContainer'), 'mousedown', null,
      function(e) {
    // Only handle clicks on modalContainer, not a descendant
    if (e.target === e.currentTarget) {
      Blockly.modalBlockSpaceEditor.hideChaff();
      if (Blockly.selected) {
        Blockly.selected.unselect();
      }
    }
  });

  Blockly.bindEvent_(goog.dom.getElement('modalEditorClose'), 'mousedown', this,
      this.hideIfOpen);
  Blockly.bindEvent_(goog.dom.getElement('functionNameText'), 'input', this,
      functionNameChange);
  // IE9 doesn't fire oninput when delete key is pressed, bind keydown also
  Blockly.bindEvent_(goog.dom.getElement('functionNameText'), 'keydown', this,
      functionNameChange);
  function functionNameChange(e) {
    this.functionDefinitionBlock.setTitleValue(e.target.value, 'NAME');
  }

  Blockly.bindEvent_(this.contractDiv_, 'mousedown', null, function() {
    if (Blockly.selected) {
      Blockly.selected.unselect();
    }
  });

  Blockly.bindEvent_(goog.dom.getElement('functionDescriptionText'), 'input',
      this, functionDescriptionChange);
  // IE9 doesn't fire oninput when delete key is pressed, bind keydown also
  Blockly.bindEvent_(goog.dom.getElement('functionDescriptionText'), 'keydown',
      this, functionDescriptionChange);
  function functionDescriptionChange(e) {
    this.functionDefinitionBlock.description_ = e.target.value;
  }

  this.setupParametersToolbox_();
  this.addEditorFrame_();
  this.position_();

  this.onResizeWrapper_ = Blockly.bindEvent_(window,
      goog.events.EventType.RESIZE, this, this.position_);

  Blockly.modalBlockSpaceEditor.svgResize();
};

/**
 * @returns {Function} function which returns the function editor's
 *  blockSpace metrics
 * @private
 */
Blockly.FunctionEditor.prototype.calculateMetrics_ = function() {
  // Define a special getMetrics function for our block space editor
  var metrics = Blockly.mainBlockSpace.getMetrics();
  var contractDivHeight = this.contractDiv_
    ? this.contractDiv_.getBoundingClientRect().height
    : 0;
  var topOffset = FRAME_MARGIN_TOP + Blockly.Bubble.BORDER_WIDTH +
    FRAME_HEADER_HEIGHT;
  metrics.absoluteLeft +=
    FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH + 1;
  metrics.absoluteTop += topOffset + contractDivHeight;
  metrics.viewWidth -=
    (FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH) * 2;
  metrics.viewHeight -=
    FRAME_MARGIN_TOP + Blockly.Bubble.BORDER_WIDTH + topOffset;
  return metrics;
};

Blockly.FunctionEditor.prototype.layOutBlockSpaceItems_ = function () {
  if (!this.functionDefinitionBlock || !this.isOpen()) {
    return;
  }
  var currentX = Blockly.RTL ?
    Blockly.modalBlockSpace.getMetrics().viewWidth - FRAME_MARGIN_SIDE :
    FRAME_MARGIN_SIDE;
  var currentY = 0;
  currentY += this.flyout_.getHeight();
  this.flyout_.customYOffset = currentY;
  this.flyout_.position_();

  Blockly.modalBlockSpace.trashcan.setYOffset(currentY);
  Blockly.modalBlockSpace.trashcan.position_();

  currentY += FRAME_MARGIN_TOP;
  this.functionDefinitionBlock.moveTo(currentX, currentY);
};

/**
 * Add close button to the top right of the modal dialog
 * @private
 */
Blockly.FunctionEditor.prototype.addCloseButton_ = function () {
  this.closeButton_ = Blockly.createSvgElement('g', {
    'id': 'modalEditorClose',
    'filter': 'url(#blocklyTrashcanShadowFilter)'
  });
  var padding = 7;
  var r = Blockly.createSvgElement('rect', {
    'rx': 12,
    'ry': 12,
    'fill': '#7665a0',
    'stroke': 'white',
    'stroke-width': '2.5'
  }, this.closeButton_);
  var text = Blockly.createSvgElement('text', {
    'x': padding,
    'y': padding,
    'class': 'blocklyText'
  }, this.closeButton_);
  text.textContent = Blockly.Msg.SAVE_AND_CLOSE;
  Blockly.modalBlockSpaceEditor.appendSVGChild(this.closeButton_);
  var bounds = text.getBoundingClientRect();
  r.setAttribute('width', bounds.width + 2 * padding);
  r.setAttribute('height', bounds.height + padding);
  r.setAttribute('y', -bounds.height + padding - 1);
};

Blockly.FunctionEditor.prototype.setupParametersToolbox_ = function () {
  this.flyout_ = new Blockly.HorizontalFlyout(Blockly.modalBlockSpaceEditor);
  var flyoutDom = this.flyout_.createDom();
  Blockly.modalBlockSpace.svgGroup_.insertBefore(flyoutDom,
    Blockly.modalBlockSpace.svgBlockCanvas_);
  this.flyout_.init(Blockly.modalBlockSpace, false);
  this.bindToolboxHandlers_();
};

Blockly.FunctionEditor.prototype.addEditorFrame_ = function () {
  var left = Blockly.hasCategories ?
      goog.dom.getElementByClass('blocklyToolboxDiv').getBoundingClientRect().width :
      goog.dom.getElementByClass('blocklyFlyoutBackground').getBoundingClientRect().width;
  var top = 0;
  this.frameBase_ = Blockly.createSvgElement('rect', {
    x: left + FRAME_MARGIN_SIDE,
    y: top + FRAME_MARGIN_TOP,
    fill: 'hsl(94, 73%, 35%)',
    rx: Blockly.Bubble.BORDER_WIDTH,
    ry: Blockly.Bubble.BORDER_WIDTH
  }, this.modalBackground_);
  this.frameInner_ = Blockly.createSvgElement('rect', {
    x: left + FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH,
    y: top + FRAME_MARGIN_TOP + Blockly.Bubble.BORDER_WIDTH +
      FRAME_HEADER_HEIGHT,
    fill: '#ffffff'
  }, this.modalBackground_);
  this.frameText_ = Blockly.createSvgElement('text', {
    x: left + FRAME_MARGIN_SIDE + 16,
    y: top + FRAME_MARGIN_TOP + 22,
    'class': 'blocklyText',
    style: 'font-size: 12pt'
  }, this.modalBackground_);
  this.frameText_.textContent = Blockly.Msg.FUNCTION_HEADER;
};

Blockly.FunctionEditor.prototype.position_ = function() {
  var metrics = Blockly.modalBlockSpace.getMetrics();
  var width = metrics.viewWidth;
  var height = metrics.viewHeight;
  this.frameBase_.setAttribute('width',
      width + 2 * Blockly.Bubble.BORDER_WIDTH);
  this.frameBase_.setAttribute('height',
      height + 2 * Blockly.Bubble.BORDER_WIDTH + FRAME_HEADER_HEIGHT);
  this.frameInner_.setAttribute('width', width);
  this.frameInner_.setAttribute('height', height);
  if (Blockly.RTL) {
    this.frameBase_.setAttribute('x', FRAME_MARGIN_SIDE);
    this.frameInner_.setAttribute('x',
        FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH + 1);
    this.frameText_.setAttribute('x', width - 2 * FRAME_MARGIN_SIDE);
  }

  // Resize contract div width
  this.contractDiv_.style.width = width + 'px';

  // Move the close button
  this.closeButton_.setAttribute('transform', 'translate(' +
      (Blockly.RTL ? 5 : metrics.absoluteLeft + metrics.viewWidth + 14 -
          this.closeButton_.firstElementChild.getAttribute('width')) +
      ',19)');

  // Move workspace to account for horizontal flyout height
  Blockly.modalBlockSpaceEditor.svgResize();

  this.layOutBlockSpaceItems_();
};

Blockly.FunctionEditor.prototype.createContractDom_ = function() {
  this.contractDiv_ = goog.dom.createDom('div',
      'blocklyToolboxDiv paramToolbox blocklyText');
  if (Blockly.RTL) {
    this.contractDiv_.setAttribute('dir', 'RTL');
  }
  this.contractDiv_.innerHTML =
      '<div>' + Blockly.Msg.FUNCTION_NAME_LABEL + '</div>'
      + '<div><input id="functionNameText" type="text"></div>'
      + '<div>' + Blockly.Msg.FUNCTION_DESCRIPTION_LABEL + '</div>'
      + '<div><textarea id="functionDescriptionText" rows="2"></textarea></div>';
  if (!Blockly.disableParamEditing) {
    this.contractDiv_.innerHTML += '<div>'
      + Blockly.Msg.FUNCTION_PARAMETERS_LABEL + '</div>'
      + '<div><input id="paramAddText" type="text" style="width: 200px;"> '
      + '<button id="paramAddButton" class="btn">' + Blockly.Msg.ADD_PARAMETER
      + '</button>';
  }
  var metrics = Blockly.modalBlockSpace.getMetrics();
  var left = metrics.absoluteLeft;
  this.contractDiv_.style.left = left + 'px';
  this.contractDiv_.style.top = metrics.absoluteTop + 'px';
  this.contractDiv_.style.width = metrics.viewWidth + 'px';
  this.contractDiv_.style.display = 'block';
  this.container_.insertBefore(this.contractDiv_, this.container_.firstChild);
};
