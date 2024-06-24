/**
 * @fileoverview Utility functions shared by applab and gamelab exporters.
 */
import $ from 'jquery';

import * as assetPrefix from '../assetManagement/assetPrefix';
import download from '../assetManagement/download';

const soundRegex =
  /(\bsound:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

export function extractSoundAssets(options) {
  const {sources, rootRelativeAssetPrefix, zipAssetPrefix} = options;
  const allSounds = [];
  sources.forEach(source =>
    allSounds.push(...(source.match(soundRegex) || []))
  );
  const uniqueSounds = [...new Set(allSounds)];
  return uniqueSounds.map(soundProtocolUrl => {
    const soundOriginUrl = assetPrefix.fixPath(soundProtocolUrl);
    const filename = soundProtocolUrl.replace(assetPrefix.SOUND_PREFIX, '');
    return {
      url: soundOriginUrl,
      rootRelativePath: rootRelativeAssetPrefix + filename,
      zipPath: zipAssetPrefix + filename,
      dataType: 'binary',
      filename,
      searchUrl: soundProtocolUrl,
    };
  });
}

export function rewriteAssetUrls(appAssets, data) {
  return appAssets.reduce(function (data, assetToDownload) {
    const searchUrl = assetToDownload.searchUrl || assetToDownload.filename;
    data = data.replace(
      new RegExp(`["|']${assetToDownload.url}["|']`, 'g'),
      `"${assetToDownload.rootRelativePath}"`
    );
    return data.replace(
      new RegExp(`["|']${searchUrl}["|']`, 'g'),
      `"${assetToDownload.rootRelativePath}"`
    );
  }, data);
}

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
