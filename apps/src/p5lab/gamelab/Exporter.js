/* eslint no-unused-vars: ["error", { "ignoreRestSiblings": true }] */
import {saveAs} from 'filesaver.js';
import $ from 'jquery';
import JSZip from 'jszip';

import * as assetPrefix from '@cdo/apps/assetManagement/assetPrefix';
import download from '@cdo/apps/assetManagement/download';
import logToCloud from '@cdo/apps/logToCloud';
import exportGamelabCodeEjs from '@cdo/apps/templates/export/gamelabCode.js.ejs';
import exportGamelabIndexEjs from '@cdo/apps/templates/export/gamelabIndex.html.ejs';
import {
  extractSoundAssets,
  rewriteAssetUrls,
  fetchWebpackRuntime,
} from '@cdo/apps/util/exporter';

import {APP_WIDTH, APP_HEIGHT} from '../constants';

const CONTROLS_HEIGHT = 165;

export default {
  async exportAppToZip(appName, code, animationOpts) {
    const appHeight = APP_HEIGHT + CONTROLS_HEIGHT;
    const appWidth = APP_WIDTH;
    const html = exportGamelabIndexEjs({
      appName,
      appHeight,
      appWidth,
      jQueryPath: 'https://code.jquery.com/jquery-1.12.1.min.js',
      gamelabApiPath: 'gamelab-api.js',
      gamelabCssPath: 'gamelab.css',
      p5Path: 'p5.js',
      p5playPath: 'p5.play.js',
      codePath: 'code.js',
      webExport: true,
      exportClass: 'web',
      webpackRuntimePath: null,
    });
    const cacheBust = '?__cb__=' + '' + new String(Math.random()).slice(2);

    const rootRelativeAssetPrefix = 'assets/';
    const zipAssetPrefix = appName + '/assets/';

    const {appAssets, animationListJSON} = this.generateAppAssetsAndJSON({
      code,
      animationOpts,
      rootRelativeAssetPrefix,
      zipAssetPrefix,
    });
    const exportCode = exportGamelabCodeEjs({
      code,
      animationOpts,
      animationListJSON,
    });

    const mainProjectFilesPrefix = appName + '/';

    var zip = new JSZip();
    zip.file(mainProjectFilesPrefix + 'index.html', html);
    zip.file(
      mainProjectFilesPrefix + 'code.js',
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
      p5playAsset,
    ];

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
            appName + '/gamelab-api.js',
            [webpackRuntimeText, gamelabApiText].join('\n')
          );
          zip.file(appName + '/gamelab.css', cssText);
          zip.file(appName + '/p5.js', p5Text);
          zip.file(appName + '/p5.play.js', p5playText);
          rest.forEach(([data], index) => {
            zip.file(appAssets[index].zipPath, data, {binary: true});
          });

          return resolve(zip);
        },
        () => {
          logToCloud.addPageAction(
            logToCloud.PageAction.StaticResourceFetchError,
            {
              app: 'gamelab',
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
      ...rest,
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
        rootRelativePath,
      };
    });
    return rewrittenAnimationList;
  },

  exportApp(appName, code, animationOpts) {
    return this.exportAppToZip(appName, code, animationOpts).then(function (
      zip
    ) {
      zip.generateAsync({type: 'blob'}).then(function (blob) {
        saveAs(blob, appName + '.zip');
      });
    });
  },

  generateAppAssetsAndJSON(params) {
    const {
      animationOpts,
      code = '',
      rootRelativeAssetPrefix = '',
      zipAssetPrefix = '',
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
        filename: filename,
      };
    });

    const soundAssets = extractSoundAssets({
      sources: [code],
      rootRelativeAssetPrefix,
      zipAssetPrefix,
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
          filename,
        };
      }
    );

    const rewrittenAnimList = this.rewriteAnimationListSourceUrls(
      animationList,
      animAssets
    );

    return {
      appAssets: [...appAssets, ...animAssets, ...soundAssets],
      animationListJSON:
        this.generateExportableAnimationListJSON(rewrittenAnimList),
    };
  },
};
