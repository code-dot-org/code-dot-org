/**
 * @fileoverview Utility functions shared by applab and gamelab exporters.
 */

import $ from 'jquery';
import {SnackSession} from '@code-dot-org/snack-sdk';
import project from '@cdo/apps/code-studio/initApp/project';
import download from '../assetManagement/download';
import {EXPO_SESSION_SECRET} from '../constants';
import * as assetPrefix from '../assetManagement/assetPrefix';
import exportExpoAppJsonEjs from '../templates/export/expo/app.json.ejs';
import exportExpoPackagedFilesEjs from '../templates/export/expo/packagedFiles.js.ejs';
import exportExpoPackagedFilesEntryEjs from '../templates/export/expo/packagedFilesEntry.js.ejs';

export function createPackageFilesFromZip(zip, appName) {
  const moduleList = [];
  zip.folder(appName + '/assets').forEach((fileName, file) => {
    if (!file.dir) {
      moduleList.push({fileName});
    }
  });
  const entries = moduleList.map(module =>
    exportExpoPackagedFilesEntryEjs({module})
  );
  return exportExpoPackagedFilesEjs({entries});
}

export function createPackageFilesFromExpoFiles(files) {
  const moduleList = [];
  const assetPrefix = 'assets/';
  const assetPrefixLength = assetPrefix.length;
  for (const fileName in files) {
    if (fileName.indexOf(assetPrefix) !== 0) {
      continue;
    }
    const relativePath = fileName.substring(assetPrefixLength);
    moduleList.push({fileName: relativePath});
  }
  const entries = moduleList.map(module =>
    exportExpoPackagedFilesEntryEjs({module})
  );
  return exportExpoPackagedFilesEjs({entries});
}

export async function generateExpoApk(options, config) {
  const {appName, expoSnackId, iconUri, splashImageUri} = options;
  const session = new SnackSession({
    sessionId: `${getEnvironmentPrefix()}-${project.getCurrentId()}`,
    name: `project-${project.getCurrentId()}`,
    sdkVersion: '31.0.0',
    snackId: expoSnackId,
    user: {
      sessionSecret: config.expoSession || EXPO_SESSION_SECRET
    }
  });

  const appJson = JSON.parse(
    exportExpoAppJsonEjs({
      appName,
      projectId: project.getCurrentId(),
      iconPath: iconUri,
      splashImagePath: splashImageUri
    })
  );

  // TODO: remove the onlineOnlyExpo patching once getApkUrlAsync()
  // properly supports our full app.json
  const {
    updates, // eslint-disable-line no-unused-vars
    assetBundlePatterns, // eslint-disable-line no-unused-vars
    packagerOpts, // eslint-disable-line no-unused-vars
    ...onlineOnlyExpo
  } = appJson.expo;
  appJson.expo = onlineOnlyExpo;

  const artifactUrl = await session.getApkUrlAsync(appJson);

  return artifactUrl;
}

const soundRegex = /(\bsound:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

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
      searchUrl: soundProtocolUrl
    };
  });
}

// TODO: for expoMode, replace spaces in asset filenames or wait for this fix
// to make it into Metro Bundler:
// https://github.com/facebook/react-native/pull/10365
export function rewriteAssetUrls(appAssets, data) {
  return appAssets.reduce(function(data, assetToDownload) {
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

export function getEnvironmentPrefix() {
  const {hostname} = window.location;
  if (hostname.includes('adhoc')) {
    // As adhoc hostnames may include other keywords, check it first.
    return 'cdo-adhoc';
  }
  if (hostname.includes('test')) {
    return 'cdo-test';
  }
  if (hostname.includes('levelbuilder')) {
    return 'cdo-levelbuilder';
  }
  if (hostname.includes('staging')) {
    return 'cdo-staging';
  }
  if (hostname.includes('localhost')) {
    return 'cdo-development';
  }
  if (hostname.includes('code.org')) {
    return 'cdo';
  }
  return 'cdo-unknown';
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
