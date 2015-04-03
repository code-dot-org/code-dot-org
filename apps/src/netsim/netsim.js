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
var i18n = require('../../locale/current/netsim');
var netsimUtils = require('./netsimUtils');
var DnsMode = require('./netsimConstants').DnsMode;
var NetSimConnection = require('./NetSimConnection');
var DashboardUser = require('./DashboardUser');
var NetSimShardSelectionPanel = require('./NetSimShardSelectionPanel');
var NetSimLobby = require('./NetSimLobby');
var NetSimTabsComponent = require('./NetSimTabsComponent');
var NetSimSendPanel = require('./NetSimSendPanel');
var NetSimLogPanel = require('./NetSimLogPanel');
var NetSimStatusPanel = require('./NetSimStatusPanel');
var NetSimVisualization = require('./NetSimVisualization');
var RunLoop = require('../RunLoop');

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
   * Current chunk size (bytesize)
   * @type {number}
   * @private
   */
  this.chunkSize_ = 8;

  /**
   * Current dns mode.
   * @type {DnsMode}
   * @private
   */
  this.dnsMode_ = DnsMode.NONE;
};


/**
 *
 */
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
 */
NetSim.prototype.init = function(config) {
  if (!this.studioApp_) {
    throw new Error("NetSim requires a StudioApp");
  }

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

NetSim.prototype.shouldEnableCleanup = function () {
  return !location.search.match(/disableCleaning/i);
};

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

  this.receivedMessageLog_ = new NetSimLogPanel($('#netsim_received'), {
    logTitle: i18n.receivedMessageLog(),
    isMinimized: false,
    packetSpec: this.level.clientInitialPacketHeader
  });

  this.sentMessageLog_ = new NetSimLogPanel($('#netsim_sent'), {
    logTitle: i18n.sentMessageLog(),
    isMinimized: true,
    packetSpec: this.level.clientInitialPacketHeader
  });

  this.connection_ = new NetSimConnection({
    window: window,
    levelConfig: this.level,
    sentLog: this.sentMessageLog_,
    receivedLog: this.receivedMessageLog_,
    enableCleanup: this.shouldEnableCleanup()
  });
  this.connection_.attachToRunLoop(this.runLoop_);
  this.connection_.statusChanges.register(this.refresh_.bind(this));
  this.connection_.shardChange.register(this.onShardChange_.bind(this));

  this.statusPanel_ = new NetSimStatusPanel($('#netsim_status'),
      this.connection_.disconnectFromRouter.bind(this.connection_));

  this.visualization_ = new NetSimVisualization($('svg'), this.runLoop_,
      this.connection_);

  // Shard selection panel: Controls for setting display name and picking
  // a section, if they aren't set automatically.
  this.shardSelector_ = new NetSimShardSelectionPanel(
      $('.shard-selection-panel'),
      this.connection_,
      user
  );

  var lobbyContainer = document.getElementById('netsim_lobby_container');
  this.lobbyControl_ = NetSimLobby.createWithin(lobbyContainer, this.level,
      this.connection_, user, this.getOverrideShardID());

  // Tab panel - contains instructions, my device, router, dns
  if (this.shouldShowAnyTabs()) {
    this.tabs_ = new NetSimTabsComponent(
        $('#netsim_tabs'),
        this.level,
        {
          chunkSizeSliderChangeCallback: this.setChunkSize.bind(this),
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

  this.sendWidget_ = new NetSimSendPanel($('#netsim_send'), this.level,
      this.connection_);

  this.changeEncodings(this.level.defaultEnabledEncodings);
  this.setChunkSize(this.chunkSize_);
  this.setRouterBandwidth(this.level.defaultRouterBandwidth);
  this.setRouterMemory(this.level.defaultRouterMemory);
  this.setDnsMode(this.level.defaultDnsMode);
  this.refresh_();
};

/**
 * Respond to connection status changes show/hide the main content area.
 * @private
 */
NetSim.prototype.refresh_ = function () {
  if (this.connection_.isConnectedToRouter()) {
    this.mainContainer_.find('.leftcol_disconnected').hide();
    this.mainContainer_.find('.leftcol_connected').show();
  } else {
    this.mainContainer_.find('.leftcol_disconnected').show();
    this.mainContainer_.find('.leftcol_connected').hide();
  }
  this.render();
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
  if (this.tabs_) {
    this.tabs_.setEncodings(newEncodings);
  }
  this.receivedMessageLog_.setEncodings(newEncodings);
  this.sentMessageLog_.setEncodings(newEncodings);
  this.sendWidget_.setEncodings(newEncodings);
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
  this.sendWidget_.setChunkSize(newChunkSize);
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
  if (this.myConnectedRouter_) {
    this.myConnectedRouter_.setBandwidth(newBandwidth);
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
  if (this.myConnectedRouter_) {
    this.myConnectedRouter_.setMemory(newMemory);
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
 * Sets DNS mode across the whole simulation, propagating the change
 * to other clients.
 * @param {DnsMode} newDnsMode
 */
NetSim.prototype.changeRemoteDnsMode = function (newDnsMode) {
  this.setDnsMode(newDnsMode);
  if (this.myConnectedRouter_) {
    this.myConnectedRouter_.setDnsMode(newDnsMode);
  }
};

/**
 * @param {boolean} isDnsNode
 */
NetSim.prototype.setIsDnsNode = function (isDnsNode) {
  if (this.tabs_) {
    this.tabs_.setIsDnsNode(isDnsNode);
  }
  if (this.myConnectedRouter_) {
    this.setDnsTableContents(this.myConnectedRouter_.getAddressTable());
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
  if (this.connection_ && this.connection_.myNode) {
    clientStatus = 'In Lobby';
    myHostname = this.connection_.myNode.getHostname();
    if (this.connection_.myNode.myWire) {
      myAddress = this.connection_.myNode.myWire.localAddress;
    }
  }

  if (this.myConnectedRouter_) {
    isConnected = true;
    clientStatus = i18n.connected();
    remoteNodeName = this.myConnectedRouter_.getDisplayName();
  }

  if (this.shardSelector_) {
    this.shardSelector_.render();
  }

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
  this.render();
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

  if (this.routerStatsChangeKey !== undefined) {
    this.myConnectedRouter_.statsChange.unregister(this.routerStatsChangeKey);
    this.routerStatsChangeKey = undefined;
  }

  if (this.routerWireChangeKey !== undefined) {
    this.myConnectedRouter_.wiresChange.unregister(this.routerWireChangeKey);
    this.routerWireChangeKey = undefined;
  }

  if (this.routerLogChangeKey !== undefined) {
    this.myConnectedRouter_.logChange.unregister(this.routerLogChangeKey);
    this.routerLogChangeKey = undefined;
  }

  var connectEvent = router && !this.myConnectedRouter_;
  var disconnectEvent = this.myConnectedRouter_ && !router;

  this.myConnectedRouter_ = router;
  this.render();

  // Hook up new handlers
  if (router) {
    // Hook up new handlers
    this.routerStateChangeKey = router.stateChange.register(
        this.onRouterStateChange_.bind(this));

    this.routerStatsChangeKey = router.statsChange.register(
        this.onRouterStatsChange_.bind(this));

    this.routerWireChangeKey = router.wiresChange.register(
        this.onRouterWiresChange_.bind(this));

    this.routerLogChangeKey = router.logChange.register(
        this.onRouterLogChange_.bind(this));
  }

  if (connectEvent) {
    this.onRouterConnect_(router);
  } else if (disconnectEvent) {
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
  if (this.connection_ && this.connection_.myNode) {
    myNode = this.connection_.myNode;
  }

  this.setRouterCreationTime(router.creationTime);
  this.setRouterBandwidth(router.bandwidth);
  this.setRouterMemory(router.memory);
  this.setDnsMode(router.dnsMode);
  this.setDnsNodeID(router.dnsMode === DnsMode.NONE ? undefined : router.dnsNodeID);
  this.setIsDnsNode(router.dnsMode === DnsMode.MANUAL &&
      router.dnsNodeID === myNode.entityID);
};

NetSim.prototype.onRouterStatsChange_ = function (router) {
  this.setRouterQueuedPacketCount_(router.getQueuedPacketCount());
  this.setRouterMemoryInUse_(router.getMemoryInUse());
  this.setRouterDataRate_(router.getCurrentDataRate());
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
