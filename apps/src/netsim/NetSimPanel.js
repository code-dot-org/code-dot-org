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

var utils = require('../utils');
var markup = require('./NetSimPanel.html');

/**
 * Generator and controller for a NetSim Panel, a single section on the
 * page which may be collapsible.
 * @param {jQuery} rootDiv - Element within which the panel is recreated
 *        every time render() is called.  Will wipe out contents of this
 *        element, but not the element itself.
 * @param {Object} [options]
 * @param {string} [options.className] - an additional class to be appended to
 *        the panel's root (one layer inside rootDiv) for style rules.
 *        Defaults to no class, so only the 'netsim-panel' class will be used.
 * @param {string} [options.panelTitle] - Localized initial panel title.
 *        Defaults to empty string.
 * @param {boolean} [options.canMinimize] - Whether this panel can be minimized
 *        (closed) by clicking on the title. Defaults to TRUE.
 * @param {boolean} [options.beginMinimized] - Whether this panel should be
 *        minimized (closed) when it is initially created.  Defaults to FALSE.
 * @param {function} [options.expandCollapseCallback] - Method to call whenever
 *        the panel is expanded or collapsed.
 * @constructor
 */
var NetSimPanel = module.exports = function (rootDiv, options) {
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
  this.className_ = utils.valueOr(options.className, '');

  /**
   * Panel title, displayed in header.
   * @type {string}
   * @private
   */
  this.panelTitle_ = utils.valueOr(options.panelTitle, '');

  /**
   * Whether this panel can be minimized (closed) by clicking on the title.
   * @type {boolean}
   * @private
   */
  this.canMinimize_ = utils.valueOr(options.canMinimize, true);

  /**
   * Whether the component is minimized, for consistent
   * state across re-renders.
   * @type {boolean}
   * @private
   */
  this.isMinimized_ = utils.valueOr(options.beginMinimized, false);

  /**
   * Function to call whenever this panel is expanded or collapsed.
   * @type {function}
   * @private
   */
  this.expandCollapseCallback_ = utils.valueOr(options.expandCollapseCallback,
      function () {});

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
    panelTitle: this.panelTitle_,
    canMinimize: this.canMinimize_

  }));
  this.rootDiv_.html(newMarkup);

  if (this.canMinimize_) {
    this.rootDiv_.find('.minimizer').click(this.onMinimizerClick_.bind(this));
    this.setMinimized(this.isMinimized_);
  } else {
    this.setMinimized(false);
  }
};

/**
 * Set panel title.
 * @param {string} newTitle - Localized panel title.
 */
NetSimPanel.prototype.setPanelTitle = function (newTitle) {
  this.panelTitle_ = newTitle;
  this.rootDiv_.find('.title-text').text(newTitle);
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
  var panelDiv = this.rootDiv_.find('.netsim-panel');
  var minimizer = panelDiv.find('.minimizer');
  if (becomeMinimized) {
    this.rootDiv_.addClass('shrink-to-content');
    panelDiv.addClass('minimized');
    minimizer.find('.fa')
        .addClass('fa-plus-square')
        .removeClass('fa-minus-square');
  } else {
    this.rootDiv_.removeClass('shrink-to-content');
    panelDiv.removeClass('minimized');
    minimizer.find('.fa')
        .addClass('fa-minus-square')
        .removeClass('fa-plus-square');
  }
  this.isMinimized_ = becomeMinimized;
  this.expandCollapseCallback_();
};

NetSimPanel.prototype.isMinimized = function () {
  return this.isMinimized_;
};

/**
 * Add a button to the right end of the panel header.
 * @param {string} buttonText
 * @param {function} pressCallback
 */
NetSimPanel.prototype.addButton = function(buttonText, pressCallback) {
  $('<span>')
      .addClass('netsim-button')
      .addClass('secondary')
      .html(buttonText)
      .click(pressCallback)
      .appendTo(this.rootDiv_.find('.panel-controls'));
};

/**
 * @returns {jQuery} the body Div of the panel, for panel content.
 */
NetSimPanel.prototype.getBody = function () {
  return this.rootDiv_.find('.panel-body');
};
