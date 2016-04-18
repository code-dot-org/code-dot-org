var JSZip = require('jszip');
var saveAs = require('filesaver.js').saveAs;

var assetListStore = require('../assetManagement/assetListStore');
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

    var assetsToDownload = [
      {url: '/assets/js/en_us/common_locale.js', zipPath: appName + 'common_locale.js'},
      {url: '/assets/js/en_us/applab_locale.js', zipPath: appName + 'applab_locale.js'},
      {url: '/assets/js/applab-api.js', zipPath: appName + 'applab-api.js'},
      {url: '/assets/css/applab.css', zipPath: appName + 'applab.css'},
    ].concat(assetListStore.list().map(function (asset) {
      return {
        url: assetPrefix.fixPath(asset.filename),
        rootRelativePath: 'assets/' + asset.filename,
        zipPath: appName + '/assets/' + asset.filename,
        dataType: 'binary',
      };
    }));

    function rewriteAssetUrls(data) {
      return assetsToDownload.slice(4).reduce(function (data, assetToDownload) {
        return data.split(assetToDownload.url).join(assetToDownload.rootRelativePath);
      }, data);
    }

    var deferred = $.Deferred();

    $.when(...assetsToDownload.map(function (assetToDownload) {
      return download(assetToDownload.url, assetToDownload.dataType || 'text');
    })).then(
      function (commonLocale, applabLocale, applabApi, applabCSS) {
        var zip = new JSZip();
        zip.file(appName + "/applab.js", commonLocale[0] + applabLocale[0] + applabApi[0]);
        zip.file(appName + "/applab.css", applabCSS[0]);
        zip.file(appName + "/index.html", rewriteAssetUrls(html));
        zip.file(appName + "/style.css", rewriteAssetUrls(css));
        zip.file(appName + "/code.js", rewriteAssetUrls(code));
        zip.file(appName + "/README.md", readme);

        Array.from(arguments).slice(4).forEach(function ([data], index) {
          zip.file(assetsToDownload[index + 4].zipPath, data, {binary: true});
        });
        return deferred.resolve(zip);
      },
      function () {
        logToCloud.addPageAction(logToCloud.PageAction.staticResourceFetchError, {
          app: 'applab'
        }, 1/100);
        deferred.reject("failed to fetch assets :(");
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
