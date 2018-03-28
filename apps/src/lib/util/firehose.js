/** @file Provides clients to AWS Firehose, whose data is imported into AWS Redshift. */

import AWS from 'aws-sdk';
import {createUuid, trySetLocalStorage, tryGetLocalStorage} from '@cdo/apps/utils';
import {getStore} from '@cdo/apps/redux';

/**
 * A barebones client for posting data to an AWS Firehose stream.
 * Usage:
 *   firehoseClient.putRecord(
 *     {
 *       study: 'underwater basket weaving', // REQUIRED
 *       study_group: 'control',             // OPTIONAL
 *       event: 'drowning',                  // REQUIRED
 *       data_int: 2                         // OPTIONAL
 *       data_float: 0.31                    // OPTIONAL
 *       data_string: 'code.org rocks'       // OPTIONAL
 *       data_json: JSON.stringify(x)        // OPTIONAL
 *     }
 *   );
 * Usage:
 *   firehoseClient.putRecordBatch(
 *     [
 *       {
 *         study: 'underwater basket weaving', // REQUIRED
 *         study_group: 'control',             // OPTIONAL
 *         event: 'drowning',                  // REQUIRED
 *         data_int: 2                         // OPTIONAL
 *         data_float: 0.31                    // OPTIONAL
 *         data_string: 'code.org rocks'       // OPTIONAL
 *         data_json: JSON.stringify(x)        // OPTIONAL
 *       },
 *       {
 *         study: 'underwater basket weaving', // REQUIRED
 *         study_group: 'control',             // OPTIONAL
 *         event: 'drowning',                  // REQUIRED
 *         data_int: 2                         // OPTIONAL
 *         data_float: 0.31                    // OPTIONAL
 *         data_string: 'code.org rocks'       // OPTIONAL
 *         data_json: JSON.stringify(x)        // OPTIONAL
 *       },
 *     ]
 *   );
 */

const deliveryStreamName = 'analysis-events';

// TODO(asher): Add the ability to queue records individually, to be submitted
// as a batch.
// TODO(asher): Determine whether any of the utility functions herein should be
// moved elsewhere, e.g., to apps/src/util.js.
class FirehoseClient {
  /**
   * Returns the current environment.
   * @return {string} The current environment, e.g., "staging" or "production".
   */
  getEnvironment() {
    const hostname = window.location.hostname;
    if (hostname.includes("adhoc")) {
      // As adhoc hostnames may include other keywords, check it first.
      return "adhoc";
    }
    if (hostname.includes("test")) {
      return "test";
    }
    if (hostname.includes("levelbuilder")) {
      return "levelbuilder";
    }
    if (hostname.includes("staging")) {
      return "staging";
    }
    if (hostname.includes("localhost")) {
      return "development";
    }
    if (hostname.includes("code.org")) {
      return "production";
    }
    return "unknown";
  }

  /**
   * Returns whether the environment appears to be the test environment.
   * @return {boolean} Whether the hostname includes "test".
   */
  isTestEnvironment() {
    return this.getEnvironment() === "test";
  }

  /**
   * Returns whether the environment appears to be a development environment.
   * @return {boolean} Whether the hostname includes "localhost".
   */
  isDevelopmentEnvironment() {
    return this.getEnvironment() === "development";
  }

  /**
   * Returns whether the request should be sent through to AWS Firehose.
   * @param {boolean} alwaysPut An override to default environment behavior.
   * @return {boolean} Whether the request should be sent through to AWS
   *   Firehose.
   */
  shouldPutRecord(alwaysPut) {
    if (alwaysPut) {
      return true;
    }
    if (this.isTestEnvironment() || this.isDevelopmentEnvironment()) {
      return false;
    }
    return true;
  }

  /**
   * Returns a unique user ID that is persisted across sessions through local
   * storage.
   * WARNING: Mutates local storage if an analyticsID has not already been set.
   * @return {string} A unique user ID.
   */
  getAnalyticsUuid() {
    let analytics_uuid = tryGetLocalStorage("analyticsID", null);
    if (!analytics_uuid) {
      analytics_uuid = createUuid();
    }
    trySetLocalStorage("analyticsID", analytics_uuid);
    return analytics_uuid;
  }

  /**
   * Returns a hash containing user device information.
   * storage.
   * @return {hash} Hash of user device information.
   */
  getDeviceInfo() {
    let device_info = {
      user_agent: window.navigator.userAgent,
      window_width: window.innerWidth,
      window_height: window.innerHeight,
      hostname: window.location.hostname,
      full_path: window.location.href
    };
    return device_info;
  }

  /**
   * Merge various key-value pairs into data.
   * @param {hash} data The data to add the key-value pairs to.
   * @option {boolean} includeUserId Include userId in records, if signed in
   * @return {hash} The data, including the newly added key-value pairs.
   */
  addCommonValues(data, includeUserId) {
    data['created_at'] = new Date().toISOString();
    data['environment'] = this.getEnvironment();
    data['uuid'] = this.getAnalyticsUuid();
    data['device'] = JSON.stringify(this.getDeviceInfo());

    const state = getStore().getState();
    if (state) {
      if (includeUserId) {
        const constants = state.pageConstants;
        if (constants) {
          data['user_id'] = constants.userId;
        }
      }
      const progress = state.progress;
      if (progress) {
        data['script_id'] = progress.scriptId;
        data['level_id'] = parseInt(progress.currentLevelId);
      }
    }

    return data;
  }

  /**
   * Pushes one data record into the delivery stream.
   * @param {hash} data The data to push.
   * @param {hash} options Additional (optional) options.
   *   (default {alwaysPut: false})
   * @option options [boolean] alwaysPut Forces the record to be sent.
   * @option options [boolean] includeUserId Include userId in records, if signed in
   * @option options [function(err, data)] callback Invoked upon completion with error or data
   */
  putRecord(data, options = {alwaysPut: false, includeUserId: false, callback: null}) {
    data = this.addCommonValues(data, options.includeUserId);
    if (!this.shouldPutRecord(options['alwaysPut'])) {
      console.groupCollapsed("Skipped sending record to " + deliveryStreamName);
      console.log(data);
      console.groupEnd();
      if (options.callback) {
        options.callback(null, data);
      }
      return;
    }

    FIREHOSE.putRecord(
      {
        DeliveryStreamName: deliveryStreamName,
        Record: {
          Data: JSON.stringify(data),
        },
      },
      function (err, data) {
        if (options.callback) {
          options.callback(err, data);
        }
      }
    );
  }

  /**
   * Pushes an array of data records into the delivery stream.
   * @param {array[hash]} data The data to push.
   * @param {hash} options Additional (optional) options.
   *   (default {alwaysPut: false})
   * @option options [boolean] alwaysPut Forces the record to be sent.
   * @option options [boolean] includeUserId Include userId in records, if signed in
   */
  putRecordBatch(data, options = {alwaysPut: false, includeUserId: false}) {
    data.map(function (record) { return this.AddCommonValues(record, options.includeUserId); });

    if (!this.shouldPutRecord(options['alwaysPut'])) {
      console.groupCollapsed("Skipped sending record batch to " + deliveryStreamName);
      data.map(function (record) {
        console.log(record);
      });
      console.groupEnd();
      return;
    }

    const batch = data.map(function (record) {
      return {
        Data: JSON.stringify(record)
      };
    });

    FIREHOSE.putRecordBatch(
      {
        DeliveryStreamName: deliveryStreamName,
        Records: batch
      },
      function (err, data) {}
    );
  }
}

// This code sets up an AWS config against a very restricted user, so this is
// not a concern, we just don't want to make things super obvious. For the
// plaintext, contact asher or eric.
// eslint-disable-next-line
const _0x12ed=['\x41\x4b\x49\x41\x4a\x41\x41\x4d\x42\x59\x4d\x36\x55\x53\x59\x54\x34\x35\x34\x51','\x78\x4e\x4e\x39\x4e\x79\x32\x61\x6d\x39\x78\x75\x4b\x79\x57\x39\x53\x2b\x4e\x76\x41\x77\x33\x67\x68\x68\x74\x68\x72\x6b\x37\x6b\x6e\x51\x59\x54\x77\x6d\x4d\x48','\x75\x73\x2d\x65\x61\x73\x74\x2d\x31','\x63\x6f\x6e\x66\x69\x67'];(function(_0xb54a92,_0x4e682a){var _0x44f3e8=function(_0x35c55a){while(--_0x35c55a){_0xb54a92['\x70\x75\x73\x68'](_0xb54a92['\x73\x68\x69\x66\x74']());}};_0x44f3e8(++_0x4e682a);}(_0x12ed,0x127));var _0xd12e=function(_0x2cedd5,_0x518781){_0x2cedd5=_0x2cedd5-0x0;var _0x4291ea=_0x12ed[_0x2cedd5];return _0x4291ea;};AWS[_0xd12e('0x0')]=new AWS['\x43\x6f\x6e\x66\x69\x67']({'\x61\x63\x63\x65\x73\x73\x4b\x65\x79\x49\x64':_0xd12e('0x1'),'\x73\x65\x63\x72\x65\x74\x41\x63\x63\x65\x73\x73\x4b\x65\x79':_0xd12e('0x2'),'\x72\x65\x67\x69\x6f\x6e':_0xd12e('0x3')});

const FIREHOSE = new AWS.Firehose({apiVersion: '2015-08-04'});
const firehoseClient = new FirehoseClient();
export default firehoseClient;
