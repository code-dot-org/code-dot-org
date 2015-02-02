require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({118:[function(require,module,exports){
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

},{"../StudioApp":2,"../appMain":3,"./levels":117,"./netsim":119,"./skins":122}],122:[function(require,module,exports){
var skinBase = require('../skins');

exports.load = function (assetUrl, id) {
  var skin = skinBase.load(assetUrl, id);
  return skin;
};

},{"../skins":125}],119:[function(require,module,exports){
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

var dom = require('../dom');
var page = require('./page.html');
var NetSimConnection = require('./NetSimConnection');
var NetSimLogger = require('./NetSimLogger');
var DashboardUser = require('./DashboardUser');
var NetSimLobby = require('./NetSimLobby');
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
   * Instance of logging API, gives us choke-point control over log output
   * @type {NetSimLogger}
   * @private
   */
  this.logger_ = new NetSimLogger(console, NetSimLogger.LogLevel.VERBOSE);

  /**
   * Manager for connection to shared instance of netsim app.
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
      this.onSendButtonClick_.bind(this)
  );
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
    this.connection_ = new NetSimConnection(userName, this.logger_);
    this.runLoop_.tick.register(this.connection_, this.connection_.tick);
    this.logger_.log("Connection manager created.");

    var lobbyContainer = document.getElementById('netsim_lobby_container');
    this.lobbyControl_ = NetSimLobby.createWithin(lobbyContainer, this.connection_);
    this.runLoop_.tick.register(this.lobbyControl_, this.lobbyControl_.tick);
    this.logger_.log("Lobby control created.");
  }.bind(this));

  // Begin the main simulation loop
  this.runLoop_.begin();
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

},{"../dom":43,"./DashboardUser":109,"./NetSimConnection":110,"./NetSimLobby":112,"./NetSimLogger":113,"./RunLoop":115,"./controls.html":116,"./page.html":121}],121:[function(require,module,exports){
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
var helpArea = function(html) {; buf.push('  ');32; if (html) {; buf.push('    <div id="helpArea">\n      ', (33,  html ), '\n    </div>\n  ');35; }; buf.push('');35; };; buf.push('\n<div id="appcontainer">\n  <div id="netsim">\n    <div id="netsim_lobby_container"></div>\n    <hr/>\n    <textarea id="netsim_inputbox"></textarea>\n    <input id="netsim_sendbutton" type="button" value="Send" />\n    <textarea id="netsim_recievelog"></textarea>\n  </div>\n  <div id="footers" dir="', escape((44,  data.localeDirection )), '">\n    ');45; instructions() ; buf.push('\n    ');46; helpArea(data.helpHtml) ; buf.push('\n  </div>\n</div>\n\n<div class="clear"></div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/current/common":170,"../../locale/current/netsim":175,"ejs":186}],117:[function(require,module,exports){
/*jshint multistr: true */

var msg = require('../../locale/current/netsim');

/*
 * Configuration for all levels.
 */
var levels = module.exports = {};

levels.netsim_demo = {
  'freePlay': true
};

},{"../../locale/current/netsim":175}],175:[function(require,module,exports){
/*netsim*/ module.exports = window.blockly.appLocale;
},{}],116:[function(require,module,exports){
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
},{"ejs":186}],115:[function(require,module,exports){
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

  /**
   *
   * @type {ObservableEvent}
   */
  this.tick = new ObservableEvent();

  /**
   *
   * @type {ObservableEvent}
   */
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
   * TODO (bbuchanan) : Could wrap this to absolutely be time-since-begin
   *                    independent of implementation.
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

/**
 * Start the run loop (runs immediately)
 */
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

},{"./ObservableEvent":114}],112:[function(require,module,exports){
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
  $(this.instanceSelector_).change(this.onInstanceSelectorChange_.bind(this));

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
  var self = this;
  // TODO (bbuchanan) : Use unique level ID when generating instance ID
  var levelID = 'demo';
  var instanceSelector = this.instanceSelector_;
  this.getUserSections_(function (data) {
    $(instanceSelector).empty();

    if (0 === data.length){
      // If we didn't get any sections, we must deny access
      $('<option>')
          .val('__none')
          .html('-- NONE FOUND --')
          .appendTo(instanceSelector);
      return;
    } else {
      // If we have more than one section, require the user
      // to pick one.
      $('<option>')
          .val('__none')
          .html('-- PICK ONE --')
          .appendTo(instanceSelector);
    }

    // Add all instances to the dropdown
    data.forEach(function (section) {
      // TODO (bbuchanan) : Put teacher names in sections
      $('<option>')
          .val('netsim_' + levelID + '_' + section.id)
          .html(section.name)
          .appendTo(instanceSelector);
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
      var item = $('<li>');
      if (connection.id === self.connection_.myLobbyRowID_) {
        item.addClass('netsim_lobby_own_row');
        item.html(connection.name + ' : ' + connection.status + ' : Me');
      } else {
        item.addClass('netsim_lobby_user_row');
        $('<a>')
            .attr('href', '#')
            .html(connection.name + ' : ' + connection.status)
            .appendTo(item);
      }
      item.appendTo(lobbyList);
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
  // TODO (bbuchanan): Wrap this away into a shared library for the v2/sections api
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
  // TODO (bbuchanan) : Extract "interval" method generator for this and connection.
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
},{"./NetSimLobby.html":111}],111:[function(require,module,exports){
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
 buf.push('<div id="netsim_lobby">\n  <label for="netsim_instance_select">My Section:</label>\n  <select id="netsim_instance_select">\n    <option selected value="__none">Loading...</option>\n  </select>\n  <ul id="netsim_lobby_list"></ul>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":186}],110:[function(require,module,exports){
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

var netsimStorage = require('./netsimStorage');
var NetSimLogger = require('./NetSimLogger');
var LogLevel = NetSimLogger.LogLevel;
var ObservableEvent = require('./ObservableEvent');

/**
 * How often a keep-alive message should be sent to the instance lobby
 * @type {number}
 * @const
 */
var KEEP_ALIVE_INTERVAL_MS = 2000;

/**
 * Milliseconds before a client is considered 'disconnected' and
 * can be cleaned up by another client.
 * @type {number}
 * @const
 */
var CONNECTION_TIMEOUT_MS = 30000;

/**
 * A connection to a NetSim instance
 * @param {string} displayName - Name for person on local end
 * @param {NetSimLogger} logger - A log control interface, default nullimpl
 * @constructor
 */
var NetSimConnection = function (displayName, logger /*=new NetSimLogger(NONE)*/) {
  /**
   * Display name for user on local end of connection, to be uploaded to others.
   * @type {string}
   * @private
   */
  this.displayName_ = displayName;

  /**
   * Instance of logging API, gives us choke-point control over log output
   * @type {NetSimLogger}
   * @private
   */
  this.logger_ = logger;
  if (undefined === this.logger_) {
    this.logger_ = new NetSimLogger(console, LogLevel.NONE);
  }

  /**
   * Access object for instance lobby
   * @type {netsimStorage.SharedStorageTable}
   * @private
   */
  this.lobbyTable_ = null;

  /**
   * This connection's unique Row ID within the lobby table.
   * If undefined, we aren't connected to an instance.
   * @type {number}
   */
  this.myLobbyRowID_ = undefined;

  /**
   * Allows others to subscribe to connection status changes.
   * args: none
   * Notifies on:
   * - Connect to instance
   * - Disconnect from instance
   * @type {ObservableEvent}
   */
  this.statusChanges = new ObservableEvent();

  /**
   * When the next keepAlive update should be sent to the lobby
   * @type {Number}
   * @private
   */
  this.nextKeepAliveTime_ = Infinity;

  // Bind to onBeforeUnload event to attempt graceful disconnect
  window.addEventListener('beforeunload', this.onBeforeUnload_.bind(this));
};
module.exports = NetSimConnection;

/**
 * Instance Connection Status enum
 * @readonly
 * @enum {number}
 */
var ConnectionStatus = {
  DISCONNECTED: 0,
  CONNECTED: 1
};
NetSimConnection.ConnectionStatus = ConnectionStatus;

/**
 * Before-unload handler, used to try and disconnect gracefully when
 * navigating away instead of just letting our record time out.
 * @private
 */
NetSimConnection.prototype.onBeforeUnload_ = function () {
  if (this.isConnectedToInstance()) {
    this.disconnectFromInstance();
  }
};

/**
 * Helper that builds a lobby-table row in a consistent
 * format, based on the current connection state.
 * @private
 */
NetSimConnection.prototype.buildLobbyRow_ = function () {
  return {
    lastPing: Date.now(),
    name: this.displayName_,
    type: 'user',
    status: 'In Lobby'
  };
};

/**
 * Establishes a new connection to a netsim instance, closing the old one
 * if present.
 * @param {string} instanceID
 */
NetSimConnection.prototype.connectToInstance = function (instanceID) {
  if (this.isConnectedToInstance()) {
    this.logger_.log("Auto-closing previous connection...", LogLevel.WARN);
    this.disconnectFromInstance();
  }

  // Create and cache a lobby table connection
  var tableName = instanceID + '_lobby';
  this.lobbyTable_ = new netsimStorage.SharedStorageTable(
     netsimStorage.APP_PUBLIC_KEY, tableName);

  // Connect to the lobby table we just set
  this.connect_();
};

/**
 * Ends the connection to the netsim instance.
 */
NetSimConnection.prototype.disconnectFromInstance = function () {
  if (!this.isConnectedToInstance()) {
    this.logger_.log("Redundant disconnect call.", LogLevel.WARN);
    return;
  }

  // TODO (bbuchanan) : Check for other resources we need to clean up
  //                    before we disconnect from the instance.

  this.disconnectByRowID_(this.myLobbyRowID_);
  this.setConnectionStatus_(ConnectionStatus.DISCONNECTED);
};

/**
 * Given a lobby table has already been configured, connects to that table
 * by inserting a row for ourselves into that table and saving the row ID.
 * @private
 */
NetSimConnection.prototype.connect_ = function () {
  var self = this;
  this.lobbyTable_.insert(this.buildLobbyRow_(), function (returnedData) {
    if (returnedData) {
      self.setConnectionStatus_(ConnectionStatus.CONNECTED, returnedData.id);
    } else {
      // TODO (bbuchanan) : Connect retry?
      self.logger_.log("Failed to connect to instance", LogLevel.ERROR);
    }
  });
};

/**
 * Helper method that can remove/disconnect any row from the lobby.
 * @param lobbyRowID
 * @private
 */
NetSimConnection.prototype.disconnectByRowID_ = function (lobbyRowID) {
  if (!this.isConnectedToInstance()) {
    this.logger_.log("Can't disconnect when not connected to an instance.",
        LogLevel.ERROR);
    return;
  }

  var self = this;
  this.lobbyTable_.delete(lobbyRowID, function (succeeded) {
    if (succeeded) {
      self.logger_.log("Disconnected client " + lobbyRowID + " from instance.",
          LogLevel.INFO);
    } else {
      // TODO (bbuchanan) : Disconnect retry?
      self.logger_.log("Failed to disconnect client " + lobbyRowID + ".",
          LogLevel.WARN);
    }
  });
};

/**
 * Whether we are currently connected to a netsim instance
 * @returns {boolean}
 */
NetSimConnection.prototype.isConnectedToInstance = function () {
  return (undefined !== this.myLobbyRowID_);
};

/**
 *
 * @param {ConnectionStatus} newStatus
 * @param {number} lobbyRowID - Can be omitted for status DISCONNECTED
 * @private
 */
NetSimConnection.prototype.setConnectionStatus_ = function (newStatus, lobbyRowID) {
  switch (newStatus) {
    case ConnectionStatus.CONNECTED:
        this.myLobbyRowID_ = lobbyRowID;
        this.nextKeepAliveTime_ = 0;
        this.logger_.log("Connected to instance, assigned ID " +
            this.myLobbyRowID_, LogLevel.INFO);
        break;

    case ConnectionStatus.DISCONNECTED:
        this.myLobbyRowID_ = undefined;
        this.nextKeepAliveTime_ = Infinity;
        this.logger_.log("Disconnected from instance", LogLevel.INFO);
      break;
  }
  this.statusChanges.notifyObservers();
};

NetSimConnection.prototype.keepAlive = function () {
  if (!this.isConnectedToInstance()) {
    this.logger_.log("Can't send keepAlive, not connected to instance.", LogLevel.WARN);
    return;
  }

  var self = this;
  this.lobbyTable_.update(this.myLobbyRowID_, this.buildLobbyRow_(),
      function (succeeded) {
        if (!succeeded) {
          self.setConnectionStatus_(ConnectionStatus.DISCONNECTED);
          self.logger_.log("Reconnecting...", LogLevel.INFO);
          self.connect_();
        }
  });
};

NetSimConnection.prototype.getLobbyListing = function (callback) {
  if (!this.isConnectedToInstance()) {
    this.logger_.log("Can't get lobby rows, not connected to instance.", LogLevel.WARN);
    callback([]);
    return;
  }

  var logger = this.logger_;
  this.lobbyTable_.all(function (data) {
    if (null !== data) {
      callback(data);
    } else {
      logger.log("Lobby data request failed, using empty list.", LogLevel.WARN);
      callback([]);
    }
  });
};

/**
 *
 * @param {RunLoop.Clock} clock
 */
NetSimConnection.prototype.tick = function (clock) {
  if (clock.time >= this.nextKeepAliveTime_) {
    this.keepAlive();

    // TODO (bbuchanan): Need a better policy for when to do this.  Or, we
    //                   might not need to once we have auto-expiring rows.
    this.cleanLobby_();

    if (this.nextKeepAliveTime_ === 0) {
      this.nextKeepAliveTime_ = clock.time + KEEP_ALIVE_INTERVAL_MS;
    } else {
      // Stable increment
      while (this.nextKeepAliveTime_ < clock.time) {
        this.nextKeepAliveTime_ += KEEP_ALIVE_INTERVAL_MS;
      }
    }
  }
};

/**
 * Triggers a sweep of the lobby table that removes timed-out client rows.
 * @private
 */
NetSimConnection.prototype.cleanLobby_ = function () {
  var self = this;
  var now = Date.now();
  this.getLobbyListing(function (lobbyData) {
    lobbyData.forEach(function (lobbyRow) {
      if (now - lobbyRow.lastPing >= CONNECTION_TIMEOUT_MS) {
        self.disconnectByRowID_(lobbyRow.id);
      }
    });
  });
};
},{"./NetSimLogger":113,"./ObservableEvent":114,"./netsimStorage":120}],120:[function(require,module,exports){
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
 * @fileoverview Interface to application storage API on pegasus/dashboard
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

/**
 * Namespace for app storage.
 */
var netsimStorage = module.exports;

/**
 * App key, unique to netsim, used for connecting with the storage API.
 * @type {string}
 */
// TODO (bbuchanan): remove once we can store ids for each app? (userid:1 apppid:42)
netsimStorage.APP_PUBLIC_KEY =
    window.location.hostname.split('.')[0] === 'localhost' ?
        "JGW2rHUp_UCMW_fQmRf6iQ==" : "HQJ8GCCMGP7Yh8MrtDusIA==";

/**
 * API for interacting with an app storage table on the server
 * @constructor
 */
var SharedStorageTable = function (app_publickey, table_name) {

  /**
   * Base url for requests to interact with the shared table
   * @type {string}
   * @private
   */
  this.apiBaseUrl_ = '/v3/apps/' + app_publickey + '/shared-tables/' + table_name;
};
netsimStorage.SharedStorageTable = SharedStorageTable;

/**
 * Retrieve all rows from the table
 * @param callback - Takes data as argument, accepts null if request fails.
 */
SharedStorageTable.prototype.all = function (callback) {
  $.ajax({
    url: this.apiBaseUrl_,
    type: "get",
    dataType: "json"
  }).done(function(data /*, text*/) {
    callback(data);
  }).fail(function(/*request, status, error*/) {
    callback(null);
  });
};

/**
 * Retrieve row with given id from shared table
 * @param id - Row ID
 * @param callback - Takes data as argument, undefined if request fails
 */
SharedStorageTable.prototype.fetch = function (id, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + "/" + id,
    type: "get",
    dataType: "json"
  }).done(function(data /*, text*/) {
    callback(data);
  }).fail(function(/*request, status, error*/) {
    callback(undefined);
  });
};

/**
 * Insert a new row to shared table
 * @param {Object} value - Row content
 * @param callback - Takes data as argument, undefined if request fails
 *   Data will be inserted row with row ID
 */
SharedStorageTable.prototype.insert = function (value, callback) {
  $.ajax({
    url: this.apiBaseUrl_,
    type: "post",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(value)
  }).done(function(data /*, text*/) {
    callback(data);
  }).fail(function(/*request, status, error*/) {
    callback(undefined);
  });
};

/**
 * Update a row in the shared table
 * @param id - Row ID
 * @param value - new row value
 * @param callback - Takes {boolean} success as an argument.
 */
SharedStorageTable.prototype.update = function (id, value, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + "/" + id,
    type: "post",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(value)
  }).done(function(/*data, text*/) {
    callback(true);
  }).fail(function(/*request, status, error*/) {
    callback(false);
  });
};

/**
 * Delete a row in the shared table
 * @param id - Row ID
 * @param callback - Takes {boolean} success as an argument.
 */
SharedStorageTable.prototype.delete = function (id, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + "/" + id + "/delete",
    type: "post",
    dataType: "json"
  }).done(function(/*data, text*/) {
    callback(true);
  }).fail(function(/*request, status, error*/) {
    callback(false);
  });
};

},{}],114:[function(require,module,exports){
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
},{}],113:[function(require,module,exports){
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

},{}],109:[function(require,module,exports){
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
},{}]},{},[118]);
