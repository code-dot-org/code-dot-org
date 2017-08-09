/** @file Header banner and gallery naviation for the project gallery */
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import i18n from "@cdo/locale";
import GallerySwitcher from '@cdo/apps/templates/projects/GallerySwitcher';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';

const ProjectHeader = createReactClass({
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
