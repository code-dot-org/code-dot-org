/**
 * @overview Interface to dashboard user data API.
 */
'use strict';

/**
 * @typedef {Object} Section
 * @property {number} id - Section's numeric identifier in Dashboard.
 */

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
   * @type {function[]}
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

  /**
   * Whether the user is a site admin.
   * NOTE: This should only be used in a convenience/display sense; anything
   *       requiring actual security should be authenticated through the server,
   *       and not depend on client code.
   * @type {boolean}
   */
  this.isAdmin = false;

  /**
   * List of sections owned by this user.
   * @type {Section[]}
   */
  this.ownedSections = [];
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
  this.isAdmin = (data.admin === true);
  this.ownedSections = data.owned_sections;
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

/**
 * Check whether the current user owns the section with the given section ID.
 * @param {number} sectionID
 * @returns {boolean}
 */
DashboardUser.prototype.ownsSection = function (sectionID) {
  return this.ownedSections.some(function (section) {
    return section.id === sectionID;
  });
};
