const response = require("./common/cfn-response");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

/**
 * @param event
 * @param context
 * @param {string} event.RequestType
 * @param {string} event.ResourceProperties.Bucket
 * @param {string} event.ResourceProperties.Key
 * @param {string} event.ResourceProperties.ServiceToken
 */
exports.handler = function (event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  let physicalResourceId = `${event.ResourceProperties.Bucket}/${event.ResourceProperties.Key}`;
  const respond = (e) => response.send(event, context, e ? response.FAILED : response.SUCCESS, e ? e : {}, physicalResourceId);

  const params = event.ResourceProperties;
  delete params.ServiceToken;

  if (event.RequestType === 'Create' || event.RequestType === 'Update') {
    s3.putObject(params).promise()
      .then(data=>respond())
      .catch(e=>respond(e));
  } else if (event.RequestType === 'Delete') {
    const deleteParams = {
      Bucket: event.ResourceProperties.Bucket,
      Key: event.ResourceProperties.Key
    };
    s3.deleteObject(deleteParams).promise()
      .then(data=>respond())
      .catch(e=>respond(e));
  } else {
    respond({Error: 'Invalid request type'});
  }
};
