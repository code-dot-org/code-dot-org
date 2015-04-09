/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
/* global $ */
'use strict';

var utils = require('../utils');
var _ = utils.getLodash();
var i18n = require('../../locale/current/netsim');
var netsimNodeFactory = require('./netsimNodeFactory');
var NetSimClientNode = require('./NetSimClientNode');
var NetSimRouterNode = require('./NetSimRouterNode');
var NetSimShardSelectionPanel = require('./NetSimShardSelectionPanel');
var NetSimRemoteNodeSelectionPanel = require('./NetSimRemoteNodeSelectionPanel');
var markup = require('./NetSimLobby.html');

var logger = require('./NetSimLogger').getSingleton();

/**
 * @typedef {Object} shardChoice
 * @property {string} shardSeed - unique key for shard within level, used in
 *           share URLs
 * @property {string} shardID - unique key for shard in tables API, used as
 *           prefix to table names.  Must be 48 characters or less, and
 *           consistently generatable from a level ID and seed.
 * @property {string} displayName - localized shard name
 */

/**
 * Generator and controller for lobby/connection controls.
 *
 * @param {jQuery} rootDiv
 * @param {netsimLevelConfiguration} levelConfig
 * @param {NetSim} connection - The shard connection that this
 *        lobby control will manipulate.
 * @param {Object} options
 * @param {DashboardUser} options.user
 * @param {string} options.levelKey
 * @param {string} options.sharedShardSeed
 * @constructor
 * @augments NetSimPanel
 */
var NetSimLobby = module.exports = function (rootDiv, levelConfig, netsim,
    options) {
  /**
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * @type {netsimLevelConfiguration}
   * @private
   */
  this.levelConfig_ = levelConfig;

  /**
   * Shard connection that this lobby control will manipulate.
   * @type {NetSim}
   * @private
   */
  this.netsim_ = netsim;

  /**
   * @type {string}
   * @private
   */
  this.levelKey_ = options.levelKey;

  /**
   * @type {NetSimShardSelectionPanel}
   * @private
   */
  this.shardSelectionPanel_ = null;

  /**
   * @type {NetSimRemoteNodeSelectionPanel}
   * @private
   */
  this.nodeSelectionPanel_ = null;

  /**
   * @type {NetSimShard}
   * @private
   */
  this.shard_ = null;

  /**
   * @type {NetSimLocalClientNode}
   * @private
   */
  this.myNode_ = null;

  /**
   * Storage for ObservableEvent registration keys, to make sure we
   * can unregister as needed.
   * @type {Object}
   */
  this.eventKeys = {};

  /**
   * @type {string}
   * @private
   */
  this.displayName_ = (options.user.isSignedIn) ? options.user.name : '';

  /**
   * Shard options for the current user
   * @type {shardChoice[]}
   * @private
   */
  this.shardChoices_ = [];

  /**
   * Which shard ID is currently selected
   * @type {string}
   * @private
   */
  this.selectedShardID_ = undefined;

  /**
   * @type {NetSimNode[]}
   * @private
   */
  this.nodesOnShard_ = [];

  /**
   * @type {NetSimNode[]}
   * @private
   */
  this.incomingConnectionNodes_ = [];

  /**
   * Which node in the lobby is currently selected
   * @type {NetSimClientNode|NetSimRouterNode}
   * @private
   */
  this.selectedNode_ = null;

  /**
   * @type {NetSimNode}
   * @private
   */
  this.remoteNode_ = null;

  // Figure out the list of user sections, which requires an async request
  // and re-render if the user is signed in.
  if (options.user.isSignedIn) {
    this.getUserSections_(function (sectionList) {
      this.buildShardChoiceList_(sectionList, options.sharedShardSeed);
      this.render();
    }.bind(this));
  } else {
    this.buildShardChoiceList_([], options.sharedShardSeed);
  }

  // Initial render
  this.render();

  // Register for events
  this.netsim_.shardChange.register(this.onShardChange_.bind(this));
};

/**
 * Recreate markup within panel body.
 */
NetSimLobby.prototype.render = function () {
  // Add our own content markup
  var newMarkup = $(markup({}));
  this.rootDiv_.html(newMarkup);

  // Shard selection panel: Controls for setting display name and picking
  // a section, if they aren't set automatically.
  this.shardSelectionPanel_ = new NetSimShardSelectionPanel(
      this.rootDiv_.find('.shard-select'),
      {
        displayName: this.displayName_,
        shardChoices: this.shardChoices_,
        selectedShardID: this.selectedShardID_
      },
      {
        setNameCallback: this.setDisplayName.bind(this),
        setShardCallback: this.setShardID.bind(this)
      });

  // Node selection panel: The lobby list of who we can connect to, and
  // controls for picking one and connecting.
  if (this.shard_) {
    this.nodeSelectionPanel_ = new NetSimRemoteNodeSelectionPanel(
        this.rootDiv_.find('.remote-node-select'),
        {
          levelConfig: this.levelConfig_,
          nodesOnShard: this.nodesOnShard_,
          incomingConnectionNodes: this.incomingConnectionNodes_,
          selectedNode: this.selectedNode_,
          remoteNode: this.remoteNode_,
          myNodeID: this.myNode_.entityID
        },
        {
          addRouterCallback: this.addRouterToLobby.bind(this),
          selectNodeCallback: this.selectNode.bind(this),
          connectButtonCallback: this.onConnectButtonClick_.bind(this),
          cancelButtonCallback: this.onCancelButtonClick_.bind(this)
        });
  }
};

/**
 * @param {string} displayName
 */
NetSimLobby.prototype.setDisplayName = function (displayName) {
  this.displayName_ = displayName;
  this.render();

  if (this.selectedShardID_ && this.displayName_ &&
      !this.netsim_.isConnectedToShardID(this.selectedShardID_)) {
    this.netsim_.connectToShard(this.selectedShardID_, this.displayName_);
  }
};

/**
 * @param {string} shardID
 */
NetSimLobby.prototype.setShardID = function (shardID) {
  this.selectedShardID_ = shardID;
  this.render();

  if (this.selectedShardID_ && this.displayName_ &&
      !this.netsim_.isConnectedToShardID(this.selectedShardID_)) {
    this.netsim_.connectToShard(this.selectedShardID_, this.displayName_);
  }
};

/**
 * @param {NetSimShard} shard
 * @param {NetSimLocalClientNode} myNode
 * @private
 */
NetSimLobby.prototype.onShardChange_ = function (shard, myNode) {
  // Unregister old handlers
  if (this.eventKeys.nodeTable) {
    this.shard_.nodeTable.tableChange.unregister(this.eventKeys.nodeTable);
  }
  if (this.eventKeys.wireTable) {
    this.shard_.wireTable.tableChange.unregister(this.eventKeys.wireTable);
  }

  this.shard_ = shard;
  this.myNode_ = myNode;

  if (!this.shard_) {
    // If we disconnected, just clear our lobby data
    this.nodesOnShard_.length = 0;
    this.incomingConnectionNodes_.length = 0;
    return;
  }

  // Register for events
  this.eventKeys.nodeTable = this.shard_.nodeTable.tableChange.register(
      this.onNodeTableChange_.bind(this));
  this.eventKeys.wireTable = this.shard_.wireTable.tableChange.register(
      this.onWireTableChange_.bind(this));

  // Trigger a forced read of the node table
  this.fetchInitialLobbyData_();
};

/**
 * Upon connecting to a new shard, we need to trigger a manual read of the
 * node and wire tables to ensure our lobby listing is correct.  Otherwise we'd
 * have to wait until a change was detected in one of those tables.
 * @private
 */
NetSimLobby.prototype.fetchInitialLobbyData_ = function () {
  this.shard_.nodeTable.readAll(function (err, rows) {
    if (err) {
      logger.warn("Node table read failed: " + err.message);
      return;
    }

    this.onNodeTableChange_(rows);
    this.shard_.wireTable.readAll(function (err, rows) {
      if (err) {
        logger.warn("Wire table read failed: " + err.message);
        return;
      }

      this.onWireTableChange_(rows);
    }.bind(this));
  }.bind(this));
};

/**
 * Generate a new router node, configured according to the current level.
 * The change to the node table should trigger appropriate updates to various
 * UI elements.
 */
NetSimLobby.prototype.addRouterToLobby = function () {
  NetSimRouterNode.create(this.shard_, function (err, router) {
    if (err) {
      logger.error("Unable to create router: " + err.message);
      return;
    }

    router.bandwidth = this.levelConfig_.defaultRouterBandwidth;
    router.memory = this.levelConfig_.defaultRouterMemory;
    router.dnsMode = this.levelConfig_.defaultDnsMode;
    router.update(function () {});
  }.bind(this));
};

/**
 * @param {NetSimNode} node
 */
NetSimLobby.prototype.selectNode = function (node) {
  this.selectedNode_ = node;
  this.render();
};

/** Handler for clicking the "Connect" button. */
NetSimLobby.prototype.onConnectButtonClick_ = function () {
  if (!this.selectedNode_) {
    return;
  }

  if (this.selectedNode_ instanceof NetSimRouterNode) {
    this.netsim_.connectToRouter(this.selectedNode_.entityID);
  } else if (this.selectedNode_ instanceof NetSimClientNode) {
    this.myNode_.connectToClient(this.selectedNode_, function () {});
  }
};

/**
 * Handler for clicking the "Cancel" button to stop trying to connect to
 * another client.
 * @private
 */
NetSimLobby.prototype.onCancelButtonClick_ = function () {
  this.netsim_.disconnectFromRemote();
};

/**
 * Called whenever a change is detected in the nodes table - which should
 * trigger a refresh of the lobby listing
 * @param {!Array} rows
 * @private
 */
NetSimLobby.prototype.onNodeTableChange_ = function (rows) {
  this.nodesOnShard_ = netsimNodeFactory.nodesFromRows(this.shard_, rows);
  this.render();
};

/**
 * Called whenever a change is detected in the wires table.
 * @param {!Array} rows
 * @private
 */
NetSimLobby.prototype.onWireTableChange_ = function (rows) {
  // Update the collection of nodes with connections pointing toward us.
  this.incomingConnectionNodes_ = rows.filter(function (wireRow) {
    return wireRow.remoteNodeID === this.myNode_.entityID;
  }, this).map(function (wireRow) {
    return _.find(this.nodesOnShard_, function (node) {
      return node.entityID === wireRow.localNodeID;
    });
  }, this).filter(function (node) {
    // In case the wire table change comes in before the node table change.
    return node !== undefined;
  });

  // Find outgoing wires
  var outgoingWireRow = _.find(rows, function (wireRow) {
    return wireRow.localNodeID === this.myNode_.entityID;
  }.bind(this));

  this.remoteNode_ = outgoingWireRow ?
      _.find(this.nodesOnShard_, function (node) {
        return node.entityID === outgoingWireRow.remoteNodeID;
      }) : null;

  // Re-render with new information
  this.render();
};


/**
 * Send a request to dashboard and retrieve a JSON array listing the
 * sections this user belongs to.
 * @param {function} callback
 * @private
 */
NetSimLobby.prototype.getUserSections_ = function (callback) {
  var memberSectionsRequest = $.ajax({
    dataType: 'json',
    url: '/v2/sections/membership'
  });

  var ownedSectionsRequest = $.ajax({
    dataType: 'json',
    url: '/v2/sections'
  });

  $.when(memberSectionsRequest, ownedSectionsRequest).done(function (result1, result2) {
    var memberSectionData = result1[0];
    var ownedSectionData = result2[0];
    callback(memberSectionData.concat(ownedSectionData));
  });
};

/**
 * Populate the internal cache of shard options, given a set of the current
 * user's sections.
 * @param {Array} sectionList - list of sections this user is a member or
 *        administrator of.  Each section has an id and a name.  May be empty.
 * @param {string} sharedShardSeed - a shard ID present if we reached netsim
 *        via a share link.  We should make sure this shard is an option.
 * @private
 */
NetSimLobby.prototype.buildShardChoiceList_ = function (
    sectionList, sharedShardSeed) {
  this.shardChoices_.length = 0;

  // If we have a shared shard seed, put it first in the list:
  if (sharedShardSeed) {
    var sharedShardID = this.makeShardIDFromSeed_(sharedShardSeed);
    this.shardChoices_.push({
      shardSeed: sharedShardSeed,
      shardID: sharedShardID,
      displayName: sharedShardSeed
    });
  }

  // Add user's sections to the shard list
  this.shardChoices_ = this.shardChoices_.concat(
      sectionList.map(function (section) {
        return {
          shardSeed: section.id,
          shardID: this.makeShardIDFromSeed_(section.id),
          displayName: section.name
        };
      }.bind(this)));

  // If there still aren't any options, generate a random shard
  if (this.shardChoices_.length === 0) {
    var seed = utils.createUuid();
    var randomShardID = this.makeShardIDFromSeed_(seed);
    this.shardChoices_.push({
      shardSeed: seed,
      shardID: randomShardID,
      displayName: i18n.myPrivateNetwork()
    });
  }

  // If there's only one possible shard, select it by default
  if (this.shardChoices_.length === 1 && !this.selectedShardID_) {
    this.selectedShardID_ = this.shardChoices_[0].shardID;
  }
};

/**
 * Generate a unique shard key from the given seed
 * @param {string} seed
 * @private
 */
NetSimLobby.prototype.makeShardIDFromSeed_ = function (seed) {
  // TODO (bbuchanan) : Hash shard ID, more likely to ensure it's unique
  //                    and fits within 48 characters.
  // Maybe grab this MIT-licensed implementation via node?
  // https://github.com/blueimp/JavaScript-MD5
  return ('ns_' + this.levelKey_ + '_' + seed).substr(0, 48);
};

/**
 * Gets a share URL for the currently-selected shard ID.
 * @returns {string} or empty string if there is no shard selected.
 */
NetSimLobby.prototype.getShareLink = function () {
  if (!this.displayName_) {
    return '';
  }

  var selectedShard = _.find(this.shardChoices_, function (shard) {
    return shard.shardID === this.selectedShardID_;
  }.bind(this));

  if (selectedShard) {
    var baseLocation = document.location.protocol + '//' +
        document.location.host + document.location.pathname;
    return baseLocation + '?s=' + selectedShard.shardSeed;
  }

  return '';
};
