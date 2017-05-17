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
