const response = require("cfn-response");
const AWS = require("aws-sdk");
const glue = new AWS.Glue();

/**
 * @param event
 * @param context
 * @param {string} event.RequestType
 * @param {string} event.ResourceProperties.Configuration
 * @param {string} event.ResourceProperties.CrawlerName
 * @param {string} event.ResourceProperties.ServiceToken
 */
exports.handler = function (event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  let physicalResourceId = event.ResourceProperties.CrawlerName;
  const respond = (e) => response.send(event, context, e ? response.FAILED : response.SUCCESS, e ? e : {}, physicalResourceId);
  process.on('uncaughtException', e=>respond(e));
  try {
    let configuration = (event.RequestType === 'Create' || event.RequestType === 'Update') ?
      event.ResourceProperties.Configuration :
      {};
    if (configuration.Version) {
      configuration.Version = parseFloat(configuration.Version);
    }
    glue.updateCrawler({
      Name: physicalResourceId,
      Configuration: JSON.stringify(configuration)
    }).promise()
      .then(data=>respond())
      .catch(e=>respond(e));
  } catch (e) { respond(e); }
};
