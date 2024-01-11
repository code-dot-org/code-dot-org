/** @file Header banner and start new project buttons for the project gallery */
import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import StartNewProject from '@cdo/apps/templates/projects/StartNewProject';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';
import ProjectsPromo from './ProjectsPromo';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';

export default class ProjectHeader extends React.Component {
  static propTypes = {
    canViewAdvancedTools: PropTypes.bool,
    projectCount: PropTypes.number,
    showDeprecatedCalcAndEvalWarning: PropTypes.bool,
  };

  render() {
    // Verify background image works for both LTR and RTL languages.
    const backgroundUrl = '/shared/images/banners/project-banner.jpg';
    return (
      <div>
        <HeaderBanner
          headingText={i18n.projects()}
          subHeadingText={i18n.projectsSubHeadingMillions({
            project_count: this.props.projectCount,
          })}
          backgroundUrl={backgroundUrl}
          backgroundImageStyling={{backgroundPosition: '90% 40%'}}
        />
        <div className={'container main'}>
          {this.props.showDeprecatedCalcAndEvalWarning && (
            <Notification
              type={NotificationType.warning}
              notice={i18n.deprecatedCalcAndEvalWarning()}
              details={i18n.deprecatedCalcAndEvalDetails()}
              dismissible={false}
            />
          )}
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
