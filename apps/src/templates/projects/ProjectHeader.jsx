/** @file Header banner and gallery naviation for the project gallery */
import React, {PropTypes} from 'react';
import i18n from "@cdo/locale";
import GallerySwitcher from '@cdo/apps/templates/projects/GallerySwitcher';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';

const ProjectHeader = React.createClass({
  propTypes: {
    showGallery: PropTypes.func.isRequired
  },

  render() {
    return (
      <div>
        <HeaderBanner
          short={true}
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
