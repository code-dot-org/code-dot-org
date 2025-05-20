'use strict';

// This variable is injected via CloudFormation string substitution. This file must be used
// in conjunction with the CloudFormation Sub function to set the value of MarketingDomainName.
const marketingDomain = '${InternalMarketingDomainName}'

const marketingPaths = {
  // Add key-value pairs for each path that should be served by the CMS
  // e.g. '/videos': true,
}

const nextJsAssetsPath = '/_next/static/';

module.exports.handler = (event, context, callback) => {
  try {
    const request = event?.Records?.[0]?.cf?.request;
    const uri = request?.uri;
  
    // Set CMS origin if the requested path matches
    if (marketingPaths[uri] || (uri && uri.startsWith(nextJsAssetsPath))) {
      request.origin = {
        custom: {
          domainName: marketingDomain,
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
      request.headers['host'] = [{ key: 'Host', value: marketingDomain }];
    }
  
    callback(null, request);
  } catch (error) {
    console.error('Marketing router lambda error:', error);

    // If an error occurs, don't block. Pass through the request.
    callback(null, request);
  }
};