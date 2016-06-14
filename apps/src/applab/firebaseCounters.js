/* global Applab $ */

import Firebase from 'firebase';
import { getConstants, getDatabase } from './firebaseUtils';

/**
 * Maximum number of records allowed per table. Populated from firebase.
 * @type {number}
 */
let tableRowCountLimit;

/**
 * Map representing the maximum number of writes allowed over each time interval.
 *
 * @type {Object.<string, number>} Map from rate limit interval in seconds
 *     to the maximum number of operations allowed during that interval.
 *     Populated from firebase.
 */
let rateLimitMap;

/**
 * Updates per-table counters associated with a table write.
 * @param {string} tableName Name of the table to update.
 * @param {number} rowCountChange How much to increment or decrement the row count by.
 * @param {boolean} [updateNextId=false] Whether to obtain a next record id to assign.
 * @returns {Promise<number>} Promise which fails if the row count is exceeded,
 *   or succeeds otherwise. If updateNextId is specified, then a successful Promise
 *   will contain the next record id to assign.
 */
export function updateTableCounters(tableName, rowCountChange, updateNextId) {
  const tableRef = getDatabase(Applab.channelId).child(`counters/tables/${tableName}`);
  return tableRef.transaction(tableData => {
    tableData = tableData || {};
    if (updateNextId) {
      if (rowCountChange !== 1) {
        throw new Error('expected rowCountChange to equal 1 when updateNextId is true');
      }
      tableData.lastId = (tableData.lastId || 0) + 1;
    }
    if (tableData.rowCount + rowCountChange > tableRowCountLimit)  {
      // Abort the transaction.
      return;
    }
    tableData.rowCount = (tableData.rowCount || 0) + rowCountChange;
    return tableData;
  }).then(transactionData => {
    if (!transactionData.committed) {
      const rowCount = transactionData.snapshot.child('rowCount').val();
      if (rowCount + rowCountChange > tableRowCountLimit) {
        return Promise.reject(`The record could not be created. ` +
          `A table may only contain ${tableRowCountLimit} rows.`);
      }
      throw new Error('An unexpected error occurred while updating table counters.');
    }
    return updateNextId ? transactionData.snapshot.child('lastId').val() : null;
  });
}

/**
 * Increment the rate limit counters for each interval if possible.
 *
 * Each `interval` is a number of seconds during which at most `RATE_LIMIT[interval]`
 * writes can be performed on the data in the current channel. We store counters
 * `writeCount` and `lastResetTime` in firebase for each channel and each interval.
 *
 * `writeCount` is incremented prior to every table write and can never
 * exceed RATE_LIMIT[interval]. writeCount can be reset to 0 (or 1), but
 * only if at least `interval` seconds have passed since the last reset.
 *
 * `lastResetTime` keeps track of when the last reset happened.
 *
 * @returns {Promise<>} Promise which succeeds if the rate limit counters are
 *   successfully updated, or which fails with an error message if one of the
 *   limits is exceeded.
 */
export function incrementRateLimitCounters() {
  return loadConstants().then(() => getCurrentTime())
  .then(currentTimeMs => {
    let promises = [];
    Object.keys(rateLimitMap).forEach(interval => {
      const limitRef = getDatabase(Applab.channelId).child(`counters/limits/${interval}`);
      promises.push(limitRef.transaction(limitData => {
        limitData = limitData || {};
        limitData.lastResetTime = limitData.lastResetTime || 0;
        limitData.writeCount = (limitData.writeCount || 0) + 1;
        if (limitData.writeCount <= rateLimitMap[interval]) {
          return limitData;
        } else if (limitData.lastResetTime + interval * 1000 < currentTimeMs) {
          // The maximum number of writes has been exceeded in more than `interval` seconds.
          // Reset the counters.
          limitData.writeCount = 1;
          limitData.lastResetTime = Firebase.ServerValue.TIMESTAMP;
          return limitData;
        } else {
          // The maximum number of writes has been exceeded in less than `interval` seconds.
          // Abort the transaction.
          return;
        }
      }).then(transactionData => {
        if (!transactionData.committed) {
          const lastResetTimeMs = transactionData.snapshot.child('lastResetTime').val();
          const nextResetTimeMs = lastResetTimeMs + interval * 1000;
          const timeRemaining = Math.ceil((nextResetTimeMs - currentTimeMs) / 1000);
          // TODO(dave): notify new relic
          return Promise.reject(`rate limit exceeded. please wait ${timeRemaining} seconds before retrying.`);
        } else {
          return Promise.resolve();
        }
      }));
    });
    return Promise.all(promises);
  });
}

/**
 * Returns a promise which resolves once Firebase constants have been fetched from
 * the server and cached locally. Also starts listening for future changes to constants.
 * @returns {Promise<>}
 */
function loadConstants() {
  if (tableRowCountLimit && rateLimitMap) {
    // The firebase constants have already been loaded.
    return Promise.resolve();
  }

  const constantsRef = getConstants();
  return constantsRef.once('value', snapshot => {
    handleLoadConstants(snapshot.val());

    // Make sure we don't listen multiple times.
    constantsRef.off();

    // Update globals to reflect firebase constants any time they change in the future.
    constantsRef.on('value', snapshot => handleLoadConstants(snapshot.val()));
  }).catch((error) => {
    // Failed to load constants. Clear the promise so they can be fetched again.
    return Promise.reject(error);
  });
}

function handleLoadConstants(constantsData) {
  if (!constantsData.channels.maxTableRows ||
      !constantsData.channels.limits) {
    throw new Error('invalid firebase constants: ' + JSON.stringify(constantsData));
  }
  tableRowCountLimit = constantsData.channels.maxTableRows;
  rateLimitMap = $.extend({}, constantsData.channels.limits);
}

/**
 * Obtains the server time by writing the current time to a node and then reading it.
 * This node is removed when the user disconnects.
 * @returns {Promise<number>} The current server time in milliseconds.
 */
function getCurrentTime() {
  const serverTimeRef = getDatabase(Applab.channelId)
    .child(`serverTime/${Applab.firebaseUserId}`);
  return serverTimeRef.set(Firebase.ServerValue.TIMESTAMP).then(() => {
    serverTimeRef.onDisconnect().remove();
    return serverTimeRef.once('value').then(snapshot => snapshot.val());
  });
}
