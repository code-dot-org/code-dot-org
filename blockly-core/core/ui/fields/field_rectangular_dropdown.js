/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Base class for a dropdown input field.
 */
'use strict';

goog.provide('Blockly.FieldRectangularDropdown');
goog.require('Blockly.Field');
goog.require('Blockly.FieldImage');
goog.require('Blockly.ImageDimensionCache');

/**
 * Class for a rectangular dropdown field.
 * @param {!Array.<string>} choices An array of choices for a dropdown list, each choice is a
 *                                  tuple of [image location, value]
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldRectangularDropdown = function(choices) {
  this.choices_ = choices;
  var firstTuple = this.choices_[0];
  this.value_ = firstTuple[Blockly.FieldRectangularDropdown.TUPLE_VALUE_INDEX];
  var firstPreviewData = firstTuple[Blockly.FieldRectangularDropdown.TUPLE_PREVIEW_DATA_INDEX];

  this.size_ = {width: Blockly.FieldImage.IMAGE_LOADING_WIDTH, height: Blockly.FieldImage.IMAGE_LOADING_HEIGHT};
  this.buildDOMElements_();
  this.updatePreviewData_(firstPreviewData);
};
goog.inherits(Blockly.FieldRectangularDropdown, Blockly.Field);

Blockly.FieldRectangularDropdown.TUPLE_PREVIEW_DATA_INDEX = 0;
Blockly.FieldRectangularDropdown.TUPLE_VALUE_INDEX = 1;
Blockly.FieldRectangularDropdown.BORDER_MARGIN = 2;
Blockly.FieldRectangularDropdown.DROPDOWN_MENU_BORDER = 2;
Blockly.FieldRectangularDropdown.MENU_CSS_CLASS = 'blocklyRectangularDropdownMenu';
Blockly.FieldRectangularDropdown.BORDER_OFFSET_X = -Blockly.FieldRectangularDropdown.BORDER_MARGIN;
Blockly.FieldRectangularDropdown.BORDER_OFFSET_Y = Blockly.FieldImage.IMAGE_OFFSET_Y - Blockly.FieldRectangularDropdown.BORDER_MARGIN;
Blockly.FieldRectangularDropdown.BORDER_RECTANGLE_RADIUS = 4;
Blockly.FieldRectangularDropdown.BORDER_EXTRA_ARROW_WIDTH = 30;
Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_WIDTH = 20;
Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_HEIGHT = 23;
Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_X_OFFSET_FROM_PREVIEW_RIGHT =
  Blockly.FieldRectangularDropdown.BORDER_EXTRA_ARROW_WIDTH / 2 -
  Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_WIDTH / 2;
Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_Y_OFFSET_FROM_PREVIEW_MIDDLE =
  -Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_HEIGHT / 2 - 4;
Blockly.FieldRectangularDropdown.CHECKMARK_OVERHANG = 0; // Horizontal distance that a selection menu checkmark overhangs the dropdown.
Blockly.FieldRectangularDropdown.DOWN_ARROW_CHARACTER = '\u25BC'; // ▾
Blockly.FieldRectangularDropdown.UP_ARROW_CHARACTER = '\u25B2';
Blockly.FieldRectangularDropdown.prototype.CURSOR = 'default';
Blockly.FieldRectangularDropdown.prototype.EDITABLE = true;

Blockly.FieldRectangularDropdown.prototype.getOptions = function() {
  return this.choices_;
};

Blockly.FieldRectangularDropdown.prototype.buildDOMElements_ = function() {
  this.fieldGroup_ = Blockly.createSvgElement('g', {}, null);
  this.dropdownBorderRectElement_ = Blockly.createSvgElement('rect',
    {'rx': Blockly.FieldRectangularDropdown.BORDER_RECTANGLE_RADIUS,
      'ry': Blockly.FieldRectangularDropdown.BORDER_RECTANGLE_RADIUS,
      'x': Blockly.FieldRectangularDropdown.BORDER_OFFSET_X,
      'y': Blockly.FieldRectangularDropdown.BORDER_OFFSET_Y,
      'height': Blockly.FieldImage.IMAGE_LOADING_HEIGHT,
      'class': 'fieldRectangularDropdownBackdrop'
    }, this.fieldGroup_);
  this.addPreviewElementTo_(this.fieldGroup_);
  this.createDropdownArrow_();
  this.clickRectElement_ = Blockly.createSvgElement('rect',
    {'height': Blockly.FieldImage.IMAGE_LOADING_HEIGHT + 'px',
      'width': Blockly.FieldImage.IMAGE_LOADING_WIDTH + 'px',
      'y': Blockly.FieldImage.IMAGE_OFFSET_Y,
      'fill-opacity': 0}, this.fieldGroup_);
};

Blockly.FieldRectangularDropdown.prototype.addPreviewElementTo_ = function () {
  throw Error("FieldRectangularDropdown.prototype.addPreviewElementTo_ not implemented");
};

Blockly.FieldRectangularDropdown.prototype.createDropdownArrow_ = function () {
  this.dropdownArrowText_ = Blockly.createSvgElement('text',
    {'class': 'blocklyText'}, this.fieldGroup_);
  this.arrowCharacter_ = Blockly.createSvgElement('tspan',
    {'class': 'blocklyArrow blocklyRectangularDropdownArrow'}, this.dropdownArrowText_);
  this.arrowCharacter_.appendChild(document.createTextNode(Blockly.FieldRectangularDropdown.DOWN_ARROW_CHARACTER));
};

Blockly.FieldRectangularDropdown.prototype.updatePreviewData_ = function(previewData) {
  throw Error("FieldRectangularDropdown.prototype.updatePreviewData_ not implemented");
};

/**
 * Updates widget component dimensions based on new preview rectangle width and height
 * @param previewRectangleWidth
 * @param previewRectangleHeight
 * @private
 */
Blockly.FieldRectangularDropdown.prototype.updateDimensions_ = function(previewRectangleWidth, previewRectangleHeight) {
  this.previewSize_ = {width: previewRectangleWidth, height: previewRectangleHeight};
  var borderHeight = previewRectangleHeight + 2 * Blockly.FieldRectangularDropdown.BORDER_MARGIN;
  var borderWidth = previewRectangleWidth +
    2 * Blockly.FieldRectangularDropdown.BORDER_MARGIN +
    Blockly.FieldRectangularDropdown.BORDER_EXTRA_ARROW_WIDTH;
  this.updatePreviewDimensions_(previewRectangleWidth, previewRectangleHeight);
  this.clickRectElement_.setAttribute('width', borderWidth + 'px');
  this.clickRectElement_.setAttribute('height', borderHeight + 'px');
  this.dropdownBorderRectElement_.setAttribute('width', borderWidth + 'px');
  this.dropdownBorderRectElement_.setAttribute('height', borderHeight + 'px');
  var previewMiddle = previewRectangleHeight / 2 - Blockly.FieldImage.IMAGE_OFFSET_Y;
  this.dropdownArrowText_.setAttribute('x', previewRectangleWidth + Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_X_OFFSET_FROM_PREVIEW_RIGHT);
  this.dropdownArrowText_.setAttribute('y', previewMiddle + Blockly.FieldRectangularDropdown.DROPDOWN_ARROW_Y_OFFSET_FROM_PREVIEW_MIDDLE );
  this.size_ = {height: borderHeight + Blockly.FieldImage.BELOW_IMAGE_PADDING, width: borderWidth};
  this.refreshRender();
};

Blockly.FieldRectangularDropdown.prototype.updatePreviewDimensions_ = function(previewWidth, previewHeight) {
  throw Error("FieldRectangularDropdown.prototype.updatePreviewDimensions_ not implemented");
};

/**
 * Creates a preview element suitable for display within a goog.ui.MenuItem
 * @param previewData
 * @returns {HTMLElement}
 * @private
 */
Blockly.FieldRectangularDropdown.prototype.createDropdownPreviewElement_ = function(previewData) {
  throw Error("FieldRectangularDropdown.prototype.updatePreviewDimensions_ not implemented");
};

Blockly.FieldRectangularDropdown.prototype.pointArrowUp_ = function() {
  this.setArrowDirection_(true);
};

Blockly.FieldRectangularDropdown.prototype.pointArrowDown_ = function() {
  this.setArrowDirection_(false);
};

Blockly.FieldRectangularDropdown.prototype.setArrowDirection_ = function(up) {
  this.arrowCharacter_.firstChild.nodeValue = up ? Blockly.FieldRectangularDropdown.UP_ARROW_CHARACTER : Blockly.FieldRectangularDropdown.DOWN_ARROW_CHARACTER;
};

Blockly.FieldRectangularDropdown.prototype.showMenu_ = function() {
  Blockly.WidgetDiv.show(this, this.generateMenuClosedHandler_());
  this.menu_ = this.createMenuWithChoices_(this.choices_);
  goog.events.listen(this.menu_, goog.ui.Component.EventType.ACTION, this.generateMenuItemSelectedHandler_());
  this.addPositionAndShowMenu(this.menu_);
  this.pointArrowUp_();
};

Blockly.FieldRectangularDropdown.prototype.menuAlreadyShowing_ = function() {
  return (
    this.menu_ &&
    Blockly.WidgetDiv.isOwner(this) &&
    Blockly.WidgetDiv.isVisible()
  );
};

Blockly.FieldRectangularDropdown.prototype.createMenuWithChoices_ = function(choices) {
  var menu = new goog.ui.Menu();
  for (var x = 0; x < choices.length; x++) {
    var previewData = choices[x][Blockly.FieldRectangularDropdown.TUPLE_PREVIEW_DATA_INDEX];
    var value = choices[x][Blockly.FieldRectangularDropdown.TUPLE_VALUE_INDEX];
    var isCurrentSelection = (value === this.value_);
    var dropdownPreviewElement = this.createDropdownPreviewElement_(previewData);
    var menuItem = new goog.ui.MenuItem(dropdownPreviewElement);
    menuItem.setValue(value);
    var singleColumnLayout = chooseNumberOfColumns(choices.length) === 1;
    if (isCurrentSelection && singleColumnLayout) {
      menu.addItemAt(menuItem, 0);
    } else {
      menu.addItem(menuItem);
    }
  }
  return menu;
};

function chooseNumberOfColumns(numItems) {
  if (numItems <= 7)  {
    return 1;
  }
  return Math.floor(Math.sqrt(numItems));
};

Blockly.FieldRectangularDropdown.prototype.generateMenuItemSelectedHandler_ = function() {
  var fieldRectanglularDropdown = this;
  return function(googMenuElement) {
    var menuItem = googMenuElement.target;
    if (menuItem) {
      var value = menuItem.getValue();
      if (value !== null) {
        fieldRectanglularDropdown.setValue(value);
      }
    }
    Blockly.WidgetDiv.hideIfOwner(fieldRectanglularDropdown);
  };
};

Blockly.FieldRectangularDropdown.prototype.generateMenuClosedHandler_ = function () {
  var fieldRectangularDropdown = this;
  return function() {
    fieldRectangularDropdown.pointArrowDown_();
  };
};

Blockly.FieldRectangularDropdown.prototype.addPositionAndShowMenu = function (menu) {
  // Record windowSize and scrollOffset before adding menu.
  var windowSize = goog.dom.getViewportSize();
  var scrollOffset = goog.style.getViewportPageOffset(document);
  var widgetDiv = Blockly.WidgetDiv.DIV;

  // IE will scroll the bottom of the page into view to show this element
  // before we move it, so hide it until we've repositioned.
  widgetDiv.style.visibility = "hidden";
  menu.render(widgetDiv);
  menu.setAllowAutoFocus(true);
  var menuDom = menu.getElement();
  Blockly.addClass_(menuDom, 'blocklyDropdownMenu');
  Blockly.addClass_(menuDom, Blockly.FieldRectangularDropdown.MENU_CSS_CLASS);
  Blockly.addClass_(menuDom, 'goog-menu-noaccel');  // display menu items without shortcuts
  var backdropColour = this.calculateBackdropColourWithoutAlpha_();
  menuDom.style.borderColor = backdropColour;
  menuDom.style.background = backdropColour;

  var numberOfColumns = chooseNumberOfColumns(menu.getChildCount());
  var multipleColumns = numberOfColumns > 1;
  if (multipleColumns) {
    var marginWidth = 4;
    var widthPerMenuItem = this.previewSize_.width + marginWidth;
    menuDom.style.width =
      widthPerMenuItem * numberOfColumns // all items + their left margins
      + marginWidth // right margin
      + "px";
    Blockly.addClass_(menuDom, 'blocklyGridDropdownMenu');
  }

  var menuPosition = this.calculateMenuPosition_(this.previewElement_, multipleColumns);
  Blockly.WidgetDiv.position(menuPosition.x, menuPosition.y, windowSize, scrollOffset);
  widgetDiv.style.visibility = "visible";
};

/**
 * Calculates position of menu
 * @param dropdownTargetElement
 * @param positionBelow (optional) whether to place the menu below the SVG preview element
 * @returns {{x: number, y: number}}
 * @private
 */
Blockly.FieldRectangularDropdown.prototype.calculateMenuPosition_ = function (dropdownTargetElement, positionBelow) {
  var previewTopLeft = Blockly.getAbsoluteXY_(dropdownTargetElement, this.getRootSVGElement_());
  var menuTopLeft = {
    x: previewTopLeft.x - Blockly.FieldRectangularDropdown.DROPDOWN_MENU_BORDER,
    y: previewTopLeft.y - Blockly.FieldRectangularDropdown.DROPDOWN_MENU_BORDER
  };
  if (positionBelow) {
    menuTopLeft.y += this.previewSize_.height + Blockly.FieldRectangularDropdown.DROPDOWN_MENU_BORDER;
  }
  return menuTopLeft;
};

/**
 * Get the language-neutral value from this dropdown menu.
 * @return {string} Current text.
 */
Blockly.FieldRectangularDropdown.prototype.getValue = function() {
  return this.value_;
};

/**
 * Set the language-neutral value for this dropdown menu.
 * @param {string} newValue New value to set.
 */
Blockly.FieldRectangularDropdown.prototype.setValue = function(newValue) {
  this.value_ = newValue;
  this.refreshPreview_();
};

Blockly.FieldRectangularDropdown.prototype.refreshPreview_ = function() {
  this.updatePreviewData_(this.getCurrentPreviewData_());
};

Blockly.FieldRectangularDropdown.prototype.getCurrentPreviewData_ = function() {
  return this.getPreviewDataForValue_(this.value_);
};

Blockly.FieldRectangularDropdown.prototype.getPreviewDataForValue_ = function(value) {
  var choices = this.choices_;
  for (var x = 0; x < choices.length; x++) {
    if (choices[x][Blockly.FieldRectangularDropdown.TUPLE_VALUE_INDEX] == value) {
      return choices[x][Blockly.FieldRectangularDropdown.TUPLE_PREVIEW_DATA_INDEX];
    }
  }
  throw 'Preview data for given value "' + value + '" not found';
};

/**
 * Install this field on a block
 *  * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.FieldRectangularDropdown.prototype.init = function(block) {
  if (this.sourceBlock_) {
    throw 'Field has already been initialized once.';
  }
  this.sourceBlock_ = block;
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
  this.mouseUpWrapper_ = Blockly.bindEvent_(this.getClickTarget(), 'mouseup', this, this.onMouseUp_);
  this.mouseDownWrapper_ = Blockly.bindEvent_(this.getClickTarget(), 'mousedown', this, this.onMouseDown_);
  this.updateDropdownArrowColour_();
};

Blockly.FieldRectangularDropdown.prototype.updateDropdownArrowColour_ = function () {
  if (!this.sourceBlock_) {
    throw 'Cannot update dropdown arrow colour before added to block';
  }
  // Match arrow colour to source block colour
  this.arrowCharacter_.style.fill = this.sourceBlock_.getHexColour();
};

Blockly.FieldRectangularDropdown.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  if (this.mouseDownWrapper_) {
    Blockly.unbindEvent_(this.mouseDownWrapper_);
    this.mouseDownWrapper_ = null;
  }
  Blockly.FieldRectangularDropdown.superClass_.dispose.call(this);
};

Blockly.FieldRectangularDropdown.prototype.onMouseUp_ = function(e) {
  if (this.doNotOpenEditorNextMouseUp_) {
    this.doNotOpenEditorNextMouseUp_ = false;
    return;
  }

  if (Blockly.isRightButton(e) ||
      Blockly.Block.isFreelyDragging() ||
      !this.sourceBlock_.isEditable()) {
    return;
  }

  this.showMenu_();
};

Blockly.FieldRectangularDropdown.prototype.onMouseDown_ = function(e) {
  if (this.menuAlreadyShowing_()) {
    // Menu is being closed, don't re-open if they click the arrow
    this.doNotOpenEditorNextMouseUp_ = true;
  }
};

Blockly.FieldRectangularDropdown.prototype.getClickTarget = function() {
  return this.clickRectElement_;
};

Blockly.FieldRectangularDropdown.prototype.sendClickRectToFront_ = function() {
  this.fieldGroup_.appendChild(this.clickRectElement_);
};

Blockly.FieldRectangularDropdown.prototype.calculateBackdropColourWithoutAlpha_ = function() {
  var blockColour = this.sourceBlock_.getHexColour();
  var backdropOverlayColour = '#ffffff';
  var backdropOverlayOpacity = 0.6; // Match this with .fieldRectangularDropdownBackdrop in core/css.js
  return Blockly.mixColoursWithForegroundOpacity(backdropOverlayColour, blockColour, backdropOverlayOpacity);
};
