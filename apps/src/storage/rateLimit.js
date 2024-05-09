// rateLimit() throws an error if called more than RATE_LIMIT times per RATE_LIMIT_INTERVAL_MS
// we use this in Applab commands.js to rate limit access to Datablock Storage from student code
let rateLimitAccessLog = [];
export const RATE_LIMIT = 600;
export const RATE_LIMIT_INTERVAL_MS = 60000;
export function rateLimit(now = Date.now()) {
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
  } else {
    // Log the current access
    rateLimitAccessLog.push(now);
  }
}

export function resetRateLimit() {
  rateLimitAccessLog = [];
}
