/**
 * Internet Simulator
 *
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
 * @fileoverview Internet Simulator app for Code.org.
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
/* global -Blockly */
'use strict';

var dom = require('../dom');
var page = require('./page.html');
var utils = require('../utils');
var _ = utils.getLodash();
var netsimStorage = require('./netsimStorage');
var DashboardUser = require('./DashboardUser');

/**
 * The top-level Internet Simulator controller.
 * @param {StudioApp} studioApp The studioApp instance to build upon.
 */
var NetSim = function () {
  this.skin = null;
  this.level = null;
  this.heading = 0;
};

module.exports = NetSim;


/**
 *
 */
NetSim.prototype.injectStudioApp = function (studioApp) {
  this.studioApp_ = studioApp;
};

/**
 * Handler for clicking on the send button in the middle of the screen.
 * This is a temporary handler for a temporary UI element - may get
 * torn out.
 * @private
 */
NetSim.prototype.onSendButtonClick_ = function () {
  // TODO (bbuchanan) : This is super hacky "hello world" stuff.  remove it.
  var now = new Date();
  var fromBox = document.getElementById('netsim_inputbox');
  var toBox = document.getElementById('netsim_recievelog');
  toBox.value += '[' + now.toTimeString() + '] ' + fromBox.value + '\n';
  toBox.scrollTop = toBox.scrollHeight;
};

/**
 * Hook up input handlers to controls on the netsim page
 * @private
 */
NetSim.prototype.attachHandlers_ = function () {
  dom.addClickTouchEvent(
      document.getElementById('netsim_sendbutton'),
      _.bind(this.onSendButtonClick_, this)
  );

  dom.addClickTouchEvent(
      document.getElementById('netsim_refresh_button'),
      _.bind(this.onRefreshButtonClick_, this)
  );

  // _Try_ to clean up after ourselves.
  window.addEventListener('beforeunload', _.bind(this.disconnect_, this));
};

NetSim.prototype.onRefreshButtonClick_ = function () {
  this.refreshLobby_();
};

/**
 * Send a request to dashboard and retrieve a JSON array listing the
 * sections this user belongs to.
 * @param callback
 * @private
 */
NetSim.prototype.getUserSections_ = function (callback) {
  var userSectionEndpoint = '//' + document.location.host +
      '/v2/sections/membership';
  $.ajax({
    dataType: "json",
    url: userSectionEndpoint,
    success: callback
  });
};

/**
 * Handler for what to do when a new section is selected
 * @private
 */
NetSim.prototype.onSectionSelected_ = function() {
  var sectionSelector = document.getElementById('netsim_section_select');
  var sectionID = sectionSelector.value;
  if (sectionID >= 0) {
    // TODO (bbuchanan) : Also pass through unique level key
    this.joinLobby_(sectionSelector.value);
  }
};

/**
 * Broadcast own presence in a "lobby" unique to this level+section.
 * @param sectionID
 * TODO (bbuchanan) : Also accept unique level key for lobby
 * @private
 */
NetSim.prototype.joinLobby_ = function (sectionID) {
  // TODO (bbuchanan) : Disconnect from lobby if already connected
  this.lobby_ = new netsimStorage.SharedStorageTable(
      netsimStorage.APP_PUBLIC_KEY,
      'demo_' + sectionID + '_lobby'
  );
  this.currentUser_.whenReady(_.bind(function () {
    this.lobby_.insert({
      name: this.currentUser_.name,
      connected_to: undefined,
      last_update: Date.now()
    }, _.bind(function (data) {
      if (data) {
        this.connectionRowId_ = data.id;
        console.log("Connected, assigned ID: " + this.connectionRowId_);
        document.getElementById('netsim_refresh_button').disabled = false;
        this.refreshLobby_();
      }
    }, this));
  }, this));
};

NetSim.prototype.refreshLobby_ = function () {
  this.lobby_.all(_.bind(function(data) {
    var list = document.getElementById("netsim_lobby_list");

    // Clear it
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }

    // Add all of our sections
    data.forEach(function (connection) {
      var item = document.createElement('li');
      item.innerHTML = '[' + connection.id + '] ' + connection.name + '(' +
          connection.last_update + ')';
      list.appendChild(item);
    });
  }, this));
};

NetSim.prototype.disconnect_ = function () {
  if (this.lobby_ && this.connectionRowId_) {
    this.lobby_.delete(this.connectionRowId_, _.bind(function (wasSuccess) {
      if (wasSuccess) {
        this.connectionRowId_ = undefined;
        this.lobby_ = undefined;
        console.log("Disconnected");
      } else {
        console.log("Disconnect failed!");
      }
    }, this));
  }
};

/**
 * Called on page load.
 * @param {Object} config Requires the following members:
 *   skin: ???
 *   level: ???
 */
NetSim.prototype.init = function(config) {
  if (!this.studioApp_) {
    throw new Error("NetSim requires a StudioApp");
  }

  this.currentUser_ = DashboardUser.getCurrentUser();

  this.skin = config.skin;
  this.level = config.level;

  config.html = page({
    assetUrl: this.studioApp_.assetUrl,
    data: {
      visualization: '',
      localeDirection: this.studioApp_.localeDirection(),
      controls: require('./controls.html')({assetUrl: this.studioApp_.assetUrl})
    },
    hideRunButton: true
  });

  config.enableShowCode = false;
  config.loadAudio = _.bind(this.loadAudio_, this);

  // Override certain StudioApp methods - netsim does a lot of configuration
  // itself, because of its nonstandard layout.
  this.studioApp_.configureDom = _.bind(this.configureDomOverride_,
      this.studioApp_);
  this.studioApp_.onResize = _.bind(this.onResizeOverride_, this.studioApp_);

  this.studioApp_.init(config);

  this.attachHandlers_();

  // TODO (bbuchanan): Extract this into its own isolated control
  this.getUserSections_(_.bind(function (data) {
    var sectionSelector = document.getElementById('netsim_section_select');

    // Clear it
    while (sectionSelector.firstChild) {
      sectionSelector.removeChild(sectionSelector.firstChild);
    }

    // If we didn't get any sections, we must deny access
    if (0 === data.length) {
      // TODO: Deny access to netsim if no section found
      var option = document.createElement('option');
      option.value = -1;
      option.textContent = '-- NOT FOUND --';
      sectionSelector.appendChild(option);
      return;
    }

    // Add all of our sections
    data.forEach(function (section) {
      var option = document.createElement('option');
      option.value = section.id;
      option.textContent = section.name;
      sectionSelector.appendChild(option);
    });

    this.onSectionSelected_();
  }, this));
};

/**
 * Load audio assets for this app
 * TODO (bbuchanan): Ought to pull this into an audio management module
 * @private
 */
NetSim.prototype.loadAudio_ = function () {
  this.studioApp_.loadAudio(this.skin.winSound, 'win');
  this.studioApp_.loadAudio(this.skin.startSound, 'start');
  this.studioApp_.loadAudio(this.skin.failureSound, 'failure');
};

/**
 * Replaces StudioApp.configureDom.
 * Should be bound against StudioApp instance.
 * @param {Object} config Should at least contain
 *   containerId: ID of a parent DOM element for app content
 *   html: Content to put inside #containerId
 * @private
 */
NetSim.prototype.configureDomOverride_ = function (config) {
  var container = document.getElementById(config.containerId);
  container.innerHTML = config.html;
};

/**
 * Replaces StudioApp.onResize
 * Should be bound against StudioApp instance.
 * @private
 */
NetSim.prototype.onResizeOverride_ = function() {
  var div = document.getElementById('appcontainer');
  var divParent = div.parentNode;
  var parentStyle = window.getComputedStyle(divParent);
  var parentWidth = parseInt(parentStyle.width, 10);
  div.style.top = divParent.offsetTop + 'px';
  div.style.width = parentWidth + 'px';
};