/**
 * @fileoverview Utility functions shared by applab and gamelab exporters.
 */

import $ from 'jquery';
import download from '../assetManagement/download';

// Returns a Deferred which resolves with the webpack runtime, or rejects
// if it could not be downloaded.
export function fetchWebpackRuntime(cacheBust) {
  const deferred = new $.Deferred();

  // Attempt to fetch webpack-runtime.min.js if possible, but when running on
  // non-production environments, fallback if we can't fetch that file to use
  // webpack-runtime.js:
  download('/blockly/js/webpack-runtime.min.js' + cacheBust, 'text').then(
    (data, success, jqXHR) => deferred.resolve([data, success, jqXHR]),
    download('/blockly/js/webpack-runtime.js' + cacheBust, 'text').then(
      (data, success, jqXHR) => deferred.resolve([data, success, jqXHR]),
      () => deferred.reject(new Error('failed to fetch webpack-runtime.js'))
    )
  );

  return deferred;
}
