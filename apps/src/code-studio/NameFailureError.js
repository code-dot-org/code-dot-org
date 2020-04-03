/**
 * @param {string} nameFailure
 * @constructor
 * @extends Error
 */
export default class NameFailureError extends Error {
  constructor(nameFailure = '', ...params) {
    super(...params);

    /** @type {string} */
    this.name = 'NameFailureError';

    /** @type {string} */
    this.message = 'Rename failed';

    /** @type {string} */
    this.nameFailure = nameFailure;
  }
}
