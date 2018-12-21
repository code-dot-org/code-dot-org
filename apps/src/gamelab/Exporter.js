/* global dashboard */
/* eslint no-unused-vars: ["error", { "ignoreRestSiblings": true }] */
import $ from 'jquery';
import JSZip from 'jszip';
import {saveAs} from 'filesaver.js';
import {SnackSession} from '@code-dot-org/snack-sdk';

import * as assetPrefix from '../assetManagement/assetPrefix';
import download from '../assetManagement/download';
import exportGamelabWebExport from '../templates/export/gamelabWebExport.html.ejs';
import exportGamelabCodeEjs from '../templates/export/gamelabCode.js.ejs';
import exportGamelabExpoIndexEjs from '../templates/export/expo/gamelabIndex.html.ejs';
import exportExpoPackageJson from '../templates/export/expo/package.exported_json';
import exportExpoAppJsonEjs from '../templates/export/expo/app.json.ejs';
import exportExpoAppEjs from '../templates/export/expo/App.js.ejs';
import exportExpoCustomAssetJs from '../templates/export/expo/CustomAsset.exported_js';
import exportExpoDataWarningJs from '../templates/export/expo/DataWarning.exported_js';
import exportExpoPackagedFilesEjs from '../templates/export/expo/packagedFiles.js.ejs';
import exportExpoPackagedFilesEntryEjs from '../templates/export/expo/packagedFilesEntry.js.ejs';
import exportExpoWarningPng from '../templates/export/expo/warning.png';
import exportExpoIconPng from '../templates/export/expo/icon.png';
import exportExpoSplashPng from '../templates/export/expo/splash.png';
import logToCloud from '../logToCloud';
import project from '@cdo/apps/code-studio/initApp/project';
import {GAME_WIDTH, GAME_HEIGHT} from './constants';

export default {
  async exportAppToZip(appName, code, animationOpts, expoMode) {

    const jQueryBaseName = 'jquery-1.12.1.min';
    var html;
    if (expoMode) {
      html = exportGamelabExpoIndexEjs({
        appName,
        jQueryPath: jQueryBaseName + ".j",
        gamelabApiPath: 'gamelab-api.j',
        p5Path: 'p5.j',
        p5playPath: 'p5.play.j',
      });
    } else {
      html = exportGamelabWebExport({
        appName,
      });
    }
    const cacheBust = '?__cb__='+''+new String(Math.random()).slice(2);

    const rootRelativeAssetPrefix = expoMode ? '' : 'assets/';
    const zipAssetPrefix = appName + '/assets/';

    const { appAssets, animationListJSON } = this.generateAppAssetsAndJSON({
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

    if (expoMode) {
      appAssets.push({
        url: exportExpoWarningPng,
        zipPath: appName + '/appassets/warning.png',
        dataType: 'binary',
      });
      appAssets.push({
        url: exportExpoIconPng,
        zipPath: appName + '/appassets/icon.png',
        dataType: 'binary',
      });
      appAssets.push({
        url: exportExpoSplashPng,
        zipPath: appName + '/appassets/splash.png',
        dataType: 'binary',
      });
    }

    const mainProjectFilesPrefix = appName + (expoMode ? '/assets/' : '/');

    var zip = new JSZip();
    if (expoMode) {
      const appJson = exportExpoAppJsonEjs({
        appName,
        projectId: project.getCurrentId()
      });
      const appJs = exportExpoAppEjs({
        appHeight: GAME_HEIGHT,
        appWidth: GAME_WIDTH,
        hasDataAPIs: false,
      });

      zip.file(appName + "/package.json", exportExpoPackageJson);
      zip.file(appName + "/app.json", appJson);
      zip.file(appName + "/App.js", appJs);
      zip.file(appName + "/CustomAsset.js", exportExpoCustomAssetJs);
      zip.file(appName + "/DataWarning.js", exportExpoDataWarningJs);
    }
    // NOTE: for expoMode, it is important that index.html comes first...
    zip.file(mainProjectFilesPrefix + "index.html", html);
    zip.file(mainProjectFilesPrefix + (expoMode ? "code.j" : "code.js"),
        rewriteAssetUrls(appAssets, exportCode));

    // Attempt to fetch applab-api.min.js if possible, but when running on non-production
    // environments, fallback if we can't fetch that file to use applab-api.js:
    const gamelabApiAsset = new $.Deferred();
    download('/blockly/js/gamelab-api.min.js' + cacheBust, 'text')
      .then((data, success, jqXHR) => gamelabApiAsset.resolve([data, success, jqXHR]),
          () => download('/blockly/js/gamelab-api.js' + cacheBust, 'text')
              .then((data, success, jqXHR) => gamelabApiAsset.resolve([data, success, jqXHR]),
                  () => gamelabApiAsset.reject(new Error("failed to fetch gamelab-api.js"))));
    // Fetch p5.js and p5.play.js:
    const p5Asset = download('/blockly/js/p5play/p5.js' + cacheBust, 'text');
    const p5playAsset = download('/blockly/js/p5play/p5.play.js' + cacheBust, 'text');
    const staticDownloads = [gamelabApiAsset, p5Asset, p5playAsset];
    // Fetch jquery when in expo mode
    if (expoMode) {
      staticDownloads.push(download(`https://code.jquery.com/${jQueryBaseName}.js`, 'text'));
    }

    return new Promise((resolve, reject) => {
      $.when(...staticDownloads, ...(appAssets.map(assetToDownload => {
        if (assetToDownload.blob) {
          return $.Deferred().resolve([assetToDownload.blob]);
        } else {
          return download(assetToDownload.url, assetToDownload.dataType || 'text');
        }
      }))).then(
        ([gamelabApiText], [p5Text], [p5playText], ...rest) => {
          zip.file(appName + "/" + (expoMode ? "assets/gamelab-api.j" : "gamelab-api.js"),
              gamelabApiText);
          zip.file(appName + "/" + (expoMode ? "assets/p5.j" : "p5.js"), p5Text);
          zip.file(appName + "/" + (expoMode ? "assets/p5.play.j" : "p5.play.js"),
              p5playText);
          if (expoMode) {
            const [jQueryText] = rest[0];
            zip.file(mainProjectFilesPrefix + jQueryBaseName + '.j', jQueryText);
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
            const packagedFilesJs = this.createPackageFilesFromZip(zip, appName);
            zip.file(appName + "/packagedFiles.js", packagedFilesJs);
          }
          return resolve(zip);
        },
        () => {
          logToCloud.addPageAction(logToCloud.PageAction.StaticResourceFetchError, {
            app: 'gamelab'
          }, 1/100);
          reject(new Error("failed to fetch assets"));
        }
      );
    });
  },

  generateExportableAnimationListJSON(animationList) {
  // Some information in the animationList doesn't belong in the exported version
  // This function currently removes:
  // pendingFrames from the top level
  // blob and dataURI from each animation
  const { pendingFrames, propsByKey, orderedKeys, ...rest} = animationList;
    const exportAnimationList = {
      orderedKeys,
      propsByKey: {},
      ...rest
    };
    orderedKeys.map(key => {
      const props = propsByKey[key];
      const { blob, dataURI, ...otherProps } = props;
      exportAnimationList.propsByKey[key] = otherProps;
    });
    return JSON.stringify(exportAnimationList);
  },

  rewriteAnimationListSourceUrls(animationList, appAssets) {
    const { propsByKey, ...rest } = animationList;
    const rewrittenAnimationList = { propsByKey: {}, ...rest };
    Object.entries(propsByKey).forEach(([key, anim]) => {
      const appAsset = appAssets.find(asset => asset.key === key);
      const { rootRelativePath } = appAsset || {};
      rewrittenAnimationList.propsByKey[key] = {
        ...anim,
        rootRelativePath,
      };
    });
    return rewrittenAnimationList;
  },

  async exportApp(appName, code, animationOpts, suppliedExpoOpts) {
    const expoOpts = suppliedExpoOpts || {};
    if (expoOpts.mode === 'expoPublish') {
      return await this.publishToExpo(
          appName,
          code,
          animationOpts);
    }
    return this.exportAppToZip(
        appName,
        code,
        animationOpts,
        expoOpts.mode === 'expoZip'
      ).then(function (zip) {
        zip.generateAsync({type:"blob"}).then(function (blob) {
          saveAs(blob, appName + ".zip");
        });
      });
  },

  createPackageFilesFromZip(zip, appName) {
    const moduleList = [];
    zip.folder(appName + "/assets").forEach((fileName, file) => {
        if (!file.dir) {
          moduleList.push({ fileName });
        }
    });
    const entries = moduleList.map(module => exportExpoPackagedFilesEntryEjs({ module }));
    return exportExpoPackagedFilesEjs({ entries });
  },

  createPackageFilesFromExpoFiles(files) {
    const moduleList = [];
    const assetPrefix = "assets/";
    const assetPrefixLength = assetPrefix.length;
    for (const fileName in files) {
      if (fileName.indexOf(assetPrefix) !== 0) {
        continue;
      }
      const relativePath = fileName.substring(assetPrefixLength);
      moduleList.push({ fileName: relativePath });
    }
    const entries = moduleList.map(module => exportExpoPackagedFilesEntryEjs({ module }));
    return exportExpoPackagedFilesEjs({ entries });
  },

  async publishToExpo(appName, code, animationOpts) {
    const { origin } = window.location;
    const gamelabApiPath = getEnvironmentPrefix() === 'cdo-development' ?
      `${origin}/blockly/js/gamelab-api.js` :
      `${origin}/blockly/js/gamelab-api.min.js`;
    const p5Path = `${origin}/blockly/js/p5play/p5.js`;
    const p5playPath = `${origin}/blockly/js/p5play/p5.play.js`;
    const html = exportGamelabExpoIndexEjs({
      appName,
      jQueryPath: "https://code.jquery.com/jquery-1.12.1.min.js",
      gamelabApiPath,
      p5Path,
      p5playPath,
    });
    const appJs = exportExpoAppEjs({
      appHeight: GAME_HEIGHT,
      appWidth: GAME_WIDTH,
      hasDataAPIs: false,
    });

    const { appAssets, animationListJSON } = this.generateAppAssetsAndJSON({ code, animationOpts });
    const exportCode = exportGamelabCodeEjs({
      code,
      animationOpts,
      animationListJSON,
    });

    const files = {
      'App.js': { contents: appJs, type: 'CODE'},
      'CustomAsset.js': { contents: exportExpoCustomAssetJs, type: 'CODE'},
      'DataWarning.js': { contents: exportExpoDataWarningJs, type: 'CODE'},
    };

    const session = new SnackSession({
      sessionId: `${getEnvironmentPrefix()}-${project.getCurrentId()}`,
      files,
      name: project.getCurrentName(),
      sdkVersion: '25.0.0',
    });

    // Important that index.html comes first:
    const fileAssets = [
      { filename: 'index.html', data: html },
      { filename: 'code.j', data: rewriteAssetUrls(appAssets, exportCode) },
    ];

    const fileUploads = fileAssets.map(({ data }) =>
        session.uploadAssetAsync(new Blob([data]))
    );
    const snackFileUrls = await Promise.all(fileUploads);

    snackFileUrls.forEach((url, index) => {
      files['assets/' + fileAssets[index].filename] = {
        contents: url,
        type: 'ASSET',
      };
    });

    appAssets.push({
      url: exportExpoWarningPng,
      dataType: 'binary',
      filename: 'warning.png',
      assetLocation: 'appassets/',
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
      files[(appAssets[index].assetLocation || 'assets/') + appAssets[index].filename] = {
        contents: url,
        type: 'ASSET',
      };
    });
    files['packagedFiles.js'] = {
      contents: this.createPackageFilesFromExpoFiles(files),
      type: 'CODE',
    };

    await session.sendCodeAsync(files);
    const saveResult = await session.saveAsync();
    const expoURL = `exp://expo.io/@snack/${saveResult.id}`;

    return expoURL;
  },

  generateAppAssetsAndJSON(params) {
    const {
      animationOpts,
      code = '',
      rootRelativeAssetPrefix = '',
      zipAssetPrefix = ''
    } = params;
    const { animationList } = animationOpts;
    const { propsByKey: animationPropsByKey } = animationList;

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

    const animAssets = Object.entries(animationPropsByKey).map(([key, anim]) => {
      const { blob, sourceUrl } = anim;
      // If we have a sourceUrl, use it for the filename and url. Otherwise (in
      // cases where we only have a Blob), generate a filename/url from the key:
      const filename = sourceUrl ? sourceUrl.replace(/^\/+/g, '') : `${key}.png`;
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
    });

    const soundRegex = /(\bsound:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const allSounds = code.match(soundRegex) || [];
    const uniqueSounds = [...(new Set(allSounds))];
    const soundAssets = uniqueSounds.map(soundProtocolUrl => {
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

    const rewrittenAnimList = this.rewriteAnimationListSourceUrls(animationList, animAssets);

    return {
      appAssets: [
        ...appAssets,
        ...animAssets,
        ...soundAssets,
      ],
      animationListJSON: this.generateExportableAnimationListJSON(rewrittenAnimList),
    };
  }
};

// TODO: for expoMode, replace spaces in asset filenames or wait for this fix
// to make it into Metro Bundler:
// https://github.com/facebook/react-native/pull/10365
function rewriteAssetUrls(appAssets, data) {
  return appAssets.reduce(function (data, assetToDownload) {
    const searchUrl = assetToDownload.searchUrl || assetToDownload.filename;
    data = data.replace(new RegExp(`["|']${assetToDownload.url}["|']`, 'g'), `"${assetToDownload.rootRelativePath}"`);
    return data.replace(new RegExp(`["|']${searchUrl}["|']`, 'g'), `"${assetToDownload.rootRelativePath}"`);
  }, data);
}

function getEnvironmentPrefix() {
  const { hostname } = window.location;
  if (hostname.includes("adhoc")) {
    // As adhoc hostnames may include other keywords, check it first.
    return "cdo-adhoc";
  }
  if (hostname.includes("test")) {
    return "cdo-test";
  }
  if (hostname.includes("levelbuilder")) {
    return "cdo-levelbuilder";
  }
  if (hostname.includes("staging")) {
    return "cdo-staging";
  }
  if (hostname.includes("localhost")) {
    return "cdo-development";
  }
  if (hostname.includes("code.org")) {
    return "cdo";
  }
  return "cdo-unknown";
}
