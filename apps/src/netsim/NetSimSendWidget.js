/**
 * Copyright 2015 Code.org
 * http://code.org/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generator and controller for message sending view.
 */

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
'use strict';

var markup = require('./NetSimSendWidget.html');
var dom = require('../dom');


/**
 *
 * @param {NetSimConnection} connection
 * @constructor
 */
var NetSimSendWidget = function (connection) {
  /**
   * Connection that owns the router we will represent / manipulate
   * @type {NetSimConnection}
   * @private
   */
  this.connection_ = connection;
  this.connection_.statusChanges
      .register(this.onConnectionStatusChange_.bind(this));
};
module.exports = NetSimSendWidget;

/**
 * Generate a new NetSimSendWidget, puttig it on the page and hooking
 * it up to the given connection where it will update to reflect the
 * state of the connected router, if there is one.
 * @param element
 * @param connection
 */
NetSimSendWidget.createWithin = function (element, connection) {
  var controller = new NetSimSendWidget(connection);
  element.innerHTML = markup({});
  controller.bindElements_();
  controller.refresh();
  return controller;
};

/**
 * Get relevant elements from the page and bind them to local variables.
 * @private
 */
NetSimSendWidget.prototype.bindElements_ = function () {
  this.rootDiv_ = $('#netsim_send_widget');
  this.toAddressTextbox_ = this.rootDiv_.find('#to_address');
  this.payloadTextbox_ = this.rootDiv_.find('#payload');
  this.sendButton_ = this.rootDiv_.find('#send_button');

  dom.addClickTouchEvent(this.sendButton_[0], this.onSendButtonPress_.bind(this));
};

/**
 * Handler for connection status changes.  Can update configuration and
 * trigger a refresh of this view.
 * @private
 */
NetSimSendWidget.prototype.onConnectionStatusChange_ = function () {

};

/** Update the address table to show the list of nodes in the local network. */
NetSimSendWidget.prototype.refresh = function () {

};

/** Send message to connected remote */
NetSimSendWidget.prototype.onSendButtonPress_ = function () {
  var myNode = this.connection_.myNode;
  if (!myNode) {
    return;
  }

  myNode.sendMessage({
    toAddress: parseInt(this.toAddressTextbox_.val(), 10),
    messageContent: this.payloadTextbox_.val()
  });
};
