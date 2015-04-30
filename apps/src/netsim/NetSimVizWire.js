/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

require('../utils');
var jQuerySvgElement = require('./netsimUtils').jQuerySvgElement;
var NetSimVizEntity = require('./NetSimVizEntity');
var NetSimVizNode = require('./NetSimVizNode');

/**
 *
 * @param sourceWire
 * @param {function} getEntityByID - Allows this wire to search
 *        for other entities in the simulation
 * @constructor
 * @augments NetSimVizEntity
 */
var NetSimVizWire = module.exports = function (sourceWire, getEntityByID) {
  NetSimVizEntity.call(this, sourceWire);

  var root = this.getRoot();

  root.addClass('viz-wire');

  this.line_ = jQuerySvgElement('path')
      .appendTo(root);

  /**
   * Bound getEntityByID method from vizualization controller.
   * @type {Function}
   * @private
   */
  this.getEntityByID_ = getEntityByID;

  this.localVizNode = null;
  this.remoteVizNode = null;

  this.configureFrom(sourceWire);
  this.render();
};
NetSimVizWire.inherits(NetSimVizEntity);

/**
 * Configuring a wire means looking up the viz nodes that will be its endpoints.
 * @param {NetSimWire} sourceWire
 */
NetSimVizWire.prototype.configureFrom = function (sourceWire) {
  this.localVizNode = this.getEntityByID_(NetSimVizNode, sourceWire.localNodeID);
  this.remoteVizNode = this.getEntityByID_(NetSimVizNode, sourceWire.remoteNodeID);

  if (this.localVizNode) {
    this.localVizNode.setAddress(sourceWire.localAddress);
  }

  if (this.remoteVizNode) {
    this.remoteVizNode.setAddress(sourceWire.remoteAddress);
  }
};

/**
 * Update path data for wire.
 */
NetSimVizWire.prototype.render = function () {
  NetSimVizWire.superPrototype.render.call(this);

  var pathData = 'M 0 0';
  if (this.localVizNode && this.remoteVizNode) {
    pathData = 'M ' + this.localVizNode.posX + ' ' + this.localVizNode.posY +
        ' L ' + this.remoteVizNode.posX + ' ' + this.remoteVizNode.posY;
  }
  this.line_.attr('d', pathData);
};

/**
 * Hide this wire - used to hide the incoming wire when we're trying to show
 * simplex mode.
 */
NetSimVizWire.prototype.hide = function () {
  this.getRoot().addClass('hidden-wire');
};

/**
 * Killing a visualization node removes its ID so that it won't conflict with
 * another node of matching ID being added, and begins its exit animation.
 * @override
 */
NetSimVizWire.prototype.kill = function () {
  NetSimVizWire.superPrototype.kill.call(this);
  this.localVizNode = null;
  this.remoteVizNode = null;
};

/**
 * Kick off an animation of the wire state being set by the local viznode.
 * @param {string} newState - "0" or "1" for off and on.
 */
NetSimVizWire.prototype.animateSetState = function (newState) {
  this.getRoot().removeClass('state-unknown');
  if (newState === '0') {
    this.getRoot().addClass('state-off');
    this.getRoot().removeClass('state-on');
  } else if (newState === '1') {
    this.getRoot().addClass('state-on');
    this.getRoot().removeClass('state-off');
  }
  this.doAfterDelay(500, function () {
    this.getRoot().removeClass('state-on');
    this.getRoot().removeClass('state-off');
    this.getRoot().addClass('state-unknown');
  }.bind(this));
};
