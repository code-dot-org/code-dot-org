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
var LogLevel = NetSimLogger.LogLevel;
var ObservableEvent = require('./ObservableEvent');
var periodicAction = require('./periodicAction');
var netsimInstance = require('./netsimInstance');

/**
 * How often the client should run its clean-up job, removing expired rows
 * from the instance tables
 * @type {number}
 * @const
 */
var CLEAN_UP_INTERVAL_MS = 10000;

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
   * Selected instance.
   * @type {netsimInstance}
   * @private
   */
  this.instance_ = null;

  /**
   * The local client's node representation within the instance.
   * @type {NetSimNodeClient}
   */
  this.myNode = null;

  /**
   * Allows others to subscribe to connection status changes.
   * args: none
   * Notifies on:
   * - Connect to instance
   * - Disconnect from instance
   * - Connect to router
   * - Got address from router
   * - Disconnect from router
   * @type {ObservableEvent}
   */
  this.statusChanges = new ObservableEvent();

  /**
   * Helper for performing instance clean-up on a regular interval
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

/**
 * @param {!RunLoop.Clock} clock
 */
NetSimConnection.prototype.tick = function (clock) {
  if (this.myNode) {
    this.myNode.tick(clock);
  }
};

/**
 * @returns {NetSimLogger}
 */
NetSimConnection.prototype.getLogger = function () {
  return this.logger_;
};

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
 * Establishes a new connection to a netsim instance, closing the old one
 * if present.
 * @param {string} instanceID
 */
NetSimConnection.prototype.connectToInstance = function (instanceID) {
  if (this.isConnectedToInstance()) {
    this.logger_.log("Auto-closing previous connection...", LogLevel.WARN);
    this.disconnectFromInstance();
  }

  this.instance_ = netsimInstance(instanceID);
  this.createMyClientNode_();
};

/**
 * Ends the connection to the netsim instance.
 */
NetSimConnection.prototype.disconnectFromInstance = function () {
  if (!this.isConnectedToInstance()) {
    this.logger_.log("Redundant disconnect call.", LogLevel.WARN);
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
  NetSimNodeClient.create(this.instance_, function (node) {
    if (node) {
      self.myNode = node;
      self.myNode.setDisplayName(self.displayName_);
      self.myNode.update(function () {
        self.statusChanges.notifyObservers();
      });
    } else {
      self.logger_.error("Failed to create client node.");
    }
  });
};

/**
 * Whether we are currently connected to a netsim instance
 * @returns {boolean}
 */
NetSimConnection.prototype.isConnectedToInstance = function () {
  return (null !== this.myNode);
};

/**
 * Gets all rows in the lobby and passes them to callback.  Callback will
 * get an empty array if we were unable to get lobby data.
 * @param callback
 */
NetSimConnection.prototype.getAllNodes = function (callback) {
  if (!this.isConnectedToInstance()) {
    this.logger_.warn("Can't get lobby rows, not connected to instance.");
    callback([]);
    return;
  }

  var self = this;
  this.instance_.getLobbyTable().all(function (rows) {
    if (!rows) {
      self.logger_.warn("Lobby data request failed, using empty list.");
      callback([]);
      return;
    }

    var nodes = rows.map(function (row) {
      if (row.type === NetSimNodeClient.getNodeType()) {
        return new NetSimNodeClient(self.instance_, row);
      } else if (row.type === NetSimNodeRouter.getNodeType()) {
        return new NetSimNodeRouter(self.instance_, row);
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
  if (!this.instance_) {
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
  this.instance_.getWireTable().all(function (rows) {
    if (rows) {
      rows.map(function (row) {
        return new NetSimWire(self.instance_, row);
      }).forEach(function (wire) {
        if (wire.isExpired()) {
          wire.destroy();
        }
      });
    }
  });
};

/**
 * Adds a row to the lobby for a new router node.
 */
NetSimConnection.prototype.addRouterToLobby = function () {
  var self = this;
  NetSimNodeRouter.create(this.instance_, function () {
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
    this.logger_.warn("Auto-disconnecting from previous router.");
    this.disconnectFromRouter();
  }

  var self = this;
  NetSimNodeRouter.get(routerID, this.instance_, function (router) {
    if (!router) {
      return;
    }

    self.myNode.connectToRouter(router, function () {
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
    this.logger_.warn("Cannot disconnect: Not connected.");
    return;
  }

  var self = this;
  this.myNode.disconnectRemote(function () {
    self.statusChanges.notifyObservers();
  });
};