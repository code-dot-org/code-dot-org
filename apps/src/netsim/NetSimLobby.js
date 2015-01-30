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
 * @fileoverview Generator and controller for instance lobby/connection controls.
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

var _ = require('../utils').getLodash();
var markup = require('./NetSimLobby.html');

/**
 * How often the lobby should be auto-refreshed.
 * @type {number}
 * @const
 */
var AUTO_REFRESH_INTERVAL_MS = 5000;

/**
 * @param {NetSimConnection} connection - The instance connection that this
 *                           lobby control will manipulate.
 * @constructor
 */
var NetSimLobby = function (connection) {

  /**
   * Instance connection that this lobby control will manipulate.
   * @type {NetSimConnection}
   * @private
   */
  this.connection_ = connection;
  this.connection_.statusChanges.register(this, this.refreshLobby_);

  /**
   * When the lobby should be refreshed next
   * @type {Number}
   * @private
   */
  this.nextAutoRefreshTime_ = Infinity;
};
module.exports = NetSimLobby;

/**
 * Generate a new NetSimLobby object, putting
 * its markup within the provided element and returning
 * the controller object.
 * @param {DOMElement} The container for the lobby markup
 * @param {NetSimConnection} The connection manager to use
 * @return {NetSimLobby} A new controller for the generated lobby
 * @static
 */
NetSimLobby.createWithin = function (element, connection) {
  // Create a new NetSimLobby
  var controller = new NetSimLobby(connection);
  // TODO: Figure out what parameters to pass here
  element.innerHTML = markup({});
  controller.initialize();
  return controller;
};

/**
 *
 */
NetSimLobby.prototype.initialize = function () {
  this.bindElements_();
  this.refreshInstanceList_();
};

/**
 * Grab the DOM elements related to this control -once-
 * and bind them to member variables.
 * Also attach method handlers.
 */
NetSimLobby.prototype.bindElements_ = function () {
  this.instanceSelector_ = document.getElementById('netsim_instance_select');
  this.instanceSelector_.addEventListener('change',
      _.bind(this.onInstanceSelectorChange_, this));

  this.lobbyList_ = document.getElementById('netsim_lobby_list');
};

/**
 *
 */
NetSimLobby.prototype.onInstanceSelectorChange_ = function () {
  if (this.connection_.isConnectedToInstance()) {
    this.connection_.disconnectFromInstance();
    this.nextAutoRefreshTime_ = Infinity;
  }

  if (this.instanceSelector_.value !== '__none') {
    this.connection_.connectToInstance(this.instanceSelector_.value);
  }
};

/**
 * Make an async request against the dashboard API to
 * reload and populate the user sections list.
 */
NetSimLobby.prototype.refreshInstanceList_ = function () {
  var option;
  var self = this;
  var instanceSelector = this.instanceSelector_;
  this.getUserSections_(function (data) {
    $(instanceSelector).empty();

    if (0 === data.length){
      // If we didn't get any sections, we must deny access
      option = document.createElement('option');
      option.value = '__none';
      option.textContent = '-- NONE FOUND --';
      instanceSelector.appendChild(option);
      return;
    } else {// if (data.length > 1) {
      // If we have more than one section, require the user
      // to pick one.
      option = document.createElement('option');
      option.value = '__none';
      option.textContent = '-- PICK ONE --';
      instanceSelector.appendChild(option);
    }

    // Add all instances to the dropdown
    data.forEach(function (section) {
      option = document.createElement('option');
      // TODO (bbuchanan) : Use unique level ID when generating instance ID
      option.value = 'demo_' + section.id;
      // TODO (bbuchanan) : Put teacher names in sections
      option.textContent = section.name;
      instanceSelector.appendChild(option);
    });

    self.onInstanceSelectorChange_();
  });
};

NetSimLobby.prototype.refreshLobby_ = function () {
  var self = this;
  var lobbyList = this.lobbyList_;

  if (!this.connection_.isConnectedToInstance()) {
    $(lobbyList).empty();
    return;
  }

  this.connection_.getLobbyListing(function (lobbyData) {
    $(lobbyList).empty();

    lobbyData.sort(function (a, b) {
      if (a.name === b.name) {
        return 0;
      } else if (a.name > b.name) {
        return 1;
      }
      return -1;
    });

    // TODO (bbuchanan): This should eventually generate an interactive list
    lobbyData.forEach(function (connection) {
      var item = document.createElement('li');
      if (connection.id === self.connection_.myLobbyRowID_) {
        item.classList.add('netsim_lobby_own_row');
        item.innerHTML = connection.name + ' : ' + connection.status + ' : Me';
      } else {
        item.classList.add('netsim_lobby_user_row');
        var anchor = document.createElement('a');
        anchor.href = '#';
        anchor.innerHTML = connection.name + ' : ' + connection.status;
        item.appendChild(anchor);
      }
      lobbyList.appendChild(item);
    });

    if (self.nextAutoRefreshTime_ === Infinity) {
      self.nextAutoRefreshTime_ = 0;
    }
  }); 
};

/**
 * Send a request to dashboard and retrieve a JSON array listing the
 * sections this user belongs to.
 * @param callback
 * @private
 */
NetSimLobby.prototype.getUserSections_ = function (callback) {
  // TODO (bbuchanan) : Get owned sections as well, to support teachers.
  // TODO (bbuchanan) : Handle failure case nicely.  Maybe wrap callback
  //                    and nicely pass list to it.
  $.ajax({
    dataType: 'json',
    url: '/v2/sections/membership',
    success: callback
  });
};

/**
 *
 * @param {RunLoop.Clock} clock
 */
NetSimLobby.prototype.tick = function (clock) {
  if (clock.time >= this.nextAutoRefreshTime_) {
    this.refreshLobby_();
    if (this.nextAutoRefreshTime_ === 0) {
      this.nextAutoRefreshTime_ = clock.time + AUTO_REFRESH_INTERVAL_MS;
    } else {
      // Stable increment
      while (this.nextAutoRefreshTime_ < clock.time) {
        this.nextAutoRefreshTime_ += AUTO_REFRESH_INTERVAL_MS;
      }
    }
  }
};