/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
/* global $ */

var applabMsg = require('./locale');
var dom = require('../dom');
var utils = require('../utils');

/**
 * Creates the debug area controller and configures it to operate on the given
 * elements.
 *
 * @param {HTMLDivElement} debugAreaRoot
 * @param {HTMLDivElement} codeTextboxRoot
 * @constructor
 */
var DebugArea = module.exports = function (debugAreaRoot, codeTextboxRoot) {
  if (!debugAreaRoot || !codeTextboxRoot) {
    throw new Error("debugAreaRoot and codeTextboxRoot are required");
  }

  /**
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = $(debugAreaRoot);

  /**
   * @type {jQuery}
   * @private
   */
  this.codeTextbox_ = $(codeTextboxRoot);

  /**
   * @type {boolean}
   * @private
   */
  this.isOpen_ = true;

  /**
   * @type {number}
   * @private
   */
  this.lastOpenHeight_ = this.rootDiv_.height();

  DebugArea.prototype.bindHandlersForDebugCommandsHeader.call(this);
};

/**
 * Binds mouseover, mouseout, click and touch handlers for the debug commands
 * header div.
 */
DebugArea.prototype.bindHandlersForDebugCommandsHeader = function () {
  var header = this.rootDiv_.find('#debug-commands-header');
  // Element may not exist (if in share mode)
  if (header.length === 0) {
    return;
  }
  header.mouseover(DebugArea.prototype.onCommandsHeaderOver.bind(this));
  header.mouseout(DebugArea.prototype.onCommandsHeaderOut.bind(this));
  dom.addClickTouchEvent(header[0], DebugArea.prototype.slideToggle.bind(this));
};

/**
 * We do this manually instead of via a simple css :hover because this element
 * can be animated out from under the cursor when sliding open and closed,
 * and the :hover effect isn't removed unless the mouse is moved.
 */
DebugArea.prototype.onCommandsHeaderOver = function () {
  this.rootDiv_.find('#debug-commands-header').addClass('js-hover-hack');
};

/**
 * We do this manually instead of via a simple css :hover because this element
 * can be animated out from under the cursor when sliding open and closed,
 * and the :hover effect isn't removed unless the mouse is moved.
 */
DebugArea.prototype.onCommandsHeaderOut = function () {
  this.rootDiv_.find('#debug-commands-header').removeClass('js-hover-hack');
};

/** @returns {boolean} */
DebugArea.prototype.isOpen = function () {
  return this.isOpen_;
};

/** @returns {boolean} */
DebugArea.prototype.isShut = function () {
  return !this.isOpen_;
};

/**
 * Open/close the debug area to the reverse of its current state, using no
 * animation.
 */
DebugArea.snapToggle = function () {
  if (this.isOpen_) {
    this.snapShut();
  } else {
    this.snapOpen();
  }
};

DebugArea.prototype.snapOpen = function () {
  this.isOpen_ = true;
  this.setContentsVisible(true);
  this.setIconPointingDown(true);
  this.setHeight(this.lastOpenHeight_);

  // Set the 'clear' button visible
  this.rootDiv_.find('#clear-console-header')
      .css('opacity', 1)
      .css('visibility', 'visible');
};

DebugArea.prototype.snapShut = function () {
  this.isOpen_ = false;
  this.lastOpenHeight_ = this.rootDiv_.height();
  this.setContentsVisible(false);
  this.setIconPointingDown(false);
  this.setHeight(this.getHeightWhenClosed());

  // Set the 'clear' button hidden (not display:none, it should take up space)
  this.rootDiv_.find('#clear-console-header')
      .css('opacity', 0)
      .css('visibility', 'hidden');
};

/**
 * Open/close the debug area to the reverse of its current state, using a
 * slide animation.
 */
DebugArea.prototype.slideToggle = function () {
  if (this.isOpen_) {
    this.slideShut();
  } else {
    this.slideOpen();
  }
};

DebugArea.prototype.slideOpen = function () {
  this.isOpen_ = true;
  this.setContentsVisible(true);

  // Manually remove hover effect at start and end of animation to get *close*
  // to the correct effect.
  this.onCommandsHeaderOut();
  this.rootDiv_.animate({
    height: this.lastOpenHeight_
  },{
    complete: function () {
      this.setIconPointingDown(true);
      this.onCommandsHeaderOut();
    }.bind(this)
  });

  // Animate the bottom of the workspace at the same time
  this.codeTextbox_.animate({
    bottom: this.lastOpenHeight_
  },{
    step: utils.fireResizeEvent
  });

  // Animate the 'clear' button appearing at the same time
  var clearButton = this.rootDiv_.find('#clear-console-header');
  clearButton.css('visibility', 'visible');
  clearButton.animate({
    opacity: 1.0
  });
};

DebugArea.prototype.slideShut = function () {
  this.isOpen_ = false;
  this.lastOpenHeight_ = this.rootDiv_.height();

  // We will leave the header and resize bar visible, so together they
  // constitute our height when closed.
  var closedHeight = this.getHeightWhenClosed();
  // Manually remove hover effect at start and end of animation to get *close*
  // to the correct effect.
  this.onCommandsHeaderOut();
  this.rootDiv_.animate({
    height: closedHeight
  },{
    complete: function () {
      this.setContentsVisible(false);
      this.setIconPointingDown(false);
      this.onCommandsHeaderOut();
    }.bind(this)
  });

  // Animate the bottom of the workspace at the same time
  this.codeTextbox_.animate({
    bottom: closedHeight
  },{
    step: utils.fireResizeEvent
  });

  // Animate the 'clear' button vanishing at the same time
  var clearButton = this.rootDiv_.find('#clear-console-header');
  clearButton.animate({
    opacity: 0.0
  },{
    complete: function () {
      clearButton.css('visibility', 'hidden');
    }
  });
};

DebugArea.prototype.setContentsVisible = function (isVisible) {
  this.rootDiv_.find('#debug-commands').toggle(isVisible);
  this.rootDiv_.find('#debug-console').toggle(isVisible);
};

DebugArea.prototype.setIconPointingDown = function (isPointingDown) {
  var commandsHeader = this.rootDiv_.find('#debug-commands-header');

  var icon = commandsHeader.find('#show-hide-debug-icon');
  icon.toggleClass('fa-chevron-circle-up', !isPointingDown);
  icon.toggleClass('fa-chevron-circle-down', isPointingDown);

  var headerText = commandsHeader.find('.header-text');
  headerText.text(isPointingDown ? applabMsg.debugCommandsHeaderWhenOpen() :
      applabMsg.debugCommandsHeaderWhenClosed());

};

DebugArea.prototype.setHeight = function (newHeightInPixels) {
  this.rootDiv_.height(newHeightInPixels);
  this.codeTextbox_.css('bottom', newHeightInPixels);
  utils.fireResizeEvent();
};

DebugArea.prototype.getHeightWhenClosed = function () {
  return this.rootDiv_.find('#debug-area-header').height() +
      this.rootDiv_.find('#debugResizeBar').height();
};
