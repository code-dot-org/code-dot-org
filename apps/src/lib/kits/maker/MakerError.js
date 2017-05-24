/** @file Custom error types for Maker Toolkit */
import ExtendableError from '../../util/ExtendableError';

export default class MakerError extends ExtendableError {

}

export class UnsupportedBrowserError extends MakerError {
  constructor() {
    super('Unsupported Browser.');
  }
}

export class ConnectionCanceledError extends MakerError {
  constructor() {
    super('Connection attempt canceled.');
  }
}

export class ConnectionFailedError extends MakerError {
  constructor(reason) {
    super('Failed to establish a board connection.');
    this.reason = reason;
  }
}

/**
 * Conditionally transform errors that can be returned by our underlying
 * libraries into appropriate MakerErrors, because we know they're fairly
 * common and don't need to bubble up past our regular failure handling to
 * New Relic reporting.
 * @param {Error} originalError
 * @return {Error|MakerError} The original error, or a wrapped version of it.
 */
export function wrapKnownMakerErrors(originalError) {
  // Known failure mode: johnny-five emits this timeout error when it's unable
  // to communicate with the board firmware after ten seconds.
  // https://github.com/code-dot-org/johnny-five/blob/v0.10.10-cdo.0/lib/board.js#L388-L401
  if (originalError.message.includes('A timeout occurred while connecting to the Board')) {
    return new ConnectionFailedError(originalError.message);
  }
  return originalError;
}
