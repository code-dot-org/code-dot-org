import React from 'react';
import ReactDOM from 'react-dom';
import {ImagePreview} from '../instructions/AniGifPreview';

/**
 * A basic helper function to enable the "expandable images" we use in our
 *     curriculum content.
 *
 * @param {Element} node - The DOM node containing the images. Supports nodes
 *     with multiple contained images.
 * @param {function} showImageDialog - The method to call when the user clicks
 *     on the image, which will show the modal dialog containing the expanded
 *     image.
 *
 * @see @cdo/apps/src/templates/plugins/expandableImages.js
 * @see @cdo/apps/src/redux/instructionsDialog.js
 */
export function renderExpandableImages(node, showImageDialog) {
  const expandableImages = node.querySelectorAll('.expandable-image');
  for (let i = 0; i < expandableImages.length; i++) {
    const expandableImg = expandableImages[i];

    /*
     * TODO: When this method is used in the context of an existing React
     * component, it raises the following warning:
     *
     * > Replacing React-rendered children with a new root component. If you
     * > intended to update the children of this node, you should instead have
     * > the existing children update their state and render the new components
     * > instead of calling ReactDOM.render.
     *
     * We should probably rebuild this in such a way as to not violate React's
     * expectations like this.
     */
    ReactDOM.render(
      <ImagePreview
        url={expandableImg.dataset.url}
        noVisualization={false}
        showInstructionsDialog={() =>
          showImageDialog(expandableImg.dataset.url)
        }
      />,
      expandableImg
    );
  }
}
