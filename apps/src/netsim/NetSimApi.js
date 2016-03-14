/**
 * @overview Wraps NetSim REST APIs for operations of "tables" and "shards."
 * @see net_sim_api.rb
 */
'use strict';

var NetSimApiError = require('./NetSimApiError');

/**
 * @type {string}
 * @const
 */
var NETSIM_API_BASE_URL = '/v3/netsim';

/**
 * @name NetSimShardApi
 */
var shardApi = {

  /**
   * Create an initialized NetSim Shard API instance.
   * @param {string} shardID
   * @returns {NetSimShardApi}
   */
  create: function (shardID) {
    return $.extend({}, shardApi, {

      /**
       * Shard identifier.
       * @type {string}
       */
      shardID: shardID,

      /**
       * Beginning part of URL for all calls that interact with the shard.
       * @type {string}
       */
      baseUrl: NETSIM_API_BASE_URL + '/' + shardID
    });
  },

  makeTableApi: function (tableName) {
    return tableApi.create(this.shardID, tableName);
  }
};

/**
 * @name NetSimTableApi
 */
var tableApi = {

  /**
   * Create an initialized NetSim Table API instance.
   * @param {string} shardID
   * @param {string} tableName
   * @returns {NetSimTableApi}
   */
  create: function (shardID, tableName) {
    return $.extend({}, tableApi, {

      /**
       * Shard identifier.
       * @type {string}
       */
      shardID: shardID,

      /**
       * Table name.
       * @type {string}
       */
      tableName: tableName,

      /**
       * Beginning part of URL for all calls that interact only with
       * this table.
       * @type {string}
       */
      baseUrl: NETSIM_API_BASE_URL + '/' + shardID + '/' + tableName
    });
  },

  /**
   * Request all rows from the given table.
   * @param {NodeStyleCallback} callback - Expected result is an array of
   *        row objects.
   */
  allRows: function(callback) {
    $.ajax({
      url: this.baseUrl,
      type: "get",
      dataType: "json"
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      callback(new NetSimApiError(request), null);
    });
  },

  /**
   * Request all rows including and following the given row ID from the table.
   * @param {int} rowID - lower bound on row IDs to fetch
   * @param {NodeStyleCallback} callback - Expected result is an array of
   *        table rows.
   */
  allRowsFromID: function(rowID, callback) {
    $.ajax({
      url: this.baseUrl + '@' + rowID,
      type: "get",
      dataType: "json"
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      callback(new NetSimApiError(request), null);
    });
  },

  /**
   * Insert a row or rows into the table.
   * @param {Object|Object[]} value - desired row contents, as either an
   *        Object for a single row or an Array of Objects for multiple.
   *        Must be JSON.stringify-able.
   * @param {NodeStyleCallback} callback - Expected result is the created
   *        row object or objects (which will include an assigned 'id'
   *        key).
   */
  createRow: function(value, callback) {
    var data;

    try {
      data = JSON.stringify(value);
    } catch (e) {
      callback(e, undefined);
      return;
    }

    $.ajax({
      url: this.baseUrl,
      type: "post",
      contentType: "application/json; charset=utf-8",
      data: data
    }).done(function(body, text) {
      callback(null, body);
    }).fail(function(request, status, error) {
      callback(new NetSimApiError(request), undefined);
    });
  },

  /**
   * Remove multiple rows at once.
   * @param {number[]} ids - The row IDs to remove.
   * @param {NodeStyleCallback} callback - Expected result is TRUE.
   * @param {boolean} [async] default TRUE.
   */
  deleteRows: function(ids, callback, async) {
    async = async !== false; // `undefined` maps to true

    // Generate query string in the form "id[]=1&id[]=2&..."
    var queryString = ids.map(function (id) {
      return 'id[]=' + id;
    }).join('&');

    $.ajax({
      url: this.baseUrl + '?' + queryString,
      type: 'delete',
      dataType: 'json',
      async: async
    }).done(function(data, text) {
      callback(null, true);
    }).fail(function(request, status, error) {
      callback(new NetSimApiError(request), false);
    });
  },

  /**
   * Retrieve a row.
   * @param {number} id - The row identifier.
   * @param {NodeStyleCallback} callback - Expected result is the requested
   *        row object.
   */
  fetchRow: function(id, callback) {
    $.ajax({
      url: this.baseUrl + "/" + id,
      type: "get",
      dataType: "json"
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      callback(new NetSimApiError(request), undefined);
    });
  },

  /**
   * Change the contents of a row.
   * @param {number} id - The row identifier.
   * @param {Object} value - The new row contents.
   * @param {NodeStyleCallback} callback - Expected result is the new row object.
   */
  updateRow: function(id, value, callback) {
    $.ajax({
      url: this.baseUrl + "/" + id,
      type: "post",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(value)
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      callback(new NetSimApiError(request), false);
    });
  }
};

module.exports = {
  /**
   * Create a NetSim Shard API instance for the given shard.
   * @param {string} shardID
   * @returns {NetSimShardApi}
   */
  makeShardApi: function (shardID) {
    return shardApi.create(shardID);
  },

  /**
   * Create a NetSim Table API instance for the given shard and table name.
   * @param {string} shardID
   * @param {string} tableName
   * @returns {NetSimTableApi}
   */
  makeTableApi: function (shardID, tableName) {
    return tableApi.create(shardID, tableName);
  }
};
