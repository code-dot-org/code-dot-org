/** @file Header banner and start new project buttons for the project gallery */
import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import StartNewProject from '@cdo/apps/templates/projects/StartNewProject';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';

export default class ProjectHeader extends React.Component {
  static propTypes = {
    canViewAdvancedTools: PropTypes.bool,
    projectCount: PropTypes.number
  };

  render() {
    const projectCountWithCommas = this.props.projectCount.toLocaleString();

    return (
      <div>
        <HeaderBanner
          short={true}
          headingText={i18n.projects()}
          subHeadingText={i18n.projectsSubHeading({
            project_count: projectCountWithCommas
          })}
        />
        <StartNewProject
          canViewFullList
          canViewAdvancedTools={this.props.canViewAdvancedTools}
        />
      </div>
    );
  }
}
