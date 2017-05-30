/** @file Header banner and gallery naviation for the project gallery */
import React from 'react';
import i18n from "@cdo/locale";
import GallerySwitcher, {Galleries} from '@cdo/apps/templates/projects/GallerySwitcher';
import HeadingBanner from '@cdo/apps/templates/HeadingBanner';

const ProjectHeader = React.createClass({
  propTypes: {
    showGallery: React.PropTypes.func.isRequired,
    isPublic: React.PropTypes.bool
  },

  render() {
    return (
      <div>
        <HeadingBanner
          headingText={i18n.projectGalleryHeader()}
        />
        <GallerySwitcher
          initialGallery={this.props.isPublic ? Galleries.PUBLIC : Galleries.PRIVATE}
          showGallery={this.props.showGallery}
        />
      </div>
    );
  }
});

export default ProjectHeader;
