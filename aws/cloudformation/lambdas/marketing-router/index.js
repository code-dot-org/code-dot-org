'use strict';

// const cmsDomain = 'd1zjy2ptvqjefb.cloudfront.net'; // Change to the CMS Cloudfront or ALB
const cmsDomain = 'dev.marketing.dev-code.org';

const cmsPaths = {
  '/about': true,
  '/en-US/videos': true,
}

export const handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const uri = request.uri;
  console.log('Request URI:', uri);

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