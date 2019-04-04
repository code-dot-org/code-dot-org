import PropTypes from 'prop-types';
import React, {Component} from 'react';
import $ from 'jquery';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import CourseScript from './CourseScript';
import LabeledSectionSelector from '@cdo/apps/code-studio/components/progress/LabeledSectionSelector';
import CourseOverviewTopRow from './CourseOverviewTopRow';
import {resourceShape} from './resourceType';
import styleConstants from '@cdo/apps/styleConstants';
import VerifiedResourcesNotification from './VerifiedResourcesNotification';
import * as utils from '../../utils';
import {queryParams} from '../../code-studio/utils';
import i18n from '@cdo/locale';
import {
  onDismissRedirectDialog,
  dismissedRedirectDialog,
  onDismissRedirectWarning,
  dismissedRedirectWarning
} from '@cdo/apps/util/dismissVersionRedirect';
import RedirectDialog from '@cdo/apps/code-studio/components/RedirectDialog';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import color from '@cdo/apps/util/color';

const styles = {
  main: {
    width: styleConstants['content-width']
  },
  description: {
    marginBottom: 20
  },
  titleWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  title: {
    display: 'inline-block'
  },
  versionWrapper: {
    display: 'flex',
    alignItems: 'baseline'
  },
  versionLabel: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 15,
    color: color.charcoal
  },
  versionDropdown: {
    marginBottom: 13
  }
};

export default class CourseOverview extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    assignmentFamilyTitle: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    descriptionStudent: PropTypes.string,
    descriptionTeacher: PropTypes.string,
    sectionsInfo: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      })
    ).isRequired,
    teacherResources: PropTypes.arrayOf(resourceShape).isRequired,
    isTeacher: PropTypes.bool.isRequired,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    scripts: PropTypes.array.isRequired,
    isVerifiedTeacher: PropTypes.bool.isRequired,
    hasVerifiedResources: PropTypes.bool.isRequired,
    versions: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        version_year: PropTypes.string.isRequired,
        version_title: PropTypes.string.isRequired,
        can_view_version: PropTypes.bool.isRequired
      })
    ).isRequired,
    showVersionWarning: PropTypes.bool,
    showRedirectWarning: PropTypes.bool,
    redirectToCourseUrl: PropTypes.string
  };

  constructor(props) {
    super(props);
    const showRedirectDialog =
      props.redirectToCourseUrl && props.redirectToCourseUrl.length > 0;
    this.state = {showRedirectDialog};
  }

  onChangeVersion = event => {
    const courseName = event.target.value;
    if (courseName !== this.props.name) {
      const sectionId = queryParams('section_id');
      const queryString = sectionId ? `?section_id=${sectionId}` : '';
      utils.navigateToHref(`/courses/${courseName}${queryString}`);
    }
  };

  onDismissVersionWarning = () => {
    if (!this.props.scripts[0]) {
      return;
    }

    // Because there is no user_course table, store the fact that the version
    // dialog has been dismissed on the first user_script in the course.
    const firstScriptId = this.props.scripts[0].id;

    // Fire and forget. If this fails, we'll have another chance to
    // succeed the next time the warning is dismissed.
    $.ajax({
      method: 'PATCH',
      url: `/api/v1/user_scripts/${firstScriptId}`,
      type: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify({version_warning_dismissed: true})
    });
  };

  onCloseRedirectDialog = () => {
    onDismissRedirectDialog(this.props.name);
    this.setState({
      showRedirectDialog: false
    });
  };

  render() {
    const {
      name,
      title,
      assignmentFamilyTitle,
      id,
      descriptionStudent,
      descriptionTeacher,
      sectionsInfo,
      teacherResources,
      isTeacher,
      viewAs,
      scripts,
      isVerifiedTeacher,
      hasVerifiedResources,
      versions,
      showVersionWarning,
      showRedirectWarning,
      redirectToCourseUrl
    } = this.props;

    // We currently set .container.main to have a width of 940 at a pretty high
    // level and are not comfortable moving it to 970 across the board yet. The
    // hack below makes it so that this component will be 970px and centered
    // properly. It can be removed if/when we fix .container.main
    const mainStyle = {
      ...styles.main,
      marginLeft:
        ($('.container.main').width() - styleConstants['content-width']) / 2
    };
    const showNotification =
      viewAs === ViewType.Teacher &&
      isTeacher &&
      !isVerifiedTeacher &&
      hasVerifiedResources;

    // Only display viewable versions in course version dropdown.
    const filteredVersions = versions.filter(
      version => version.can_view_version
    );

    return (
      <div style={mainStyle}>
        {redirectToCourseUrl && !dismissedRedirectDialog(name) && (
          <RedirectDialog
            isOpen={this.state.showRedirectDialog}
            details={i18n.assignedToNewerVersion()}
            handleClose={this.onCloseRedirectDialog}
            redirectUrl={redirectToCourseUrl}
            redirectButtonText={i18n.goToAssignedVersion()}
          />
        )}
        {showRedirectWarning && !dismissedRedirectWarning(name) && (
          <Notification
            type={NotificationType.warning}
            notice=""
            details={i18n.redirectCourseVersionWarningDetails()}
            dismissible={true}
            onDismiss={() => onDismissRedirectWarning(name)}
          />
        )}
        {showVersionWarning && (
          <Notification
            type={NotificationType.warning}
            notice={i18n.wrongCourseVersionWarningNotice()}
            details={i18n.wrongCourseVersionWarningDetails()}
            dismissible={true}
            onDismiss={this.onDismissVersionWarning}
          />
        )}
        <div style={styles.titleWrapper}>
          <h1 style={styles.title}>{assignmentFamilyTitle}</h1>
          {filteredVersions.length > 1 && (
            <span style={styles.versionWrapper}>
              <span style={styles.versionLabel}>
                {i18n.courseOverviewVersionLabel()}
              </span>
              &nbsp;
              <select
                onChange={this.onChangeVersion}
                value={name}
                style={styles.versionDropdown}
                id="version-selector"
              >
                {filteredVersions.map(version => (
                  <option key={version.name} value={version.name}>
                    {version.version_title}
                  </option>
                ))}
              </select>
            </span>
          )}
        </div>
        <div style={styles.description}>
          {viewAs === ViewType.Student
            ? descriptionStudent
            : descriptionTeacher}
        </div>
        {showNotification && <VerifiedResourcesNotification />}
        {isTeacher && (
          <div>
            <LabeledSectionSelector />
            <CourseOverviewTopRow
              sectionsInfo={sectionsInfo}
              id={id}
              title={title}
              resources={teacherResources}
            />
          </div>
        )}
        {scripts.map((script, index) => (
          <CourseScript
            key={index}
            title={script.title}
            name={script.name}
            id={script.id}
            description={script.description}
          />
        ))}
      </div>
    );
  }
}
