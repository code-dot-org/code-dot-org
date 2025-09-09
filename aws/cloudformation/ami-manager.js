/**
 * @file AWS Lambda Custom Resource function to manage automatic AMI creation.
 * @see {@link https://blogs.aws.amazon.com/application-management/post/Tx38Z5CAM5WWRXW|Faster Auto Scaling in AWS CloudFormation Stacks with Lambda-backed Custom Resources}
 */

// AWS SDK v3 imports
const { EC2Client, DescribeImagesCommand, DeregisterImageCommand, DescribeSnapshotsCommand, 
        DeleteSnapshotCommand, CreateImageCommand, CreateTagsCommand } = require('@aws-sdk/client-ec2');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

// This module is automatically provided to ZipFile-based Lambda functions.
// Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html#cfn-lambda-function-code-cfnresponsemodule
const response = require('./cfn-response');

const ec2Client = new EC2Client({});
const lambdaClient = new LambdaClient({});

/** Takes an AWS CloudFormation stack name and instance id and returns the newly-created AMI ID. **/
exports.handler = async function (event, context) {
  console.log("REQUEST RECEIVED:\n", JSON.stringify(event));

  const stackName = event.StackId.split(':').slice(-1)[0].split('/')[1];
  const instanceId = event.ResourceProperties.InstanceId;

  // Optional resource property, default to true.
  const waitImageAvailable = event.ResourceProperties.hasOwnProperty('WaitImageAvailable') ?
    event.ResourceProperties.WaitImageAvailable : true;

  let responseData = event.ResponseData || {};
  let physicalId = event.PhysicalResourceId;

  function error(err, msg) {
    responseData.Error = msg;
    console.log(responseData.Error + ":\n", err);
    response.send(event, context, response.FAILED, responseData, physicalId);
  }

  function success() {
    response.send(event, context, response.SUCCESS, responseData, physicalId);
  }

  // Execute a waiter, and recurse if it doesn't complete before the timeout.
  async function wait(waiter) {
    try {
      event.waiter = waiter;
      event.ResponseData = responseData;
      event.PhysicalResourceId = physicalId;
      let currentlyWaiting = true;
      let timer;

      // Use polling instead of waitFor (which is deprecated in SDK v3)
      const pollForState = async () => {
        try {
          const command = new DescribeImagesCommand(waiter.params);
          const data = await ec2Client.send(command);
          
          if (waiter.state === 'imageAvailable') {
            const image = data.Images[0];
            if (image && image.State === 'available') {
              if (currentlyWaiting) {
                if (timer) clearTimeout(timer);
                success();
              }
              return;
            }
          }
          
          // Continue polling if not ready
          if (currentlyWaiting) {
            setTimeout(pollForState, 15000); // Poll every 15 seconds
          }
        } catch (err) {
          if (currentlyWaiting) {
            if (timer) clearTimeout(timer);
            error(err, 'error waiting for ' + waiter.state);
          }
        }
      };

      pollForState();

      timer = setTimeout(async () => {
        console.log("Timeout reached, re-executing function. Params:\n", JSON.stringify(event));
        currentlyWaiting = false;
        try {
          const invokeCommand = new InvokeCommand({
            FunctionName: context.invokedFunctionArn,
            InvocationType: 'Event',
            Payload: JSON.stringify(event)
          });
          await lambdaClient.send(invokeCommand);
          context.done();
        } catch (err) {
          error(err, 'error in lambda recurse');
        }
      }, context.getRemainingTimeInMillis() - 5000);
    } catch (e) {
      error(e, '');
    }
  }

  try {
    // Valid RequestTypes: "Create", "Delete", "Update".
    // Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref-requesttypes.html
    console.log("REQUEST TYPE:", event.RequestType);
    
    if (event.waiter) {
      try {
        const command = new DescribeImagesCommand({ImageIds: [ physicalId ]});
        const data = await ec2Client.send(command);
        if (data.Images.length === 0) {
          error(null, "Image not found");
        } else {
          await wait(event.waiter);
        }
      } catch (err) {
        error(err, "DescribeImages call failed");
      }
    } else if (event.RequestType === "Delete") {
      if (physicalId.indexOf('ami-') !== 0) {
        responseData.Info = "No image to delete";
        success();
        return;
      }
      
      try {
        const describeCommand = new DescribeImagesCommand({ImageIds: [ physicalId ]});
        const data = await ec2Client.send(describeCommand);
        
        if (data.Images.length === 0) {
          responseData.Info = "No snapshot to delete";
          success();
        } else if (data.Images.length === 1) {
          const imageId = data.Images[0].ImageId;
          console.log("DELETING:", imageId);
          
          const deregisterCommand = new DeregisterImageCommand({ImageId: imageId});
          await ec2Client.send(deregisterCommand);
          
          responseData.ImageId = imageId;
          
          const snapshotsCommand = new DescribeSnapshotsCommand({
            Filters: [{
              Name: 'description',
              Values: ["*" + imageId + "*"]
            }]
          });
          const snapshotsData = await ec2Client.send(snapshotsCommand);
          
          if (snapshotsData.Snapshots.length === 0) {
            responseData.Info = "No snapshot to delete";
            success();
          } else {
            const snapshotId = snapshotsData.Snapshots[0].SnapshotId;
            console.log("DELETING SNAPSHOT:", snapshotId);
            
            const deleteSnapshotCommand = new DeleteSnapshotCommand({SnapshotId: snapshotId});
            await ec2Client.send(deleteSnapshotCommand);
            success();
          }
        } else {
          error(null, "DescribeImages returned multiple Images, expected one");
        }
      } catch (err) {
        error(err, "Delete operation failed");
      }
    } else if (event.RequestType === "Create") {
      if (!instanceId) {
        error(null, "InstanceId not specified");
        return;
      }

      try {
        // Wait for instance to reach the 'stopped' state before creating image.
        // Poll for instance state since waitFor is deprecated
        const waitForInstanceStopped = async () => {
          const { DescribeInstancesCommand } = require('@aws-sdk/client-ec2');
          
          const pollInstance = async () => {
            try {
              const command = new DescribeInstancesCommand({InstanceIds: [instanceId]});
              const data = await ec2Client.send(command);
              
              if (data.Reservations.length > 0 && data.Reservations[0].Instances.length > 0) {
                const instance = data.Reservations[0].Instances[0];
                if (instance.State.Name === 'stopped') {
                  return true;
                }
              }
              
              // Continue polling
              await new Promise(resolve => setTimeout(resolve, 15000));
              return await pollInstance();
            } catch (err) {
              throw err;
            }
          };
          
          return await pollInstance();
        };

        await waitForInstanceStopped();

        const imageParams = {
          InstanceId: instanceId,
          Name: stackName + '-' + instanceId + '-' + event.RequestId
        };
        
        try {
          const createImageCommand = new CreateImageCommand(imageParams);
          const data = await ec2Client.send(createImageCommand);
          
          const imageId = data.ImageId;
          physicalId = imageId;
          console.log('SUCCESS: ', "ImageId - " + imageId);

          const tagParams = {
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
          
          const createTagsCommand = new CreateTagsCommand(tagParams);
          await ec2Client.send(createTagsCommand);
          
          responseData.ImageId = imageId;
          if (waitImageAvailable) {
            await wait({
              state: 'imageAvailable',
              params: {
                ImageIds: [ physicalId ]
              }
            });
          } else {
            success();
          }
        } catch (err) {
          // An error-retry call may happen during the wait operation,
          // so just continue to wait for the AMI to be available.
          if (waitImageAvailable && err.name === 'InvalidAMIName.Duplicate') {
            physicalId = err.message.match('already in use by AMI (.*)')[1];
            responseData.ImageId = physicalId;
            await wait({state: 'imageAvailable', params: { ImageIds: [ physicalId ]}});
          } else {
            error(err, "CreateImage call failed");
          }
        }
      } catch (err) {
        error(err, "waitFor instanceStopped failed");
      }
    } else if (event.RequestType === "Update") {
      if (physicalId) {
        responseData.ImageId = physicalId;
        success();
      } else {
        error(null, "In-place updates not supported");
      }
    } else {
      error(null, "Invalid RequestType: " + event.RequestType);
    }
  } catch (err) {
    error(err, "Unexpected error in handler");
  }
};
