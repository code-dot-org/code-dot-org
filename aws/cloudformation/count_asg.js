var response = require('cfn-response');
var AWS = require('aws-sdk');
var autoscaling = new AWS.AutoScaling();

exports.handler = function (event, context) {
  console.log('REQUEST RECEIVED:\\n', JSON.stringify(event));
  if (event.RequestType == 'Delete') {
    response.send(event, context, response.SUCCESS);
    return;
  }

  var name = event.ResourceProperties.AutoScalingGroupName || errorExit('No AutoScalingGroupName found', event, context);
  var defaultCount = event.ResourceProperties.Default || 0;

  var responseData = {};

  var findAutoScalingGroupByName = function(name, callback) {
    var result = 0;
    autoscaling.describeAutoScalingGroups({
      AutoScalingGroupNames: [name]
    }, function(err, data) {
      if (err) {
        callback(err, data);
      } else {
        if (data.AutoScalingGroups.length < 1) {
          callback('No AutoScalingGroup found', 0);
        } else {
          var count = 0;
          data.AutoScalingGroups[0].Instances.forEach(function(instance) {
            if (instance.LifecycleState == 'InService') {
              count++;
            }
          });
          callback(null, count);
        }
      }
    })
  };

  if (event.RequestType == 'Create' || event.RequestType == 'Update') {
    findAutoScalingGroupByName(name, function(err, result) {
      if (err) {
        responseData.Error = 'No AutoScalingGroup found';
        responseData.OriginalError = err;
        result = defaultCount;
      }
      responseData.Count = result;
      response.send(event, context, response.SUCCESS, responseData);
    });
  } else {
    response.send(event, context, response.SUCCESS, responseData);
  }
};

var errorExit = function (message, event, context) {
  responseData = {Error: message};
  console.log(responseData.Error);
  response.send(event, context, response.FAILED, responseData);
};
