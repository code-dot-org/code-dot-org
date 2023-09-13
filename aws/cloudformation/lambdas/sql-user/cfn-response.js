/*jshint esversion: 6 */
const https = require("https");

exports.sendCfnResponse = (
  event,
  context,
  responseStatus,
  responseData,
  physicalResourceId,
  message
) => {
  return new Promise((resolve, reject) => {
    const responseBody = {
      Status: responseStatus,
      Reason:
        message ||
        `See the details in CloudWatch Log Stream: ${context.logStreamName}`,
      PhysicalResourceId: physicalResourceId || context.logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      Data: responseData,
    };

    console.log(responseBody);

    const { hostname, path } = new URL(event.ResponseURL);
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
      method: "PUT",
      headers: {
        "Content-Type": "",
        "Content-Length": Buffer.byteLength(JSON.stringify(responseBody)),
      },
    };

    const req = https.request(options, (res) => {
      // TODO: Remove this debug logic.
      console.log("statusCode:", res.statusCode);
      console.log("headers:", res.headers);
      res.on("data", (d) => {
        console.log(res.body);
      });
      resolve();
    });

    // TODO: Remove this debug logic.
    console.log(req);

    req.on("error", (err) => {
      // TODO: Remove this debug logic.
      console.log(err);
      reject(err);
    });

    req.write(JSON.stringify(responseBody));
    req.end();
  });
};
