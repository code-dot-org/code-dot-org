/**
 * @file AWS Lambda Custom Resource function to manage automatic AMI creation.
 * @see {@link https://blogs.aws.amazon.com/application-management/post/Tx38Z5CAM5WWRXW|Faster Auto Scaling in AWS CloudFormation Stacks with Lambda-backed Custom Resources}
 */

// This module is automatically provided to ZipFile-based Lambda functions.
// Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html#cfn-lambda-function-code-cfnresponsemodule
var response = require('cfn-response');
var {
  CreateImageCommand,
  CreateTagsCommand,
  DeleteSnapshotCommand,
  DeregisterImageCommand,
  DescribeImagesCommand,
  DescribeSnapshotsCommand,
  EC2Client,
  waitUntilImageAvailable,
  waitUntilInstanceStopped
} = require('@aws-sdk/client-ec2');
var {InvokeCommand, LambdaClient} = require('@aws-sdk/client-lambda');
var ec2 = new EC2Client({});
var lambda = new LambdaClient({});

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

  // Execute a waiter, and recurse if it doesn't complete before the timeout.
  function wait(waiter) {
    try {
      event.waiter = waiter;
      event.ResponseData = responseData;
      event.PhysicalResourceId = physicalId;
      var currentlyWaiting = true;
      var waitFn;
      var timer;
      if (waiter.state === 'imageAvailable') {
        waitFn = waitUntilImageAvailable;
      } else if (waiter.state === 'instanceStopped') {
        waitFn = waitUntilInstanceStopped;
      } else {
        error(null, 'unsupported waiter state: ' + waiter.state);
        return;
      }

      waitFn({
        client: ec2,
        maxWaitTime: Math.max(1, Math.floor(
          (context.getRemainingTimeInMillis() - 5000) / 1000
        ))
      }, waiter.params).then(function (data) {
        if (currentlyWaiting) {
          if (timer) clearTimeout(timer);
          success();
        } else {
          console.log("No longer waiting:", data);
        }
      }).catch(function (err) {
        if (currentlyWaiting) {
          if (timer) clearTimeout(timer);
          error(err, 'error waiting for ' + waiter.state);
        } else {
          console.log("No longer waiting:", err);
        }
      });

      timer = setTimeout(function () {
        console.log("Timeout reached, re-executing function. Params:\n", JSON.stringify(event));
        currentlyWaiting = false;
        lambda.send(new InvokeCommand({
          FunctionName: context.invokedFunctionArn,
          InvocationType: 'Event',
          Payload: JSON.stringify(event)
        })).then(function () {
          context.done();
        }).catch(function (err) {
          if (err) { error(err, 'error in lambda recurse'); }
        });
      }, context.getRemainingTimeInMillis() - 5000);
    } catch (e) {
      error(e, '');
    }
  }

  // Valid RequestTypes: "Create", "Delete", "Update".
  // Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref-requesttypes.html
  console.log("REQUEST TYPE:", event.RequestType);
  if (event.waiter) {
    ec2.send(new DescribeImagesCommand({ImageIds: [physicalId]})).then(function (data) {
      if (data.Images.length === 0) {
        error(null, "Image not found");
      } else {
        wait(event.waiter);
      }
    }).catch(function (err) {
        error(err, "DescribeImages call failed");
    });
  } else if (event.RequestType == "Delete") {
    if (physicalId.indexOf('ami-') !== 0) {
      responseData.Info = "No image to delete";
      success();
      return;
    }
    var params = {
      ImageIds: [ physicalId ]
    };
    ec2.send(new DescribeImagesCommand(params)).then(function (data) {
      if (data.Images.length === 0) {
        responseData.Info = "No snapshot to delete";
        success();
      } else if (data.Images.length == 1) {
        var imageId = data.Images[0].ImageId;
        console.log("DELETING:", imageId);
        ec2.send(new DeregisterImageCommand({ImageId: imageId})).catch(function (err) {
          error(err, "DeregisterImage call failed");
          return false;
        }).then(function (deregistered) {
          if (deregistered === false) {
            return null;
          }
          responseData.ImageId = imageId;
          return ec2.send(new DescribeSnapshotsCommand({Filters: [{
            Name: 'description',
            Values: ["*" + imageId + "*"]
          }]})).catch(function (err) {
            error(err, "DescribeSnapshots call failed");
            return null;
          });
        }).then(function (data) {
          if (!data) {
            return;
          }
          if (data.Snapshots.length === 0) {
            responseData.Info = "No snapshot to delete";
            success();
          } else {
            var snapshotId = data.Snapshots[0].SnapshotId;
            console.log("DELETING SNAPSHOT:", snapshotId);
            ec2.send(new DeleteSnapshotCommand({SnapshotId: snapshotId})).then(function () {
              success();
            }).catch(function (err) {
              error(err, "DeleteSnapshot call failed");
            });
          }
        });
      } else {
        error(null, "DescribeImages returned multiple Images, expected one");
      }
    }).catch(function (err) {
        error(err, "DescribeImages call failed");
    });
  } else if (event.RequestType == "Create") {
    if (instanceId) {
      // Wait for instance to reach the 'stopped' state before creating image.
      waitUntilInstanceStopped({client: ec2}, {InstanceIds: [instanceId]}).then(function () {
        var imageParams = {
          InstanceId: instanceId,
          Name: stackName + '-' + instanceId + '-' + event.RequestId
        };
        ec2.send(new CreateImageCommand(imageParams)).then(function (data) {
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
          ec2.send(new CreateTagsCommand(params)).then(function () {
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
          }).catch(function (err) {
            error(err, "Create tags call failed");
          });
        }).catch(function (err) {
          // An error-retry call may happen during the wait operation,
          // so just continue to wait for the AMI to be available.
          if (
            waitImageAvailable &&
            (err.code || err.name) == 'InvalidAMIName.Duplicate'
          ) {
            physicalId = err.message.match('already in use by AMI (.*)')[1];
            responseData.ImageId = physicalId;
            wait({state: 'imageAvailable', params: { ImageIds: [ physicalId ]}});
          } else {
            error(err, "CreateImage call failed");
          }
        });
      }).catch(function (err) {
          error(err, "waitFor instanceStopped failed");
      });
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
