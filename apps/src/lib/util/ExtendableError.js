/** @file Extendable error type */

/**
 * Extendable error type
 * Created by mashing up
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
 * and
 * http://stackoverflow.com/a/32749533/5000129
 */
export default function ExtendableError(message) {
  this.message = message;
  this.name = this.constructor.name;
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error(message)).stack;
  }
}
ExtendableError.prototype = Object.create(Error.prototype);
ExtendableError.prototype.constructor = ExtendableError;
