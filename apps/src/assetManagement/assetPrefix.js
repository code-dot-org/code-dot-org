/* global dashboard */

// For proxying non-https assets
var MEDIA_PROXY = '//' + location.host + '/media?u=';

// starts with http or https
var ABSOLUTE_REGEXP = new RegExp('^https?://', 'i');

export const ICON_PREFIX = 'icon://';
export const ICON_PREFIX_REGEX = new RegExp('^icon://');

const DEFAULT_ASSET_PATH_PREFIX = '/v3/assets/';
const DEFAULT_CHANNEL_ID = undefined;

let assetPathPrefix = DEFAULT_ASSET_PATH_PREFIX;
let channelId = DEFAULT_CHANNEL_ID;

export function init(config) {
  assetPathPrefix = config.assetPathPrefix || DEFAULT_ASSET_PATH_PREFIX;
  channelId = config.channel || DEFAULT_CHANNEL_ID;
}

/**
 * If the filename is relative (contains no slashes), then prepend
 * the path to the assets directory for this project to the filename.
 *
 * If the filename URL is absolute, route it through the MEDIA_PROXY.
 * @param {string} filename
 * @returns {string}
 */
export function fixPath(filename) {
  // Rewrite urls to pass through our media proxy. Unless of course we are in an
  // exported app, in which case our media proxy won't be good for anything
  // anyway.
  if (ABSOLUTE_REGEXP.test(filename) && window.location.protocol !== 'file:') {
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
}


/**
 * Create a data-URI with the image data of the given icon glyph.
 * @param value {string} An icon identifier of the format "icon://fa-icon-name".
 * @param element {Element}
 * @return {string}
 */
export function renderIconToString(value, element) {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = 400;
  var ctx = canvas.getContext('2d');
  ctx.font = '300px FontAwesome, serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = element.getAttribute('data-icon-color') || '#000';
  var regex = new RegExp('^' + ICON_PREFIX + 'fa-');
  var unicode = '0x' + dashboard.iconsUnicode[value.replace(regex, '')];
  ctx.fillText(String.fromCharCode(unicode), 200, 200);
  return canvas.toDataURL();
}
