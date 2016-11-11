/** @file Utility methods common to toolkits that use the Droplet editor to let
  * students write and execute JavaScript. */

/** @type {JavaScriptModeErrorHandler} */
var errorHandler;
/**
 * Set an appropriate error handler for to use for any JavaScript errors
 * or warnings generated in static methods.
 * @param {JavaScriptModeErrorHandler} handler
 */
export function injectErrorHandler(handler) {
  errorHandler = handler;
}

/** @see JavaScriptModeErrorHandler#error */
export function error() {
  errorHandler.error.apply(errorHandler, arguments);
}

/** @see JavaScriptModeErrorHandler#warn */
export function warn() {
  errorHandler.warn.apply(errorHandler, arguments);
}

/** @see JavaScriptModeErrorHandler#getAsyncWarn */
export function getAsyncWarn() {
  return errorHandler.getAsyncWarn.apply(errorHandler, arguments);
}


