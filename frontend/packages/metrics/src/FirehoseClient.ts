/**
 * Provides clients to AWS Firehose, whose data is imported into AWS Redshift.
 */

import AWS, {AWSError} from 'aws-sdk';
import Firehose, {PutRecordOutput} from 'aws-sdk/clients/firehose';

import localization from '@code-dot-org/localization';

import 'aws-sdk/lib/config';

import {
  getEnvironment,
  isDevelopmentEnvironment,
  isTestEnvironment,
} from './environment';
import {logError} from './NewRelicReporter';

export interface DeviceInfo {
  user_agent: string;
  window_width: number;
  window_height: number;
  hostname: string;
  full_path: string;
}

/**
 * Generate a random identifier in a format matching the RFC-4122 specification.
 *
 * Taken from
 * {@link http://byronsalau.com/blog/how-to-create-a-guid-uuid-in-javascript/}
 *
 * @see RFC-4122 standard {@link http://www.ietf.org/rfc/rfc4122.txt}
 *
 * @returns RFC4122-compliant UUID
 */
const createUuid: () => string = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Simple wrapper around localStorage.getItem that catches any exceptions (for
 * example when we call getItem in Safari's private mode)
 * @return Returns the value of the key in localStorage, `null` if not set or the defaultValue if there is an error
 */
const tryGetLocalStorage: (key: string, defaultValue: string | null) => string | null = (key, defaultValue) => {
  let returnValue = defaultValue;
  try {
    returnValue = localStorage.getItem(key);
  } catch (_) {
    // Ignore errors and we will return false
  }
  return returnValue;
};

/**
 * Simple wrapper around localStorage.setItem that catches any exceptions (for
 * example when we call setItem in Safari's private mode)
 * @return 'true' if we set successfully
 */
const trySetLocalStorage: (item: string, value: string) => boolean = (item, value) => {
  try {
    localStorage.setItem(item, value);
    return true;
  } catch (_) {
    // Ignore errors and we will return false
  }
  return false;
};

export interface RecordData {
  event: string;
  study: string;
  study_group?: string;
  data_int?: number;
  data_float?: number;
  data_string?: string;
  data_json?: string;
  created_at?: string;
  environment?: string;
  uuid?: string;
  device?: string;
  locale?: string;
  user_id?: number;
  script_id?: number;
  level_id?: number;
}

export interface PutRecordOptions {
  alwaysPut?: boolean;
  userId?: number;
  scriptId?: number;
  levelId?: number;
  callback?: (err: AWSError | null, data: RecordData) => void;
}

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

class FirehoseClient {
  firehose: Firehose;

  constructor() {
    this.firehose = createNewFirehose();
  }

  /**
   * Returns whether the request should be sent through to AWS Firehose.
   * @param alwaysPut An override to default environment behavior.
   * @return Whether the request should be sent through to AWS
   *   Firehose.
   */
  shouldPutRecord(alwaysPut: boolean): boolean {
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
   * @return A unique user ID.
   */
  getAnalyticsUuid(): string {
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
   * @return Hash of user device information.
   */
  getDeviceInfo(): DeviceInfo {
    return {
      user_agent: window.navigator.userAgent,
      window_width: window.innerWidth,
      window_height: window.innerHeight,
      hostname: window.location.hostname,
      full_path: window.location.href,
    };
  }

  getLocale(): string {
    return localization.locale;
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
  addCommonValues(data: RecordData) {
    data.created_at = new Date().toISOString();
    data.environment = getEnvironment();
    data.uuid = this.getAnalyticsUuid();
    data.device = JSON.stringify(this.getDeviceInfo());
    data.locale = this.getLocale();

    return data;
  }

  handleError(error: AWSError, requestData: RecordData) {
    // Report the error via our own servers, in case reporting it directly
    // to firehose was blocked by a network firewall.
    fetch('/api/firehose_unreachable', {
      method: 'PUT',
      body: JSON.stringify({
        original_data: requestData,
        error_text: String(error),
      }),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
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
    data: RecordData,
    options: PutRecordOptions = {}
  ) {
    const {userId, scriptId, levelId} = options;
    data = this.addCommonValues(
      data,
    );
    if (userId !== undefined) {
      data.user_id = userId;
    }
    if (scriptId !== undefined) {
      data.script_id = scriptId;
    }
    if (levelId !== undefined) {
      data.level_id = levelId;
    }
    if (!this.shouldPutRecord(!!options.alwaysPut)) {
      console.groupCollapsed('Skipped sending record to ' + deliveryStreamName);
      /*if (!IN_UNIT_TEST) {
        console.log(data);
      }*/
      console.groupEnd();
      if (options.callback) {
        options.callback(null, data);
      }
      return;
    }

    if (validateFirehoseDataSize(data)) {
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
      (err: AWSError, _output: PutRecordOutput) => {
        if (options.callback) {
          options.callback(err, data);
        } else if (err) {
          this.handleError(err, data);
        }
      }
    );
  }

  /**
   * Pushes an array of data records into the delivery stream.
   * @param data - The data to push.
   * @param options - Additional (optional) options.
   *   (default {alwaysPut: false})
   * @option options [boolean] alwaysPut Forces the record to be sent.
   * @option options [boolean] includeUserId Include userId in records, if signed in
   */
  putRecordBatch(
    data: RecordData[],
    options: PutRecordOptions = {}
  ) {
    data.map((record) => {
      const {userId, scriptId, levelId} = options;
      record = this.addCommonValues(
        record,
      );
      if (userId !== undefined) {
        record.user_id = userId;
      }
      if (scriptId !== undefined) {
        record.script_id = scriptId;
      }
      if (levelId !== undefined) {
        record.level_id = levelId;
      }
      return record;
    });

    if (!this.shouldPutRecord(!!options.alwaysPut)) {
      console.groupCollapsed(
        'Skipped sending record batch to ' + deliveryStreamName
      );
      /*
      data.map(function (record) {
        if (!IN_UNIT_TEST) {
          console.log(record);
        }
      });
      */
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
      (_err, _data) => {}
    );
  }
}

// Verifies that given data will not fail firehose batch
function validateFirehoseDataSize(data: RecordData) {
  const json_size = new Blob([data.data_json || '']).size;
  const string_size = new Blob([data.data_string || '']).size;
  if (json_size > maxDataJSONBytes) {
    logError(new Error(`data_json column too large (${json_size} bytes)`));
    return true;
  }
  if (string_size > maxDataStringBytes) {
    logError(new Error(`data_json column too large (${string_size} bytes)`));
    return true;
  }
}

// This code sets up an AWS config against a very restricted user, so this is
// not a concern, we just don't want to make things super obvious. For more
// info, contact the infrastructure team.
function createNewFirehose(): Firehose {
  const _0xr0t13: (message: string) => string = (message: string) => {
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
  (function (_0xb54a92: string[], _0x4e682a: number) {
    const _0x44f3e8 = function (_0x35c55a: number) {
      while (--_0x35c55a) {
        _0xb54a92['\x70\x75\x73\x68'](_0xb54a92['\x73\x68\x69\x66\x74']() || '');
      }
    };
    _0x44f3e8(++_0x4e682a);
  })(_0x12ed, 0x127);
  const _0xd12e: (_0x2cedd5: string) => string = (_0x2cedd5: string) => {
    const _0x2cedde = parseInt(_0x2cedd5) - 0x0;
    const _0x4291ea = _0x12ed[_0x2cedde];
    return _0x4291ea;
  };
  // @ts-expect-error
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

let firehoseClient: FirehoseClient | undefined;
function getSingleton() {
  if (firehoseClient === undefined) {
    firehoseClient = new FirehoseClient();
  }
  return firehoseClient;
}

function putRecord(data: RecordData, options?: PutRecordOptions) {
  return getSingleton().putRecord(data, options);
}

function putRecordBatch(data: RecordData[], options: PutRecordOptions) {
  return getSingleton().putRecordBatch(data, options);
}

export default {validateFirehoseDataSize, putRecord, putRecordBatch};
