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

var markup = require('./NetSimMyDevicePanel.html');

/**
 * Generator and controller for message encoding selector: A dropdown that
 * controls whether messages are displayed in some combination of binary, hex,
 * decimal, ascii, etc.
 * @param {function} changeEncodingCallback
 * @constructor
 */
var NetSimMyDevicePanel = module.exports = function (chunkSizeChangeCallback) {
  this.chunkSizeChangeCallback_ = chunkSizeChangeCallback;
};

/**
 * Static counter used to generate/uniquely identify different instances
 * of this log widget on the page.
 * @type {number}
 */
NetSimMyDevicePanel.uniqueIDCounter = 0;

/**
 * Generate a new NetSimMyDevicePanel, putting it on the page.
 * @param {HTMLElement} element
 * @param {function} changeEncodingCallback
 */
NetSimMyDevicePanel.createWithin = function (element, changeEncodingCallback) {
  var controller = new NetSimMyDevicePanel(changeEncodingCallback);

  var instanceID = NetSimMyDevicePanel.uniqueIDCounter;
  NetSimMyDevicePanel.uniqueIDCounter++;

  element.innerHTML = markup({
    instanceID: instanceID
  });
  controller.bindElements_(instanceID);
  return controller;
};

/**
 * Get relevant elements from the page and bind them to local variables.
 * @private
 */
NetSimMyDevicePanel.prototype.bindElements_ = function (instanceID) {
  var rootDiv = $('#netsim_my_device_panel_' + instanceID);
  this.rootDiv_ = rootDiv;
  var initialChunkSize = 8;
  rootDiv.find('.chunk_size_slider').slider({
    value: initialChunkSize,
    min: 1,
    max: 32,
    step: 1,
    slide: this.onChunkSizeChange_.bind(this)
  });
  this.setChunkSize(initialChunkSize);
};

NetSimMyDevicePanel.prototype.onChunkSizeChange_ = function (event, ui) {
  var newChunkSize = ui.value;
  this.setChunkSize(newChunkSize);
  this.chunkSizeChangeCallback_(newChunkSize);
};

NetSimMyDevicePanel.prototype.setChunkSize = function (newChunkSize) {
  var rootDiv = this.rootDiv_;
  rootDiv.find('.chunk_size_slider').slider('option', 'value', newChunkSize);
  rootDiv.find('.chunk_size_value').html(newChunkSize + ' bits');
};


