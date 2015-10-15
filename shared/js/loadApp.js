/* global dashboard, appOptions */

var renderAbusive = require('./renderAbusive');

// Attempts to lookup the name in the digest hash, or returns the name if not found.
function tryDigest(name) {
  return (window.digestManifest || {})[name] || name;
}

/**
 * Returns a function which returns a $.Deferred instance. When executed, the
 * function loads the given app script.
 * @param name The name of the module to load.
 * @param cacheBust{Boolean?} If true, append a random query string to bypass the
 *   cache.
 * @returns {Function}
 */
function loadSource(name, cacheBust) {
  return function () {
    var deferred = new $.Deferred();
    var param = cacheBust ? '?' + Math.random() : '';
    document.body.appendChild($('<script>', {
      src: appOptions.baseUrl + tryDigest('js/' + name + '.js') + param
    }).on('load', function () {
      deferred.resolve();
    })[0]);
    return deferred;
  };
}

/**
 * Returns a function which returns a $.Deferred instance. When executed, the
 * function loads the given app script.
 * @param sourceUrl The URL of the CDN script resource to load.
 * @returns {Function}
 */
function loadExternalSource(sourceUrl, cacheBust) {
  return function () {
    var deferred = new $.Deferred();
    document.body.appendChild($('<script>', {
      src: sourceUrl
    }).on('load', function () {
      deferred.resolve();
    })[0]);
    return deferred;
  };
}

// Loads the given app stylesheet.
function loadStyle(name) {
  $('body').append($('<link>', {
    rel: 'stylesheet',
    type: 'text/css',
    href: appOptions.baseUrl + 'css/' + name + '.css'
  }));
}

module.exports = function (callback) {
  if (window.dashboard && dashboard.project) {
    dashboard.project.load().then(function () {
      if (dashboard.project.hideBecauseAbusive()) {
        renderAbusive();
        return $.Deferred().reject();
      }
    }).then(callback);
  } else {
    callback();
  }
};
