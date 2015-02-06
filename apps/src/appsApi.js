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
 maxparams: 3,
 maxstatements: 200
 */
/* global $ */
/* global JSON */
'use strict';

/** Namespace for app storage. */
var appsApi = module.exports;

/**
 * Accessor object for an app's remote storage space.
 * @constructor
 */
appsApi.AppStorage = function () {
  this.apiBaseUrl_ = '/v3/apps';
};

/**
 * @param {!function} callback
 */
appsApi.AppStorage.prototype.readAll = function (callback) {
  $.ajax({
    url: this.apiBaseUrl_,
    type: 'get',
    dataType: 'json'
  }).done(function (data /*, text*/) {
    callback(data);
  }).fail(function (/*request, status, error*/) {
    callback(null);
  });
};

/**
 * @param {!string} id
 * @param {!function} callback
 */
appsApi.AppStorage.prototype.read = function (id, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + '/' + id,
    type: 'get',
    dataType: 'json'
  }).done(function (data /*, text*/) {
    callback(data);
  }).fail(function (/*request, status, error*/) {
    callback(undefined);
  });
};

/**
 * @param {!Object} value
 * @param {!function} callback
 */
appsApi.AppStorage.prototype.create = function (value, callback) {
  $.ajax({
    url: this.apiBaseUrl_,
    type: 'post',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(value)
  }).done(function (data /*, text*/) {
    callback(data);
  }).fail(function (/*request, status, error*/) {
    callback(undefined);
  });
};

/**
 * @param {!string} id
 * @param {!Object} value
 * @param {!function} callback
 */
appsApi.AppStorage.prototype.update = function (id, value, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + '/' + id,
    type: 'post',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(value)
  }).done(function (/*data, text*/) {
    callback(true);
  }).fail(function (/*request, status, error*/) {
    callback(false);
  });
};

/**
 * @param {!string} id
 * @param {!function} callback
 */
appsApi.AppStorage.prototype.delete = function (id, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + '/' + id + '/delete',
    type: 'post',
    dataType: 'json'
  }).done(function (/*data, text*/) {
    callback(true);
  }).fail(function (/*request, status, error*/) {
    callback(false);
  });
};

/**
 * API for interacting with app property bags on the server.
 * This property bag is shared between all users of the app.
 *
 * @param app_publickey
 * @constructor
 * @augments appsApi.AppStorage
 */
appsApi.SharedPropertyBag = function (app_publickey) {
  appsApi.AppStorage.call(this);

  /** For the most part, property bags just use a different base URL. */
  this.apiBaseUrl_ = '/v3/apps/' + app_publickey + '/shared-properties';
};
appsApi.SharedPropertyBag.prototype = Object.create(appsApi.AppStorage.prototype);
appsApi.SharedPropertyBag.prototype.constructor = appsApi.SharedPropertyBag;

/**
 * The 'create' operation doesn't make sense for a property bag;
 * it's just an 'update' with an empty value object.
 * That returns the empty object to the callback instead of 'true'
 *
 * @param {!string} id - Storage key
 * @param {!function} callback
 * @override
 */
appsApi.SharedPropertyBag.prototype.create = function (id, callback) {
  appsApi.AppStorage.update.call(this, id, {}, function (success) {
    if (success) {
      callback({});
    } else {
      callback(undefined);
    }
  });
};

/**
 * Alias for 'update'.
 *
 * @param {!string} id
 * @param {!Object} value
 * @param {!function} callback
 */
appsApi.SharedPropertyBag.prototype.set = function (id, value, callback) {
  appsApi.AppStorage.update.call(this, id, value, callback);
};

/**
 * API for interacting with an app storage table on the server.
 * This table is shared between all users of the app.
 *
 * @param {!string} app_publickey - An app identifier.
 * @param {!string} table_name - App-defined name for this table.
 * @constructor
 */
appsApi.SharedTable = function (app_publickey, table_name) {
  appsApi.AppStorage.call(this);

  /** Shared tables just use a different base URL */
  this.apiBaseUrl_ = '/v3/apps/' + app_publickey + '/shared-tables/' + table_name;
};
appsApi.SharedTable.prototype = Object.create(appsApi.AppStorage.prototype);
appsApi.SharedTable.prototype.constructor = appsApi.SharedTable;

/**
 * User data table scoped to a particular user of an app.
 * Data in this table will only be accessible and manipulable by the
 * user that put it there.  It cannot be shared between users of an app.
 *
 * @param {!string} app_publickey - An app identifier.
 * @param {!string} table_name - App-defined name for this table.
 * @constructor
 * @augments appsApi.SharedTable
 */
appsApi.UserTable = function (app_publickey, table_name) {
  appsApi.AppStorage.call(this, app_publickey, table_name);

  /** User tables just use a different base URL */
  this.apiBaseUrl_ = '/v3/apps/' + app_publickey + '/user-tables/' + table_name;
};
appsApi.UserTable.prototype = Object.create(appsApi.AppStorage.prototype);
appsApi.UserTable.prototype.constructor = appsApi.UserTable;