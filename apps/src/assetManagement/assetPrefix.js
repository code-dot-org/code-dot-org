import {unicode} from '@cdo/apps/code-studio/components/icons';
import {getStore} from '@cdo/apps/redux';

// starts with http or https
export const ABSOLUTE_REGEXP = new RegExp('^https?://', 'i');

export const DATA_URL_PREFIX_REGEX = new RegExp('^data:image');

export const ICON_PREFIX = 'icon://';
export const ICON_PREFIX_REGEX = new RegExp('^icon://');

export const SOUND_PREFIX = 'sound://';
export const SOUND_PREFIX_REGEX = new RegExp('^sound://');

// Starter assets are currently only used for image assets, but may be extended
// in the future, where we will want to change this prefix.
export const STARTER_ASSET_PREFIX = 'image://';
export const STARTER_ASSET_PREFIX_REGEX = new RegExp('^image://');

const DEFAULT_ASSET_PATH_PREFIX = '/v3/assets/';
export const DEFAULT_SOUND_PATH_PREFIX = '/api/v1/sound-library/';
const DEFAULT_CHANNEL_ID = undefined;

let assetPathPrefix = DEFAULT_ASSET_PATH_PREFIX;
let soundPathPrefix = DEFAULT_SOUND_PATH_PREFIX;
let channelId = DEFAULT_CHANNEL_ID;

export function init(config) {
  assetPathPrefix = config.assetPathPrefix || DEFAULT_ASSET_PATH_PREFIX;
  soundPathPrefix = config.soundPathPrefix || DEFAULT_SOUND_PATH_PREFIX;
  channelId = config.channel || DEFAULT_CHANNEL_ID;
}

/**
 * If the filename is relative (contains no slashes), then prepend
 * the path to the assets directory for this project to the filename.
 *
 * If the sound filename starts with 'sound://', replace it with the api path.
 * @param {string} filename
 * @returns {string}
 */
export function fixPath(filename) {
  if (ABSOLUTE_REGEXP.test(filename)) {
    return filename;
  }

  filename = filename || '';
  if (filename.length === 0) {
    return '/blockly/media/1x1.gif';
  }

  if (SOUND_PREFIX_REGEX.test(filename)) {
    return filename.replace(SOUND_PREFIX, soundPathPrefix);
  }

  const state = getStore().getState();

  // If a curriculum level is remixed, any images that were copied from a starter asset
  // image contains 'image://' in its filenmae.
  // We want to strip this starter asset prefix from the filename so that the correct
  // image file path is returned.
  if (!state.pageConstants?.isCurriculumLevel) {
    filename = filename.replace(STARTER_ASSET_PREFIX, '');
  }
  if (STARTER_ASSET_PREFIX_REGEX.test(filename)) {
    return filename.replace(
      STARTER_ASSET_PREFIX,
      starterAssetPathPrefix(state.level.name)
    );
  }

  if (filename.indexOf('/') !== -1 || !channelId) {
    return filename;
  }

  // Use encodeURIComponent() on files in the user's project, to make sure we
  // catch any characters which could break urls such as # or ?, without
  // modifying extended ascii or unicode characters.
  return assetPathPrefix + channelId + '/' + encodeURIComponent(filename);
}

/**
 * Get path prefix for starter assets, given a level name.
 * @param levelName {string}
 * @return {string}
 */
function starterAssetPathPrefix(levelName) {
  return `/level_starter_assets/${levelName}/`;
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
  var character = '0x' + unicode[value.replace(regex, '')];
  ctx.fillText(String.fromCharCode(character), 200, 200);
  return canvas.toDataURL();
}
