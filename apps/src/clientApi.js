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

require('./utils');

/**
 * A node-style callback method, that accepts two parameters: err and result.
 * See article on Node error conventions here:
 * https://docs.nodejitsu.com/articles/errors/what-are-the-error-conventions
 *
 * @callback NodeStyleCallback
 * @param {?Error} err - An error object, or null if no error occurred.
 * @param {*} result - Callback result, of any type depending on the
 *        method being invoked.
 */

/** 
 * Namespace for the client API for accessing channels, tables and properties.
 */
var clientApi = module.exports;

var ApiRequestHelper = function (baseUrl) {
  this.apiBaseUrl_ = baseUrl;
};

/**
 * @param {!string} localUrl - API endpoint relative to API base URL.
 * @param {!NodeStyleCallback} callback
 */
ApiRequestHelper.prototype.get = function (localUrl, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + localUrl,
    type: 'get',
    dataType: 'json',
    success: function (data) {
      callback(null, data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      callback(
          new Error('textStatus: ' + textStatus + '; errorThrown: ' + errorThrown),
          null);
    }
  });
};

/**
 * @param {!string} localUrl - API endpoint relative to API base URL.
 * @param {Object} data
 * @param {!NodeStyleCallback} callback
 */
ApiRequestHelper.prototype.post = function (localUrl, data, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + localUrl,
    type: 'post',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(data),
    success: function () {
      callback(null, null);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      callback(
          new Error('textStatus: ' + textStatus + '; errorThrown: ' + errorThrown),
          null);
    }
  });
};

/**
 * @param {!string} localUrl - API endpoint relative to API base URL.
 * @param {Object} data
 * @param {!NodeStyleCallback} callback
 */
ApiRequestHelper.prototype.postToGet = function (localUrl, data, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + localUrl,
    type: 'post',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(data),
    success: function (data) {
      callback(null, data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      callback(
          new Error('textStatus: ' + textStatus + '; errorThrown: ' + errorThrown),
          null);
    }
  });
};

/**
 * @param {!string} localUrl - API endpoint relative to API base URL.
 * @param {!NodeStyleCallback} callback
 */
ApiRequestHelper.prototype.delete = function (localUrl, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + localUrl,
    type: 'delete',
    success: function () {
      callback(null, null);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      callback(
          new Error('textStatus: ' + textStatus + '; errorThrown: ' + errorThrown),
          null);
    }
  });
};

/**
 * @param {!string} localUrl
 * @returns {Error|null} an error if the request fails
 */
ApiRequestHelper.prototype.synchronousDelete = function (localUrl) {
  var error = null;
  $.ajax({
    url: this.apiBaseUrl_ + localUrl,
    type: 'delete',
    async: false,
    error: function (jqXHR, textStatus, errorThrown) {
      error = new Error('textStatus: ' + textStatus + '; errorThrown: ' + errorThrown);
    }
  });
  return error;
};

/**
 * API for accessing channel resources on the server.
 * @constructor
 */
clientApi.Channel = function () {
  this.requestHelper_ = new ApiRequestHelper('/v3/channels');
};

/**
 * @param {!NodeStyleCallback} callback
 */
clientApi.Channel.prototype.readAll = function (callback) {
  this.requestHelper_.get('', callback);
};

/**
 * @param {!string} id - unique app GUID
 * @param {!NodeStyleCallback} callback
 */
clientApi.Channel.prototype.read = function (id, callback) {
  this.requestHelper_.get('/' + id, callback);
};

/**
 * @param {!Object} value
 * @param {!NodeStyleCallback} callback
 */
clientApi.Channel.prototype.create = function (value, callback) {
  this.requestHelper_.postToGet('', value, callback);
};

/**
 * @param {!string} id
 * @param {!Object} value
 * @param {!NodeStyleCallback} callback
 */
clientApi.Channel.prototype.update = function (id, value, callback) {
  this.requestHelper_.post('/' + id, value, callback);
};

/**
 * @param {!string} id
 * @param {!NodeStyleCallback} callback
 */
clientApi.Channel.prototype.delete = function (id, callback) {
  this.requestHelper_.delete('/' + id, callback);
};

/**
 * @param {!string} id
 * @returns {Error|null} error if delete fails
 */
clientApi.Channel.prototype.synchronousDelete = function (id) {
  return this.requestHelper_.synchronousDelete('/' + id);
};

/**
 * Channel-specific Shared Storage Table
 * Data stored in this table can by modified and retrieved by all users of
 * a particular channel, but is not shared between channels.
 * Only real difference with parent class Channel is that these
 * tables deal in numeric row IDs, not string GUIDs.  Implementation
 * shouldn't care though.
 * @constructor
 * @augments clientApi.Channel
 */
clientApi.SharedTable = function (channel_publickey, table_name) {
  clientApi.Channel.call(this);
  /** Shared tables just use a different base URL */
  this.requestHelper_ = new ApiRequestHelper('/v3/shared-tables/' +
      channel_publickey + '/' + table_name);
};
clientApi.SharedTable.inherits(clientApi.Channel);

/**
 * Channel-specific User Storage Table
 * Data stored in this table can only be modified and retrieved by a particular
 * user of a channel.
 * @constructor
 * @augments clientApi.Channel
 */
clientApi.UserTable = function (channel_publickey, table_name) {
  clientApi.Channel.call(this);
  /** User tables just use a different base URL */
  this.requestHelper_ = new ApiRequestHelper('/v3/user-tables/' +
      channel_publickey + '/' + table_name);
};
clientApi.UserTable.inherits(clientApi.Channel);

/**
 * API for interacting with app property bags on the server.
 * This property bag is shared between all users of the app.
 *
 * @param {!string} channel_publickey
 * @constructor
 */
clientApi.PropertyBag = function (channel_publickey) {
  this.requestHelper_ = new ApiRequestHelper('/v3/shared-properties/' +
      channel_publickey);
};

/**
 * @param {!NodeStyleCallback} callback
 */
clientApi.PropertyBag.prototype.readAll = function (callback) {
  this.requestHelper_.get('', callback);
};

/**
 * @param {string} key
 * @param {!NodeStyleCallback} callback
 */
clientApi.PropertyBag.prototype.read = function (key, callback) {
  this.requestHelper_.get('/' + key, callback);
};

/**
 * @param {string} key
 * @param {Object} value
 * @param {!NodeStyleCallback} callback
 */
clientApi.PropertyBag.prototype.set = function (key, value, callback) {
  this.requestHelper_.post('/' + key, value, callback);
};

/**
 * @param {string} key
 * @param {!NodeStyleCallback} callback
 */
clientApi.PropertyBag.prototype.delete = function (key, callback) {
  this.requestHelper_.delete('/' + key, callback);
};

/**
 * App-specific User-specific property bag
 * Only accessible to the current user of the particular app.
 * @param channel_publickey
 * @constructor
 * @augments clientApi.PropertyBag
 */
clientApi.UserPropertyBag = function (channel_publickey) {
  clientApi.PropertyBag.call(this, channel_publickey);
  /** User property bags just use a different base URL */
  this.requestHelper_ = new ApiRequestHelper('/v3/user-properties/' +
      channel_publickey);
};
clientApi.UserPropertyBag.inherits(clientApi.PropertyBag);
