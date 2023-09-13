/**
 * @overview Simulation entity for router log entries.
 */
import moment from 'moment';
import _ from 'lodash';
import i18n from '@cdo/netsim/locale';
import NetSimEntity from './NetSimEntity';
import Packet from './Packet';
import NetSimNodeFactory from './NetSimNodeFactory';
var NetSimLogger = require('./NetSimLogger');
import {valueOr, setupFunctionPrototypeInherits} from '../utils';
import {BITS_PER_BYTE} from './NetSimConstants';

import {formatBinary, base64ToBinary, binaryToBase64} from './DataConverters';

var logger = NetSimLogger.getSingleton();

setupFunctionPrototypeInherits(Function);

/**
 * @typedef {Object} LogEntryRow
 * @property {number} nodeID
 * @property {Base64Payload} base64Binary - base64-encoded binary
 *           message content, all of which can be exposed to the
 *           student.  May contain headers of its own.
 * @property {NetSimLogEntry.LogStatus} status
 * @property {number} timestamp
 * @property {string} sentBy
 */

/**
 * Entry in shared log for a node on the network.
 *
 * Once created, should not be modified until/unless a cleanup process
 * removes it.
 *
 * @param {!NetSimShard} shard - The shard where this log entry lives.
 * @param {LogEntryRow} [row] - A row out of the log table on the
 *        shard.  If provided, will initialize this log with the given
 *        data.  If not, this log will initialize to default values.
 * @param {Packet.HeaderType[]} [packetSpec] - Packet layout spec used to
 *        interpret the contents of the logged packet
 * @constructor
 * @augments NetSimEntity
 */
export default function NetSimLogEntry(shard, row, packetSpec) {
  row = row !== undefined ? row : {};
  NetSimEntity.call(this, shard, row);

  /**
   * Node ID of the node that owns this log entry (e.g. a router node)
   * @type {number}
   */
  this.nodeID = row.nodeID;

  /**
   * Binary content of the log entry.  Defaults to empty string.
   * @type {string}
   */
  this.binary = '';
  if (row.base64Binary) {
    try {
      this.binary = base64ToBinary(
        row.base64Binary.string,
        row.base64Binary.len
      );
    } catch (e) {
      logger.error(e.message);
    }
  }

  /**
   * Status value for log entry; for router log, usually SUCCESS for completion
   * of routing or DROPPED if routing failed.
   * @type {NetSimLogEntry.LogStatus}
   */
  this.status = valueOr(row.status, NetSimLogEntry.LogStatus.SUCCESS);

  /**
   * @type {Packet}
   * @private
   */
  this.packet_ = new Packet(valueOr(packetSpec, []), this.binary);

  /**
   * Unix timestamp (local) of log creation time.
   * @type {number}
   */
  this.timestamp = row.timestamp !== undefined ? row.timestamp : Date.now();

  /**
   * Display name of the sender (for the teacher view)
   * @type {string}
   */
  this.sentBy = valueOr(row.sentBy, '');
}
NetSimLogEntry.inherits(NetSimEntity);

/**
 * @enum {string}
 * @const
 */
NetSimLogEntry.LogStatus = {
  SUCCESS: 'success',
  DROPPED: 'dropped',
};

/**
 * Helper that gets the log table for the configured instance.
 * @returns {NetSimTable}
 */
NetSimLogEntry.prototype.getTable = function () {
  return this.shard_.logTable;
};

/**
 * Build own row for the log table
 * @returns {LogEntryRow}
 */
NetSimLogEntry.prototype.buildRow = function () {
  return {
    nodeID: this.nodeID,
    base64Binary: binaryToBase64(this.binary),
    status: this.status,
    timestamp: this.timestamp,
    sentBy: this.sentBy,
  };
};

/**
 * Static async creation method.  Creates a new message on the given shard,
 * and then calls the callback with a success boolean.
 * @param {!NetSimShard} shard
 * @param {!number} nodeID - associated node's row ID
 * @param {!string} binary - log contents
 * @param {NetSimLogEntry.LogStatus} status
 * @param {!string} sentBy - display name of sender
 * @param {!NodeStyleCallback} onComplete (success)
 */
NetSimLogEntry.create = function (
  shard,
  nodeID,
  binary,
  status,
  sentBy,
  onComplete
) {
  var entity = new NetSimLogEntry(shard);
  entity.nodeID = nodeID;
  entity.binary = binary;
  entity.status = status;
  entity.timestamp = Date.now();
  entity.sentBy = sentBy;
  entity.getTable().create(entity.buildRow(), function (err, result) {
    if (err) {
      onComplete(err, null);
      return;
    }
    onComplete(err, new NetSimLogEntry(shard, result));
  });
};

/**
 * Get requested packet header field as a string.  Returns empty string
 * if the requested field is not in the current packet format.
 * @param {Packet.HeaderType} field
 * @returns {string}
 */
NetSimLogEntry.prototype.getHeaderField = function (field) {
  try {
    if (Packet.isAddressField(field)) {
      return this.packet_.getHeaderAsAddressString(field);
    } else {
      return this.packet_.getHeaderAsInt(field).toString();
    }
  } catch (e) {
    return '';
  }
};

/** Get packet message as binary. */
NetSimLogEntry.prototype.getMessageBinary = function () {
  return formatBinary(this.packet_.getBodyAsBinary(), BITS_PER_BYTE);
};

/** Get packet message as ASCII */
NetSimLogEntry.prototype.getMessageAscii = function () {
  return this.packet_.getBodyAsAscii(BITS_PER_BYTE);
};

/**
 * @returns {string} Localized packet status, "success" or "dropped"
 */
NetSimLogEntry.prototype.getLocalizedStatus = function () {
  if (this.status === NetSimLogEntry.LogStatus.SUCCESS) {
    return i18n.logStatus_success();
  } else if (this.status === NetSimLogEntry.LogStatus.DROPPED) {
    return i18n.logStatus_dropped();
  }
  return '';
};

/**
 * @returns {string} Localized "X of Y" packet count info for this entry.
 */
NetSimLogEntry.prototype.getLocalizedPacketInfo = function () {
  return i18n.xOfYPackets({
    x: this.getHeaderField(Packet.HeaderType.PACKET_INDEX),
    y: this.getHeaderField(Packet.HeaderType.PACKET_COUNT),
  });
};

/**
 * @returns {string} 12-hour time with milliseconds
 */
NetSimLogEntry.prototype.getTimeString = function () {
  return moment(this.timestamp).format('h:mm:ss.SSS A');
};

/**
 * Get a controller for the node that generated this log entry
 * @returns {NetSimClientNode|NetSimRouterNode|null}
 */
NetSimLogEntry.prototype.getOriginNode = function () {
  var nodeRows = this.shard_.nodeTable.readAll();
  var originNodeRow = _.find(
    nodeRows,
    function (row) {
      return row.id === this.nodeID;
    }.bind(this)
  );

  if (!originNodeRow) {
    return null;
  }

  return NetSimNodeFactory.nodeFromRow(this.shard_, originNodeRow);
};
