/** @file Header banner and gallery naviation for the project gallery */
import React from 'react';
import i18n from "@cdo/locale";
import GallerySwitcher from '@cdo/apps/templates/projects/GallerySwitcher';
import HeadingBanner from '@cdo/apps/templates/HeadingBanner';

const ProjectHeader = React.createClass({
  propTypes: {
    showGallery: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <div>
        <HeadingBanner
          headingText={i18n.projectGalleryHeader()}
        />
        <GallerySwitcher
          showGallery={this.props.showGallery}
        />
      </div>
    );
  }
});

export default ProjectHeader;
