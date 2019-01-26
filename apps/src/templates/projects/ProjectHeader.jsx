/** @file Header banner and start new project buttons for the project gallery */
import React, {PropTypes} from 'react';
import i18n from "@cdo/locale";
import StartNewProject from '@cdo/apps/templates/projects/StartNewProject';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';

export default class ProjectHeader extends React.Component {
  static propTypes = {
    canViewAdvancedTools: PropTypes.bool,
  };

  render() {
    return (
      <div>
        <HeaderBanner
          short={true}
          headingText={i18n.projects()}
          subHeadingText={i18n.projectsSubHeading()}
        />
        <StartNewProject
          canViewFullList
          canViewAdvancedTools={this.props.canViewAdvancedTools}
        />
      </div>
    );
  }
}
