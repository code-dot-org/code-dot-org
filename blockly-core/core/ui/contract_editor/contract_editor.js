/**
 * @fileoverview Object representing a separate function editor. This function
 * editor provides a separate modal workspace where a user can modify a given
 * function definition.
 */
'use strict';

goog.provide('Blockly.ContractEditor');

goog.require('Blockly.FunctionEditor');
goog.require('Blockly.FunctionalBlockUtils');
goog.require('Blockly.BlockValueType');
goog.require('Blockly.FunctionalTypeColors');
goog.require('Blockly.ContractEditorSectionView');
goog.require('Blockly.SvgHeader');
goog.require('Blockly.SvgHighlightBox');
goog.require('Blockly.CustomCssClassMenuRenderer');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.FlatMenuButtonRenderer');
goog.require('goog.ui.Option');
goog.require('goog.ui.Select');
goog.require('goog.ui.Separator');
goog.require('goog.ui.decorate');
goog.require('goog.ui.Component.EventType');
goog.require('goog.events');
goog.require('goog.color');
goog.require('goog.array');

/** @const */ var EXAMPLE_BLOCK_MARGIN_BELOW = 20; // px
/** @const */ var EXAMPLE_BLOCK_MARGIN_LEFT = 15; // px
/** @const */ var EXAMPLE_BLOCK_SECTION_MAGIN_BELOW = 10; // px
/** @const */ var EXAMPLE_BLOCK_SECTION_MAGIN_ABOVE = 15; // px
/** @const */ var FUNCTION_BLOCK_VERTICAL_MARGIN = 15; // px
/** @const */ var HEADER_HEIGHT = 50; //px

/** @const */ var USER_TYPE_CHOICES = [
  Blockly.BlockValueType.NUMBER,
  Blockly.BlockValueType.STRING,
  Blockly.BlockValueType.IMAGE,
  Blockly.BlockValueType.BOOLEAN
];

/** The following must match up with level config parameters */
/** @const */ var CONTRACT_SECTION_NAME = 'contract';
/** @const */ var EXAMPLES_SECTION_NAME = 'examples';
/** @const */ var DEFINITION_SECTION_NAME = 'definition';
/** @const */ var HIGHLIGHT_CONFIG_SUFFIX = '_highlight';
/** @const */ var COLLAPSE_CONFIG_SUFFIX = '_collapse';
/** @const */ var TRUE_CONFIG_VALUE = 'true';

/**
 * Class for a functional block-specific contract editor.
 * @constructor
 */
Blockly.ContractEditor = function() {
  Blockly.ContractEditor.superClass_.constructor.call(this);

  /** @type {goog.ui.Select} */
  this.inputTypeSelector = null;
  /** @type {goog.ui.Select} */
  this.outputTypeSelector = null;

  /**
   * Example blocks in this modal dialog
   * @type {!Array.<Blockly.Block>}
   * @private
   */
  this.exampleBlocks = [];
  /**
   * @type {?Blockly.ContractEditorSectionView}
   * @private
   */
  this.contractSectionView_ = null;
  /**
   * @type {?Blockly.ContractEditorSectionView}
   * @private
   */
  this.examplesSectionView_ = null;
  /**
   * @type {?Blockly.ContractEditorSectionView}
   * @private
   */
  this.definitionSectionView_ = null;

  /**
   * @type {goog.structs.LinkedMap.<string,Blockly.ContractEditorSectionView>}
   * @private
   */
  this.allSections_ = new goog.structs.LinkedMap();

  /**
   * Briefly set to store level configuration until after the editor
   * is initialized and opened to further configure the editor
   * @type {Object}
   * @private
   */
  this.levelConfigForFirstOpen_ = null;
};
goog.inherits(Blockly.ContractEditor, Blockly.FunctionEditor);

Blockly.ContractEditor.EXAMPLE_BLOCK_TYPE = 'functional_example';
Blockly.ContractEditor.EXAMPLE_BLOCK_ACTUAL_INPUT_NAME = 'ACTUAL';

Blockly.ContractEditor.DEFAULT_OUTPUT_TYPE = Blockly.BlockValueType.NUMBER;
Blockly.ContractEditor.DEFAULT_PARAMETER_TYPE = Blockly.BlockValueType.NUMBER;

Blockly.ContractEditor.prototype.definitionBlockType = 'functional_definition';
Blockly.ContractEditor.prototype.parameterBlockType = 'functional_parameters_get';

Blockly.ContractEditor.prototype.create_ = function() {
  Blockly.ContractEditor.superClass_.create_.call(this);

  var canvasToDrawOn = this.modalBlockSpace.svgBlockCanvas_;

  var sharedHighlightBox = new Blockly.SvgHighlightBox(canvasToDrawOn, {
    color: YELLOW_HEX,
    thickness: HIGHLIGHT_BOX_WIDTH
  });

  this.contractSectionView_ = new Blockly.ContractEditorSectionView(canvasToDrawOn,
    {
      onCollapseCallback: goog.bind(function (isNowCollapsed) {
        // goog.ui.showElement toggles between "hidden" and "hidden" due to
        // inherited properties, so set display directly instead
        this.contractDiv_.style.display = isNowCollapsed ? 'none' : 'block';
        this.position_();
      }, this),
      placeContentCallback: goog.bind(function (currentY) {
        return currentY + this.getContractDivHeight();
      }, this),
      highlightBox: sharedHighlightBox,
      headerText: "1. Contract and Purpose Statement" // TODO(bjordan): i18n,
    }
  );

  this.hiddenExampleBlocks_ = [];
  this.examplesSectionView_ = new Blockly.ContractEditorSectionView(
    canvasToDrawOn, {
      headerText: "2. Examples", // TODO(bjordan): i18n
      placeContentCallback: goog.bind(function (currentY) {
        if (this.exampleBlocks.length === 0) {
          return currentY;
        }
        var newY = currentY;
        newY += EXAMPLE_BLOCK_SECTION_MAGIN_ABOVE;
        this.exampleBlocks.forEach(function(block, i) {
          if (i !== 0) {
            newY += EXAMPLE_BLOCK_MARGIN_BELOW;
          }
          block.moveTo(EXAMPLE_BLOCK_MARGIN_LEFT, newY);
          newY += block.getHeightWidth().height;
        }, this);
        newY += EXAMPLE_BLOCK_SECTION_MAGIN_BELOW;
        return newY;
      }, this),
      highlightBox: sharedHighlightBox,
      onCollapseCallback: goog.bind(function (isNowCollapsed) {
        this.setBlockSubsetVisibility(!isNowCollapsed,
          goog.bind(this.isBlockInExampleArea, this),
          this.hiddenExampleBlocks_);
        this.position_();
      }, this)
    });

  this.hiddenDefinitionBlocks_ = [];
  this.definitionSectionView_ = new Blockly.ContractEditorSectionView(
    canvasToDrawOn, {
      headerText: "3. Definition", /** TODO(bjordan) i18n */
      onCollapseCallback: goog.bind(function (isNowCollapsed) {
        this.flyout_.setVisibility(!isNowCollapsed);
        this.setBlockSubsetVisibility(!isNowCollapsed,
          goog.bind(this.isBlockInFunctionArea, this),
          this.hiddenDefinitionBlocks_);
        this.position_();
      }, this),
      highlightBox: sharedHighlightBox,
      placeContentCallback: goog.bind(function (currentY) {
        if (this.flyout_) {
          currentY += this.flyout_.getHeight();
          this.flyout_.customYOffset = currentY;
          this.flyout_.position_();
        }

        currentY += FUNCTION_BLOCK_VERTICAL_MARGIN;

        if (this.functionDefinitionBlock) {
          var fullWidth = Blockly.modalBlockSpace.getMetrics().viewWidth;
          var functionDefinitionX = Blockly.RTL ? fullWidth - FRAME_MARGIN_SIDE : FRAME_MARGIN_SIDE;
          this.functionDefinitionBlock.moveTo(functionDefinitionX, currentY);
          currentY += this.functionDefinitionBlock.getHeightWidth().height;
        }

        return currentY + FUNCTION_BLOCK_VERTICAL_MARGIN;
      }, this)
    });

  this.allSections_.set(CONTRACT_SECTION_NAME, this.contractSectionView_);
  this.allSections_.set(EXAMPLES_SECTION_NAME, this.examplesSectionView_);
  this.allSections_.set(DEFINITION_SECTION_NAME, this.definitionSectionView_);
};

Blockly.ContractEditor.prototype.firstOpenLevelConfig_ = function (levelConfig) {
  this.allSections_.forEach(function (sectionView, sectionName) {
    var highlight = levelConfig[sectionName + HIGHLIGHT_CONFIG_SUFFIX];
    if (highlight === TRUE_CONFIG_VALUE) {
      this.setSectionHighlighted(sectionView);
    }
    var collapse = levelConfig[sectionName + COLLAPSE_CONFIG_SUFFIX];
    sectionView.setCollapsed_(collapse === TRUE_CONFIG_VALUE);
  }, this);
};


/** @override */
Blockly.ContractEditor.prototype.openWithLevelConfiguration = function (levelConfig) {
  this.levelConfigForFirstOpen_ = levelConfig;
  Blockly.ContractEditor.superClass_.openWithLevelConfiguration.call(this, levelConfig);
};

Blockly.ContractEditor.prototype.setSectionHighlighted = function (viewToHighlight) {
  this.allSections_.forEach(function (view) {
    view.setHighlighted(false);
  }, this);
  viewToHighlight.setHighlighted(true);
};

/**
 * Hides a set of blocks
 * @param isVisible whether to set blocks in area visible (true) or invisible (false)
 * @param blockFilter subset of blocks to look at
 * @param hiddenBlockArray array containing currently hidden blocks, gets filled with
 *                        newly hidden blocks if any are hidden
 */
Blockly.ContractEditor.prototype.setBlockSubsetVisibility = function(isVisible, blockFilter, hiddenBlockArray) {
  if (isVisible) {
    hiddenBlockArray.forEach(function (block) {
      block.setUserVisible(true);
    }, this);
    goog.array.clear(hiddenBlockArray);
  } else {
    this.modalBlockSpace.getTopBlocks()
      .filter(blockFilter)
      .forEach(function (block) {
        hiddenBlockArray.push(block);
        block.setUserVisible(false);
      }, this);
  }
};

Blockly.ContractEditor.prototype.isBlockInFunctionArea = function(block) {
  return block === this.functionDefinitionBlock ||
    (block.blockSpace === this.modalBlockSpace && block.isUserVisible() &&
    block.getRelativeToSurfaceXY().y >= this.getFlyoutTopPosition());
};

Blockly.ContractEditor.prototype.isBlockInExampleArea = function(block) {
  return goog.array.contains(this.exampleBlocks, block) ||
    (block.blockSpace === this.modalBlockSpace && block.isUserVisible() &&
    block.getRelativeToSurfaceXY().y < this.getFlyoutTopPosition());
};

Blockly.ContractEditor.prototype.getFlyoutTopPosition = function () {
  return (this.flyout_.getYPosition() - this.flyout_.getHeight());
};

Blockly.ContractEditor.prototype.hideAndRestoreBlocks_ = function() {
  Blockly.ContractEditor.superClass_.hideAndRestoreBlocks_.call(this);
  this.exampleBlocks.forEach(function(exampleBlock) {
    this.moveToMainBlockSpace_(exampleBlock);
  }, this);
  goog.array.clear(this.exampleBlocks);
};

Blockly.ContractEditor.prototype.openAndEditFunction = function(functionName) {
  Blockly.ContractEditor.superClass_.openAndEditFunction.call(this, functionName);

  this.moveExampleBlocksToModal_(functionName);
  this.position_();

  this.setTypeDropdownDefaults();

  if (this.levelConfigForFirstOpen_) {
    this.firstOpenLevelConfig_(this.levelConfigForFirstOpen_);
    this.levelConfigForFirstOpen_ = null;
  }
};

/**
 * @param {!String} functionName name of function being edited
 * @private
 */
Blockly.ContractEditor.prototype.moveExampleBlocksToModal_ = function (functionName) {
  var exampleBlocks = Blockly.mainBlockSpace.findFunctionExamples(functionName);
  exampleBlocks.forEach(function(exampleBlock) {
    var movedExampleBlock = this.moveToModalBlockSpace_(exampleBlock);
    this.exampleBlocks.push(movedExampleBlock);
  }, this);
};

Blockly.ContractEditor.prototype.setTypeDropdownDefaults = function() {
  this.inputTypeSelector.setValue(Blockly.ContractEditor.DEFAULT_PARAMETER_TYPE);
  this.outputTypeSelector.setValue(this.functionDefinitionBlock.getOutputType() ||
    Blockly.ContractEditor.DEFAULT_OUTPUT_TYPE);
};

Blockly.ContractEditor.prototype.openWithNewFunction = function(opt_blockCreationCallback) {
  this.ensureCreated_();

  var tempFunctionDefinitionBlock = Blockly.Xml.domToBlock(Blockly.mainBlockSpace,
    Blockly.createSvgElement('block', {type: this.definitionBlockType}));
  tempFunctionDefinitionBlock.updateOutputType(Blockly.ContractEditor.DEFAULT_OUTPUT_TYPE);

  if (opt_blockCreationCallback) {
    opt_blockCreationCallback(tempFunctionDefinitionBlock);
  }

  for (var i = 0; i < Blockly.defaultNumExampleBlocks; i++) {
    this.createExampleBlock_(tempFunctionDefinitionBlock);
  }

  this.openAndEditFunction(tempFunctionDefinitionBlock.getTitleValue('NAME'));
};

/**
 * Creates a new example block in the main BlockSpace
 * @returns {Blockly.Block} the newly added block
 * @private
 */
Blockly.ContractEditor.prototype.createExampleBlock_ = function (functionDefinitionBlock) {
  var temporaryExampleBlock = Blockly.Xml.domToBlock(Blockly.mainBlockSpace,
    Blockly.createSvgElement('block', {type: Blockly.ContractEditor.EXAMPLE_BLOCK_TYPE}));
  var caller = Blockly.Procedures.createCallerFromDefinition(Blockly.mainBlockSpace,
    functionDefinitionBlock);
  temporaryExampleBlock.attachBlockToInputName(
    caller, Blockly.ContractEditor.EXAMPLE_BLOCK_ACTUAL_INPUT_NAME);
  return temporaryExampleBlock;
};

/**
 * @override
 */
Blockly.ContractEditor.prototype.layOutBlockSpaceItems_ = function () {
  if (!this.isOpen()) {
    return;
  }

  var fullWidth = Blockly.modalBlockSpace.getMetrics().viewWidth;

  this.contractSectionView_.placeAndGetNewY(
    -this.getBlockSpaceEditorToContractSectionTop_(), fullWidth);

  this.positionTrashcanVerticalMiddleOfTopHeader_();

  var currentY = 0;
  currentY = this.examplesSectionView_.placeAndGetNewY(currentY, fullWidth);
  this.definitionSectionView_.placeAndGetNewY(currentY, fullWidth);
};

Blockly.ContractEditor.prototype.positionTrashcanVerticalMiddleOfTopHeader_ = function () {
  var trashcan = this.modalBlockSpace.trashcan;
  var trashcanHeaderDifference = trashcan.getHeight() - HEADER_HEIGHT;
  trashcan.repositionBelowBlockSpaceTop(-trashcanHeaderDifference / 2);
  this.modalBlockSpace.moveElementToFront(trashcan.svgGroup_);
};

/**
 * @override
 */
Blockly.ContractEditor.prototype.createContractDom_ = function() {
  this.contractDiv_ = goog.dom.createDom('div',
      'blocklyToolboxDiv paramToolbox blocklyText');
  if (Blockly.RTL) {
    this.contractDiv_.setAttribute('dir', 'RTL');
  }
  this.contractDiv_.innerHTML =
          '<div>' + Blockly.Msg.FUNCTIONAL_NAME_LABEL + '</div>'
        + '<div><input id="functionNameText" type="text"></div>'
        + '<div id="domain-area" style="margin: 0;">'
          + '<div>' + Blockly.Msg.FUNCTIONAL_DOMAIN_LABEL + '</div>'
          + '<div><input id="paramAddText" type="text" style="width: 200px;" '
          + 'placeholder="' + Blockly.Msg.FUNCTIONAL_NAME_LABEL + '"> '
            + '<span id="paramTypeDropdown"></span>'
            + '<button id="paramAddButton" class="btn">' + Blockly.Msg.ADD
            + '</button>'
          + '</div>'
        + '</div>'
        + '<div id="range-area" style="margin: 0;">'
          + '<div id="outputTypeTitle">' + Blockly.Msg.FUNCTIONAL_RANGE_LABEL + '</div>'
          + '<span id="outputTypeDropdown"></span>'
        + '</div>'
        + '<div id="description-area" style="margin: 0px;">'
          + '<div>' + Blockly.Msg.FUNCTIONAL_DESCRIPTION_LABEL + '</div>'
          + '<div><textarea id="functionDescriptionText" rows="2"></textarea></div>'
        + '</div>';
  var metrics = this.modalBlockSpace.getMetrics();
  this.contractDiv_.style.left = metrics.absoluteLeft + 'px';
  this.contractDiv_.style.top = metrics.absoluteTop + 'px';
  this.contractDiv_.style.width = metrics.viewWidth + 'px';
  this.contractDiv_.style.display = 'block';
  this.container_.insertBefore(this.contractDiv_, this.container_.firstChild);

  this.initializeInputTypeDropdown_();
  this.initializeOutputTypeDropdown_();
};

Blockly.ContractEditor.prototype.chromeBottomToContractDivDistance_ = function () {
  return (this.isShowingHeaders_() ? HEADER_HEIGHT : 0);
};

Blockly.ContractEditor.prototype.getContractDomTopY_ = function () {
  return this.getWindowBorderChromeHeight() +
    this.chromeBottomToContractDivDistance_();
};

Blockly.ContractEditor.prototype.getBlockSpaceEditorToContractSectionTop_ = function () {
  return this.getContractDivHeight() + this.chromeBottomToContractDivDistance_();
};

Blockly.ContractEditor.prototype.getBlockSpaceEditorToScreenTop_ = function () {
  return this.getWindowBorderChromeHeight() +
    this.getBlockSpaceEditorToContractSectionTop_();
};

/**
 * @override
 */
Blockly.ContractEditor.prototype.setupUIForBlock_ = function(targetFunctionDefinitionBlock) {
  var isEditingVariable = targetFunctionDefinitionBlock.isVariable();
  this.frameText_.textContent =
    isEditingVariable ?
      Blockly.Msg.FUNCTIONAL_VARIABLE_HEADER :
      Blockly.Msg.CONTRACT_EDITOR_HEADER;
  goog.dom.setTextContent(goog.dom.getElement('outputTypeTitle'),
    isEditingVariable ? Blockly.Msg.FUNCTIONAL_VARIABLE_TYPE : Blockly.Msg.FUNCTIONAL_RANGE_LABEL);
  goog.style.showElement(goog.dom.getElement('domain-area'), !isEditingVariable);
  goog.style.showElement(goog.dom.getElement('description-area'), !isEditingVariable);
  if (isEditingVariable) {
    this.contractSectionView_.setHeaderVisible(false);
    this.examplesSectionView_.hideCompletely();
    this.definitionSectionView_.setHeaderVisible(false);
  } else {
    this.expandAllSections_();
  }
  Blockly.ContractEditor.superClass_.show.call(this);
};

Blockly.ContractEditor.prototype.expandAllSections_ = function () {
  this.contractSectionView_.showHeaderAndExpand();
  this.examplesSectionView_.showHeaderAndExpand();
  this.definitionSectionView_.showHeaderAndExpand();
};

Blockly.ContractEditor.prototype.isShowingHeaders_ = function () {
  return !this.isEditingVariable();
};

Blockly.ContractEditor.prototype.isEditingVariable = function() {
  return this.functionDefinitionBlock && this.functionDefinitionBlock.isVariable();
};

/**
 * Add a new parameter block to the toolbox (and set an output type mutation on it)
 * @param {String} newParameterName
 * @param {?String} opt_newParameterType
 * @override
 */
Blockly.ContractEditor.prototype.addParameter = function(newParameterName, opt_newParameterType) {
  this.orderedParamIDsToBlocks_.set(
    goog.events.getUniqueId('parameter'),
    this.newParameterBlock(newParameterName, opt_newParameterType));
};

Blockly.ContractEditor.prototype.newParameterBlock = function(newParameterName, opt_newParameterType) {
  opt_newParameterType = opt_newParameterType || this.inputTypeSelector.getValue();
  var newParamBlockDOM = Blockly.createSvgElement('block', {type: this.parameterBlockType});
  var title = Blockly.createSvgElement('title', {name: 'VAR'}, newParamBlockDOM);
  title.textContent = newParameterName;
  if (opt_newParameterType) {
    var mutation = Blockly.createSvgElement('mutation', {}, newParamBlockDOM);
    var outputType = Blockly.createSvgElement('outputtype', {}, mutation);
    outputType.textContent = opt_newParameterType;
  }
  return newParamBlockDOM;
};

/** @override */
Blockly.ContractEditor.prototype.addParamsFromProcedure_ = function() {
  var procedureInfo = this.functionDefinitionBlock.getProcedureInfo();
  for (var i = 0; i < procedureInfo.parameterNames.length; i++) {
    this.addParameter(procedureInfo.parameterNames[i], procedureInfo.parameterTypes[i]);
  }
};

Blockly.ContractEditor.prototype.initializeOutputTypeDropdown_ = function() {
  this.outputTypeSelector = this.createTypeDropdown_();
  this.outputTypeSelector.render(this.getOutputTypeDropdownElement_());

  goog.events.listen(this.outputTypeSelector, goog.ui.Component.EventType.CHANGE,
    goog.bind(this.outputTypeDropdownChange_, this));
};

Blockly.ContractEditor.prototype.outputTypeDropdownChange_ = function(comboBoxEvent) {
  var newType = comboBoxEvent.target.getContent();
  var menuButtonRenderer = goog.ui.FlatMenuButtonRenderer.getInstance();
  var menuButtonElement = menuButtonRenderer.getContentElement(this.getOutputTypeDropdownElement_());
  var newColorHSV = Blockly.FunctionalTypeColors[newType];
  this.setBackgroundFromHSV(menuButtonElement, newColorHSV);
  this.setFrameColor_(newColorHSV);

  if (this.functionDefinitionBlock) {
    this.functionDefinitionBlock.updateOutputType(newType);
    this.modalBlockSpace.events.dispatchEvent(
      Blockly.BlockSpace.EVENTS.BLOCK_SPACE_CHANGE);
  }
};

Blockly.ContractEditor.prototype.setFrameColor_ = function (hsvColor) {
  this.frameBase_.style.fill =
    goog.color.hsvToHex(hsvColor[0], hsvColor[1], hsvColor[2] * 255);
};

Blockly.ContractEditor.prototype.getOutputTypeDropdownElement_ = function () {
  return goog.dom.getElement('outputTypeDropdown');
};

Blockly.ContractEditor.prototype.getInputTypeDropdownElement_ = function () {
  return goog.dom.getElement('paramTypeDropdown');
};

Blockly.ContractEditor.prototype.initializeInputTypeDropdown_ = function() {
  this.inputTypeSelector = this.createTypeDropdown_();
  this.inputTypeSelector.render(goog.dom.getElement('paramTypeDropdown'));

  goog.events.listen(this.inputTypeSelector, goog.ui.Component.EventType.CHANGE,
    goog.bind(this.inputTypeDropdownChange_, this));
};

Blockly.ContractEditor.prototype.inputTypeDropdownChange_ = function(comboBoxEvent) {
  var newType = comboBoxEvent.target.getContent();
  this.colorInputButtonForType_(newType);
};

Blockly.ContractEditor.prototype.colorInputButtonForType_ = function(newType) {
  var menuButtonRenderer = goog.ui.FlatMenuButtonRenderer.getInstance();
  var menuButtonElement = menuButtonRenderer.getContentElement(this.getInputTypeDropdownElement_());
  this.setBackgroundFromHSV(menuButtonElement, Blockly.FunctionalTypeColors[newType]);
};

/**
 * @returns {goog.ui.Select} new dropdown
 * @private
 */
Blockly.ContractEditor.prototype.createTypeDropdown_ = function() {
  var newTypeDropdown = new goog.ui.Select(null, null,
    goog.ui.FlatMenuButtonRenderer.getInstance(),
    null,
    new Blockly.CustomCssClassMenuRenderer('colored-type-dropdown'));
  USER_TYPE_CHOICES.forEach(function (choiceKey) {
    var menuItem = new goog.ui.MenuItem(choiceKey);
    newTypeDropdown.addItem(menuItem);
    this.setMenuItemColor_(menuItem, Blockly.FunctionalTypeColors[choiceKey]);
  }, this);
  return newTypeDropdown;
};

/**
 * @param {!goog.ui.MenuItem} menuItem
 * @param {!Array.<Number>} hsvColor
 * @private
 */
Blockly.ContractEditor.prototype.setMenuItemColor_ = function(menuItem, hsvColor) {
  var menuItemElement = menuItem.getElement();
  this.setBackgroundFromHSV(menuItemElement, hsvColor);
};

/**
 * @param {!Element} element
 * @param {!Array.<Number>} hsvColor
 */
Blockly.ContractEditor.prototype.setBackgroundFromHSV = function (element, hsvColor) {
  element.style.background =
    goog.color.hsvToHex(hsvColor[0], hsvColor[1], hsvColor[2] * 255);
};
