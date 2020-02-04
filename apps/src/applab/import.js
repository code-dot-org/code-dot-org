import PropTypes from 'prop-types';
import $ from 'jquery';
import designMode from './designMode';
import * as elementUtils from './designElements/elementUtils';
import * as applabConstants from './constants';
import {assets as assetsApi} from '../clientApi';

let DATA_PREFIX_REGEX = applabConstants.DATA_URL_PREFIX_REGEX;

export const importableScreenShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  willReplace: PropTypes.bool.isRequired,
  assetsToReplace: PropTypes.arrayOf(PropTypes.string).isRequired,
  assetsToImport: PropTypes.arrayOf(PropTypes.string).isRequired,
  conflictingIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  html: PropTypes.string.isRequired,
  canBeImported: PropTypes.bool.isRequired
});

export const importableAssetShape = PropTypes.shape({
  filename: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  willReplace: PropTypes.bool.isRequired
});

export const importableProjectShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  screens: PropTypes.arrayOf(importableScreenShape).isRequired,
  otherAssets: PropTypes.arrayOf(importableAssetShape).isRequired
});

/**
 * Helper function that takes a dom node and returns an object that conforms
 * to an importableScreenShape, checking for assets, and conflicting ids.
 */
function getImportableScreen(dom) {
  const id = dom.id;
  const willReplace = designMode.getAllScreenIds().includes(id);
  const conflictingIds = [];
  Array.from(dom.children).forEach(child => {
    if (!elementUtils.isIdAvailable(child.id)) {
      var existingElement = elementUtils.getPrefixedElementById(child.id);
      if (existingElement) {
        const existingElementScreen = $(existingElement).parents('.screen')[0];
        if (elementUtils.getId(existingElementScreen) !== id) {
          conflictingIds.push(child.id);
        }
      }
    }
  });

  const assetsToReplace = [];
  let assetsToImport = $('[data-canonical-image-url]', dom)
    .toArray()
    .map(n => $(n).attr('data-canonical-image-url'));
  if ($(dom).is('[data-canonical-image-url]')) {
    assetsToImport.push($(dom).attr('data-canonical-image-url'));
  }
  assetsToImport = assetsToImport.filter(asset => {
    if ($(`#designModeViz [data-canonical-image-url="${asset}"]`).length > 0) {
      // this will replace an existing asset
      // so move it to the assetsToReplace list
      assetsToReplace.push(asset);
      return false;
    }
    return true;
  });

  return {
    id,
    willReplace,
    assetsToReplace,
    assetsToImport,
    conflictingIds,
    html: dom.outerHTML,
    canBeImported: conflictingIds.length === 0
  };
}

/**
 * Helper function that takes a project object and returns an object that conforms to
 * importableProjectShape.
 */
export function getImportableProject(project) {
  if (!project) {
    return null;
  }
  const {channel, sources, assets, existingAssets} = project;
  const screens = [];
  $(sources.html)
    .find('.screen')
    .css('position', 'inherit')
    .css('display', 'block')
    .each((index, screen) => {
      screens.push(getImportableScreen(screen));
    });
  const usedAssets = {};
  screens.forEach(screen =>
    screen.assetsToImport
      .concat(screen.assetsToReplace)
      .forEach(asset => (usedAssets[asset] = true))
  );
  const existingAssetNames = {};
  existingAssets.forEach(asset => (existingAssetNames[asset.filename] = true));
  var otherAssets = assets
    .filter(asset => !usedAssets[asset.filename])
    .map(asset => ({
      filename: asset.filename,
      category: asset.category,
      willReplace: !!existingAssetNames[asset.filename]
    }));
  return {
    id: channel.id,
    name: channel.name,
    screens,
    otherAssets
  };
}

/**
 * @param {string} projectId
 * @param {Array<importableScreenShape>} screens
 * @param {Array<importableAssetShape>} assets
 * @returns {Promise}
 */
export function importScreensAndAssets(projectId, screens, assets) {
  return new Promise((resolve, reject) => {
    var allAssetsToCopy = {};
    assets.forEach(asset => (allAssetsToCopy[asset.filename] = true));

    screens.forEach(importableScreen => {
      importableScreen.assetsToReplace.forEach(
        asset => (allAssetsToCopy[asset] = true)
      );
      importableScreen.assetsToImport.forEach(
        asset => (allAssetsToCopy[asset] = true)
      );
    });

    function finishImporting(xhr) {
      screens.forEach(importableScreen => {
        var newScreen = importableScreen.html;

        // ugh, we have to pull this out before we attach the new one
        // in case it exists and needs to be deleted.
        // If we delete it first, then design mode will try to load the
        // "default" screen. If this screen we are deleting is the only screen
        // then loading the "default" screen will create a new one!
        var deleteAfterAdd = elementUtils.getPrefixedElementById(
          importableScreen.id
        );
        designMode.attachElement(
          designMode.parseScreenFromLevelHtml(
            newScreen,
            true,
            applabConstants.DESIGN_ELEMENT_ID_PREFIX
          )
        );
        if (deleteAfterAdd) {
          designMode.onDeletePropertiesButton(deleteAfterAdd);
        }
      });

      designMode.resetPropertyTab();
      resolve(xhr);
    }

    allAssetsToCopy = Object.keys(allAssetsToCopy);

    // Remove data url assets as they are too long for our copy api
    allAssetsToCopy = allAssetsToCopy.filter(
      asset => !DATA_PREFIX_REGEX.test(asset)
    );

    if (allAssetsToCopy.length > 0) {
      assetsApi.copyAssets(projectId, allAssetsToCopy, finishImporting, xhr => {
        console.error('Failed to copy assets:', xhr);
        reject(xhr);
      });
    } else {
      finishImporting();
    }
  });
}
