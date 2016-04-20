// Lambda function for missing CloudFront properties.
// TODO remove once CloudFormation adds support for CloudFront ACM.
exports.handler = function(event, context) {
  var response = require('cfn-response');
  console.log('REQUEST RECEIVED:\\n', JSON.stringify(event));
  var props = event.ResourceProperties;
  var distributionId = props.DistributionId;
  var cert = props.ViewerCertificate;
  var oldCert = props.OldViewerCertificate;
  var protocols = props.Protocols;
  var oldProtocols = props.OldProtocols;
  var physicalId = 'cloudfront:' + distributionId;
  var responseData = {};
  if (distributionId && cert && oldCert && protocols && oldProtocols) {
    oldCert['CloudFrontDefaultCertificate'] = JSON.parse(oldCert['CloudFrontDefaultCertificate']);
    var AWS = require('aws-sdk');
    var cloudfront = new AWS.CloudFront();
    cloudfront.getDistributionConfig({Id: distributionId}, function(err, data) {
      if (err) {
        console.log('getDistributionConfig failed:\\n', err);
        response.send(event, context, response.FAILED, responseData);
      }
      else {
        var etag = data.ETag;
        var config = data.DistributionConfig;
        config['ViewerCertificate'] = event.RequestType == 'Delete' ? oldCert : cert;
        config['Origins']['Items'][0]['CustomOriginConfig']['OriginSslProtocols'] =
          event.RequestType == 'Delete' ? oldProtocols : protocols;
        cloudfront.updateDistribution({
          Id: distributionId,
          DistributionConfig: config,
          IfMatch: etag
        }, function(err, data) {
          if (err) {
            console.log('updateDistribution call failed:\\n', err);
            response.send(event, context, response.FAILED, responseData);
          }
          response.send(event, context, response.SUCCESS, responseData, physicalId);
        });
      }
    });
  } else {
    console.log('Required properties not specified');
    response.send(event, context, response.FAILED, responseData);
  }
};
