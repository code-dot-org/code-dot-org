/**
 * @fileoverview Interface to storage user API.
 */

/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
'use strict';

var AppStorage = require('./appStorage');

// TODO (dave): Use deferred/promise once jQuery is available.

/**
 * Represents a storage user - could be signed in or not signed in.
 * @param {string} app_id Encrypted app id.
 * @constructor
 */
var StorageUser = function () {
  /**
   * Indicates whether the async call has completed yet.
   * @type {boolean}
   */
  this.isReady = false;

  /**
   * Queue of callbacks to hit when this object gets initialized.
   * @type {Array[Function]}
   * @private
   */
  this.whenReadyCallbacks_ = [];

  /**
   * Storage User ID. Unique and consistent for a given user of an applab app.
   * @type {string}
   */
  this.userId = undefined;
};
module.exports = StorageUser;

/**
 * @type {StorageUser}
 * @private
 * @static
 */
StorageUser.currentUser_ = null;

/**
 * Kick of an asynchronous request for the current user's data, and immediately
 * pass back a placeholder object that has a whenReady method others can
 * use to guarantee the data is present.
 *
 * @return {StorageUser} that doesn't have its data yet, but will soon.
 */
StorageUser.getCurrentUser = function () {
  if (!StorageUser.currentUser_) {
    StorageUser.currentUser_ = new StorageUser();
    
    AppStorage.getUserId(
        StorageUser.prototype.initialize.bind(StorageUser.currentUser_));
  }
  return StorageUser.currentUser_;
};

/**
 * Load userId from async request, when ready.
 * @param userId
 */
StorageUser.prototype.initialize = function (userId) {
  this.userId = userId;
  this.isReady = true;

  // Call any queued callbacks
  this.whenReadyCallbacks_.forEach(function (callback) {
    callback(this);
  }.bind(this));
  this.whenReadyCallbacks_ = [];
};

/**
 * Provide code to be called when this object is ready to use.
 * It is possible for it to be called immediately.
 * @param {!function} callback
 */
StorageUser.prototype.whenReady = function (callback) {
  if (this.isReady) {
    callback(this);
  } else {
    this.whenReadyCallbacks_.push(callback);
  }
};
