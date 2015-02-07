/**
 * Code.org Apps
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
 maxparams: 4,
 maxstatements: 200
 */
/* global $ */
/* global JSON */
'use strict';

/** Namespace for app storage. */
var appsApi = module.exports;

var ApiRequestHelper = function (baseUrl) {
  this.apiBaseUrl_ = baseUrl;
};

ApiRequestHelper.prototype.get = function (localUrl, callback, failureValue) {
  $.ajax({
    url: this.apiBaseUrl_ + localUrl,
    type: 'get',
    dataType: 'json'
  }).done(function (result /*, text*/) {
    callback(result);
  }).fail(function (/*request, status, error*/) {
    callback(failureValue);
  });
};

ApiRequestHelper.prototype.post = function (localUrl, data, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + localUrl,
    type: 'post',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(data)
  }).done(function (/*result, text*/) {
    callback(true);
  }).fail(function (/*request, status, error*/) {
    callback(false);
  });
};

ApiRequestHelper.prototype.postToGet = function (localUrl, data, callback,
    failureValue) {
  $.ajax({
    url: this.apiBaseUrl_ + localUrl,
    type: 'post',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(data)
  }).done(function (result /*, text*/) {
    callback(result);
  }).fail(function (/*request, status, error*/) {
    callback(failureValue);
  });
};

ApiRequestHelper.prototype.delete = function (localUrl, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + localUrl,
    type: 'delete'
  }).done(function (/*result, text*/) {
    callback(true);
  }).fail(function (/*request, status, error*/) {
    callback(false);
  });
};

/**
 * API for master apps table on the server.
 * @constructor
 */
appsApi.AppsTable = function () {
  this.requestHelper_ = new ApiRequestHelper('/v3/apps');
};

/**
 * @param {!function} callback
 */
appsApi.AppsTable.prototype.readAll = function (callback) {
  this.requestHelper_.get('', callback, null);
};

/**
 * @param {!string} id - unique app GUID
 * @param {!function} callback
 */
appsApi.AppsTable.prototype.read = function (id, callback) {
  this.requestHelper_.get('/' + id, callback, undefined);
};

/**
 * @param {!Object} value
 * @param {!function} callback
 */
appsApi.AppsTable.prototype.create = function (value, callback) {
  this.requestHelper_.postToGet('', value, callback, undefined);
};

/**
 * @param {!string} id
 * @param {!Object} value
 * @param {!function} callback
 */
appsApi.AppsTable.prototype.update = function (id, value, callback) {
  this.requestHelper_.post('/' + id, value, callback);
};

/**
 * @param {!string} id
 * @param {!function} callback
 */
appsApi.AppsTable.prototype.delete = function (id, callback) {
  this.requestHelper_.delete('/' + id, callback);
};

/**
 * App-specific Shared Storage Table
 * Data stored in this table can by modified and retrieved by all users of
 * a particular app, but is not shared between apps.
 * Only real difference with parent class AppsTable is that these
 * tables deal in numeric row IDs, not string GUIDs.  Implementation
 * shouldn't care though.
 * @constructor
 * @augments appsApi.AppsTable
 */
appsApi.SharedTable = function (app_publickey, table_name) {
  appsApi.AppsTable.call(this);
  /** Shared tables just use a different base URL */
  this.requestHelper_ = new ApiRequestHelper('/v3/apps/' + app_publickey +
  '/shared-tables/' + table_name);
};
appsApi.SharedTable.prototype = Object.create(appsApi.AppsTable.prototype);
appsApi.SharedTable.prototype.constructor = appsApi.SharedTable;

/**
 * App-specific User Storage Table
 * Data stored in this table can only be modified and retrieved by a particular
 * user of an app.
 * @constructor
 * @augments appsApi.AppsTable
 */
appsApi.UserTable = function (app_publickey, table_name) {
  appsApi.AppsTable.call(this);
  /** User tables just use a different base URL */
  this.requestHelper_ = new ApiRequestHelper('/v3/apps/' + app_publickey +
  '/user-tables/' + table_name);
};
appsApi.UserTable.prototype = Object.create(appsApi.AppsTable.prototype);
appsApi.UserTable.prototype.constructor = appsApi.UserTable;

/**
 * API for interacting with app property bags on the server.
 * This property bag is shared between all users of the app.
 *
 * @param {!string} app_publickey
 * @constructor
 */
appsApi.PropertyBag = function (app_publickey) {
  this.requestHelper_ = new ApiRequestHelper('/v3/apps' + app_publickey +
      '/shared-properties');
};

appsApi.PropertyBag.prototype.readAll = function (callback) {
  this.requestHelper_.get('', callback, null);
};

appsApi.PropertyBag.prototype.read = function (key, callback) {
  this.requestHelper_.get('/' + key, callback, undefined);
};

appsApi.PropertyBag.prototype.set = function (key, value, callback) {
  this.requestHelper_.post('/' + key, value, callback);
};

appsApi.PropertyBag.prototype.delete = function (key, callback) {
  this.requestHelper_.delete('/' + key, callback);
};

/**
 * App-specific User-specific property bag
 * Only accessible to the current user of the particular app.
 * @param app_publickey
 * @constructor
 * @augments appsApi.PropertyBag
 */
appsApi.UserPropertyBag = function (app_publickey) {
  appsApi.PropertyBag.call(this, app_publickey);
  /** User property bags just use a different base URL */
  this.requestHelper_ = new ApiRequestHelper('/v3/apps/' + app_publickey +
  '/user-properties');
};
appsApi.UserPropertyBag.prototype = Object.create(appsApi.PropertyBag.prototype);
appsApi.UserPropertyBag.prototype.constructor = appsApi.UserPropertyBag;