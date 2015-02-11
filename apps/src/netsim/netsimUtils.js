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

var NetSimNodeClient = require('./NetSimNodeClient');
var NetSimNodeRouter = require('./NetSimNodeRouter');

/**
 * Given a set of rows from the node table on a shard, gives back a set of node
 * controllers (of appropriate types).
 * @param {!NetSimShard} shard
 * @param {!Array.<Object>} rows
 * @throws when a row doesn't have a mappable node type.
 * @return {Array.<NetSimNode>} nodes for the rows
 */
module.exports.nodesFromRows = function (shard, rows) {
  return rows
      .map(function (row) {
        if (row.type === NetSimNodeClient.getNodeType()) {
          return new NetSimNodeClient(shard, row);
        } else if (row.type == NetSimNodeRouter.getNodeType()) {
          return new NetSimNodeRouter(shard, row);
        }
        // Oops!  We probably shouldn't ever get here.
        throw new Error("Unable to map row to node.");
      });
};