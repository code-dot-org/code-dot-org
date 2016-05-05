/**
 * @file AWS Lambda Custom Resource function to enable ClassicLink in a VPC.
 * @see {@link http://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_EnableVpcClassicLink.html}
 * @see {@link http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#enableVpcClassicLink-property}
 */

// This module is automatically provided to ZipFile-based Lambda functions.
// Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html#cfn-lambda-function-code-cfnresponsemodule
var response = require('cfn-response');

/** Takes a VPC ID and enables ClassicLink. **/
exports.handler = function (event, context) {
  console.log("REQUEST RECEIVED:\n", JSON.stringify(event));

  var vpcId = event.ResourceProperties.VpcId;

  // Additionally enable DNS hostname resolution if the `DnsSupport` property is `true`.
  var dnsSupport = event.ResourceProperties.DnsSupport;
  var params = {
    VpcId: vpcId
  };

  var responseData = {};
  var physicalId = event.PhysicalResourceId || (vpcId + ':ClassicLink');

  function error(err, msg) {
    responseData = {Error: msg};
    console.log(responseData.Error + ":\n", err);
    response.send(event, context, response.FAILED, responseData, physicalId);
  }

  var AWS = require("aws-sdk");
  var ec2 = new AWS.EC2();

  // Valid RequestTypes: "Create", "Delete", "Update".
  // Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref-requesttypes.html
  console.log("REQUEST TYPE:", event.RequestType);
  if (event.RequestType == "Delete") {
    ec2.disableVpcClassicLink(params, function (err, data) {
      if (err) {
        error(err, "DisableVpcClassicLink call failed");
      } else {
        response.send(event, context, response.SUCCESS, responseData, physicalId);
      }
    });
  } else if (event.RequestType == "Update" || event.RequestType == "Create") {
    if (vpcId) {
      ec2.enableVpcClassicLink(params, function (err, data) {
        if (err) {
          error(err, "EnableVpcClassicLink call failed");
        } else {
          if (dnsSupport) {
            ec2.enableVpcClassicLinkDnsSupport(params, function (err, data) {
              if (err) {
                error(err, "EnableVpcClassicLinkDnsSupport call failed");
              } else {
                response.send(event, context, response.SUCCESS, responseData, physicalId);
              }
            });
          } else {
            ec2.disableVpcClassicLinkDnsSupport(params, function (err, data) {
              if (err) {
                error(err, "DisableVpcClassicLinkDnsSupport call failed");
              } else {
                response.send(event, context, response.SUCCESS, responseData, physicalId);
              }
            });
          }
        }
      });
    } else {
      error(null, "VpcId not specified");
    }
  } else {
    error(null, "Invalid RequestType: " + event.RequestType);
  }
};
