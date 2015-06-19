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

/**
 * @type {boolean}
 */
var isOpen_ = true;

/**
 * @type {number}
 * @private
 */
var lastOpenHeight_ = 100;

exports.isOpen = function () {
  return isOpen_;
};

exports.isShut = function () {
  return !isOpen_;
};

/**
 * Open/close the debug area to the reverse of its current state, using no
 * animation.
 */
exports.snapToggle = function () {
  if (isOpen_) {
    exports.snapShut();
  } else {
    exports.snapOpen();
  }
};

exports.snapOpen = function () {
  isOpen_ = true;
  setContentsVisible(true);
  setIconPointingDown(true);
  utils.fireResizeEvent();
};

exports.snapShut = function () {
  isOpen_ = false;
  lastOpenHeight_ = $('#debug-area').height();
  setContentsVisible(false);
  setIconPointingDown(false);
  utils.fireResizeEvent();
};

/**
 * Open/close the debug area to the reverse of its current state, using a
 * slide animation.
 */
exports.slideToggle = function () {
  if (isOpen_) {
    exports.slideShut();
  } else {
    exports.slideOpen();
  }
};

exports.slideOpen = function () {
  isOpen_ = true;
  setContentsVisible(true);


  var debugArea = $('#debug-area');
  debugArea.animate({
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

exports.slideShut = function () {
  isOpen_ = false;
  lastOpenHeight_ = $('#debug-area').height();

  var debugArea = $('#debug-area');

  // We will leave the header and resize bar visible, so together they
  // constitute our height when closed.
  var closedHeight = debugArea.find('#debug-area-header').height() +
      debugArea.find('#debugResizeBar').height();
  debugArea.animate({
    height: closedHeight
  },{
    complete: function () {
      setContentsVisible(false);
      setIconPointingDown(false);
    }
  });

  // Animate the bottom of the workspace at the same time
  var codeTextbox = $('#codeTextbox');
  codeTextbox.animate({
    bottom: closedHeight
  },{
    step: utils.fireResizeEvent
  });
};

function setContentsVisible(isVisible) {
  $('#debug-commands').toggle(isVisible);
  $('#debug-console').toggle(isVisible);
}

function setIconPointingDown(isPointingDown) {
  var debugArea = $('#debug-area');
  var icon = debugArea.find('#show-hide-debug-icon');
  icon.toggleClass('fa-chevron-circle-up', !isPointingDown);
  icon.toggleClass('fa-chevron-circle-down', isPointingDown);
}
