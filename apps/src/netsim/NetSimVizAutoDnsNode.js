/**
 * @overview Visualization auto-dns node.
 */
'use strict';

require('../utils');
var NetSimGlobals = require('./NetSimGlobals');
var NetSimVizNode = require('./NetSimVizNode');

/**
 * @param {boolean} useBackgroundAnimation - changes the behavior of this node
 *        when it's in the background layer
 * @constructor
 * @augments NetSimVizNode
 */
var NetSimVizAutoDnsNode = module.exports = function (useBackgroundAnimation) {
  NetSimVizNode.call(this, useBackgroundAnimation);

  this.getRoot().addClass('auto-dns-node');

  var levelConfig = NetSimGlobals.getLevelConfig();
  if (levelConfig.showHostnameInGraph) {
    this.setName('dns');
  } else {
    this.setName('DNS');
  }

  this.setIsDnsNode(true);
  this.render();
};
NetSimVizAutoDnsNode.inherits(NetSimVizNode);
