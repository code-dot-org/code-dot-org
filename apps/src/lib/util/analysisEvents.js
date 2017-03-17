/** @file Sends event data through our analysis pipeline and ultimately into Redshift. */

import AWS from 'aws-sdk';

AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:fbfec393-0afb-4682-84d4-59ad04a302f4',
});
const FIREHOSE = new AWS.Firehose({apiVersion: '2015-08-04'});

export default class AnalysisEvents {
  constructor(deliveryStreamName, sendInterval) {
    this.dataQueue_ = [];
    this.deliveryStreamName_ = deliveryStreamName;
    this.sendInterval_ = sendInterval;
    this.intervalID_ = setInterval(this.sendQueuedData_.bind(this), this.sendInterval_);
  }

  log(data) {
    this.dataQueue_.push(this.processRecord_(data));
  }

  processRecord_(data) {
    return {
      Data: JSON.stringify(
        {
          created_at: data.created_at || "2017-03-16T15:24:25.796+00:00",
          environment: data.environment || "eric",
          study: data.study || "eric-javascript",
          event: data.event || "put_method",
          data_int: data.data_int
        }
      )
    };
  }

  sendQueuedData_() {
    if (!this.dataQueue_.length) {
      return;
    }

    FIREHOSE.putRecordBatch({
      Records: this.dataQueue_,
      DeliveryStreamName: this.deliveryStreamName_
    }, function (err, data) {
      if (err) {
        console.error("Error pushing event data" + err);
        // TODO: we should really put the failed data into a retry buffer, and back off before retrying
        // Note that there may be situations where only some data fails to send.
      } else {
        console.log("Pushed event data, got response: " + JSON.stringify(data));
      }
    });
    this.dataQueue_ = [];
  }
}
