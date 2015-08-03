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


var clientApi = require('@cdo/shared/clientApi');

/**
 * @name NetSimApi
 * @extends ClientApi
 */
var newApi = {
  /**
   * Base URL for target API.
   * @type {string}
   */
  api_base_url: "/v3/channels",

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
  }
};

module.exports = {
  /**
   * Create a NetSimApi instance with the given base URL, built by modifying
   * a ClientApi instance with the same base URL.
   * @param {!string} url - Custom API base url (e.g. '/v3/netsim')
   * @returns {NetSimApi}
   */
  create: function (url) {
    return $.extend(clientApi.create(url), newApi, {
      api_base_url: url
    });
  }
};
