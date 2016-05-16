/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview Functionality for the right-click context menus.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.ContextMenu');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');

/**
 * Which block is the context menu attach to?
 * @type {Blockly.Block}
 */
Blockly.ContextMenu.currentBlock = null;

/**
 * Construct the menu based on the list of options and show the menu.
 * @param {!Event} e Mouse Event
 * @param {!Array.<!Object>} options Array of menu options.
 */
Blockly.ContextMenu.show = function(e, options) {
  Blockly.WidgetDiv.show(Blockly.ContextMenu, null);
  if (!options.length) {
    Blockly.ContextMenu.hide();
    return;
  }
  /* Here's what one option object looks like:
    {text: 'Make It So',
     enabled: true,
     callback: Blockly.MakeItSo}
  */
  var menu = new goog.ui.Menu();

  for (var x = 0, option; option = options[x]; x++) {
    var menuItem = new goog.ui.MenuItem(option.text);
    menu.addItem(menuItem);
    menuItem.setEnabled(option.enabled);
    if (option.enabled) {
      goog.events.listen(menuItem, goog.ui.Component.EventType.ACTION,
                         option.callback);
    }
  }
  goog.events.listen(menu, goog.ui.Component.EventType.ACTION,
                     Blockly.ContextMenu.hide);
  // Record windowSize and scrollOffset before adding menu.
  var windowSize = goog.dom.getViewportSize();
  var scrollOffset = goog.style.getViewportPageOffset(document);
  var div = Blockly.WidgetDiv.DIV;
  menu.render(div);
  menu.setAllowAutoFocus(true);
  var menuDom = menu.getElement();
  Blockly.addClass_(menuDom, 'blocklyContextMenu');
  // Record menuSize after adding menu
  var menuSize = goog.style.getSize(menuDom);

  // Position the menu.
  var x = e.clientX + scrollOffset.x;
  var y = e.clientY + scrollOffset.y;
  // Flip menu vertically if off the bottom.
  if (e.clientY + menuSize.height >= windowSize.height) {
    y -= menuSize.height;
  }
  // Flip menu horizontally if off the edge.
  if (Blockly.RTL) {
    if (menuSize.width >= e.clientX) {
      x += menuSize.width;
    }
  } else {
    if (e.clientX + menuSize.width >= windowSize.width) {
      x -= menuSize.width;
    }
  }
  Blockly.WidgetDiv.position(x, y, windowSize, scrollOffset);

  Blockly.ContextMenu.currentBlock = null; // May be set by Blockly.block
};

/**
 * Hide the context menu.
 */
Blockly.ContextMenu.hide = function() {
  Blockly.WidgetDiv.hideIfOwner(Blockly.ContextMenu);
  Blockly.ContextMenu.currentBlock = null;
};

/**
 * Create the DOM nodes for a menu option.
 * @param {string} text The option's text.
 * @return {!Element} <g> node containing the menu option.
 * @private
 */
Blockly.ContextMenu.optionToDom_ = function(text) {
  /* Here's the SVG we create:
    <g class="blocklyMenuDiv">
      <rect height="20"/>
      <text class="blocklyMenuText" x="20" y="15">Make It So</text>
    </g>
  */
  var gElement = Blockly.createSvgElement('g', {'class': 'blocklyMenuDiv'},
                                          null);
  var rectElement = Blockly.createSvgElement('rect',
      {'height': Blockly.ContextMenu.Y_HEIGHT}, gElement);
  var textElement = Blockly.createSvgElement('text',
      {'class': 'blocklyMenuText',
      'x': Blockly.ContextMenu.X_PADDING,
      'y': 15}, gElement);
  var textNode = document.createTextNode(text);
  textElement.appendChild(textNode);
  return gElement;
};

/**
 * Create a callback function that creates and configures a block,
 *   then places the new block next to the original.
 * @param {!Blockly.Block} block Original block.
 * @param {!Element} xml XML representation of new block.
 * @return {!Function} Function that creates a block.
 */
Blockly.ContextMenu.callbackFactory = function(block, xml) {
  return function() {
    var newBlock = Blockly.Xml.domToBlock(block.blockSpace, xml);
    // Move the new block next to the old block.
    var xy = block.getRelativeToSurfaceXY();
    if (Blockly.RTL) {
      xy.x -= Blockly.SNAP_RADIUS;
    } else {
      xy.x += Blockly.SNAP_RADIUS;
    }
    xy.y += Blockly.SNAP_RADIUS * 2;
    newBlock.moveBy(xy.x, xy.y);
    newBlock.select();
  };
};
