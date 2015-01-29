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
var dom = require('../dom');
var markup = require('./NetSimLobby.html');

// TODO (bbuchanan) : Rename the section selector to the instance
//                    selector, update metaphor everywhere.

/**
 * @param {NetSimConnection} connection
 * @constructor
 */
var NetSimLobby = function (connection) {
  this.connection_ = connection;
  this.connection_.registerChangeCallback(_.bind(this.refreshLobby_, this));
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
  this.refreshSectionList_();
};

/**
 * Grab the DOM elements related to this control -once-
 * and bind them to member variables.
 * Also attach method handlers.
 */
NetSimLobby.prototype.bindElements_ = function () {
  this.sectionSelector_ = document.getElementById('netsim_section_select');
  this.sectionSelector_.addEventListener('change', 
      _.bind(this.onSectionSelectorChange_, this));

  this.lobbyList_ = document.getElementById('netsim_lobby_list');

  this.refreshButton_ = document.getElementById('netsim_refresh_button');
  dom.addClickTouchEvent(this.refreshButton_,
      _.bind(this.refreshLobby_, this));
};

/**
 *
 */
NetSimLobby.prototype.onSectionSelectorChange_ = function () {
  if (this.connection_.isConnectedToInstance()) {
    this.connection_.disconnectFromInstance();
  }

  if (this.sectionSelector_.value >= 0) {
    // TODO: Use real level name instead of 'demo'
    this.connection_.connectToInstance('demo', this.sectionSelector_.value);
  }
};

/**
 * Make an async request against the dashboard API to
 * reload and populate the user sections list.
 */
NetSimLobby.prototype.refreshSectionList_ = function () {
  var option;
  var self = this;
  var sectionSelector = this.sectionSelector_;
  this.getUserSections_(function (data) {
    $(sectionSelector).empty();

    if (0 === data.length){
      // If we didn't get any sections, we must deny access
      option = document.createElement('option');
      option.value = -1;
      option.textContent = '-- NOT FOUND --';
      sectionSelector.appendChild(option);
      return;
    } else {// if (data.length > 1) {
      // If we have more than one section, require the user
      // to pick one.
      option = document.createElement('option');
      option.value = -1;
      option.textContent = '-- PICK ONE --';
      sectionSelector.appendChild(option);
    }

    // Add all sections to the dropdown
    // TODO (bbuchanan) : Put teacher names in sections
    data.forEach(function (section) {
      option = document.createElement('option');
      option.value = section.id;
      option.textContent = section.name;
      sectionSelector.appendChild(option);
    });

    self.onSectionSelectorChange_();
  });
};

NetSimLobby.prototype.refreshLobby_ = function () {
  var lobbyList = this.lobbyList_;

  if (!this.connection_.isConnectedToInstance()) {
    $(lobbyList).empty();
    return;
  }

  this.connection_.getLobbyData(function (lobbyData) {
    $(lobbyList).empty();

    lobbyData.forEach(function (connection) {
      var item = document.createElement('li');
      item.innerHTML = '[' + connection.id + '] ' + connection.name +
          ' (' + connection.lastPing + ') ' + connection.status;
      lobbyList.appendChild(item);
    });
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
