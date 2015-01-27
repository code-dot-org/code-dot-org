/**
 * Internet Simulator
 *
 * Copyright 2015 Code.org
 * http://code.org/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Interface to application storage API on pegasus/dashboard
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
/* global -Blockly */
'use strict';

/**
 * Namespace for app storage.
 */
var netsimStorage = module.exports;

/**
 * App key, unique to netsim, used for connecting with the storage API.
 * @type {string}
 */
// TODO (bbuchanan): remove once we can store ids for each app? (userid:1 apppid:42)
netsimStorage.APP_PUBLIC_KEY =
    window.location.hostname.split('.')[0] === 'localhost' ?
        "JGW2rHUp_UCMW_fQmRf6iQ==" : "HQJ8GCCMGP7Yh8MrtDusIA==";

/**
 * API for interacting with an app storage table on the server
 * @constructor
 */
var SharedStorageTable = function (app_publickey, table_name) {

  /**
   * Base url for requests to interact with the shared table
   * @type {string}
   * @private
   */
  this.apiBaseUrl_ = '/v3/apps/' + app_publickey + '/shared-tables/' + table_name;
};
netsimStorage.SharedStorageTable = SharedStorageTable;

/**
 * Retrieve all rows from the table
 * @param callback - Takes data as argument, accepts null if request fails.
 */
SharedStorageTable.prototype.all = function (callback) {
  $.ajax({
    url: this.apiBaseUrl_,
    type: "get",
    dataType: "json"
  }).done(function(data, text) {
    callback(data);
  }).fail(function(request, status, error) {
    callback(null);
  });
};

/**
 * Retrieve row with given id from shared table
 * @param id - Row ID
 * @param callback - Takes data as argument, undefined if request fails
 */
SharedStorageTable.prototype.fetch = function (id, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + "/" + id,
    type: "get",
    dataType: "json"
  }).done(function(data, text) {
    callback(data);
  }).fail(function(request, status, error) {
    callback(undefined);
  });
};

/**
 * Insert a new row to shared table
 * @param {Object} value - Row content
 * @param callback - Takes data as argument, undefined if request fails
 *   Data will be inserted row with row ID
 *   TODO (bbuchanan) verify above statement
 */
SharedStorageTable.prototype.insert = function (value, callback) {
  $.ajax({
    url: this.apiBaseUrl_,
    type: "post",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(value)
  }).done(function(data, text) {
    callback(data);
  }).fail(function(request, status, error) {
    callback(undefined);
  });
};

/**
 * Update a row in the shared table
 * @param id - Row ID
 * @param value - new row value
 * @param callback - Takes {boolean} success as an argument.
 */
SharedStorageTable.prototype.update = function (id, value, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + "/" + id,
    type: "post",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(value)
  }).done(function(data, text) {
    callback(true)
  }).fail(function(request, status, error) {
    callback(false)
  });
};

/**
 * Delete a row in the shared table
 * @param id - Row ID
 * @param callback - Takes {boolean} success as an argument.
 */
SharedStorageTable.prototype.delete = function (id, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + "/" + id + "/delete",
    type: "post",
    dataType: "json"
  }).done(function(data, text) {
    callback(true)
  }).fail(function(request, status, error) {
    callback(false)
  });
};






