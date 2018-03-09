/* global dashboard */
import $ from 'jquery';
import _ from 'lodash';
import JSZip from 'jszip';
import {saveAs} from 'filesaver.js';
import {SnackSession} from 'snack-sdk';

import * as assetPrefix from '../assetManagement/assetPrefix';
import download from '../assetManagement/download';
import elementLibrary from './designElements/library';
import exportProjectEjs from '../templates/exportProject.html.ejs';
import exportExpoProjectEjs from '../templates/exportExpoProject.html.ejs';
import exportProjectReadmeEjs from '../templates/exportProjectReadme.md.ejs';
import exportExpoPackageJson from '../templates/exportExpoPackage.json.ejs';
import exportExpoAppJson from '../templates/exportExpoApp.json.ejs';
import exportExpoAppJs from '../templates/exportExpoApp.js.ejs';
import exportExpoCustomAssetJs from '../templates/exportExpoCustomAsset.js.ejs';
import exportExpoPackagedFiles from '../templates/exportExpoPackagedFiles.js.ejs';
import exportExpoPackagedFilesEntry from '../templates/exportExpoPackagedFilesEntry.js.ejs';
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
    var holder = document.createElement('div');
    holder.innerHTML = levelHtml;
    var appElement = holder.children[0];
    appElement.id = 'divApplab';
    appElement.style.display = 'block';
    appElement.classList.remove('notRunning');
    appElement.classList.remove('withCrosshair');

    const jQueryBaseName = 'jquery-1.12.1.min';
    const exportHtmlEjs = expoMode ? exportExpoProjectEjs : exportProjectEjs;
    var css = extractCSSFromHTML(appElement);
    var html = exportHtmlEjs({htmlBody: appElement.outerHTML});
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

    // TODO: for expoMode, replace spaces in asset filenames or wait for this fix
    // to make it into Metro Bundler:
    // https://github.com/facebook/react-native/pull/10365
    function rewriteAssetUrls(data) {
      return appAssets.reduce(function (data, assetToDownload) {
        if (data.indexOf(assetToDownload.url) >= 0) {
          return data.split(assetToDownload.url).join(assetToDownload.rootRelativePath);
        }
        return data.split(assetToDownload.filename).join(assetToDownload.rootRelativePath);
      }, data);
    }

    const mainProjectFilesPrefix = appName + (expoMode ? '/assets/' : '/');

    var zip = new JSZip();
    if (expoMode) {
      const packageJson = exportExpoPackageJson();
      const appJson = exportExpoAppJson({appName: appName});
      const appJs = exportExpoAppJs();
      const customAssetJs = exportExpoCustomAssetJs();

      zip.file(appName + "/package.json", packageJson);
      zip.file(appName + "/app.json", appJson);
      zip.file(appName + "/App.js", appJs);
      zip.file(appName + "/CustomAsset.js", customAssetJs);
    }
    // NOTE: for expoMode, it is important that index.html comes first...
    zip.file(mainProjectFilesPrefix + "index.html", rewriteAssetUrls(html));
    zip.file(mainProjectFilesPrefix + "README.txt", readme);
    zip.file(mainProjectFilesPrefix + "style.css", rewriteAssetUrls(css));
    zip.file(mainProjectFilesPrefix + (expoMode ? "code.j" : "code.js"), rewriteAssetUrls(code));

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
                const moduleList = [];
                zip.folder(appName + "/assets").forEach((relativePath, file) => {
                    if (!file.dir) {
                      const localDir = relativePath.substr(0, relativePath.lastIndexOf('/'));
                      if (localDir) {
                        moduleList.push({
                          fileName: relativePath,
                          localDir,
                        });
                      } else {
                        moduleList.push({ fileName: relativePath });
                      }
                    }
                });
                const entries = moduleList.map(module => exportExpoPackagedFilesEntry({ module }));
                const packagedFilesJs = exportExpoPackagedFiles({ entries });
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

  async exportApp(appName, code, levelHtml, expoMode) {
    if (expoMode) {
      const session = this.publishToExpo(appName, code, levelHtml);
      const sessionId = await session.startAsync();
      const url = await session.getUrlAsync();
      const appJs = exportExpoAppJs();
      const files = {
        'App.js': { contents: appJs, type: 'CODE'},
        'test.js': { contents: appJs, type: 'CODE'},
  //      'assets/jquery-1.12.1.min.j': { content: 'https://code.jquery.com/jquery-1.12.1.min.js', type: 'ASSET'},
      };
      await session.sendCodeAsync(files);
      const saveResult = await session.saveAsync();
      return Promise.resolve();
    }
    return this.exportAppToZip(appName, code, levelHtml, expoMode)
      .then(function (zip) {
        zip.generateAsync({type:"blob"}).then(function (blob) {
          saveAs(blob, appName + ".zip");
        });
      });
  },

  publishToExpo(appName, code, levelHtml) {
    const appJs = exportExpoAppJs();
    const files = {
      'App.js': { contents: appJs, type: 'CODE'},
      'test.js': { contents: appJs, type: 'CODE'},
//      'assets/jquery-1.12.1.min.j': { content: 'https://code.jquery.com/jquery-1.12.1.min.js', type: 'ASSET'},
    };
    // const dependencies = {
    //   "expo": "^25.0.0",
    //   "react": "16.2.0",
    //   "react-native": "https://github.com/expo/react-native/archive/sdk-25.0.0.tar.gz"
    // };

    let session = new SnackSession({
      sessionId: `${getEnvironmentPrefix()}-${project.getCurrentId()}`,
      files,
      name: project.getCurrentName(),
      sdkVersion: '25.0.0',
    });

    return session;
  }
};

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
