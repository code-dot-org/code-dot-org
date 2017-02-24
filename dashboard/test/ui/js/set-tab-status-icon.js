/**
 * @file Dynamic status icon generator
 * @author Brad Buchanan <bradley.c.buchanan@gmail.com>
 *
 * Loosely based on https://gist.github.com/mathiasbynens/428626
 *
 * @example
 *   // Set tab icon to green for passing
 *   setTabStatusIcon('pass');
 *
 *   // Set tab icon to a custom color
 *   setTabStatusIcon('#62a938');
 */
/* global define */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.setTabStatusIcon = factory();
  }
}(this, function () {
  var BLUE = '#427cca';
  var GRAY = '#aaa';
  var GREEN = '#62a938';
  var RED = '#e00';
  var DEFAULT_COLOR = GRAY;
  var STATUSES = {
    'fail': RED,
    'in-progress': BLUE,
    'not-started': GRAY,
    'pass': GREEN,
  };

  var LINK_ELEMENT_ID = 'tab-status-icon-link';

  /**
   * Replace the favicon reference in the document head with a new one.
   */
  function setStatusIcon(imageUrl) {
    var head = document.getElementsByTagName('head')[0];

    var oldLink = document.getElementById(LINK_ELEMENT_ID);
    if (oldLink) {
      head.removeChild(oldLink);
    }

    var newLink = document.createElement('link');
    newLink.id = LINK_ELEMENT_ID;
    newLink.rel = 'shortcut icon';
    newLink.href = imageUrl;
    head.appendChild(newLink);
  }

  /**
   * Generates a PNG dataURL for a status icon displaying the
   * given color and progress.
   * @param {string} color Any valid HTML color string.
   */
  function makeStatusIcon(color) {
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    var ctx = canvas.getContext('2d');

    // Pie slice of progress size.
    ctx.beginPath();
    ctx.ellipse(16, 16, 15, 15, 0, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // White highlight
    ctx.beginPath();
    ctx.ellipse(22, 10, 4, 4, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();

    return canvas.toDataURL();
  }

  /**
   * Changes the icon in your browser tab (replacing the favicon)
   * to a dynamically-generated status icon of the given color
   * and progress info.
   * @param {string} [color] Any valid HTML color string, or a
   *   status string ('pass', 'fail', 'in-progress', 'not-started').
   *   Defaults to gray (not started).
   */
  return function setTabStatusIcon(color) {
    color = typeof color !== 'string' ? DEFAULT_COLOR :
      STATUSES.hasOwnProperty(color) ? STATUSES[color] : color;
    setStatusIcon(makeStatusIcon(color));
  };
}));

