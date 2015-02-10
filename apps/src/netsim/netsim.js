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
/* global -Blockly */
/* global $ */
'use strict';

var page = require('./page.html');
var NetSimConnection = require('./NetSimConnection');
var DashboardUser = require('./DashboardUser');
var NetSimLobby = require('./NetSimLobby');
var NetSimRouterPanel = require('./NetSimRouterPanel');
var NetSimSendWidget = require('./NetSimSendWidget');
var NetSimLogWidget = require('./NetSimLogWidget');
var RunLoop = require('./RunLoop');

/**
 * The top-level Internet Simulator controller.
 * @param {StudioApp} studioApp The studioApp instance to build upon.
 */
var NetSim = function () {
  this.skin = null;
  this.level = null;
  this.heading = 0;

  /**
   * Current user object which asynchronously grabs the current user's
   * info from the dashboard API.
   * @type {DashboardUser}
   * @private
   */
  this.currentUser_ = DashboardUser.getCurrentUser();

  /**
   * Manager for connection to shared shard of netsim app.
   * @type {NetSimConnection}
   * @private
   */
  this.connection_ = null;

  /**
   * Tick and Render loop manager for the simulator
   * @type {RunLoop}
   * @private
   */
  this.runLoop_ = new RunLoop();
};

module.exports = NetSim;


/**
 *
 */
NetSim.prototype.injectStudioApp = function (studioApp) {
  this.studioApp_ = studioApp;
};

/**
 * Hook up input handlers to controls on the netsim page
 * @private
 */
NetSim.prototype.attachHandlers_ = function () {
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
  config.loadAudio = this.loadAudio_.bind(this);

  // Override certain StudioApp methods - netsim does a lot of configuration
  // itself, because of its nonstandard layout.
  this.studioApp_.configureDom = this.configureDomOverride_.bind(this.studioApp_);
  this.studioApp_.onResize = this.onResizeOverride_.bind(this.studioApp_);

  this.studioApp_.init(config);

  this.attachHandlers_();

  // Create netsim lobby widget in page
  this.currentUser_.whenReady(function () {
    this.initWithUserName_(this.currentUser_);
  }.bind(this));

  // Begin the main simulation loop
  this.runLoop_.begin();
};

/**
 * Extracts query parameters from a full URL and returns them as a simple
 * object.
 * @returns {*}
 */
NetSim.prototype.getOverrideShardID = function () {
  var parts = location.search.split('?');
  if (parts.length === 1) {
    return undefined;
  }

  var shardID;
  parts[1].split('&').forEach(function (param) {
    var sides = param.split('=');
    if (sides.length > 1 && sides[0] === 's') {
      shardID = sides[1];
    }
  });
  return shardID;
};

/**
 * Initialization that can happen once we have a user name.
 * Could collapse this back into init if at some point we can guarantee that
 * user name is available on load.
 * @param {DashboardUser} user
 * @private
 */
NetSim.prototype.initWithUserName_ = function (user) {
  this.mainContainer_ = $('#netsim');

  this.receivedMessageLog_ = NetSimLogWidget.createWithin(
      document.getElementById('netsim_received'), 'Received Messages');
  this.sentMessageLog_ = NetSimLogWidget.createWithin(
      document.getElementById('netsim_sent'), 'Sent Messages');

  this.connection_ = new NetSimConnection(this.sentMessageLog_,
      this.receivedMessageLog_);
  this.connection_.attachToRunLoop(this.runLoop_);
  this.connection_.statusChanges.register(this, this.refresh_);

  var lobbyContainer = document.getElementById('netsim_lobby_container');
  this.lobbyControl_ = NetSimLobby.createWithin(lobbyContainer,
      this.connection_, user, this.getOverrideShardID());
  this.lobbyControl_.attachToRunLoop(this.runLoop_);

  var routerPanelContainer = document.getElementById('netsim_tabpanel');
  this.routerPanel_ = NetSimRouterPanel.createWithin(routerPanelContainer,
      this.connection_);
  this.routerPanel_.attachToRunLoop(this.runLoop_);

  var sendWidgetContainer = document.getElementById('netsim_send');
  this.sendWidget_ = NetSimSendWidget.createWithin(sendWidgetContainer,
      this.connection_);

  this.refresh_();
};

/**
 * Respond to connection status changes show/hide the main content area.
 * @private
 */
NetSim.prototype.refresh_ = function () {
  if (this.connection_.isConnectedToRouter()) {
    this.mainContainer_.show();
  } else {
    this.mainContainer_.hide();
  }
};

/**
 * Load audio assets for this app
 * TODO (bbuchanan): Ought to pull this into an audio management module
 * @private
 */
NetSim.prototype.loadAudio_ = function () {
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
