import React from 'react';
import ReactDOM from 'react-dom';
import {ImagePreview} from '../instructions/AniGifPreview';

export function renderExpandableImages(node, showImageDialog) {
  const expandableImages = node.querySelectorAll('.expandable-image');
  for (let i = 0; i < expandableImages.length; i++) {
    const expandableImg = expandableImages[i];
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
