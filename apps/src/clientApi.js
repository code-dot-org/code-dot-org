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

// need for Function.prototype.inherits
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

var ClientApiRequest = function (baseUrl) {
  this.apiBaseUrl_ = baseUrl;
};

/**
 * @param {!string} localUrl - API endpoint relative to API base URL.
 * @param {!NodeStyleCallback} callback
 */
ClientApiRequest.prototype.get = function (localUrl, callback) {
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
 * @param {!NodeStyleCallback} callback
 */
ClientApiRequest.prototype.readAll = function (callback) {
  this.get('', callback);
};

/**
 * @param {!string} id - unique app GUID
 * @param {!NodeStyleCallback} callback
 */
ClientApiRequest.prototype.read = function (id, callback) {
  this.get('/' + id, callback);
};

/**
 * @param {!string} localUrl - API endpoint relative to API base URL.
 * @param {Object} data
 * @param {!NodeStyleCallback} callback
 */
ClientApiRequest.prototype.post = function (localUrl, data, callback) {
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
ClientApiRequest.prototype.postToGet = function (localUrl, data, callback) {
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
 * @param {!Object} value
 * @param {!NodeStyleCallback} callback
 */
ClientApiRequest.prototype.create = function (value, callback) {
  this.postToGet('', value, callback);
};

/**
 * @param {!string} localUrl - API endpoint relative to API base URL.
 * @param {!NodeStyleCallback} callback
 */
ClientApiRequest.prototype.delete = function (id, callback) {
  $.ajax({
    url: this.apiBaseUrl_ + '/' + id,
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
 * @param {!string} id
 * @param {!Object} value
 * @param {!NodeStyleCallback} callback
 */
ClientApiRequest.prototype.update = function (id, value, callback) {
  this.post('/' + id, value, callback);
};

/**
 * @param {!string|number} id Id to delete
 * @returns {Error|null} an error if the request fails
 */
ClientApiRequest.prototype.synchronousDelete = function (id) {
  var error = null;
  var localUrl = (id === undefined ? '' : '/' + id);
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
 * @param {string} key
 * @param {Object} value
 * @param {!NodeStyleCallback} callback
 */
ClientApiRequest.prototype.set = function (key, value, callback) {
  this.post('/' + key, value, callback);
};

/**
 * API for accessing channel resources on the server.
 * @constructor
 */
var ChannelsApi = function () {
  ClientApiRequest.call(this, '/v3/channels');
};
ChannelsApi.inherits(ClientApiRequest);

/**
 * Channel-specific Shared Storage Table
 * Data stored in this table can by modified and retrieved by all users of
 * a particular channel, but is not shared between channels.
 * Only real difference with parent class Channel is that these
 * tables deal in numeric row IDs, not string GUIDs.  Implementation
 * shouldn't care though.
 * @constructor
 * @augments Channel
 */
var SharedTableApi = function (channel_publickey, table_name) {
  /** Shared tables just use a different base URL */
  ClientApiRequest.call(this, '/v3/shared-tables/' + channel_publickey + '/' +
    table_name);
};
SharedTableApi.inherits(ClientApiRequest);

/**
 * Channel-specific User Storage Table
 * Data stored in this table can only be modified and retrieved by a particular
 * user of a channel.
 * @constructor
 * @augments ClientApiRequest
 */
var UserTableApi = function (channel_publickey, table_name) {
  /** User tables just use a different base URL */
  ClientApiRequest.call('/v3/user-tables/' + channel_publickey + '/' +
    table_name);
};
UserTableApi.inherits(ClientApiRequest);

/**
 * API for interacting with app property bags on the server.
 * This property bag is shared between all users of the app.
 *
 * @param {!string} channel_publickey
 * @constructor
 * @augments ClientApiRequest
 */
var PropertyBagApi = function (channel_publickey) {
  ClientApiRequest.call('/v3/shared-properties/' + channel_publickey);
};
PropertyBagApi.inherits(ClientApiRequest);

/**
 * App-specific User-specific property bag
 * Only accessible to the current user of the particular app.
 * @param channel_publickey
 * @constructor
 * @augments ClientApiRequest
 */
var UserPropertyBagApi = function (channel_publickey) {
  /** User property bags just use a different base URL */
  ClientApiRequest.call('/v3/user-properties/' + channel_publickey);
};
UserPropertyBagApi.inherits(ClientApiRequest);

module.exports = {
  ChannelsApi: ChannelsApi,
  SharedTableApi: SharedTableApi,
  UserTableApi: UserTableApi,
  PropertyBagApi: PropertyBagApi,
  UserPropertyBagApi: UserPropertyBagApi
};
