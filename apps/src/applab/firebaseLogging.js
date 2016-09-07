import logToCloud from '../logToCloud';

const LOG_DATA_TRANSFER_INTERVAL_MS = 1000;

/**
 * The timeout ID for the next flush of data transfer logs, if one is pending.
 * @type {number}
 */
let flushDataTransferTimeout = null;

/**
 * The number of bytes transferred since the last flush.
 * @type {number}
 */
let firebaseByteCount = 0;

/**
 * The number of write operations since the last flush.
 * @type {number}
 */
let firebaseWriteCount = 0;

/**
 * Records that the specified number of bytes have been transferred to or from Firebase.
 * This data is logged to NewRelic via addPageAction. A maximum of 20 page actions can
 * be generated every 10 seconds, therefore we use batching and send the total number
 * of bytes transferred at most once per second.
 * @param {number} byteCount
 */
export function logDataTransfer(byteCount) {
  firebaseByteCount += byteCount;
  firebaseWriteCount += 1;

  if (!flushDataTransferTimeout) {
    flushDataTransferTimeout = window.setTimeout(() => {
      flushDataTransferTimeout = null;
      logToCloud.addPageAction(logToCloud.PageAction.FirebaseDataTransferConsumed, {
        firebaseByteCount,
        firebaseWriteCount,
      });
      firebaseByteCount = 0;
      firebaseWriteCount = 0;
    }, LOG_DATA_TRANSFER_INTERVAL_MS);
  }
}
