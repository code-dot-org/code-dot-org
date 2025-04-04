'use strict';

const MARKETING_DOMAINS = {
  'marketing-test': 'dev.marketing.dev-code.org',
};

const marketingPaths = {
  // Add key-value pairs for each path that should be served by the CMS
  // e.g. '/videos': true,
}

module.exports.handler = (event, context, callback) => {
  const request = event?.Records?.[0]?.cf?.request;
  const requestEnvHeader = request?.origin?.custom?.customHeaders?.['x-cdo-env']?.[0]?.value;
  const marketingDomain = MARKETING_DOMAINS[requestEnvHeader];
  const uri = request?.uri;

  // Set CMS origin if the requested path matches
  if (marketingPaths[uri]) {
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
};