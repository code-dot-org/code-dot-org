/**
 * @fileoverview Utility functions shared by applab and gamelab exporters.
 */

import $ from 'jquery';
import {buildAsync, cancelBuild} from 'snack-build';
import project from '@cdo/apps/code-studio/initApp/project';
import download from '../assetManagement/download';
import {EXPO_SESSION_SECRET} from '../constants';
import * as assetPrefix from '../assetManagement/assetPrefix';
import exportExpoAppJsonEjs from '../templates/export/expo/app.json.ejs';
import exportExpoPackagedFilesEjs from '../templates/export/expo/packagedFiles.js.ejs';
import exportExpoPackagedFilesEntryEjs from '../templates/export/expo/packagedFilesEntry.js.ejs';

export const EXPO_SDK_VERSION = '33.0.0';

export const PLATFORM_ANDROID = 'android';
export const PLATFORM_IOS = 'ios';
export const DEFAULT_PLATFORM = PLATFORM_ANDROID;

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

async function expoBuildOrCheckApk(options, mode, sessionSecret) {
  const {iconUri, splashImageUri, apkBuildId} = options;
  const buildMode = mode === 'generate';

  const appJson = JSON.parse(
    exportExpoAppJsonEjs({
      appName: project.getCurrentName() || 'my-app',
      sdkVersion: EXPO_SDK_VERSION,
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

  // Expo requires that these additional keys (iconUrl, imageUrl)
  // are passed when the files are not provided locally
  appJson.expo.iconUrl = appJson.expo.icon;
  appJson.expo.splash.imageUrl = appJson.expo.splash.image;

  // Starting with SDK 33, the turtle build system requires that
  // we specify our dependencies here (we currently depend only
  // on the 'expo' module):
  appJson.expo.dependencies = ['expo'];

  if (buildMode) {
    return buildApk(sessionSecret, appJson.expo);
  } else {
    return checkApk(sessionSecret, appJson.expo, apkBuildId);
  }
}

async function buildApk(sessionSecret, manifest) {
  const result = await buildAsync(manifest, {
    platform: PLATFORM_ANDROID,
    mode: 'create',
    isSnack: true,
    sdkVersion: EXPO_SDK_VERSION,
    sessionSecret: sessionSecret || EXPO_SESSION_SECRET
  });
  const {id} = result;
  return id;
}

async function checkApk(sessionSecret, manifest, apkBuildId) {
  const result = await buildAsync(manifest, {
    platform: PLATFORM_ANDROID,
    mode: 'status',
    current: false,
    sessionSecret: sessionSecret || EXPO_SESSION_SECRET
  });
  const {jobs = []} = result;
  const job = jobs.find(job => apkBuildId && job.id === apkBuildId);
  if (!job) {
    throw new Error(`Expo build not found: ${apkBuildId}`);
  }
  if (job.status === 'finished') {
    return job.artifactId
      ? `https://expo.io/artifacts/${job.artifactId}`
      : job.artifacts.url;
  } else if (job.status === 'errored') {
    throw new Error(`Expo build failed: Job status: ${job.status}`);
  } else {
    // In-progress, return undefined
    return;
  }
}

/**
 * Generate Android APK using Expo
 * @param {string} sessionSecret Expo session secret for snack APIs
 * @param {function} setAndroidPropsCallback called when ready to update generated Android export props
 * @param {Object} options
 * @return {Promise.<string>} APK build id
 */
export async function expoGenerateApk(
  sessionSecret,
  setAndroidPropsCallback,
  options
) {
  const {md5SavedSources: md5ApkSavedSources, expoSnackId: snackId} = options;
  const apkBuildId = await expoBuildOrCheckApk(
    options,
    'generate',
    sessionSecret
  );
  setAndroidPropsCallback({
    md5ApkSavedSources,
    snackId,
    apkBuildId
  });
  return apkBuildId;
}

/**
 * Check on Android APK build status using Expo
 * @param {string} sessionSecret Expo session secret for snack APIs
 * @param {function} setAndroidPropsCallback called when ready to update generated Android export props
 * @param {Object} options
 * @return {Promise.<string>} APK URI (if build has completed)
 */
export async function expoCheckApkBuild(
  sessionSecret,
  setAndroidPropsCallback,
  options
) {
  const {md5SavedSources: md5ApkSavedSources, expoSnackId: snackId} = options;
  try {
    const apkUri = await expoBuildOrCheckApk(options, 'check', sessionSecret);
    if (apkUri) {
      const {apkBuildId} = options;
      setAndroidPropsCallback({
        md5ApkSavedSources,
        snackId,
        apkBuildId,
        apkUri
      });
    }
    return apkUri;
  } catch (err) {
    // Clear any android export props since the build failed:
    setAndroidPropsCallback({});
    throw err;
  }
}

/**
 * Cancel Android APK build using Expo
 * @param {string} sessionSecret Expo session secret for snack APIs
 * @param {function} setAndroidPropsCallback called when ready to update generated Android export props
 * @param {Object} options
 * @return {Promise} GraphQL Request
 */
export async function expoCancelApkBuild(
  sessionSecret,
  setAndroidPropsCallback,
  options
) {
  // Clear any android export props since we are canceling the build:
  setAndroidPropsCallback({});

  const {apkBuildId} = options;
  return cancelBuild(
    {sessionSecret: sessionSecret || EXPO_SESSION_SECRET},
    apkBuildId
  );
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
