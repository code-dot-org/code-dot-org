'use strict';

/* global Applab */

import { getDatabase } from './firebaseUtils';

const TABLE_ROW_COUNT_LIMIT = 10;

/**
 * Updates per-table counters associated with a table write.
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
    if (tableData.rowCount + rowCountChange > TABLE_ROW_COUNT_LIMIT)  {
      // Abort the transaction.
      return;
    }
    tableData.rowCount = (tableData.rowCount || 0) + rowCountChange;
    return tableData;
  }).then(transactionData => {
    if (!transactionData.committed) {
      const rowCount = transactionData.snapshot.child('rowCount').val();
      if (rowCount + rowCountChange > TABLE_ROW_COUNT_LIMIT) {
        return Promise.reject(`The record could not be created. ` +
          `A table may only contain ${TABLE_ROW_COUNT_LIMIT} rows.`);
      }
      throw new Error('An unexpected error occurred while updating table counters.');
    }
    return updateNextId ? transactionData.snapshot.child('lastId').val() : null;
  });
}
