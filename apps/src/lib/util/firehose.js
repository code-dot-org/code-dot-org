/** @file Provides clients to AWS Firehose, whose data is imported into AWS Redshift. */

import logToCloud from '@cdo/apps/logToCloud';
import {getStore} from '@cdo/apps/redux';
import currentLocale from '@cdo/apps/util/currentLocale';
import {
  createUuid,
  trySetLocalStorage,
  tryGetLocalStorage,
} from '@cdo/apps/utils';

import {
  getEnvironment,
  isDevelopmentEnvironment,
  isTestEnvironment,
} from '../../utils';

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

// These limits are based on the maximum lengths in the coresponding Redshift
// data columns. See firehose.rb for matching data validation.
const maxDataJSONBytes = 65500;
const maxDataStringBytes = 4095;

// TODO(asher): Add the ability to queue records individually, to be submitted
// as a batch.
// TODO(asher): Determine whether any of the utility functions herein should be
// moved elsewhere, e.g., to apps/src/util.js.
class FirehoseClient {
  constructor(AWS, Firehose) {
    this.firehose = createNewFirehose(AWS, Firehose);
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
    if (isTestEnvironment() || isDevelopmentEnvironment()) {
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
    let analytics_uuid = tryGetLocalStorage('analyticsID', null);
    if (!analytics_uuid) {
      analytics_uuid = createUuid();
    }
    trySetLocalStorage('analyticsID', analytics_uuid);
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
      full_path: window.location.href,
    };
    return device_info;
  }

  getLocale() {
    if (window.appOptions) {
      return window.appOptions.locale;
    } else {
      return currentLocale();
    }
  }

  /**
   * Merge various key-value pairs into data.
   * @param {hash} data The data to add the key-value pairs to.
   * @option {boolean} includeUserId Include userId in records, if signed in
   * @return {hash} The data, including the newly added key-value pairs.
   * NOTE: In scenarios where userId is not in pageConstants, such as in the
   * project gallery, we can also directly pass user_id as a field on the data * object. In this case, includeUserId should be false to avoid overriding
   * the manually set user_id.
   * NOTE: In scenarios where the script_id we want to log is different than
   * that inferred by progress (such as in tracking which scripts a teacher has
   * hidden), we can directly pass script_id as a field on the data object by
   * setting useProgressScriptId to false to avoid overriding the manually set
   * script_id.
   */
  addCommonValues(data, includeUserId, useProgressScriptId) {
    data['created_at'] = new Date().toISOString();
    data['environment'] = getEnvironment();
    data['uuid'] = this.getAnalyticsUuid();
    data['device'] = JSON.stringify(this.getDeviceInfo());
    data['locale'] = this.getLocale();

    const state = getStore().getState();
    if (state) {
      if (includeUserId) {
        const constants = state.pageConstants;
        const currentUserId = state.currentUser.userId;
        if (constants) {
          data['user_id'] = constants.userId;
        } else if (currentUserId) {
          data['user_id'] = currentUserId;
        }
      }
      const progress = state.progress;
      if (progress && useProgressScriptId) {
        data['script_id'] = progress.scriptId;
        data['level_id'] = parseInt(progress.currentLevelId);
      }
    }

    return data;
  }

  handleError(requestData, error) {
    // Report the error via our own servers, in case reporting it directly
    // to firehose was blocked by a network firewall.
    $.ajax({
      url: '/api/firehose_unreachable',
      data: JSON.stringify({
        original_data: requestData,
        error_text: String(error),
      }),
      contentType: 'application/json; charset=utf-8',
      method: 'PUT',
      dataType: 'json',
    });
  }

  /**
   * Pushes one data record into the delivery stream.
   * @param {hash} data The data to push.
   * @param {hash} options Additional (optional) options.
   *   (default {alwaysPut: false})
   * @option options [boolean] alwaysPut Forces the record to be sent.
   * @option options [boolean] includeUserId Include userId in records, if signed in
   * NOTE: In scenarios where userId is not in pageConstants, such as in the
   * project gallery, we can also directly pass user_id as a field on the data * object. In this case, includeUserId should be false to avoid overriding
   * the manually set user_id.
   * @option options [function(err, data)] callback Invoked upon completion with error or data
   */
  putRecord(
    data,
    options = {
      alwaysPut: false,
      includeUserId: false,
      callback: null,
      useProgressScriptId: true,
    }
  ) {
    data = this.addCommonValues(
      data,
      options.includeUserId,
      options.useProgressScriptId
    );
    const handleError = this.handleError.bind(this, data);
    if (!this.shouldPutRecord(options['alwaysPut'])) {
      console.groupCollapsed('Skipped sending record to ' + deliveryStreamName);
      if (!IN_UNIT_TEST) {
        console.log(data);
      }
      console.groupEnd();
      if (options.callback) {
        options.callback(null, data);
      }
      return;
    }

    if (validateFirehoseDataSize(data.data)) {
      // Don't call putRecord if the size will fail the batch
      return;
    }

    this.firehose.putRecord(
      {
        DeliveryStreamName: deliveryStreamName,
        Record: {
          Data: JSON.stringify(data),
        },
      },
      function (err, data) {
        if (options.callback) {
          options.callback(err, data);
        } else if (err) {
          handleError(err);
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
  putRecordBatch(
    data,
    options = {
      alwaysPut: false,
      includeUserId: false,
      useProgressScriptId: true,
    }
  ) {
    data.map(function (record) {
      return this.AddCommonValues(
        record,
        options.includeUserId,
        options.useProgressScriptId
      );
    });

    if (!this.shouldPutRecord(options['alwaysPut'])) {
      console.groupCollapsed(
        'Skipped sending record batch to ' + deliveryStreamName
      );
      data.map(function (record) {
        if (!IN_UNIT_TEST) {
          console.log(record);
        }
      });
      console.groupEnd();
      return;
    }

    const batch = data.map(function (record) {
      return {
        Data: JSON.stringify(record),
      };
    });

    this.firehose.putRecordBatch(
      {
        DeliveryStreamName: deliveryStreamName,
        Records: batch,
      },
      function (err, data) {}
    );
  }
}

// Verifies that given data will not fail firehose batch
function validateFirehoseDataSize(data) {
  const json_size = new Blob([data?.data_json]).size;
  const string_size = new Blob([data?.data_string]).size;
  if (json_size > maxDataJSONBytes) {
    logToCloud.logError(`data_json column too large (${json_size} bytes)`);
    return true;
  }
  if (string_size > maxDataStringBytes) {
    logToCloud.logError(`data_json column too large (${string_size} bytes)`);
    return true;
  }
}

// This code sets up an AWS config against a very restricted user, so this is
// not a concern, we just don't want to make things super obvious. For more
// info, contact the infrastructure team.
/* eslint-disable */
function createNewFirehose(AWS, Firehose) {
  var _0xr0t13 = function (message) {
    return message.replace(/[a-z]/gi, letter =>
      String.fromCharCode(
        letter.charCodeAt(0) + (letter.toLowerCase() <= 'm' ? 13 : -13)
      )
    );
  };
  const _0x12ed = [
    _0xr0t13(
      '\x4e\x58\x56\x4e\x4a\x35\x43\x35\x52\x52\x52\x59\x56\x49\x57\x55\x53\x44\x44\x49'
    ),
    _0xr0t13(
      '\x71\x42\x2f\x7a\x37\x77\x32\x4f\x64\x4e\x36\x53\x45\x4b\x73\x47\x4f\x4d\x71\x52\x64\x48\x6a\x45\x47\x2f\x50\x2b\x33\x39\x35\x76\x72\x42\x62\x6f\x43\x69\x4b\x35'
    ),
    '\x75\x73\x2d\x65\x61\x73\x74\x2d\x31',
    '\x63\x6f\x6e\x66\x69\x67',
  ];
  (function (_0xb54a92, _0x4e682a) {
    var _0x44f3e8 = function (_0x35c55a) {
      while (--_0x35c55a) {
        _0xb54a92['\x70\x75\x73\x68'](_0xb54a92['\x73\x68\x69\x66\x74']());
      }
    };
    _0x44f3e8(++_0x4e682a);
  })(_0x12ed, 0x127);
  var _0xd12e = function (_0x2cedd5, _0x518781) {
    _0x2cedd5 = _0x2cedd5 - 0x0;
    var _0x4291ea = _0x12ed[_0x2cedd5];
    return _0x4291ea;
  };
  AWS[_0xd12e('0x0')] = new AWS['\x43\x6f\x6e\x66\x69\x67']({
    accessKeyId: _0xd12e('0x1'),
    secretAccessKey: _0xd12e('0x2'),
    region: _0xd12e('0x3'),
  });

  return new Firehose({
    apiVersion: '2015-08-04',
    correctClockSkew: true,
  });
}
/* eslint-enable */

let promise;
function getSingleton() {
  if (!promise) {
    promise = Promise.all([
      import('aws-sdk/lib/core'),
      import('aws-sdk/clients/firehose'),
      import('aws-sdk/lib/config'),
    ])
      .then(
        ([{default: AWS}, {default: Firehose}]) =>
          new Promise(resolve => resolve(new FirehoseClient(AWS, Firehose)))
      )
      .catch(() => {
        // If the import() network request failed, make it look like we never
        // requested the singleton object before so that the next call to
        // firehose will try the import() call again.
        promise = null;
      });
  }
  return promise;
}

function putRecord(data, options) {
  return getSingleton().then(firehoseClient =>
    firehoseClient.putRecord(data, options)
  );
}

function putRecordBatch(data, options) {
  return getSingleton().then(firehoseClient =>
    firehoseClient.putRecordBatch(data, options)
  );
}

export default {validateFirehoseDataSize, putRecord, putRecordBatch};
