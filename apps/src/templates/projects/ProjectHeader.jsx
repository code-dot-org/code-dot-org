/** @file Header banner and gallery naviation for the project gallery */
import React from 'react';
import i18n from "@cdo/locale";
import GallerySwitcher from '@cdo/apps/templates/projects/GallerySwitcher';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';

const ProjectHeader = React.createClass({
  render() {
    return (
      <div>
        <HeaderBanner
          short={true}
          headingText={i18n.projects()}
          subHeadingText={i18n.projectsSubHeading()}
        />
        <GallerySwitcher/>
      </div>
    );
  }
});

export default ProjectHeader;
