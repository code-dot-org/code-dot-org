/** @file Header banner and start new project buttons for the project gallery */
import PropTypes from 'prop-types';
import React from 'react';

import HeaderBanner from '@cdo/apps/templates/HeaderBanner';
import StartNewProject from '@cdo/apps/templates/projects/StartNewProject';
import i18n from '@cdo/locale';

import ProjectsPromo from './ProjectsPromo';

export default class ProjectHeader extends React.Component {
  static propTypes = {
    canViewAdvancedTools: PropTypes.bool,
    projectCount: PropTypes.number,
  };

  render() {
    return (
      <div>
        <HeaderBanner
          headingText={i18n.projects()}
          subHeadingText={i18n.projectsSubHeadingMillions({
            project_count: this.props.projectCount,
          })}
          backgroundColor="var(--brand-purple-95)"
        />
        <div className={'container main'}>
          <ProjectsPromo />
          <StartNewProject
            canViewFullList
            canViewAdvancedTools={this.props.canViewAdvancedTools}
          />
        </div>
      </div>
    );
  }
}
