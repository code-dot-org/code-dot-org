/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://blockly.googlecode.com/
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
 * @fileoverview Components for creating connections between blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Connection');
goog.provide('Blockly.ConnectionDB');

goog.require('Blockly.BlockSpace');
goog.require('goog.array');
goog.require('goog.string');

/**
 * SVG paths for drawing next/previous notch from left to right, left to right
 * with highlighting, and right to left. In both cases, there's currently
 * assumption that NOTCH_WIDTH and NOTCH_PATH_WIDTH (which are defined on
 * BlockSvg) are the same.
 */
var ROUNDED_NOTCH_PATHS = {
  left: 'l 6,4 3,0 6,-4',
  leftHighlight: 'l 6.5,4 2,0 6.5,-4',
  right: 'l -6,4 -3,0 -6,-4'
};

var SQUARE_NOTCH_PATHS = {
  left: 'l 0,5 15,0 0,-5',
  leftHighlight: 'l 0,5 15,0 0,-5',
  right: 'l 0,5 -15,0 0,-5'
};

/**
 * Class for a connection between blocks.
 * @param {!Blockly.Block} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @constructor
 */
Blockly.Connection = function(source, type) {
  this.sourceBlock_ = source;
  this.targetConnection = null;
  /**
   * Type of connection. Constant values defined in blockly.js
   * e.g. Blockly.INPUT_VALUE, Blockly.OUTPUT_VALUE
   * @type {number}
   */
  this.type = type;
  /**
   * Absolute x coordinate of connection
   * @type {number}
   * @private
   */
  this.x_ = 0;
  /**
   * Absolute y coordinate of connection
   * @type {number}
   * @private
   */
  this.y_ = 0;
  this.inDB_ = false;
  // Shortcut for the databases for this connection's blockSpace.
  this.dbList_ = this.sourceBlock_.blockSpace.connectionDBList;

  /**
   * Compatible type check
   * @type {?Array.<Blockly.BlockValueType>} array of valid connection types
   * @private
   */
  this.check_ = null;
};

/**
 * Is this connection currently connected to another connection.
 */
Blockly.Connection.prototype.isConnected = function () {
  return this.targetConnection !== null;
};

/**
 * Sever all links to this connection (not including from the source object).
 */
Blockly.Connection.prototype.dispose = function() {
  if (this.isConnected()) {
    throw 'Disconnect connection before disposing of it.';
  }
  if (this.inDB_) {
    this.dbList_[this.type].removeConnection_(this);
  }
  this.inDB_ = false;
  if (Blockly.highlightedConnection_ == this) {
    Blockly.highlightedConnection_ = null;
  }
  if (Blockly.localConnection_ == this) {
    Blockly.localConnection_ = null;
  }
};

/**
 * Does the connection belong to a superior block (higher in the source stack)?
 * @return {boolean} True if connection faces down or right.
 */
Blockly.Connection.prototype.isSuperior = function() {
  return this.type === Blockly.INPUT_VALUE ||
    this.type === Blockly.NEXT_STATEMENT ||
    this.type === Blockly.FUNCTIONAL_INPUT;
};

/**
 * Connect this connection to another connection.
 * @param {!Blockly.Connection} connectTo Connection to connect to.
 */
Blockly.Connection.prototype.connect = function(connectTo) {
  if (this.sourceBlock_ == connectTo.sourceBlock_) {
    throw 'Attempted to connect a block to itself.';
  }
  if (this.sourceBlock_.blockSpace !== connectTo.sourceBlock_.blockSpace) {
    throw 'Blocks are on different blockSpaces.';
  }
  if (Blockly.OPPOSITE_TYPE[this.type] != connectTo.type) {
    throw 'Attempt to connect incompatible types.';
  }
  if (this.isConnected()) {
    throw 'Source connection already connected.';
  }

  if (connectTo.targetConnection) {
    this.handleOrphan_(connectTo);
  }

  // Determine which block is superior (higher in the source stack).
  var parentBlock, childBlock;
  if (this.isSuperior()) {
    // Superior block.
    parentBlock = this.sourceBlock_;
    childBlock = connectTo.sourceBlock_;
  } else {
    // Inferior block.
    parentBlock = connectTo.sourceBlock_;
    childBlock = this.sourceBlock_;
  }

  // Establish the connections.
  this.targetConnection = connectTo;
  connectTo.targetConnection = this;

  // Demote the inferior block so that one is a child of the superior one.
  childBlock.setParent(parentBlock);

  if (parentBlock.rendered) {
    parentBlock.getSvgRenderer().updateDisabled();
  }
  if (childBlock.rendered) {
    childBlock.getSvgRenderer().updateDisabled();
  }
  if (parentBlock.rendered && childBlock.rendered) {
    if (this.type == Blockly.NEXT_STATEMENT ||
        this.type == Blockly.PREVIOUS_STATEMENT) {
      // Child block may need to square off its corners if it is in a stack.
      // Rendering a child will render its parent.
      childBlock.render();
    } else {
      // Child block does not change shape.  Rendering the parent node will
      // move its connected children into position.
      parentBlock.render();
    }
  }

  // Mark as userHidden if the parent is userHidden
  if (!this.sourceBlock_.isUserVisible()) {
    this.sourceBlock_.setUserVisible(false);
  }
};

/**
 * Handle the orphaned block of existingConnection when connecting this to
 * existingConnection. This consists of detaching the orphan, and then depending
 * on its type, potentially trying to reattach it elsewhere.
 */
Blockly.Connection.prototype.handleOrphan_ = function (existingConnection) {
  var orphanBlock = existingConnection.targetBlock();
  orphanBlock.setParent(null);
  orphanBlock.setUserVisible(true);

  if (this.type === Blockly.INPUT_VALUE || this.type === Blockly.OUTPUT_VALUE) {
    if (!orphanBlock.outputConnection) {
      throw 'Orphan block does not have an output connection.';
    }

    // Attempt to reattach the orphan at the end of the newly inserted
    // block.  Since this block may be a row, walk down to the end.
    var newBlock = this.sourceBlock_;
    var connection;
    while (connection = Blockly.Connection.singleConnection_(newBlock,
      orphanBlock)) {
      // '=' is intentional in line above.
      if (connection.targetBlock()) {
        newBlock = connection.targetBlock();
      } else {
        connection.connect(orphanBlock.outputConnection);
        orphanBlock = null;
        break;
      }
    }

    // if we didn't find a new location for our orphan, bump it away
    if (orphanBlock) {
      window.setTimeout(function() {
        orphanBlock.outputConnection.bumpAwayFrom_(existingConnection);
      }, Blockly.BUMP_DELAY);
    }
  } else if (this.type === Blockly.FUNCTIONAL_INPUT
      || this.type === Blockly.FUNCTIONAL_OUTPUT) {
    if (!orphanBlock.previousConnection) {
      throw 'Orphan block does not have a previous connection.';
    }
    // bump away the orphaned block
    window.setTimeout(function() {
      orphanBlock.previousConnection.bumpAwayFrom_(existingConnection);
    }, Blockly.BUMP_DELAY);
  } else {
    // Statement blocks may be inserted into the middle of a stack, which case
    // we want to attach the orphan to the end of the inserted blocks
    if (this.type != Blockly.PREVIOUS_STATEMENT) {
      throw 'Can only do a mid-stack connection with the top of a block.';
    }

    if (!orphanBlock.previousConnection) {
      throw 'Orphan block does not have a previous connection.';
    }
    // Attempt to reattach the orphan at the bottom of the newly inserted
    // block.  Since this block may be a stack, walk down to the end.
    var newBlock = this.sourceBlock_;
    while (newBlock.nextConnection) {
      if (newBlock.nextConnection.targetConnection) {
        newBlock = newBlock.nextConnection.targetBlock();
      } else {
        newBlock.nextConnection.connect(orphanBlock.previousConnection);
        orphanBlock = null;
        break;
      }
    }
    if (orphanBlock) {
      // Unable to reattach orphan.  Bump it off to the side.
      window.setTimeout(function() {
        orphanBlock.previousConnection.bumpAwayFrom_(existingConnection);
      }, Blockly.BUMP_DELAY);
    }
  }
}

/**
 * Does the given block have one and only one connection point that will accept
 * the orphaned block?
 * @param {!Blockly.Block} block The superior block.
 * @param {!Blockly.Block} orphanBlock The inferior block.
 * @return {Blockly.Connection} The suitable connection point on 'block',
 *     or null.
 * @private
 */
Blockly.Connection.singleConnection_ = function(block, orphanBlock) {
  var connection = false;
  for (var x = 0; x < block.inputList.length; x++) {
    var thisConnection = block.inputList[x].connection;
    if (thisConnection && thisConnection.type == Blockly.INPUT_VALUE &&
        orphanBlock.outputConnection.checkAllowedConnectionType_(thisConnection)) {
      if (connection) {
        return null;  // More than one connection.
      }
      connection = thisConnection;
    }
  }
  return connection;
};

/**
 * Disconnect this connection.
 */
Blockly.Connection.prototype.disconnect = function() {
  var otherConnection = this.targetConnection;
  if (!otherConnection) {
    throw 'Source connection not connected.';
  } else if (otherConnection.targetConnection != this) {
    throw 'Target connection not connected to source connection.';
  }
  otherConnection.targetConnection = null;
  this.targetConnection = null;
  this.sourceBlock_.setUserVisible(true);

  // Rerender the parent so that it may reflow.
  var parentBlock, childBlock;
  if (this.isSuperior()) {
    // Superior block.
    parentBlock = this.sourceBlock_;
    childBlock = otherConnection.sourceBlock_;
  } else {
    // Inferior block.
    parentBlock = otherConnection.sourceBlock_;
    childBlock = this.sourceBlock_;
  }
  if (parentBlock.rendered) {
    parentBlock.render();
  }
  if (childBlock.rendered) {
    childBlock.getSvgRenderer().updateDisabled();
    childBlock.render();
  }
};

/**
 * Returns the block that this connection connects to.
 * @return {Blockly.Block} The connected block or null if none is connected.
 */
Blockly.Connection.prototype.targetBlock = function() {
  if (this.targetConnection) {
    return this.targetConnection.sourceBlock_;
  }
  return null;
};

/**
 * Move the block(s) belonging to the connection to a point where they don't
 * visually interfere with the specified connection.
 * @param {!Blockly.Connection} staticConnection The connection to move away
 *     from.
 * @private
 */
Blockly.Connection.prototype.bumpAwayFrom_ = function(staticConnection) {
  if (Blockly.Block.isDragging()) {
    // Don't move blocks around while the user is doing the same.
    return;
  }
  // Move the root block.
  var rootBlock = this.sourceBlock_.getRootBlock();
  if (rootBlock.isInFlyout) {
    // Don't move blocks around in a flyout.
    return;
  }
  var reverse = false;
  if (!rootBlock.isMovable()) {
    // Can't bump an uneditable block away.
    // Check to see if the other block is movable.
    rootBlock = staticConnection.sourceBlock_.getRootBlock();
    if (!rootBlock.isMovable()) {
      return;
    }
    // Swap the connections and move the 'static' connection instead.
    staticConnection = this;
    reverse = true;
  }
  // Raise it to the top for extra visibility.
  rootBlock.getSvgRoot().parentNode.appendChild(rootBlock.getSvgRoot());
  var dx = (staticConnection.x_ + Blockly.SNAP_RADIUS) - this.x_;
  var dy = (staticConnection.y_ + Blockly.SNAP_RADIUS * 2) - this.y_;
  if (reverse) {
    // When reversing a bump due to an uneditable block, bump up.
    dy = -dy;
  }
  if (Blockly.RTL) {
    dx = -dx;
  }
  rootBlock.moveBy(dx, dy);
};

/**
 * Change the connection's coordinates.
 * @param {number} x New absolute x coordinate.
 * @param {number} y New absolute y coordinate.
 */
Blockly.Connection.prototype.moveTo = function(x, y) {
  // Remove it from its old location in the database (if already present)
  if (this.inDB_) {
    this.dbList_[this.type].removeConnection_(this);
  }
  this.x_ = x;
  this.y_ = y;
  // Insert it into its new location in the database.
  this.dbList_[this.type].addConnection_(this);
};

/**
 * Change the connection's coordinates.
 * @param {number} dx Change to x coordinate.
 * @param {number} dy Change to y coordinate.
 */
Blockly.Connection.prototype.moveBy = function(dx, dy) {
  this.moveTo(this.x_ + dx, this.y_ + dy);
};

/**
 * Add highlighting around this connection.
 */
Blockly.Connection.prototype.highlight = function() {
  var steps;
  if (this.type === Blockly.INPUT_VALUE || this.type === Blockly.OUTPUT_VALUE) {
    var tabWidth = Blockly.RTL ? -Blockly.BlockSvg.TAB_WIDTH :
                                 Blockly.BlockSvg.TAB_WIDTH;
    steps = 'm 0,0 v 5 c 0,10 ' + -tabWidth + ',-8 ' + -tabWidth + ',7.5 s ' +
            tabWidth + ',-2.5 ' + tabWidth + ',7.5 v 5';
  } else {
    var moveWidth = 5 + Blockly.BlockSvg.NOTCH_PATH_WIDTH;
    var notchPaths = this.getNotchPaths();
    if (Blockly.RTL) {
      steps = 'm ' + moveWidth + ',0 h -5 ' + notchPaths.right + ' h -5';
    } else {
      steps = 'm -' + moveWidth + ',0 h 5 ' + notchPaths.left + ' h 5';
    }
  }
  var xy = this.sourceBlock_.getRelativeToSurfaceXY();
  var x = this.x_ - xy.x;
  var y = this.y_ - xy.y;
  Blockly.Connection.highlightedPath_ = Blockly.createSvgElement('path',
      {'class': 'blocklyHighlightedConnectionPath',
       'd': steps,
       transform: 'translate(' + x + ', ' + y + ')'},
      this.sourceBlock_.getSvgRoot());
};

/**
 * Remove the highlighting around this connection.
 */
Blockly.Connection.prototype.unhighlight = function() {
  goog.dom.removeNode(Blockly.Connection.highlightedPath_);
  delete Blockly.Connection.highlightedPath_;
};

/**
 *
 */
Blockly.Connection.prototype.getNotchPaths = function () {
  if (Blockly.Connection.NOTCH_PATHS_OVERRIDE) {
    return Blockly.Connection.NOTCH_PATHS_OVERRIDE;
  }

  var constraints = this && this.check_ || [];
  if (constraints.length === 1 && constraints[0] === Blockly.BlockValueType.FUNCTION) {
    return SQUARE_NOTCH_PATHS;
  }
  return ROUNDED_NOTCH_PATHS;
};


/**
 * Move the blocks on either side of this connection right next to each other.
 * @private
 */
Blockly.Connection.prototype.tighten_ = function() {
  var dx = Math.round(this.targetConnection.x_ - this.x_);
  var dy = Math.round(this.targetConnection.y_ - this.y_);
  if (dx != 0 || dy != 0) {
    var block = this.targetBlock();
    var svgRoot = block.getSvgRoot();
    if (!svgRoot) {
      throw 'block is not rendered.';
    }
    var xy = Blockly.getRelativeXY(svgRoot);
    block.getSvgRoot().setAttribute('transform',
        'translate(' + (xy.x - dx) + ', ' + (xy.y - dy) + ')');
    block.moveConnections_(-dx, -dy);
  }
};

/**
 * Find the closest compatible connection to this connection.
 * @param {number} maxLimit The maximum radius to another connection.
 * @param {number} dx Horizontal offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @param {number} dy Vertical offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @return {!Object} Contains two properties: 'connection' which is either
 *     another connection or null, and 'radius' which is the distance.
 */
Blockly.Connection.prototype.closest = function(maxLimit, dx, dy) {
  if (this.isConnected()) {
    // Don't offer to connect to a connection that's already connected.
    return {connection: null, radius: maxLimit};
  }
  // Determine the opposite type of connection.
  var oppositeType = Blockly.OPPOSITE_TYPE[this.type];
  var db = this.dbList_[oppositeType];

  // Since this connection is probably being dragged, add the delta.
  var currentX = this.x_ + dx;
  var currentY = this.y_ + dy;

  // Binary search to find the closest y location.
  var pointerMin = 0;
  var pointerMax = db.length - 2;
  var pointerMid = pointerMax;
  while (pointerMin < pointerMid) {
    if (db[pointerMid].y_ < currentY) {
      pointerMin = pointerMid;
    } else {
      pointerMax = pointerMid;
    }
    pointerMid = Math.floor((pointerMin + pointerMax) / 2);
  }

  // Walk forward and back on the y axis looking for the closest x,y point.
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  var closestConnection = null;
  var sourceBlock = this.sourceBlock_;
  var thisConnection = this;
  if (db.length) {
    while (pointerMin >= 0 && checkConnection_(pointerMin)) {
      pointerMin--;
    }
    do {
      pointerMax++;
    } while (pointerMax < db.length && checkConnection_(pointerMax));
  }

  /**
   * Computes if the current connection is within the allowed radius of another
   * connection.
   * This function is a closure and has access to outside variables.
   * @param {number} yIndex The other connection's index in the database.
   * @return {boolean} True if the search needs to continue: either the current
   *     connection's vertical distance from the other connection is less than
   *     the allowed radius, or if the connection is not compatible.
   */
  function checkConnection_(yIndex) {
    var connection = db[yIndex];
    var targetSourceBlock = connection.sourceBlock_;

    // Don't offer to connect to hidden blocks, unless we're in edit mode
    if (!Blockly.editBlocks && !targetSourceBlock.isVisible()) {
      return true;
    }

    if (connection.type === Blockly.OUTPUT_VALUE ||
        connection.type === Blockly.FUNCTIONAL_OUTPUT ||
        connection.type === Blockly.PREVIOUS_STATEMENT) {
      // Don't offer to connect an already connected left (male) value plug to
      // an available right (female) value plug.  Don't offer to connect the
      // bottom of a statement block to one that's already connected.
      if (connection.targetConnection) {
        return true;
      }
    }

    // Don't offer to connect if the target is immovable
    if (connection.targetConnection && !connection.targetBlock().isMovable()) {
      return true;
    }

    // Don't offer to connect if the target can't disconnect from parent
    if (connection.targetConnection &&
        !connection.targetBlock().canDisconnectFromParent()) {
      return true;
    }

    // Offering to connect the top of a statement block to an already connected
    // connection is ok, we'll just insert it into the stack.
    // Offering to connect the left (male) of a value block to an already
    // connected value pair is ok, we'll splice it in.

    // Do type checking.
    if (!thisConnection.checkAllowedConnectionType_(connection)) {
      return true;
    }

    // Don't let blocks try to connect to themselves or ones they nest.
    do {
      if (sourceBlock == targetSourceBlock) {
        return true;
      }
      targetSourceBlock = targetSourceBlock.getParent();
    } while (targetSourceBlock);

    // IF connections are part of dragged group, update with dx/dy.
    var connectionX = connection.x_;
    var connectionY = connection.y_;
    if (connection.sourceBlock_.getDragging()) {
      connectionX += dx;
      connectionY += dy;
    }

    var distX = currentX - connectionX;
    var distY = currentY - connectionY;
    var r = Math.sqrt(distX * distX + distY * distY);
    if (r <= maxLimit) {
      closestConnection = db[yIndex];
      maxLimit = r;
    }
    return distY < maxLimit;
  }
  return {connection: closestConnection, radius: maxLimit};
};

/**
 * Is this connection compatible with another connection with respect to the
 * value type system.  E.g. square_root("Hello") is not compatible.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @private
 */
Blockly.Connection.prototype.checkAllowedConnectionType_ = function(otherConnection) {
  if (this.acceptsAnyType() || otherConnection.acceptsAnyType()) {
    // One or both sides are promiscuous enough that anything will fit.
    return true;
  }
  // Find any intersection in the check lists.
  for (var x = 0; x < this.check_.length; x++) {
    if (otherConnection.acceptsType(this.check_[x])) {
      return true;
    }
  }
  // No intersection.
  return false;
};

/**
 * Returns whether this connection is compatible with any/every type
 * @returns {boolean}
 */
Blockly.Connection.prototype.acceptsAnyType = function() {
  return !this.check_ || this.acceptsType(Blockly.BlockValueType.NONE);
};

/**
 * Returns whether this connection is compatible with a given type
 * @param type
 * @returns {boolean}
 */
Blockly.Connection.prototype.acceptsType = function(type) {
  return !this.check_ || goog.array.contains(this.check_, type);
};

/**
 * Change a connection's compatibility.
 * @param {*} check Compatible value type or list of value types.
 *     Null if all types are compatible.
 * @return {!Blockly.Connection} The connection being modified
 *     (to allow chaining).
 */
Blockly.Connection.prototype.setCheck = function(check) {
  if (check && check !== Blockly.BlockValueType.NONE) {
    // Ensure that check is in an array.
    if (!(check instanceof Array)) {
      check = [check];
    }

    this.check_ = check;

    // The new value type may not be compatible with the existing connection.
    if (this.targetConnection && !this.checkAllowedConnectionType_(this.targetConnection)) {
      if (this.isSuperior()) {
        this.targetBlock().setParent(null);
      } else {
        this.sourceBlock_.setParent(null);
      }
      // Bump away.
      this.sourceBlock_.bumpNeighbours_();
    }
  } else {
    this.check_ = null;
  }
  return this;
};

/**
 * @returns {?Array.<Blockly.BlockValueType>}
 */
Blockly.Connection.prototype.getCheck = function () {
  return this.check_;
};

/**
 * Find all nearby compatible connections to this connection.
 * Type checking does not apply, since this function is used for bumping.
 * @param {number} maxLimit The maximum radius to another connection.
 * @return {!Array.<Blockly.Connection>} List of connections.
 * @private
 */
Blockly.Connection.prototype.neighbours_ = function(maxLimit) {
  // Determine the opposite type of connection.
  var oppositeType = Blockly.OPPOSITE_TYPE[this.type];
  var db = this.dbList_[oppositeType];

  var currentX = this.x_;
  var currentY = this.y_;

  // Binary search to find the closest y location.
  var pointerMin = 0;
  var pointerMax = db.length - 2;
  var pointerMid = pointerMax;
  while (pointerMin < pointerMid) {
    if (db[pointerMid].y_ < currentY) {
      pointerMin = pointerMid;
    } else {
      pointerMax = pointerMid;
    }
    pointerMid = Math.floor((pointerMin + pointerMax) / 2);
  }

  // Walk forward and back on the y axis looking for the closest x,y point.
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  var neighbours = [];
  var sourceBlock = this.sourceBlock_;
  if (db.length) {
    while (pointerMin >= 0 && checkConnection_(pointerMin)) {
      pointerMin--;
    }
    do {
      pointerMax++;
    } while (pointerMax < db.length && checkConnection_(pointerMax));
  }

  /**
   * Computes if the current connection is within the allowed radius of another
   * connection.
   * This function is a closure and has access to outside variables.
   * @param {number} yIndex The other connection's index in the database.
   * @return {boolean} True if the current connection's vertical distance from
   *     the other connection is less than the allowed radius.
   */
  function checkConnection_(yIndex) {
    var connection = db[yIndex];
    var targetSourceBlock = connection.sourceBlock_;

    // Don't include invisible blocks unless we're in edit mode
    if (!Blockly.editBlocks && !targetSourceBlock.isVisible()) {
      return true;
    }

    var dx = currentX - connection.x_;
    var dy = currentY - connection.y_;
    var r = Math.sqrt(dx * dx + dy * dy);
    if (r <= maxLimit) {
      neighbours.push(db[yIndex]);
    }
    return dy < maxLimit;
  }
  return neighbours;
};

/**
 * Hide this connection, as well as all down-stream connections on any block
 * attached to this connection.  This happens when a block is collapsed.
 * Also hides down-stream comments.
 */
Blockly.Connection.prototype.hideAll = function() {
  if (this.inDB_) {
    this.dbList_[this.type].removeConnection_(this);
  }
  if (this.isConnected()) {
    var blocks = this.targetBlock().getDescendants();
    for (var b = 0; b < blocks.length; b++) {
      var block = blocks[b];
      // Hide all connections of all children.
      var connections = block.getConnections_(true);
      for (var c = 0; c < connections.length; c++) {
        var connection = connections[c];
        if (connection.inDB_) {
          this.dbList_[connection.type].removeConnection_(connection);
        }
      }
      // Close all bubbles of all children.
      var icons = block.getIcons();
      for (var x = 0; x < icons.length; x++) {
        icons[x].setVisible(false);
      }
    }
  }
};

/**
 * Unhide this connection, as well as all down-stream connections on any block
 * attached to this connection.  This happens when a block is expanded.
 * Also unhides down-stream comments.
 * @return {!Array.<!Blockly.Block>} List of blocks to render.
 */
Blockly.Connection.prototype.unhideAll = function() {
  if (!this.inDB_) {
    this.dbList_[this.type].addConnection_(this);
  }
  // All blocks that need unhiding must be unhidden before any rendering takes
  // place, since rendering requires knowing the dimensions of lower blocks.
  // Also, since rendering a block renders all its parents, we only need to
  // render the leaf nodes.
  var renderList = [];
  if (this.type != Blockly.INPUT_VALUE && this.type != Blockly.NEXT_STATEMENT) {
    // Only spider down.
    return renderList;
  }
  var block = this.targetBlock();
  if (block) {
    var connections;
    if (block.isCollapsed()) {
      // This block should only be partially revealed since it is collapsed.
      connections = [];
      block.outputConnection && connections.push(block.outputConnection);
      block.nextConnection && connections.push(block.nextConnection);
      block.previousConnection && connections.push(block.previousConnection);
    } else {
      // Show all connections of this block.
      connections = block.getConnections_(true);
    }
    for (var c = 0; c < connections.length; c++) {
      renderList = renderList.concat(connections[c].unhideAll());
    }
    if (renderList.length == 0) {
      // Leaf block.
      renderList[0] = block;
    }
  }
  return renderList;
};

/**
 * Database of connections.
 * Connections are stored in order of their vertical component.  This way
 * connections in an area may be looked up quickly using a binary search.
 * @constructor
 */
Blockly.ConnectionDB = function() {
};

Blockly.ConnectionDB.prototype = new Array();
/**
 * Don't inherit the constructor from Array.
 * @type {!Function}
 */
Blockly.ConnectionDB.constructor = Blockly.ConnectionDB;

/**
 * Add a connection to the database.  Must not already exist in DB.
 * @param {!Blockly.Connection} connection The connection to be added.
 * @private
 */
Blockly.ConnectionDB.prototype.addConnection_ = function(connection) {
  if (connection.inDB_) {
    throw 'Connection already in database.';
  }
  // Insert connection using binary search.
  var pointerMin = 0;
  var pointerMax = this.length;
  while (pointerMin < pointerMax) {
    var pointerMid = Math.floor((pointerMin + pointerMax) / 2);
    if (this[pointerMid].y_ < connection.y_) {
      pointerMin = pointerMid + 1;
    } else if (this[pointerMid].y_ > connection.y_) {
      pointerMax = pointerMid;
    } else {
      pointerMin = pointerMid;
      break;
    }
  }
  this.splice(pointerMin, 0, connection);
  connection.inDB_ = true;
};

/**
 * Remove a connection from the database.  Must already exist in DB.
 * @param {!Blockly.Connection} connection The connection to be removed.
 * @private
 */
Blockly.ConnectionDB.prototype.removeConnection_ = function(connection) {
  if (!connection.inDB_) {
    throw 'Connection not in database.';
  }
  connection.inDB_ = false;
  // Find the connection using a binary search.
  var pointerMin = 0;
  var pointerMax = this.length - 2;
  var pointerMid = pointerMax;
  while (pointerMin < pointerMid) {
    if (this[pointerMid].y_ < connection.y_) {
      pointerMin = pointerMid;
    } else {
      pointerMax = pointerMid;
    }
    pointerMid = Math.floor((pointerMin + pointerMax) / 2);
  }

  // Walk forward and back on the y axis looking for the connection.
  // When found, splice it out of the array.
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  while (pointerMin >= 0 && this[pointerMin].y_ == connection.y_) {
    if (this[pointerMin] == connection) {
      this.splice(pointerMin, 1);
      return;
    }
    pointerMin--;
  }
  do {
    if (this[pointerMax] == connection) {
      this.splice(pointerMax, 1);
      return;
    }
    pointerMax++;
  } while (pointerMax < this.length &&
           this[pointerMax].y_ == connection.y_);
  throw 'Unable to find connection in connectionDB.';
};

/**
 * Initialize a set of connection DBs for a specified blockSpace.
 * @param {!Blockly.BlockSpace} blockSpace The blockSpace this DB is for.
 */
Blockly.ConnectionDB.init = function(blockSpace) {
  // Create four databases, one for each connection type.
  var dbList = [];
  dbList[Blockly.INPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.OUTPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.NEXT_STATEMENT] = new Blockly.ConnectionDB();
  dbList[Blockly.PREVIOUS_STATEMENT] = new Blockly.ConnectionDB();
  dbList[Blockly.FUNCTIONAL_INPUT] = new Blockly.ConnectionDB();
  dbList[Blockly.FUNCTIONAL_OUTPUT] = new Blockly.ConnectionDB();

  blockSpace.connectionDBList = dbList;
};
