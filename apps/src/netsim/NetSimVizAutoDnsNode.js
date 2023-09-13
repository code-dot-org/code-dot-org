/**
 * @overview Visualization auto-dns node.
 */

import {setupFunctionPrototypeInherits} from '../utils';
import NetSimGlobals from './NetSimGlobals';
import NetSimVizNode from './NetSimVizNode';

setupFunctionPrototypeInherits(Function);

/**
 * @param {boolean} useBackgroundAnimation - changes the behavior of this node
 *        when it's in the background layer
 * @constructor
 * @augments NetSimVizNode
 */
export default function NetSimVizAutoDnsNode(useBackgroundAnimation) {
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
}
NetSimVizAutoDnsNode.inherits(NetSimVizNode);
