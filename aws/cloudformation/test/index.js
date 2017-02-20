'use strict';
process.env.SLACK_ENDPOINT = 'xyz';

const LambdaTester = require( 'lambda-tester' );
const nock = require('nock');
const myHandler = require( '../slackCloudWatchEvent' ).handler;

describe( 'handler', ()=> {
  let from=10,
    to=20,
    start = new Date(),
    end = new Date(),
    duration = 10,
    instanceId = 'i-12345678';
  start.setUTCMinutes(start.getUTCMinutes() - duration);
  let failedCause = 'Failed Cause Description';
  let failedStatus = 'Failed Status Message';

  // Ref: http://docs.aws.amazon.com/autoscaling/latest/userguide/cloud-watch-events.html
  let events = {
    launch_lifecycle_action: {
      "version": "0",
      "id": "12345678-1234-1234-1234-123456789012",
      "detail-type": "EC2 Instance-launch Lifecycle Action",
      "source": "aws.autoscaling",
      "account": "123456789012",
      "time": new Date().toISOString(),
      "region": "us-west-2",
      "resources": [
        "auto-scaling-group-arn"
      ],
      "detail": {
        "LifecycleActionToken": "87654321-4321-4321-4321-210987654321",
        "AutoScalingGroupName": "my-asg",
        "LifecycleHookName": "my-lifecycle-hook",
        "EC2InstanceId": instanceId,
        "LifecycleTransition": "autoscaling:EC2_INSTANCE_LAUNCHING"
      }
    },
    launch_successful: {
      "version": "0",
      "id": "12345678-1234-1234-1234-123456789012",
      "detail-type": "EC2 Instance Launch Successful",
      "source": "aws.autoscaling",
      "account": "123456789012",
      "time": new Date().toISOString(),
      "region": "us-west-2",
      "resources": [
        "auto-scaling-group-arn",
        "intance-arn"
      ],
      "detail": {
        "StatusCode": "InProgress",
        "Description": `Launching a new EC2 instance: ${instanceId}`,
        "AutoScalingGroupName": "my-auto-scaling-group",
        "ActivityId": "87654321-4321-4321-4321-210987654321",
        "Details": {
          "Availability Zone": "us-west-2b",
          "Subnet ID": "subnet-12345678"
        },
        "RequestId": "12345678-1234-1234-1234-123456789012",
        "StatusMessage": "",
        "EndTime": end.toISOString(),
        "EC2InstanceId": instanceId,
        "StartTime": start.toISOString(),
        "Cause": `At 2017-02-08T21:57:53Z a user request update of AutoScalingGroup constraints to min: ${to}, max: 180, desired: ${to} changing the desired capacity from ${from} to ${to}. At 2017-02-08T21:58:14Z an instance was started in response to a difference between desired and actual capacity, increasing the capacity from ${from} to ${to}.`,
      }
    },
    launch_unsuccessful: {
      "version": "0",
      "id": "12345678-1234-1234-1234-123456789012",
      "detail-type": "EC2 Instance Launch Unsuccessful",
      "source": "aws.autoscaling",
      "account": "123456789012",
      "time": new Date().toISOString(),
      "region": "us-west-2",
      "resources": [
        "auto-scaling-group-arn",
        "intance-arn"
      ],
      "detail": {
        "StatusCode": "Failed",
        "AutoScalingGroupName": "my-auto-scaling-group",
        "ActivityId": "87654321-4321-4321-4321-210987654321",
        "Details": {
          "Availability Zone": "us-west-2b",
          "Subnet ID": "subnet-12345678"
        },
        "RequestId": "12345678-1234-1234-1234-123456789012",
        "StatusMessage": failedStatus,
        "EndTime": end.toISOString(),
        "EC2InstanceId": instanceId,
        "StartTime": start.toISOString(),
        "Cause": failedCause,
      }
    },
    terminate_lifecycle_action: {
      "version": "0",
      "id": "12345678-1234-1234-1234-123456789012",
      "detail-type": "EC2 Instance-terminate Lifecycle Action",
      "source": "aws.autoscaling",
      "account": "123456789012",
      "time": new Date().toISOString(),
      "region": "us-west-2",
      "resources": [
        "auto-scaling-group-arn"
      ],
      "detail": {
        "LifecycleActionToken":"87654321-4321-4321-4321-210987654321",
        "AutoScalingGroupName":"my-asg",
        "LifecycleHookName":"my-lifecycle-hook",
        "EC2InstanceId": instanceId,
        "LifecycleTransition":"autoscaling:EC2_INSTANCE_TERMINATING"
      }
    },
    terminate_successful: {
      "version": "0",
      "id": "12345678-1234-1234-1234-123456789012",
      "detail-type": "EC2 Instance Terminate Successful",
      "source": "aws.autoscaling",
      "account": "123456789012",
      "time": new Date().toISOString(),
      "region": "us-west-2",
      "resources": [
        "auto-scaling-group-arn",
        "intance-arn"
      ],
      "detail": {
        "StatusCode": "InProgress",
        "Description": "Terminating EC2 instance: i-12345678",
        "AutoScalingGroupName": "my-auto-scaling-group",
        "ActivityId": "87654321-4321-4321-4321-210987654321",
        "Details": {
          "Availability Zone": "us-west-2b",
          "Subnet ID": "subnet-12345678"
        },
        "RequestId": "12345678-1234-1234-1234-123456789012",
        "StatusMessage": "",
        "EndTime": end.toISOString(),
        "EC2InstanceId": instanceId,
        "StartTime": start.toISOString(),
        "Cause": `At 2017-02-08T22:06:16Z instance ${instanceId} was taken out of service in response to a user request, shrinking the capacity from ${to} to ${from}.`,
      }
    },
    terminate_unsuccessful: {
      "version": "0",
      "id": "12345678-1234-1234-1234-123456789012",
      "detail-type": "EC2 Instance Terminate Unsuccessful",
      "source": "aws.autoscaling",
      "account": "123456789012",
      "time": new Date().toISOString(),
      "region": "us-west-2",
      "resources": [
        "auto-scaling-group-arn",
        "intance-arn"
      ],
      "detail": {
        "StatusCode": "Failed",
        "AutoScalingGroupName": "my-auto-scaling-group",
        "ActivityId": "87654321-4321-4321-4321-210987654321",
        "Details": {
          "Availability Zone": "us-west-2b",
          "Subnet ID": "subnet-12345678"
        },
        "RequestId": "12345678-1234-1234-1234-123456789012",
        "StatusMessage": failedStatus,
        "EndTime": end.toISOString(),
        "EC2InstanceId": instanceId,
        "StartTime": start.toISOString(),
        "Cause": failedCause,
      }
    }
  };
  let matchers = {
    launch_lifecycle_action: body => body.text.match(/EC2 Instance Launch/),
    terminate_lifecycle_action: body => body.text.match(/EC2 Instance Terminate/),
    launch_successful: body => {
      let attachment = body.attachments[0];
      return (
        attachment.author_name.match(instanceId) &&
        attachment.fields.find(f=>f.title == 'Capacity').value.match(`.${from}. to .${to}.`) &&
        attachment.fields.find(f=>f.title == 'Duration').value.match(`.${duration}. min`)
      )
    },
    terminate_successful: body => {
      let attachment = body.attachments[0];
      return (
        attachment.author_name.match(instanceId) &&
        attachment.fields.find(f=>f.title == 'Capacity').value.match(`.${to}. to .${from}.`) &&
        attachment.fields.find(f=>f.title == 'Duration').value.match(`.${duration}. min`)
      )
    },
    launch_unsuccessful: body => {
      let attachment = body.attachments[0];
      return (
        attachment.color.match('danger') &&
        attachment.pretext.match(`${instanceId} - EC2 Instance Launch Unsuccessful`) &&
        attachment.fields[0].value.match(`${failedCause}\n${failedStatus}`)
      )
    },
    terminate_unsuccessful: body => {
      let attachment = body.attachments[0];
      return (
        attachment.color.match('danger') &&
        attachment.pretext.match(`${instanceId} - EC2 Instance Terminate Unsuccessful`) &&
        attachment.fields[0].value.match(`${failedCause}\n${failedStatus}`)
      )
    }
  };

  Object.keys(matchers).forEach(matcher => {
    it(events[matcher]['detail-type'], () => {
      let scope = nock('https://hooks.slack.com').
        post(`/services/${process.env.SLACK_ENDPOINT}`, matchers[matcher]).
        reply(200, 'Ok');
      return LambdaTester(myHandler)
        .event(events[matcher])
        .expectResult(result => scope.done());
    });
  });
});
