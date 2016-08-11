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

MockFirebase.prototype.originalSet = MockFirebase.prototype.set;

/**
 * The MockFirebase npm does not support the Promises part of the Firebase API.
 * Wrap set() here so that it returns a promise when callbacks are not supplied.
 * @param {*} value
 * @param {function} onComplete
 * @returns {Promise|undefined}
 */
MockFirebase.prototype.set = function (value, onComplete) {
  if (onComplete) {
    return this.originalSet(value, onComplete);
  }
  return new Promise((resolve, reject) => {
    return this.originalSet(value, error => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
};

MockFirebase.prototype.originalUpdate = MockFirebase.prototype.update;

/**
 * The MockFirebase npm does not support the Promises part of the Firebase API.
 * Wrap update() here so that it returns a promise when callbacks are not supplied.
 * @param {*} value
 * @param {function} onComplete
 * @returns {Promise|undefined}
 */
MockFirebase.prototype.update = function (value, onComplete) {
  if (onComplete) {
    return this.originalUpdate(value, onComplete);
  }
  return new Promise((resolve, reject) => {
    return this.originalUpdate(value, error => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
};

export default MockFirebase;
