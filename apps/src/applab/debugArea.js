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

var utils = require('../utils');

var debugArea = module.exports;

/** @type {jQuery} */
var rootDiv_ = null;

/** @type {jQuery} */
var codeTextbox_ = null;

/** @type {boolean} */
var isOpen_ = true;

/** @type {number} */
var lastOpenHeight_ = 100;

/**
 * Configures this debug area controller to operate on the given elements.
 * @param {HTMLDivElement} debugAreaRoot
 * @param {HTMLDivElement} codeTextboxRoot
 */
debugArea.init = function (debugAreaRoot, codeTextboxRoot) {
  if (!debugAreaRoot || !codeTextboxRoot) {
    return;
  }

  rootDiv_ = $(debugAreaRoot);
  codeTextbox_ = $(codeTextboxRoot);
  lastOpenHeight_ = rootDiv_.height;
};

/** @returns {boolean} */
debugArea.isOpen = function () {
  return isOpen_;
};

/** @returns {boolean} */
debugArea.isShut = function () {
  return !isOpen_;
};

/**
 * Open/close the debug area to the reverse of its current state, using no
 * animation.
 */
debugArea.snapToggle = function () {
  if (isOpen_) {
    debugArea.snapShut();
  } else {
    debugArea.snapOpen();
  }
};

debugArea.snapOpen = function () {
  isOpen_ = true;
  setContentsVisible(true);
  setIconPointingDown(true);
  setHeight(lastOpenHeight_);
};

debugArea.snapShut = function () {
  isOpen_ = false;
  lastOpenHeight_ = rootDiv_.height();
  setContentsVisible(false);
  setIconPointingDown(false);
  setHeight(getHeightWhenClosed());
};

/**
 * Open/close the debug area to the reverse of its current state, using a
 * slide animation.
 */
debugArea.slideToggle = function () {
  if (isOpen_) {
    debugArea.slideShut();
  } else {
    debugArea.slideOpen();
  }
};

debugArea.slideOpen = function () {
  isOpen_ = true;
  setContentsVisible(true);

  rootDiv_.animate({
    height: lastOpenHeight_
  },{
    complete: setIconPointingDown.bind(this, true)
  });

  // Animate the bottom of the workspace at the same time
  var codeTextbox = $('#codeTextbox');
  codeTextbox.animate({
    bottom: lastOpenHeight_
  },{
    step: utils.fireResizeEvent
  });
};

debugArea.slideShut = function () {
  isOpen_ = false;
  lastOpenHeight_ = rootDiv_.height();

  // We will leave the header and resize bar visible, so together they
  // constitute our height when closed.
  var closedHeight = getHeightWhenClosed();
  rootDiv_.animate({
    height: closedHeight
  },{
    complete: function () {
      setContentsVisible(false);
      setIconPointingDown(false);
    }
  });

  // Animate the bottom of the workspace at the same time
  codeTextbox_.animate({
    bottom: closedHeight
  },{
    step: utils.fireResizeEvent
  });
};

function setContentsVisible(isVisible) {
  rootDiv_.find('#debug-commands').toggle(isVisible);
  rootDiv_.find('#debug-console').toggle(isVisible);
}

function setIconPointingDown(isPointingDown) {
  var icon = rootDiv_.find('#show-hide-debug-icon');
  icon.toggleClass('fa-chevron-circle-up', !isPointingDown);
  icon.toggleClass('fa-chevron-circle-down', isPointingDown);
}

function setHeight(newHeightInPixels) {
  rootDiv_.height(newHeightInPixels);
  codeTextbox_.css('bottom', newHeightInPixels);
  utils.fireResizeEvent();
}

function getHeightWhenClosed() {
  return rootDiv_.find('#debug-area-header').height() +
      rootDiv_.find('#debugResizeBar').height();
}
