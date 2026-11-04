/**
 * @param {string} nameFailure
 * @constructor
 * @extends Error
 */
export default class NameFailureError extends Error {
  constructor(nameFailure = '', ...params) {
    super(...params);
    // Under the ES5 build target the instance would keep Error's prototype.
    Object.setPrototypeOf(this, new.target.prototype);

    /** @type {string} */
    this.name = 'NameFailureError';

    /** @type {string} */
    this.message = 'Rename failed';

    /** @type {string} */
    this.nameFailure = nameFailure;
  }
}
