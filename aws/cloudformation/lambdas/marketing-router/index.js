'use strict';

const cmsDomain = 'marketing.code.org'; // Change to the CMS Cloudfront or ALB

const cmsPaths = {
  '/about': true,
}

exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const uri = request.uri;

  // Set CMS origin if the requested path matches
  if (cmsPaths[uri]) {
    request.origin = {
      custom: {
        domainName: cmsDomain,
        port: 443,
        protocol: 'https',
        path: '',
        sslProtocols: ['TLSv1.2'],
        readTimeout: 30,
        keepaliveTimeout: 5,
        customHeaders: {},
      },
    };

    // Update the Host header to match the new origin
    request.headers['host'] = [{ key: 'Host', value: cmsDomain }];
  }

  callback(null, request);
};