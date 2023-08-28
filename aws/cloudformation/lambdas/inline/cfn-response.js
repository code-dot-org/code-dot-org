// This is a local copy of the cfn-response module.
//
// When you use the ZipFile property to specify your function's source code and
// that function interacts with an AWS CloudFormation custom resource, you can
// load the cfn-response module to send responses to those resources. You must
// include the module via `var response = require('cfn-response');` in order for
// CloudFormation to correctly include the module.
//
// See: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-lambda-function-code-cfnresponsemodule.html

exports.SUCCESS = "SUCCESS";
exports.FAILED = "FAILED";

exports.send = function(event, context, responseStatus, responseData, physicalResourceId, message) {
  physicalResourceId = physicalResourceId || context.logStreamName;

  // If this lambda function does not have permissions to CloudWatch Logs
  // a PhysicalResourceId is still needed to send to CloudFormation.
  if (event.RequestType === 'Create' && responseStatus === exports.FAILED) {
    physicalResourceId = physicalResourceId || exports.FAILED;
  }

  var responseBody = JSON.stringify({
    Status: responseStatus,
    Reason: message || "See the details in CloudWatch Log Stream: " + context.logStreamName,
    PhysicalResourceId: physicalResourceId,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: responseData
  });

  console.log("Response body:\n", responseBody);

  var https = require("https");
  var url = require("url");

  var parsedUrl = url.parse(event.ResponseURL);
  var options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: "PUT",
    headers: {
      "content-type": "",
      "content-length": responseBody.length
    }
  };

  var request = https.request(options, function(response) {
    console.log("Status code: " + response.statusCode);
    console.log("Status message: " + response.statusMessage);
    context.done();
  });

  request.on("error", function(error) {
    console.log("send(..) failed executing https.request(..): " + error);
    context.done();
  });

  request.write(responseBody);
  request.end();
};
