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

var markup = require('./NetSimStatusPanel.html');

/**
 * Generator and controller for connection status panel
 * in left column, displayed while connected.
 * @param {jQuery} rootDiv
 * @param {function} disconnectCallback - method to call when disconnect button
 *        is clicked.
 * @constructor
 */
var NetSimStatusPanel = module.exports = function (rootDiv, disconnectCallback) {
  /**
   * Unique instance ID for this panel, in case we have several
   * of them on a page.
   * @type {number}
   * @private
   */
  this.instanceID_ = NetSimStatusPanel.uniqueIDCounter;
  NetSimStatusPanel.uniqueIDCounter++;

  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * @type {function}
   * @private
   */
  this.disconnectCallback_ = disconnectCallback;

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
NetSimStatusPanel.uniqueIDCounter = 0;

/**
 *
 * @param {Object} [data]
 */
NetSimStatusPanel.prototype.render = function (data) {
  data = data || {};
  data.instanceID = this.instanceID_;
  data.isConnected = data.isConnected || false;
  data.statusString = data.statusString || '';
  data.myHostname = data.myHostname || '';
  data.myAddress = data.myAddress || '';
  data.remoteNodeName = data.remoteNodeName || '';
  data.shareLink = data.shareLink || '';

  var newMarkup = $(markup(data));
  this.rootDiv_.html(newMarkup);

  this.rootDiv_.find('.disconnect_button').click(this.disconnectCallback_);
  this.rootDiv_.find('.minimizer').click(this.onMinimizerClick_.bind(this));

  this.setMinimized(this.isMinimized_);
};

/**
 * Toggle whether this panel is minimized.
 * @private
 */
NetSimStatusPanel.prototype.onMinimizerClick_ = function () {
  this.setMinimized(!this.isMinimized_);
};

/**
 * @param {boolean} becomeMinimized
 */
NetSimStatusPanel.prototype.setMinimized = function (becomeMinimized) {
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
