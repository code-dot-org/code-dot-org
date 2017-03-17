/** @file Provides clients to AWS Firehose, whose data is imported into AWS Redshift. */

import AWS from 'aws-sdk';

const IDENTITY_POOL_ID = 'us-east-1:fbfec393-0afb-4682-84d4-59ad04a302f4'
const AWS_REGION = 'us-east-1'

AWS.config.region = AWS_REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: IDENTITY_POOL_ID,
});
const FIREHOSE = new AWS.Firehose({apiVersion: '2015-08-04'});

/**
 * A barebones client for posting data to an AWS Firehose stream.
 * Usage:
 *   FirehoseClient.putRecord(
 *     'analysis-events',
 *     {
 *       created_at: DateTime.now,           // REQUIRED
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
 *   FirehoseClient.putRecordBatch(
 *     'analysis-events',
 *     [
 *       {
 *         created_at: DateTime.now,           // REQUIRED
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
 *         created_at: DateTime.now,           // REQUIRED
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
export default class FirehoseClient {
  /**
   * Pushes one data record into the delivery stream.
   * @param {string} deliveryStreamName The name of the delivery stream.
   * @param {hash} data The data to push.
   */
  putRecord(deliveryStreamName, data) {
    FIREHOSE.putRecord(
      {
        DeliveryStreamName: deliveryStreamName,
        Record: JSON.stringify(data),
      },
      function (err, data) {
        // TODO(asher): This is here to assist debugging and should be removed
        // when it is no longer useful.
        console.error("Error pushing event data" + err);
      }
    );
  }

  /**
   * Pushes an array of data records into the delivery stream.
   * @param {string} deliveryStreamName The name of the delivery stream.
   * @param {array[hash]} data The data to push.
   */
  putRecordBatch(deliveryStreamName, data) {
    FIREHOSE.putRecordBatch(
      {
        DeliveryStreamName: deliveryStreamName,
        Records: data.map(JSON.stringify),
      },
      function (err, data) {
        if (err) {
          // TODO(asher): This is here to assist debugging and should be removed
          // when it is no longer useful.
          console.error("Error pushing event data" + err);
        }
      }
    );
  }
}
