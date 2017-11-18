/* global dashboard */
import $ from 'jquery';
import _ from 'lodash';
import JSZip from 'jszip';
import {saveAs} from 'filesaver.js';

import * as assetPrefix from '../assetManagement/assetPrefix';
import download from '../assetManagement/download';
import elementLibrary from './designElements/library';
import exportProjectEjs from '../templates/exportProject.html.ejs';
import exportProjectReadmeEjs from '../templates/exportProjectReadme.md.ejs';
import logToCloud from '../logToCloud';
import {getAppOptions} from '@cdo/apps/code-studio/initApp/loadApp';

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
  exportAppToZip(appName, code, levelHtml) {
    var holder = document.createElement('div');
    holder.innerHTML = levelHtml;
    var appElement = holder.children[0];
    appElement.id = 'divApplab';
    appElement.style.display = 'block';
    appElement.classList.remove('notRunning');
    appElement.classList.remove('withCrosshair');

    var css = extractCSSFromHTML(appElement);
    var html = exportProjectEjs({htmlBody: appElement.outerHTML});
    var readme = exportProjectReadmeEjs({appName: appName});
    var cacheBust = '?__cb__='+''+new String(Math.random()).slice(2);
    const staticAssets = [
      {
        url: '/blockly/js/en_us/common_locale.js' + cacheBust,
        zipPath: appName + '/common_locale.js'
      }, {
        url: '/blockly/js/en_us/applab_locale.js' + cacheBust,
        zipPath: appName + '/applab_locale.js'
      }, {
        url: '/blockly/js/applab-api.js' + cacheBust,
        zipPath: appName + '/applab/applab-api.js'
      }, {
        url: '/blockly/css/applab.css' + cacheBust,
        zipPath: appName + '/applab/applab.css'
      }, {
        url: '/blockly/css/common.css' + cacheBust,
        zipPath: appName + '/applab/common.css'
      },
    ];

    const appAssets = dashboard.assets.listStore.list().map(asset => ({
      url: assetPrefix.fixPath(asset.filename),
      rootRelativePath: 'assets/' + asset.filename,
      zipPath: appName + '/assets/' + asset.filename,
      dataType: 'binary',
      filename: asset.filename,
    }));

    function rewriteAssetUrls(data) {
      return appAssets.reduce(function (data, assetToDownload) {
        if (data.indexOf(assetToDownload.url) >= 0) {
          return data.split(assetToDownload.url).join(assetToDownload.rootRelativePath);
        }
        return data.split(assetToDownload.filename).join(assetToDownload.rootRelativePath);
      }, data);
    }

    var zip = new JSZip();
    zip.file(appName + "/README.txt", readme);
    zip.file(appName + "/index.html", rewriteAssetUrls(html));
    zip.file(appName + "/style.css", rewriteAssetUrls(css));
    zip.file(appName + "/code.js", rewriteAssetUrls(code));

    return new Promise((resolve, reject) => {
      $.when(...[...staticAssets, ...appAssets].map(
        (assetToDownload) => download(assetToDownload.url, assetToDownload.dataType || 'text')
      )).then(
        ([commonLocale], [applabLocale], [applabApi], [applabCSS], [commonCSS], ...rest) => {
          zip.file(appName + "/applab/applab-api.js",
                   [getAppOptionsFile(), commonLocale, applabLocale, applabApi].join('\n'));
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
                rootRelativePath: 'applab/assets' + url,
                zipPath: appName + '/applab/assets' + url,
              })
            );

          zip.file(appName + "/applab/applab.css", applabCSS);

          $.when(
            ...cssAssetsToDownload.map(
              assetToDownload => download(assetToDownload.url, 'binary')
            )
          ).then(
            (...assetResponses) => {
              assetResponses.forEach(([data], index) => {
                zip.file(cssAssetsToDownload[index].zipPath, data, {binary: true});
              });
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

  exportApp(appName, code, levelHtml) {
    return this.exportAppToZip(appName, code, levelHtml)
      .then(function (zip) {
        zip.generateAsync({type:"blob"}).then(function (blob) {
          saveAs(blob, appName + ".zip");
        });
      });
  }
};
