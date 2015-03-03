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
var NetSimTabsComponent = require('./NetSimTabsComponent');
var NetSimSendWidget = require('./NetSimSendWidget');
var NetSimLogWidget = require('./NetSimLogWidget');
var RunLoop = require('../RunLoop');

/**
 * The top-level Internet Simulator controller.
 * @param {StudioApp} studioApp The studioApp instance to build upon.
 */
var NetSim = module.exports = function () {
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
   * Reference to currently connected simulation router.
   * @type {NetSimRouterNode}
   * @private
   */
  this.myConnectedRouter_ = null;

  /**
   * Tick and Render loop manager for the simulator
   * @type {RunLoop}
   * @private
   */
  this.runLoop_ = new RunLoop();

  /**
   * Current encoding mode; 'all' or 'binary' or 'ascii', etc.
   * @type {string}
   * @private
   */
  this.encodingMode_ = 'binary';

  /**
   * Current chunk size (bytesize)
   * @type {number}
   * @private
   */
  this.chunkSize_ = 8;

  /**
   * Current dns mode.
   * Valid values 'none', 'manual', 'automatic'
   * TODO: Move these to an enum
   * @type {string}
   * @private
   */
  this.dnsMode_ = 'none';
};


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

  this.connection_ = new NetSimConnection(window, this.sentMessageLog_,
      this.receivedMessageLog_);
  this.connection_.attachToRunLoop(this.runLoop_);
  this.connection_.statusChanges.register(this.refresh_.bind(this));
  this.connection_.shardChange.register(this.onShardChange_.bind(this));

  var lobbyContainer = document.getElementById('netsim_lobby_container');
  this.lobbyControl_ = NetSimLobby.createWithin(lobbyContainer,
      this.connection_, user, this.getOverrideShardID());

  // Tab panel - contains instructions, my device, router, dns
  this.tabs_ = new NetSimTabsComponent(
      $('#netsim_tabs'),
      this.setChunkSize.bind(this),
      this.changeEncoding.bind(this),
      this.changeRemoteDnsMode.bind(this),
      this.becomeDnsNode.bind(this));

  var sendWidgetContainer = document.getElementById('netsim_send');
  this.sendWidget_ = NetSimSendWidget.createWithin(sendWidgetContainer,
      this.connection_);

  this.changeEncoding(this.encodingMode_);
  this.setChunkSize(this.chunkSize_);
  this.setDnsMode(this.dnsMode_);
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
 * Update encoding-view setting across the whole app.
 *
 * Propogates the change down into relevant child components, possibly
 * including the control that initiated the change; in that case, re-setting
 * the value should be a no-op and safe to do.
 *
 * @param {string} newEncoding
 */
NetSim.prototype.changeEncoding = function (newEncoding) {
  this.encodingMode_ = newEncoding;
  this.tabs_.setEncoding(newEncoding);
  this.receivedMessageLog_.setEncoding(newEncoding);
  this.sentMessageLog_.setEncoding(newEncoding);
  this.sendWidget_.setEncoding(newEncoding);
};

/**
 * Update chunk-size/bytesize setting across the whole app.
 *
 * Propogates the change down into relevant child components, possibly
 * including the control that initiated the change; in that case, re-setting
 * the value should be a no-op and safe to do.
 *
 * @param {number} newChunkSize
 */
NetSim.prototype.setChunkSize = function (newChunkSize) {
  this.chunkSize_ = newChunkSize;
  this.tabs_.setChunkSize(newChunkSize);
  this.receivedMessageLog_.setChunkSize(newChunkSize);
  this.sentMessageLog_.setChunkSize(newChunkSize);
  this.sendWidget_.setChunkSize(newChunkSize);
};

/**
 * Update DNS mode across the whole app.
 *
 * Propogates the change down into relevant child components, possibly
 * including the control that initiated the change; in that case, re-setting
 * the value should be a no-op and safe to do.
 *
 * @param {"none"|"manual"|"automatic"} newDnsMode
 */
NetSim.prototype.setDnsMode = function (newDnsMode) {
  this.dnsMode_ = newDnsMode;
  this.tabs_.setDnsMode(newDnsMode);
};

/**
 * Sets DNS mode across the whole simulation, propagating the change
 * to other clients.
 * @param {string} newDnsMode
 */
NetSim.prototype.changeRemoteDnsMode = function (newDnsMode) {
  this.setDnsMode(newDnsMode);
  if (this.myConnectedRouter_) {
    var router = this.myConnectedRouter_;
    router.dnsMode = newDnsMode;
    router.update();
  }
};

/**
 * @param {boolean} isDnsNode
 */
NetSim.prototype.setIsDnsNode = function (isDnsNode) {
  this.tabs_.setIsDnsNode(isDnsNode);
  if (this.myConnectedRouter_) {
    this.setDnsTableContents(this.myConnectedRouter_.getAddressTable());
  }
};

/**
 * Tells simulation that we want to become the DNS node for our
 * connected router.
 */
NetSim.prototype.becomeDnsNode = function () {
  this.setIsDnsNode(true);
  if (this.connection_&&
      this.connection_.myNode &&
      this.connection_.myNode.myRouter) {
    // STATE IS THE ROOT OF ALL EVIL
    var myNode = this.connection_.myNode;
    var router = myNode.myRouter;
    router.dnsNodeID = myNode.entityID;
    router.update();
  }
};

/**
 * @param {Array} tableContents
 */
NetSim.prototype.setDnsTableContents = function (tableContents) {
  this.tabs_.setDnsTableContents(tableContents);
};

/**
 * @param {Array} logData
 */
NetSim.prototype.setRouterLogData = function (logData) {
  this.tabs_.setRouterLogData(logData);
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

/**
 * Called whenever the connection notifies us that we've connected to,
 * or disconnected from, a shard.
 * @param {NetSimShard} newShard - null if disconnected.
 * @param {NetSimLocalClientNode} localNode - null if disconnected
 * @private
 */
NetSim.prototype.onShardChange_= function (newShard, localNode) {
  if (localNode) {
    localNode.routerChange.register(this.onRouterChange_.bind(this));
  }
};

/**
 * Called whenever the local node notifies that we've been connected to,
 * or disconnected from, a router.
 * @param {NetSimWire} wire - null if disconnected.
 * @param {NetSimRouterNode} router - null if disconnected
 * @private
 */
NetSim.prototype.onRouterChange_ = function (wire, router) {

  // Unhook old handlers
  if (this.routerStateChangeKey !== undefined) {
    this.myConnectedRouter_.stateChange.unregister(this.routerStateChangeKey);
    this.routerStateChangeKey = undefined;
  }

  if (this.routerWireChangeKey !== undefined) {
    this.myConnectedRouter_.wiresChange.unregister(this.routerWireChangeKey);
    this.routerWireChangeKey = undefined;
  }

  if (this.routerLogChangeKey !== undefined) {
    this.myConnectedRouter_.logChange.unregister(this.routerLogChangeKey);
    this.routerLogChangeKey = undefined;
  }

  this.myConnectedRouter_ = router;

  // Hook up new handlers
  if (router) {
    // Propagate change
    this.setDnsMode(router.dnsMode);

    // Hook up new handlers
    this.routerStateChangeKey = router.stateChange.register(
        this.onRouterStateChange_.bind(this));

    this.routerWireChangeKey = router.wiresChange.register(
        this.onRouterWiresChange_.bind(this));

    this.routerLogChangeKey = router.logChange.register(
        this.onRouterLogChange_.bind(this));
  }
};

/**
 * @param {NetSimRouterNode} router
 * @private
 */
NetSim.prototype.onRouterStateChange_ = function (router) {
  var myNode = {};
  if (this.connection_ && this.connection_.myNode) {
    myNode = this.connection_.myNode;
  }

  this.setDnsMode(router.dnsMode);
  this.setIsDnsNode(router.dnsMode === 'manual' &&
      router.dnsNodeID === myNode.entityID);
};

NetSim.prototype.onRouterWiresChange_ = function () {
  if (this.myConnectedRouter_) {
    this.setDnsTableContents(this.myConnectedRouter_.getAddressTable());
  }
};

NetSim.prototype.onRouterLogChange_ = function () {
  if (this.myConnectedRouter_) {
    this.setRouterLogData(this.myConnectedRouter_.getLog());
  }
};