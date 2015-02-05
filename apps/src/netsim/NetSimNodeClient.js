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
 * @param {!netsimInstance} instance
 * @param {Object} [clientRow] - Lobby row for this router.
 * @constructor
 * @augments NetSimNode
 */
var NetSimNodeClient = function (instance, clientRow) {
  superClass.call(this, instance, clientRow);

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
 * @param {!netsimInstance} instance
 * @param {function} [onComplete] - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimNodeClient.create = function (instance, onComplete) {
  NetSimEntity.create(NetSimNodeClient, instance, onComplete);
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
  NetSimNodeClient.create(this.instance_, function (node) {
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