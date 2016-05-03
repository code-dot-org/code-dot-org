/**
 * @file AWS Lambda Custom Resource function to manage CloudFormation stack cross-references,
 *       enabling a layered or service-oriented architecture by creating related AWS resources
 *       in individual stacks instead of including all resources in a single stack.
 * @see {@link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/walkthrough-custom-resources-lambda-cross-stack-ref.html|Walkthrough: Refer to Resources in Another Stack}
 */

// This module is automatically provided to ZipFile-based Lambda functions.
// Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html#cfn-lambda-function-code-cfnresponsemodule
var response = require('cfn-response');

function parseJson(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

exports.handler = function (event, context) {
  console.log('REQUEST RECEIVED:\\n', JSON.stringify(event));
  if (event.RequestType == 'Delete') {
    response.send(event, context, response.SUCCESS);
    return;
  }
  var stackName = event.ResourceProperties.StackName;
  var responseData = {};
  if (stackName) {
    var aws = require('aws-sdk');
    var cfn = new aws.CloudFormation();
    cfn.describeStacks({StackName: stackName}, function (err, data) {
      if (err) {
        responseData = {Error: 'DescribeStacks call failed'};
        console.log(responseData.Error + ':\\n', err);
        response.send(event, context, response.FAILED, responseData);
      }
      else {
        data.Stacks[0].Outputs.forEach(function (output) {
          responseData[output.OutputKey] = parseJson(output.OutputValue);
        });
        response.send(event, context, response.SUCCESS, responseData);
      }
    });
  } else {
    responseData = {Error: 'Stack name not specified'};
    console.log(responseData.Error);
    response.send(event, context, response.FAILED, responseData);
  }
};
