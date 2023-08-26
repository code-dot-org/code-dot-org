const hbNotify = require("../src/honeybadgerNotify");
const chai = require("chai");
const sinon = require("sinon");
const Honeybadger = require("honeybadger");
const assert = chai.assert;
const expect = chai.expect;

const CLOUDWATCH_ALARM_EVENT = {
  Records: [
    {
      EventSource: "aws:sns",
      EventVersion: "1.0",
      EventSubscriptionArn:
        "arn:aws:sns:eu-west-1:000000000000:cloudwatch-alarms:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      Sns: {
        Type: "Notification",
        MessageId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        TopicArn: "arn:aws:sns:eu-west-1:000000000000:cloudwatch-alarms",
        Subject: 'ALARM: "Example alarm name" in EU - Ireland',
        Message:
          '{"AlarmName":"Example alarm name","AlarmDescription":"Example alarm description.","AWSAccountId":"000000000000","NewStateValue":"ALARM","NewStateReason":"Threshold Crossed: 1 datapoint (10.0) was greater than or equal to the threshold (1.0).","StateChangeTime":"2017-01-12T16:30:42.236+0000","Region":"EU - Ireland","OldStateValue":"OK","Trigger":{"MetricName":"DeliveryErrors","Namespace":"ExampleNamespace","Statistic":"SUM","Unit":null,"Dimensions":[],"Period":300,"EvaluationPeriods":1,"ComparisonOperator":"GreaterThanOrEqualToThreshold","Threshold":1.0}}',
        Timestamp: "2017-01-12T16:30:42.318Z",
        SignatureVersion: "1",
        Signature: "Cg==",
        SigningCertUrl:
          "https://sns.eu-west-1.amazonaws.com/SimpleNotificationService-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.pem",
        UnsubscribeUrl:
          "https://sns.eu-west-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-west-1:000000000000:cloudwatch-alarms:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        MessageAttributes: {}
      }
    }
  ]
};

const CUSTOM_EVENT = {
  Records: [
    {
      EventSource: "aws:sns",
      EventVersion: "1.0",
      EventSubscriptionArn:
        "arn:aws:sns:eu-west-1:000000000000:cloudwatch-alarms:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      Sns: {
        Type: "Notification",
        MessageId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        TopicArn: "arn:aws:sns:eu-west-1:000000000000:cloudwatch-alarms",
        Subject: "some other message",
        Message: '{"name": "custom error", "message": "something wrong"}',
        Timestamp: "2017-01-12T16:30:42.318Z",
        SignatureVersion: "1",
        Signature: "Cg==",
        SigningCertUrl:
          "https://sns.eu-west-1.amazonaws.com/SimpleNotificationService-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.pem",
        UnsubscribeUrl:
          "https://sns.eu-west-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-west-1:000000000000:cloudwatch-alarms:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        MessageAttributes: {}
      }
    }
  ]
};

const MALFORMED_EVENT = "malformed event";

describe("honeybadgerNotify.handler", function() {
  beforeEach(function() {
    sinon.stub(Honeybadger, "notify");
  });

  afterEach(function() {
    Honeybadger.notify.restore();
  });

  it("should notify HoneyBadger with name = AlarmName for Cloudwatch Alarm Events", async () => {
    await hbNotify.handler(CLOUDWATCH_ALARM_EVENT);

    assert(Honeybadger.notify.calledOnce);
    assert.equal(
      Honeybadger.notify.getCall(0).args[0].name,
      "Cloudwatch Alarm fired: Example alarm name"
    );
  });

  it("should notify HoneyBadger passing through all args plus full message for custom events", async () => {
    await hbNotify.handler(CUSTOM_EVENT);

    const expectedArgs = {
      name: "custom error",
      message: "something wrong",
      context: {
        fullMessage: { name: "custom error", message: "something wrong" }
      }
    };

    assert(Honeybadger.notify.calledOnce);
    assert.deepEqual(Honeybadger.notify.getCall(0).args[0], expectedArgs);
  });

  it("should notify HoneyBadger with full event if it's malformed", async () => {
    await hbNotify.handler(MALFORMED_EVENT);

    const expectedHbArgs = {
      name: "Honeybadger Lambda failed to notify",
      context: {
        fullEvent: JSON.stringify(MALFORMED_EVENT)
      }
    };

    const errorArg = Honeybadger.notify.getCall(0).args[0];
    const hbArgs = Honeybadger.notify.getCall(0).args[1];

    assert(Honeybadger.notify.calledOnce);
    expect(errorArg).to.be.an.instanceof(TypeError);
    assert.deepEqual(hbArgs, expectedHbArgs);
  });
});
