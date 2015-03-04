/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
/* global $ */
'use strict';

var markup = require('./NetSimPanel.html');

/**
 * Generator and controller for a NetSim Panel, a single section on the
 * page which may be collapsible.
 * @param {jQuery} rootDiv - Element within which the panel is recreated
 *        every time render() is called.  Will wipe out contents of this
 *        element, but not the element itself.
 * @param {string} className - An additional className to be appended to
 *        the panel's root (one layer inside rootDiv), for style rules.
 * @constructor
 */
var NetSimPanel = module.exports = function (rootDiv, className) {
  /**
   * Unique instance ID for this panel, in case we have several
   * of them on a page.
   * @type {number}
   * @private
   */
  this.instanceID_ = NetSimPanel.uniqueIDCounter;
  NetSimPanel.uniqueIDCounter++;

  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * An additional className to be appended to the panel's root (one layer
   * inside rootDiv), for style rules.
   * @type {string}
   * @private
   */
  this.className_ = className;

  /**
   * Whether the component is minimized, for consistent
   * state across re-renders.
   * @type {boolean}
   * @private
   */
  this.isMinimized_ = true;

  // Initial render
  this.render();
};

/**
 * Static counter used to generate/uniquely identify different instances
 * of this log widget on the page.
 * @type {number}
 */
NetSimPanel.uniqueIDCounter = 0;

/**
 * Rebuild the panel contents inside of the rootDiv
 */
NetSimPanel.prototype.render = function () {
  var newMarkup = $(markup({
    instanceID: this.instanceID_,
    className: this.className_,
    panelTitle: this.getPanelTitle()

  }));
  this.rootDiv_.html(newMarkup);

  this.rootDiv_.find('.minimizer').click(this.onMinimizerClick_.bind(this));

  this.setMinimized(this.isMinimized_);
};

/**
 * Override to set panel title.
 * @returns {string} Localized panel title string
 */
NetSimPanel.prototype.getPanelTitle = function () {
  return 'Panel';
};

/**
 * Toggle whether this panel is minimized.
 * @private
 */
NetSimPanel.prototype.onMinimizerClick_ = function () {
  this.setMinimized(!this.isMinimized_);
};

/**
 * @param {boolean} becomeMinimized
 */
NetSimPanel.prototype.setMinimized = function (becomeMinimized) {
  var panelDiv = this.rootDiv_.find('.netsim_panel');
  var minimizer = panelDiv.find('.minimizer');
  if (becomeMinimized) {
    panelDiv.addClass('minimized');
    minimizer.find('.fa')
        .addClass('fa-plus-square')
        .removeClass('fa-minus-square');
  } else {
    panelDiv.removeClass('minimized');
    minimizer.find('.fa')
        .addClass('fa-minus-square')
        .removeClass('fa-plus-square');
  }
  this.isMinimized_ = becomeMinimized;
};

/**
 * Add a button to the right end of the panel header.
 * @param {string} buttonText
 * @param {function} pressCallback
 */
NetSimPanel.prototype.addButton = function(buttonText, pressCallback) {
  $('<span>')
      .addClass('netsim_button')
      .html(buttonText)
      .click(pressCallback)
      .appendTo(this.rootDiv_.find('.panel_controls'));
};

/**
 * @returns {jQuery} the body Div of the panel, for panel content.
 */
NetSimPanel.prototype.getBody = function () {
  return this.rootDiv_.find('.panel_body');
};
