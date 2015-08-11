'use strict';

goog.provide('Blockly.ContractDefinitionSection');
goog.require('Blockly.BlockSpaceEditor');

/**
 * Margin to leave above the function block below the flyout in pixels.
 * @type {number}
 * @const
 */
var FUNCTION_BLOCK_VERTICAL_MARGIN = Blockly.BlockSpaceEditor.BUMP_PADDING_TOP;

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

  this.verticalDefinitionMidline = Blockly.createSvgElement('rect', {
    'fill': '#000'
  }, this.definitionTableGroup);
  this.verticalDefinitionMidline.setAttribute('width', 2.0);

  this.horizontalDefinitionTopLine = Blockly.createSvgElement('rect', {
    'fill': '#000'
  }, this.definitionTableGroup);
  this.horizontalDefinitionTopLine.setAttribute('height', 2.0);
  this.horizontalDefinitionBottomLine = Blockly.createSvgElement('rect', {
    'fill': '#000'
  }, this.definitionTableGroup);
  this.horizontalDefinitionBottomLine.setAttribute('height', 2.0);
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
 * draws grid lines to match example section.
 * Coordinates are all relative to the parent canvas.
 * @param {number} currentY - starting Y coordinate for
 * @param {number} verticalMidlineX - X offset for the column separator
 * @param {number} fullWidth - full width to layout in
 * @param {?Blockly.Block} functionDefinitionBlock - definition block to place
 *        (possibly null during initialization steps)
 * @returns {number} new Y to continue laying out at
 */
Blockly.ContractDefinitionSection.prototype.placeContent = function (currentY,
                                                                     verticalMidlineX,
                                                                     fullWidth,
                                                                     functionDefinitionBlock) {
  var verticalMidlineY = currentY;
  this.horizontalDefinitionTopLine.setAttribute('transform',
      'translate(' + 0 + ',' + verticalMidlineY + ')');
  this.verticalDefinitionMidline.setAttribute('transform',
      'translate(' + verticalMidlineX + ',' + verticalMidlineY + ')');
  this.grayDefinitionBackground.setAttribute('transform',
      'translate(' + 0 + ',' + currentY + ')');
  this.horizontalDefinitionTopLine.setAttribute('width', fullWidth);

  currentY += FUNCTION_BLOCK_VERTICAL_MARGIN;

  if (functionDefinitionBlock) {
    functionDefinitionBlock.moveTo(verticalMidlineX +
        Blockly.BlockSvg.SEP_SPACE_X, currentY);
    currentY += functionDefinitionBlock.getHeightWidth().height;
  }

  currentY += FUNCTION_BLOCK_VERTICAL_MARGIN;

  this.horizontalDefinitionBottomLine.setAttribute('transform',
      'translate(' + 0 + ',' + currentY + ')');
  this.horizontalDefinitionBottomLine.setAttribute('width', fullWidth);
  this.verticalDefinitionMidline.setAttribute('height', currentY - verticalMidlineY);
  this.grayDefinitionBackground.setAttribute('height', currentY - verticalMidlineY);
  this.grayDefinitionBackground.setAttribute('width', verticalMidlineX);

  return currentY;
};
