/**
 * @overview Internet Simulator app for Code.org.
 *           This file is the main entry point for the Internet Simulator.
 */
/* global confirm */

var utils = require('../utils');
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {openDialog as openInstructionsDialog} from '../redux/instructionsDialog';
import {getStore} from '../redux';
var _ = require('lodash');
/** @type {Object<string, function>} */
var i18n = require('@cdo/netsim/locale');
var ObservableEventDEPRECATED = require('../ObservableEventDEPRECATED');
var RunLoop = require('../RunLoop');
var Provider = require('react-redux').Provider;
var NetSimView = require('./NetSimView');
var page = require('./page.html.ejs');
var NetSimAlert = require('./NetSimAlert');
var NetSimConstants = require('./NetSimConstants');
var NetSimUtils = require('./NetSimUtils');
var DashboardUser = require('./DashboardUser');
var NetSimBitLogPanel = require('./NetSimBitLogPanel');
var NetSimLobby = require('./NetSimLobby');
var NetSimLocalClientNode = require('./NetSimLocalClientNode');
var NetSimLogger = require('./NetSimLogger');
var NetSimLogPanel = require('./NetSimLogPanel');
var NetSimRouterLogModal = require('./NetSimRouterLogModal');
var NetSimRouterNode = require('./NetSimRouterNode');
var NetSimSendPanel = require('./NetSimSendPanel');
var NetSimShard = require('./NetSimShard');
var NetSimStatusPanel = require('./NetSimStatusPanel');
var NetSimTabsComponent = require('./NetSimTabsComponent');
var NetSimVisualization = require('./NetSimVisualization');

var DnsMode = NetSimConstants.DnsMode;
var MessageGranularity = NetSimConstants.MessageGranularity;

var logger = NetSimLogger.getSingleton();
var NetSimGlobals = require('./NetSimGlobals');

/**
 * The top-level Internet Simulator controller.
 * @param {StudioApp} studioApp The studioApp instance to build upon.
 */
var NetSim = (module.exports = function() {
  /**
   * @type {Object}
   */
  this.skin = null;

  /**
   * @type {NetSimLevelConfiguration}
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
   * @type {ObservableEventDEPRECATED}
   */
  this.shardChange = new ObservableEventDEPRECATED();
  this.shardChange.register(this.onShardChange_.bind(this));

  /**
   * Untyped storage for information about which events we have currently bound.
   * @type {Object}
   */
  this.eventKeys = {};
});

NetSim.prototype.injectStudioApp = function(studioApp) {
  this.studioApp_ = studioApp;
};

/**
 * Called on page load.
 * @param {Object} config
 * @param {Object} config.skin
 * @param {NetSimLevelConfiguration} config.level
 * @param {boolean} config.enableShowCode - Always false for NetSim
 * @param {function} config.loadAudio
 */
NetSim.prototype.init = function(config) {
  if (!this.studioApp_) {
    throw new Error('NetSim requires a StudioApp');
  }

  // Set up global singleton for easy access to simulator-wide settings
  NetSimGlobals.setRootControllers(this.studioApp_, this);

  // Remove icon from all NetSim instructions dialogs
  config.skin.staticAvatar = null;
  config.skin.smallStaticAvatar = null;
  config.skin.failureAvatar = null;
  config.skin.winAvatar = null;

  /**
   * Skin for the loaded level
   * @type {Object}
   */
  this.skin = config.skin;

  /**
   * Configuration for the loaded level
   * @type {NetSimLevelConfiguration}
   */
  this.level = NetSimUtils.scrubLevelConfiguration_(config.level);

  /**
   * Whether NetSim should subscribe to events using Pusher.
   * @type {boolean}
   */
  this.usePusher = config.usePusher;

  /**
   * The public application key for the Pusher service. (Not used if not using
   * Pusher).
   * @type {string}
   */
  this.pusherApplicationKey = config.pusherApplicationKey;

  /**
   * The strict maximum number of routers per shard.  Note the real maximum
   * may be lower if bounded by addressable space.
   * @type {number}
   */
  this.globalMaxRouters = config.netsimMaxRouters;

  /**
   * Configuration for reporting level completion
   * @type {Object}
   */
  this.reportingInfo_ = config.report;

  var generateCodeAppHtmlFromEjs = function() {
    return page({
      data: {
        localeDirection: getStore().getState().isRtl ? 'rtl' : 'ltr',
        instructions: this.level.shortInstructions
      }
    });
  }.bind(this);

  config.enableShowCode = false;
  config.pinWorkspaceToBottom = true;
  config.loadAudio = this.loadAudio_.bind(this);

  var onMount = function() {
    // Override certain StudioApp methods - netsim does a lot of configuration
    // itself, because of its nonstandard layout.
    this.studioApp_.configureDom = NetSim.configureDomOverride_.bind(
      this.studioApp_
    );
    this.studioApp_.onResize = NetSim.onResizeOverride_.bind(this.studioApp_);

    // Wrap showInstructionsWrapper to actually show instructions, which core
    // studioApp no longer does.  This must happen before studioApp_.init()
    // which will actually call this wrapper.
    const originalShowInstructionsWrapper = config.showInstructionsWrapper.bind(
      config
    );
    config.showInstructionsWrapper = originalShowInstructions => {
      originalShowInstructionsWrapper(() => {
        this.showInstructionsDialog();
        if (typeof originalShowInstructions === 'function') {
          originalShowInstructions();
        }
      });
    };

    this.studioApp_.init(config);

    // Create netsim lobby widget in page
    this.currentUser_.whenReady(
      function() {
        this.initWithUser_(this.currentUser_);
      }.bind(this)
    );

    // Begin the main simulation loop
    this.runLoop_.tick.register(this.tick.bind(this));
    this.runLoop_.begin();
  }.bind(this);

  // Push initial level properties into the Redux store
  this.studioApp_.setPageConstants(config);

  ReactDOM.render(
    <Provider store={getStore()}>
      <NetSimView
        generateCodeAppHtml={generateCodeAppHtmlFromEjs}
        onMount={onMount}
      />
    </Provider>,
    document.getElementById(config.containerId)
  );
};

/**
 * @param {RunLoop.Clock} clock
 */
NetSim.prototype.tick = function(clock) {
  if (this.isConnectedToShard()) {
    this.myNode.tick(clock);
    this.shard_.tick(clock);
  }
};

/**
 * Extracts query parameters from a full URL and returns them as a simple
 * object.
 * @returns {*}
 */
NetSim.prototype.getOverrideShardID = function() {
  var parts = location.search.split('?');
  if (parts.length === 1) {
    return undefined;
  }

  var shardID;
  parts[1].split('&').forEach(function(param) {
    var sides = param.split('=');
    if (sides.length > 1 && sides[0] === 's') {
      shardID = sides[1];
    }
  });
  return shardID;
};

/**
 * @returns {boolean} TRUE if the level is configured to show any tabs.
 */
NetSim.prototype.shouldShowAnyTabs = function() {
  return this.level.showTabs.length > 0;
};

/**
 * Initialization that can happen once we have a user name.
 * Could collapse this back into init if at some point we can guarantee that
 * user name is available on load.
 * @param {DashboardUser} user
 * @private
 */
NetSim.prototype.initWithUser_ = function(user) {
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

  this.statusPanel_ = new NetSimStatusPanel($('#netsim-status'), {
    disconnectCallback: this.disconnectFromRemote.bind(this, function() {})
  });

  this.routerLogModal_ = new NetSimRouterLogModal($('#router-log-modal'), {
    user
  });

  this.visualization_ = new NetSimVisualization(
    $('#netsim-visualization'),
    this.runLoop_
  );

  // Lobby panel: Controls for picking a remote node and connecting to it.
  this.lobby_ = new NetSimLobby($('.lobby-panel'), this, {
    user: user,
    levelKey: NetSimUtils.getUniqueLevelKeyFromLocation(location),
    sharedShardSeed: this.getOverrideShardID(),
    showRouterLogCallback: this.routerLogModal_.show.bind(
      this.routerLogModal_,
      false
    ),
    showTeacherLogCallback: this.routerLogModal_.show.bind(
      this.routerLogModal_,
      true
    )
  });

  // Tab panel - contains instructions, my device, router, dns
  if (this.shouldShowAnyTabs()) {
    this.tabs_ = new NetSimTabsComponent($('#netsim-tabs'), this.runLoop_, {
      showInstructionsDialogCallback: this.showInstructionsDialog.bind(this),
      chunkSizeSliderChangeCallback: this.setChunkSize.bind(this),
      myDeviceBitRateChangeCallback: this.setMyDeviceBitRate.bind(this),
      encodingChangeCallback: this.changeEncodings.bind(this),
      routerBandwidthSliderChangeCallback: this.setRouterBandwidth.bind(this),
      routerBandwidthSliderStopCallback: this.changeRemoteRouterBandwidth.bind(
        this
      ),
      routerMemorySliderChangeCallback: this.setRouterMemory.bind(this),
      routerMemorySliderStopCallback: this.changeRemoteRouterMemory.bind(this),
      dnsModeChangeCallback: this.changeRemoteDnsMode.bind(this),
      becomeDnsCallback: this.becomeDnsNode.bind(this),
      showRouterLogCallback: this.routerLogModal_.show.bind(
        this.routerLogModal_,
        false
      )
    });
    this.tabs_.attachToRunLoop(this.runLoop_);
  }

  this.sendPanel_ = new NetSimSendPanel($('#netsim-send'), this.level, this);

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
  window.addEventListener(
    'resize',
    _.debounce(this.updateLayout.bind(this), 250)
  );
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
NetSim.prototype.onBeforeUnload_ = function(event) {
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
NetSim.prototype.onUnload_ = function() {
  if (this.isConnectedToShard()) {
    this.synchronousDisconnectFromShard_();
  }
};

/**
 * Whether we are currently connected to a netsim shard
 * @returns {boolean}
 */
NetSim.prototype.isConnectedToShard = function() {
  return null !== this.myNode;
};

/**
 * Whether we are currently connected to a shard with the given ID
 * @param {string} shardID
 * @returns {boolean}
 */
NetSim.prototype.isConnectedToShardID = function(shardID) {
  return this.isConnectedToShard() && this.shard_.id === shardID;
};

/**
 * Establishes a new connection to a netsim shard, closing the old one
 * if present.
 * @param {!string} shardID
 * @param {!string} displayName
 */
NetSim.prototype.connectToShard = function(shardID, displayName) {
  if (this.isConnectedToShard()) {
    logger.warn('Auto-closing previous connection...');
    this.disconnectFromShard(
      this.connectToShard.bind(this, shardID, displayName)
    );
    return;
  }

  this.shard_ = new NetSimShard(shardID, NetSimGlobals.getPubSubConfig());
  this.createMyClientNode_(
    displayName,
    function(err, myNode) {
      this.myNode = myNode;
      this.shardChange.notifyObservers(this.shard_, this.myNode);
    }.bind(this)
  );
};

/**
 * Given a lobby table has already been configured, connects to that table
 * by inserting a row for ourselves into that table and saving the row ID.
 * @param {!string} displayName
 * @param {!NodeStyleCallback} onComplete - result is new local node
 * @private
 */
NetSim.prototype.createMyClientNode_ = function(displayName, onComplete) {
  NetSimLocalClientNode.create(
    this.shard_,
    displayName,
    function(err, node) {
      if (err) {
        logger.error('Failed to create client node; ' + err.message);
        NetSimAlert.error(i18n.createMyClientNodeError());
        onComplete(err, null);
        return;
      }

      node.setLostConnectionCallback(
        function() {
          NetSimAlert.warn(i18n.alertConnectionReset());
          this.disconnectFromShard();
        }.bind(this)
      );
      node.initializeSimulation(this.sentMessageLog_, this.receivedMessageLog_);
      onComplete(err, node);
    }.bind(this)
  );
};

/**
 * Synchronous disconnect, for use when navigating away from the page
 * @private
 */
NetSim.prototype.synchronousDisconnectFromShard_ = function() {
  this.myNode.stopSimulation();
  this.myNode.synchronousDestroy();
  this.myNode = null;
  // Attempt to unsubscribe from Pusher as we navigate away
  this.shard_.disconnect();
  this.shard_ = null;
  // Don't notify observers, this should only be used when navigating away
  // from the page.
};

/**
 * Ends the connection to the netsim shard.
 * @param {NodeStyleCallback} [onComplete]
 */
NetSim.prototype.disconnectFromShard = function(onComplete) {
  onComplete = onComplete || function() {};

  if (!this.isConnectedToShard()) {
    logger.warn('Redundant disconnect call.');
    onComplete(null, null);
    return;
  }

  if (this.isConnectedToRemote()) {
    // Disconnect, from the remote node, and try this again on completion.
    this.disconnectFromRemote(this.disconnectFromShard.bind(this, onComplete));
    return;
  }

  this.myNode.stopSimulation();
  this.myNode.destroy(
    function(err, result) {
      if (err) {
        logger.warn('Error destroying node:' + err.message);
        // Don't stop disconnecting on an error here; we make a good-faith
        // effort to clean up after ourselves, and let the cleaning system take
        // care of the rest.
      }

      this.myNode = null;
      this.shard_.disconnect();
      this.shard_ = null;
      this.shardChange.notifyObservers(null, null);
      onComplete(err, result);
    }.bind(this)
  );
};

/**
 * @returns {boolean} Whether the local client is connected to a remote node
 */
NetSim.prototype.isConnectedToRemote = function() {
  return this.isConnectedToClient() || this.isConnectedToRouter();
};

/**
 * @returns {NetSimNode} the remote node our client is connected to, or null if
 *          not connected
 */
NetSim.prototype.getConnectedRemoteNode = function() {
  var client = this.getConnectedClient();
  var router = this.getConnectedRouter();
  return client ? client : router;
};

/**
 * @returns {boolean} Whether the local client has a mutual P2P connection to
 *          another client.
 */
NetSim.prototype.isConnectedToClient = function() {
  return !!this.getConnectedClient();
};

/**
 * @returns {NetSimClientNode} the client node our client is connected to, or
 *          null if not connected to another client.
 */
NetSim.prototype.getConnectedClient = function() {
  if (this.isConnectedToShard()) {
    return this.myNode.myRemoteClient;
  }
  return null;
};

/**
 * Whether our client node is connected to a router node.
 * @returns {boolean}
 */
NetSim.prototype.isConnectedToRouter = function() {
  return !!this.getConnectedRouter();
};

/**
 * @returns {NetSimRouterNode} the router node our client is connected to, or
 *          null if not connected to a router.
 */
NetSim.prototype.getConnectedRouter = function() {
  if (this.isConnectedToShard()) {
    return this.myNode.getMyRouter();
  }
  return null;
};

/**
 * Establish a connection between the local client and the given
 * simulated router.
 * @param {number} routerID
 * @param {NodeStyleCallback} onComplete
 */
NetSim.prototype.connectToRouter = function(routerID, onComplete) {
  if (this.isConnectedToRemote()) {
    // Disconnect and try to connect again when we're done.
    logger.warn('Auto-disconnecting from previous router.');
    this.disconnectFromRemote(
      this.connectToRouter.bind(this, routerID, onComplete)
    );
    return;
  }

  var self = this;
  NetSimRouterNode.get(routerID, this.shard_, function(err, router) {
    if (err) {
      logger.warn(
        'Failed to find router with ID ' + routerID + '; ' + err.message
      );
      onComplete(err);
      return;
    }

    self.myNode.connectToRouter(router, function(err) {
      if (err) {
        logger.warn(
          'Failed to connect to ' + router.getDisplayName() + '; ' + err.message
        );
      }
      onComplete(err, router);
    });
  });
};

/**
 * Disconnects our client node from the currently connected remote node.
 * Destroys the shared wire.
 * @param {NodeStyleCallback} [onComplete] optional function to call when
 *        disconnect is complete
 */
NetSim.prototype.disconnectFromRemote = function(onComplete) {
  onComplete = utils.valueOr(onComplete, function() {});
  this.myNode.disconnectRemote(onComplete);
};

/**
 * Asynchronous fetch of the latest message shared between the local
 * node and its connected remote.
 * Used only in simplex & bit-granular mode.
 * @param {!NodeStyleCallback} onComplete
 */
NetSim.prototype.receiveBit = function(onComplete) {
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
NetSim.prototype.changeEncodings = function(newEncodings) {
  this.enabledEncodings_ = newEncodings;
  if (this.tabs_) {
    this.tabs_.setEncodings(newEncodings);
  }
  this.receivedMessageLog_.setEncodings(newEncodings);
  this.sentMessageLog_.setEncodings(newEncodings);
  this.sendPanel_.setEncodings(newEncodings);
  this.visualization_.setEncodings(newEncodings);
  this.updateLayout();
};

/**
 * Get the currently enabled encoding types.
 * @returns {EncodingType[]}
 */
NetSim.prototype.getEncodings = function() {
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
NetSim.prototype.setChunkSize = function(newChunkSize) {
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
NetSim.prototype.setMyDeviceBitRate = function(newBitRate) {
  this.myDeviceBitRate_ = newBitRate;
  if (this.tabs_) {
    this.tabs_.setMyDeviceBitRate(newBitRate);
  }
  this.sendPanel_.setBitRate(newBitRate);
};

/** @param {number} creationTimestampMs */
NetSim.prototype.setRouterCreationTime = function(creationTimestampMs) {
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
NetSim.prototype.setRouterBandwidth = function(newBandwidth) {
  if (this.tabs_) {
    this.tabs_.setRouterBandwidth(newBandwidth);
  }
};

/**
 * Sets router bandwidth across the simulation, proagating the change to other
 * clients.
 * @param {number} newBandwidth in bits/second
 */
NetSim.prototype.changeRemoteRouterBandwidth = function(newBandwidth) {
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
NetSim.prototype.setRouterMemory = function(newMemory) {
  if (this.tabs_) {
    this.tabs_.setRouterMemory(newMemory);
  }
};

/**
 * Sets router memory capacity across the simulation, propagating the change
 * to other clients.
 * @param {number} newMemory in bits
 */
NetSim.prototype.changeRemoteRouterMemory = function(newMemory) {
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
NetSim.prototype.setDnsMode = function(newDnsMode) {
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
NetSim.prototype.getDnsMode = function() {
  return this.dnsMode_;
};

/**
 * Sets DNS mode across the whole simulation, propagating the change
 * to other clients.
 * @param {DnsMode} newDnsMode
 */
NetSim.prototype.changeRemoteDnsMode = function(newDnsMode) {
  this.setDnsMode(newDnsMode);
  if (this.isConnectedToRouter()) {
    this.getConnectedRouter().setDnsMode(newDnsMode);
  }
};

/**
 * @param {boolean} isDnsNode
 */
NetSim.prototype.setIsDnsNode = function(isDnsNode) {
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
NetSim.prototype.setDnsNodeID = function(dnsNodeID) {
  this.visualization_.setDnsNodeID(dnsNodeID);
};

/**
 * Tells simulation that we want to become the DNS node for our
 * connected router.
 */
NetSim.prototype.becomeDnsNode = function() {
  this.setIsDnsNode(true);
  if (this.myNode && this.myNode.getMyRouter()) {
    // STATE IS THE ROOT OF ALL EVIL
    var myNode = this.myNode;
    var router = myNode.getMyRouter();
    router.dnsNodeID = myNode.entityID;
    router.update();
  }
};

/**
 * @param {Array} tableContents
 */
NetSim.prototype.setDnsTableContents = function(tableContents) {
  if (this.tabs_) {
    this.tabs_.setDnsTableContents(tableContents);
  }
};

/**
 * @param {Array} logData
 */
NetSim.prototype.setRouterLogData = function(logData) {
  if (this.tabs_) {
    this.tabs_.setRouterLogData(logData);
  }
};

/**
 * @param {number} queuedPacketCount
 * @private
 */
NetSim.prototype.setRouterQueuedPacketCount_ = function(queuedPacketCount) {
  if (this.tabs_) {
    this.tabs_.setRouterQueuedPacketCount(queuedPacketCount);
  }
};

/**
 * @param {number} usedMemoryInBits
 * @private
 */
NetSim.prototype.setRouterMemoryInUse_ = function(usedMemoryInBits) {
  if (this.tabs_) {
    this.tabs_.setRouterMemoryInUse(usedMemoryInBits);
  }
};

/**
 * @param {number} dataRateBitsPerSecond
 * @private
 */
NetSim.prototype.setRouterDataRate_ = function(dataRateBitsPerSecond) {
  if (this.tabs_) {
    this.tabs_.setRouterDataRate(dataRateBitsPerSecond);
  }
};

/**
 * Load audio assets for this app
 * @private
 */
NetSim.prototype.loadAudio_ = function() {};

/**
 * Replaces StudioApp.configureDom.
 * Should be bound against StudioApp instance.
 * @param {!Object} config Should at least contain
 * @param {!string} config.containerId: ID of a parent DOM element for app content
 * @private
 */
NetSim.configureDomOverride_ = function(config) {
  var container = document.getElementById(config.containerId);

  var vizHeight = this.MIN_WORKSPACE_HEIGHT;
  var visualizationColumn = document.getElementById('netsim-leftcol');

  if (config.pinWorkspaceToBottom) {
    document.body.style.overflow = 'hidden';
    container.className = container.className + ' pin_bottom';
    visualizationColumn.className =
      visualizationColumn.className + ' pin_bottom';
  } else {
    visualizationColumn.style.minHeight = vizHeight + 'px';
    container.style.minHeight = vizHeight + 'px';
  }
};

/**
 * Resize the left column so it pins above the footer.
 */
function resizeLeftColumnToSitAboveFooter() {
  var pinnedLeftColumn = document.querySelector('#netsim-leftcol.pin_bottom');
  if (!pinnedLeftColumn) {
    return;
  }

  var smallFooter = document.querySelector(
    '#page-small-footer .small-footer-base'
  );

  var bottom = 0;
  if (smallFooter) {
    var codeApp = $('#codeApp');
    bottom += $(smallFooter).outerHeight(true);
    // Footer is relative to the document, not codeApp, so we need to
    // remove the codeApp bottom offset to get the correct margin.
    bottom -= parseInt(codeApp.css('bottom'), 10);
  }

  pinnedLeftColumn.style.bottom = bottom + 'px';
}

function resizeFooterToFitToLeftOfContent() {
  var leftColumn = document.querySelector('#netsim-leftcol.pin_bottom');
  var instructions = document.querySelector('.instructions');
  var smallFooter = document.querySelector(
    '#page-small-footer .small-footer-base'
  );

  if (!smallFooter) {
    return;
  }

  var padding = parseInt(window.getComputedStyle(smallFooter)['padding-left']);

  var boundingWidth;
  if (leftColumn && $(leftColumn).is(':visible')) {
    boundingWidth = leftColumn.getBoundingClientRect().right;
  } else if (instructions && $(instructions).is(':visible')) {
    boundingWidth = instructions.getBoundingClientRect().right;
  }

  smallFooter.style.maxWidth = boundingWidth
    ? boundingWidth - padding + 'px'
    : null;
}

var netsimDebouncedResizeFooter = _.debounce(function() {
  resizeFooterToFitToLeftOfContent();
  resizeLeftColumnToSitAboveFooter();
}, 10);

/**
 * Replaces StudioApp.onResize
 * Should be bound against StudioApp instance.
 * @private
 */
NetSim.onResizeOverride_ = function() {
  var div = document.getElementById('appcontainer');
  var divParent = div.parentNode;
  var parentStyle = window.getComputedStyle(divParent);
  var parentWidth = parseInt(parentStyle.width, 10);
  div.style.top = divParent.offsetTop + 'px';
  div.style.width = parentWidth + 'px';

  netsimDebouncedResizeFooter();
};

/**
 * Passthrough to local "static" netsimDebounceResizeFooter method
 */
NetSim.prototype.debouncedResizeFooter = function() {
  netsimDebouncedResizeFooter();
};

/**
 * Re-render parts of the page that can be re-rendered in place.
 */
NetSim.prototype.render = function() {
  if (this.isConnectedToRemote()) {
    var myAddress = this.myNode.getAddress();

    // Swap in 'connected' div
    this.mainContainer_.find('#netsim-disconnected').hide();
    this.mainContainer_.find('#netsim-connected').show();

    // Render right column
    this.sendPanel_.setFromAddress(myAddress);

    // Render left column
    if (this.statusPanel_) {
      this.statusPanel_.render({
        myHostname: this.myNode.getHostname(),
        myAddress: myAddress,
        remoteNodeName: this.getConnectedRemoteNode().getDisplayName(),
        shareLink: this.lobby_.getShareLink()
      });
    }
  } else {
    // Swap in 'disconnected' div
    this.mainContainer_.find('#netsim-disconnected').show();
    this.mainContainer_.find('#netsim-connected').hide();

    // Render lobby
    this.lobby_.render();
  }

  if (this.routerLogModal_) {
    this.routerLogModal_.render();
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
NetSim.prototype.onShardChange_ = function(shard, localNode) {
  // Unregister old handlers
  if (this.eventKeys.registeredWithLocalNode) {
    this.eventKeys.registeredWithLocalNode.remoteChange.unregister(
      this.eventKeys.remoteChange
    );
    this.eventKeys.registeredWithLocalNode = null;
  }

  // Register new handlers
  if (localNode) {
    this.eventKeys.remoteChange = localNode.remoteChange.register(
      this.onRemoteChange_.bind(this)
    );
    this.eventKeys.registeredWithLocalNode = localNode;
  }

  // Update the log viewer's shard reference so it can get current data.
  if (this.routerLogModal_) {
    this.routerLogModal_.onShardChange(shard, localNode);
  }

  // Shard changes almost ALWAYS require a re-render
  this.visualization_.setShard(shard);
  this.visualization_.setLocalNode(localNode);
  this.render();
};

/**
 * Called whenever the local node notifies that we've been connected to,
 * or disconnected from, a router.
 * @param {NetSimWire} wire - null if disconnected.
 * @param {NetSimNode} remoteNode - null if disconnected
 * @private
 */
NetSim.prototype.onRemoteChange_ = function(wire, remoteNode) {
  var routerConnectEvent = remoteNode && remoteNode instanceof NetSimRouterNode;
  var routerDisconnectEvent =
    !remoteNode && this.eventKeys.registeredWithRouter;

  // Unhook old handlers
  if (this.eventKeys.registeredWithRouter) {
    this.eventKeys.registeredWithRouter.stateChange.unregister(
      this.eventKeys.routerStateChange
    );
    this.eventKeys.registeredWithRouter.statsChange.unregister(
      this.eventKeys.routerStatsChange
    );
    this.eventKeys.registeredWithRouter.wiresChange.unregister(
      this.eventKeys.routerWiresChange
    );
    this.eventKeys.registeredWithRouter.logChange.unregister(
      this.eventKeys.routerLogChange
    );
    this.eventKeys.registeredWithRouter = null;
  }

  // Hook up new handlers
  if (routerConnectEvent) {
    this.eventKeys.routerStateChange = remoteNode.stateChange.register(
      this.onRouterStateChange_.bind(this)
    );
    this.eventKeys.routerStatsChange = remoteNode.statsChange.register(
      this.onRouterStatsChange_.bind(this)
    );
    this.eventKeys.routerWiresChange = remoteNode.wiresChange.register(
      this.onRouterWiresChange_.bind(this)
    );
    this.eventKeys.routerLogChange = remoteNode.logChange.register(
      this.onRouterLogChange_.bind(this)
    );
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
NetSim.prototype.onRouterConnect_ = function(router) {
  this.onRouterStateChange_(router);
  this.onRouterStatsChange_(router);
  this.setRouterLogData(router.getLog());
  this.routerLogModal_.setRouter(router);
};

/**
 * Steps to take when we were connected to a router and now we are not.
 * @private
 */
NetSim.prototype.onRouterDisconnect_ = function() {
  this.setRouterCreationTime(0);
  this.setRouterQueuedPacketCount_(0);
  this.setRouterMemoryInUse_(0);
  this.setRouterDataRate_(0);
  this.setRouterLogData([]);
  this.routerLogModal_.setRouter(null);
};

/**
 * Local response to router state changing, which may have been triggered
 * locally or remotely.
 * @param {NetSimRouterNode} router
 * @private
 */
NetSim.prototype.onRouterStateChange_ = function(router) {
  var myNode = {};
  if (this.myNode) {
    myNode = this.myNode;
  }

  this.setRouterCreationTime(router.creationTime);
  this.setRouterBandwidth(router.bandwidth);
  this.setRouterMemory(router.memory);
  this.setDnsMode(router.dnsMode);
  this.setDnsNodeID(
    router.dnsMode === DnsMode.NONE ? undefined : router.dnsNodeID
  );
  this.setIsDnsNode(
    router.dnsMode === DnsMode.MANUAL && router.dnsNodeID === myNode.entityID
  );
};

/**
 * Isolates updates that we should do when a router's stats change, since
 * these happen a lot more often.
 * @param {NetSimRouterNode} router
 * @private
 */
NetSim.prototype.onRouterStatsChange_ = function(router) {
  this.setRouterQueuedPacketCount_(router.getQueuedPacketCount());
  this.setRouterMemoryInUse_(router.getMemoryInUse());
  this.setRouterDataRate_(router.getCurrentDataRate());
};

/**
 * What to do when our connected router's local network changes.
 * @private
 */
NetSim.prototype.onRouterWiresChange_ = function() {
  if (this.isConnectedToRouter()) {
    this.setDnsTableContents(this.getConnectedRouter().getAddressTable());
  }
};

/**
 * What to do when our connected router's logs change.
 * @private
 */
NetSim.prototype.onRouterLogChange_ = function() {
  if (this.isConnectedToRouter()) {
    this.setRouterLogData(this.getConnectedRouter().getLog());
  }
};

/**
 * Kick off an animation that shows the local node setting the state of a
 * simplex wire.
 * @param {"0"|"1"} newState
 */
NetSim.prototype.animateSetWireState = function(newState) {
  this.visualization_.animateSetWireState(newState);
};

/**
 * Kick off an animation that shows the local node reading the state of a
 * simplex wire.
 * @param {"0"|"1"} newState
 */
NetSim.prototype.animateReadWireState = function(newState) {
  this.visualization_.animateReadWireState(newState);
};

/**
 * Specifically, update the layout of the right column when connected,
 * and change how the three panels there (received log, sent log, send controls)
 * share the current vertical space in the viewport.
 *
 * We're trying to use the following rules:
 *
 * 1. The send controls panel is fixed to the bottom of the viewport, and will
 *    size upwards to fit its contents up to a maximum height.
 * 2. The log widgets use the remaining vertical space
 *    a) If only one log widget is open, it fills the vertical space (except
 *       leaves enough room to see the other header)
 *    b) If both log widgets are open, they share the vertical space 50/50
 *    c) If both log widgets are closed, they float at the top of the space.
 */
NetSim.prototype.updateLayout = function() {
  var rightColumn = $('#netsim-rightcol');
  var sendPanel = $('#netsim-send');
  var logWrap = $('#netsim-logs');

  netsimDebouncedResizeFooter();

  if (this.lobby_) {
    this.lobby_.updateLayout();
  }

  if (!rightColumn.is(':visible')) {
    return;
  }

  // Right column wrapper and the send panel are both sized by CSS
  var rightColumnHeight = rightColumn.height();
  var sendPanelHeight = sendPanel.height();
  var logsSharedVerticalSpace = rightColumnHeight - sendPanelHeight;

  var showingSent = !this.sentMessageLog_.isMinimized();
  var showingReceived = !this.receivedMessageLog_.isMinimized();
  if (showingReceived && showingSent) {
    var halfHeight = Math.floor(logsSharedVerticalSpace / 2);
    this.receivedMessageLog_.setHeight(halfHeight);
    this.sentMessageLog_.setHeight(halfHeight);
  } else if (showingReceived) {
    this.receivedMessageLog_.setHeight(
      Math.floor(logsSharedVerticalSpace - this.sentMessageLog_.getHeight())
    );
  } else if (showingSent) {
    this.sentMessageLog_.setHeight(
      Math.floor(logsSharedVerticalSpace - this.receivedMessageLog_.getHeight())
    );
  }

  // Manually adjust the logwrap to the remaining height
  logWrap.css('height', rightColumnHeight - sendPanelHeight);
};

/**
 * Appropriate steps for when the student hits the "Continue to next level"
 * button.  Should mark the level as complete and navigate to the next level.
 */
NetSim.prototype.completeLevelAndContinue = function() {
  if (this.isConnectedToRemote() && !confirm(i18n.onBeforeUnloadWarning())) {
    return;
  }

  // Avoid multiple simultaneous submissions.
  $('.submitButton').attr('disabled', true);

  window.dashboard.reporting.sendReport({
    fallbackResponse: this.reportingInfo_.fallback_response,
    callback: this.reportingInfo_.callback,
    app: 'netsim',
    level: this.level.id,
    result: true,
    testResult: 100,
    onComplete: function(serverResponse) {
      // Re-enable submit button, in case there's nowhere to go.
      $('.submitButton').attr('disabled', false);

      // If there's somewhere to go, disconnect and go!
      if (serverResponse.redirect) {
        if (this.isConnectedToRemote()) {
          this.disconnectFromRemote(function() {
            window.location.href = serverResponse.redirect;
          });
        } else {
          window.location.href = serverResponse.redirect;
        }
      }
    }.bind(this)
  });
};

/**
 * Attempt to reset the simulation shard, kicking all users out and resetting
 * all data.
 */
NetSim.prototype.resetShard = function() {
  if (this.shard_ && confirm(i18n.shardResetConfirmation())) {
    this.shard_.resetEverything(
      function(err) {
        if (err) {
          logger.error(err);
          NetSimAlert.error(i18n.shardResetError());
          return;
        }
      }.bind(this)
    );
  }
};

/**
 * Show the instrutions modal dialog on top of the NetSim interface.
 */
NetSim.prototype.showInstructionsDialog = function() {
  getStore().dispatch(
    openInstructionsDialog({
      autoClose: false,
      imgOnly: false,
      hintsOnly: false
    })
  );
};
