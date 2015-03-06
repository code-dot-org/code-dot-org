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

var NetSimNode = require('./NetSimNode');
var NetSimRouterNode = require('./NetSimRouterNode');
var NetSimClientNode = require('./NetSimClientNode');
var netsimUtils = require('./netsimUtils');

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

NetSimVisualization.prototype.tick = function () {
  this.nodes_.forEach(function (node) {
    node.tick();
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
    this.localNode.die();
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
 *
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

  this.curPosX_ = 0;
  this.curPosY_ = 0;
  this.targetPosX_ = 0;
  this.targetPosY_ = 0;

  this.currentScale_ = 0;
  this.targetScale_ = 1;

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

NetSimVisualizationNode.prototype.moveTo = function (x, y) {
  this.targetPosX_ = x;
  this.targetPosY_ = y;
};

NetSimVisualizationNode.prototype.tick = function () {
  var speed = 4;
  this.curPosX_ = this.curPosX_ + (this.targetPosX_ - this.curPosX_) / speed;
  this.curPosY_ = this.curPosY_ + (this.targetPosY_ - this.curPosY_) / speed;
  this.currentScale_ = this.currentScale_ + (this.targetScale_ - this.currentScale_) / speed;
};

NetSimVisualizationNode.prototype.render = function () {
  var transform = 'translate(' + this.curPosX_ + ', ' + this.curPosY_ + '),' +
      'scale(' + this.currentScale_ + ')';
  this.rootGroup_.attr('transform', transform);
};