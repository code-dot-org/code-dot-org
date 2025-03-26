'use strict';

const { MARKETING_DOMAIN } = process.env;

const marketingPaths = {
  // Add key-value pairs for each path that should be served by the CMS
  // e.g. '/videos': true,
}

export const handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const uri = request.uri;

  // Set CMS origin if the requested path matches
  if (marketingPaths[uri]) {
    request.origin = {
      custom: {
        domainName: MARKETING_DOMAIN,
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
    request.headers['host'] = [{ key: 'Host', value: MARKETING_DOMAIN }];
  }

  callback(null, request);
};
