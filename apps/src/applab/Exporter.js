/* global dashboard */

// TODO(pcardune): Stop using the already packaged/minified version of jszip in
// favor just plain jszip. Due to a bug in (probably) browserify, we need to use
// the minified version. See this comment for more details:
// https://github.com/code-dot-org/code-dot-org/pull/8071#issuecomment-214931393
var JSZip = require('jszip/dist/jszip.min');
var saveAs = require('filesaver.js').saveAs;

var assetPrefix = require('../assetManagement/assetPrefix');
var download = require('../assetManagement/download');
var elementLibrary = require('./designElements/library');
var exportProjectEjs = require('../templates/exportProject.html.ejs');
var exportProjectReadmeEjs = require('../templates/exportProjectReadme.md.ejs');
var logToCloud = require('../logToCloud');

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
  var selectorPrefix = '#divApplab ';

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

    var htmlBody = appElement.outerHTML;
    var css = extractCSSFromHTML(appElement);
    var html = exportProjectEjs({htmlBody: appElement.outerHTML});
    var readme = exportProjectReadmeEjs({appName: appName});
    var cacheBust = '?__cb__='+''+new String(Math.random()).slice(2);
    var assetsToDownload = [
      {
        url: '/blockly/js/en_us/common_locale.js' + cacheBust,
        zipPath: appName + '/common_locale.js'
      }, {
        url: '/blockly/js/en_us/applab_locale.js' + cacheBust,
        zipPath: appName + '/applab_locale.js'
      }, {
        url: '/blockly/js/applab-api.js' + cacheBust,
        zipPath: appName + '/applab.js'
      }, {
        url: '/blockly/css/applab.css' + cacheBust,
        zipPath: appName + '/applab.css'
      },
    ].concat(dashboard.assets.listStore.list().map(function (asset) {
      return {
        url: assetPrefix.fixPath(asset.filename),
        rootRelativePath: 'assets/' + asset.filename,
        zipPath: appName + '/assets/' + asset.filename,
        dataType: 'binary',
        filename: asset.filename,
      };
    }));

    function rewriteAssetUrls(data) {
      return assetsToDownload.slice(4).reduce(function (data, assetToDownload) {
        if (data.indexOf(assetToDownload.url) >= 0) {
          return data.split(assetToDownload.url).join(assetToDownload.rootRelativePath);
        }
        return data.split(assetToDownload.filename).join(assetToDownload.rootRelativePath);
      }, data);
    }

    var zip = new JSZip();
    zip.file(appName + "/README.md", readme);
    zip.file(appName + "/index.html", rewriteAssetUrls(html));
    zip.file(appName + "/style.css", rewriteAssetUrls(css));
    zip.file(appName + "/code.js", rewriteAssetUrls(code));

    var deferred = $.Deferred();
    $.when(...assetsToDownload.map(function (assetToDownload) {
      return download(assetToDownload.url, assetToDownload.dataType || 'text');
    })).then(
      function ([commonLocale], [applabLocale], [applabApi], [applabCSS]) {
        zip.file(appName + "/applab.js",
                 [commonLocale, applabLocale, applabApi].join('\n'));
        zip.file(appName + "/applab.css", applabCSS);

        Array.from(arguments).slice(4).forEach(function ([data], index) {
          zip.file(assetsToDownload[index + 4].zipPath, data, {binary: true});
        });
        return deferred.resolve(zip);
      },
      function () {
        logToCloud.addPageAction(logToCloud.PageAction.staticResourceFetchError, {
          app: 'applab'
        }, 1/100);
        deferred.reject(new Error("failed to fetch assets"));
      }
    );

    return deferred.promise();
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
