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

  this.line_ = jQuerySvgElement('path')
      .appendTo(this.getRoot());


  this.getRoot().addClass('viz-wire');

  /**
   * Bound getEntityByID method from vizualization controller.
   * @type {Function}
   * @private
   */
  this.getEntityByID_ = getEntityByID;

  this.localVizNode_ = null;
  this.remoteVizNode_ = null;

  this.configureFrom(sourceWire);
  this.render();
};
NetSimVizWire.inherits(NetSimVizEntity);

NetSimVizWire.prototype.configureFrom = function (sourceWire) {
  this.localVizNode_ = this.getEntityByID_(NetSimVizNode, sourceWire.localNodeID);
  this.remoteVizNode_ = this.getEntityByID_(NetSimVizNode, sourceWire.remoteNodeID);
};

NetSimVizWire.prototype.render = function () {
  var pathData = 'M 0 0';
  if (this.localVizNode_ && this.remoteVizNode_) {
    pathData = 'M ' + this.localVizNode_.posX_ + ' ' + this.localVizNode_.posY_ +
    ' L ' + this.remoteVizNode_.posX_ + ' ' + this.remoteVizNode_.posY_;
  }
  this.line_.attr('d', pathData);
};
