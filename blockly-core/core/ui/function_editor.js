/**
 * @fileoverview Object representing a separate function editor. This function
 * editor provides a separate modal workspace where a user can modify a given
 * function definition.
 */
'use strict';

goog.provide('Blockly.FunctionEditor');

goog.require('Blockly.BlockSpace');
goog.require('Blockly.BlockSpaceEditor');
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
   * @type {!goog.structs.LinkedMap.<string,SVGElement>}
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
   * @protected
   */
  this.container_ = null;

  this.closeButton_ = null;

  /**
   * @protected {Blockly.SvgTextButton}
   */
  this.deleteButton_ = null;

  this.contractDiv_ = null;

  /**
   * @type {Blockly.HorizontalFlyout}
   * @protected
   */
  this.flyout_ = null;
  this.frameBase_ = null;
  this.frameInner_ = null;
  this.frameText_ = null;
  this.modalBackground_ = null;
  this.onResizeWrapper_ = null;

  /** @type {BlockSpace} */
  this.modalBlockSpace = null;
};

Blockly.FunctionEditor.BLOCK_LAYOUT_LEFT_MARGIN = Blockly.BlockSpaceEditor.BUMP_PADDING_LEFT;
Blockly.FunctionEditor.BLOCK_LAYOUT_TOP_MARGIN = Blockly.BlockSpaceEditor.BUMP_PADDING_TOP;

/**
 * Margin between the delete and close buttons in pixels.
 * @type {number}
 */
Blockly.FunctionEditor.DELETE_BUTTON_MARGIN = 25;

/**
 * Amount of space the "close" button should hang off the right of the
 * window chrome.
 * @type {number}
 */
Blockly.FunctionEditor.CLOSE_BUTTON_OVERHANG = 14;

/** @type {number} */
Blockly.FunctionEditor.RTL_CLOSE_BUTTON_OFFSET = 5;

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

/**
 * @param {String} autoOpenFunction - name of function to auto-open
 */
Blockly.FunctionEditor.prototype.autoOpenFunction = function(autoOpenFunction) {
  this.autoOpenWithLevelConfiguration({
    autoOpenFunction: autoOpenFunction
  });
};

/**
 * Auto-opens the function editor with given configuration parameters
 * @param {Object} configuration
 * @param {string} configuration.autoOpenFunction - function to open
 * @protected
 */
Blockly.FunctionEditor.prototype.autoOpenWithLevelConfiguration = function(configuration) {
  if (configuration.autoOpenFunction) {
    this.openAndEditFunction(configuration.autoOpenFunction);
  }
};

/**
 * @param {Blockly.Block} procedureBlock procedure block which has a title value 'NAME'
 */
Blockly.FunctionEditor.prototype.openEditorForCallBlock_ = function(procedureBlock) {
  var functionName = procedureBlock.getTitleValue('NAME');
  procedureBlock.blockSpace.blockSpaceEditor.hideChaff();
  this.hideIfOpen();
  this.openAndEditFunction(functionName);
};

Blockly.FunctionEditor.prototype.openAndEditFunction = function(functionName) {
  var targetFunctionDefinitionBlock = Blockly.mainBlockSpace.findFunction(
      functionName);
  if (!targetFunctionDefinitionBlock) {
    throw new Error("Can't find definition block to edit");
  }

  this.show();
  this.setupUIForBlock_(targetFunctionDefinitionBlock);
  this.functionDefinitionBlock = this.moveToModalBlockSpace(targetFunctionDefinitionBlock);
  this.functionDefinitionBlock.setMovable(false);
  this.functionDefinitionBlock.setDeletable(false);
  this.functionDefinitionBlock.setEditable(false);
  this.populateParamToolbox_();
  this.setupUIAfterBlockInEditor_();

  goog.dom.getElement('functionNameText').value = functionName;
  goog.dom.getElement('functionDescriptionText').value =
      this.functionDefinitionBlock.description_ || '';
  this.deleteButton_.setVisible(targetFunctionDefinitionBlock.userCreated);

  Blockly.fireUiEvent(window, 'function_editor_opened');
};

/**
 * Lets subclass tweak the UI based on the given target block
 * @param targetFunctionDefinitionBlock
 * @protected
 */
Blockly.FunctionEditor.prototype.setupUIForBlock_ = function(targetFunctionDefinitionBlock) {
};

/**
 * Lets subclass tweak the UI once the function block is set
 * @protected
 */
Blockly.FunctionEditor.prototype.setupUIAfterBlockInEditor_ = function() {

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

Blockly.FunctionEditor.prototype.getParamNameType = function(parameterID) {
  var blockXML = this.orderedParamIDsToBlocks_.get(parameterID);
  if (!blockXML) {
    throw "Block not found for ID " + parameterID;
  }
  return this.paramNameTypeFromXML_(blockXML);
};

Blockly.FunctionEditor.prototype.paramNameTypeFromXML_ = function(blockXML) {
  var infoObject = {};
  infoObject.name = blockXML.firstElementChild.textContent;
  infoObject.type = blockXML.childNodes[1].textContent;
  return infoObject;
};

Blockly.FunctionEditor.prototype.openWithNewFunction = function() {
  this.ensureCreated_();

  var tempFunctionDefinitionBlock = Blockly.Xml.domToBlock(Blockly.mainBlockSpace,
    Blockly.createSvgElement('block', {type: this.definitionBlockType}));
  tempFunctionDefinitionBlock.userCreated = true;
  this.openAndEditFunction(tempFunctionDefinitionBlock.getTitleValue('NAME'));
};

Blockly.FunctionEditor.prototype.bindToolboxHandlers_ = function() {
  var paramAddTextElement = goog.dom.getElement('paramAddText');
  var paramAddButton = goog.dom.getElement('paramAddButton');
  if (!Blockly.disableParamEditing) {
    Blockly.bindEvent_(paramAddButton, 'click', this,
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
  this.forEachParameterGetBlock(oldName, function(block) {
    block.setTitleValue(newName, 'VAR');
  });
};

Blockly.FunctionEditor.prototype.changeParameterTypeInFlyoutXML = function(name, newType) {
  this.orderedParamIDsToBlocks_.forEach(function(blockXML, paramID, linkedMap) {
    if (blockXML.firstElementChild &&
        blockXML.firstElementChild.textContent === name) {
      // e.g. <block type="functional_parameters_get"><title name="VAR">seconds</title><mutation><outputtype>Number</outputtype></mutation></block>
      var mutationNode = blockXML.childNodes[1];
      var outputTypeNode = mutationNode.firstElementChild;
      outputTypeNode.textContent = newType;
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
  this.forEachParameterGetBlock(nameToRemove, function(block) {
    block.dispose(true, false);
  });
  this.refreshParamsEverywhere();
};

Blockly.FunctionEditor.prototype.refreshParamsEverywhere = function() {
  this.refreshParamsInFlyout_();
  this.refreshParamsOnFunction_();
};

Blockly.FunctionEditor.prototype.refreshParamsInFlyout_ = function() {
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
 *    parallel arrays of parameter names, IDs, types, suitable as input
 *    for calling updateParamsFromArrays on procedures
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

Blockly.FunctionEditor.prototype.forEachParameterGetBlock = function(paramName, callback) {
  if (!this.functionDefinitionBlock) {
    return;
  }
  this.functionDefinitionBlock.getDescendants().forEach(function(block) {
    if (block.type == 'parameters_get' &&
        Blockly.Names.equals(paramName, block.getTitleValue('VAR'))) {
      callback(block);
    }
  });
}

Blockly.FunctionEditor.prototype.show = function() {
  this.ensureCreated_();
  this.position_();
  goog.style.setElementShown(this.container_, true);
  goog.style.setElementShown(this.modalBackground_, true);
  Blockly.focusedBlockSpace = this.modalBlockSpace;
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

Blockly.FunctionEditor.prototype.onClose = function() {
  this.hideIfOpen();
};

Blockly.FunctionEditor.prototype.hideIfOpen = function() {
  if (!this.isOpen()) {
    return;
  }
  this.hideAndRestoreBlocks_();
  this.modalBlockSpace.clear();
};

/**
 * Hides the function editor, moving existing blocks to the
 * main BlockSpace
 * @protected
 */
Blockly.FunctionEditor.prototype.hideAndRestoreBlocks_ = function() {
  var functionDefinitionBlock = this.functionDefinitionBlock;
  // Clear block reference to stop re-layout mid-block deletion
  this.functionDefinitionBlock = null;
  this.moveToMainBlockSpace_(functionDefinitionBlock);

  goog.dom.getElement('functionNameText').value = '';
  goog.dom.getElement('functionDescriptionText').value = '';
  if (goog.dom.getElement('paramAddText')) {
    goog.dom.getElement('paramAddText').value = '';
  }

  goog.style.setElementShown(this.container_, false);
  goog.style.setElementShown(this.modalBackground_, false);

  Blockly.focusedBlockSpace = Blockly.mainBlockSpace;
  Blockly.fireUiEvent(window, 'function_editor_closed');
};

/**
 * Moves a block in the modal BlockSpace to the main BlockSpace.
 * Note: destroys the existing Block object in the process
 * @param blockToMove
 * @protected
 */
Blockly.FunctionEditor.prototype.moveToMainBlockSpace_ = function(blockToMove) {
  blockToMove.setMovable(true);
  blockToMove.setDeletable(true);
  var dom = Blockly.Xml.blockToDom(blockToMove);
  blockToMove.dispose(false, false, true);
  var newBlock = Blockly.Xml.domToBlock(Blockly.mainBlockSpace, dom);
  newBlock.setCurrentlyHidden(true);
};

/**
 * Moves an existing block to this modal BlockSpace
 * Note: destroys the existing Block object in the process
 * @param {Blockly.Block} blockToMove
 * @returns {Blockly.Block} copy of block in modal BlockSpace
 * @protected
 */
Blockly.FunctionEditor.prototype.moveToModalBlockSpace = function(blockToMove) {
  var dom = Blockly.Xml.blockToDom(blockToMove);
  blockToMove.dispose(false, false, true);
  var newCopyOfBlock = Blockly.Xml.domToBlock(this.modalBlockSpace, dom);
  newCopyOfBlock.moveTo(Blockly.RTL
    ? this.modalBlockSpace.getMetrics().viewWidth - Blockly.FunctionEditor.BLOCK_LAYOUT_LEFT_MARGIN
    : Blockly.FunctionEditor.BLOCK_LAYOUT_LEFT_MARGIN, Blockly.FunctionEditor.BLOCK_LAYOUT_TOP_MARGIN);
  newCopyOfBlock.setCurrentlyHidden(false);
  newCopyOfBlock.setUserVisible(true, true);
  return newCopyOfBlock;
};

Blockly.FunctionEditor.prototype.create_ = function() {
  if (this.created_) {
    throw "Attempting to re-create already created Function Editor";
  }

  this.container_ = document.createElement('div');
  this.container_.setAttribute('id', 'modalContainer');
  goog.dom.insertSiblingAfter(this.container_, Blockly.mainBlockSpaceEditor.svg_);
  this.container_.style.top = Blockly.mainBlockSpaceEditor.getWorkspaceTopOffset() + 'px';
  var self = this;
  this.modalBlockSpaceEditor =
      new Blockly.BlockSpaceEditor(this.container_,

        // getMetrics():
        function() {
          // `this` is the new BlockSpaceEditor
          var metrics = Blockly.BlockSpaceEditor.prototype.getBlockSpaceMetrics_.call(this);
          if (!metrics) {
            return null;
          }

          metrics.absoluteLeft +=
              FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH + 1;
          metrics.absoluteTop += self.getBlockSpaceEditorToScreenTop_();
          metrics.viewWidth -=
              (FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH) * 2;
          metrics.viewHeight -=
              FRAME_MARGIN_TOP + Blockly.Bubble.BORDER_WIDTH + self.getWindowBorderChromeHeight();
          return metrics;
        },

        // setMetrics():
        function (xyRatio) {
          // `this` is the new BlockSpaceEditor
          Blockly.BlockSpaceEditor.prototype.setBlockSpaceMetrics_.call(this, xyRatio);
          if (self.contractDiv_) {
            self.resizeUIComponents_();
            self.layOutBlockSpaceItems_();
          }
        },

        // hideTrashRect:
        true);

  this.modalBlockSpace = this.modalBlockSpaceEditor.blockSpace;
  this.modalBlockSpace.customFlyoutMetrics_ = Blockly.mainBlockSpace.getMetrics;
  this.modalBlockSpace.bindBeginPanDragHandler(this.container_, goog.bind(function () {
    this.modalBlockSpaceEditor.hideChaff();
  }, this));
  this.modalBlockSpace.bindScrollOnWheelHandler(this.container_);

  Blockly.modalBlockSpace = this.modalBlockSpace;
  Blockly.modalBlockSpaceEditor = this.modalBlockSpaceEditor;

  var clipPathID = "modalBlockCanvasClipRect";
  var clipPath = Blockly.createSvgElement(
    "clipPath", {
      id: clipPathID
    }
  );

  this.modalBlockSpaceEditor.addToSvgDefs(clipPath);
  var clipPathURL = "url(#" + clipPathID + ")";
  this.modalBlockSpace.getClippingGroup().setAttribute('clip-path', clipPathURL);

  // Clip path gets positioned/size dynamically later
  this.clipPathRect_ = Blockly.createSvgElement("rect", {
    x: 0,
    y: 0,
    width: 1,
    height: 1
  }, clipPath);

  this.modalBlockSpaceEditor.addChangeListener(
      Blockly.mainBlockSpace.fireChangeEvent);

  // Add modal background and close button
  this.modalBackground_ =
      Blockly.createSvgElement('g', {'class': 'modalBackground'});
  Blockly.mainBlockSpaceEditor.appendSVGChild(this.modalBackground_);

  this.addCloseButton_();
  this.addDeleteButton_();
  this.addEditorFrame_();
  this.createContractDom_();
  this.createParameterEditor_();

  this.setupParametersToolbox_();

  this.resizeUIComponents_();
  this.bindToolboxHandlers_();

  // The function editor block space passes clicks through via
  // pointer-events:none, so register the unselect handler on lower elements
  Blockly.bindEvent_(goog.dom.getElement('modalContainer'), 'mousedown', this,
      function(e) {
    // Only handle clicks on modalContainer, not a descendant
    if (e.target === e.currentTarget) {
      this.modalBlockSpaceEditor.hideChaff();
      if (Blockly.selected) {
        Blockly.selected.unselect();
      }
    }
  });

  // Enable editor close on press of ESC key
  Blockly.bindEvent_(goog.dom.getDocument().body, 'keyup', this, function(e) {
    if (e.keyCode === goog.events.KeyCodes.ESC) {
      this.onClose();
    }
  });

  Blockly.bindEvent_(goog.dom.getElement('modalEditorClose'), 'mousedown', this,
      this.onClose);
  Blockly.bindEvent_(goog.dom.getElement('functionNameText'), 'input', this,
      functionNameChange);
  // IE9 doesn't fire oninput when delete key is pressed, bind keydown also
  Blockly.bindEvent_(goog.dom.getElement('functionNameText'), 'keydown', this,
      functionNameChange);
  function functionNameChange(e) {
    var value = e.target.value;
    var disallowedCharacters = /\)|\(/g;
    if (disallowedCharacters.test(value)) {
      value = value.replace(disallowedCharacters, '');
      goog.dom.getElement('functionNameText').value = value;
    }
    this.functionDefinitionBlock.setTitleValue(value, 'NAME');
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

  this.onResizeWrapper_ = Blockly.bindEvent_(window,
      goog.events.EventType.RESIZE, this, this.position_);

  this.modalBlockSpaceEditor.svgResize();
};

/**
 * Sizes and positions the non-block UI components of the editor to match the
 * blockspace metrics.
 * @private
 */
Blockly.FunctionEditor.prototype.resizeUIComponents_ = function () {
  var metrics = this.modalBlockSpace.getMetrics();
  this.resizeFrame_(metrics.viewWidth, metrics.viewHeight);
  this.positionClippingRects_(metrics);
  this.positionSizeContractDom_(metrics.viewWidth);
  this.positionCloseButton_(metrics.absoluteLeft, metrics.viewWidth);
  this.positionDeleteButton_(metrics.absoluteLeft, metrics.viewWidth);
};

/**
 * Resizes the editor background frame to the given width and height
 * @param {number} width
 * @param {number} height
 * @private
 */
Blockly.FunctionEditor.prototype.resizeFrame_ = function (width, height) {
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
};

/**
 * Positions the DOM and SVG clipping rects to match the updated metrics.
 * @param {Object} metrics - block space metrics
 * @private
 */
Blockly.FunctionEditor.prototype.positionClippingRects_ = function (metrics) {
  var width = metrics.viewWidth;
  var height = metrics.viewHeight;
  this.clipPathRect_.setAttribute('x', metrics.absoluteLeft);
  this.clipPathRect_.setAttribute('y', metrics.absoluteTop);
  this.clipPathRect_.setAttribute('width', width);
  this.clipPathRect_.setAttribute('height', height);
  this.frameClipDiv_.style.left = metrics.absoluteLeft + 'px';
  this.frameClipDiv_.style.top = metrics.absoluteTop + 'px';
  this.frameClipDiv_.style.width = width + 'px';
  this.frameClipDiv_.style.height = height + 'px';
};

/**
 * Resizes the contract DOM based on the modal blockspace's dimensions.
 * @param {number} viewWidth modal blockspace's metrics.viewWidth
 * @private
 */
Blockly.FunctionEditor.prototype.positionSizeContractDom_ = function (viewWidth) {
  this.contractDiv_.style.left = this.modalBlockSpace.xOffsetFromView + 'px';
  this.contractDiv_.style.top = this.getContractDomTopY_() + 'px';
  this.contractDiv_.style.width = viewWidth + 'px';
  this.positionFlyout_(0);
};

/**
 * Position close button based on new metrics
 * @param {number} absoluteLeft
 * @param {number} viewWidth
 * @private
 */
Blockly.FunctionEditor.prototype.positionCloseButton_ = function (absoluteLeft,
    viewWidth) {
  this.closeButton_.setAttribute('transform', 'translate(' +
      (Blockly.RTL ? Blockly.FunctionEditor.RTL_CLOSE_BUTTON_OFFSET :
        absoluteLeft + viewWidth + Blockly.FunctionEditor.CLOSE_BUTTON_OVERHANG -
      this.closeButton_.firstElementChild.getAttribute('width')) +
      ',19)');
};

/**
 * Position close button based on new metrics
 * @param {number} absoluteLeft
 * @param {number} viewWidth
 * @private
 */
Blockly.FunctionEditor.prototype.positionDeleteButton_ = function (absoluteLeft,
    viewWidth) {
  var closeButtonWidth = this.closeButton_.firstElementChild.getAttribute('width');
  var deleteButtonWidth = this.deleteButton_.getButtonWidth();
  var rightEdge = absoluteLeft + viewWidth;
  var closeButtonLeft = Blockly.FunctionEditor.CLOSE_BUTTON_OVERHANG -
      closeButtonWidth;
  var deleteButtonLeft = rightEdge + closeButtonLeft - deleteButtonWidth;
  var ltrXOffset = deleteButtonLeft -
      Blockly.FunctionEditor.DELETE_BUTTON_MARGIN;
  var rtlXOffset = Blockly.FunctionEditor.RTL_CLOSE_BUTTON_OFFSET +
      closeButtonWidth + Blockly.FunctionEditor.DELETE_BUTTON_MARGIN;
  var xPosition = (Blockly.RTL ? rtlXOffset : ltrXOffset);
  this.deleteButton_.renderAt(xPosition, 19);
};

/**
 * @returns {Number} in pixels
 * @protected
 */
Blockly.FunctionEditor.prototype.getBlockSpaceEditorToScreenTop_ = function () {
  return this.getWindowBorderChromeHeight();
};

/**
 * @returns {Number} in pixels
 */
Blockly.FunctionEditor.prototype.getWindowBorderChromeHeight = function () {
  return FRAME_MARGIN_TOP +
    Blockly.Bubble.BORDER_WIDTH + FRAME_HEADER_HEIGHT;
};

/**
 * @returns {Number}
 * @protected
 */
Blockly.FunctionEditor.prototype.getContractDivHeight = function () {
  return this.contractDiv_
    ? this.contractDiv_.getBoundingClientRect().height
    : 0;
};

/**
 * @returns {boolean} whether the function editor is open and ready for display
 * @protected
 */
Blockly.FunctionEditor.prototype.readyToBeLaidOut_ = function () {
  return this.functionDefinitionBlock &&
    this.functionDefinitionBlock.svgInitialized() &&
    this.isOpen();
};

/**
 * Positions flyout at given editor layout position
 * @param {number} currentY - current position, relative to the blockspace
 *  being scrolled
 * @returns {number} next location to layout
 * @protected
 */
Blockly.FunctionEditor.prototype.positionFlyout_ = function (currentY) {
  currentY += this.flyout_.getHeight(); // positioned from bottom

  this.flyout_.customYOffset = currentY +
    this.modalBlockSpace.yOffsetFromView; // positioned in parent coords
  this.flyout_.position_();

  return currentY;
};

Blockly.FunctionEditor.prototype.layOutBlockSpaceItems_ = function () {
  if (!this.readyToBeLaidOut_()) {
    return;
  }

  var currentX = Blockly.RTL ?
    this.modalBlockSpace.getMetrics().viewWidth - Blockly.FunctionEditor.BLOCK_LAYOUT_LEFT_MARGIN :
    Blockly.FunctionEditor.BLOCK_LAYOUT_LEFT_MARGIN;
  var currentY = this.getContractDivHeight();
  currentY = this.positionFlyout_(currentY);

  currentY += Blockly.FunctionEditor.BLOCK_LAYOUT_TOP_MARGIN;
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
  text.textContent = Blockly.Msg.CLOSE;
  this.modalBlockSpaceEditor.appendSVGChild(this.closeButton_);
  var bounds = text.getBoundingClientRect();
  r.setAttribute('width', bounds.width + 2 * padding);
  r.setAttribute('height', bounds.height + padding);
  r.setAttribute('y', -bounds.height + padding - 1);
};

/**
 * Add delete button to the top right of the modal dialog, to the
 * left of the Close button.
 * @private
 */
Blockly.FunctionEditor.prototype.addDeleteButton_ = function () {
  this.deleteButton_ = new Blockly.SvgTextButton(
      this.modalBlockSpaceEditor.getSVGElement(), Blockly.Msg.DELETE,
      this.onDeletePressed.bind(this));
};

Blockly.FunctionEditor.prototype.onDeletePressed = function () {
  var functionName = this.functionDefinitionBlock.getProcedureInfo().name;
  var deleteMessage = Blockly.Msg.CONFIRM_DELETE_FUNCTION_MESSAGE.replace('%1',
      functionName);
  Blockly.showSimpleDialog({
    bodyText: deleteMessage,
    cancelText: Blockly.Msg.DELETE,
    confirmText: Blockly.Msg.KEEP,
    onConfirm: null,
    onCancel: this.onDeleteConfirmed.bind(this, functionName),
    cancelButtonClass: 'red-delete-button'
  });
};

Blockly.FunctionEditor.prototype.onDeleteConfirmed = function (functionName) {
  this.hideIfOpen();

  var functionDefinition = Blockly.mainBlockSpace.findFunction(functionName);
  var examples = Blockly.mainBlockSpace.findFunctionExamples(functionName);

  examples.concat(functionDefinition).forEach(function (block) {
    block.dispose(false, false, true);
  });
};

Blockly.FunctionEditor.prototype.setupParametersToolbox_ = function () {
  this.flyout_ = new Blockly.HorizontalFlyout(this.modalBlockSpaceEditor);
  var flyoutDom = this.flyout_.createDom();
  this.modalBlockSpace.getClippingGroup().insertBefore(flyoutDom,
    this.modalBlockSpace.svgBlockCanvas_);
  this.flyout_.init(this.modalBlockSpace, false);
};

Blockly.FunctionEditor.prototype.addEditorFrame_ = function () {
  // if we are in readOnly mode, don't pad. Otherwise, pad left
  // based on the size of either the Toolbox or the Flyout
  var left = this.modalBlockSpace.isReadOnly() ? 0 : Blockly.hasCategories ?
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
  if (!this.isOpen()) {
    return;
  }

  var metrics = this.modalBlockSpace.getMetrics();
  this.resizeFrame_(metrics.viewWidth, metrics.viewHeight);
  // Resize contract div width
  this.positionSizeContractDom_(metrics.viewWidth);

  this.layOutBlockSpaceItems_();

  // Move workspace to account for horizontal flyout height
  this.modalBlockSpaceEditor.svgResize();
};

/**
 * @returns {number} Y position for contract DOM
 * @protected
 */
Blockly.FunctionEditor.prototype.getContractDomTopY_ = function() {
  return this.modalBlockSpace.yOffsetFromView;
};

Blockly.FunctionEditor.prototype.createParameterEditor_ = function() {
  if (Blockly.disableParamEditing) {
    return;
  }

  goog.dom.getElement('paramEditingArea').innerHTML =
    '<div>' + Blockly.Msg.FUNCTION_PARAMETERS_LABEL + '</div>'
    + '<div>'
    + '<input id="paramAddText" type="text" style="width: 200px;"/> '
    + '<button id="paramAddButton" class="btn">' + Blockly.Msg.ADD_PARAMETER + '</button>'
    + '</div>';
};

Blockly.FunctionEditor.prototype.createFrameClipDiv_ = function () {
  var frameClipDiv = goog.dom.createDom('div');
  frameClipDiv.style.position = 'absolute';
  frameClipDiv.style.overflow = 'hidden';
  frameClipDiv.style.pointerEvents = 'none';
  return frameClipDiv;
};

Blockly.FunctionEditor.prototype.createContractDom_ = function() {
  this.contractDiv_ = goog.dom.createDom('div',
      'blocklyToolboxDiv paramToolbox blocklyText flyoutColorGray innerModalDiv');
  if (Blockly.RTL) {
    this.contractDiv_.setAttribute('dir', 'RTL');
  }
  this.contractDiv_.innerHTML =
      '<div>' + Blockly.Msg.FUNCTION_NAME_LABEL + '</div>'
      + '<div><input id="functionNameText" type="text"></div>'
      + '<div>' + Blockly.Msg.FUNCTION_DESCRIPTION_LABEL + '</div>'
      + '<div><textarea id="functionDescriptionText" rows="2"></textarea></div>'
      + '<div style="margin: 0;" id="paramEditingArea"></div>';
  this.contractDiv_.style.display = 'block';
  this.frameClipDiv_ = this.createFrameClipDiv_();
  this.frameClipDiv_.insertBefore(this.contractDiv_, this.frameClipDiv_.firstChild);
  this.container_.insertBefore(this.frameClipDiv_, this.container_.firstChild);
};
