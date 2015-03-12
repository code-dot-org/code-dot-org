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
/* global $ */
'use strict';

var NetSimClientNode = require('./NetSimClientNode');
var NetSimRouterNode = require('./NetSimRouterNode');

/**
 * Given a set of rows from the node table on a shard, gives back a set of node
 * controllers (of appropriate types).
 * @param {!NetSimShard} shard
 * @param {!Array.<Object>} rows
 * @throws when a row doesn't have a mappable node type.
 * @return {Array.<NetSimNode>} nodes for the rows
 */
exports.nodesFromRows = function (shard, rows) {
  return rows
      .map(function (row) {
        if (row.type === NetSimClientNode.getNodeType()) {
          return new NetSimClientNode(shard, row);
        } else if (row.type == NetSimRouterNode.getNodeType()) {
          return new NetSimRouterNode(shard, row);
        }
        // Oops!  We probably shouldn't ever get here.
        throw new Error("Unable to map row to node.");
      });
};

/**
 * Make a new SVG element, appropriately namespaced, wrapped in a jQuery
 * object for (semi-)easy manipulation.
 * @param {string} type - the tagname for the svg element.
 * @returns {jQuery}
 */
exports.jQuerySvgElement = function (type) {
  var newElement = $(document.createElementNS('http://www.w3.org/2000/svg', type));

  /**
   * Override addClass since jQuery addClass doesn't work on svg.
   * @param {string} className
   */
  newElement.addClass = function (className) {
    var oldClasses = newElement.attr('class');
    if (!oldClasses) {
      newElement.attr('class', className);
    } else if (!oldClasses.split(/\s+/g).some(function (existingClass) {
          return existingClass === className;
        })) {
      newElement.attr('class', oldClasses + ' ' + className);
    }
  };

  return newElement;
};

/**
 * Checks configuration against tab type to decide whether tab
 * of type should be shown.
 * @param {NetSimLevelConfiguration} levelConfig
 * @param {NetSimTabType} tabType
 */
exports.shouldShowTab = function (levelConfig, tabType) {
  return levelConfig.showTabs.indexOf(tabType) > -1;
};
