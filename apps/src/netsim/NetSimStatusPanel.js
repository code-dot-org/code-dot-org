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

require('../utils'); // For Function.prototype.inherits()
var markup = require('./NetSimStatusPanel.html.ejs');
var NetSimPanel = require('./NetSimPanel.js');

/**
 * Generator and controller for connection status panel
 * in left column, displayed while connected.
 * @param {jQuery} rootDiv
 * @param {function} disconnectCallback - method to call when disconnect button
 *        is clicked.
 * @constructor
 * @augments NetSimPanel
 */
var NetSimStatusPanel = module.exports = function (rootDiv, disconnectCallback) {
  /**
   * @type {function}
   * @private
   */
  this.disconnectCallback_ = disconnectCallback;

  // Superclass constructor
  NetSimPanel.call(this, rootDiv, {
    className: 'netsim_status_panel',
    panelTitle: 'Status',
    beginMinimized: true
  });
};
NetSimStatusPanel.inherits(NetSimPanel);

/**
 * @param {Object} [data]
 * @param {boolean} [data.isConnected] - Whether the local client is connected
 *        to a remote node
 * @param {string} [data.statusString] - Used as the panel title.
 * @param {string} [data.remoteNodeName] - Display name of remote node.
 * @param {string} [data.myHostname] - Hostname of local node
 * @param {number} [data.myAddress] - Local node address assigned by router
 * @param {string} [data.shareLink] - URL for sharing private shard
 */
NetSimStatusPanel.prototype.render = function (data) {
  data = data || {};

  // Capture title before we render the wrapper panel.
  this.setPanelTitle(data.statusString);

  // Render boilerplate panel stuff
  NetSimStatusPanel.superPrototype.render.call(this);

  // Put our own content into the panel body
  var newMarkup = $(markup({
    remoteNodeName: data.remoteNodeName,
    myHostname: data.myHostname,
    myAddress: data.myAddress,
    shareLink: data.shareLink
  }));
  this.getBody().html(newMarkup);

  // Add a button to the panel header
  if (data.isConnected) {
    this.addButton('Disconnect', this.disconnectCallback_);
  }
};
