import PQueue from 'p-queue';

export const MAX_CONCURRENT_BLOCK_IOPS = 5;
const blockIOQueue = new PQueue({concurrency: MAX_CONCURRENT_BLOCK_IOPS});

// rateLimit() throws an error if called more than RATE_LIMIT times per RATE_LIMIT_INTERVAL_MS
// we use this in Applab commands.js to rate limit access to Datablock Storage from student code
//
// Additionally, rateLimit throttles IO operations to MAX_CONCURRENT_BLOCK_IOPS concurrently
// to prevent student data blocks from overwhelming the server with parallel connections.
let rateLimitAccessLog = [];
export const RATE_LIMIT = 600;
export const RATE_LIMIT_INTERVAL_MS = 60000;
export function rateLimit(operation = () => undefined, now = Date.now()) {
  const timeSinceEarliestLog = () => now - rateLimitAccessLog[0];

  // Drop log entries older than RATE_LIMIT_INTERVAL_MS
  while (
    rateLimitAccessLog.length > 0 &&
    timeSinceEarliestLog() >= RATE_LIMIT_INTERVAL_MS
  ) {
    rateLimitAccessLog.shift();
  }

  // If we're over the rate limit, throw an error
  if (rateLimitAccessLog.length >= RATE_LIMIT) {
    const waitTime = Math.ceil(
      (RATE_LIMIT_INTERVAL_MS - timeSinceEarliestLog()) / 1000
    );
    throw new Error(
      `Data access rate limit exceeded; Please wait ${waitTime} seconds before retrying. ` +
        'The app is reading/writing data too many times per second. ' +
        "If you were trying to write data, it wasn't written."
    );
  }

  // Log the current access
  rateLimitAccessLog.push(now);

  // Throttle rateLimit-ed operations to ${MAX_CONCURRENT_BLOCK_IOPS}x concurrency
  // this prevents students from overwhelming the server with too many simultaneous
  // requests from data blocks.
  return blockIOQueue.add(operation);
}

export function resetRateLimit() {
  rateLimitAccessLog = [];
}
