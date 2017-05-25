/** @file Header banner and gallery naviation for the project gallery */
import React from 'react';
import i18n from "@cdo/locale";
import GallerySwitcher, {Galleries} from '@cdo/apps/templates/projects/GallerySwitcher';
import HeadingBanner from '@cdo/apps/templates/HeadingBanner';

const ProjectHeader = React.createClass({
  render() {
    return (
        <div>
          <HeadingBanner
            headingText={i18n.projectGalleryHeader()}
          />
          <GallerySwitcher
            initialGallery={Galleries.PRIVATE}
            showGallery={showGallery}
          />
        </div>
    );
  }
});

function showGallery(gallery) {
  $('#angular-my-projects-wrapper').toggle(gallery === Galleries.PRIVATE);
  $('#public-gallery-wrapper').toggle(gallery === Galleries.PUBLIC);
}

export default ProjectHeader;
