/**
 * @fileoverview Object representing a separate function editor. This function
 * editor provides a separate modal workspace where a user can modify a given
 * function definition.
 */
'use strict';

goog.provide('Blockly.FunctionEditor');

goog.require('Blockly.BlockSpace');
goog.require('Blockly.HorizontalFlyout');

/**
 * Class for a modal function editor.
 * @constructor
 */
Blockly.FunctionEditor = function() {
};

Blockly.FunctionEditor.prototype.refreshToolbox_ = function() {
  var paramAddText = goog.dom.getElement('paramAddText');
  var paramAddButton = goog.dom.getElement('paramAddButton');
  Blockly.bindEvent_(paramAddButton, 'mousedown', this, handleParamAdd);
  Blockly.bindEvent_(paramAddText, 'keydown', this, function(e) {
    if (e.keyCode == 13) {
      handleParamAdd.apply(this, arguments);
    }
  });
  function handleParamAdd() {
    var varName = paramAddText.value;
    paramAddText.value = '';
    // Add the new param block to the local toolbox
    var param = Blockly.createSvgElement('block', {type: 'parameters_get'});
    var v = Blockly.createSvgElement('title', {name: 'VAR'}, param);
    v.innerHTML = varName;
    this.paramToolboxBlocks.push(param);
    this.flyout_.hide();
    this.flyout_.show(this.paramToolboxBlocks);
    // Update the function definition
    this.functionDefinition.arguments_.push(varName);
    this.functionDefinition.updateParams_();
  }
  this.flyout_.hide();
  this.flyout_.show(this.paramToolboxBlocks);
};

Blockly.FunctionEditor.prototype.renameParameter = function(oldName, newName) {
  this.paramToolboxBlocks.forEach(function (block) {
    if (block.firstElementChild && block.firstElementChild.innerHTML === oldName) {
      block.firstElementChild.innerHTML = newName;
    }
  });
  this.refreshToolbox_();
};

Blockly.FunctionEditor.prototype.show = function() {
  this.container_ = document.createElement('div');
  this.container_.setAttribute('id', 'modalContainer');
  goog.dom.getElement('blockly').appendChild(this.container_);
  Blockly.modalBlockSpaceEditor = new Blockly.BlockSpaceEditor(this.container_, function() {
    var metrics = Blockly.mainBlockSpace.getMetrics();
    var contractDivHeight = Blockly.functionEditor.contractDiv_ ? Blockly.functionEditor.contractDiv_.getBoundingClientRect().height : 0;
    var topOffset = FRAME_MARGIN_TOP + Blockly.Bubble.BORDER_WIDTH + FRAME_HEADER_HEIGHT;
    metrics.absoluteLeft += FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH + 1;
    metrics.absoluteTop += topOffset + contractDivHeight;
    metrics.viewWidth -= (FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH) * 2;
    metrics.viewHeight -= FRAME_MARGIN_TOP + Blockly.Bubble.BORDER_WIDTH + topOffset;
    if (Blockly.functionEditor.flyout_) {
      metrics.absoluteTop += Blockly.functionEditor.flyout_.height_;
    }
    return metrics;
  });
  Blockly.modalWorkspace = Blockly.modalBlockSpaceEditor.blockSpace;

  this.modalBackground_ = Blockly.createSvgElement('g', {'class': 'modalBackground'});
  Blockly.mainBlockSpaceEditor.svg_.appendChild(this.modalBackground_);
  Blockly.modalWorkspace.addTrashcan();

  // Set up contract definition HTML section
  this.createContractDom_();

  // The function editor block space passes clicks through via
  // pointer-events:none, so register the unselect handler on lower elements
  Blockly.bindEvent_(goog.dom.getElement('modalContainer'), 'mousedown', null, function(e) {
    if (Blockly.selected && e.target === e.currentTarget) {
      Blockly.selected.unselect();
    }
  });
  Blockly.bindEvent_(this.contractDiv_, 'mousedown', null, function() {
    if (Blockly.selected) {
      Blockly.selected.unselect();
    }
  });

  // Set up parameters toolbox
  this.paramToolboxBlocks = [];
  this.flyout_ = new Blockly.HorizontalFlyout(Blockly.modalBlockSpaceEditor);
  var flyoutDom = this.flyout_.createDom();
  Blockly.modalWorkspace.svgGroup_.insertBefore(flyoutDom, Blockly.modalWorkspace.svgBlockCanvas_);
  this.flyout_.init(Blockly.modalWorkspace, false);
  this.refreshToolbox_();

  var left = goog.dom.getElementByClass(Blockly.hasCategories ? 'blocklyToolboxDiv' : 'blocklyFlyoutBackground').getBoundingClientRect().width;
  var top = 0;
  this.frameBase_ = Blockly.createSvgElement('rect', {
    x: left + FRAME_MARGIN_SIDE,
    y: top + FRAME_MARGIN_TOP,
    fill: 'hsl(94, 73%, 35%)',
    // TODO: filter causes slow repaints while dragging blocks in Chrome 38
    // filter: 'url(#blocklyEmboss)',
    rx: Blockly.Bubble.BORDER_WIDTH,
    ry: Blockly.Bubble.BORDER_WIDTH
  }, this.modalBackground_);
  this.frameInner_ = Blockly.createSvgElement('rect', {
    x: left + FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH,
    y: top + FRAME_MARGIN_TOP + Blockly.Bubble.BORDER_WIDTH + FRAME_HEADER_HEIGHT,
    fill: '#ffffff'
  }, this.modalBackground_);
  this.frameText_ = Blockly.createSvgElement('text', {
    x: left + FRAME_MARGIN_SIDE + 16,
    y: top + FRAME_MARGIN_TOP + 22,
    'class': 'blocklyText',
    style: 'font-size: 12pt'
  }, this.modalBackground_);
  this.frameText_.appendChild(document.createTextNode(Blockly.Msg.FUNCTION_HEADER));
  this.position_();

  // Add the function definition block
  this.functionDefinition = Blockly.Xml.domToBlock_(Blockly.modalWorkspace,
      Blockly.createSvgElement('block', {type: 'procedures_defnoreturn'}));
  this.functionDefinition.moveTo(FRAME_MARGIN_SIDE, FRAME_MARGIN_TOP);
  this.functionDefinition.movable_ = false;

  this.onResizeWrapper_ = Blockly.bindEvent_(window,
      goog.events.EventType.RESIZE, this, this.position_);

  Blockly.modalBlockSpaceEditor.svgResize();
};

Blockly.FunctionEditor.prototype.hide = function() {
  delete Blockly.modalWorkspace;
  this.modalBackground_ = null;
  if (this.onResizeWrapper_) {
    Blockly.unbindEvent_(this.onResizeWrapper_);
    this.onResizeWrapper_ = null;
  }
};

Blockly.FunctionEditor.prototype.position_ = function() {
  var metrics = Blockly.modalWorkspace.getMetrics();
  var width = metrics.viewWidth;
  var height = metrics.viewHeight;
  if (!Blockly.hasCategories) {
    width -= goog.dom.getElementByClass('blocklyFlyoutBackground').getBoundingClientRect().width;
  }
  this.frameBase_.setAttribute('width', width + 2 * Blockly.Bubble.BORDER_WIDTH);
  this.frameBase_.setAttribute('height', height + 2 * Blockly.Bubble.BORDER_WIDTH + FRAME_HEADER_HEIGHT);
  this.frameInner_.setAttribute('width', width);
  this.frameInner_.setAttribute('height', height);
  if (Blockly.RTL) {
    // TODO: Fix RTL
    this.frameBase_.setAttribute('x', -width + FRAME_MARGIN_SIDE);
    this.frameInner_.setAttribute('x', -width + FRAME_MARGIN_SIDE);
    this.frameText_.setAttribute('x', -width + 2 * FRAME_MARGIN_SIDE);
  }

  // Resize contract div width
  this.resizeContractDiv_();

  // Move workspace to account for horizontal flyout height
  Blockly.modalBlockSpaceEditor.svgResize();
};

Blockly.FunctionEditor.prototype.resizeContractDiv_ = function() {
  this.contractDiv_.style.width = Blockly.modalWorkspace.getMetrics().viewWidth + 'px';
};

Blockly.FunctionEditor.prototype.createContractDom_ = function() {
  this.contractDiv_ = goog.dom.createDom('div', 'blocklyToolboxDiv paramToolbox blocklyText');
  this.container_.insertBefore(this.contractDiv_, this.container_.firstChild);
  this.contractDiv_.innerHTML = '<div>Name your function:</div><div><input type="text""></div>'
      + '<div>What is your function supposed to do?</div>'
      + '<div><textarea rows="2"></textarea></div>'
      + '<div>What parameters does your function take?</div>'
      + '<div><input id="paramAddText" type="text" style="width: 200px;"> <button id="paramAddButton" class="btn">Add Parameter</button>';
  var metrics = Blockly.modalWorkspace.getMetrics();
  this.contractDiv_.style.left = metrics.absoluteLeft + 'px';
  this.contractDiv_.style.top = metrics.absoluteTop + 'px';
  this.resizeContractDiv_();
  this.contractDiv_.style.display = 'block';
};

Blockly.functionEditor = new Blockly.FunctionEditor();
