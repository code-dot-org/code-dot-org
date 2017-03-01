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
/* global define, module */ // Be AMD and CommonJS-friendly without bothering linter.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.setTabStatusIcon = factory();
  }
}(this, function () {
  var GRAY = '#aaa';
  var BLUE = '#3A84CB';
  var GREEN = '#7FBA00';
  var RED = '#C40000';
  var DEFAULT_COLOR = GRAY;
  var STATUS_COLORS = {
    'fail': RED,
    'in-progress': BLUE,
    'not-started': GRAY,
    'pass': GREEN
  };
  var STATUS_ICONS = {
    'fail': drawX,
    'pass': drawCheckmark
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
   * @param {string} [typeOrColor] Any valid HTML color string, or a
   *   status string ('pass', 'fail', 'in-progress', 'not-started').
   *   Defaults to gray (not started).
   */
  function makeStatusIcon(typeOrColor) {
    if (typeof typeOrColor !== 'string') {
      typeOrColor = DEFAULT_COLOR;
    }
    var color = STATUS_COLORS.hasOwnProperty(typeOrColor) ? STATUS_COLORS[typeOrColor] : typeOrColor;

    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    var ctx = canvas.getContext('2d');

    drawBackground(ctx, color);
    if (STATUS_ICONS.hasOwnProperty(typeOrColor)) {
      STATUS_ICONS[typeOrColor](ctx, color);
    } else {
      drawHighlight(ctx);
    }

    return canvas.toDataURL();
  }

  /**
   * Draw a bordered circular background in the given color
   * @param ctx
   * @param color
   */
  function drawBackground(ctx, color) {
    // Border
    ctx.beginPath();
    ctx.ellipse(16, 16, 16, 16, 0, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(16, 16, 14, 14, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Fill
    ctx.beginPath();
    ctx.ellipse(16, 16, 13, 13, 0, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }

  /**
   * Draw a checkmark (success) icon
   * @param ctx
   * @param color
   */
  function drawCheckmark(ctx, color) {
    ctx.beginPath();
    ctx.moveTo(8, 16);
    ctx.lineTo(15, 19);
    ctx.lineTo(29, 6);
    ctx.lineTo(30, 7);
    ctx.lineTo(15, 24);
    ctx.lineTo(7, 17);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  function drawX(ctx, color) {
    ctx.beginPath();
    ctx.moveTo(6, 7);
    ctx.lineTo(11, 7);
    ctx.lineTo(17, 15);
    ctx.lineTo(23, 7);
    ctx.lineTo(28, 7);
    ctx.lineTo(18, 16);
    ctx.lineTo(28, 25);
    ctx.lineTo(23, 25);
    ctx.lineTo(17, 17);
    ctx.lineTo(11, 25);
    ctx.lineTo(6, 25);
    ctx.lineTo(16, 16);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  /**
   * Draw a "specular highlight."
   * Used as a default if we don't know what icon to draw.
   * @param ctx
   */
  function drawHighlight(ctx) {
    ctx.beginPath();
    ctx.ellipse(22, 10, 4, 4, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  /**
   * Changes the icon in your browser tab (replacing the favicon)
   * to a dynamically-generated status icon of the given color
   * and progress info.
   * @param {string} [typeOrColor] Any valid HTML color string, or a
   *   status string ('pass', 'fail', 'in-progress', 'not-started').
   *   Defaults to gray (not started).
   */
  return function setTabStatusIcon(typeOrColor) {
    setStatusIcon(makeStatusIcon(typeOrColor));
  };
}));

