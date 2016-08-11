import { MockFirebase } from 'mockfirebase';

MockFirebase.prototype.originalOnce = MockFirebase.prototype.once;

/**
 * The MockFirebase npm does not support the Promises part of the Firebase API.
 * Wrap once() here so that it returns a promise when callbacks are not supplied.
 * @param {string} eventType
 * @param {function} onSuccess
 * @param {function} onFailure
 * @param context
 * @returns {Promise|undefined}
 */
MockFirebase.prototype.once = function (eventType, onSuccess, onFailure, context) {
  if (onSuccess || onFailure) {
    return this.originalOnce(eventType, onSuccess, onFailure, context);
  }
  return new Promise((resolve, reject) => {
    return this.originalOnce(eventType, resolve, reject, context);
  });
};

export default MockFirebase;
