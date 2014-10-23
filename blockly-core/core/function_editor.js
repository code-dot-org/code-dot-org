/**
 * @fileoverview Object representing a separate function editor. This function
 * editor provides a separate modal workspace where a user can modify a given
 * function definition.
 */
'use strict';

goog.provide('Blockly.FunctionEditor');

goog.require('Blockly.Workspace');
goog.require('Blockly.HorizontalFlyout');

/**
 * Class for a modal function editor.
 * @constructor
 */
Blockly.FunctionEditor = function() {
  //
};

Blockly.FunctionEditor.prototype.show = function() {
  Blockly.modalWorkspace = new Blockly.Workspace(function () {
    var metrics = Blockly.mainWorkspace.getMetrics();
    metrics.absoluteLeft += FRAME_MARGIN_SIDE;
    metrics.absoluteTop += FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT + FRAME_SUBHEADER_HEIGHT;
    metrics.viewHeight -= FRAME_MARGIN_TOP * 2 + FRAME_HEADER_HEIGHT + FRAME_SUBHEADER_HEIGHT;
    metrics.viewWidth -= FRAME_MARGIN_SIDE * 2;
    return metrics;
  });
  var g = Blockly.modalWorkspace.createDom();
  var modalBackground = Blockly.createSvgElement('g', {'class': 'modalBackground'});
  Blockly.svg.insertBefore(g, Blockly.mainWorkspace.svgGroup_.nextSibling);
  Blockly.svg.insertBefore(modalBackground, g);
  Blockly.modalWorkspace.addTrashcan();

  /*this.test_flyout = new Blockly.HorizontalFlyout();
  g.insertBefore(this.test_flyout.createDom(), Blockly.modalWorkspace.svgBlockCanvas_);
  this.test_flyout.init(Blockly.modalWorkspace, false);
  this.test_flyout.show([Blockly.createSvgElement('block', {type: 'parameters_get'})]);*/

  var left = goog.dom.getElementByClass(Blockly.hasCategories ? 'blocklyToolboxDiv' : 'blocklyFlyoutBackground').getBoundingClientRect().width;
  var top = 0;
  var clip = Blockly.createSvgElement('clipPath', {
    id: 'modalFrameClip'
  }, modalBackground);
  var frameClipRect_ = Blockly.createSvgElement('rect', {
    x: left + FRAME_MARGIN_SIDE,
    y: top + FRAME_MARGIN_TOP,
    height: FRAME_HEADER_HEIGHT,
    width: '100%'
  }, clip);
  var frameBase_ = Blockly.createSvgElement('rect', {
    x: left + FRAME_MARGIN_SIDE,
    y: top + FRAME_MARGIN_TOP,
    fill: '#dddddd',
    stroke: '#aaaaaa',
    rx: 15,
    ry:15
  }, modalBackground);
  var frameHeader_ = Blockly.createSvgElement('rect', {
    x: left + FRAME_MARGIN_SIDE,
    y: top + FRAME_MARGIN_TOP,
    fill: '#aaaaaa',
    rx: 15,
    ry:15,
    'clip-path': 'url(#modalFrameClip)'
  }, modalBackground);
  var frameSubheader_ = Blockly.createSvgElement('rect', {
    x: left + FRAME_MARGIN_SIDE,
    y: top + FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT,
    fill: '#dddddd',
    stroke: '#aaaaaa'
  }, modalBackground);
  var frameText_ = Blockly.createSvgElement('text', {
    x: left + FRAME_MARGIN_SIDE + 20,
    y: top + FRAME_MARGIN_TOP + 18,
    'class': 'blocklyText',
    style: 'font-size: 12pt'
  }, modalBackground);
  frameText_.appendChild(document.createTextNode(Blockly.Msg.FUNCTION_HEADER));

  var groupRect = {width: Blockly.mainWorkspace.getMetrics().viewWidth, height: 600};
  if (!Blockly.hasCategories) groupRect.width -= goog.dom.getElementByClass('blocklyFlyoutBackground').getBoundingClientRect().width;
  var width = groupRect.width - 2 * FRAME_MARGIN_SIDE;
  var height = 300;
  frameBase_.setAttribute('width', width);
  frameBase_.setAttribute('height', height);
  frameHeader_.setAttribute('width', width);
  frameHeader_.setAttribute('height', height);
  frameSubheader_.setAttribute('width', width);
  frameSubheader_.setAttribute('height', FRAME_SUBHEADER_HEIGHT);
  if (Blockly.RTL) {
    frameClipRect_.setAttribute('x', -width + FRAME_MARGIN_SIDE);
    frameHeader_.setAttribute('x', -width + FRAME_MARGIN_SIDE);
    frameBase_.setAttribute('x', -width + FRAME_MARGIN_SIDE);
    frameText_.setAttribute('x', -width + 2 * FRAME_MARGIN_SIDE);
  }

  var paramCreator = Blockly.Xml.domToBlock_(Blockly.getActiveWorkspace(),
      Blockly.createSvgElement('block', {type: 'param_creator'}));
  paramCreator.moveTo(Blockly.Toolbox.width + 2 * FRAME_MARGIN_SIDE, FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT + 10);
  var addButton = goog.dom.getElementsByClass('blocklyText', paramCreator.getSvgRoot())[2];

  var fn = Blockly.Xml.domToBlock_(Blockly.getActiveWorkspace(),
      Blockly.createSvgElement('block', {type: 'procedures_defnoreturn'}));
  fn.moveTo(Blockly.Toolbox.width + 2 * FRAME_MARGIN_SIDE, 2 * FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT + FRAME_SUBHEADER_HEIGHT);

  Blockly.bindEvent_(addButton, 'mousedown', paramCreator, function() {
    var v = Blockly.Xml.domToBlock_(Blockly.getActiveWorkspace(),
        Blockly.createSvgElement('block', {type: 'parameters_get'}));
    var varName = this.getTitleValue('VALUE');
    v.renameVar(v.getVars()[0], varName);
    this.placementX = this.placementX || 5;
    v.moveTo(Blockly.Toolbox.width + 2 * FRAME_MARGIN_SIDE + this.placementX, FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT + 45);
    this.placementX += 80;
    this.setTitleValue('', 'VALUE');
    fn.arguments_.push(varName);
    fn.updateParams_();
  });
};

Blockly.functionEditor = new Blockly.FunctionEditor();
