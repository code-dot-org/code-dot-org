/**
 * @overview UI controller for lobby - handles flow for name entry, section
 *           selection, and remote node selection.
 * @see NetSimShardSelectionPanel for name entry and shard selection.
 * @see NetSimRemoteNodeSelectionPanel for implementation of the actual
 *      lobby table.
 */
'use strict';

var utils = require('../utils');
var _ = require('../lodash');
var i18n = require('./locale');
var NetSimNodeFactory = require('./NetSimNodeFactory');
var NetSimClientNode = require('./NetSimClientNode');
var NetSimAlert = require('./NetSimAlert');
var NetSimApiError = require('./NetSimApiError');
var NetSimRouterNode = require('./NetSimRouterNode');
var NetSimShardSelectionPanel = require('./NetSimShardSelectionPanel');
var NetSimRemoteNodeSelectionPanel = require('./NetSimRemoteNodeSelectionPanel');

var logger = require('./NetSimLogger').getSingleton();
var NetSimGlobals = require('./NetSimGlobals');

/**
 * @typedef {Object} ShardChoice
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
 * @param {NetSim} connection - The shard connection that this
 *        lobby control will manipulate.
 * @param {Object} options
 * @param {DashboardUser} options.user
 * @param {string} options.levelKey
 * @param {string} options.sharedShardSeed
 * @constructor
 * @augments NetSimPanel
 */
var NetSimLobby = module.exports = function (rootDiv, netsim, options) {
  /**
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

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
   * @type {DashboardUser}
   * @private
   */
  this.user_ = options.user;

  /**
   * @type {string}
   * @private
   */
  this.displayName_ = (options.user.isSignedIn) ? options.user.name : '';

  /**
   * Shard options for the current user
   * @type {ShardChoice[]}
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
   * @type {NetSimNode}
   * @private
   */
  this.remoteNode_ = null;

  /**
   * Allows multiple methods to have a 'disable' lock on the lobby.
   * @type {Object}
   * @private
   */
  this.disableEverythingKeys_ = {};

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
  var isConnectedToShard = (this.shard_ !== null);
  if (!isConnectedToShard) {

    // Shard selection panel: Controls for setting display name and picking
    // a section, if they aren't set automatically.
    this.shardSelectionPanel_ = new NetSimShardSelectionPanel(
        this.rootDiv_,
        {
          displayName: this.displayName_,
          shardChoices: this.shardChoices_,
          selectedShardID: this.selectedShardID_,
          disableControls: this.isEverythingDisabled()
        },
        {
          setNameCallback: this.setDisplayName.bind(this),
          setShardCallback: this.setShardID.bind(this)
        });

  } else {

    // Node selection panel: The lobby list of who we can connect to, and
    // controls for picking one and connecting.
    this.nodeSelectionPanel_ = new NetSimRemoteNodeSelectionPanel(
        this.rootDiv_,
        {
          user: this.user_,
          shardID: this.shard_.id,
          nodesOnShard: this.nodesOnShard_,
          incomingConnectionNodes: this.incomingConnectionNodes_,
          remoteNode: this.remoteNode_,
          myNodeID: this.myNode_.entityID,
          disableControls: this.isEverythingDisabled()
        },
        {
          addRouterCallback: this.addRouterToLobby.bind(this),
          cancelButtonCallback: this.onCancelButtonClick_.bind(this),
          joinButtonCallback: this.onJoinButtonClick_.bind(this),
          resetShardCallback: this.onResetShardButtonClick_.bind(this)
        });

  }

  this.netsim_.debouncedResizeFooter();
};

NetSimLobby.prototype.updateLayout = function () {
  if (this.nodeSelectionPanel_) {
    this.nodeSelectionPanel_.updateLayout();
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
  if (this.eventKeys.registeredShard) {
    this.eventKeys.registeredShard.nodeTable.tableChange.unregister(
        this.eventKeys.nodeTable);
    this.eventKeys.registeredShard.wireTable.tableChange.unregister(
        this.eventKeys.wireTable);
    this.registeredShard = undefined;
  }

  this.shard_ = shard;
  this.myNode_ = myNode;

  if (this.shard_) {
    // We got connected to a shard!
    // Register for events
    this.eventKeys.nodeTable = this.shard_.nodeTable.tableChange.register(
        this.onNodeTableChange_.bind(this));
    this.eventKeys.wireTable = this.shard_.wireTable.tableChange.register(
        this.onWireTableChange_.bind(this));
    this.eventKeys.registeredShard = this.shard_;

    // Trigger a forced read of the node table
    this.fetchInitialLobbyData_();
  } else {
    // We've been disconnected from a shard
    // Clear our selected shard ID
    this.selectedShardID_ = undefined;

    // Clear cached lobby data
    this.nodesOnShard_.length = 0;
    this.incomingConnectionNodes_.length = 0;

    // Redraw the lobby
    this.render();

    // If there's only one option, try to auto-reconnect
    if (this.shardChoices_.length === 1) {
      this.setShardID(this.shardChoices_[0].shardID);
    }
  }
};

/**
 * Upon connecting to a new shard, we need to trigger a manual read of the
 * node and wire tables to ensure our lobby listing is correct.  Otherwise we'd
 * have to wait until a change was detected in one of those tables.
 * @private
 */
NetSimLobby.prototype.fetchInitialLobbyData_ = function () {
  $.when(this.shard_.nodeTable.refresh(), this.shard_.wireTable.refresh())
      .fail(function (nodeErr, wireErr) {
        if (nodeErr) {
          logger.warn('Node table refresh failed: ' + nodeErr);
        } else if (wireErr) {
          logger.warn('Wire table refresh failed: ' + wireErr);
        }
      }.bind(this))
      .done(function () {
        // Because the lobby may not get table-change events from this refresh,
        // manually pass the cached table contents in.
        this.onNodeTableChange_();
        this.onWireTableChange_();

        // If we use routers and there's no router, create a router.
        // TODO: Move this logic to the server, somehow.
        if (NetSimGlobals.getLevelConfig().canConnectToRouters &&
            !this.doesShardContainRouter()) {
          this.addRouterToLobby();
        }
      }.bind(this));
};

/**
 * @returns {boolean} whether the currently cached node data for the shard
 *          includes a router node.
 */
NetSimLobby.prototype.doesShardContainRouter = function () {
  return undefined !== _.find(this.nodesOnShard_, function (shardNode) {
        return shardNode instanceof NetSimRouterNode;
      });
};

/**
 * Generate a new router node, configured according to the current level.
 * The change to the node table should trigger appropriate updates to various
 * UI elements.
 */
NetSimLobby.prototype.addRouterToLobby = function () {
  var enableCallback = this.disableEverything();
  NetSimRouterNode.create(this.shard_, function (err) {
    enableCallback();
    if (err) {
      var ValidationError = NetSimApiError.ValidationError;
      switch (err.details) {
        case ValidationError.CONFLICT:
          // Another router with the same routerNumber already exists.
          // Ignore this; to the user it looks like it worked!
          logger.warn('Did not create router; ' +
              'Another user created a router at the same time.');
          break;

        case ValidationError.LIMIT_REACHED:
          // The server's router limit has been reached.
          // Usually the client will remove the "Add Router" button first.
          logger.warn('Did not create router; Router limit reached.');
          NetSimAlert.warn(i18n.routerLimitReachedError());
          break;

        default:
          // Malformed row or some other unexpected error.
          logger.error("Unable to create router: " + err.message);
          NetSimAlert.error(i18n.addRouterToLobbyError());
      }
    }
  }.bind(this));
};

/**
 * @returns {boolean} TRUE if anything has requested the whole lobby to be
 *          disabled, false otherwise.
 */
NetSimLobby.prototype.isEverythingDisabled = function () {
  return Object.keys(this.disableEverythingKeys_).length > 0;
};

/**
 * Disable all of the lobby controls together.
 * @returns {function} Callback for re-enabling the lobby.
 */
NetSimLobby.prototype.disableEverything = function () {
  var requestKey = utils.createUuid();
  this.disableEverythingKeys_[requestKey] = true;

  if (this.nodeSelectionPanel_) {
    this.nodeSelectionPanel_.disableEverything();
  }

  // Return an 'enable' callback
  return this.enableEverything_.bind(this, requestKey);
};

/**
 * Release a 'disable-hold' on the lobby and re-enable the lobby controls if
 * it was the last such disable-hold.
 * @param {!string} key - a unique identifier for this particular disable request.
 * @private
 */
NetSimLobby.prototype.enableEverything_ = function (key) {
  delete this.disableEverythingKeys_[key];
  if (!this.isEverythingDisabled()) {
    if (this.nodeSelectionPanel_) {
      this.nodeSelectionPanel_.enableEverything();
    }
  }
};

/**
 * Handler for clicking the "Join" button.
 * @param {NetSimClientNode|NetSimRouterNode} nodeToJoin
 */
NetSimLobby.prototype.onJoinButtonClick_ = function (nodeToJoin) {
  var enableCallback = this.disableEverything();
  if (nodeToJoin instanceof NetSimRouterNode) {
    this.netsim_.connectToRouter(nodeToJoin.entityID, enableCallback);
  } else if (nodeToJoin instanceof NetSimClientNode) {
    this.myNode_.connectToClient(nodeToJoin, enableCallback);
  }
};

/**
 * Handler for clicking the "Cancel" button to stop trying to connect to
 * another client.
 * @private
 */
NetSimLobby.prototype.onCancelButtonClick_ = function () {
  var enableCallback = this.disableEverything();
  this.netsim_.disconnectFromRemote(enableCallback);
};

/**
 * Handle for clicking the reset shard button.
 * @private
 */
NetSimLobby.prototype.onResetShardButtonClick_ = function () {
  this.netsim_.resetShard();
};

/**
 * Called whenever a change is detected in the nodes table - which should
 * trigger a refresh of the lobby listing
 * @private
 */
NetSimLobby.prototype.onNodeTableChange_ = function () {
  this.nodesOnShard_ = NetSimNodeFactory.nodesFromRows(this.shard_,
      this.shard_.nodeTable.readAll());
  this.render();
};

/**
 * Called whenever a change is detected in the wires table.
 * @private
 */
NetSimLobby.prototype.onWireTableChange_ = function () {
  var rows = this.shard_.wireTable.readAll();
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
    this.setShardID(this.shardChoices_[0].shardID);
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
