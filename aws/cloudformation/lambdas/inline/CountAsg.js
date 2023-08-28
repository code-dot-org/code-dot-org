// Custom CloudFormation Resource that dynamically retrieves the current
// instance min, max and desired capacity counts in an Auto Scaling Group,
// returning the outputs for use elsewhere in the stack.

var response = require('./cfn-response');
var AWS = require('aws-sdk');

function convertToAssocTags(tags) {
  var assocTags = {};
  tags.forEach(tag => {
    assocTags[tag.Key] = tag.Value;
  });
  return assocTags;
}

function findAutoScalingGroupByTags(tags, callback) {
  /**
   * Return true if all key/value pairs in `a` are present in `b`
   */
  const match = (a, b) => {
    Object.keys(a).forEach(function(key) {
      if (a[key] != b[key]) {
        return false;
      }
    });
    return true;
  };

  const autoscaling = new AWS.AutoScaling();
  autoscaling.describeAutoScalingGroups({}, function(err, data) {
    let result = {};
    if (err) {
      callback(err, data);
    } else {
      data.AutoScalingGroups.forEach(item => {
        if (match(tags, convertToAssocTags(item.Tags))) {
          result = {
            MinSize: item.MinSize,
            MaxSize: item.MaxSize,
            DesiredCapacity: item.DesiredCapacity
          };
        }
      });
      callback(null, result);
    }
  })
}

exports.handler = (event, context) => {
  console.log('REQUEST RECEIVED:\n', JSON.stringify(event));
  
  const tags = event.ResourceProperties?.AutoScalingGroupTags;
  if (!tags) {
    response.send(event, context, response.SUCCESS, {
      Error: "No AutoScalingGroupTags found"
    });
    return;
  }
  
  const defaultCount = event.ResourceProperties.Default || {MinSize: 1, MaxSize: 10, DesiredCapacity: 1};

  if (event.RequestType == 'Create' || event.RequestType == 'Update') {
    findAutoScalingGroupByTags(convertToAssocTags(tags), (err, result) => {
      let responseData = {}

      if (err) {
        responseData.Error = 'No AutoScalingGroup found';
        responseData.OriginalError = err;
        result = defaultCount;
      }

      responseData.MinSize = result.MinSize;
      responseData.MaxSize = result.MaxSize;
      responseData.DesiredCapacity = result.DesiredCapacity;
      response.send(event, context, response.SUCCESS, responseData);
      return;
    });
  } else {
    // The other RequestType is Delete, which is a no-op
    response.send(event, context, response.SUCCESS);
    return;
  }
};
