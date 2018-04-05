/* global dashboard */
import $ from 'jquery';
import _ from 'lodash';
import JSZip from 'jszip';
import {saveAs} from 'filesaver.js';
import {SnackSession} from '@code-dot-org/snack-sdk';

import * as assetPrefix from '../assetManagement/assetPrefix';
import download from '../assetManagement/download';
import elementLibrary from './designElements/library';
import exportProjectEjs from '../templates/export/project.html.ejs';
import exportProjectReadmeEjs from '../templates/export/projectReadme.md.ejs';
import exportExpoIndexEjs from '../templates/export/expo/index.html.ejs';
import exportExpoPackageJson from '../templates/export/expo/package.exported_json';
import exportExpoAppJsonEjs from '../templates/export/expo/app.json.ejs';
import exportExpoAppJs from '../templates/export/expo/App.exported_js';
import exportExpoCustomAssetJs from '../templates/export/expo/CustomAsset.exported_js';
import exportExpoPackagedFilesEjs from '../templates/export/expo/packagedFiles.js.ejs';
import exportExpoPackagedFilesEntryEjs from '../templates/export/expo/packagedFilesEntry.js.ejs';
import exportExpoIconPng from '../templates/export/expo/icon.png';
import exportExpoSplashPng from '../templates/export/expo/splash.png';
import logToCloud from '../logToCloud';
import {getAppOptions} from '@cdo/apps/code-studio/initApp/loadApp';
import project from '@cdo/apps/code-studio/initApp/project';

// This whitelist determines which appOptions properties
// will get exported with the applab app, appearing in the
// final applab.js file. It's a recursive whitelist, so
// each key/value pair is the name of a property and either
// a boolean indicating whether or not that property should
// be included or another whitelist for subproperties at that
// location.
const APP_OPTIONS_WHITELIST = {
  "levelGameName": true,
  "skinId": true,
  "baseUrl": true,
  "app": true,
  "droplet": true,
  "pretty": true,
  "level": {
    "skin": true,
    "editCode": true,
    "embed": true,
    "isK1": false,
    "isProjectLevel": true,
    "skipInstructionsPopup": true,
    "disableParamEditing": true,
    "disableVariableEditing": true,
    "useModalFunctionEditor": true,
    "useContractEditor": true,
    "contractHighlight": true,
    "contractCollapse": true,
    "examplesHighlight": true,
    "examplesCollapse": true,
    "definitionHighlight": true,
    "definitionCollapse": true,
    "freePlay": true,
    "appWidth": true,
    "appHeight": true,
    "sliderSpeed": true,
    "calloutJson": true,
    "disableExamples": true,
    "showTurtleBeforeRun": true,
    "autocompletePaletteApisOnly": true,
    "textModeAtStart": true,
    "designModeAtStart": true,
    "hideDesignMode": true,
    "beginnerMode": true,
    "levelId": true,
    "puzzle_number": true,
    "stage_total": true,
    "iframeEmbed": true,
    "lastAttempt": true,
    "submittable": true
  },
  "showUnusedBlocks": true,
  "fullWidth": true,
  "noHeader": true,
  "noFooter": true,
  "smallFooter": true,
  "codeStudioLogo": true,
  "hasI18n": true,
  "callouts": true,
  "channel": true,
  "readonlyWorkspace": true,
  "isLegacyShare": true,
  "postMilestoneMode": true,
  "puzzleRatingsUrl": false,
  "authoredHintViewRequestsUrl": false,
  "serverLevelId": false,
  "gameDisplayName": true,
  "publicCaching": true,
  "is13Plus": true,
  "hasContainedLevels": true,
  "hideSource": true,
  "share": true,
  "labUserId": false,
  "firebaseName": false,
  "firebaseAuthToken": false,
  "firebaseChannelIdSuffix": false,
  "isSignedIn": true,
  "pinWorkspaceToBottom": true,
  "hasVerticalScrollbars": true,
  "showExampleTestButtons": true,
  "report": {
    "fallback_response": true,
    "callback": true,
    "sublevelCallback": true,
  },
  "sendToPhone": true,
  "send_to_phone_url": true,
  "copyrightStrings": {
    "thank_you": true,
    "help_from_html": true,
    "art_from_html": true,
    "code_from_html": true,
    "powered_by_aws": true,
    "trademark": true,
  },
  "teacherMarkdown": false,
  "dialog": {
    "skipSound": true,
    "preTitle": true,
    "fallbackResponse": true,
    "callback": true,
    "sublevelCallback": true,
    "app": true,
    "level": true,
    "shouldShowDialog": true,
  },
  "locale": true,
};

// this configuration forces certain values to show up
// in the appOptions config. These values will be assigned
// regardless of whether or not they are in the whitelist
const APP_OPTIONS_OVERRIDES = {
  readonlyWorkspace: true,
};

export function getAppOptionsFile() {
  function getAppOptionsAtPath(whitelist, sourceOptions) {
    if (!whitelist || !sourceOptions) {
      return null;
    }
    return _.reduce(whitelist, (memo, value, key) => {
      if (value === true) {
        memo[key] = sourceOptions[key];
      } else if (typeof value === 'object' && typeof sourceOptions[key] === 'object') {
        memo[key] = getAppOptionsAtPath(value, sourceOptions[key]);
      }
      return memo;
    }, {});
  }
  const options = getAppOptionsAtPath(APP_OPTIONS_WHITELIST, getAppOptions());
  _.merge(options, APP_OPTIONS_OVERRIDES);
  return `window.APP_OPTIONS = ${JSON.stringify(options)};`;
}


/**
 * Extracts a CSS file from the given HTML dom node by traversing each node and
 * looking at the style attributes. We use the element library to determine
 * which styles are common among each element and split those out into more
 * generic selectors. This function also removes all the style attributes from
 * the elements.
 */
function extractCSSFromHTML(el) {
  var css = [];

  // We need to prefix all of our selectors with divApplab to overcome the
  // precendence of css defined in applab.css
  var selectorPrefix = '#divApplab.appModern ';

  var baseEls = {};
  for (var elementType in elementLibrary.ElementType) {
    var baseEl = elementLibrary.createElement(elementType, 0, 0, true);
    baseEls[elementType] = baseEl;
    var selector = selectorPrefix + baseEl.tagName.toLowerCase();
    if (baseEl.classList.length > 0) {
      selector += '.' + baseEl.classList[0];
    }
    if (baseEl.tagName.toLowerCase() === 'input') {
      selector += '[type=' + (baseEl.getAttribute('type') || 'text') + ']';
    }
    selector += ',\n' + selector + ':hover';
    css.push(selector + ' {');
    for (var k = 0; k < baseEl.style.length; k++) {
      var key = baseEl.style[k];
      css.push('  ' + key + ': ' + baseEl.style[key] + ';');
    }
    css.push('}');
    css.push('');
  }

  function traverse(root) {
    for (var i = 0; i < root.children.length; i++) {
      var child = root.children[i];
      var elementType = elementLibrary.getElementType(child, true);
      if (elementType) {
        var styleDiff = [];
        for (var k = 0; k < child.style.length; k++) {
          var key = child.style[k];
          if (child.style[key] !== baseEls[elementType].style[key]) {
            styleDiff.push('  ' + key + ': ' + child.style[key] + ';');
          }
        }
        child.removeAttribute('style');
        if (child.tagName.toLowerCase() === 'input') {
          // make sure all input tags have a type attribute specified
          if (!child.getAttribute('type')) {
            child.setAttribute('type', 'text');
          }
        }
        if (styleDiff.length > 0) {
          css.push(selectorPrefix + '#' + child.id + ' {');
          css = css.concat(styleDiff);
          css.push('}');
          css.push('');
        }
      }
      traverse(child);
    }
  }
  traverse(el);
  return css.join('\n');
}

export default {
  exportAppToZip(appName, code, levelHtml, expoMode) {
    const { css, outerHTML } = transformLevelHtml(levelHtml);

    const jQueryBaseName = 'jquery-1.12.1.min';
    var html;
    if (expoMode) {
      html = exportExpoIndexEjs({
        htmlBody: outerHTML,
        applabApiPath: "applab-api.j",
        jQueryPath: jQueryBaseName + ".j",
        applabCssPath: "applab/applab.css",
        appOptionsPath: null,
        commonLocalePath: null,
        applabLocalePath: null,
        commonCssPath: null,
      });
    } else {
      html = exportProjectEjs({htmlBody: outerHTML});
    }
    var readme = exportProjectReadmeEjs({appName: appName});
    var cacheBust = '?__cb__='+''+new String(Math.random()).slice(2);
    const staticAssets = [
      {
        url: '/blockly/js/en_us/common_locale.js' + cacheBust,
      }, {
        url: '/blockly/js/en_us/applab_locale.js' + cacheBust,
      }, {
        url: '/blockly/js/applab-api.js' + cacheBust,
      }, {
        url: '/blockly/css/applab.css' + cacheBust,
      }, {
        url: '/blockly/css/common.css' + cacheBust,
      },
    ];
    if (expoMode) {
      staticAssets.push({
        url: 'https://code.jquery.com/' + jQueryBaseName + '.js',
      });
    }

    const rootRelativeAssetPrefix = expoMode ? '' : 'assets/';
    const zipAssetPrefix = appName + '/assets/';

    const appAssets = dashboard.assets.listStore.list().map(asset => ({
      url: assetPrefix.fixPath(asset.filename),
      rootRelativePath: rootRelativeAssetPrefix + asset.filename,
      zipPath: zipAssetPrefix + asset.filename,
      dataType: 'binary',
      filename: asset.filename,
    }));

    if (expoMode) {
      appAssets.push({
        url: exportExpoIconPng,
        rootRelativePath: 'appassets/icon.png',
        zipPath: appName + '/appassets/icon.png',
        dataType: 'binary',
        filename: 'icon.png',
      });
      appAssets.push({
        url: exportExpoSplashPng,
        rootRelativePath: 'appassets/splash.png',
        zipPath: appName + '/appassets/splash.png',
        dataType: 'binary',
        filename: 'splash.png',
      });
    }

    const mainProjectFilesPrefix = appName + (expoMode ? '/assets/' : '/');

    var zip = new JSZip();
    if (expoMode) {
      const appJson = exportExpoAppJsonEjs({
        appName: appName,
        projectId: project.getCurrentId()
      });

      zip.file(appName + "/package.json", exportExpoPackageJson);
      zip.file(appName + "/app.json", appJson);
      zip.file(appName + "/App.js", exportExpoAppJs);
      zip.file(appName + "/CustomAsset.js", exportExpoCustomAssetJs);
    }
    // NOTE: for expoMode, it is important that index.html comes first...
    zip.file(mainProjectFilesPrefix + "index.html", rewriteAssetUrls(appAssets, html));
    zip.file(mainProjectFilesPrefix + "README.txt", readme);
    zip.file(mainProjectFilesPrefix + "style.css", rewriteAssetUrls(appAssets, css));
    zip.file(mainProjectFilesPrefix + (expoMode ? "code.j" : "code.js"), rewriteAssetUrls(appAssets, code));

    const rootApplabPrefix = expoMode ? 'assets/applab/' : 'applab/';
    const rootRelativeApplabAssetPrefix = rootApplabPrefix + 'assets';
    const zipApplabAssetPrefix = appName + '/' + rootRelativeApplabAssetPrefix;

    return new Promise((resolve, reject) => {
      $.when(...[...staticAssets, ...appAssets].map(
        (assetToDownload) => download(assetToDownload.url, assetToDownload.dataType || 'text')
      )).then(
        ([commonLocale], [applabLocale], [applabApi], [applabCSS], [commonCSS], ...rest) => {
          zip.file(appName + "/" + (expoMode ? "assets/applab-api.j" : rootApplabPrefix + "applab-api.js"),
                   [getAppOptionsFile(), commonLocale, applabLocale, applabApi].join('\n'));
          if (expoMode) {
            const [data] = rest[0];
            zip.file(mainProjectFilesPrefix + jQueryBaseName + '.j', data);
            // Remove the jquery file from the rest array:
            rest = rest.slice(1);
          }
          rest.forEach(([data], index) => {
            zip.file(appAssets[index].zipPath, data, {binary: true});
          });

          // Extract urls from applab.css that point to other assets we need to download
          applabCSS = commonCSS + applabCSS;
          const cssAssetsToDownload = (applabCSS.match(/url\(['"]?\/[^)]+['"]?\)/ig) || [])
            .map(
              urlRef => {
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
              }
            )
            .filter(url => !!url)
            .map(
              url => ({
                url,
                rootRelativePath: rootRelativeApplabAssetPrefix + url,
                zipPath: zipApplabAssetPrefix + url,
              })
            );

          zip.file(appName + "/" + rootApplabPrefix + "applab.css", applabCSS);

          $.when(
            ...cssAssetsToDownload.map(
              assetToDownload => download(assetToDownload.url, 'binary')
            )
          ).then(
            (...assetResponses) => {
              assetResponses.forEach(([data], index) => {
                zip.file(cssAssetsToDownload[index].zipPath, data, {binary: true});
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
              return reject(new Error("failed to fetch css assets"));
            }
          );
        },
        () => {
          logToCloud.addPageAction(logToCloud.PageAction.staticResourceFetchError, {
            app: 'applab'
          }, 1/100);
          reject(new Error("failed to fetch assets"));
        }
      );
    });
  },

  async exportApp(appName, code, levelHtml, suppliedExpoOpts) {
    const expoOpts = suppliedExpoOpts || {};
    if (expoOpts.mode === 'publish') {
      return await this.publishToExpo(appName, code, levelHtml);
    }
    return this.exportAppToZip(appName, code, levelHtml, expoOpts.mode === 'zip')
      .then(function (zip) {
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

  async publishToExpo(appName, code, levelHtml) {
    const appOptionsJs = getAppOptionsFile();
    const { css, outerHTML } = transformLevelHtml(levelHtml);
    const html = exportExpoIndexEjs({
      htmlBody: outerHTML,
      commonLocalePath: "https://studio.code.org/blockly/js/en_us/common_locale.js",
      applabLocalePath: "https://studio.code.org/blockly/js/en_us/applab_locale.js",
      appOptionsPath: "appOptions.j",
      applabApiPath: "https://studio.code.org/blockly/js/applab-api.js",
      jQueryPath: "https://code.jquery.com/jquery-1.12.1.min.js",
      commonCssPath: "https://studio.code.org/blockly/css/common.css",
      applabCssPath: "https://studio.code.org/blockly/css/applab.css",
    });

    const appAssets = dashboard.assets.listStore.list().map(asset => ({
      url: assetPrefix.fixPath(asset.filename),
      rootRelativePath: asset.filename,
      dataType: 'binary',
      filename: asset.filename,
    }));

    const files = {
      'App.js': { contents: exportExpoAppJs, type: 'CODE'},
      'CustomAsset.js': { contents: exportExpoCustomAssetJs, type: 'CODE'},
    };

    const session = new SnackSession({
      sessionId: `${getEnvironmentPrefix()}-${project.getCurrentId()}`,
      files,
      name: project.getCurrentName(),
      sdkVersion: '25.0.0',
    });

    // Important that index.html comes first:
    const fileAssets = [
      { filename: 'index.html', data: rewriteAssetUrls(appAssets, html) },
      { filename: 'style.css', data: rewriteAssetUrls(appAssets, css) },
      { filename: 'code.j', data: rewriteAssetUrls(appAssets, code) },
      { filename: 'appOptions.j', data: appOptionsJs },
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

    const assetDownloads = appAssets.map(asset =>
      download(asset.url, asset.dataType || 'text')
    );

    const downloadedAssets = await Promise.all(assetDownloads);
    const assetUploads = downloadedAssets.map(downloadedAsset =>
        session.uploadAssetAsync(downloadedAsset)
    );
    const snackAssetUrls = await Promise.all(assetUploads);

    snackAssetUrls.forEach((url, index) => {
      files['assets/' + appAssets[index].filename] = {
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
  }
};

// TODO: for expoMode, replace spaces in asset filenames or wait for this fix
// to make it into Metro Bundler:
// https://github.com/facebook/react-native/pull/10365
function rewriteAssetUrls(appAssets, data) {
  return appAssets.reduce(function (data, assetToDownload) {
    data = data.replace(new RegExp(`["|']${assetToDownload.url}["|']`), `"${assetToDownload.rootRelativePath}"`);
    return data.replace(new RegExp(`["|']${assetToDownload.filename}["|']`), `"${assetToDownload.rootRelativePath}"`);
  }, data);
}

function transformLevelHtml(levelHtml) {
  const holder = document.createElement('div');
  holder.innerHTML = levelHtml;
  const appElement = holder.children[0];
  appElement.id = 'divApplab';
  appElement.style.display = 'block';
  appElement.classList.remove('notRunning');
  appElement.classList.remove('withCrosshair');

  // NOTE: this also modifies appElement!
  const css = extractCSSFromHTML(appElement);

  return {
    outerHTML: appElement.outerHTML,
    css,
  };
}

function getEnvironmentPrefix() {
  const hostname = window.location.hostname;
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
