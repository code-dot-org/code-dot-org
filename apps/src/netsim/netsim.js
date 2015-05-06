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

var utils = require('../utils');
var _ = utils.getLodash();
var i18n = require('./locale');
var ObservableEvent = require('../ObservableEvent');
var RunLoop = require('../RunLoop');
var page = require('./page.html.ejs');
var netsimConstants = require('./netsimConstants');
var netsimUtils = require('./netsimUtils');
var DashboardUser = require('./DashboardUser');
var NetSimBitLogPanel = require('./NetSimBitLogPanel');
var NetSimLobby = require('./NetSimLobby');
var NetSimLocalClientNode = require('./NetSimLocalClientNode');
var NetSimLogger = require('./NetSimLogger');
var NetSimLogPanel = require('./NetSimLogPanel');
var NetSimRouterNode = require('./NetSimRouterNode');
var NetSimSendPanel = require('./NetSimSendPanel');
var NetSimShard = require('./NetSimShard');
var NetSimShardCleaner = require('./NetSimShardCleaner');
var NetSimStatusPanel = require('./NetSimStatusPanel');
var NetSimTabsComponent = require('./NetSimTabsComponent');
var NetSimVisualization = require('./NetSimVisualization');

var DnsMode = netsimConstants.DnsMode;
var MessageGranularity = netsimConstants.MessageGranularity;

var logger = NetSimLogger.getSingleton();
var netsimGlobals = require('./netsimGlobals');

/**
 * Initial time between connecting to the shard and starting
 * the first cleaning cycle.
 * @type {number}
 */
var INITIAL_CLEANING_DELAY_MS = 10000; // 10 seconds

/**
 * The top-level Internet Simulator controller.
 * @param {StudioApp} studioApp The studioApp instance to build upon.
 */
var NetSim = module.exports = function () {
  /**
   * @type {Object}
   */
  this.skin = null;

  /**
   * @type {netsimLevelConfiguration}
   */
  this.level = {};

  /**
   * @type {number}
   */
  this.heading = 0;

  /**
   * Current user object which asynchronously grabs the current user's
   * info from the dashboard API.
   * @type {DashboardUser}
   * @private
   */
  this.currentUser_ = DashboardUser.getCurrentUser();

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
   * @type {NetSimShardCleaner}
   * @private
   */
  this.shardCleaner_ = null;

  /**
   * The local client's node representation within the shard.
   * @type {NetSimLocalClientNode}
   */
  this.myNode = null;

  /**
   * Tick and Render loop manager for the simulator
   * @type {RunLoop}
   * @private
   */
  this.runLoop_ = new RunLoop();

  /**
   * Current chunk size (bytesize)
   * @type {number}
   * @private
   */
  this.chunkSize_ = 8;

  /**
   * The "my device" bitrate in bits per second
   * @type {number}
   * @private
   */
  this.myDeviceBitRate_ = Infinity;

  /**
   * Currently enabled encoding types.
   * @type {EncodingType[]}
   * @private
   */
  this.enabledEncodings_ = [];

  /**
   * Current dns mode.
   * @type {DnsMode}
   * @private
   */
  this.dnsMode_ = DnsMode.NONE;

  // -- Components --
  /**
   * @type {INetSimLogPanel}
   * @private
   */
  this.receivedMessageLog_ = null;

  /**
   * @type {INetSimLogPanel}
   * @private
   */
  this.sentMessageLog_ = null;

  /**
   * Event: Connected to, or disconnected from, a shard.
   * Specifically, added or removed our client node from the shard's node table.
   * @type {ObservableEvent}
   */
  this.shardChange = new ObservableEvent();
  this.shardChange.register(this.onShardChange_.bind(this));

  /**
   * Untyped storage for information about which events we have currently bound.
   * @type {Object}
   */
  this.eventKeys = {};
};

NetSim.prototype.injectStudioApp = function (studioApp) {
  this.studioApp_ = studioApp;
};

/**
 * Called on page load.
 * @param {Object} config
 * @param {Object} config.skin
 * @param {netsimLevelConfiguration} config.level
 * @param {boolean} config.enableShowCode - Always false for NetSim
 * @param {function} config.loadAudio
 * @param {string} config.html - rendered markup to be created inside this method
 */
NetSim.prototype.init = function(config) {
  if (!this.studioApp_) {
    throw new Error("NetSim requires a StudioApp");
  }

  // Set up global singleton for easy access to simulator-wide settings
  netsimGlobals.setRootControllers(this.studioApp_, this);

  /**
   * Skin for the loaded level
   * @type {Object}
   */
  this.skin = config.skin;

  /**
   * Configuration for the loaded level
   * @type {netsimLevelConfiguration}
   */
  this.level = netsimUtils.scrubLevelConfiguration_(config.level);

  config.html = page({
    assetUrl: this.studioApp_.assetUrl,
    data: {
      visualization: '',
      localeDirection: this.studioApp_.localeDirection(),
      controls: require('./controls.html.ejs')({assetUrl: this.studioApp_.assetUrl})
    },
    hideRunButton: true
  });

  config.enableShowCode = false;
  config.pinWorkspaceToBottom = true;
  config.loadAudio = this.loadAudio_.bind(this);

  // Override certain StudioApp methods - netsim does a lot of configuration
  // itself, because of its nonstandard layout.
  this.studioApp_.configureDom = this.configureDomOverride_.bind(this.studioApp_);
  this.studioApp_.onResize = this.onResizeOverride_.bind(this.studioApp_);

  this.studioApp_.init(config);

  // Create netsim lobby widget in page
  this.currentUser_.whenReady(function () {
    this.initWithUserName_(this.currentUser_);
  }.bind(this));

  // Begin the main simulation loop
  this.runLoop_.tick.register(this.tick.bind(this));
  this.runLoop_.begin();
};

/**
 * @param {RunLoop.Clock} clock
 */
NetSim.prototype.tick = function (clock) {
  if (this.isConnectedToShard()) {
    this.myNode.tick(clock);
    this.shard_.tick(clock);

    if (this.shardCleaner_) {
      this.shardCleaner_.tick(clock);
    }
  }
};

/**
 * Pull an identifier from the URL that separates this level's shard from others.
 * @returns {string}
 */
NetSim.prototype.getUniqueLevelKey = function () {
  return location.pathname.substr(1).replace(/\W/g, '-');
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
 * @returns {boolean} TRUE if the "disableCleaning" flag is found in the URL
 */
NetSim.prototype.shouldEnableCleanup = function () {
  return !location.search.match(/disableCleaning/i);
};

/**
 * @returns {boolean} TRUE if the level is configured to show any tabs.
 */
NetSim.prototype.shouldShowAnyTabs = function () {
  return this.level.showTabs.length > 0;
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

  // Create log panels according to level configuration
  if (this.level.messageGranularity === MessageGranularity.PACKETS) {
    this.receivedMessageLog_ = new NetSimLogPanel($('#netsim-received'), {
      logTitle: i18n.receivedMessageLog(),
      isMinimized: false,
      hasUnreadMessages: true,
      packetSpec: this.level.clientInitialPacketHeader
    });

    this.sentMessageLog_ = new NetSimLogPanel($('#netsim-sent'), {
      logTitle: i18n.sentMessageLog(),
      isMinimized: true,
      hasUnreadMessages: false,
      packetSpec: this.level.clientInitialPacketHeader
    });
  } else if (this.level.messageGranularity === MessageGranularity.BITS) {
    this.receivedMessageLog_ = new NetSimBitLogPanel($('#netsim-received'), {
      logTitle: i18n.receiveBits(),
      isMinimized: false,
      netsim: this,
      showReadWireButton: true
    });

    this.sentMessageLog_ = new NetSimBitLogPanel($('#netsim-sent'), {
      logTitle: i18n.sentBitsLog(),
      isMinimized: false,
      netsim: this
    });
  }

  this.statusPanel_ = new NetSimStatusPanel(
      $('#netsim-status'),
      {
        disconnectCallback: this.disconnectFromRemote.bind(this, function () {}),
        cleanShardNow: this.cleanShardNow.bind(this),
        expireHeartbeat: this.expireHeartbeat.bind(this)
      });


  this.visualization_ = new NetSimVisualization($('svg'), this.runLoop_, this);

  // Lobby panel: Controls for picking a remote node and connecting to it.
  this.lobby_ = new NetSimLobby(
      $('.lobby-panel'),
      this, {
        user: user,
        levelKey: this.getUniqueLevelKey(),
        sharedShardSeed: this.getOverrideShardID()
      });

  // Tab panel - contains instructions, my device, router, dns
  if (this.shouldShowAnyTabs()) {
    this.tabs_ = new NetSimTabsComponent(
        $('#netsim-tabs'),
        this.runLoop_,
        {
          chunkSizeSliderChangeCallback: this.setChunkSize.bind(this),
          myDeviceBitRateChangeCallback: this.setMyDeviceBitRate.bind(this),
          encodingChangeCallback: this.changeEncodings.bind(this),
          routerBandwidthSliderChangeCallback: this.setRouterBandwidth.bind(this),
          routerBandwidthSliderStopCallback: this.changeRemoteRouterBandwidth.bind(this),
          routerMemorySliderChangeCallback: this.setRouterMemory.bind(this),
          routerMemorySliderStopCallback: this.changeRemoteRouterMemory.bind(this),
          dnsModeChangeCallback: this.changeRemoteDnsMode.bind(this),
          becomeDnsCallback: this.becomeDnsNode.bind(this)
        });
    this.tabs_.attachToRunLoop(this.runLoop_);
}

  this.sendPanel_ = new NetSimSendPanel($('#netsim-send'), this.level,
      this);

  this.changeEncodings(this.level.defaultEnabledEncodings);
  this.setChunkSize(this.level.defaultChunkSizeBits);
  this.setMyDeviceBitRate(this.level.defaultBitRateBitsPerSecond);
  this.setRouterBandwidth(this.level.defaultRouterBandwidth);
  this.setRouterMemory(this.level.defaultRouterMemory);
  this.setDnsMode(this.level.defaultDnsMode);
  this.render();

  // Try and gracefully disconnect when closing the window
  window.addEventListener('beforeunload', this.onBeforeUnload_.bind(this));
  window.addEventListener('unload', this.onUnload_.bind(this));
  window.addEventListener('resize', _.debounce(this.updateLayout.bind(this), 250));
};

/**
 * Before-unload handler, used to warn the user (if necessary) of what they
 * are abandoning if they navigate away from the page.
 *
 * This event has some weird special properties and inconsistent behavior
 * across browsers
 *
 * See:
 * https://developer.mozilla.org/en-US/docs/Web/Events/beforeunload
 * http://www.zachleat.com/web/dont-let-the-door-hit-you-onunload-and-onbeforeunload/
 * http://www.hunlock.com/blogs/Mastering_The_Back_Button_With_Javascript
 *
 * @param {Event} event
 * @returns {string|undefined} If we want to warn the user before they leave
 *          the page, this method will return a warning string, which may or
 *          may not actually be used by the browser to present a warning.  If
 *          we don't want to warn the user, this method doesn't return anything.
 * @private
 */
NetSim.prototype.onBeforeUnload_ = function (event) {
  if (window.__TestInterface && window.__TestInterface.ignoreOnBeforeUnload) {
    return;
  }

  // No need to warn about navigating away if the student is not connected,
  // or is still in the lobby.
  if (this.isConnectedToRemote()) {
    event.returnValue = i18n.onBeforeUnloadWarning();
    return i18n.onBeforeUnloadWarning();
  }
};

/**
 * Unload handler.  Used to attempt a clean disconnect from the simulation
 * using synchronous AJAX calls to remove our own rows from remote storage.
 *
 * See:
 * https://developer.mozilla.org/en-US/docs/Web/Events/unload
 *
 * @private
 */
NetSim.prototype.onUnload_ = function () {
  if (this.isConnectedToShard()) {
    this.synchronousDisconnectFromShard_();
  }
};

/**
 * Whether we are currently connected to a netsim shard
 * @returns {boolean}
 */
NetSim.prototype.isConnectedToShard = function () {
  return (null !== this.myNode);
};

/**
 * Whether we are currently connected to a shard with the given ID
 * @param {string} shardID
 * @returns {boolean}
 */
NetSim.prototype.isConnectedToShardID = function (shardID) {
  return this.isConnectedToShard() && this.shard_.id === shardID;
};

/**
 * Establishes a new connection to a netsim shard, closing the old one
 * if present.
 * @param {!string} shardID
 * @param {!string} displayName
 */
NetSim.prototype.connectToShard = function (shardID, displayName) {
  if (this.isConnectedToShard()) {
    logger.warn("Auto-closing previous connection...");
    this.disconnectFromShard(this.connectToShard.bind(this, shardID, displayName));
    return;
  }

  this.shard_ = new NetSimShard(shardID);
  if (this.shouldEnableCleanup()) {
    this.shardCleaner_ = new NetSimShardCleaner(this.shard_,
        INITIAL_CLEANING_DELAY_MS);
  }
  this.createMyClientNode_(displayName, function (err, myNode) {
    this.myNode = myNode;
    this.shardChange.notifyObservers(this.shard_, this.myNode);
  }.bind(this));
};

/**
 * Given a lobby table has already been configured, connects to that table
 * by inserting a row for ourselves into that table and saving the row ID.
 * @param {!string} displayName
 * @param {!NodeStyleCallback} onComplete - result is new local node
 * @private
 */
NetSim.prototype.createMyClientNode_ = function (displayName, onComplete) {
  NetSimLocalClientNode.create(this.shard_, function (err, node) {
    if (err) {
      logger.error("Failed to create client node; " + err.message);
      return;
    }

    node.setDisplayName(displayName);
    node.setLostConnectionCallback(this.disconnectFromShard.bind(this));
    node.initializeSimulation(this.sentMessageLog_, this.receivedMessageLog_);
    node.update(function (err) {
      onComplete(err, node);
    });
  }.bind(this));
};

/**
 * Synchronous disconnect, for use when navigating away from the page
 * @private
 */
NetSim.prototype.synchronousDisconnectFromShard_ = function () {
  this.myNode.stopSimulation();
  this.myNode.synchronousDestroy();
  this.myNode = null;
  this.shardChange.notifyObservers(null, null);
};

/**
 * Ends the connection to the netsim shard.
 * @param {NodeStyleCallback} [onComplete]
 */
NetSim.prototype.disconnectFromShard = function (onComplete) {
  onComplete = onComplete || function () {};

  if (!this.isConnectedToShard()) {
    logger.warn("Redundant disconnect call.");
    onComplete(null, null);
    return;
  }

  if (this.isConnectedToRemote()) {
    // Disconnect, from the remote node, and try this again on completion.
    this.disconnectFromRemote(this.disconnectFromShard.bind(this, onComplete));
    return;
  }

  this.myNode.stopSimulation();
  this.myNode.destroy(function (err, result) {
    if (err) {
      logger.warn('Error destroying node:' + err.message);
      // Don't stop disconnecting on an error here; we make a good-faith
      // effort to clean up after ourselves, and let the cleaning system take
      // care of the rest.
    }

    this.myNode = null;
    this.shardChange.notifyObservers(null, null);
    onComplete(err, result);
  }.bind(this));
};

/**
 * @returns {boolean} Whether the local client is connected to a remote node
 */
NetSim.prototype.isConnectedToRemote = function () {
  return this.isConnectedToClient() || this.isConnectedToRouter();
};

/**
 * @returns {NetSimNode} the remote node our client is connected to, or null if
 *          not connected
 */
NetSim.prototype.getConnectedRemoteNode = function () {
  var client = this.getConnectedClient();
  var router = this.getConnectedRouter();
  return client ? client : router;
};

/**
 * @returns {boolean} Whether the local client has a mutual P2P connection to
 *          another client.
 */
NetSim.prototype.isConnectedToClient = function () {
  return !!(this.getConnectedClient());
};

/**
 * @returns {NetSimClientNode} the client node our client is connected to, or
 *          null if not connected to another client.
 */
NetSim.prototype.getConnectedClient = function () {
  if (this.isConnectedToShard()) {
    return this.myNode.myRemoteClient;
  }
  return null;
};

/**
 * Whether our client node is connected to a router node.
 * @returns {boolean}
 */
NetSim.prototype.isConnectedToRouter = function () {
  return !!(this.getConnectedRouter());
};

/**
 * @returns {NetSimRouterNode} the router node our client is connected to, or
 *          null if not connected to a router.
 */
NetSim.prototype.getConnectedRouter = function () {
  if (this.isConnectedToShard()) {
    return this.myNode.myRouter;
  }
  return null;
};

/**
 * Establish a connection between the local client and the given
 * simulated router.
 * @param {number} routerID
 */
NetSim.prototype.connectToRouter = function (routerID) {
  if (this.isConnectedToRemote()) {
    // Disconnect and try to connect again when we're done.
    logger.warn("Auto-disconnecting from previous router.");
    this.disconnectFromRemote(this.connectToRouter.bind(this, routerID));
    return;
  }

  var self = this;
  NetSimRouterNode.get(routerID, this.shard_, function (err, router) {
    if (err) {
      logger.warn('Failed to find router with ID ' + routerID + '; ' +
          err.message);
      return;
    }

    self.myNode.connectToRouter(router, function (err) {
      if (err) {
        logger.warn('Failed to connect to ' + router.getDisplayName() + '; ' +
            err.message);
      }
    });
  });
};

/**
 * Disconnects our client node from the currently connected remote node.
 * Destroys the shared wire.
 * @param {NodeStyleCallback} [onComplete] optional function to call when
 *        disconnect is complete
 */
NetSim.prototype.disconnectFromRemote = function (onComplete) {
  onComplete = utils.valueOr(onComplete, function () {});
  this.myNode.disconnectRemote(onComplete);
};

/**
 * Asynchronous fetch of the latest message shared between the local
 * node and its connected remote.
 * Used only in simplex & bit-granular mode.
 * @param {!NodeStyleCallback} onComplete
 */
NetSim.prototype.receiveBit = function (onComplete) {
  this.myNode.getLatestMessageOnSimplexWire(onComplete);
};

/**
 * Update encoding-view setting across the whole app.
 *
 * Propagates the change down into relevant child components, possibly
 * including the control that initiated the change; in that case, re-setting
 * the value should be a no-op and safe to do.
 *
 * @param {EncodingType[]} newEncodings
 */
NetSim.prototype.changeEncodings = function (newEncodings) {
  this.enabledEncodings_ = newEncodings;
  if (this.tabs_) {
    this.tabs_.setEncodings(newEncodings);
  }
  this.receivedMessageLog_.setEncodings(newEncodings);
  this.sentMessageLog_.setEncodings(newEncodings);
  this.sendPanel_.setEncodings(newEncodings);
  this.visualization_.setEncodings(newEncodings);
};

/**
 * Get the currently enabled encoding types.
 * @returns {EncodingType[]}
 */
NetSim.prototype.getEncodings = function () {
  return this.enabledEncodings_;
};

/**
 * Update chunk-size/bytesize setting across the whole app.
 *
 * Propagates the change down into relevant child components, possibly
 * including the control that initiated the change; in that case, re-setting
 * the value should be a no-op and safe to do.
 *
 * @param {number} newChunkSize
 */
NetSim.prototype.setChunkSize = function (newChunkSize) {
  this.chunkSize_ = newChunkSize;
  if (this.tabs_) {
    this.tabs_.setChunkSize(newChunkSize);
  }
  this.receivedMessageLog_.setChunkSize(newChunkSize);
  this.sentMessageLog_.setChunkSize(newChunkSize);
  this.sendPanel_.setChunkSize(newChunkSize);
};

/**
 * Update bitrate for the local device, which affects send-animation speed.
 * @param {number} newBitRate in bits per second
 */
NetSim.prototype.setMyDeviceBitRate = function (newBitRate) {
  this.myDeviceBitRate_ = newBitRate;
  if (this.tabs_) {
    this.tabs_.setMyDeviceBitRate(newBitRate);
  }
  this.sendPanel_.setBitRate(newBitRate);
};

/** @param {number} creationTimestampMs */
NetSim.prototype.setRouterCreationTime = function (creationTimestampMs) {
  if (this.tabs_) {
    this.tabs_.setRouterCreationTime(creationTimestampMs);
  }
};

/**
 * Update router bandwidth across the app.
 *
 * Propagates the change down into relevant child components, possibly including
 * the control that initiated the change; in that case, re-setting the value
 * should be a no-op and safe to do.
 *
 * @param {number} newBandwidth in bits/second
 */
NetSim.prototype.setRouterBandwidth = function (newBandwidth) {
  if (this.tabs_) {
    this.tabs_.setRouterBandwidth(newBandwidth);
  }
};

/**
 * Sets router bandwidth across the simulation, proagating the change to other
 * clients.
 * @param {number} newBandwidth in bits/second
 */
NetSim.prototype.changeRemoteRouterBandwidth = function (newBandwidth) {
  this.setRouterBandwidth(newBandwidth);
  if (this.isConnectedToRouter()) {
    this.getConnectedRouter().setBandwidth(newBandwidth);
  }
};

/**
 * Update router memory across the app.
 *
 * Propagates the change down into relevant child components, possibly including
 * the control that initiated the change; in that case, re-setting the value
 * should be a no-op and safe to do.
 *
 * @param {number} newMemory in bits
 */
NetSim.prototype.setRouterMemory = function (newMemory) {
  if (this.tabs_) {
    this.tabs_.setRouterMemory(newMemory);
  }
};

/**
 * Sets router memory capacity across the simulation, propagating the change
 * to other clients.
 * @param {number} newMemory in bits
 */
NetSim.prototype.changeRemoteRouterMemory = function (newMemory) {
  this.setRouterMemory(newMemory);
  if (this.isConnectedToRouter()) {
    this.getConnectedRouter().setMemory(newMemory);
  }
};

/**
 * Update DNS mode across the whole app.
 *
 * Propagates the change down into relevant child components, possibly
 * including the control that initiated the change; in that case, re-setting
 * the value should be a no-op and safe to do.
 *
 * @param {DnsMode} newDnsMode
 */
NetSim.prototype.setDnsMode = function (newDnsMode) {
  this.dnsMode_ = newDnsMode;
  if (this.tabs_) {
    this.tabs_.setDnsMode(newDnsMode);
  }
  this.visualization_.setDnsMode(newDnsMode);
};

/**
 * Get current DNS mode.
 * @returns {DnsMode}
 */
NetSim.prototype.getDnsMode = function () {
  return this.dnsMode_;
};

/**
 * Sets DNS mode across the whole simulation, propagating the change
 * to other clients.
 * @param {DnsMode} newDnsMode
 */
NetSim.prototype.changeRemoteDnsMode = function (newDnsMode) {
  this.setDnsMode(newDnsMode);
  if (this.isConnectedToRouter()) {
    this.getConnectedRouter().setDnsMode(newDnsMode);
  }
};

/**
 * @param {boolean} isDnsNode
 */
NetSim.prototype.setIsDnsNode = function (isDnsNode) {
  if (this.tabs_) {
    this.tabs_.setIsDnsNode(isDnsNode);
  }

  if (this.isConnectedToRouter()) {
    this.setDnsTableContents(this.getConnectedRouter().getAddressTable());
  }
};

/**
 * @param {number} dnsNodeID
 */
NetSim.prototype.setDnsNodeID = function (dnsNodeID) {
  this.visualization_.setDnsNodeID(dnsNodeID);
};

/**
 * Tells simulation that we want to become the DNS node for our
 * connected router.
 */
NetSim.prototype.becomeDnsNode = function () {
  this.setIsDnsNode(true);
  if (this.myNode && this.myNode.myRouter) {
    // STATE IS THE ROOT OF ALL EVIL
    var myNode = this.myNode;
    var router = myNode.myRouter;
    router.dnsNodeID = myNode.entityID;
    router.update();
  }
};

/**
 * @param {Array} tableContents
 */
NetSim.prototype.setDnsTableContents = function (tableContents) {
  if (this.tabs_) {
    this.tabs_.setDnsTableContents(tableContents);
  }
};

/**
 * @param {Array} logData
 */
NetSim.prototype.setRouterLogData = function (logData) {
  if (this.tabs_) {
    this.tabs_.setRouterLogData(logData);
  }
};

/**
 * @param {number} queuedPacketCount
 * @private
 */
NetSim.prototype.setRouterQueuedPacketCount_ = function (queuedPacketCount) {
  if (this.tabs_) {
    this.tabs_.setRouterQueuedPacketCount(queuedPacketCount);
  }
};

/**
 * @param {number} usedMemoryInBits
 * @private
 */
NetSim.prototype.setRouterMemoryInUse_ = function (usedMemoryInBits) {
  if (this.tabs_) {
    this.tabs_.setRouterMemoryInUse(usedMemoryInBits);
  }
};

/**
 * @param {number} dataRateBitsPerSecond
 * @private
 */
NetSim.prototype.setRouterDataRate_ = function (dataRateBitsPerSecond) {
  if (this.tabs_) {
    this.tabs_.setRouterDataRate(dataRateBitsPerSecond);
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

  var vizHeight = this.MIN_WORKSPACE_HEIGHT;
  var visualizationColumn = document.getElementById('netsim-leftcol');

  if (config.pinWorkspaceToBottom) {
    document.body.style.overflow = "hidden";
    container.className = container.className + " pin_bottom";
    visualizationColumn.className = visualizationColumn.className + " pin_bottom";
  } else {
    visualizationColumn.style.minHeight = vizHeight + 'px';
    container.style.minHeight = vizHeight + 'px';
  }
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
 * Re-render parts of the page that can be re-rendered in place.
 */
NetSim.prototype.render = function () {
  var isConnected, clientStatus, myHostname, myAddress, remoteNodeName,
      shareLink;

  isConnected = false;
  clientStatus = i18n.disconnected();
  if (this.myNode) {
    clientStatus = 'In Lobby';
    myHostname = this.myNode.getHostname();
    if (this.myNode.myWire) {
      myAddress = this.myNode.myWire.localAddress;
    }
  }

  if (this.isConnectedToRemote()) {
    isConnected = true;
    clientStatus = i18n.connected();
    remoteNodeName = this.getConnectedRemoteNode().getDisplayName();
  }

  shareLink = this.lobby_.getShareLink();

  if (this.isConnectedToRemote()) {
    // Swap in 'connected' div
    this.mainContainer_.find('#netsim-disconnected').hide();
    this.mainContainer_.find('#netsim-connected').show();

    // Render right column
    this.sendPanel_.setFromAddress(myAddress);

    // Render left column
    if (this.statusPanel_) {
      this.statusPanel_.render({
        isConnected: isConnected,
        statusString: clientStatus,
        myHostname: myHostname,
        myAddress: myAddress,
        remoteNodeName: remoteNodeName,
        shareLink: shareLink
      });
    }
  } else {
    // Swap in 'disconnected' div
    this.mainContainer_.find('#netsim-disconnected').show();
    this.mainContainer_.find('#netsim-connected').hide();

    // Render lobby
    this.lobby_.render();
  }

  this.updateLayout();
};

/**
 * Called whenever the connection notifies us that we've connected to,
 * or disconnected from, a shard.
 * @param {NetSimShard} shard - null if disconnected.
 * @param {NetSimLocalClientNode} localNode - null if disconnected
 * @private
 */
NetSim.prototype.onShardChange_= function (shard, localNode) {
  // Unregister old handlers
  if (this.eventKeys.registeredWithLocalNode) {
    this.eventKeys.registeredWithLocalNode.remoteChange.unregister(
        this.eventKeys.remoteChange);
    this.eventKeys.registeredWithLocalNode = null;
  }

  // Register new handlers
  if (localNode) {
    this.eventKeys.remoteChange = localNode.remoteChange.register(
        this.onRemoteChange_.bind(this));
    this.eventKeys.registeredWithLocalNode = localNode;
  }

  // Shard changes almost ALWAYS require a re-render
  this.render();
};

/**
 * Called whenever the local node notifies that we've been connected to,
 * or disconnected from, a router.
 * @param {NetSimWire} wire - null if disconnected.
 * @param {NetSimNode} remoteNode - null if disconnected
 * @private
 */
NetSim.prototype.onRemoteChange_ = function (wire, remoteNode) {
  var routerConnectEvent = remoteNode && remoteNode instanceof NetSimRouterNode;
  var routerDisconnectEvent = !remoteNode && this.eventKeys.registeredWithRouter;

  // Unhook old handlers
  if (this.eventKeys.registeredWithRouter) {
    this.eventKeys.registeredWithRouter.stateChange.unregister(
        this.eventKeys.routerStateChange);
    this.eventKeys.registeredWithRouter.statsChange.unregister(
        this.eventKeys.routerStatsChange);
    this.eventKeys.registeredWithRouter.wiresChange.unregister(
        this.eventKeys.routerWiresChange);
    this.eventKeys.registeredWithRouter.logChange.unregister(
        this.eventKeys.routerLogChange);
    this.eventKeys.registeredWithRouter = null;
  }

  // Hook up new handlers
  if (routerConnectEvent) {
    this.eventKeys.routerStateChange = remoteNode.stateChange.register(
        this.onRouterStateChange_.bind(this));
    this.eventKeys.routerStatsChange = remoteNode.statsChange.register(
        this.onRouterStatsChange_.bind(this));
    this.eventKeys.routerWiresChange = remoteNode.wiresChange.register(
        this.onRouterWiresChange_.bind(this));
    this.eventKeys.routerLogChange = remoteNode.logChange.register(
        this.onRouterLogChange_.bind(this));
    this.eventKeys.registeredWithRouter = remoteNode;
  }

  this.render();

  if (routerConnectEvent) {
    this.onRouterConnect_(remoteNode);
  } else if (routerDisconnectEvent) {
    this.onRouterDisconnect_();
  }
};

/**
 * Steps to take when we were not connected to a router and now we are.
 * @param {NetSimRouterNode} router that we are now connected to
 * @private
 */
NetSim.prototype.onRouterConnect_ = function (router) {
  this.onRouterStateChange_(router);
  this.onRouterStatsChange_(router);
  this.setRouterLogData(router.getLog());
};

/**
 * Steps to take when we were connected to a router and now we are not.
 * @private
 */
NetSim.prototype.onRouterDisconnect_ = function () {
  this.setRouterCreationTime(0);
  this.setRouterQueuedPacketCount_(0);
  this.setRouterMemoryInUse_(0);
  this.setRouterDataRate_(0);
  this.setRouterLogData([]);
};

/**
 * Local response to router state changing, which may have been triggered
 * locally or remotely.
 * @param {NetSimRouterNode} router
 * @private
 */
NetSim.prototype.onRouterStateChange_ = function (router) {
  var myNode = {};
  if (this.myNode) {
    myNode = this.myNode;
  }

  this.setRouterCreationTime(router.creationTime);
  this.setRouterBandwidth(router.bandwidth);
  this.setRouterMemory(router.memory);
  this.setDnsMode(router.dnsMode);
  this.setDnsNodeID(router.dnsMode === DnsMode.NONE ? undefined : router.dnsNodeID);
  this.setIsDnsNode(router.dnsMode === DnsMode.MANUAL &&
      router.dnsNodeID === myNode.entityID);
};

/**
 * Isolates updates that we should do when a router's stats change, since
 * these happen a lot more often.
 * @param {NetSimRouterNode} router
 * @private
 */
NetSim.prototype.onRouterStatsChange_ = function (router) {
  this.setRouterQueuedPacketCount_(router.getQueuedPacketCount());
  this.setRouterMemoryInUse_(router.getMemoryInUse());
  this.setRouterDataRate_(router.getCurrentDataRate());
};

/**
 * What to do when our connected router's local network changes.
 * @private
 */
NetSim.prototype.onRouterWiresChange_ = function () {
  if (this.isConnectedToRouter()) {
    this.setDnsTableContents(this.getConnectedRouter().getAddressTable());
  }
};

/**
 * What to do when our connected router's logs change.
 * @private
 */
NetSim.prototype.onRouterLogChange_ = function () {
  if (this.isConnectedToRouter()) {
    this.setRouterLogData(this.getConnectedRouter().getLog());
  }
};

/**
 * Immediately start a shard-cleaning process from this client
 */
NetSim.prototype.cleanShardNow = function () {
  if (this.shardCleaner_) {
    this.shardCleaner_.cleanShard();
  }
};

/**
 * Make the local node's heartbeat pretend to be expired, so it can be
 * cleaned up.
 */
NetSim.prototype.expireHeartbeat = function () {
  if (!(this.myNode && this.myNode.heartbeat_)) {
    return;
  }

  this.myNode.heartbeat_.spoofExpired();
  logger.info("Local node heartbeat is now expired.");
};

/**
 * Kick off an animation that shows the local node setting the state of a
 * simplex wire.
 * @param {"0"|"1"} newState
 */
NetSim.prototype.animateSetWireState = function (newState) {
  this.visualization_.animateSetWireState(newState);
};

/**
 * Kick off an animation that shows the local node reading the state of a
 * simplex wire.
 * @param {"0"|"1"} newState
 */
NetSim.prototype.animateReadWireState = function (newState) {
  this.visualization_.animateReadWireState(newState);
};

NetSim.prototype.updateLayout = function () {
  var rightColumn = $('#netsim-rightcol');
  var sendPanel = $('#netsim-send');
  var logWrap = $('#netsim-logs');
  if (!rightColumn.is(':visible')) {
    return;
  }

  // Right column wrapper and the send panel are both sized by CSS
  var rightColumnHeight = rightColumn.height();
  var sendPanelHeight = sendPanel.height();

  // Manually adjust the logwrap to the remaining height
  logWrap.css('height', rightColumnHeight - sendPanelHeight);
};
