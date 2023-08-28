const response = require("./cfn-response");
const AWS = require("aws-sdk");


exports.handler = async function (event, context) {
  const s3 = new AWS.S3();

  // if event.RequestType is not Create, Update, or Delete, send FAILED
  if (!['Create', 'Update', 'Delete'].includes(event.RequestType)) {
    response.send(event, context, response.FAILED, {Error: 'Invalid request type'});
    return;
  }

  // If required parameters are not specified, send FAILED
  if (!event.ResourceProperties.Bucket || !event.ResourceProperties.Key) {
    response.send(event, context, response.FAILED, {Error: 'Bucket and Key are required'});
    return;
  }

  const requestParameters = {
    Bucket: event.ResourceProperties.Bucket,
    Key: event.ResourceProperties.Key
  }
  const physicalResourceId = `${event.ResourceProperties.Bucket}/${event.ResourceProperties.Key}`;

  if (event.RequestType === 'Create' || event.RequestType === 'Update') {
    try{
      await s3.putObject(requestParameters).promise()
      response.send(event, context, response.SUCCESS, {}, physicalResourceId)
    } catch (e) {
      response.send(event, context, response.FAILED, e);
    }
  } else if (event.RequestType === 'Delete') {
    try {
      await s3.deleteObject(requestParameters).promise();
      response.send(event, context, response.SUCCESS, {}, physicalResourceId)
    } catch (e) {
      response.send(event, context, response.FAILED, e);
    }
  }
};

/**
 * @param event
 * @param context
 * @param {string} event.RequestType
 * @param {string} event.ResourceProperties.Bucket
 * @param {string} event.ResourceProperties.Key
 * @param {string} event.ResourceProperties.ServiceToken
 */
exports.handlerOld = function (event, context) {
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
