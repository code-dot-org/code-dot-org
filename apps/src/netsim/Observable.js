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
 * @fileoverview Observer/Observable pattern utilities
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
'use strict';

var Observable = function () {

  /**
   * Objects observing this.
   * @type {Array}
   * @private
   */
  this.observerList_ = [];
};
module.exports = Observable;

/**
 *
 * @param thisArg
 * @param callback
 * @returns {Object} key - used to unregister from observable
 */
Observable.prototype.register = function (thisArg, callback) {
  var key = {thisArg: thisArg, toCall:callback};
  Object.freeze(key);
  this.observerList_.push(key);
  return key;
};

/**
 *
 * @param {Object} keyObj - Key generated when registering
 * @returns {boolean} - Whether an unregistration actually occurred
 */
Observable.prototype.unregister = function (keyObj) {
  for (var i = 0; i < this.observerList_.length; i++) {
    if (keyObj === this.observerList_[i]) {
      this.observerList_.splice(i, 1);
      return true;
    }
  }
  return false;
};

Observable.prototype.notify = function () {
  var args = Array.prototype.slice.call( arguments, 0 );
  this.observerList_.forEach(function (observer) {
    observer.toCall.apply(observer.thisArg, args);
  });
};