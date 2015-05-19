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
var NetSimVizElement = require('./NetSimVizElement');
var NetSimVizNode = require('./NetSimVizNode');

/**
 * Represents a connection between two nodes that does not actually exist
 * in the simulation - original use case is for broadcast mode, where nodes
 * are ACTUALLY connected through a hub, but we want it to appear that they
 * are all connected to one another.
 *
 * @param {{nodeA:{number}, nodeB:{number}}} endpoints
 * @param {function} getEntityByID - Allows this wire to search
 *        for other entities in the simulation
 * @constructor
 * @augments NetSimVizElement
 */
var NetSimFakeVizWire = module.exports = function (endpoints, getEntityByID) {
  NetSimVizElement.call(this);

  var root = this.getRoot();
  root.addClass('viz-wire');

  /**
   * @type {jQuery} wrapped around a SVGPathElement
   * @private
   */
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

  this.configureFrom(endpoints);
  this.render();
};
NetSimFakeVizWire.inherits(NetSimVizElement);

/**
 * Configuring a wire means looking up the viz nodes that will be its endpoints.
 * @param {{nodeA:{number}, nodeB:{number}}} endpoints
 */
NetSimFakeVizWire.prototype.configureFrom = function (endpoints) {
  this.localVizNode = this.getEntityByID_(NetSimVizNode, endpoints.nodeA);
  this.remoteVizNode = this.getEntityByID_(NetSimVizNode, endpoints.nodeB);
};

/**
 * Node ID of local-end node, if it exists.
 * @returns {number|undefined}
 */
NetSimFakeVizWire.prototype.localNodeID = function () {
  if (this.localVizNode) {
    return this.localVizNode.id;
  }
  return undefined;
};

/**
 * Node ID of remote-end node, if it exists.
 * @returns {number|undefined}
 */
NetSimFakeVizWire.prototype.remoteNodeID = function () {
  if (this.remoteVizNode) {
    return this.remoteVizNode.id;
  }
  return undefined;
};

/**
 * Update path data for wire.
 */
NetSimFakeVizWire.prototype.render = function () {
  NetSimFakeVizWire.superPrototype.render.call(this);

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
NetSimFakeVizWire.prototype.hide = function () {
  this.getRoot().addClass('hidden-wire');
};

/**
 * Killing a visualization node removes its ID so that it won't conflict with
 * another node of matching ID being added, and begins its exit animation.
 * @override
 */
NetSimFakeVizWire.prototype.kill = function () {
  NetSimFakeVizWire.superPrototype.kill.call(this);
  this.localVizNode = null;
  this.remoteVizNode = null;
};

/**
 * Adds/removes classes from the SVG root according to the given wire state.
 * Passing anything other than "1" or "0" will put the wire in an "unknown"
 * state, which begins a CSS transition fade back to gray.
 * @param {"0"|"1"|*} newState
 * @private
 */
NetSimFakeVizWire.prototype.setWireClasses_ = function (newState) {
  var stateOff = (newState === '0');
  var stateOn = (!stateOff && newState === '1');
  var stateUnknown = (!stateOff && !stateOn);

  this.getRoot().toggleClass('state-on', stateOn);
  this.getRoot().toggleClass('state-off', stateOff);
  this.getRoot().toggleClass('state-unknown', stateUnknown);
};
