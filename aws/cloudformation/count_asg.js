var response = require('cfn-response');
var AWS = require('aws-sdk');
var autoscaling = new AWS.AutoScaling();

exports.handler = function (event, context) {
  console.log('REQUEST RECEIVED:\\n', JSON.stringify(event));
  if (event.RequestType == 'Delete') {
    response.send(event, context, response.SUCCESS);
    return;
  }

  var tags = event.ResourceProperties.AutoScalingGroupTags || errorExit('No AutoScalingGroupTags found', event, context);
  var defaultCount = event.ResourceProperties.Default || 0;

  var responseData = {};

  var findAutoScalingGroupByTags = function(tags, callback) {
    var result = -1;
    autoscaling.describeAutoScalingGroups({}, function(err, data) {
      if (err) {
        callback(err, data);
      } else {
        data.AutoScalingGroups.forEach(function (item) {
          if (match(tags, convertToAssocTags(item.Tags))) {
            var count = 0;
            item.Instances.forEach(function(instance) {
              if (instance.LifecycleState == 'InService') {
                count++;
              }
            });
            result = Math.max(count, result);
          }
        });
        if (result == -1) {
          result = defaultCount;
        }
        callback(null, result);
      }
    })
  };

  var match = function(a, b) {
    var match = true;
    Object.keys(a).forEach(function(key) {
      if (a[key] != b[key]) {
        match = false;
      }
    });
    return match;
  };

  var convertToAssocTags = function (tags) {
    var assocTags = {};
    tags.forEach(function(tag) {
      assocTags[tag.Key] = tag.Value;
    });
    return assocTags;
  };


  if (event.RequestType == 'Create' || event.RequestType == 'Update') {
    findAutoScalingGroupByTags(convertToAssocTags(tags), function(err, result) {
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
