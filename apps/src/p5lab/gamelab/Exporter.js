/* global dashboard */
/* eslint no-unused-vars: ["error", { "ignoreRestSiblings": true }] */
import $ from 'jquery';
import JSZip from 'jszip';
import {saveAs} from 'filesaver.js';

import * as assetPrefix from '@cdo/apps/assetManagement/assetPrefix';
import download from '@cdo/apps/assetManagement/download';
import exportGamelabCodeEjs from '@cdo/apps/templates/export/gamelabCode.js.ejs';
import exportGamelabIndexEjs from '@cdo/apps/templates/export/gamelabIndex.html.ejs';
import exportExpoPackageJson from '@cdo/apps/templates/export/expo/package.exported_json';
import exportExpoAppJsonEjs from '@cdo/apps/templates/export/expo/app.json.ejs';
import exportExpoAppEjs from '@cdo/apps/templates/export/expo/App.js.ejs';
import exportExpoCustomAssetJs from '@cdo/apps/templates/export/expo/CustomAsset.exported_js';
import exportExpoDataWarningJs from '@cdo/apps/templates/export/expo/DataWarning.exported_js';
import exportExpoMetroConfigJs from '@cdo/apps/templates/export/expo/metro.config.exported_js';
import exportExpoWarningPng from '@cdo/apps/templates/export/expo/warning.png';
import exportExpoIconPng from '@cdo/apps/templates/export/expo/icon.png';
import exportExpoSplashPng from '@cdo/apps/templates/export/expo/splash.png';
import logToCloud from '@cdo/apps/logToCloud';
import project from '@cdo/apps/code-studio/initApp/project';
import {APP_WIDTH, APP_HEIGHT} from '../constants';
import {EXPO_SDK_VERSION} from '../../util/exporterConstants';
import {
  extractSoundAssets,
  createPackageFilesFromZip,
  createPackageFilesFromExpoFiles,
  createSnackSession,
  rewriteAssetUrls,
  getEnvironmentPrefix,
  fetchWebpackRuntime
} from '@cdo/apps/util/exporter';

const CONTROLS_HEIGHT = 165;

export default {
  async exportAppToZip(appName, code, animationOpts, expoMode) {
    const appHeight = APP_HEIGHT + CONTROLS_HEIGHT;
    const appWidth = APP_WIDTH;
    const jQueryBaseName = 'jquery-1.12.1.min';
    const html = exportGamelabIndexEjs({
      appName,
      appHeight,
      appWidth,
      jQueryPath: expoMode
        ? jQueryBaseName + '.j'
        : 'https://code.jquery.com/jquery-1.12.1.min.js',
      gamelabApiPath: expoMode ? 'gamelab-api.j' : 'gamelab-api.js',
      gamelabCssPath: 'gamelab.css',
      p5Path: expoMode ? 'p5.j' : 'p5.js',
      p5playPath: expoMode ? 'p5.play.j' : 'p5.play.js',
      codePath: expoMode ? 'code.j' : 'code.js',
      webExport: !expoMode,
      exportClass: expoMode ? 'expo' : 'web',
      webpackRuntimePath: null
    });
    const cacheBust = '?__cb__=' + '' + new String(Math.random()).slice(2);

    const rootRelativeAssetPrefix = expoMode ? '' : 'assets/';
    const zipAssetPrefix = appName + '/assets/';

    const {appAssets, animationListJSON} = this.generateAppAssetsAndJSON({
      code,
      animationOpts,
      rootRelativeAssetPrefix,
      zipAssetPrefix
    });
    const exportCode = exportGamelabCodeEjs({
      code,
      animationOpts,
      animationListJSON
    });

    const iconPath = '/appassets/icon.png';
    const splashImagePath = '/appassets/splash.png';

    if (expoMode) {
      appAssets.push({
        url: exportExpoWarningPng,
        zipPath: appName + '/appassets/warning.png',
        dataType: 'binary'
      });
      appAssets.push({
        url: exportExpoIconPng,
        zipPath: appName + iconPath,
        dataType: 'binary'
      });
      appAssets.push({
        url: exportExpoSplashPng,
        zipPath: appName + splashImagePath,
        dataType: 'binary'
      });
    }

    const mainProjectFilesPrefix = appName + (expoMode ? '/assets/' : '/');

    var zip = new JSZip();
    if (expoMode) {
      const appJson = exportExpoAppJsonEjs({
        appName,
        sdkVersion: EXPO_SDK_VERSION,
        projectId: project.getCurrentId(),
        iconPath: '.' + iconPath,
        splashImagePath: '.' + splashImagePath
      });
      const appJs = exportExpoAppEjs({
        appHeight,
        appWidth,
        hasDataAPIs: false
      });

      zip.file(appName + '/package.json', exportExpoPackageJson);
      zip.file(appName + '/app.json', appJson);
      zip.file(appName + '/App.js', appJs);
      zip.file(appName + '/CustomAsset.js', exportExpoCustomAssetJs);
      zip.file(appName + '/DataWarning.js', exportExpoDataWarningJs);
      zip.file(appName + '/metro.config.js', exportExpoMetroConfigJs);
    }
    // NOTE: for expoMode, it is important that index.html comes first...
    zip.file(mainProjectFilesPrefix + 'index.html', html);
    zip.file(
      mainProjectFilesPrefix + (expoMode ? 'code.j' : 'code.js'),
      rewriteAssetUrls(appAssets, exportCode)
    );

    // webpack-runtime must appear exactly once on any page containing webpack entries.
    const webpackRuntimeAsset = fetchWebpackRuntime(cacheBust);

    // Attempt to fetch gamelab-api.min.js if possible, but when running on non-production
    // environments, fallback if we can't fetch that file to use gamelab-api.js:
    const gamelabApiAsset = new $.Deferred();
    download('/blockly/js/gamelab-api.min.js' + cacheBust, 'text').then(
      (data, success, jqXHR) => gamelabApiAsset.resolve([data, success, jqXHR]),
      () =>
        download('/blockly/js/gamelab-api.js' + cacheBust, 'text').then(
          (data, success, jqXHR) =>
            gamelabApiAsset.resolve([data, success, jqXHR]),
          () =>
            gamelabApiAsset.reject(new Error('failed to fetch gamelab-api.js'))
        )
    );
    // Fetch gamelab.css, p5.js, and p5.play.js:
    const cssAsset = download('/blockly/css/gamelab.css' + cacheBust, 'text');
    const p5Asset = download('/blockly/js/p5play/p5.js' + cacheBust, 'text');
    const p5playAsset = download(
      '/blockly/js/p5play/p5.play.js' + cacheBust,
      'text'
    );
    const staticDownloads = [
      webpackRuntimeAsset,
      gamelabApiAsset,
      cssAsset,
      p5Asset,
      p5playAsset
    ];
    // Fetch jquery when in expo mode
    if (expoMode) {
      staticDownloads.push(
        download(`https://code.jquery.com/${jQueryBaseName}.js`, 'text')
      );
    }

    return new Promise((resolve, reject) => {
      $.when(
        ...staticDownloads,
        ...appAssets.map(assetToDownload => {
          if (assetToDownload.blob) {
            return $.Deferred().resolve([assetToDownload.blob]);
          } else {
            return download(
              assetToDownload.url,
              assetToDownload.dataType || 'text'
            );
          }
        })
      ).then(
        (
          [webpackRuntimeText],
          [gamelabApiText],
          [cssText],
          [p5Text],
          [p5playText],
          ...rest
        ) => {
          zip.file(
            appName +
              '/' +
              (expoMode ? 'assets/gamelab-api.j' : 'gamelab-api.js'),
            [webpackRuntimeText, gamelabApiText].join('\n')
          );
          zip.file(
            appName + '/' + (expoMode ? 'assets/' : '') + 'gamelab.css',
            cssText
          );
          zip.file(
            appName + '/' + (expoMode ? 'assets/p5.j' : 'p5.js'),
            p5Text
          );
          zip.file(
            appName + '/' + (expoMode ? 'assets/p5.play.j' : 'p5.play.js'),
            p5playText
          );
          if (expoMode) {
            const [jQueryText] = rest[0];
            zip.file(
              mainProjectFilesPrefix + jQueryBaseName + '.j',
              jQueryText
            );
            // Remove the jquery file from the rest array:
            rest = rest.slice(1);
          }
          rest.forEach(([data], index) => {
            zip.file(appAssets[index].zipPath, data, {binary: true});
          });

          if (expoMode) {
            // Write a packagedFiles.js into the zip that contains require
            // statements for each file under assets. This will allow the
            // Expo app to locally install of these files onto the device.
            const packagedFilesJs = createPackageFilesFromZip(zip, appName);
            zip.file(appName + '/packagedFiles.js', packagedFilesJs);
          }
          return resolve(zip);
        },
        () => {
          logToCloud.addPageAction(
            logToCloud.PageAction.StaticResourceFetchError,
            {
              app: 'gamelab'
            },
            1 / 100
          );
          reject(new Error('failed to fetch assets'));
        }
      );
    });
  },

  generateExportableAnimationListJSON(animationList) {
    // Some information in the animationList doesn't belong in the exported version
    // This function currently removes:
    // pendingFrames from the top level
    // blob and dataURI from each animation
    const {pendingFrames, propsByKey, orderedKeys, ...rest} = animationList;
    const exportAnimationList = {
      orderedKeys,
      propsByKey: {},
      ...rest
    };
    orderedKeys.map(key => {
      const props = propsByKey[key];
      const {blob, dataURI, ...otherProps} = props;
      exportAnimationList.propsByKey[key] = otherProps;
    });
    return JSON.stringify(exportAnimationList);
  },

  rewriteAnimationListSourceUrls(animationList, appAssets) {
    const {propsByKey, ...rest} = animationList;
    const rewrittenAnimationList = {propsByKey: {}, ...rest};
    Object.entries(propsByKey).forEach(([key, anim]) => {
      const appAsset = appAssets.find(asset => asset.key === key);
      const {rootRelativePath} = appAsset || {};
      rewrittenAnimationList.propsByKey[key] = {
        ...anim,
        rootRelativePath
      };
    });
    return rewrittenAnimationList;
  },

  exportApp(appName, code, animationOpts, suppliedExpoOpts, config) {
    const expoOpts = suppliedExpoOpts || {};
    if (expoOpts.mode === 'expoPublish') {
      return this.publishToExpo(
        appName,
        code,
        animationOpts,
        expoOpts.iconFileUrl,
        config
      );
    }
    return this.exportAppToZip(
      appName,
      code,
      animationOpts,
      expoOpts.mode === 'expoZip'
    ).then(function(zip) {
      zip.generateAsync({type: 'blob'}).then(function(blob) {
        saveAs(blob, appName + '.zip');
      });
    });
  },

  async publishToExpo(appName, code, animationOpts, iconFileUrl, config) {
    const {origin} = window.location;
    const webpackRuntimePath =
      getEnvironmentPrefix() === 'cdo-development'
        ? `${origin}/blockly/js/webpack-runtime.js`
        : `${origin}/blockly/js/webpack-runtime.min.js`;
    const gamelabApiPath =
      getEnvironmentPrefix() === 'cdo-development'
        ? `${origin}/blockly/js/gamelab-api.js`
        : `${origin}/blockly/js/gamelab-api.min.js`;
    const gamelabCssPath = `${origin}/blockly/css/gamelab.css`;
    const p5Path = `${origin}/blockly/js/p5play/p5.js`;
    const p5playPath = `${origin}/blockly/js/p5play/p5.play.js`;
    const appHeight = APP_HEIGHT + CONTROLS_HEIGHT;
    const appWidth = APP_WIDTH;
    const html = exportGamelabIndexEjs({
      appName,
      appHeight,
      appWidth,
      jQueryPath: 'https://code.jquery.com/jquery-1.12.1.min.js',
      webpackRuntimePath,
      gamelabApiPath,
      gamelabCssPath,
      p5Path,
      p5playPath,
      codePath: 'code.j',
      webExport: false,
      exportClass: 'expo'
    });
    const appJs = exportExpoAppEjs({
      appHeight,
      appWidth,
      hasDataAPIs: false
    });

    const {appAssets, animationListJSON} = this.generateAppAssetsAndJSON({
      code,
      animationOpts
    });
    const exportCode = exportGamelabCodeEjs({
      code,
      animationOpts,
      animationListJSON
    });

    const files = {
      'App.js': {contents: appJs, type: 'CODE'},
      'CustomAsset.js': {contents: exportExpoCustomAssetJs, type: 'CODE'},
      'DataWarning.js': {contents: exportExpoDataWarningJs, type: 'CODE'}
    };

    const session = createSnackSession(files, config.expoSession);

    // Important that index.html comes first:
    const fileAssets = [
      {filename: 'index.html', data: html},
      {filename: 'code.j', data: rewriteAssetUrls(appAssets, exportCode)}
    ];

    const fileUploads = fileAssets.map(({data}) =>
      session.uploadAssetAsync(new Blob([data]))
    );
    const snackFileUrls = await Promise.all(fileUploads);

    snackFileUrls.forEach((url, index) => {
      files['assets/' + fileAssets[index].filename] = {
        contents: url,
        type: 'ASSET'
      };
    });

    appAssets.push({
      url: exportExpoWarningPng,
      dataType: 'binary',
      filename: 'warning.png',
      assetLocation: 'appassets/'
    });
    appAssets.push({
      url: iconFileUrl || exportExpoIconPng,
      dataType: 'binary',
      filename: 'icon.png',
      assetLocation: 'appassets/'
    });
    appAssets.push({
      url: iconFileUrl || exportExpoSplashPng,
      dataType: 'binary',
      filename: 'splash.png',
      assetLocation: 'appassets/'
    });

    const assetDownloads = appAssets.map(asset => {
      if (asset.blob) {
        return $.Deferred().resolve(asset.blob);
      } else {
        return download(asset.url, asset.dataType || 'text');
      }
    });

    const downloadedAssets = await Promise.all(assetDownloads);
    const assetUploads = downloadedAssets.map(downloadedAsset =>
      session.uploadAssetAsync(downloadedAsset)
    );
    const snackAssetUrls = await Promise.all(assetUploads);

    snackAssetUrls.forEach((url, index) => {
      files[
        (appAssets[index].assetLocation || 'assets/') +
          appAssets[index].filename
      ] = {
        contents: url,
        type: 'ASSET'
      };
    });
    files['packagedFiles.js'] = {
      contents: createPackageFilesFromExpoFiles(files),
      type: 'CODE'
    };

    await session.sendCodeAsync(files);
    // NOTE: We are waiting on a snack-sdk change that will make sendCodeAsync() actually
    // send the code right away (currently, the method is debounced). Until then, we must
    // call an internal method to ensure the code is saved:
    await session._publishNotDebouncedAsync();
    const saveResult = await session.saveAsync();
    const expoUri = `exp://expo.io/${saveResult.id}`;
    const expoSnackId = saveResult.id;

    return {
      expoUri,
      expoSnackId,
      iconUri: files['appassets/icon.png'].contents,
      splashImageUri: files['appassets/splash.png'].contents
    };
  },

  generateAppAssetsAndJSON(params) {
    const {
      animationOpts,
      code = '',
      rootRelativeAssetPrefix = '',
      zipAssetPrefix = ''
    } = params;
    const {animationList} = animationOpts;
    const {propsByKey: animationPropsByKey} = animationList;

    const appAssets = dashboard.assets.listStore.list().map(asset => {
      const filename = asset.filename.replace(/^\/+/g, '');
      return {
        url: assetPrefix.fixPath(asset.filename),
        rootRelativePath: rootRelativeAssetPrefix + filename,
        zipPath: zipAssetPrefix + filename,
        dataType: 'binary',
        filename: filename
      };
    });

    const soundAssets = extractSoundAssets({
      sources: [code],
      rootRelativeAssetPrefix,
      zipAssetPrefix
    });

    const animAssets = Object.entries(animationPropsByKey).map(
      ([key, anim]) => {
        const {blob, sourceUrl} = anim;
        // If we have a sourceUrl, use it for the filename and url. Otherwise (in
        // cases where we only have a Blob), generate a filename/url from the key:
        const filename = sourceUrl
          ? sourceUrl.replace(/^\/+/g, '')
          : `${key}.png`;
        const url = sourceUrl ? assetPrefix.fixPath(sourceUrl) : filename;
        return {
          blob,
          key,
          sourceUrl,
          url,
          rootRelativePath: rootRelativeAssetPrefix + filename,
          zipPath: zipAssetPrefix + filename,
          dataType: 'binary',
          filename
        };
      }
    );

    const rewrittenAnimList = this.rewriteAnimationListSourceUrls(
      animationList,
      animAssets
    );

    return {
      appAssets: [...appAssets, ...animAssets, ...soundAssets],
      animationListJSON: this.generateExportableAnimationListJSON(
        rewrittenAnimList
      )
    };
  }
};
