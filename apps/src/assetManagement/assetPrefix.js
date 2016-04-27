// For proxying non-https assets
var MEDIA_PROXY = '//' + location.host + '/media?u=';

// starts with http or https
var ABSOLUTE_REGEXP = new RegExp('^https?://', 'i');

var assetPathPrefix = "/v3/assets/";
var channelId;

module.exports.init = function (config) {
  if (config.assetPathPrefix) {
    assetPathPrefix = config.assetPathPrefix;
  }
  if (config.channel) {
    channelId = config.channel;
  }
};

/**
 * If the filename is relative (contains no slashes), then prepend
 * the path to the assets directory for this project to the filename.
 *
 * If the filename URL is absolute, route it through the MEDIA_PROXY.
 * @param {string} filename
 * @returns {string}
 */
module.exports.fixPath = function (filename) {

  if (ABSOLUTE_REGEXP.test(filename)) {
    // We want to be able to handle the case where our filename contains a
    // space, i.e. "www.example.com/images/foo bar.png", even though this is a
    // technically invalid URL. encodeURIComponent will replace space with %20
    // for us, but as soon as it's decoded, we again have an invalid URL. For
    // this reason we first replace space with %20 ourselves, such that we now
    // have a valid URL, and then call encodeURIComponent on the result.
    return MEDIA_PROXY + encodeURIComponent(filename.replace(/ /g, '%20'));
  }

  filename = filename || '';
  if (filename.length === 0) {
    return '/blockly/media/1x1.gif';
  }

  if (filename.indexOf('/') !== -1 || !channelId) {
    return filename;
  }

  return assetPathPrefix + channelId + '/' + filename;
};
