/**
 * @fileoverview Interface to dashboard user data API.
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
/* global $ */
'use strict';

// TODO (bbuchanan): This whole file should go away when we have a shared
//                   Javascript User object that can be available on page load.

/**
 * Represents a Dashboard user account - could be a teacher, a student, etc.
 * @constructor
 */
var DashboardUser = module.exports = function () {
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
   * User ID
   * @type {number}
   */
  this.id = undefined;

  /**
   * User display name
   * @type {string}
   */
  this.name = "";
};

/**
 * @type {DashboardUser}
 * @private
 * @static
 */
DashboardUser.currentUser_ = null;

/**
 * Kick of an asynchronous request for the current user's data, and immediately
 * pass back a placeholder object that has a whenReady method others can
 * use to guarantee the data is present.
 *
 * @return {DashboardUser} that doesn't have its data yet, but will soon.
 */
DashboardUser.getCurrentUser = function () {
  if (!DashboardUser.currentUser_) {
    DashboardUser.currentUser_ = new DashboardUser();
    $.ajax({
      url: '/v2/user',
      type: 'get',
      dataType: 'json',
      success: function (data /*, textStatus, jqXHR*/) {
        DashboardUser.currentUser_.initialize(data);
      },
      error: function (/*jqXHR, textStatus, errorThrown*/) {
        DashboardUser.currentUser_.initialize({
          isSignedIn: false
        });
      }
    });
  }
  return DashboardUser.currentUser_;
};

/**
 * Load data into user from async request, when ready.
 * @param data
 */
DashboardUser.prototype.initialize = function (data) {
  this.id = data.id;
  this.name = data.name;
  this.isSignedIn = data.isSignedIn !== false;
  this.isReady = true;

  // Call any queued callbacks
  this.whenReadyCallbacks_.forEach(function (callback) {
    callback(this);
  }.bind(this));
  this.whenReadyCallbacks_.length = 0;
};

/**
 * Provide code to be called when this object is ready to use
 * Possible for it to be called immediately.
 * @param {!function} callback
 */
DashboardUser.prototype.whenReady = function (callback) {
  if (this.isReady) {
    callback(this);
  } else {
    this.whenReadyCallbacks_.push(callback);
  }
};