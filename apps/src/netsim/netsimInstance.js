/**
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
 * @fileoverview Instance object that wraps an instance ID
 * with helpers for getting certain tables out of the instance.
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
/* global window */
'use strict';

var netsimStorage = require('./netsimStorage');

/**
 * App key, unique to netsim, used for connecting with the storage API.
 * @type {string}
 * @readonly
 */
// TODO (bbuchanan): remove once we can store ids for each app? (userid:1 apppid:42)
var APP_PUBLIC_KEY =
    window.location.hostname.split('.')[0] === 'localhost' ?
        "JGW2rHUp_UCMW_fQmRf6iQ==" : "HQJ8GCCMGP7Yh8MrtDusIA==";

/**
 * Create a netsimInstance object which wraps an instance ID and provides
 * easy access to shared storage tables for that instance.
 * @param {!string} instanceID
 * @returns {{getInstanceID: Function, getLobbyTable: Function, getWireTable: Function}}
 */
var netsimInstance = function (instanceID) {
  return {
    getInstanceID: function () {
      return instanceID;
    },

    getLobbyTable: function () {
      return new netsimStorage.SharedStorageTable(
          APP_PUBLIC_KEY, instanceID + '_lobby');
    },

    getWireTable: function () {
      return new netsimStorage.SharedStorageTable(
          APP_PUBLIC_KEY, instanceID + '_wire');
    }
  };
};
module.exports = netsimInstance;