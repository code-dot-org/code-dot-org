/**
 * @overview UI component: The small expandable box above the visualization,
 *           used to show debug and diagnostic information.
 */
'use strict';

require('../utils'); // For Function.prototype.inherits()
var i18n = require('./locale');
var markup = require('./NetSimStatusPanel.html.ejs');
var NetSimPanel = require('./NetSimPanel.js');
var NetSimUtils = require('./NetSimUtils');

/**
 * Generator and controller for connection status panel
 * in left column, displayed while connected.
 * @param {jQuery} rootDiv
 * @param {Object} callbacks
 * @param {function} callbacks.disconnectCallback - method to call when disconnect button
 *        is clicked.
 * @constructor
 * @augments NetSimPanel
 */
var NetSimStatusPanel = module.exports = function (rootDiv, callbacks) {
  /**
   * @type {function}
   * @private
   */
  this.disconnectCallback_ = callbacks.disconnectCallback;

  // Superclass constructor
  NetSimPanel.call(this, rootDiv, {
    className: 'netsim_status_panel',
    panelTitle: 'Status',
    userToggleable: false,
    beginMinimized: true
  });
};
NetSimStatusPanel.inherits(NetSimPanel);

/**
 * @param {Object} [data]
 * @param {string} [data.remoteNodeName] - Display name of remote node.
 * @param {string} [data.myHostname] - Hostname of local node
 * @param {number} [data.myAddress] - Local node address assigned by router
 * @param {string} [data.shareLink] - URL for sharing private shard
 */
NetSimStatusPanel.prototype.render = function (data) {
  data = data || {};

  // Capture title before we render the wrapper panel.
  this.setPanelTitle(data.remoteNodeName);

  // Render boilerplate panel stuff
  NetSimStatusPanel.superPrototype.render.call(this);

  // Put our own content into the panel body
  var newMarkup = $(markup({
    myHostname: data.myHostname,
    myAddress: data.myAddress,
    shareLink: data.shareLink
  }));
  this.getBody().html(newMarkup);

  // Add a button to the panel header
  this.addButton(
      i18n.disconnectButton({caret: '<i class="fa fa-caret-left"></i>'}),
      this.disconnectCallback_);

  // Button that takes you to the next level.
  NetSimUtils.makeContinueButton(this);
};
