'use strict';

goog.provide('Blockly.ContractDefinitionSection');
goog.require('Blockly.BlockSpaceEditor');

/**
 * Margin in pixels to leave between the function block and the flyout.
 * @type {number}
 * @const
 */
var FUNCTION_BLOCK_VERTICAL_MARGIN = Blockly.BlockSpaceEditor.BUMP_PADDING_TOP;
/**
 * Margin to leave to the left of the function definition block.
 * @type {number}
 * @const
 */
var FUNCTION_BLOCK_MIN_HORIZONTAL_MARGIN =
    Blockly.BlockSpaceEditor.BUMP_PADDING_LEFT;

/**
 * Handles UI state and layout for the contract editor definition section/block
 * @param {Element} canvasToDrawOn element this section should be drawn on
 * @constructor
 */
Blockly.ContractDefinitionSection = function (canvasToDrawOn) {
  this.definitionTableGroup = Blockly.createSvgElement('g', {}, canvasToDrawOn);
  this.grayDefinitionBackground = Blockly.createSvgElement('rect', {
    'fill': '#DDD'
  }, this.definitionTableGroup);
  Blockly.svgIgnoreMouseEvents(this.grayDefinitionBackground);

  this.verticalDefinitionMidline = Blockly.createSvgElement('rect', {
    'fill': Blockly.ContractEditor.GRID_LINE_COLOR
  }, this.definitionTableGroup);
  this.verticalDefinitionMidline.setAttribute('width', 2.0);
  Blockly.svgIgnoreMouseEvents(this.verticalDefinitionMidline);

  this.horizontalDefinitionTopLine = Blockly.createSvgElement('rect', {
    'fill': Blockly.ContractEditor.GRID_LINE_COLOR
  }, this.definitionTableGroup);
  this.horizontalDefinitionTopLine.setAttribute('height', 2.0);
  Blockly.svgIgnoreMouseEvents(this.horizontalDefinitionTopLine);
  this.horizontalDefinitionBottomLine = Blockly.createSvgElement('rect', {
    'fill': Blockly.ContractEditor.GRID_LINE_COLOR
  }, this.definitionTableGroup);
  this.horizontalDefinitionBottomLine.setAttribute('height', 2.0);
  Blockly.svgIgnoreMouseEvents(this.horizontalDefinitionBottomLine);
};

/**
 * Update UI to match new collapse state
 * @param {boolean} isNowCollapsed - whether we are now collapsed
 */
Blockly.ContractDefinitionSection.prototype.handleCollapse = function (isNowCollapsed) {
  this.definitionTableGroup.style.display = isNowCollapsed ? 'none' : 'block';
};

/**
 * Lays out the contract definition section. Places the definition block and
 * (if not in variable mode) draws grid lines to match the example section.
 * Coordinates are all relative to the parent canvas.
 * @param {number} currentY - starting Y coordinate for
 * @param {number} verticalMidlineX - X offset for the column separator
 * @param {number} fullWidth - full width to layout in
 * @param {?Blockly.Block} functionDefinitionBlock - definition block to place
 *        (possibly null during initialization steps)
 * @returns {number} new Y to continue laying out at
 */
Blockly.ContractDefinitionSection.prototype.placeContent = function (currentY,
    verticalMidlineX, fullWidth, functionDefinitionBlock) {
  if (!functionDefinitionBlock) {
    return currentY;
  }

  var verticalMidlineY = currentY;

  if (functionDefinitionBlock.isVariable()) {
    this.definitionTableGroup.style.display = 'none';
  } else {
    this.definitionTableGroup.style.display = 'block';
    this.horizontalDefinitionTopLine.setAttribute('transform',
        'translate(' + 0 + ',' + verticalMidlineY + ')');
    this.verticalDefinitionMidline.setAttribute('transform',
        'translate(' + verticalMidlineX + ',' + verticalMidlineY + ')');
    this.grayDefinitionBackground.setAttribute('transform',
        'translate(' + 0 + ',' + currentY + ')');
    this.horizontalDefinitionTopLine.setAttribute('width', fullWidth);
  }

  currentY += FUNCTION_BLOCK_VERTICAL_MARGIN;

  var xOffset = functionDefinitionBlock.isVariable() ?
      FUNCTION_BLOCK_MIN_HORIZONTAL_MARGIN :
      FUNCTION_BLOCK_MIN_HORIZONTAL_MARGIN + verticalMidlineX;
  functionDefinitionBlock.moveTo(xOffset, currentY);

  currentY += functionDefinitionBlock.getHeightWidth().height;

  currentY += FUNCTION_BLOCK_VERTICAL_MARGIN;

  if (!functionDefinitionBlock.isVariable()) {
    this.horizontalDefinitionBottomLine.setAttribute('transform',
        'translate(' + 0 + ',' + currentY + ')');
    this.horizontalDefinitionBottomLine.setAttribute('width', fullWidth);
    this.verticalDefinitionMidline.setAttribute('height', currentY - verticalMidlineY);
    this.grayDefinitionBackground.setAttribute('height', currentY - verticalMidlineY);
    this.grayDefinitionBackground.setAttribute('width', verticalMidlineX);
  }

  return currentY;
};
