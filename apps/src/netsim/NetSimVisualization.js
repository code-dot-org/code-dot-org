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

var NetSimRouterNode = require('./NetSimRouterNode');
var NetSimLogger = require('./NetSimLogger');
var netsimUtils = require('./netsimUtils');
var tweens = require('./tweens');

var logger = NetSimLogger.getSingleton();

/**
 * Generator and controller for visualization
 * @param {jQuery} svgRoot
 * @param {RunLoop} runLoop
 * @param {NetSimConnection} connection
 * @constructor
 */
var NetSimVisualization = module.exports = function (svgRoot, runLoop, connection) {
  /**
   * @type {jQuery}
   * @private
   */
  this.svgRoot_ = svgRoot;

  runLoop.tick.register(this.tick.bind(this));
  runLoop.render.register(this.render.bind(this));

  /**
   * The shard currently being represented.
   * @type {NetSimShard}
   * @private
   */
  this.shard_ = null;
  connection.shardChange.register(this.onShardChange_.bind(this));

  this.nodes_ = [];
};

NetSimVisualization.prototype.tick = function (clock) {
  for (var i = 0; i < this.nodes_.length; i++) {
    this.nodes_[i].tick(clock);
    if (this.nodes_[i].isDead()) {
      this.nodes_[i] = undefined;
      logger.log("Removed dead node from visualization");
    }
  }
  this.nodes_ = this.nodes_.filter(function (node) {
    return node !== undefined;
  });
};

NetSimVisualization.prototype.render = function () {
  this.nodes_.forEach(function (node) {
    node.render();
  });
};

/**
 * Called whenever the connection notifies us that we've connected to,
 * or disconnected from, a shard.
 * @param {NetSimShard} newShard - null if disconnected.
 * @param {NetSimLocalClientNode} localNode - null if disconnected
 * @private
 */
NetSimVisualization.prototype.onShardChange_= function (newShard, localNode) {
  this.setShard(newShard);
  this.setLocalNode(localNode);
};

/**
 * Change the shard this visualization will source its data from.
 * Re-attaches table change listeners for all the tables we need to monitor.
 * @param newShard
 */
NetSimVisualization.prototype.setShard = function (newShard) {
  if (this.nodeTableChangeKey !== undefined) {
    this.shard_.nodeTable.tableChange.unregister(this.nodeTableChangeKey);
    this.nodeTableChangeKey = undefined;
  }

  this.shard_ = newShard;
  if (!this.shard_) {
    return;
  }

  this.nodeTableChangeKey = this.shard_.nodeTable.tableChange.register(
      this.onNodeTableChange_.bind(this));
};

NetSimVisualization.prototype.setLocalNode = function (newLocalNode) {
  if (newLocalNode) {
    if (this.localNode) {
      this.localNode.configureFrom(newLocalNode);
    } else {
      this.localNode = new NetSimVisualizationNode(newLocalNode);
      this.nodes_.push(this.localNode);
      this.svgRoot_.find('#foreground_group').append(this.localNode.getRoot());
    }
  } else {
    this.localNode.kill();
  }
};

NetSimVisualization.prototype.getNodeByID = function (nodeID) {
  return this.nodes_.reduce(function (prev, cur) {
    if (prev) {
      return prev;
    } else if (cur instanceof NetSimVisualizationNode && cur.id === nodeID) {
      return cur;
    }
    return null;
  }, null);
};

NetSimVisualization.prototype.onNodeTableChange_ = function (rows) {
  var tableNodes = netsimUtils.nodesFromRows(this.shard_, rows);

  // 1. Kill nodes from the visualization that are no longer in the table.
  this.nodes_.filter(function (vizNode) {
    return !tableNodes.some(function (node) {
      return node.entityID === vizNode.id;
    });
  }).forEach(function (vizNode){
    vizNode.kill();
  });

  // 2. Add new nodes from the table into the visualization
  var node;
  netsimUtils.nodesFromRows(this.shard_, rows).forEach(function (nsNode) {
    node = this.getNodeByID(nsNode.entityID);
    if (node) {
      node.configureFrom(nsNode);
    } else {
      node = new NetSimVisualizationNode(nsNode);
      node.moveTo(Math.random() * 200 - 100, Math.random() * 200 - 100);
      this.nodes_.push(node);
      this.svgRoot_.find('#background_group').prepend(node.getRoot());
    }
  }, this);
};

/**
 * @param {NetSimNode} sourceNode
 * @constructor
 */
var NetSimVisualizationNode = function (sourceNode) {
  /**
   * @type {number}
   */
  this.id = sourceNode.entityID;

  this.rootGroup_ = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
  this.rootGroup_.attr('class', 'viz-node');

  this.circle_ = $(document.createElementNS('http://www.w3.org/2000/svg', 'circle'))
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 37) /* Half of 75 */
      .appendTo(this.rootGroup_);

  this.displayName_ = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'))
      .attr('x', 0)
      .attr('y', 2)
      .css('text-anchor', 'middle')
      .appendTo(this.rootGroup_);

  this.posX_ = 0;
  this.posY_ = 0;
  this.scale_ = 0;

  /**
   * Set of tweens we should currently be running on this node.
   * Processed by tick()
   * @type {Array.<exports.TweenValueTo>}
   * @private
   */
  this.tweens_ = [];
  // Set an initial default tween for zooming in from nothing.
  this.tweens_.push(new tweens.TweenValueTo(this, 'scale_', 1, 800,
      tweens.easeOutElastic));

  this.configureFrom(sourceNode);
  this.render();
};

/**
 *
 * @param {NetSimNode} sourceNode
 */
NetSimVisualizationNode.prototype.configureFrom = function (sourceNode) {
  this.displayName_.text(sourceNode.getDisplayName());

  if (sourceNode.getNodeType() === NetSimRouterNode.getNodeType()) {
    this.rootGroup_.attr('class', 'viz-node router-node');
  }
};

NetSimVisualizationNode.prototype.getRoot = function () {
  return this.rootGroup_;
};

/**
 * Killing a visualization node removes its ID so that it won't conflict with
 * another node of matching ID being added, and begins its exit animation.
 */
NetSimVisualizationNode.prototype.kill = function () {
  this.id = undefined;
  this.tweens_ = [];
  this.tweens_.push(new tweens.TweenValueTo(this, 'scale_', 0, 200, tweens.easeInQuad));
};

NetSimVisualizationNode.prototype.isDead = function () {
  return this.id === undefined && this.tweens_.length === 0;
};

NetSimVisualizationNode.prototype.moveTo = function (x, y) {
  this.tweens_.push(new tweens.TweenValueTo(this, 'posX_', x, 700,
      tweens.easeOutElastic));
  this.tweens_.push(new tweens.TweenValueTo(this, 'posY_', y, 700,
      tweens.easeOutElastic));
};

NetSimVisualizationNode.prototype.tick = function (clock) {
  this.tweens_.forEach(function (animation) {
    animation.tick(clock);
  });
  this.tweens_ = this.tweens_.filter(function (animation) {
    return !animation.isFinished;
  });
};

NetSimVisualizationNode.prototype.render = function () {
  var transform = 'translate(' + this.posX_ + ', ' + this.posY_ + '),' +
      'scale(' + this.scale_ + ')';
  this.rootGroup_.attr('transform', transform);
};
