/** @file Provides clients to AWS Firehose, whose data is imported into AWS Redshift. */

import $ from 'jquery';

const FIREHOSE_URLS = {
  "analysis-events" : "https://vqaozk0x32.execute-api.us-east-1.amazonaws.com/prod/FirehoseMicroservice"
};

/**
 * A barebones client for posting data to an AWS Firehose stream.
 * Usage:
 *   firehoseClient.putRecord(
 *     'analysis-events',
 *     {
 *       created_at: new Date().toISOString(),             // REQUIRED
 *       environment: 'production',          // REQUIRED
 *       study: 'underwater basket weaving', // REQUIRED
 *       study_group: 'control',             // OPTIONAL
 *       user_id: current_user.id,           // OPTIONAL
 *       script_id: script.id,               // OPTIONAL
 *       level_id: level.id,                 // OPTIONAL
 *       project_id: project.id              // OPTIONAL
 *       event: 'drowning',                  // REQUIRED
 *       data_int: 2                         // OPTIONAL
 *       data_float: 0.31                    // OPTIONAL
 *       data_string: 'code.org rocks'       // OPTIONAL
 *       data_json: JSON.stringify(x)        // OPTIONAL
 *     }
 *   );
 * Usage:
 *   firehoseClient.putRecordBatch(
 *     'analysis-events',
 *     [
 *       {
 *         created_at: new Date().toISOString(),             // REQUIRED
 *         environment: 'production',          // REQUIRED
 *         study: 'underwater basket weaving', // REQUIRED
 *         study_group: 'control',             // OPTIONAL
 *         user_id: current_user.id,           // OPTIONAL
 *         script_id: script.id,               // OPTIONAL
 *         level_id: level.id,                 // OPTIONAL
 *         project_id: project.id              // OPTIONAL
 *         event: 'drowning',                  // REQUIRED
 *         data_int: 2                         // OPTIONAL
 *         data_float: 0.31                    // OPTIONAL
 *         data_string: 'code.org rocks'       // OPTIONAL
 *         data_json: JSON.stringify(x)        // OPTIONAL
 *       },
 *       {
 *         created_at: new Date().toISOString(),             // REQUIRED
 *         environment: 'production',          // REQUIRED
 *         study: 'underwater basket weaving', // REQUIRED
 *         study_group: 'control',             // OPTIONAL
 *         user_id: current_user.id,           // OPTIONAL
 *         script_id: script.id,               // OPTIONAL
 *         level_id: level.id,                 // OPTIONAL
 *         project_id: project.id              // OPTIONAL
 *         event: 'drowning',                  // REQUIRED
 *         data_int: 2                         // OPTIONAL
 *         data_float: 0.31                    // OPTIONAL
 *         data_string: 'code.org rocks'       // OPTIONAL
 *         data_json: JSON.stringify(x)        // OPTIONAL
 *       },
 *     ]
 *   );
 */
// TODO(asher): Add the ability to queue records individually, to be submitted
// as a batch.
class FirehoseClient {
  /**
   * Pushes one data record into the delivery stream.
   * @param {string} deliveryStreamName The name of the delivery stream.
   * @param {hash} data The data to push.
   */
  putRecord(deliveryStreamName, data) {
    const dataToSend = JSON.stringify({
      "batch": [
        {
          "Data": data
        }
      ]
    });
    $.post({
      url: FIREHOSE_URLS[deliveryStreamName],
      data: dataToSend
    });
  }

  /**
   * Pushes an array of data records into the delivery stream.
   * @param {string} deliveryStreamName The name of the delivery stream.
   * @param {array[hash]} data The data to push.
   */
  putRecordBatch(deliveryStreamName, data) {
    const batch = data.map(function (record) {
      return {
        "Data": record
      };
    });

    const dataToSend = JSON.stringify({
      "batch": batch
    });

    $.post({
      url: FIREHOSE_URLS[deliveryStreamName],
      data: dataToSend
    });
  }
}

const firehoseClient = new FirehoseClient();
export default firehoseClient;
