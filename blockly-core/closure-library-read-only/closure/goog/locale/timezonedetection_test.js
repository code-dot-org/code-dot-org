// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


goog.provide('goog.locale.timeZoneDetectionTest');
goog.setTestOnly('goog.locale.timeZoneDetectionTest');

goog.require('goog.locale.timeZoneDetection');
goog.require('goog.testing.jsunit');



/**
 * Mock date class with simplified properties of Date class for testing.
 * @constructor
 */
function MockDate() {
  /**
   * Time zone offset. For time zones with daylight saving, the different
   * offsets are represented as array of offsets.
   * @type {Array.<number>}
   * @private
   */
  this.timezoneOffset_ = [];
  /**
   * Counter storing the index of next offset value to be returned from the
   * array of offset values.
   * @type {number}
   * @private
   */
  this.offsetArrayCounter_ = 0;
}


/**
 * Does nothing because setting the time to calculate offset is not needed
 * in the mock class.
 * @param {number} ms Ignored.
 */
MockDate.prototype.setTime = function(ms) {
  // Do nothing.
};


/**
 * Sets the time zone offset.
 * @param {Array.<number>} offset Time zone offset.
 */
MockDate.prototype.setTimezoneOffset = function(offset) {
  this.timezoneOffset_ = offset;
};


/**
 * Returns consecutive offsets from array of time zone offsets on each call.
 * @return {number} Time zone offset.
 */
MockDate.prototype.getTimezoneOffset = function() {
  return this.timezoneOffset_.length > 1 ?
      this.timezoneOffset_[this.offsetArrayCounter_++] :
      this.timezoneOffset_[0];
};

function testGetFingerprint() {
  var mockDate = new MockDate();
  mockDate.setTimezoneOffset([-480]);
  var fingerprint = goog.locale.timeZoneDetection.getFingerprint(mockDate);
  assertEquals(32, fingerprint);

  mockDate = new MockDate();
  mockDate.setTimezoneOffset(
      [480, 420, 420, 480, 480, 420, 420, 420, 420, 420, 420, 420, 420]);
  fingerprint = goog.locale.timeZoneDetection.getFingerprint(mockDate);
  assertEquals(1294772902, fingerprint);
}

function testDetectTimeZone() {
  var mockDate = new MockDate();
  mockDate.setTimezoneOffset([-480]);
  var timeZoneId =
      goog.locale.timeZoneDetection.detectTimeZone(undefined, mockDate);
  assertEquals('Asia/Hong_Kong', timeZoneId);

  mockDate = new MockDate();
  mockDate.setTimezoneOffset(
      [480, 420, 420, 480, 480, 420, 420, 420, 420, 420, 420, 420, 420]);
  timeZoneId = goog.locale.timeZoneDetection.detectTimeZone('US', mockDate);
  assertEquals('America/Los_Angeles', timeZoneId);

  mockDate = new MockDate();
  mockDate.setTimezoneOffset(
      [480, 420, 420, 480, 480, 420, 420, 420, 420, 420, 420, 420, 420]);
  timeZoneId = goog.locale.timeZoneDetection.detectTimeZone('CA', mockDate);
  assertEquals('America/Dawson', timeZoneId);
}

function testGetTimeZoneList() {
  var mockDate = new MockDate();
  mockDate.setTimezoneOffset(
      [480, 420, 420, 480, 480, 420, 420, 420, 420, 420, 420, 420, 420]);
  var timeZoneList =
      goog.locale.timeZoneDetection.getTimeZoneList(undefined, mockDate);
  assertEquals('America/Los_Angeles', timeZoneList[0]);
  assertEquals('America/Whitehorse', timeZoneList[4]);
  assertEquals(5, timeZoneList.length);

  mockDate = new MockDate();
  mockDate.setTimezoneOffset([-480]);
  timeZoneList =
      goog.locale.timeZoneDetection.getTimeZoneList(undefined, mockDate);
  assertEquals('Asia/Hong_Kong', timeZoneList[0]);
  assertEquals('Asia/Chongqing', timeZoneList[7]);
  assertEquals(16, timeZoneList.length);

  timeZoneList =
      goog.locale.timeZoneDetection.getTimeZoneList('AU', mockDate);
  assertEquals(1, timeZoneList.length);
  assertEquals('Australia/Perth', timeZoneList[0]);
}
