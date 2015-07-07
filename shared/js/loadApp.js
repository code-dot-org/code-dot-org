/* global dashboard, appOptions, $ */

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

// Loads the given app stylesheet.
function loadStyle(name) {
  $('body').append($('<link>', {
    rel: 'stylesheet',
    type: 'text/css',
    href: appOptions.baseUrl + 'css/' + name + '.css'
  }));
}

module.exports = function (callback) {
  loadStyle('common');
  loadStyle(appOptions.app);
  var promise = loadSource('manifest', true)();
  if (appOptions.droplet) {
    loadStyle('droplet/droplet.min');
    loadStyle('tooltipster/tooltipster.min');
    promise = promise.then(loadSource('jsinterpreter/acorn_interpreter'))
        .then(loadSource('marked/marked'))
        .then(loadSource('ace/ace'))
        .then(loadSource('ace/mode-javascript'))
        .then(loadSource('ace/ext-language_tools'))
        .then(loadSource('droplet/droplet-full'))
        .then(loadSource('tooltipster/jquery.tooltipster'));
  } else {
    promise = promise.then(loadSource('blockly'))
        .then(loadSource('marked/marked'))
        .then(loadSource(appOptions.locale + '/blockly_locale'));
  }

  if (window.dashboard && dashboard.project) {
    promise = promise.then(dashboard.project.load);
  }

  promise.then(loadSource('common' + appOptions.pretty))
      .then(loadSource(appOptions.locale + '/common_locale'))
      .then(loadSource(appOptions.locale + '/' + appOptions.app + '_locale'))
      .then(loadSource(appOptions.app + appOptions.pretty))
      .then(callback);
};
