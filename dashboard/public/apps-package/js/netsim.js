require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({128:[function(require,module,exports){
var appMain = require('../appMain');
var studioApp = require('../StudioApp').singleton;
var NetSim = require('./netsim');

var levels = require('./levels');
var skins = require('./skins');

window.netsimMain = function(options) {
  options.skinsModule = skins;
  options.isEditorless = true;

  var netSim = new NetSim();
  netSim.injectStudioApp(studioApp);
  appMain(netSim, levels, options);
};

},{"../StudioApp":2,"../appMain":3,"./levels":127,"./netsim":129,"./skins":132}],132:[function(require,module,exports){
var skinBase = require('../skins');

exports.load = function (assetUrl, id) {
  var skin = skinBase.load(assetUrl, id);
  return skin;
};

},{"../skins":135}],129:[function(require,module,exports){
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
'use strict';

var page = require('./page.html');
var NetSimConnection = require('./NetSimConnection');
var DashboardUser = require('./DashboardUser');
var NetSimLobby = require('./NetSimLobby');
var NetSimRouterPanel = require('./NetSimRouterPanel');
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
    // Do a deferred initialization of the connection object.
    // TODO (bbuchanan) : Appending random number to user name only for debugging.
    var userName = this.currentUser_.name + '_' + (Math.floor(Math.random() * 99) + 1);
    this.initWithUserName_(userName);
  }.bind(this));

  // Begin the main simulation loop
  this.runLoop_.begin();
};

/**
 * Initialization that can happen once we have a user name.
 * Could collapse this back into init if at some point we can guarantee that
 * user name is available on load.
 * @param userName
 * @private
 */
NetSim.prototype.initWithUserName_ = function (userName) {
  this.connection_ = new NetSimConnection(userName);
  this.connection_.attachToRunLoop(this.runLoop_);

  var lobbyContainer = document.getElementById('netsim_lobby_container');
  this.lobbyControl_ = NetSimLobby.createWithin(lobbyContainer, this.connection_);
  this.lobbyControl_.attachToRunLoop(this.runLoop_);

  var routerPanelContainer = document.getElementById('netsim_tabzone');
  this.routerPanel_ = NetSimRouterPanel.createWithin(routerPanelContainer,
    this.connection_);
  this.routerPanel_.attachToRunLoop(this.runLoop_);
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

},{"./DashboardUser":111,"./NetSimConnection":112,"./NetSimLobby":115,"./NetSimRouterPanel":121,"./RunLoop":125,"./controls.html":126,"./page.html":130}],130:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1;
  var msg = require('../../locale/current/common');
  var netsimMsg = require('../../locale/current/netsim');
; buf.push('\n\n<div id="rotateContainer" style="background-image: url(', escape((6,  assetUrl('media/mobile_tutorial_turnphone.png') )), ')">\n  <div id="rotateText">\n    <p>', escape((8,  msg.rotateText() )), '<br>', escape((8,  msg.orientationLock() )), '</p>\n  </div>\n</div>\n\n');12; var instructions = function() {; buf.push('  <div id="bubble" class="clearfix">\n    <table id="prompt-table">\n      <tr>\n        <td id="prompt-icon-cell">\n          <img id="prompt-icon"/>\n        </td>\n        <td id="prompt-cell">\n          <p id="prompt">\n          </p>\n        </td>\n      </tr>\n    </table>\n    <div id="ani-gif-preview-wrapper">\n      <div id="ani-gif-preview">\n        <img id="play-button" src="', escape((26,  assetUrl('media/play-circle.png') )), '"/>\n      </div>\n    </div>\n  </div>\n');30; };; buf.push('\n');31; // A spot for the server to inject some HTML for help content.
var helpArea = function(html) {; buf.push('  ');32; if (html) {; buf.push('    <div id="helpArea">\n      ', (33,  html ), '\n    </div>\n  ');35; }; buf.push('');35; };; buf.push('\n<div id="appcontainer">\n  <div id="netsim">\n    <div id="netsim_leftcol">\n      <div id="netsim_lobby_container"></div>\n      <hr />\n      <div id="netsim_received"></div>\n      <div id="netsim_sent"></div>\n      <div id="netsim_send"></div>\n    </div>\n    <div id="netsim_rightcol">\n      <div id="netsim_vizualization"></div>\n      <div id="netsim_tabzone"></div>\n    </div>\n  </div>\n  <div id="footers" dir="', escape((50,  data.localeDirection )), '">\n    ');51; instructions() ; buf.push('\n    ');52; helpArea(data.helpHtml) ; buf.push('\n  </div>\n</div>\n\n<div class="clear"></div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/current/common":180,"../../locale/current/netsim":185,"ejs":196}],127:[function(require,module,exports){
/*jshint multistr: true */

var msg = require('../../locale/current/netsim');

/*
 * Configuration for all levels.
 */
var levels = module.exports = {};

levels.netsim_demo = {
  'freePlay': true
};

},{"../../locale/current/netsim":185}],185:[function(require,module,exports){
/*netsim*/ module.exports = window.blockly.appLocale;
},{}],126:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<div id="slider-cell">\n  <img id="spinner" style="visibility: hidden;" src="', escape((2,  assetUrl('media/turtle/loading.gif') )), '" height=15 width=15>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":196}],125:[function(require,module,exports){
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
 * @fileoverview Simple run-loop manager
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
/* global window */
'use strict';

var ObservableEvent = require('./ObservableEvent');

// It is more accurate to use performance.now(), but we use Date.now()
// for compatibility with Safari and older browsers. This should only cause
// a small error in the deltaTime for the initial frame anyway.
// See Also:
// * https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame
// * https://developer.mozilla.org/en-US/docs/Web/API/Performance.now
var windowNow = (window.performance && window.performance.now) ?
    window.performance.now.bind(window.performance) : Date.now;

/**
 * Ticks per second on older browsers where we can't lock to the repaint event.
 * @type {number}
 * @const
 */
var FALLBACK_FPS = 30;

/**
 * Precalculated milliseconds per tick for fallback case
 * @type {number}
 * @const
 */
var FALLBACK_MS_PER_TICK = (1000 / FALLBACK_FPS);



/**
 *
 * @constructor
 */
var RunLoop = function () {

  /**
   * Whether the run-loop will continue running.
   * @type {boolean}
   */
  this.enabled = false;

  /**
   * Tracks current time and delta time for the loop.
   * Passed to observers when events fire.
   * @type {RunClock}
   */
  this.clock = new RunLoop.Clock();

  /**
   * Method that gets called over and over.
   * @type {Function}
   * @private
   */
  this.tick_ = this.buildTickMethod_();

  /**  @type {ObservableEvent} */
  this.tick = new ObservableEvent();

  /** @type {ObservableEvent} */
  this.render = new ObservableEvent();
};
module.exports = RunLoop;

/**
 * Simple tracking for time values
 * @constructor
 */
RunLoop.Clock = function () {
  /**
   * Time the current/most recent tick started, in ms.
   * Depending on browser this might be epoch time or time since load -
   *  therefore, don't use for absolute time!
   * @type {number}
   */
  this.time = windowNow();

  /**
   * Time in ms between the latest/current tick and the previous tick.
   * Precision dependent on browser capabilities.
   * @type {number}
   */
  this.deltaTime = 0;
};

RunLoop.prototype.buildTickMethod_ = function () {
  var tickMethod;
  var self = this;
  if (window.requestAnimationFrame) {
    tickMethod = function (hiResTimeStamp) {
      if (self.enabled) {
        self.clock.deltaTime = hiResTimeStamp - self.clock.time;
        self.clock.time = hiResTimeStamp;
        self.tick.notifyObservers(self.clock);
        self.render.notifyObservers(self.clock);
        requestAnimationFrame(tickMethod);
      }
    };
  } else {
    tickMethod = function () {
      if (self.enabled) {
        var curTime = windowNow();
        self.clock.deltaTime = curTime - self.clock.time;
        self.clock.time = curTime;
        self.tick.notifyObservers(self.clock);
        self.render.notifyObservers(self.clock);
        setTimeout(tickMethod, FALLBACK_MS_PER_TICK - self.clock.deltaTime);
      }
    };
  }
  return tickMethod;
};

/** Start the run loop (runs immediately) */
RunLoop.prototype.begin = function () {
  this.enabled = true;
  this.clock.time = windowNow();
  this.tick_(this.clock.time);
};

/**
 * Stop the run loop
 * If in the middle of a tick, will finish the current tick.
 * If called by an event between ticks, will prevent the next tick from firing.
 */
RunLoop.prototype.end = function () {
  this.enabled = false;
};

},{"./ObservableEvent":124}],121:[function(require,module,exports){
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
 * @fileoverview Generator and controller for router information view.
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

var markup = require('./NetSimRouterPanel.html');
var periodicAction = require('./periodicAction');

/**
 * How often the lobby should be auto-refreshed.
 * @type {number}
 * @const
 */
var AUTO_REFRESH_INTERVAL_MS = 5000;

/**
 *
 * @param {NetSimConnection} connection
 * @constructor
 */
var NetSimRouterPanel = function (connection) {
  /**
   * Connection that owns the router we will represent / manipulate
   * @type {NetSimConnection}
   * @private
   */
  this.connection_ = connection;
  this.connection_.statusChanges.register(this, this.onConnectionStatusChange_);

  /**
   * Helper for triggering refresh on a regular interval
   * @type {periodicAction}
   * @private
   */
  this.periodicRefresh_ = periodicAction(this.refresh.bind(this),
      AUTO_REFRESH_INTERVAL_MS);

  /**
   * Cached reference to router
   * @type {NetSimNodeRouter}
   * @private
   */
  this.myConnectedRouter = undefined;
};
module.exports = NetSimRouterPanel;

/**
 * Generate a new NetSimRouterPanel, puttig it on the page and hooking
 * it up to the given connection where it will update to reflect the
 * state of the connected router, if there is one.
 * @param element
 * @param connection
 */
NetSimRouterPanel.createWithin = function (element, connection) {
  var controller = new NetSimRouterPanel(connection);
  element.innerHTML = markup({});
  controller.bindElements_();
  controller.refresh();
  return controller;
};

/**
 * Get relevant elements from the page and bind them to local variables.
 * @private
 */
NetSimRouterPanel.prototype.bindElements_ = function () {
  this.rootDiv_ = $('#netsim_router_panel');
  this.connectedSpan_ = this.rootDiv_.find('#connected');
  this.notConnectedSpan_ = this.rootDiv_.find('#not_connected');
  this.networkTable_ = this.rootDiv_.find('#netsim_router_network_table');
};

/**
 * Attach own handlers to run loop events.
 * @param {RunLoop} runLoop
 */
NetSimRouterPanel.prototype.attachToRunLoop = function (runLoop) {
  this.periodicRefresh_.attachToRunLoop(runLoop);
};

/**
 * Handler for connection status changes.  Can update configuration and
 * trigger a refresh of this view.
 * @private
 */
NetSimRouterPanel.prototype.onConnectionStatusChange_ = function () {
  if (this.connection_.isConnectedToRouter()) {
    if (this.connection_.myNode.myRouter !== this.myConnectedRouter) {
      this.myConnectedRouter = this.connection_.myNode.myRouter;
      this.periodicRefresh_.enable();
      // TODO : Attach to router change listener
    }
  } else {
    this.myConnectedRouter = undefined;
    this.refresh();
    this.periodicRefresh_.disable();
  }
};

/** Update the address table to show the list of nodes in the local network. */
NetSimRouterPanel.prototype.refresh = function () {
  if (this.myConnectedRouter) {
    this.connectedSpan_.show();
    this.notConnectedSpan_.hide();

    var self = this;
    this.myConnectedRouter.getAddressTable(function (rows) {
      self.networkTable_.empty();
      $('<tr><th>Hostname</th><th>Address</th></tr>').
          appendTo(self.networkTable_);
      rows.forEach(function (row) {
        $('<tr><td>' + row.hostname + '</td><td>' + row.address + '</td></tr>').
            appendTo(self.networkTable_);
      });
    });
  } else {
    this.notConnectedSpan_.show();
    this.connectedSpan_.hide();
  }
};

},{"./NetSimRouterPanel.html":120,"./periodicAction":131}],120:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<div id="netsim_router_panel">\n  <span id="not_connected">No router connected.</span>\n  <span id="connected">\n    <h1>My network</h1>\n    <table id="netsim_router_network_table">\n      <tr>\n        <th>Name</th>\n        <th>Address</th>\n      </tr>\n    </table>\n  </span>\n</div>'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":196}],115:[function(require,module,exports){
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
 * @fileoverview Generator and controller for shard lobby/connection controls.
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

var dom = require('../dom');
var NetSimNodeClient = require('./NetSimNodeClient');
var NetSimNodeRouter = require('./NetSimNodeRouter');
var markup = require('./NetSimLobby.html');
var periodicAction = require('./periodicAction');

/**
 * How often the lobby should be auto-refreshed.
 * @type {number}
 * @const
 */
var AUTO_REFRESH_INTERVAL_MS = 5000;
var CLOSED_REFRESH_INTERVAL_MS = 30000;

/**
 * @param {NetSimConnection} connection - The shard connection that this
 *                           lobby control will manipulate.
 * @constructor
 */
var NetSimLobby = function (connection) {

  /**
   * Shard connection that this lobby control will manipulate.
   * @type {NetSimConnection}
   * @private
   */
  this.connection_ = connection;
  this.connection_.statusChanges.register(this, this.refreshLobby_);

  /**
   * Helper for running a regular lobby refresh
   * @type {periodicAction}
   * @private
   */
  this.periodicRefresh_ = periodicAction(this.refreshLobby_.bind(this),
      AUTO_REFRESH_INTERVAL_MS);

  /**
   * Which item in the lobby is currently selected
   * @type {number}
   * @private
   */
  this.selectedID_ = undefined;

  /**
   * Which listItem DOM element is currently selected
   * @type {*}
   * @private
   */
  this.selectedListItem_ = undefined;
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
  element.innerHTML = markup({});
  controller.bindElements_();
  controller.refreshShardList_();
  return controller;
};

/**
 * Grab the DOM elements related to this control -once-
 * and bind them to member variables.
 * Also attach method handlers.
 */
NetSimLobby.prototype.bindElements_ = function () {
  this.lobbyOpenDiv_ = document.getElementById('netsim_lobby_open');
  this.lobbyClosedDiv_ = document.getElementById('netsim_lobby_closed');

  this.shardSelector_ = document.getElementById('netsim_shard_select');
  $(this.shardSelector_).change(this.onShardSelectorChange_.bind(this));

  this.lobbyList_ = document.getElementById('netsim_lobby_list');

  this.addRouterButton_ = document.getElementById('netsim_lobby_add_router');
  dom.addClickTouchEvent(this.addRouterButton_,
      this.addRouterButtonClick_.bind(this));

  this.connectButton_ = document.getElementById('netsim_lobby_connect');
  dom.addClickTouchEvent(this.connectButton_,
      this.connectButtonClick_.bind(this));

  this.disconnectButton_ = document.getElementById('netsim_lobby_disconnect');
  dom.addClickTouchEvent(this.disconnectButton_,
      this.disconnectButtonClick_.bind(this));

  this.connectionStatusSpan_ = document.getElementById('netsim_lobby_statusbar');

  this.refreshLobby_();
};

/**
 * Attach own handlers to run loop events.
 * @param {RunLoop} runLoop
 */
NetSimLobby.prototype.attachToRunLoop = function (runLoop) {
  this.periodicRefresh_.attachToRunLoop(runLoop);
};

/** Handler for picking a new shard from the dropdown. */
NetSimLobby.prototype.onShardSelectorChange_ = function () {
  if (this.connection_.isConnectedToShard()) {
    this.connection_.disconnectFromShard();
    this.periodicRefresh_.disable();
  }

  if (this.shardSelector_.value !== '__none') {
    this.connection_.connectToShard(this.shardSelector_.value);
  }
};

/** Handler for clicking the "Add Router" button. */
NetSimLobby.prototype.addRouterButtonClick_ = function () {
  this.connection_.addRouterToLobby();
};

/** Handler for clicking the "Connect" button. */
NetSimLobby.prototype.connectButtonClick_ = function () {
  if (!this.selectedID_) {
    return;
  }

  this.connection_.connectToRouter(this.selectedID_);
};

/** Handler for clicking the "disconnect" button. */
NetSimLobby.prototype.disconnectButtonClick_ = function () {
  this.connection_.disconnectFromRouter();
};

/**
 * Make an async request against the dashboard API to
 * reload and populate the user sections list.
 */
NetSimLobby.prototype.refreshShardList_ = function () {
  var self = this;
  // TODO (bbuchanan) : Use unique level ID when generating shard ID
  var levelID = 'demo';
  var shardSelector = this.shardSelector_;
  this.getUserSections_(function (data) {
    $(shardSelector).empty();

    if (0 === data.length){
      // If we didn't get any sections, we must deny access
      $('<option>')
          .val('__none')
          .html('-- NONE FOUND --')
          .appendTo(shardSelector);
      return;
    } else {
      // If we have more than one section, require the user
      // to pick one.
      $('<option>')
          .val('__none')
          .html('-- PICK ONE --')
          .appendTo(shardSelector);
    }

    // Add all shards to the dropdown
    data.forEach(function (section) {
      // TODO (bbuchanan) : Put teacher names in sections
      $('<option>')
          .val('netsim_' + levelID + '_' + section.id)
          .html(section.name)
          .appendTo(shardSelector);
    });

    self.onShardSelectorChange_();
  });
};

/**
 * Triggers a full state update based on the connection object's current status.
 * @private
 */
NetSimLobby.prototype.refreshLobby_ = function () {
  var self = this;
  var lobbyList = this.lobbyList_;
  var isOnShard = this.connection_.isConnectedToShard();
  var isInLobby = !this.connection_.isConnectedToRouter();

  if (!isOnShard) {
    this.shardSelector_.value = '__none';
    $(this.addRouterButton_).hide();
  } else {
    $(this.addRouterButton_).show();
  }

  this.periodicRefresh_.setActionInterval(isInLobby ?
      AUTO_REFRESH_INTERVAL_MS : CLOSED_REFRESH_INTERVAL_MS);

  if (isInLobby) {
    // Show the lobby and connection selector
    $(this.lobbyOpenDiv_).show();
    $(this.lobbyClosedDiv_).hide();

    if (!this.connection_.isConnectedToShard()) {
      $(lobbyList).empty();
      $(this.connectButton_).hide();
      return;
    }

    this.connection_.getAllNodes(function (lobbyData) {
      $(lobbyList).empty();
      $(self.connectButton_).show();

      lobbyData.sort(function (a, b) {
        if (a.getDisplayName() > b.getDisplayName()) {
          return 1;
        }
        return -1;
      });

      self.selectedListItem_ = undefined;
      lobbyData.forEach(function (simNode) {
        var item = $('<li>').html(
            simNode.getDisplayName() + ' : ' +
            simNode.getStatus() + ' ' +
            simNode.getStatusDetail());

        // Style rows by row type.
        if (simNode.getNodeType() === NetSimNodeRouter.getNodeType()) {
          item.addClass('router_row');
        } else {
          item.addClass('user_row');
          if (simNode.entityID === self.connection_.myNode.entityID) {
            item.addClass('own_row');
          }
        }

        // Preserve selected item across refresh.
        if (simNode.entityID === self.selectedID_) {
          item.addClass('selected_row');
          self.selectedListItem_ = item;
        }

        dom.addClickTouchEvent(item[0], self.onRowClick_.bind(self, item, simNode));
        item.appendTo(lobbyList);
      });

      self.onSelectionChange();

      self.periodicRefresh_.enable();
    });
  } else {
    // Just show the status line and the disconnect button
    $(this.lobbyClosedDiv_).show();
    $(this.lobbyOpenDiv_).hide();
    $(this.connectionStatusSpan_).html(this.connection_.myNode.getStatus() + ' ' +
        this.connection_.myNode.getStatusDetail());
  }
};

/**
 * @param {*} connectionTarget - Lobby row for clicked item
 * @private
 */
NetSimLobby.prototype.onRowClick_ = function (listItem, connectionTarget) {
  // Can't select user rows (for now)
  if (NetSimNodeClient.getNodeType() === connectionTarget.getNodeType()) {
    return;
  }

  var oldSelectedID = this.selectedID_;
  var oldSelectedListItem = this.selectedListItem_;

  // Deselect old row
  if (oldSelectedListItem) {
    oldSelectedListItem.removeClass('selected_row');
  }
  this.selectedID_ = undefined;
  this.selectedListItem_ = undefined;

  // If we clicked on a different row, select the new row
  if (connectionTarget.entityID !== oldSelectedID) {
    this.selectedID_ = connectionTarget.entityID;
    this.selectedListItem_ = listItem;
    this.selectedListItem_.addClass('selected_row');
  }

  this.onSelectionChange();
};

/** Handler for selecting/deselcting a row in the lobby listing. */
NetSimLobby.prototype.onSelectionChange = function () {
  this.connectButton_.disabled = (this.selectedListItem_ === undefined);
};

/**
 * Send a request to dashboard and retrieve a JSON array listing the
 * sections this user belongs to.
 * @param callback
 * @private
 */
NetSimLobby.prototype.getUserSections_ = function (callback) {
  // TODO (bbuchanan) : Get owned sections as well, to support teachers.
  // TODO (bbuchanan): Wrap this away into a shared library for the v2/sections api
  $.ajax({
    dataType: 'json',
    url: '/v2/sections/membership',
    success: callback
  });
};

},{"../dom":44,"./NetSimLobby.html":114,"./NetSimNodeClient":118,"./NetSimNodeRouter":119,"./periodicAction":131}],114:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<div id="netsim_lobby_open">\n  <label for="netsim_shard_select">My Section:</label>\n  <select id="netsim_shard_select">\n    <option selected value="__none">Loading...</option>\n  </select>\n  <input type="button" id="netsim_lobby_add_router" value="Add Router" />\n  <ul id="netsim_lobby_list"></ul>\n  <input type="button" id="netsim_lobby_connect" value="Connect" />\n</div>\n<div id="netsim_lobby_closed">\n    <span id="netsim_lobby_statusbar">...</span>\n    <input type="button" id="netsim_lobby_disconnect" value="Disconnect" />\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":196}],112:[function(require,module,exports){
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
 * @fileoverview Handles client connection status with netsim data services
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
'use strict';

var NetSimLogger = require('./NetSimLogger');
var NetSimNodeClient = require('./NetSimNodeClient');
var NetSimNodeRouter = require('./NetSimNodeRouter');
var NetSimWire = require('./NetSimWire');
var ObservableEvent = require('./ObservableEvent');
var periodicAction = require('./periodicAction');
var NetSimShard = require('./NetSimShard');

var logger = new NetSimLogger(NetSimLogger.LogLevel.VERBOSE);

/**
 * How often the client should run its clean-up job, removing expired rows
 * from the shard tables
 * @type {number}
 * @const
 */
var CLEAN_UP_INTERVAL_MS = 10000;

/**
 * A connection to a NetSim shard
 * @param {string} displayName - Name for person on local end
 * @constructor
 */
var NetSimConnection = function (displayName) {
  /**
   * Display name for user on local end of connection, to be uploaded to others.
   * @type {string}
   * @private
   */
  this.displayName_ = displayName;

  /**
   * Accessor object for select simulation shard's tables, where an shard
   * is a group of tables shared by a group of users, allowing them to observe
   * a common network state.
   *
   * See en.wikipedia.org/wiki/Instance_dungeon for a popular example of this
   * concept.
   *
   * @type {NetSimShard}
   * @private
   */
  this.shard_ = null;

  /**
   * The local client's node representation within the shard.
   * @type {NetSimNodeClient}
   */
  this.myNode = null;

  /**
   * Allows others to subscribe to connection status changes.
   * args: none
   * Notifies on:
   * - Connect to shard
   * - Disconnect from shard
   * - Connect to router
   * - Got address from router
   * - Disconnect from router
   * @type {ObservableEvent}
   */
  this.statusChanges = new ObservableEvent();

  /**
   * Helper for performing shard clean-up on a regular interval
   * @type {periodicAction}
   * @private
   */
  this.periodicCleanUp_ = periodicAction(this.cleanLobby_.bind(this),
      CLEAN_UP_INTERVAL_MS);

  // Bind to onBeforeUnload event to attempt graceful disconnect
  window.addEventListener('beforeunload', this.onBeforeUnload_.bind(this));
};
module.exports = NetSimConnection;

/**
 * Attach own handlers to run loop events.
 * @param {RunLoop} runLoop
 */
NetSimConnection.prototype.attachToRunLoop = function (runLoop) {
  this.periodicCleanUp_.attachToRunLoop(runLoop);
  this.periodicCleanUp_.enable();

  runLoop.tick.register(this, this.tick);
};

/** @param {!RunLoop.Clock} clock */
NetSimConnection.prototype.tick = function (clock) {
  if (this.myNode) {
    this.myNode.tick(clock);
  }
};

/** @returns {NetSimLogger} */
NetSimConnection.prototype.getLogger = function () {
  return logger;
};

/**
 * Before-unload handler, used to try and disconnect gracefully when
 * navigating away instead of just letting our record time out.
 * @private
 */
NetSimConnection.prototype.onBeforeUnload_ = function () {
  if (this.isConnectedToShard()) {
    this.disconnectFromShard();
  }
};

/**
 * Establishes a new connection to a netsim shard, closing the old one
 * if present.
 * @param {string} shardID
 */
NetSimConnection.prototype.connectToShard = function (shardID) {
  if (this.isConnectedToShard()) {
    logger.warn("Auto-closing previous connection...");
    this.disconnectFromShard();
  }

  this.shard_ = new NetSimShard(shardID);
  this.createMyClientNode_();
};

/** Ends the connection to the netsim shard. */
NetSimConnection.prototype.disconnectFromShard = function () {
  if (!this.isConnectedToShard()) {
    logger.warn("Redundant disconnect call.");
    return;
  }

  if (this.isConnectedToRouter()) {
    this.disconnectFromRouter();
  }

  var self = this;
  this.myNode.destroy(function () {
    self.myNode = null;
    self.statusChanges.notifyObservers();
  });
};

/**
 * Given a lobby table has already been configured, connects to that table
 * by inserting a row for ourselves into that table and saving the row ID.
 * @private
 */
NetSimConnection.prototype.createMyClientNode_ = function () {
  var self = this;
  NetSimNodeClient.create(this.shard_, function (node) {
    if (node) {
      self.myNode = node;
      self.myNode.onChange.register(self, self.onMyNodeChange_);
      self.myNode.setDisplayName(self.displayName_);
      self.myNode.update(function () {
        self.statusChanges.notifyObservers();
      });
    } else {
      logger.error("Failed to create client node.");
    }
  });
};

/**
 * Detects when local client node is unable to reconnect, and kicks user
 * out of the shard.
 * @private
 */
NetSimConnection.prototype.onMyNodeChange_= function () {
  if (this.myNode.getStatus() === 'Offline') {
    this.disconnectFromShard();
  }
};

/**
 * Whether we are currently connected to a netsim shard
 * @returns {boolean}
 */
NetSimConnection.prototype.isConnectedToShard = function () {
  return (null !== this.myNode);
};

/**
 * Gets all rows in the lobby and passes them to callback.  Callback will
 * get an empty array if we were unable to get lobby data.
 * @param callback
 */
NetSimConnection.prototype.getAllNodes = function (callback) {
  if (!this.isConnectedToShard()) {
    logger.warn("Can't get lobby rows, not connected to shard.");
    callback([]);
    return;
  }

  var self = this;
  this.shard_.lobbyTable.readAll(function (rows) {
    if (!rows) {
      logger.warn("Lobby data request failed, using empty list.");
      callback([]);
      return;
    }

    var nodes = rows.map(function (row) {
      if (row.type === NetSimNodeClient.getNodeType()) {
        return new NetSimNodeClient(self.shard_, row);
      } else if (row.type === NetSimNodeRouter.getNodeType()) {
        return new NetSimNodeRouter(self.shard_, row);
      }
    }).filter(function (node) {
      return node !== undefined;
    });

    callback(nodes);
  });
};

/**
 * Triggers a sweep of the lobby table that removes timed-out client rows.
 * @private
 */
NetSimConnection.prototype.cleanLobby_ = function () {
  if (!this.shard_) {
    return;
  }

  var self = this;

  // Cleaning the lobby of old users and routers
  this.getAllNodes(function (nodes) {
    nodes.forEach(function (node) {
     if (node.isExpired()) {
       node.destroy();
     }
    });
  });

  // Cleaning wires
  // TODO (bbuchanan): Extract method to get all wires.
  this.shard_.wireTable.readAll(function (rows) {
    if (rows) {
      rows.map(function (row) {
        return new NetSimWire(self.shard_, row);
      }).forEach(function (wire) {
        if (wire.isExpired()) {
          wire.destroy();
        }
      });
    }
  });
};

/** Adds a row to the lobby for a new router node. */
NetSimConnection.prototype.addRouterToLobby = function () {
  var self = this;
  NetSimNodeRouter.create(this.shard_, function () {
    self.statusChanges.notifyObservers();
  });
};

/**
 * Whether our client node is connected to a router node.
 * @returns {boolean}
 */
NetSimConnection.prototype.isConnectedToRouter = function () {
  return this.myNode && this.myNode.myRouter;
};

/**
 * Establish a connection between the local client and the given
 * simulated router.
 * @param {number} routerID
 */
NetSimConnection.prototype.connectToRouter = function (routerID) {
  if (this.isConnectedToRouter()) {
    logger.warn("Auto-disconnecting from previous router.");
    this.disconnectFromRouter();
  }

  var self = this;
  NetSimNodeRouter.get(routerID, this.shard_, function (router) {
    if (!router) {
      logger.warn('Failed to find router with ID ' + routerID);
      return;
    }

    self.myNode.connectToRouter(router, function (success) {
      if (!success) {
        logger.warn('Failed to connect to ' + router.getDisplayName());
      }
      self.statusChanges.notifyObservers();
    });
  });
};

/**
 * Disconnects our client node from the currently connected router node.
 * Destroys the shared wire.
 */
NetSimConnection.prototype.disconnectFromRouter = function () {
  if (!this.isConnectedToRouter()) {
    logger.warn("Cannot disconnect: Not connected.");
    return;
  }

  var self = this;
  this.myNode.disconnectRemote(function () {
    self.statusChanges.notifyObservers();
  });
};
},{"./NetSimLogger":116,"./NetSimNodeClient":118,"./NetSimNodeRouter":119,"./NetSimShard":122,"./NetSimWire":123,"./ObservableEvent":124,"./periodicAction":131}],131:[function(require,module,exports){
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
 * @fileoverview Utility for creating an action that occurs on a regular
 *               interval when hooked up to a RunLoop tick.
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
'use strict';

/**
 * @param {function} action
 * @param {number} interval - time between calls to action in milliseconds
 * @returns {{tick: Function, enable: Function, disable: Function}}
 */
var periodicAction = function (action, interval) {
  var nextActionTime = Infinity;
  var actionInterval = interval;

  return {

    /**
     * Attach action to provided RunLoop tick event.
     * @param {RunLoop} runLoop
     */
    attachToRunLoop: function (runLoop) {
      runLoop.tick.register(this, this.tick);
    },

    /** @param clock */
    tick: function (clock) {
      if (clock.time >= nextActionTime) {
        action(clock);

        if (nextActionTime === 0) {
          nextActionTime = clock.time + actionInterval;
        } else {
          // Stable-increment
          while (nextActionTime < clock.time) {
            nextActionTime += actionInterval;
          }
        }
      }
    },

    /** Cause the action to resume running on the next tick. */
    enable: function () {
      if (nextActionTime === Infinity) {
        nextActionTime = 0;
      }
    },

    /** Cause the action to stop running. */
    disable: function () {
      nextActionTime = Infinity;
    },

    /**
     * Whether the periodic action is scheduled to fire again.
     * @returns {boolean}
     */
    isEnabled: function () {
      return nextActionTime !== Infinity;
    },

    /**
     * Change the interval at which action occurs
     * @param interval - time between calls to action in milliseconds
     */
    setActionInterval: function (interval) {
      actionInterval = interval;
    }

  };
};

module.exports = periodicAction;
},{}],122:[function(require,module,exports){
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
 * @fileoverview Wraps a shard ID with helpers for getting certain tables
 * out of the shard.
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
/* global window */
'use strict';

var SharedTable = require('../appsApi').SharedTable;

/**
 * App key, unique to netsim, used for connecting with the storage API.
 * @type {string}
 * @readonly
 */
// TODO (bbuchanan): remove once we can store ids for each app? (userid:1 apppid:42)
var APP_PUBLIC_KEY =
    window.location.hostname.split('.')[0] === 'localhost' ?
        "JGW2rHUp_UCMW_fQmRf6iQ==" : "HQJ8GCCMGP7Yh8MrtDusIA==";

/**
 * A shard is an isolated, complete simulation state shared by a subset of
 * users.  It's made of a set of storage tables set apart by a particular
 * shard ID in their names.  We use shards to allow students to interact only
 * with their particular class while still storing all NetSim tables under
 * the same App ID.
 *
 * @param {!string} shardID
 * @constructor
 */
var NetSimShard = function (shardID) {
  /** @type {string} */
  this.shardID = shardID;

  /** @type {SharedTable} */
  this.lobbyTable = new SharedTable(APP_PUBLIC_KEY, shardID + '_node');

  /** @type {SharedTable} */
  this.wireTable = new SharedTable(APP_PUBLIC_KEY, shardID + '_wire');
};

module.exports = NetSimShard;
},{"../appsApi":16}],119:[function(require,module,exports){
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
 * @fileoverview Client model of simulated router
 *
 * Represents the client's view of a given router, provides methods for
 *   letting the client interact with the router, and wraps the client's
 *   work doing part of the router simulation.
 *
 * A router -exists- when it has a row in the lobby table of type 'router'
 * A router is connected to a user when a 'user' row exists in the lobby
 *   table that has a status 'Connected to {router ID} by wires {X, Y}'.
 * A router will also share a wire (simplex) or wires (duplex) with each user,
 *   which appear in the wire table.
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
'use strict';

var superClass = require('./NetSimNode');
var NetSimEntity = require('./NetSimEntity');
var NetSimWire = require('./NetSimWire');

/**
 * @param {!NetSimShard} shard
 * @param {Object} [routerRow] - Lobby row for this router.
 * @constructor
 * @augments NetSimNode
 */
var NetSimNodeRouter = function (shard, routerRow) {
  superClass.call(this, shard, routerRow);

  /**
   * @const
   * @type {number}
   */
  this.MAX_CLIENT_CONNECTIONS = 6;
};
NetSimNodeRouter.prototype = Object.create(superClass.prototype);
NetSimNodeRouter.prototype.constructor = NetSimNodeRouter;
module.exports = NetSimNodeRouter;

/**
 * Static async creation method. See NetSimEntity.create().
 * @param {!NetSimShard} shard
 * @param {function} [onComplete] - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimNodeRouter.create = function (shard, onComplete) {
  NetSimEntity.create(NetSimNodeRouter, shard, function (router) {
    // Always try and update router immediately, to set its DisplayName
    // correctly.
    if (router) {
      router.update(function () {
        onComplete(router);
      });
    } else {
      onComplete(router);
    }
  });
};

/**
 * Static async retrieval method.  See NetSimEntity.get().
 * @param {!number} entityID - The row ID for the entity you'd like to find.
 * @param {!NetSimShard} shard
 * @param {function} [onComplete] - Method that will be given the
 *        found entity, or null if entity search failed.
 */
NetSimNodeRouter.get = function (routerID, shard, onComplete) {
  NetSimEntity.get(NetSimNodeRouter, routerID, shard, onComplete);
};

/**
 * @readonly
 * @enum {string}
 */
NetSimNodeRouter.RouterStatus = {
  INITIALIZING: 'Initializing',
  READY: 'Ready',
  FULL: 'Full'
};
var RouterStatus = NetSimNodeRouter.RouterStatus;

/**
 * Updates router status and lastPing time in lobby table - both keepAlive
 * and making sure router's connection count is valid.
 * @param onComplete
 */
NetSimNodeRouter.prototype.update = function (onComplete) {
  onComplete = onComplete || function () {};

  var self = this;
  this.countConnections(function (count) {
    self.status_ = count >= self.MAX_CLIENT_CONNECTIONS ?
        RouterStatus.FULL : RouterStatus.READY;
    self.statusDetail_ = '(' + count + '/' + self.MAX_CLIENT_CONNECTIONS + ')';
    superClass.prototype.update.call(self, onComplete);
  });
};

/** @inheritdoc */
NetSimNodeRouter.prototype.getDisplayName = function () {
  return "Router " + this.entityID;
};

/** @inheritdoc */
NetSimNodeRouter.prototype.getNodeType = function () {
  return NetSimNodeRouter.getNodeType();
};
NetSimNodeRouter.getNodeType = function () {
  return 'router';
};

/**
 * Helper for getting wires table of configured shard.
 * @returns {exports.SharedTable}
 */
NetSimNodeRouter.prototype.getWireTable = function () {
  return this.shard_.wireTable;
};

/**
 * Query the wires table and pass the callback a list of wire table rows,
 * where all of the rows are wires attached to this router.
 * @param {function} onComplete, which accepts an Array of NetSimWire.
 */
NetSimNodeRouter.prototype.getConnections = function (onComplete) {
  onComplete = onComplete || function () {};

  var shard = this.shard_;
  var routerID = this.entityID;
  this.shard_.wireTable.readAll(function (rows) {
    if (rows === null) {
      onComplete([]);
      return;
    }

    var myWires = rows.
        map(function (row) {
          return new NetSimWire(shard, row);
        }).
        filter(function (wire){
          return wire.remoteNodeID === routerID;
        });

    onComplete(myWires);
  });
};

/**
 * Query the wires table and pass the callback the total number of wires
 * connected to this router.
 * @param {function} onComplete, which accepts a number.
 */
NetSimNodeRouter.prototype.countConnections = function (onComplete) {
  onComplete = onComplete || function () {};

  this.getConnections(function (wires) {
    onComplete(wires.length);
  });
};

/**
 * @param [Array] haystack
 * @param {*} needle
 * @returns {boolean} TRUE if needle found in haystack
 */
var contains = function (haystack, needle) {
  return haystack.some(function (element) {
    return element === needle;
  });
};

/**
 * Called when another node establishes a connection to this one, giving this
 * node a chance to reject the connection.
 *
 * The router checks against its connection limit, and rejects the connection
 * if its limit is now exceeded.
 *
 * @param {!NetSimNode} otherNode attempting to connect to this one
 * @param {!function} onComplete response method - should call with TRUE
 *        if connection is allowed, FALSE if connection is rejected.
 */
NetSimNodeRouter.prototype.acceptConnection = function (otherNode, onComplete) {
  var self = this;
  this.countConnections(function (count) {
    if (count > self.MAX_CLIENT_CONNECTIONS) {
      onComplete(false);
      return;
    }

    onComplete(true);
  });
};

/**
 * Assign a new address for hostname on wire, calling onComplete(success)
 * when done.
 * @param {!NetSimWire} wire that lacks addresses or hostnames
 * @param {string} hostname of requesting node
 * @param {function} [onComplete] reports success or failure.
 */
NetSimNodeRouter.prototype.requestAddress = function (wire, hostname, onComplete) {
  onComplete = onComplete || function () {};


  // General strategy: Create a list of existing remote addresses, pick a
  // new one, and assign it to the provided wire.
  var self = this;
  this.getConnections(function (wires) {
    var addressList = wires.filter(function (wire) {
      return wire.localAddress !== undefined;
    }).map(function (wire) {
      return wire.localAddress;
    });

    // Find the lowest unused integer address starting at 2
    // Non-optimal, but should be okay since our address list should not exceed 10.
    var newAddress = 1;
    while (contains(addressList, newAddress)) {
      newAddress++;
    }

    wire.localAddress = newAddress;
    wire.localHostname = hostname;
    wire.remoteAddress = 0; // Always 0 for routers
    wire.remoteHostname = self.getHostname();
    wire.update(onComplete);
    // TODO: Fix possibility of two routers getting addresses by verifying
    //       after updating the wire.
  });
};

/**
 * Query the wires table and pass the callback a list of addresses and
 * hostnames, which includes this router node and all of the nodes that are
 * connected to this router by an active wire.
 * Returns list of objects in form { hostname:{string}, address:{number} }
 * @param onComplete
 */
NetSimNodeRouter.prototype.getAddressTable = function (onComplete) {
  onComplete = onComplete || function () {};

  var self = this;
  this.getConnections(function (wires) {
    var addressTable = wires.map(function (wire) {
      return {
        hostname: wire.localHostname,
        address: wire.localAddress
      };
    }).concat({
      hostname: self.getHostname(),
      address: 0
    });
    onComplete(addressTable);
  });
};

},{"./NetSimEntity":113,"./NetSimNode":117,"./NetSimWire":123}],118:[function(require,module,exports){
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
 * @fileoverview Client model of simulated node
 *
 * Represents the client's view of a node that is controlled by a user client,
 * either by our own client or somebody else's.  Is a NetSimEntity, meaning
 * it wraps a row in the node table and provides functionality around it.
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
'use strict';

var superClass = require('./NetSimNode');
var NetSimEntity = require('./NetSimEntity');

/**
 * @param {!NetSimShard} shard
 * @param {Object} [clientRow] - Lobby row for this router.
 * @constructor
 * @augments NetSimNode
 */
var NetSimNodeClient = function (shard, clientRow) {
  superClass.call(this, shard, clientRow);

  /**
   * How long (in milliseconds) this entity is allowed to remain in
   * storage without being cleaned up.
   * @type {number}
   * @override
   */
  this.ENTITY_TIMEOUT_MS = 30000;

  /**
   * How often (in milliseconds) this entity's status should be pushed
   * to the server to keep the row active.
   * @type {number}
   * @override
   */
  this.ENTITY_KEEPALIVE_MS = 2000;

  /**
   * Client nodes can only have one wire at a time.
   * @type {NetSimWire}
   */
  this.myWire = null;

  /**
   * Client nodes can be connected to a router, which they will
   * help to simulate.
   * @type {NetSimRouter}
   */
  this.myRouter = null;
};
NetSimNodeClient.prototype = Object.create(superClass.prototype);
NetSimNodeClient.prototype.constructor = NetSimNodeClient;
module.exports = NetSimNodeClient;

/**
 * Static async creation method. See NetSimEntity.create().
 * @param {!NetSimShard} shard
 * @param {function} [onComplete] - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimNodeClient.create = function (shard, onComplete) {
  NetSimEntity.create(NetSimNodeClient, shard, onComplete);
};

/** @inheritdoc */
NetSimNodeClient.prototype.getNodeType = function () {
  return NetSimNodeClient.getNodeType();
};
NetSimNodeClient.getNodeType = function () {
  return 'user';
};

/** @inheritdoc */
NetSimNodeClient.prototype.getStatus = function () {
  return this.status_ ? this.status_ : 'Online';
};

/** Set node's display name.  Does not trigger an update! */
NetSimNodeClient.prototype.setDisplayName = function (displayName) {
  this.displayName_ = displayName;
};

/**
 * Our client tick can also tick its connected wire and its remote client.
 * @param {!RunLoop.Clock} clock
 */
NetSimNodeClient.prototype.tick = function (clock) {
  superClass.prototype.tick.call(this, clock);

  if (this.myWire) {
    this.myWire.tick(clock);
  }

  if (this.myRouter) {
    this.myRouter.tick(clock);
  }
};

/**
 * If a client update fails, should attempt an automatic reconnect.
 * @param {function} [onComplete]
 * @param {boolean} [autoReconnect=true]
 */
NetSimNodeClient.prototype.update = function (onComplete, autoReconnect) {
  if (!onComplete) {
    onComplete = function () {};
  }
  if (autoReconnect === undefined) {
    autoReconnect = true;
  }

  var self = this;
  superClass.prototype.update.call(this, function (success) {
    if (!success && autoReconnect) {
      self.reconnect_(function (success) {
        if (!success){
          self.status_ = 'Offline';
          self.onChange.notifyObservers();
        }
        onComplete(success);
      });
    } else {
      onComplete(success);
    }
  });
};

/**
 * Reconnection sequence for client node, in which it tries to grab a
 * new node ID and propagate it across the simulation.
 * @param {!function} onComplete (success)
 * @private
 */
NetSimNodeClient.prototype.reconnect_ = function (onComplete) {
  var self = this;
  NetSimNodeClient.create(this.shard_, function (node) {
    if (!node) {
      // Reconnect failed
      onComplete(false);
      return;
    }

    // Steal the new row's entity ID
    self.entityID = node.entityID;
    self.update(function (success) {
      if (!success) {
        // Reconnect failed
        onComplete(false);
        return;
      }

      // If we have a wire, we also have to update it to be reconnected.
      if (self.myWire !== null) {
        self.myWire.localNodeID = self.entityID;
        self.myWire.update(function (success) {
          if (!success) {
            // Reconnect failed
            onComplete(false);
            return;
          }

          // Wire reconnected as well - we're good.
          onComplete(true);
        });
      } else {
        // Sufficient - we are reconnected
        onComplete(true);
      }
    }, false); // No auto-reconnect this time.
  });
};

/**
 * @param {!NetSimRouter} router
 * @param {function} onComplete({boolean}success)
 */
NetSimNodeClient.prototype.connectToRouter = function (router, onComplete) {
  if (!onComplete) {
    onComplete = function () {};
  }

  var self = this;
  this.connectToNode(router, function (wire) {
    if (!wire) {
      onComplete(false);
      return;
    }

    self.myWire = wire;
    self.myRouter = router;
    router.requestAddress(wire, self.getHostname(), function (success) {
      if (!success) {
        wire.destroy(function () {
          onComplete(false);
        });
        return;
      }

      self.myWire = wire;
      self.myRouter = router;
      // Trigger an immediate router update so its connection count is correct.
      self.myRouter.update(onComplete);
    });
  });
};

NetSimNodeClient.prototype.disconnectRemote = function (onComplete) {
  if (!onComplete) {
    onComplete = function () {};
  }

  var self = this;
  this.myWire.destroy(function (success) {
    if (!success) {
      onComplete(success);
      return;
    }

    self.myWire = null;
    // Trigger an immediate router update so its connection count is correct.
    self.myRouter.update(onComplete);
    self.myRouter = null;
  });
};
},{"./NetSimEntity":113,"./NetSimNode":117}],117:[function(require,module,exports){
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
 * @fileoverview Client model of simulated network entity, which lives
 * in a shard table.
 *
 * Wraps the entity row with helper methods for examining and maintaining
 * the entity state in shared storage.
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

var superClass = require('./NetSimEntity');
var NetSimWire = require('./NetSimWire');

/**
 * @param {!NetSimShard} shard
 * @param {Object} [nodeRow] JSON row from table.
 * @constructor
 * @augments NetSimEntity
 */
var NetSimNode = function (shard, nodeRow) {
  superClass.call(this, shard, nodeRow);

  if (nodeRow === undefined) {
    nodeRow = {};
  }

  /**
   * @type {string}
   * @private
   */
  this.displayName_ = nodeRow.name;

  /**
   * @type {string}
   * @private
   */
  this.status_ = nodeRow.status;

  /**
   * @type {string}
   * @private
   */
  this.statusDetail_ = nodeRow.statusDetail;
};
NetSimNode.prototype = Object.create(superClass.prototype);
NetSimNode.prototype.constructor = NetSimNode;
module.exports = NetSimNode;

/**
 * Get shared table for nodes
 * @returns {SharedTable}
 * @private
 */
NetSimNode.prototype.getTable_= function () {
  return this.shard_.lobbyTable;
};

/** Build table row for this node */
NetSimNode.prototype.buildRow_ = function () {
  return $.extend(superClass.prototype.buildRow_.call(this), {
    name: this.getDisplayName(),
    type: this.getNodeType(),
    status: this.getStatus(),
    statusDetail: this.getStatusDetail()
  });
};

/**
 * Get node's display name, which is stored in table.
 * @returns {string}
 */
NetSimNode.prototype.getDisplayName = function () {
  return this.displayName_ ? this.displayName_ : '[New Node]';
};

/**
 * Get node's hostname, a modified version of its display name.
 * @returns {string}
 */
NetSimNode.prototype.getHostname = function () {
  return this.getDisplayName().replace(/[^\w\d]/g, '').toLowerCase();
};

/**
 * Get node's type.
 * @returns {string}
 */
NetSimNode.prototype.getNodeType = function () {
  throw new Error('getNodeType method is not implemented');
};

/**
 * Get node's status, usually a string enum value.
 * @returns {string}
 */
NetSimNode.prototype.getStatus = function () {
  return this.status_;
};

/**
 * Get node's additional status info, usually display-only
 * status info.
 * @returns {string}
 */
NetSimNode.prototype.getStatusDetail = function () {
  return this.statusDetail_ ? this.statusDetail_ : '';
};

/**
 * Establish a connection between this node and another node,
 * by creating a wire between them, and verifying that the remote node
 * can accept the connection.
 * When finished, calls onComplete({the new wire})
 * On failure, calls onComplete(null)
 * @param {!NetSimNode} otherNode
 * @param {function} [onComplete]
 */
NetSimNode.prototype.connectToNode = function (otherNode, onComplete) {
  if (!onComplete) {
    onComplete = function () {};
  }

  var self = this;
  NetSimWire.create(this.shard_, function (wire) {
    if (wire === null) {
      onComplete(null);
      return;
    }

    wire.localNodeID = self.entityID;
    wire.remoteNodeID = otherNode.entityID;
    wire.update(function (success) {
      if (!success) {
        wire.destroy(function () {
          onComplete(null);
        });
        return;
      }

      otherNode.acceptConnection(self, function (success) {
        if (!success) {
          wire.destroy(function () {
            onComplete(null);
          });
          return;
        }

        onComplete(wire);
      });
    });
  });
};

/**
 * Called when another node establishes a connection to this one, giving this
 * node a chance to reject the connection.
 * @param {!NetSimNode} otherNode attempting to connect to this one
 * @param {!function} onComplete response method - should call with TRUE
 *        if connection is allowed, FALSE if connection is rejected.
 */
NetSimNode.prototype.acceptConnection = function (otherNode, onComplete) {
  onComplete(true);
};
},{"./NetSimEntity":113,"./NetSimWire":123}],123:[function(require,module,exports){
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
 * @fileoverview Client model simulated connection to another node.
 *
 * Distinct from NetSimConnection, which represents the client's actual
 * connection to the simulator shard, this is a simulated connection
 * between simulated nodes.
 *
 * In shared storage, this shows up as a row in the {shardID}_wire table.
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

var superClass = require('./NetSimEntity');

/**
 * Create a local controller for a simulated connection between nodes,
 * which is stored in the _wire table on the shard.  The controller can
 * be initialized with the JSON row from the table, effectively wrapping that
 * data in helpful methods.
 *
 * @param {!NetSimShard} shard - The shard where this wire lives.
 * @param {Object} [wireRow] - A row out of the _wire table on the shard.
 *        If provided, will initialize this wire with the given data.  If not,
 *        this wire will initialize to default values.
 * @constructor
 * @augments NetSimEntity
 */
var NetSimWire = function (shard, wireRow) {
  superClass.call(this, shard, wireRow);

  // Default empty wireRow object
  if (wireRow === undefined) {
    wireRow = {};
  }

  /**
   * Connected node row IDs within the _lobby table
   * @type {number}
   */
  this.localNodeID = wireRow.localNodeID;
  this.remoteNodeID = wireRow.remoteNodeID;

  /**
   * Assigned local addresses for the ends of this wire.
   * When connected to a router, remoteAddress is always 1.
   * @type {number}
   */
  this.localAddress = wireRow.localAddress;
  this.remoteAddress = wireRow.remoteAddress;

  /**
   * Display hostnames for the ends of this wire.
   * Generally, each endpoint should set its own hostname.
   * @type {string}
   */
  this.localHostname = wireRow.localHostname;
  this.remoteHostname = wireRow.remoteHostname;

  /**
   * Not used yet.
   * @type {string}
   */
  this.wireMode = wireRow.wireMode !== undefined ?
      wireRow.wireMode : 'duplex'; // Or simplex?
};
NetSimWire.prototype = Object.create(superClass.prototype);
NetSimWire.prototype.constructor = NetSimWire;
module.exports = NetSimWire;

/**
 * Static async creation method.  See NetSimEntity.create().
 * @param {!NetSimShard} shard
 * @param {function} [onComplete] - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimWire.create = function (shard, onComplete) {
  superClass.create(NetSimWire, shard, onComplete);
};

/**
 * Helper that gets the wires table for the configured shard.
 * @returns {exports.SharedTable}
 */
NetSimWire.prototype.getTable_ = function () {
  return this.shard_.wireTable;
};

/** Build own row for the wire table  */
NetSimWire.prototype.buildRow_ = function () {
  return $.extend(superClass.prototype.buildRow_.call(this), {
    localNodeID: this.localNodeID,
    remoteNodeID: this.remoteNodeID,
    localAddress: this.localAddress,
    remoteAddress: this.remoteAddress,
    localHostname: this.localHostname,
    remoteHostname: this.remoteHostname,
    wireMode: this.wireMode
  });
};

},{"./NetSimEntity":113}],113:[function(require,module,exports){
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
 * @fileoverview Client model of simulated network entity, which lives
 * in a shard table.
 *
 * Wraps the entity row with helper methods for examining and maintaining
 * the entity state in shared storage.
 */

/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
/* global Date */
'use strict';

var ObservableEvent = require('./ObservableEvent');

/**
 * @param {!NetSimShard} shard
 * @param {Object} [entityRow] JSON row from table.
 * @constructor
 */
var NetSimEntity = function (shard, entityRow) {
  if (entityRow === undefined) {
    entityRow = {};
  }

  /**
   * @type {NetSimShard}
   * @protected
   */
  this.shard_ = shard;

  /**
   * Cached last ping time for this entity
   * @type {number}
   * @private
   */
  this.lastPing_ = entityRow.lastPing;

  /**
   * Node's row ID within the _lobby table.  Unique within instance.
   * @type {number}
   */
  this.entityID = entityRow.id;

  /**
   * How long (in milliseconds) this entity is allowed to remain in
   * storage without being cleaned up.
   * @type {number}
   */
  this.ENTITY_TIMEOUT_MS = 300000;

  /**
   * How often (in milliseconds) this entity's status should be pushed
   * to the server to keep the row active.
   * @type {number}
   */
  this.ENTITY_KEEPALIVE_MS = 30000;

  /**
   * Change event fired when entity's state changes in a way that
   * should be reported.
   * @type {ObservableEvent}
   */
  this.onChange = new ObservableEvent();
};
module.exports = NetSimEntity;

/**
 * Static async creation method.  Creates a new entity on the given shard,
 * and then calls the callback with a local controller for the new entity.
 * @param {!function} EntityType - The constructor for the entity type you want
 *        to create.
 * @param {!NetSimShard} shard
 * @param {function} [onComplete] - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimEntity.create = function (EntityType, shard, onComplete) {
  onComplete = onComplete || function () {};

  var entity = new EntityType(shard);
  entity.getTable_().create(entity.buildRow_(), function (row) {
    if (row) {
      onComplete(new EntityType(shard, row));
    } else {
      onComplete(null);
    }
  });
};

/**
 * Static async retrieval method.  Searches for a new entity on the given
 * shard, and then calls the callback with a local controller for the
 * found entity.
 * @param {!function} EntityType - The constructor for the entity type you want
 *        to find.
 * @param {!number} entityID - The row ID for the entity you'd like to find.
 * @param {!NetSimShard} shard
 * @param {function} [onComplete] - Method that will be given the
 *        found entity, or null if entity search failed.
 */
NetSimEntity.get = function (EntityType, entityID, shard, onComplete) {
  onComplete = onComplete || function () {};

  var entity = new EntityType(shard);
  entity.getTable_().read(entityID, function (row) {
    if (row) {
      onComplete(new EntityType(shard, row));
    } else {
      onComplete(null);
    }
  });
};

/** Push entity state into remote storage. */
NetSimEntity.prototype.update = function (onComplete) {
  onComplete = onComplete || function () {};

  this.lastPing_ = Date.now();
  this.getTable_().update(this.entityID, this.buildRow_(), onComplete);
};

/** Remove entity from remote storage. */
NetSimEntity.prototype.destroy = function (onComplete) {
  onComplete = onComplete || function () {};

  this.getTable_().delete(this.entityID, onComplete);
};

/** Get storage table for this entity type. */
NetSimEntity.prototype.getTable_ = function () {
  // This method should be implemented by an inheriting class.
  throw new Error('Method getTable_ is not implemented.');
};

/** Construct table row for this entity. */
NetSimEntity.prototype.buildRow_ = function () {
  return {
    lastPing: Date.now()
  };
};

/**
 * Whether this entity's row has been touched within its timeout.
 * @returns {boolean}
 */
NetSimEntity.prototype.isExpired = function () {
  // TODO: Subclasses should reimplement this method to include
  // validation checks; e.g. a NetSimWire is expired if one of its
  // endpoints no longer exists.
  return Date.now() - this.lastPing_ >= this.ENTITY_TIMEOUT_MS;
};

/**
 * Default Entity tick ensures keepAlive messages get sent for this entity.
 * @param {!RunLoop.Clock} clock
 */
NetSimEntity.prototype.tick = function () {
  if (Date.now() - this.lastPing_ >= this.ENTITY_KEEPALIVE_MS){
    this.update();
  }
};
},{"./ObservableEvent":124}],124:[function(require,module,exports){
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
 * @fileoverview Observer/ObservableEvent pattern utilities
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
'use strict';

/**
 * A subscription/notification atom, used to cleanly hook up callbacks
 * without attaching anything to the DOM or other global scope.
 * @constructor
 */
var ObservableEvent = function () {
  /**
   * Objects observing this.
   * @type {Array}
   * @private
   */
  this.observerList_ = [];
};
module.exports = ObservableEvent;

/**
 * Subscribe a method to be called when ObservableEvent.notifyObservers is called.
 * @param {Object} observingObj - Object/context that wants to be notified,
 *                 which will be bound to "this" when onNotify is called.
 * @param {Function} onNotify - method called when ObservableEvent.notifyObservers
 *                   gets called.  Will receive any arguments passed to
 *                   ObservableEvent.notifyObservers.
 * @returns {Object} key - used to unregister from observable
 */
ObservableEvent.prototype.register = function (observingObj, onNotify) {
  var key = {thisArg: observingObj, toCall:onNotify};
  Object.freeze(key);
  this.observerList_.push(key);
  return key;
};

/**
 * Unsubscribe from notifications.
 * @param {Object} keyObj - Key generated when registering
 * @returns {boolean} - Whether an unregistration actually occurred
 */
ObservableEvent.prototype.unregister = function (keyObj) {
  for (var i = 0; i < this.observerList_.length; i++) {
    if (keyObj === this.observerList_[i]) {
      this.observerList_.splice(i, 1);
      return true;
    }
  }
  return false;
};

/**
 * Call all methods subscribed to this ObservableEvent, passing through
 * any arguments.
 * @param {...} Any arguments, which are passed through to the observing
 *              functions.
 */
ObservableEvent.prototype.notifyObservers = function () {
  var args = Array.prototype.slice.call( arguments, 0 );
  this.observerList_.forEach(function (observer) {
    observer.toCall.apply(observer.thisArg, args);
  });
};
},{}],116:[function(require,module,exports){
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
 * @fileoverview Logging API to control log levels and support different browsers
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
'use strict';

/**
 * A logger instance
 * @constructor
 * @param {Console} window console API
 * @param {LogLevel} verbosity
 */
var NetSimLogger = function (outputConsole, verbosity /*=VERBOSE*/) {
  /**
   * @type {Console}
   * @private
   */
  this.outputConsole_ = outputConsole;

  /**
   * Always mapped to console.log, or no-op if not available.
   * @type {Function}
   * @private
   */
  this.log_ = function () {};

  /**
   * If configured for info logging, gets mapped to console.info,
   * falls back to console.log, or no-op.
   * @type {Function}
   */
  this.info = function () {};

  /**
   * If configured for warning logging, gets mapped to console.warn,
   * falls back to console.log, or no-op.
   * @type {Function}
   */
  this.warn = function () {};

  /**
   * If configured for error logging, gets mapped to console.error,
   * falls back to console.log, or no-op.
   * @type {Function}
   */
  this.error = function () {};

  this.initializeWithVerbosity_((undefined === verbosity) ?
      LogLevel.VERBOSE : verbosity);
};
module.exports = NetSimLogger;

/**
 * Log verbosity levels enum.
 * @readonly
 * @enum {number}
 */
var LogLevel = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  VERBOSE: 4
};
NetSimLogger.LogLevel = LogLevel;

/**
 * Binds internal function calls according to given verbosity level.
 * @param verbosity
 * @private
 */
NetSimLogger.prototype.initializeWithVerbosity_ = function (verbosity) {
  this.log_ = (this.outputConsole_ && this.outputConsole_.log) ?
      this.outputConsole_.log.bind(this.outputConsole_) : function () {};

  if (verbosity >= LogLevel.INFO) {
    this.info = (this.outputConsole_ && this.outputConsole_.info) ?
        this.outputConsole_.info.bind(this.outputConsole_) : this.log_;
  } else {
    this.info = function () {};
  }

  if (verbosity >= LogLevel.WARN) {
    this.warn = (this.outputConsole_ && this.outputConsole_.warn) ?
        this.outputConsole_.warn.bind(this.outputConsole_) : this.log_;
  } else {
    this.warn = function () {};
  }

  if (verbosity >= LogLevel.ERROR) {
    this.error = (this.outputConsole_ && this.outputConsole_.error) ?
        this.outputConsole_.error.bind(this.outputConsole_) : this.log_;
  } else {
    this.error = function () {};
  }
};

/**
 * Writes to output, depending on log level
 * @param {*} message
 * @param {LogLevel} logLevel
 */
NetSimLogger.prototype.log = function (message, logLevel /*=INFO*/) {
  if (undefined === logLevel) {
    logLevel = LogLevel.INFO;
  }

  switch (logLevel) {
    case LogLevel.ERROR:
      this.error(message);
      break;
    case LogLevel.WARN:
      this.warn(message);
      break;
    case LogLevel.INFO:
      this.info(message);
      break;
    default:
      this.log_(message);
  }
};

},{}],111:[function(require,module,exports){
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
 * @fileoverview Interface to dashboard user data API.
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

// TODO (bbuchanan): This whole file should go away when we have a shared
//                   Javascript User object that can be available on page load.

/**
 * Represents a Dashboard user account - could be a teacher, a student, etc.
 * @constructor
 */
var DashboardUser = function () {
  /**
   * Indicates whether the async call has completed yet.
   * @type {boolean}
   */
  this.isReady = false;

  /**
   * Queue of callbacks to hit when this object gets initialized.
   * @type {Array[Function]}
   * @private
   */
  this.whenReadyCallbacks_ = [];

  /**
   * User ID
   * @type {number}
   */
  this.id = undefined;

  /**
   * User display name
   * @type {string}
   */
  this.name = "";
};
module.exports = DashboardUser;

/**
 * @type {DashboardUser}
 * @private
 * @static
 */
DashboardUser.currentUser_ = null;

/**
 * Have the current user object passed to a given callback.
 * @param callback(currentUser) which can be called immediately if this
 *   value is cached.
 */
DashboardUser.getCurrentUser = function () {
  if (!DashboardUser.currentUser_) {
    DashboardUser.currentUser_ = new DashboardUser();
    $.ajax({
      url: '/v2/user',
      type: 'get',
      dataType: 'json',
      success: function (data /*, textStatus, jqXHR*/) {
        DashboardUser.currentUser_.initialize_(data);
      },
      error: function (/*jqXHR, textStatus, errorThrown*/) {
        throw new Error("Unable to retrieve current user info.");
      }
    });
  }
  return DashboardUser.currentUser_;
};

/**
 * Load data into user from async request, when ready.
 * @param data
 * @private
 */
DashboardUser.prototype.initialize_ = function (data) {
  this.id = data.id;
  this.name = data.name;
  this.isReady = true;

  // Call any queued callbacks
  this.whenReadyCallbacks_.forEach(function (callback) {
    callback(this);
  }.bind(this));
  this.whenReadyCallbacks_ = [];
};

/**
 * Provide code to be called when this object is ready to use
 * Possible for it to be called immediately.
 * @param callback
 */
DashboardUser.prototype.whenReady = function (callback) {
  if (this.isReady) {
    callback(this);
  } else {
    this.whenReadyCallbacks_.push(callback);
  }
};
},{}],16:[function(require,module,exports){
/**
 * Code.org Apps
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
 * @fileoverview Interface to application storage API on pegasus/dashboard
 */

/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 4,
 maxstatements: 200
 */
/* global $ */
/* global JSON */
'use strict';

/** Namespace for app storage. */
var appsApi = module.exports;

var ApiRequestHelper = function (baseUrl) {
  this.apiBaseUrl_ = baseUrl;
};

ApiRequestHelper.prototype.get = function (localUrl, callback, failureValue) {
  $.ajax({
    url: this.apiBaseUrl_ + localUrl,
    type: 'get',
    dataType: 'json'
  }).done(function (result /*, text*/) {
    callback(result);
  }).fail(function (/*request, status, error*/) {
    callback(failureValue);
  });
};

ApiRequestHelper.prototype.post = function (localUrl, data, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + localUrl,
    type: 'post',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(data)
  }).done(function (/*result, text*/) {
    callback(true);
  }).fail(function (/*request, status, error*/) {
    callback(false);
  });
};

ApiRequestHelper.prototype.postToGet = function (localUrl, data, callback,
    failureValue) {
  $.ajax({
    url: this.apiBaseUrl_ + localUrl,
    type: 'post',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(data)
  }).done(function (result /*, text*/) {
    callback(result);
  }).fail(function (/*request, status, error*/) {
    callback(failureValue);
  });
};

ApiRequestHelper.prototype.delete = function (localUrl, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + localUrl,
    type: 'delete'
  }).done(function (/*result, text*/) {
    callback(true);
  }).fail(function (/*request, status, error*/) {
    callback(false);
  });
};

/**
 * API for master apps table on the server.
 * @constructor
 */
appsApi.AppsTable = function () {
  this.requestHelper_ = new ApiRequestHelper('/v3/apps');
};

/**
 * @param {!function} callback
 */
appsApi.AppsTable.prototype.readAll = function (callback) {
  this.requestHelper_.get('', callback, null);
};

/**
 * @param {!string} id - unique app GUID
 * @param {!function} callback
 */
appsApi.AppsTable.prototype.read = function (id, callback) {
  this.requestHelper_.get('/' + id, callback, undefined);
};

/**
 * @param {!Object} value
 * @param {!function} callback
 */
appsApi.AppsTable.prototype.create = function (value, callback) {
  this.requestHelper_.postToGet('', value, callback, undefined);
};

/**
 * @param {!string} id
 * @param {!Object} value
 * @param {!function} callback
 */
appsApi.AppsTable.prototype.update = function (id, value, callback) {
  this.requestHelper_.post('/' + id, value, callback);
};

/**
 * @param {!string} id
 * @param {!function} callback
 */
appsApi.AppsTable.prototype.delete = function (id, callback) {
  this.requestHelper_.delete('/' + id, callback);
};

/**
 * App-specific Shared Storage Table
 * Data stored in this table can by modified and retrieved by all users of
 * a particular app, but is not shared between apps.
 * Only real difference with parent class AppsTable is that these
 * tables deal in numeric row IDs, not string GUIDs.  Implementation
 * shouldn't care though.
 * @constructor
 * @augments appsApi.AppsTable
 */
appsApi.SharedTable = function (app_publickey, table_name) {
  appsApi.AppsTable.call(this);
  /** Shared tables just use a different base URL */
  this.requestHelper_ = new ApiRequestHelper('/v3/apps/' + app_publickey +
  '/shared-tables/' + table_name);
};
appsApi.SharedTable.prototype = Object.create(appsApi.AppsTable.prototype);
appsApi.SharedTable.prototype.constructor = appsApi.SharedTable;

/**
 * App-specific User Storage Table
 * Data stored in this table can only be modified and retrieved by a particular
 * user of an app.
 * @constructor
 * @augments appsApi.AppsTable
 */
appsApi.UserTable = function (app_publickey, table_name) {
  appsApi.AppsTable.call(this);
  /** User tables just use a different base URL */
  this.requestHelper_ = new ApiRequestHelper('/v3/apps/' + app_publickey +
  '/user-tables/' + table_name);
};
appsApi.UserTable.prototype = Object.create(appsApi.AppsTable.prototype);
appsApi.UserTable.prototype.constructor = appsApi.UserTable;

/**
 * API for interacting with app property bags on the server.
 * This property bag is shared between all users of the app.
 *
 * @param {!string} app_publickey
 * @constructor
 */
appsApi.PropertyBag = function (app_publickey) {
  this.requestHelper_ = new ApiRequestHelper('/v3/apps' + app_publickey +
      '/shared-properties');
};

appsApi.PropertyBag.prototype.readAll = function (callback) {
  this.requestHelper_.get('', callback, null);
};

appsApi.PropertyBag.prototype.read = function (key, callback) {
  this.requestHelper_.get('/' + key, callback, undefined);
};

appsApi.PropertyBag.prototype.set = function (key, value, callback) {
  this.requestHelper_.post('/' + key, value, callback);
};

appsApi.PropertyBag.prototype.delete = function (key, callback) {
  this.requestHelper_.delete('/' + key, callback);
};

/**
 * App-specific User-specific property bag
 * Only accessible to the current user of the particular app.
 * @param app_publickey
 * @constructor
 * @augments appsApi.PropertyBag
 */
appsApi.UserPropertyBag = function (app_publickey) {
  appsApi.PropertyBag.call(this, app_publickey);
  /** User property bags just use a different base URL */
  this.requestHelper_ = new ApiRequestHelper('/v3/apps/' + app_publickey +
  '/user-properties');
};
appsApi.UserPropertyBag.prototype = Object.create(appsApi.PropertyBag.prototype);
appsApi.UserPropertyBag.prototype.constructor = appsApi.UserPropertyBag;
},{}]},{},[128]);
