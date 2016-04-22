var response = require('cfn-response');
/** Takes an AWS CloudFormation stack name and instance id and returns the newly-created AMI ID. **/
exports.handler = function (event, context) {
  console.log("REQUEST RECEIVED:\n", JSON.stringify(event));

  var stackName = event.ResourceProperties.StackName;
  var instanceId = event.ResourceProperties.InstanceId;
  var instanceRegion = event.ResourceProperties.Region;

  var responseStatus = "FAILED";
  var responseData = {};
  var physicalId = event.PhysicalResourceId;

  function error(err, msg) {
    responseData = {Error: msg};
    console.log(responseData.Error + ":\n", err);
    response.send(event, context, responseStatus, responseData, physicalId);
  }

  var AWS = require("aws-sdk");
  var ec2 = new AWS.EC2({region: instanceRegion});

  console.log("REQUEST TYPE:", event.RequestType);
  if (event.RequestType == "Delete") {
    var params = {
      ImageIds: [ event.PhysicalResourceId ]
    };
    ec2.describeImages(params, function (err, data) {
      if (err) {
        error(err, "DescribeImages call failed");
      } else if (data.Images.length === 0) {
        response.send(event, context, "SUCCESS", {Info: "Nothing to delete"});
      } else {
        var imageId = data.Images[0].ImageId;
        console.log("DELETING:", data.Images[0]);
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
              } else if (data.Images.length === 0) {
                response.send(event, context, "SUCCESS", {Info: "No snapshot to delete"});
              } else {
                ec2.deleteSnapshot({SnapshotId: data.Snapshots[0].SnapshotId}, function (err, data) {
                  if (err) {
                    error(err, "DeleteSnapshot call failed");
                  } else {
                    responseStatus = "SUCCESS";
                    response.send(event, context, responseStatus, responseData, imageId);
                  }
                });
              }
            });
          }
        });
      }
    });
    return;
  }

  if (stackName && instanceId && instanceRegion) {
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
              responseStatus = "SUCCESS";
              responseData.ImageId = imageId;
              response.send(event, context, responseStatus, responseData, imageId);
            }
          });
        }
      }
    );
  } else {
    error(null, "StackName, InstanceId or InstanceRegion not specified");
  }
};
