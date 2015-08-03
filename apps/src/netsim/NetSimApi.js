/**
 * @overview Wraps NetSim REST API by extending our standard client API.
 * @see clientApi.js
 * @see net_sim_api.rb
 */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
/* global $ */
'use strict';

/**
 * @name NetSimApi
 * @extends ClientApi
 */
var netsimApi = {
  /**
   * Base URL for target API.
   * Must be set through NetSimApi.create().
   * @type {string}
   */
  api_base_url: undefined,

  /**
   * Request all rows from the given table.
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
   * Request all rows including and following the given row ID.
   * @param {int} rowID - lower bound on row IDs to fetch
   * @param {NodeStyleCallback} callback - Expected result is an array of
   *        table rows.
   */
  allFromID: function(rowID, callback) {
    $.ajax({
      url: this.api_base_url + '@' + rowID,
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
   * Insert a row.
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
   * Remove a row.
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
   * Retrieve a row.
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
   * Change the contents of a row.
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
  }
};

module.exports = {
  /**
   * Create a NetSimApi instance with the given base URL.
   * @param {!string} url - Custom API base url (e.g. '/v3/netsim')
   * @returns {NetSimApi}
   */
  create: function (url) {
    return $.extend({}, netsimApi, {
      api_base_url: url
    });
  }
};
