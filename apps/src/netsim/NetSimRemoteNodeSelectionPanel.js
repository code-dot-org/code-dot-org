/**
 * @overview Lobby table UI component.
 * @see NetSimLobby for usage.
 */

import $ from 'jquery';
import _ from 'lodash';
import i18n from '@cdo/netsim/locale';
import NetSimPanel from './NetSimPanel';
import markup from './NetSimRemoteNodeSelectionPanel.html.ejs';
import {NodeType} from './NetSimConstants';
import NetSimGlobals from './NetSimGlobals';
import NetSimUtils from './NetSimUtils';
import NetSimRouterNode from './NetSimRouterNode';
import {setupFunctionPrototypeInherits} from '../utils';
setupFunctionPrototypeInherits(Function);

/**
 * Apply a very small debounce to lobby buttons to avoid doing extra work
 * as a result of double-clicks and/or scripts that want to click buttons a
 * few thousand times.
 * @const {number}
 */
var BUTTON_DEBOUNCE_DURATION_MS = 100;

/**
 * Generator and controller for lobby node listing, selection, and connection
 * controls.
 *
 * @param {jQuery} rootDiv
 *
 * @param {Object} options
 * @param {DashboardUser} options.user
 * @param {string} options.shardID
 * @param {string} options.shardDisplayName
 * @param {boolean} options.isUserInMultipleSections
 * @param {NetSimNode[]} options.nodesOnShard
 * @param {NetSimNode[]} options.incomingConnectionNodes
 * @param {NetSimNode} options.remoteNode - null if not attempting to connect
 * @param {number} options.myNodeID
 * @param {boolean} options.disableControls
 *
 * @param {Object} callbacks
 * @param {function} callbacks.addRouterCallback
 * @param {function} callbacks.cancelButtonCallback
 * @param {function} callbacks.joinButtonCallback
 * @param {function} callbacks.resetShardCallback
 * @param {function} callbacks.showRouterLogCallback
 * @param {function} callbacks.showTeacherLogCallback
 *
 * @constructor
 * @augments NetSimPanel
 */
export default function NetSimRemoteNodeSelectionPanel(
  rootDiv,
  options,
  callbacks
) {
  /**
   * @type {DashboardUser}
   * @private
   */
  this.user_ = options.user;

  /**
   * @type {string}
   * @private
   */
  this.shardID_ = options.shardID;

  /**
   * @type {string}
   * @private
   */
  this.shardDisplayName_ = options.shardDisplayName;

  /**
   * @type {boolean}
   * @private
   */
  this.isUserInMultipleSections_ = !!options.isUserInMultipleSections;

  /**
   * @type {NetSimNode[]}
   * @private
   */
  this.nodesOnShard_ = options.nodesOnShard;

  /**
   * @type {NetSimNode[]}
   * @private
   */
  this.incomingConnectionNodes_ = options.incomingConnectionNodes;

  /**
   * @type {NetSimNode}
   * @private
   */
  this.remoteNode_ = options.remoteNode;

  /**
   * @type {number}
   * @private
   */
  this.myNodeID_ = options.myNodeID;

  function buttonDebounce(callback) {
    return _.debounce(callback, BUTTON_DEBOUNCE_DURATION_MS, {
      leading: true,
      trailing: false,
    });
  }

  /**
   * Handler for "Add Router" button
   * @private {function}
   */
  this.addRouterCallback_ = buttonDebounce(callbacks.addRouterCallback);

  /**
   * Handler for cancel button (backs out of non-mutual connection)
   * @private {function}
   */
  this.cancelButtonCallback_ = buttonDebounce(callbacks.cancelButtonCallback);

  /**
   * Handler for "join" button next to each connectable node.
   * @private {function}
   */
  this.joinButtonCallback_ = buttonDebounce(callbacks.joinButtonCallback);

  /**
   * Handler for "reset shard" button click.
   * @private {function}
   */
  this.resetShardCallback_ = buttonDebounce(callbacks.resetShardCallback);

  /**
   * Handler for "Router Log" button click.
   * @private {function}
   */
  this.showRouterLogCallback_ = buttonDebounce(callbacks.showRouterLogCallback);

  /**
   * Handler for "Teacher View" button click
   * @private {function}
   */
  this.showTeacherLogCallback_ = buttonDebounce(
    callbacks.showTeacherLogCallback
  );

  // Initial render
  NetSimPanel.call(this, rootDiv, {
    className: 'netsim-lobby-panel',
    panelTitle: this.getLocalizedPanelTitle(),
    userToggleable: false,
  });

  if (options.disableControls) {
    this.disableEverything();
  }
}
NetSimRemoteNodeSelectionPanel.inherits(NetSimPanel);

/**
 * Recreate markup within panel body.
 */
NetSimRemoteNodeSelectionPanel.prototype.render = function () {
  // Clone the reference area (with handlers) before we re-render
  var referenceArea = $('#reference_area').first().clone(true);

  // Create boilerplate panel markup
  NetSimRemoteNodeSelectionPanel.superPrototype.render.call(this);

  const levelConfig = NetSimGlobals.getLevelConfig();

  // Add our own content markup
  var newMarkup = $(
    markup({
      controller: this,
      shardDisplayName: this.shardDisplayName_,
      nodesOnShard: this.nodesOnShard_,
      incomingConnectionNodes: this.incomingConnectionNodes_,
      remoteNode: this.remoteNode_,
      canSeeTeacherLog:
        levelConfig.showAddRouterButton && this.canCurrentUserSeeTeacherLog_(),
    })
  );
  this.getBody().html(newMarkup);

  this.updateLayout();

  // Move the reference area to beneath the instructions
  this.getBody().find('.reference-area-placeholder').append(referenceArea);

  // Teachers and admins get a special "Reset Simulation" button
  if (this.canCurrentUserResetShard()) {
    this.addButton(i18n.shardResetButton(), this.resetShardCallback_);
  }

  // Button that takes you to the next level.
  NetSimUtils.makeContinueButton(this);

  var addRouterButton = this.getBody().find('#netsim-lobby-add-router');
  addRouterButton.click(unlessDisabled(this.addRouterCallback_));

  var showRouterLogButton = this.getBody().find('#show-router-log-modal');
  showRouterLogButton.click(unlessDisabled(this.showRouterLogCallback_));

  var showTeacherLogButton = this.getBody().find('#show-teacher-log-modal');
  showTeacherLogButton.click(unlessDisabled(this.showTeacherLogCallback_));

  this.getBody()
    .find('.join-button')
    .click(unlessDisabled(this.onJoinClick_.bind(this)));
  this.getBody()
    .find('.accept-button')
    .click(unlessDisabled(this.onJoinClick_.bind(this)));
  this.getBody()
    .find('.cancel-button')
    .click(unlessDisabled(this.cancelButtonCallback_));
};

/**
 * Wrap the provided callback in a check to make sure the target is not disabled.
 * @param {function} callback
 * @returns {function}
 */
function unlessDisabled(callback) {
  return function (jQueryEvent) {
    if (!$(jQueryEvent.target).is('[disabled]')) {
      callback(jQueryEvent);
    }
  };
}

/**
 * Updates the layout of the markup, usually in response to a window
 * resize. Currently just adjusts the height of the lobby table to keep
 * everything onscreen.
 */
NetSimRemoteNodeSelectionPanel.prototype.updateLayout = function () {
  var lobbyTable = this.getBody().find('#netsim-scrolling-lobby');
  var container = this.getBody().closest('#netsim-disconnected');

  if (lobbyTable.is(':visible')) {
    lobbyTable.height('auto');
    var overflow =
      container.prop('scrollHeight') - container.prop('clientHeight');

    if (overflow > 0) {
      var newHeight = lobbyTable.height() - overflow;
      var minHeight = 1.1 * lobbyTable.find('tr').first().outerHeight(true);
      lobbyTable.height(Math.max(newHeight, minHeight));
    }
  }
};

/**
 * @returns {string} a localized panel title appropriate to the current level
 *          configuration
 */
NetSimRemoteNodeSelectionPanel.prototype.getLocalizedPanelTitle = function () {
  var levelConfig = NetSimGlobals.getLevelConfig();

  if (levelConfig.canConnectToClients && levelConfig.canConnectToRouters) {
    return i18n.connectToANode();
  } else if (levelConfig.canConnectToClients) {
    return i18n.connectToAPeer();
  } else if (levelConfig.canConnectToRouters) {
    if (levelConfig.broadcastMode) {
      return i18n.connectToARoom();
    }
    return i18n.connectToARouter();
  }
  return i18n.connectToANode();
};

/**
 * @returns {string} localized lobby instructions appropriate to the current
 *          level configuration
 */
NetSimRemoteNodeSelectionPanel.prototype.getLocalizedLobbyInstructions =
  function () {
    var levelConfig = NetSimGlobals.getLevelConfig();

    if (levelConfig.canConnectToClients && levelConfig.canConnectToRouters) {
      return i18n.lobbyInstructionsGeneral();
    } else if (levelConfig.canConnectToClients) {
      return i18n.lobbyInstructionsForPeers();
    } else if (levelConfig.canConnectToRouters) {
      if (levelConfig.broadcastMode) {
        return i18n.lobbyInstructionsForRooms();
      }
      return i18n.lobbyInstructionsForRouters();
    }
    return i18n.lobbyInstructionsGeneral();
  };

/**
 * @param {Event} jQueryEvent
 * @private
 */
NetSimRemoteNodeSelectionPanel.prototype.onJoinClick_ = function (jQueryEvent) {
  var target = $(jQueryEvent.target);
  var nodeID = target.data('nodeId');
  var clickedNode = _.find(this.nodesOnShard_, function (node) {
    return node.entityID === nodeID;
  });

  this.joinButtonCallback_(clickedNode);
};

/**
 * @param {NetSimNode} node
 * @returns {boolean}
 */
NetSimRemoteNodeSelectionPanel.prototype.isMyNode = function (node) {
  return this.myNodeID_ === node.entityID;
};

/**
 * Check whether the level configuration allows connections to the specified
 * node.
 * @param {NetSimNode} connectionTarget
 * @returns {boolean} whether connection to the target is allowed
 */
NetSimRemoteNodeSelectionPanel.prototype.canConnectToNode = function (
  connectionTarget
) {
  // Can't connect to own node
  if (this.isMyNode(connectionTarget)) {
    return false;
  }

  var isClient = connectionTarget.getNodeType() === NodeType.CLIENT;
  var isRouter = connectionTarget.getNodeType() === NodeType.ROUTER;

  // Can't connect to full routers
  if (connectionTarget.isFull()) {
    return false;
  }

  // Permissible connection limited by level configuration
  var levelConfig = NetSimGlobals.getLevelConfig();
  var allowClients = levelConfig.canConnectToClients;
  var allowRouters = levelConfig.canConnectToRouters;
  return (isClient && allowClients) || (isRouter && allowRouters);
};

/**
 * @returns {boolean} TRUE if we have an open outgoing connection request.
 */
NetSimRemoteNodeSelectionPanel.prototype.hasOutgoingRequest = function () {
  return !!this.remoteNode_;
};

/**
 * For use with Array.prototype.filter()
 * @param {NetSimNode} node
 * @returns {boolean} TRUE if the given node should show up in the lobby
 */
NetSimRemoteNodeSelectionPanel.prototype.shouldShowNode = function (node) {
  var levelConfig = NetSimGlobals.getLevelConfig();
  var isClient = node.getNodeType() === NodeType.CLIENT;
  var isRouter = node.getNodeType() === NodeType.ROUTER;
  var showClients = levelConfig.showClientsInLobby;
  var showRouters = levelConfig.showRoutersInLobby;
  return (isClient && showClients) || (isRouter && showRouters);
};

/**
 * @returns {boolean} TRUE if the current user is the only client node connected
 *          to the shard right now.
 */
NetSimRemoteNodeSelectionPanel.prototype.isUserAlone = function () {
  return !this.nodesOnShard_.some(
    node => !this.isMyNode(node) && node.getNodeType() === NodeType.CLIENT
  );
};

/**
 * @returns {boolean} TRUE if the current user has a choice of sections to join.
 */
NetSimRemoteNodeSelectionPanel.prototype.isUserInMultipleSections =
  function () {
    return this.isUserInMultipleSections_;
  };

/**
 * @returns {boolean} TRUE if we expect the current user to have permission to
 *          perform a shard reset.  Only governs display of shard reset button,
 *          actual reset is authenticated on the server.
 */
NetSimRemoteNodeSelectionPanel.prototype.canCurrentUserResetShard =
  function () {
    return NetSimUtils.doesUserOwnShard(this.user_, this.shardID_);
  };

NetSimRemoteNodeSelectionPanel.prototype.canCurrentUserSeeTeacherLog_ =
  function () {
    return NetSimUtils.doesUserOwnShard(this.user_, this.shardID_);
  };

/**
 * @returns {boolean} TRUE if it's currently possible to add a new router.
 *          Drives whether the "Add Router" button should be displayed.
 */
NetSimRemoteNodeSelectionPanel.prototype.canAddRouter = function () {
  var levelConfig = NetSimGlobals.getLevelConfig();
  if (this.hasOutgoingRequest() || !levelConfig.showAddRouterButton) {
    return false;
  }

  var routerLimit = NetSimRouterNode.getMaximumRoutersPerShard();
  var routerCount = this.nodesOnShard_.filter(function (node) {
    return NodeType.ROUTER === node.getNodeType();
  }).length;
  return routerCount < routerLimit;
};

/**
 * Disable all of the buttons within the panel (does not apply to panel-header
 * buttons!)
 */
NetSimRemoteNodeSelectionPanel.prototype.disableEverything = function () {
  this.getBody().find('.netsim-button').attr('disabled', true);
};

/**
 * Enable all of the buttons within the panel (does not apply to panel-header
 * buttons!)
 */
NetSimRemoteNodeSelectionPanel.prototype.enableEverything = function () {
  this.getBody().find('.netsim-button').removeAttr('disabled');
};
