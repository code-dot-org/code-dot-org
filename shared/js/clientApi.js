/**
 * @file Helper API object that wraps asynchronous calls to our data APIs.
 */
/* global $ */

/**
 * Standard callback form for asynchronous operations, popularized by Node.
 * @typedef {function} NodeStyleCallback
 * @param {Error|null} error - null if the async operation was successful.
 * @param {*} result - return value for async operation.
 */

/**
 * @name ClientApi
 */
var base = {
  /**
   * Base URL for target API.
   * @type {string}
   */
  api_base_url: "/v3/channels",

  /**
   * Request all collections.
   * @param {NodeStyleCallback} callback - Expected result is an array of
   *        collection objects.
   */
  all: function(callback) {
    $.ajax({
      url: this.api_base_url,
      type: "get",
      dataType: "json"
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, null);
    });
  },

  /**
   * Insert a collection.
   * @param {Object} value - collection contents, must be JSON.stringify-able.
   * @param {NodeStyleCallback} callback - Expected result is the created
   *        collection object (which will include an assigned 'id' key).
   */
  create: function(value, callback) {
    $.ajax({
      url: this.api_base_url,
      type: "post",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(value)
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, undefined);
    });
  },

  /**
   * Remove a collection.
   * @param {number} id - The collection identifier.
   * @param {NodeStyleCallback} callback - Expected result is TRUE.
   */
  delete: function(id, callback) {
    $.ajax({
      url: this.api_base_url + "/" + id + "/delete",
      type: "post",
      dataType: "json"
    }).done(function(data, text) {
      callback(null, true);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, false);
    });
  },

  /**
   * Retrieve a collection.
   * @param {number} id - The collection identifier.
   * @param {NodeStyleCallback} callback - Expected result is the requested
   *        collection object.
   */
  fetch: function(id, callback) {
    $.ajax({
      url: this.api_base_url + "/" + id,
      type: "get",
      dataType: "json",
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, undefined);
    });
  },

  /**
   * Change the contents of a collection.
   * @param {number} id - The collection identifier.
   * @param {Object} value - The new collection contents.
   * @param {NodeStyleCallback} callback - Expected result is the new collection
   *        object.
   */
  update: function(id, value, callback) {
    $.ajax({
      url: this.api_base_url + "/" + id,
      type: "post",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(value)
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, false);
    });
  },

  /**
   * Copy to the destination collection, since we expect the destination
   * to be empty. A true rest API would replace the destination collection:
   * @see https://en.wikipedia.org/wiki/Representational_state_transfer#Applied_to_web_services
   * @param {*} src - Source collection identifier.
   * @param {*} dest - Destination collection identifier.
   * @param {NodeStyleCallback} callback
   */
  copyAll: function(src, dest, callback) {
    $.ajax({
      url: this.api_base_url + "/" + dest + '?src=' + src,
      type: "put"
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, false);
    });
  },

  /**
   * Change the contents of an asset or source file.
   * @param {number} id - The collection identifier.
   * @param {String} value - The new file contents.
   * @param {String} filename - The name of the file to create or update.
   * @param {NodeStyleCallback} callback - Expected result is the new collection
   *        object.
   */
  put: function(id, value, filename, callback) {
    $.ajax({
      url: this.api_base_url + "/" + id + "/" + filename,
      type: "put",
      contentType: "application/json; charset=utf-8",
      data: value
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, false);
    });
  }
};

module.exports = {
  /**
   * Create a ClientApi instance with the given base URL.
   * @param {!string} url - Custom API base url (e.g. '/v3/netsim')
   * @returns {ClientApi}
   */
  create: function (url) {
    return $.extend({}, base, {
      api_base_url: url
    });
  }
};
