import {saveAs} from 'filesaver.js';
import $ from 'jquery';
import JSZip from 'jszip';
import _ from 'lodash';

import {getAppOptions} from '@cdo/apps/code-studio/initApp/loadApp';
import project from '@cdo/apps/code-studio/initApp/project';

import * as assetPrefix from '../assetManagement/assetPrefix';
import download from '../assetManagement/download';
import logToCloud from '../logToCloud';
import exportFontAwesomeCssEjs from '../templates/export/fontAwesome.css.ejs';
import exportProjectEjs from '../templates/export/project.html.ejs';
import exportProjectReadmeEjs from '../templates/export/projectReadme.md.ejs';
import {
  extractSoundAssets,
  rewriteAssetUrls,
  fetchWebpackRuntime,
} from '../util/exporter';

// This allowlist determines which appOptions properties
// will get exported with the applab app, appearing in the
// final applab.js file. It's a recursive allowlist, so
// each key/value pair is the name of a property and either
// a boolean indicating whether or not that property should
// be included or another allowlist for subproperties at that
// location.
const APP_OPTIONS_ALLOWLIST = {
  levelGameName: true,
  skinId: true,
  baseUrl: true,
  app: true,
  droplet: true,
  level: {
    skin: true,
    editCode: true,
    embed: true,
    isK1: false,
    isProjectLevel: true,
    skipInstructionsPopup: true,
    disableParamEditing: true,
    disableVariableEditing: true,
    useModalFunctionEditor: true,
    useContractEditor: true,
    contractHighlight: true,
    contractCollapse: true,
    examplesHighlight: true,
    examplesCollapse: true,
    definitionHighlight: true,
    definitionCollapse: true,
    freePlay: true,
    appWidth: true,
    appHeight: true,
    sliderSpeed: true,
    calloutJson: true,
    disableExamples: true,
    showTurtleBeforeRun: true,
    autocompletePaletteApisOnly: true,
    textModeAtStart: true,
    designModeAtStart: true,
    hideDesignMode: true,
    beginnerMode: true,
    levelId: true,
    puzzle_number: true,
    lesson_total: true,
    iframeEmbed: true,
    lastAttempt: true,
    submittable: true,
  },
  showUnusedBlocks: true,
  fullWidth: true,
  noHeader: true,
  noFooter: true,
  smallFooter: true,
  codeStudioLogo: true,
  hasI18n: true,
  callouts: true,
  channel: true,
  readonlyWorkspace: true,
  isLegacyShare: true,
  postMilestoneMode: true,
  puzzleRatingsUrl: false,
  authoredHintViewRequestsUrl: false,
  serverLevelId: false,
  gameDisplayName: true,
  appName: true,
  publicCaching: true,
  is13Plus: true,
  hasContainedLevels: true,
  hideSource: true,
  share: true,
  labUserId: false,
  isSignedIn: true,
  pinWorkspaceToBottom: true,
  hasVerticalScrollbars: true,
  showExampleTestButtons: true,
  report: {
    fallback_response: true,
    callback: true,
    sublevelCallback: true,
  },
  isUS: true,
  send_to_phone_url: true,
  copyrightStrings: {
    thanks: true,
    help_from_html: true,
    art_from_html: true,
    code_from_html: true,
    powered_by_aws: true,
    trademark: true,
  },
  teacherMarkdown: false,
  dialog: {
    skipSound: true,
    preTitle: true,
    fallbackResponse: true,
    callback: true,
    sublevelCallback: true,
    app: true,
    level: true,
    shouldShowDialog: true,
  },
  locale: true,
};

// this configuration forces certain values to show up
// in the appOptions config. These values will be assigned
// regardless of whether or not they are in the allowlist
const APP_OPTIONS_OVERRIDES = {
  readonlyWorkspace: true,
};

export function getAppOptionsFile() {
  function getAppOptionsAtPath(allowlist, sourceOptions) {
    if (!allowlist || !sourceOptions) {
      return null;
    }
    return _.reduce(
      allowlist,
      (memo, value, key) => {
        if (value === true) {
          memo[key] = sourceOptions[key];
        } else if (
          typeof value === 'object' &&
          typeof sourceOptions[key] === 'object'
        ) {
          memo[key] = getAppOptionsAtPath(value, sourceOptions[key]);
        }
        return memo;
      },
      {}
    );
  }
  const options = getAppOptionsAtPath(APP_OPTIONS_ALLOWLIST, getAppOptions());
  _.merge(options, APP_OPTIONS_OVERRIDES);

  // call non-allowlisted hasDataAPIs() function and persist as a bool in
  // the exported options:
  const {shareWarningInfo = {}} = getAppOptions();
  const {hasDataAPIs} = shareWarningInfo;
  options.exportUsesDataAPIs = hasDataAPIs && hasDataAPIs();

  return `window.APP_OPTIONS = ${JSON.stringify(options)};`;
}

// This list of fonts is derived from the set of fonts needed for V4 compatibility here:
// https://dsco.code.org/assets/font-awesome-pro/1684178876/css/v4-font-face.css
// Icons in use in student projects created in Applab are derived from an older version of FontAwesome (V3?), while
// the rest of Code.org (ie, the pegasus/dashboard sites themselves)
// are all on v6. See the following for more details:
// https://github.com/code-dot-org/code-dot-org/blob/960e2e5766ebf4ceb526064a71a91a520dcd61bc/apps/src/code-studio/components/icons.js
const fontAwesomeBrandsWOFFRelativeSourcePath =
  'https://dsco.code.org/assets/font-awesome-pro/1684178876/webfonts/fa-brands-400.woff2';
const fontAwesomeSolidWOFFRelativeSourcePath =
  'https://dsco.code.org/assets/font-awesome-pro/1684178876/webfonts/fa-solid-900.woff2';
const fontAwesomeRegularWOFFRelativeSourcePath =
  'https://dsco.code.org/assets/font-awesome-pro/1684178876/webfonts/fa-regular-400.woff2';
const fontAwesomeV4CompatibilityWOFFRelativeSourcePath =
  'https://dsco.code.org/assets/font-awesome-pro/1684178876/webfonts/fa-v4compatibility.woff2';

const fontAwesomeBrandsWOFFPath = 'applab/fa-brands-400.woff2';
const fontAwesomeSolidWOFFPath = 'applab/fa-solid-900.woff2';
const fontAwesomeRegularWOFFPath = 'applab/fa-regular-400.woff2';
const fontAwesomeV4CompatibilityWOFFPath = 'applab/fa-v4compatibility.woff2';

/**
 * Retrieves the export config object.
 * @returns {{path: string}}
 */
function getExportConfig() {
  const exportConfigUrlSuffix = 'export_config?script_call=setExportConfig';
  const baseHref = project.getShareUrl();

  return {path: `${baseHref}/${exportConfigUrlSuffix}`};
}

export default {
  async exportAppToZip(appName, code, levelHtml) {
    const transformedHTML = transformLevelHtml(levelHtml);

    const exportConfig = getExportConfig();
    var html = exportProjectEjs({
      appName,
      exportConfigPath: exportConfig.path,
      htmlBody: transformedHTML,
      faBrandsPath: fontAwesomeBrandsWOFFPath,
      faSolidPath: fontAwesomeSolidWOFFPath,
      faRegularPath: fontAwesomeRegularWOFFPath,
      faV4CompatibilityPath: fontAwesomeV4CompatibilityWOFFPath,
    });
    var readme = exportProjectReadmeEjs({appName: appName});
    var cacheBust = '?__cb__=' + '' + new String(Math.random()).slice(2);
    const staticAssets = [
      {
        url: '/blockly/js/en_us/common_locale.js' + cacheBust,
      },
      {
        url: '/blockly/js/en_us/applab_locale.js' + cacheBust,
      },
      {
        url: '/blockly/css/applab.css' + cacheBust,
      },
      {
        url: '/blockly/css/common.css' + cacheBust,
      },
      {
        dataType: 'binary',
        url: fontAwesomeBrandsWOFFRelativeSourcePath + cacheBust,
      },
      {
        dataType: 'binary',
        url: fontAwesomeSolidWOFFRelativeSourcePath + cacheBust,
      },
      {
        dataType: 'binary',
        url: fontAwesomeRegularWOFFRelativeSourcePath + cacheBust,
      },
      {
        dataType: 'binary',
        url: fontAwesomeV4CompatibilityWOFFRelativeSourcePath + cacheBust,
      },
    ];

    const rootRelativeAssetPrefix = 'assets/';
    const zipAssetPrefix = appName + '/assets/';

    const appAssets = generateAppAssets({
      html,
      code,
      rootRelativeAssetPrefix,
      zipAssetPrefix,
    });

    const mainProjectFilesPrefix = appName + '/';

    var zip = new JSZip();
    zip.file(appName + '/README.txt', readme);
    zip.file(
      mainProjectFilesPrefix + 'index.html',
      rewriteAssetUrls(appAssets, html)
    );
    const fontAwesomeCSS = exportFontAwesomeCssEjs({
      fontBrandsPath: fontAwesomeBrandsWOFFPath,
      fontSolidPath: fontAwesomeSolidWOFFPath,
      fontRegularPath: fontAwesomeRegularWOFFPath,
      fontV4CompatibilityPath: fontAwesomeV4CompatibilityWOFFPath,
    });
    zip.file(mainProjectFilesPrefix + 'style.css', fontAwesomeCSS);
    zip.file(
      mainProjectFilesPrefix + 'code.js',
      rewriteAssetUrls(appAssets, code)
    );

    const rootApplabPrefix = 'applab/';
    const rootRelativeApplabAssetPrefix = rootApplabPrefix + 'assets';
    const zipApplabAssetPrefix = appName + '/' + rootRelativeApplabAssetPrefix;

    // webpack-runtime must appear exactly once on any page containing webpack entries.
    const webpackRuntimeAsset = fetchWebpackRuntime(cacheBust);

    // Attempt to fetch applab-api.min.js if possible, but when running on non-production
    // environments, fallback if we can't fetch that file to use applab-api.js:
    const applabApiAsset = new $.Deferred();
    download('/blockly/js/applab-api.min.js' + cacheBust, 'text').then(
      (data, success, jqXHR) => applabApiAsset.resolve([data, success, jqXHR]),
      () =>
        download('/blockly/js/applab-api.js' + cacheBust, 'text').then(
          (data, success, jqXHR) =>
            applabApiAsset.resolve([data, success, jqXHR]),
          () =>
            applabApiAsset.reject(new Error('failed to fetch applab-api.js'))
        )
    );

    return new Promise((resolve, reject) => {
      $.when(
        webpackRuntimeAsset,
        applabApiAsset,
        ...[...staticAssets, ...appAssets].map(assetToDownload =>
          download(assetToDownload.url, assetToDownload.dataType || 'text')
        )
      ).then(
        (
          [webpackRuntime],
          [applabApi],
          [commonLocale],
          [applabLocale],
          [applabCSS],
          [commonCSS],
          [fontAwesomeBrandsWOFF],
          [fontAwesomeSolidWOFF],
          [fontAwesomeRegularWOFF],
          [fontAwesomeV4CompatibilityWOFF],
          ...rest
        ) => {
          const appOptionsContents = getAppOptionsFile();
          zip.file(
            appName + '/' + rootApplabPrefix + 'applab-api.js',
            [
              webpackRuntime,
              appOptionsContents,
              commonLocale,
              applabLocale,
              applabApi,
            ].join('\n')
          );
          zip.file(
            mainProjectFilesPrefix + fontAwesomeBrandsWOFFPath,
            fontAwesomeBrandsWOFF
          );
          zip.file(
            mainProjectFilesPrefix + fontAwesomeSolidWOFFPath,
            fontAwesomeSolidWOFF
          );
          zip.file(
            mainProjectFilesPrefix + fontAwesomeRegularWOFFPath,
            fontAwesomeRegularWOFF
          );
          zip.file(
            mainProjectFilesPrefix + fontAwesomeV4CompatibilityWOFFPath,
            fontAwesomeV4CompatibilityWOFF
          );
          rest.forEach(([data], index) => {
            zip.file(appAssets[index].zipPath, data, {binary: true});
          });

          // Extract urls from applab.css that point to other assets we need to download
          applabCSS = commonCSS + applabCSS;
          const cssAssetsToDownload = (
            applabCSS.match(/url\(['"]?\/[^)]+['"]?\)/gi) || []
          )
            .map(urlRef => {
              const matches = urlRef.match(/url\(['"]?(\/[^'")]+)['"]?\)/i);
              if (matches) {
                const [cssURLRule, url] = matches;
                while (applabCSS.indexOf(cssURLRule) >= 0) {
                  applabCSS = applabCSS.replace(
                    cssURLRule,
                    `url("assets${url}")`
                  );
                }
                return url;
              }
            })
            .filter(url => !!url)
            .map(url => ({
              url,
              rootRelativePath: rootRelativeApplabAssetPrefix + url,
              zipPath: zipApplabAssetPrefix + url,
            }));

          zip.file(appName + '/' + rootApplabPrefix + 'applab.css', applabCSS);

          $.when(
            ...cssAssetsToDownload.map(assetToDownload =>
              download(assetToDownload.url, 'binary')
            )
          ).then(
            (...assetResponses) => {
              assetResponses.forEach(([data], index) => {
                zip.file(cssAssetsToDownload[index].zipPath, data, {
                  binary: true,
                });
              });
              return resolve(zip);
            },
            () => {
              return reject(new Error('failed to fetch css assets'));
            }
          );
        },
        () => {
          logToCloud.addPageAction(
            logToCloud.PageAction.StaticResourceFetchError,
            {
              app: 'applab',
            },
            1 / 100
          );
          reject(new Error('failed to fetch assets'));
        }
      );
    });
  },

  exportApp(appName, code, levelHtml) {
    return this.exportAppToZip(appName, code, levelHtml).then(function (zip) {
      zip.generateAsync({type: 'blob'}).then(function (blob) {
        saveAs(blob, appName + '.zip');
      });
    });
  },
};

function generateAppAssets(params) {
  const {
    html = '',
    code = '',
    rootRelativeAssetPrefix = '',
    zipAssetPrefix = '',
  } = params;

  const appAssets = dashboard.assets.listStore.list().map(asset => ({
    url: assetPrefix.fixPath(asset.filename),
    rootRelativePath: rootRelativeAssetPrefix + asset.filename,
    zipPath: zipAssetPrefix + asset.filename,
    dataType: 'binary',
    filename: asset.filename,
  }));

  const soundAssets = extractSoundAssets({
    sources: [html, code],
    rootRelativeAssetPrefix,
    zipAssetPrefix,
  });

  return [...appAssets, ...soundAssets];
}

function transformLevelHtml(levelHtml) {
  const holder = document.createElement('div');
  holder.innerHTML = levelHtml;
  const appElement = holder.children[0];
  appElement.id = 'divApplab';
  appElement.style.display = 'block';
  appElement.classList.remove('notRunning');
  appElement.classList.remove('withCrosshair');
  appElement.style.transform = '';

  return appElement.outerHTML;
}
