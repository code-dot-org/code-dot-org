import PropTypes from 'prop-types';
import React, {Component} from 'react';
import $ from 'jquery';
import {connect} from 'react-redux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import CourseScript from './CourseScript';
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
import {
  assignmentVersionShape,
  sectionForDropdownShape
} from '@cdo/apps/templates/teacherDashboard/shapes';
import AssignmentVersionSelector, {
  setRecommendedAndSelectedVersions
} from '@cdo/apps/templates/teacherDashboard/AssignmentVersionSelector';
import StudentFeedbackNotification from '@cdo/apps/templates/feedback/StudentFeedbackNotification';
import {sectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import SafeMarkdown from '../SafeMarkdown';

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

class CourseOverview extends Component {
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
    versions: PropTypes.arrayOf(assignmentVersionShape).isRequired,
    showVersionWarning: PropTypes.bool,
    showRedirectWarning: PropTypes.bool,
    redirectToCourseUrl: PropTypes.string,
    showAssignButton: PropTypes.bool,
    userId: PropTypes.number,
    // Redux
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired
  };

  constructor(props) {
    super(props);
    const showRedirectDialog =
      props.redirectToCourseUrl && props.redirectToCourseUrl.length > 0;
    this.state = {showRedirectDialog};
  }

  onChangeVersion = versionYear => {
    const course = this.props.versions.find(v => v.year === versionYear);
    if (course && course.name.length > 0 && course.name !== this.props.name) {
      const sectionId = queryParams('section_id');
      const queryString = sectionId ? `?section_id=${sectionId}` : '';
      utils.navigateToHref(`/courses/${course.name}${queryString}`);
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
      sectionsForDropdown,
      teacherResources,
      isTeacher,
      viewAs,
      scripts,
      isVerifiedTeacher,
      hasVerifiedResources,
      versions,
      showVersionWarning,
      showRedirectWarning,
      redirectToCourseUrl,
      showAssignButton,
      userId
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
    const filteredVersions = versions.filter(version => version.canViewVersion);
    const selectedVersion = filteredVersions.find(
      v => v.name === this.props.name
    );
    setRecommendedAndSelectedVersions(
      filteredVersions,
      null, // Ignore locale for courses.
      selectedVersion && selectedVersion.year
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
        {userId && <StudentFeedbackNotification studentId={userId} />}
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
            <AssignmentVersionSelector
              onChangeVersion={this.onChangeVersion}
              versions={filteredVersions}
              rightJustifiedPopupMenu={true}
            />
          )}
        </div>
        <SafeMarkdown
          style={styles.description}
          openExternalLinksInNewTab={true}
          markdown={
            viewAs === ViewType.Student
              ? descriptionStudent
              : descriptionTeacher
          }
        />
        {showNotification && <VerifiedResourcesNotification />}
        {isTeacher && (
          <div>
            <CourseOverviewTopRow
              sectionsInfo={sectionsInfo}
              sectionsForDropdown={sectionsForDropdown}
              id={id}
              title={title}
              resources={teacherResources}
              showAssignButton={showAssignButton}
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
            assignedSectionId={script.assigned_section_id}
            courseId={id}
            showAssignButton={showAssignButton}
          />
        ))}
      </div>
    );
  }
}

export const UnconnectedCourseOverview = CourseOverview;
export default connect((state, ownProps) => ({
  sectionsForDropdown: sectionsForDropdown(
    state.teacherSections,
    null,
    ownProps.id,
    true
  )
}))(CourseOverview);
