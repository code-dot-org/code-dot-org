import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import GallerySwitcher, {Galleries} from '@cdo/apps/templates/projects/GallerySwitcher';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';
import experiments from '@cdo/apps/util/experiments';

$(document).ready(() => {
  if (experiments.isEnabled('publicGallery')) {
    const gallerySwitcher = document.getElementById('gallery-switcher');
    ReactDOM.render(
      <GallerySwitcher
        initialGallery={Galleries.PRIVATE}
        showGallery={showGallery}
      />, gallerySwitcher);

    const publicGallery = document.getElementById('public-gallery');
    ReactDOM.render(<PublicGallery/>, publicGallery);
  }
});

function showGallery(gallery) {
  $('#angular-my-projects-wrapper').toggle(gallery === Galleries.PRIVATE);
  $('#public-gallery-wrapper').toggle(gallery === Galleries.PUBLIC);
}
