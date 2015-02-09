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
 * @fileoverview Generator and controller for message log.
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

var markup = require('./NetSimLogWidget.html');
var dom = require('../dom');


/**
 * @constructor
 */
var NetSimLogWidget = function () {
};
module.exports = NetSimLogWidget;

/**
 * Static counter used to generate/uniquely identify different instances
 * of this log widget on the page.
 * @type {number}
 */
NetSimLogWidget.uniqueIDCounter = 0;

/**
 * Generate a new NetSimLogWidget, puttig it on the page and hooking
 * it up to the given connection where it will update to reflect the
 * state of the connected router, if there is one.
 * @param element
 * @param {!string} title - The log widget header text
 */
NetSimLogWidget.createWithin = function (element, title) {
  var controller = new NetSimLogWidget();

  var instanceID = NetSimLogWidget.uniqueIDCounter;
  NetSimLogWidget.uniqueIDCounter++;

  element.innerHTML = markup({
    logInstanceID: instanceID,
    logTitle: title
  });
  controller.bindElements_(instanceID);
  return controller;
};

/**
 * Get relevant elements from the page and bind them to local variables.
 * @private
 */
NetSimLogWidget.prototype.bindElements_ = function (instanceID) {
  this.rootDiv_ = $('#netsim_log_widget_' + instanceID);
  this.scrollArea_ = this.rootDiv_.find('#scroll_area');
  this.clearButton_ = this.rootDiv_.find('#clear_button');

  dom.addClickTouchEvent(this.clearButton_[0], this.onClearButtonPress_.bind(this));
};

NetSimLogWidget.prototype.onClearButtonPress_ = function () {
  this.scrollArea_.empty();
};

/**
 * Put a message into the log.
 */
NetSimLogWidget.prototype.log = function (message) {
  var scrollArea = this.scrollArea_;
  var wasScrolledToEnd =
      scrollArea[0].scrollHeight - scrollArea[0].scrollTop <=
      scrollArea.outerHeight();

  $('<div>').html(message).appendTo(this.scrollArea_);

  // Auto-scroll
  if (wasScrolledToEnd) {
    var scrollTimeMs = 250;
    scrollArea.animate({ scrollTop: scrollArea[0].scrollHeight},
        scrollTimeMs);
  }
};