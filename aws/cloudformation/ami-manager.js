/**
 * @file AWS Lambda Custom Resource function to manage automatic AMI creation.
 * @see {@link https://blogs.aws.amazon.com/application-management/post/Tx38Z5CAM5WWRXW|Faster Auto Scaling in AWS CloudFormation Stacks with Lambda-backed Custom Resources}
 */

// This module is automatically provided to ZipFile-based Lambda functions.
// Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html#cfn-lambda-function-code-cfnresponsemodule
var response = require('cfn-response');
var AWS = require('aws-sdk');
var ec2 = new AWS.EC2();

/** Takes an AWS CloudFormation stack name and instance id and returns the newly-created AMI ID. **/
exports.handler = function (event, context) {
  console.log("REQUEST RECEIVED:\n", JSON.stringify(event));

  var stackName = event.StackId.split(':').slice(-1)[0].split('/')[1];
  var instanceId = event.ResourceProperties.InstanceId;

  // Optional resource property, default to true.
  var waitImageAvailable = event.ResourceProperties.hasOwnProperty('WaitImageAvailable') ?
    event.ResourceProperties.WaitImageAvailable : true;

  var responseData = event.ResponseData || {};
  var physicalId = event.PhysicalResourceId;

  function error(err, msg) {
    responseData.Error = msg;
    console.log(responseData.Error + ":\n", err);
    response.send(event, context, response.FAILED, responseData, physicalId);
  }

  function success() {
    response.send(event, context, response.SUCCESS, responseData, physicalId);
  }

  // Execute a waiter and recurse if it doesn't complete before the timeout.
  function wait(waiter) {
    try {
      event.waiter = waiter;
      event.responseData = responseData;
      ec2.waitFor(waiter.state, waiter.params, function (err, data) {
        if (err) { error(err, 'error in ' + method);}
        else success();
      });

      setTimeout(function () {
        console.log("Timeout reached, re-executing function");
        var lambda = new AWS.Lambda();
        lambda.invoke({
          FunctionName: context.invokedFunctionArn,
          InvocationType: 'Event',
          Payload: JSON.stringify(event)
        }, function (err, data) {
          if (err) { error(err, 'error in lambda recurse'); }
          else context.done();
        });
      }, context.getRemainingTimeInMillis() - 1000);
    } catch (e) {
      error(e, '');
    }
  }

  // Valid RequestTypes: "Create", "Delete", "Update".
  // Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref-requesttypes.html
  console.log("REQUEST TYPE:", event.RequestType);
  if (event.waiter) {
    wait(event.waiter);
  } else if (event.RequestType == "Delete") {
    var params = {
      ImageIds: [ physicalId ]
    };
    ec2.describeImages(params, function (err, data) {
      if (err) {
        error(err, "DescribeImages call failed");
      } else if (data.Images.length === 0) {
        responseData.Info = "No snapshot to delete";
        success();
      } else if (data.Images.length == 1) {
        var imageId = data.Images[0].ImageId;
        console.log("DELETING:", imageId);
        ec2.deregisterImage({ImageId: imageId}, function (err, data) {
          if (err) {
            error(err, "DeregisterImage call failed");
          } else {
            responseData.ImageId = imageId;
            ec2.describeSnapshots({Filters: [{
              Name: 'description',
              Values: ["*" + imageId + "*"]
            }]}, function (err, data) {
              if (err) {
                error(err, "DescribeSnapshots call failed");
              } else if (data.Snapshots.length === 0) {
                responseData.Info = "No snapshot to delete";
                success();
              } else {
                var snapshotId = data.Snapshots[0].SnapshotId;
                console.log("DELETING SNAPSHOT:", snapshotId);
                ec2.deleteSnapshot({SnapshotId: snapshotId}, function (err, data) {
                  if (err) {
                    error(err, "DeleteSnapshot call failed");
                  } else {
                    success();
                  }
                });
              }
            });
          }
        });
      } else {
        error(null, "DescribeImages returned multiple Images, expected one");
      }
    });
  } else if (event.RequestType == "Create") {
    if (instanceId) {
      ec2.createImage(
        {
          InstanceId: instanceId,
          Name: stackName + '-' + instanceId + '-' + event.RequestId
        }, function (err, data) {
          if (err) {
            error(err, "CreateImage call failed");
          } else {
            var imageId = data.ImageId;
            physicalId = imageId;
            console.log('SUCCESS: ', "ImageId - " + imageId);

            var params = {
              Resources: [imageId],
              Tags: [
                {
                  Key: 'cloudformation:amimanager:stack-name',
                  Value: stackName
                },
                {
                  Key: 'cloudformation:amimanager:stack-id',
                  Value: event.StackId
                },
                {
                  Key: 'cloudformation:amimanager:logical-id',
                  Value: event.LogicalResourceId
                }
              ]
            };
            ec2.createTags(params, function (err, data) {
              if (err) {
                error(err, "Create tags call failed");
              } else {
                responseData.ImageId = imageId;
                if (waitImageAvailable) {
                  wait({
                    state: 'imageAvailable',
                    params: {
                      ImageIds: [ physicalId ]
                    }
                  });
                } else {
                  success();
                }
              }
            });
          }
        }
      );
    } else {
      error(null, "InstanceId not specified");
    }
  } else if (event.RequestType == "Update") {
    if (physicalId) {
      responseData.ImageId = physicalId;
      success();
    } else {
      error(null, "In-place updates not supported");
    }
  } else {
    error(null, "Invalid RequestType: " + event.RequestType);
  }
};
