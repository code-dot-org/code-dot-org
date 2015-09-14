/**
 * @fileoverview Extension of BlockSvg that allows for some settings specific
 * to functional blocks, including having a header row and input markers
 */
'use strict';

goog.provide('Blockly.BlockSvgFunctional');

/**
 * Render this block with a header row that has a different color.
 */
Blockly.BlockSvgFunctional = function (block, options) {
  options = options || {};
  this.headerHeight = options.headerHeight || 0;
  this.rowBuffer = options.rowBuffer || 0;
  this.patternId_ = null; // updated when we set colour
  this.inputMarkers_ = {};
  this.inputClickTargets_ = {};
  /**
   * Input names to forced width spacing amount
   * @type {{string, number}}
   */
  this.forcedInputSpacings = {};

  Blockly.BlockSvg.call(this, block);
};
goog.inherits(Blockly.BlockSvgFunctional, Blockly.BlockSvg);

Blockly.BlockSvgFunctional.prototype.initChildren = function () {
  var rgb = Blockly.makeColour(this.block_.getColour(),
    this.block_.getSaturation(), this.block_.getValue());
  var lightColor = goog.color.lighten(goog.color.hexToRgb(rgb), 0.3);
  var lighterColor = goog.color.lighten(goog.color.hexToRgb(rgb), 0.8);

  Blockly.BlockSvgFunctional.superClass_.initChildren.call(this);

  var clip = Blockly.createSvgElement('clipPath', {
    id: 'blockClip' + this.block_.id
  }, this.svgGroup_);
  this.blockClipRect_ = Blockly.createSvgElement('path', {}, clip);
  this.divider_ = Blockly.createSvgElement('rect', {
    x: 1,
    y: this.headerHeight,
    height: 3,
    width: 0,
    fill: goog.color.rgbArrayToHex(lightColor),
    'clip-path': 'url(#blockClip' + this.block_.id + ')',
    visibility: this.headerHeight > 0 ? 'visible' : 'hidden'
  }, this.svgGroup_);
  this.createFunctionalMarkers_();
};

Blockly.BlockSvgFunctional.prototype.renderDraw_ = function(iconWidth, inputRows) {
  this.createFunctionalMarkers_();
  Blockly.BlockSvgFunctional.superClass_.renderDraw_.call(this, iconWidth, inputRows);

  this.blockClipRect_.setAttribute('d', this.svgPath_.getAttribute('d'));

  try {
    var rect = this.svgPath_.getBBox();
    this.divider_.setAttribute('width', Math.max(0, rect.width - 2));
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    return;
  }
};

/**
 * Ensures functional markers exist for each input
 * @private
 */
Blockly.BlockSvgFunctional.prototype.createFunctionalMarkers_ = function () {
  var functionalMarkers = [];
  for (var i = 0; i < this.block_.inputList.length; i++) {
    var input = this.block_.inputList[i];
    functionalMarkers.push(input.name);
    if (this.inputMarkers_[input.name]) {
      continue;
    }
    if (input.type !== Blockly.FUNCTIONAL_INPUT) {
      continue;
    }
    this.inputMarkers_[input.name] = Blockly.createSvgElement('rect', {
      fill: 'white'
    }, this.svgGroup_);

    // Create a click target, that will end up having the same path as the input
    // Set opacity to 0 so that we can see marker through it.
    // Set class so that click handler knows not to select parent.
    this.inputClickTargets_[input.name] = Blockly.createSvgElement('path', {
      fill: 'white',
      opacity: '0',
      'class': 'inputClickTarget'
    }, this.svgGroup_);

    if (!this.block_.blockSpace.isFlyout) {
      this.addInputClickListener_(input.name);
    }
  }

  // Remove input markers that disappeared
  Object.keys(this.inputMarkers_).forEach(function (markerName) {
    if (functionalMarkers.indexOf(markerName) === -1) {
      var element = this.inputMarkers_[markerName];
      element.parentNode.removeChild(element);
      delete this.inputMarkers_[markerName];

      var element = this.inputClickTargets_[markerName];
      element.parentNode.removeChild(element);
      delete this.inputMarkers_[markerName];
    }
  }, this);

};

/**
 * Add a click listener to the marker for the given input, which will add a
 * child block on click if it's a number or string
 * @param {string} inputName
 */
Blockly.BlockSvgFunctional.prototype.addInputClickListener_ = function (inputName) {
  var blockSpace = this.block_.blockSpace;
  var parentBlock = this.block_;
  Blockly.bindEvent_(this.inputClickTargets_[inputName], 'mousedown', this, function (e) {
    if (Blockly.isRightButton(e)) {
      // Right-click.
      return;
    }
    var childType;
    var titleIndex;
    var input = parentBlock.getInput(inputName);
    if (input.connection.acceptsAnyType()) {
      return;
    }
    if (input.connection.acceptsType('Number')) {
      childType = 'functional_math_number';
      titleIndex = 0;
    } else if (input.connection.acceptsType('String')) {
      childType = 'functional_string';
      titleIndex = 1;
    } else {
      return;
    }

    var block = new Blockly.Block(blockSpace, childType);
    block.initSvg();
    input.connection.connect(block.previousConnection);

    var titles = block.getTitles();
    for (var i = 0; i < titles.length; i++) {
      if (titles[i] instanceof Blockly.FieldTextInput) {
        titles[i].showEditor_();
      }
    }
    block.render();
  });
};

Blockly.BlockSvgFunctional.prototype.renderDrawRight_ = function(renderInfo,
    connectionsXY, inputRows, iconWidth) {

  // add a little bit of extra buffer space on top so that our notch doesn't
  // cut into our titles
  if (this.rowBuffer) {
    renderInfo.core.push('v', this.rowBuffer);
    renderInfo.curY += this.rowBuffer;
  }

  Blockly.BlockSvgFunctional.superClass_.renderDrawRight_.call(this, renderInfo, connectionsXY, inputRows, iconWidth);

};

/**
 * Render a function input that is inlined
 * @param {!Object} renderInfo Current state of our paths
 * @param {!Object} input The input to render
 * @param {!Object} connectionsXY Location of block.
 * @private
 */
Blockly.BlockSvgFunctional.prototype.renderDrawRightInlineFunctional_ =
    function(renderInfo, input, connectionsXY) {
  // todo (brent) - RTL
  var inputTopLeft = {
    x: renderInfo.curX,
    y: renderInfo.curY + BS.INLINE_PADDING_Y
  };

  var notchStart = BS.NOTCH_WIDTH - BS.NOTCH_PATH_WIDTH;
  var notchPaths = input.connection.getNotchPaths();

  var inputSteps = [];

  var forcedInputSpacing = this.forcedInputSpacings[input.name];
  var inputWidthToTakeUp = forcedInputSpacing || input.renderWidth;

  inputSteps.push('M', inputTopLeft.x + ',' + inputTopLeft.y);
  inputSteps.push('h', notchStart);
  inputSteps.push(notchPaths.left);
  inputSteps.push('H', inputTopLeft.x + input.renderWidth);
  inputSteps.push('v', input.renderHeight);
  inputSteps.push('H', inputTopLeft.x);
  inputSteps.push('z');

  renderInfo.inline = renderInfo.inline.concat(inputSteps);

  this.inputClickTargets_[input.name].setAttribute('d', inputSteps.join(' '));

  this.inputMarkers_[input.name].setAttribute('x', inputTopLeft.x + 5);
  this.inputMarkers_[input.name].setAttribute('y', inputTopLeft.y + 15);
  this.inputMarkers_[input.name].setAttribute('width', input.renderWidth - 10);
  this.inputMarkers_[input.name].setAttribute('height', 5);
  this.inputMarkers_[input.name].setAttribute('fill', input.getHexColour());

  // hide inputs that have targets, so that the rectangle doesn't show up when
  // dragging
  this.inputMarkers_[input.name].setAttribute('visibility',
    input.connection.targetConnection ? 'hidden' : 'visible');
  this.inputClickTargets_[input.name].setAttribute('visibility',
    input.connection.targetConnection ? 'hidden' : 'visible');

  renderInfo.curX += this.inputWidthToOccupy_(input) + BS.SEP_SPACE_X;

  // Create inline input connection.
  var connectionX = connectionsXY.x + inputTopLeft.x + BS.NOTCH_WIDTH;
  var connectionY = connectionsXY.y + inputTopLeft.y;

  input.connection.moveTo(connectionX, connectionY);
  if (input.connection.targetConnection) {
    input.connection.tighten_();
  }
};

Blockly.BlockSvgFunctional.prototype.updateToColour_ = function(hexColour) {
  Blockly.BlockSvgFunctional.superClass_.updateToColour_.call(this, hexColour);

  if (!this.divider_) {
    return;
  }

  // The block's color and the hexColour passed in here get out of sync if
  // the block is grayed out (hexColour is gray, block color remains unchanged)
  // Base our divider colour off of the rendered color (which is hexColour)
  var lightColor = goog.color.lighten(goog.color.hexToRgb(hexColour), 0.3);
  this.divider_.setAttribute('fill', goog.color.rgbArrayToHex(lightColor));
};

Blockly.BlockSvgFunctional.prototype.dispose = function () {
  Blockly.BlockSvgFunctional.superClass_.dispose.call(this);

  this.blockClipRect_ = null;
  this.divider_ = null;
};
