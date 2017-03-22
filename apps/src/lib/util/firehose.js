/** @file Provides clients to AWS Firehose, whose data is imported into AWS Redshift. */

import $ from 'jquery';

// Commented out: Cognito configuration
// TODO(eric): delete if/when we are sure we will not use Cognito
// const IDENTITY_POOL_ID = 'us-east-1:fbfec393-0afb-4682-84d4-59ad04a302f4';
// const AWS_REGION = 'us-east-1';
//
// AWS.config.region = AWS_REGION;
// AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//   IdentityPoolId: IDENTITY_POOL_ID,
// });
// const FIREHOSE = new AWS.Firehose({apiVersion: '2015-08-04'});

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
    }).done(function (response) {
      // need to do anything here?
    }).fail(function (xhr) {
      // console.error("Failure sending Firehose data: " + JSON.stringify(xhr));
    });

    // Commented out - this required AWS Cognito
    // TODO(eric): delete if/when we are sure we will not use Cognito
    // FIREHOSE.putRecord(
    //   {
    //     DeliveryStreamName: deliveryStreamName,
    //     Record: {
    //       Data: JSON.stringify(data),
    //     },
    //   },
    //   function (err, data) {
    //     if (err) {
    //       // TODO(asher): This is here to assist debugging and should be removed
    //       // when it is no longer useful.
    //       console.error("Error pushing event data" + err);
    //     }
    //   }
    // );
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
    }).done(function (response) {
    }).fail(function (xhr) {
    });
    // FIREHOSE.putRecordBatch(
    //   {
    //     DeliveryStreamName: deliveryStreamName,
    //     Records: {
    //       Data: data.map(JSON.stringify),
    //     },
    //   },
    //   function (err, data) {
    //     if (err) {
    //       // TODO(asher): This is here to assist debugging and should be removed
    //       // when it is no longer useful.
    //       console.error("Error pushing event data" + err);
    //     }
    //   }
    // );
  }
}

const firehoseClient = new FirehoseClient();

export default firehoseClient;
