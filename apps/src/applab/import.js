import {PropTypes} from 'react';
import $ from 'jquery';
import designMode from './designMode';
import * as elementUtils from './designElements/elementUtils';

export const importableScreenShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  willReplace: PropTypes.bool.isRequired,
  assetsToReplace: PropTypes.arrayOf(PropTypes.string).isRequired,
  conflictingIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  html: PropTypes.string.isRequired,
  canBeImported: PropTypes.bool.isRequired,
});

export const importableAssetShape = PropTypes.shape({
  filename: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  willReplace: PropTypes.bool.isRequired,
});

export const importableProjectShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  screens: PropTypes.arrayOf(importableScreenShape).isRequired,
  otherAssets: PropTypes.arrayOf(importableAssetShape).isRequired,
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
      if (existingElement && elementUtils.getId(existingElement.parentNode) !== id) {
        conflictingIds.push(child.id);
      }
    }
  });

  // TODO: filter out assets that will just be imported without replacing anything.
  const assetsToReplace = $('[data-canonical-image-url]', dom)
    .toArray()
    .map(n => $(n).attr('data-canonical-image-url'));

  return {
    id,
    willReplace,
    assetsToReplace,
    conflictingIds,
    html: dom.outerHTML,
    canBeImported: conflictingIds.length === 0,
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
  const {channel, sources} = project;
  const screens = [];
  $(sources.html)
    .find('.screen')
    .css('position', 'inherit')
    .css('display', 'block')
    .each((index, screen) => {
      screens.push(getImportableScreen(screen));
    });
  return {
    id: 'foo',
    name: channel.name,
    screens,
    otherAssets: [],
  };
}
