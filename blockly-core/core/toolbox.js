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
 * @fileoverview Toolbox from whence to create blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Toolbox');

goog.require('Blockly.Flyout');
goog.require('goog.events.BrowserFeature');
goog.require('goog.style');
goog.require('goog.ui.tree.TreeControl');
goog.require('goog.ui.tree.TreeNode');
goog.require('goog.math.Rect');


/**
 * Class for a toolbox.
 * @constructor
 */
Blockly.Toolbox = function(blockSpaceEditor) {
  this.blockSpaceEditor_ = blockSpaceEditor;
  this.createDom(this.blockSpaceEditor_.svg_);
};

/**
 * Width of the toolbox.
 * @type {number}
 */
Blockly.Toolbox.prototype.width = 0;

/**
 * Configuration constants for Closure's tree UI.
 * @type {Object.<string,*>}
 * @const
 * @private
 */
Blockly.Toolbox.CONFIG_ = {
  indentWidth: 19,
  cssRoot: 'blocklyTreeRoot',
  cssHideRoot: 'blocklyHidden',
  cssItem: '',
  cssTreeRow: 'blocklyTreeRow',
  cssItemLabel: 'blocklyTreeLabel',
  cssTreeIcon: 'blocklyTreeIcon',
  cssExpandedFolderIcon: 'blocklyTreeIconOpen',
  cssFileIcon: 'blocklyTreeIconNone',
  cssSelectedRow: 'blocklyTreeSelected'
};

/**
 * Creates the toolbox's DOM.  Only needs to be called once.
 * @param {!Element} svg The top-level SVG element.
 */
Blockly.Toolbox.prototype.createDom = function (svg) {
  // Create an HTML container for the Toolbox menu.
  this.HtmlDiv = goog.dom.createDom('div', 'blocklyToolboxDiv');
  this.HtmlDiv.setAttribute('dir', Blockly.RTL ? 'RTL' : 'LTR');
  goog.dom.insertSiblingBefore(this.HtmlDiv, svg);

  /**
   * @type {!Blockly.Flyout}
   * @private
   */
  this.flyout_ = new Blockly.Flyout(this.blockSpaceEditor_);
  svg.appendChild(this.flyout_.createDom());

  // Clicking on toolbox closes popups.
  Blockly.bindEvent_(this.HtmlDiv, 'mousedown', this,
      function(e) {
        Blockly.fireUiEvent(window, 'resize');
        if (Blockly.isRightButton(e) || e.target == this.HtmlDiv) {
          // Close flyout.
          this.blockSpaceEditor_.hideChaff(false);
        } else {
          // Just close popups.
          this.blockSpaceEditor_.hideChaff(true);
        }
      });
};

/**
 * Initializes the toolbox.
 * @param {!BlockSpace} blockSpace The blockSpace this toolbox's flyout will create blocks in
 * @param {!BlockSpaceEditor} blockSpaceEditor The editor blockSpace this toolbox's flyout will be positioned in
 */
Blockly.Toolbox.prototype.init = function(blockSpace, blockSpaceEditor) {
  Blockly.Toolbox.CONFIG_['cleardotPath'] = Blockly.assetUrl('media/1x1.gif');
  Blockly.Toolbox.CONFIG_['cssCollapsedFolderIcon'] =
      'blocklyTreeIconClosed' + (Blockly.RTL ? 'Rtl' : 'Ltr');
  var tree = new Blockly.Toolbox.TreeControl(this, 'root', Blockly.Toolbox.CONFIG_);
  this.tree_ = tree;
  tree.setShowRootNode(false);
  tree.setShowLines(false);
  tree.setShowExpandIcons(false);
  tree.setSelectedItem(null);

  this.HtmlDiv.style.display = 'block';
  this.flyout_.init(blockSpace, true);
  this.populate_();
  tree.render(this.HtmlDiv);

  // If the document resizes, reposition the toolbox.
  goog.events.listen(window, goog.events.EventType.RESIZE,
                     goog.partial(this.position_, blockSpaceEditor), false, this);
  this.position_(blockSpaceEditor);
  this.enabled = true;
};

/**
 * Move the toolbox to the edge.
 * @private
 */
Blockly.Toolbox.prototype.position_ = function(blockSpaceEditor) {
  var treeDiv = this.HtmlDiv;
  var svgBox = goog.style.getBorderBox(blockSpaceEditor.svg_);
  var svgSize = blockSpaceEditor.svgSize();
  if (Blockly.RTL) {
    treeDiv.style.right = svgBox.right + 'px';
  } else {
    treeDiv.style.marginLeft = svgBox.left;
  }
  treeDiv.style.height = (svgSize.height + 1) + 'px';
  this.width = treeDiv.offsetWidth;
  if (!Blockly.RTL) {
    // For some reason the LTR toolbox now reports as 1px too wide.
    this.width -= 1;
  }
};

/**
 * Fill the toolbox with categories and blocks.
 * @private
 */
Blockly.Toolbox.prototype.populate_ = function() {
  var rootOut = this.tree_;
  rootOut.blocks = [];
  function syncTrees(treeIn, treeOut) {
    for (var i = 0, childIn; childIn = treeIn.childNodes[i]; i++) {
      if (!childIn.tagName) {
        // Skip over text.
        continue;
      }
      var name = childIn.tagName.toUpperCase();
      if (name === 'CATEGORY') {
        var childOut = rootOut.createNode(childIn.getAttribute('name'));
        childOut.blocks = [];
        treeOut.add(childOut);
        var custom = childIn.getAttribute('custom');
        if (custom) {
          // Variables and procedures have special categories that are dynamic.
          childOut.blocks[0] = custom;
        }

        syncTrees(childIn, childOut);
      } else if (name === 'BLOCK') {
        treeOut.blocks.push(childIn);
      }
    }
  }
  syncTrees(Blockly.languageTree, this.tree_);

  if (rootOut.blocks.length) {
    throw 'Toolbox cannot have both blocks and categories in the root level.';
  }

  // Fire a resize event since the toolbox may have changed width and height.
  Blockly.fireUiEvent(window, 'resize');
};

/**
 * Unhighlight any previously specified option.
 */
Blockly.Toolbox.prototype.clearSelection = function() {
  this.tree_.setSelectedItem(null);
};

/**
* Return the deletion rectangle for this toolbar.
* @return {goog.math.Rect} Rectangle in which to delete.
*/
Blockly.Toolbox.prototype.getRect = function() {
  // BIG_NUM is offscreen padding so that blocks dragged beyond the toolbox
  // area are still deleted.  Must be smaller than Infinity, but larger than
  // the largest screen size.
  var BIG_NUM = 10000000;
  var left = -BIG_NUM
  // Assumes that the toolbox is on the SVG edge.  If this changes
  // (e.g. toolboxes in mutators) then this code will need to be more complex.
  if (Blockly.RTL) {
    var svgSize = Blockly.svgSize();
    left = svgSize.width - this.width;
  }
  return new goog.math.Rect(left, -BIG_NUM, BIG_NUM + this.width, 2 * BIG_NUM);
};

// Extending Closure's Tree UI.

/**
 * Extention of a TreeControl object that uses a custom tree node.
 * @param {string} html The HTML content of the node label.
 * @param {Object=} opt_config The configuration for the tree. See
 *    goog.ui.tree.TreeControl.DefaultConfig. If not specified, a default config
 *    will be used.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.tree.TreeControl}
 */
Blockly.Toolbox.TreeControl = function(toolbox, html, opt_config, opt_domHelper) {
  goog.ui.tree.TreeControl.call(this, html, opt_config, opt_domHelper);
  this.toolbox_ = toolbox;
};
goog.inherits(Blockly.Toolbox.TreeControl, goog.ui.tree.TreeControl);

/**
 * Adds touch handling to TreeControl.
 * @override
 */
Blockly.Toolbox.TreeControl.prototype.enterDocument = function() {
  Blockly.Toolbox.TreeControl.superClass_.enterDocument.call(this);

  // Add touch handler.
  if (goog.events.BrowserFeature.TOUCH_ENABLED ||
      'onpointerdown' in window ||
      'onmspointerdown' in window) {
    var el = this.getElement();
    Blockly.bindEvent_(el, goog.events.EventType.TOUCHSTART, this,
        this.handleTouchEvent_);
    Blockly.bindEvent_(el, goog.events.EventType.POINTERDOWN, this,
        this.handleTouchEvent_);
    Blockly.bindEvent_(el, goog.events.EventType.MSPOINTERDOWN, this,
        this.handleTouchEvent_);
  }
};
/**
 * Handles touch events.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @private
 */
Blockly.Toolbox.TreeControl.prototype.handleTouchEvent_ = function(e) {
  e.preventDefault();
  var node = this.getNodeFromEvent_(e);
  if (node && (e.type === goog.events.EventType.TOUCHSTART ||
               e.type === goog.events.EventType.POINTERDOWN ||
               e.type === goog.events.EventType.MSPOINTERDOWN)) {
    // Fire asynchronously since onMouseDown takes long enough that the browser
    // would fire the default mouse event before this method returns.
    e.stopImmediatePropagation();
    window.setTimeout(function() {
      node.onMouseDown(e);  // Same behavior for click and touch.
    }, 1);
  }
};

/**
 * Creates a new tree node using a custom tree node.
 * @param {string} html The html content of the node label.
 * @return {goog.ui.tree.TreeNode} The new item.
 * @override
 */
Blockly.Toolbox.TreeControl.prototype.createNode = function(html) {
  return new Blockly.Toolbox.TreeNode(this.toolbox_, html || '', this.getConfig(),
      this.getDomHelper());
};

/**
 * Display/hide the flyout when an item is selected.
 * @param {goog.ui.tree.BaseNode} node The item to select.
 * @override
 */
Blockly.Toolbox.TreeControl.prototype.setSelectedItem = function(node) {
  if (this.selectedItem_ == node) {
    return;
  }
  goog.ui.tree.TreeControl.prototype.setSelectedItem.call(this, node);
  if (node && node.blocks && node.blocks.length) {
    this.toolbox_.flyout_.show(node.blocks);
  } else {
    // Hide the flyout.
    this.toolbox_.flyout_.hide();
  }
};

/**
 * An single node in the tree, customized for Blockly's UI.
 * @param {string} html The html content of the node label.
 * @param {Object=} opt_config The configuration for the tree. See
 *    goog.ui.tree.TreeControl.DefaultConfig. If not specified, a default config
 *    will be used.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.tree.TreeNode}
 */
Blockly.Toolbox.TreeNode = function(toolbox, html, opt_config, opt_domHelper) {
  goog.ui.tree.TreeNode.call(this, html, opt_config, opt_domHelper);
  var resize = function() {
    Blockly.fireUiEvent(window, 'resize');
  };

  this.toolbox_ = toolbox;

  // Fire a resize event since the toolbox may have changed width.
  goog.events.listen(this.toolbox_.tree_,
      goog.ui.tree.BaseNode.EventType.EXPAND, resize);
  goog.events.listen(this.toolbox_.tree_,
      goog.ui.tree.BaseNode.EventType.COLLAPSE, resize);
};
goog.inherits(Blockly.Toolbox.TreeNode, goog.ui.tree.TreeNode);

/**
 * Do not show the +/- icon.
 * @return {string} The source for the icon.
 * @override
 */
Blockly.Toolbox.TreeNode.prototype.getExpandIconHtml = function() {
  return '<span></span>';
};

/**
 * Supress population of the +/- icon.
 * @return {null} Null.
 * @protected
 * @override
 */
Blockly.Toolbox.TreeNode.prototype.getExpandIconElement = function() {
  return null;
};

/**
 * Expand or collapse the node on mouse click.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @override
 */
Blockly.Toolbox.TreeNode.prototype.onMouseDown = function(e) {
  if (!this.toolbox_.enabled) {
    return;
  }
  // Expand icon.
  if (this.hasChildren() && this.isUserCollapsible_) {
    this.toggle();
    this.select();
  } else if (this.isSelected()) {
    this.getTree().setSelectedItem(null);
  } else {
    this.select();
  }
  this.updateRow();
};

/**
 * Supress the inherited double-click behaviour.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @override
 * @private
 */
Blockly.Toolbox.TreeNode.prototype.onDoubleClick_ = function(e) {
  // NOP.
};
