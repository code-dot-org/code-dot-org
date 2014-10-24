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
 * @fileoverview Object representing a mutator dialog.  A mutator allows the
 * user to change the shape of a block using a nested blocks editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Mutator');

goog.require('Blockly.Bubble');
goog.require('Blockly.Icon');


/**
 * Class for a mutator dialog.
 * @param {!Array.<string>} quarkNames List of names of sub-blocks for flyout.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Mutator = function(quarkNames) {
  Blockly.Mutator.superClass_.constructor.call(this, null);
  this.quarkXml_ = [];
  // Convert the list of names into a list of XML objects for the flyout.
  for (var x = 0; x < quarkNames.length; x++) {
    var element = goog.dom.createDom('block', {'type': quarkNames[x]});
    this.quarkXml_[x] = element;
  }
};
goog.inherits(Blockly.Mutator, Blockly.Icon);

/**
 * Width of blockSpace.
 * @private
 */
Blockly.Mutator.prototype.blockSpaceWidth_ = 0;

/**
 * Height of blockSpace.
 * @private
 */
Blockly.Mutator.prototype.blockSpaceHeight_ = 0;

/**
 * Create the icon on the block.
 */
Blockly.Mutator.prototype.createIcon = function() {
  Blockly.Icon.prototype.createIcon_.call(this);
  /* Here's the markup that will be generated:
  <rect class="blocklyIconShield" width="16" height="16" rx="4" ry="4"/>
  <text class="blocklyIconMark" x="8" y="12">★</text>
  */
  var quantum = Blockly.Icon.RADIUS / 2;
  var iconShield = Blockly.createSvgElement('rect',
      {'class': 'blocklyIconShield',
       'width': 4 * quantum,
       'height': 4 * quantum,
       'rx': quantum,
       'ry': quantum}, this.iconGroup_);
  this.iconMark_ = Blockly.createSvgElement('text',
      {'class': 'blocklyIconMark',
       'x': Blockly.Icon.RADIUS,
       'y': 2 * Blockly.Icon.RADIUS - 4}, this.iconGroup_);
  this.iconMark_.appendChild(document.createTextNode('\u2605'));
};

/**
 * Create the editor for the mutator's bubble.
 * @return {!Element} The top-level node of the editor.
 * @private
 */
Blockly.Mutator.prototype.createEditor_ = function() {
  /* Create the editor.  Here's the markup that will be generated:
  <svg>
    <rect class="blocklyMutatorBackground" />
    [Flyout]
    [BlockSpace]
  </svg>
  */
  this.svgDialog_ = Blockly.createSvgElement('svg',
      {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
      null);
  this.svgBackground_ = Blockly.createSvgElement('rect',
      {'class': 'blocklyMutatorBackground',
       'height': '100%', 'width': '100%'}, this.svgDialog_);

  var mutator = this;
  var blockSpaceEditor = this.block_.blockSpace.blockSpaceEditor;
  this.blockSpace_ = new Blockly.BlockSpace(blockSpaceEditor,
      function() {return mutator.getFlyoutMetrics_();}, null);
  this.flyout_ = new Blockly.Flyout(blockSpaceEditor);
  this.flyout_.autoClose = false;
  this.svgDialog_.appendChild(this.flyout_.createDom());
  this.svgDialog_.appendChild(this.blockSpace_.createDom());
  return this.svgDialog_;
};

/**
 * Callback function triggered when the bubble has resized.
 * Resize the blockSpace accordingly.
 * @private
 */
Blockly.Mutator.prototype.resizeBubble_ = function() {
  var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
  var blockSpaceSize = this.blockSpace_.getCanvas().getBBox();
  var flyoutMetrics = this.flyout_.getMetrics_();
  var width;
  if (Blockly.RTL) {
    width = -blockSpaceSize.x;
  } else {
    width = blockSpaceSize.width + blockSpaceSize.x;
  }
  var height = Math.max(blockSpaceSize.height + doubleBorderWidth * 3,
                        flyoutMetrics.contentHeight + 20);
  width += doubleBorderWidth * 3;
  // Only resize if the size difference is significant.  Eliminates shuddering.
  if (Math.abs(this.blockSpaceWidth_ - width) > doubleBorderWidth ||
      Math.abs(this.blockSpaceHeight_ - height) > doubleBorderWidth) {
    // Record some layout information for getFlyoutMetrics_.
    this.blockSpaceWidth_ = width;
    this.blockSpaceHeight_ = height;
    // Resize the bubble.
    this.bubble_.setBubbleSize(width + doubleBorderWidth,
                               height + doubleBorderWidth);
    this.svgDialog_.setAttribute('width', this.blockSpaceWidth_);
    this.svgDialog_.setAttribute('height', this.blockSpaceHeight_);
  }

  if (Blockly.RTL) {
    // Scroll the blockSpace to always left-align.
    var translation = 'translate(' + this.blockSpaceWidth_ + ',0)';
    this.blockSpace_.getCanvas().setAttribute('transform', translation);
  }
};

/**
 * Show or hide the mutator bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
Blockly.Mutator.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    // No change.
    return;
  }
  if (visible) {
    // Create the bubble.
    this.bubble_ = new Blockly.Bubble(this.block_.blockSpace,
        this.createEditor_(), this.block_.svg_.svgGroup_,
        this.iconX_, this.iconY_, null, null);
    var thisObj = this;
    this.flyout_.init(this.blockSpace_, false);
    this.flyout_.show(this.quarkXml_);

    this.rootBlock_ = this.block_.decompose(this.blockSpace_);
    var blocks = this.rootBlock_.getDescendants();
    for (var i = 0, child; child = blocks[i]; i++) {
      child.render();
    }
    // The root block should not be dragable or deletable.
    this.rootBlock_.setMovable(false);
    this.rootBlock_.setDeletable(false);
    var margin = this.flyout_.CORNER_RADIUS * 2;
    var x = this.flyout_.width_ + margin;
    if (Blockly.RTL) {
      x = -x;
    }
    this.rootBlock_.moveBy(x, margin);
    // Save the initial connections, then listen for further changes.
    if (this.block_.saveConnections) {
      this.block_.saveConnections(this.rootBlock_);
      this.sourceListener_ = Blockly.bindEvent_(
          this.block_.blockSpace.getCanvas(),
          'blocklyBlockSpaceChange', this.block_,
          function() {thisObj.block_.saveConnections(thisObj.rootBlock_)});
    }
    this.resizeBubble_();
    // When the mutator's blockSpace changes, update the source block.
    Blockly.bindEvent_(this.blockSpace_.getCanvas(), 'blocklyBlockSpaceChange',
        this.block_, function() {thisObj.blockSpaceChanged_();});
    this.updateColour();
  } else {
    // Dispose of the bubble.
    this.svgDialog_ = null;
    this.svgBackground_ = null;
    this.flyout_.dispose();
    this.flyout_ = null;
    this.blockSpace_.dispose();
    this.blockSpace_ = null;
    this.rootBlock_ = null;
    this.bubble_.dispose();
    this.bubble_ = null;
    this.blockSpaceWidth_ = 0;
    this.blockSpaceHeight_ = 0;
    if (this.sourceListener_) {
      Blockly.unbindEvent_(this.sourceListener_);
      this.sourceListener_ = null;
    }
  }
};

/**
 * Update the source block when the mutator's blocks are changed.
 * Delete or bump any block that's out of bounds.
 * Fired whenever a change is made to the mutator's blockSpace.
 * @private
 */
Blockly.Mutator.prototype.blockSpaceChanged_ = function() {
  // When dragging a function block to the trash by it's icon, we would end up
  // calling this with no blockSpace and throwing an exception.
  if (!this.blockSpace_) {
    return;
  }
  if (!Blockly.Block.isDragging()) {
    var blocks = this.blockSpace_.getTopBlocks(false);
    var MARGIN = 20;
    for (var b = 0, block; block = blocks[b]; b++) {
      var blockXY = block.getRelativeToSurfaceXY();
      var blockHW = block.getHeightWidth();
      if (Blockly.RTL ? blockXY.x > -this.flyout_.width_ + MARGIN :
           blockXY.x < this.flyout_.width_ - MARGIN) {
        // Delete any block that's sitting on top of the flyout.
        block.dispose(false, true);
      } else if (blockXY.y + blockHW.height < MARGIN) {
        // Bump any block that's above the top back inside.
        block.moveBy(0, MARGIN - blockHW.height - blockXY.y);
      }
    }
  }

  // When the mutator's blockSpace changes, update the source block.
  if (this.rootBlock_.blockSpace == this.blockSpace_) {
    // Switch off rendering while the source block is rebuilt.
    var savedRendered = this.block_.rendered;
    this.block_.rendered = false;
    // Allow the source block to rebuild itself.
    this.block_.compose(this.rootBlock_);
    // Restore rendering and show the changes.
    this.block_.rendered = savedRendered;
    if (this.block_.rendered) {
      this.block_.render();
    }
    this.resizeBubble_();
    // The source block may have changed, notify its blockSpace.
    this.block_.blockSpace.fireChangeEvent();
  }
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * mutator flyout.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {!Object} Contains size and position metrics of mutator dialog's
 *     blockSpace.
 * @private
 */
Blockly.Mutator.prototype.getFlyoutMetrics_ = function() {
  var left = 0;
  if (Blockly.RTL) {
    left += this.blockSpaceWidth_;
  }
  return {
    viewHeight: this.blockSpaceHeight_,
    viewWidth: 0,  // This seem wrong, but results in correct RTL layout.
    absoluteTop: 0,
    absoluteLeft: left
  };
};

/**
 * Dispose of this mutator.
 */
Blockly.Mutator.prototype.dispose = function() {
  this.block_.mutator = null;
  Blockly.Icon.prototype.dispose.call(this);
};
