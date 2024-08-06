import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import Announcements from '@cdo/apps/code-studio/components/progress/Announcements';
import RedirectDialog from '@cdo/apps/code-studio/components/RedirectDialog';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import fontConstants from '@cdo/apps/fontConstants';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import Notification, {
  NotificationType,
} from '@cdo/apps/sharedComponents/Notification';
import styleConstants from '@cdo/apps/styleConstants';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import ParticipantFeedbackNotification from '@cdo/apps/templates/feedback/ParticipantFeedbackNotification';
import AssignmentVersionSelector from '@cdo/apps/templates/teacherDashboard/AssignmentVersionSelector';
import {
  assignmentCourseVersionShape,
  sectionForDropdownShape,
} from '@cdo/apps/templates/teacherDashboard/shapes';
import {sectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import color from '@cdo/apps/util/color';
import {
  onDismissRedirectDialog,
  dismissedRedirectDialog,
  onDismissRedirectWarning,
  dismissedRedirectWarning,
} from '@cdo/apps/util/dismissVersionRedirect';
import i18n from '@cdo/locale';

import {queryParams} from '../../code-studio/utils';
import * as utils from '../../utils';
import SafeMarkdown from '../SafeMarkdown';

import CourseOverviewTopRow from './CourseOverviewTopRow';
import CourseScript from './CourseScript';
import VerifiedResourcesNotification from './VerifiedResourcesNotification';

class CourseOverview extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    assignmentFamilyTitle: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    descriptionStudent: PropTypes.string,
    descriptionTeacher: PropTypes.string,
    sectionsInfo: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
    teacherResources: PropTypes.arrayOf(resourceShape),
    studentResources: PropTypes.arrayOf(resourceShape),
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    scripts: PropTypes.array.isRequired,
    isVerifiedInstructor: PropTypes.bool.isRequired,
    hasVerifiedResources: PropTypes.bool.isRequired,
    versions: PropTypes.objectOf(assignmentCourseVersionShape).isRequired,
    showVersionWarning: PropTypes.bool,
    showRedirectWarning: PropTypes.bool,
    redirectToCourseUrl: PropTypes.string,
    showAssignButton: PropTypes.bool,
    userId: PropTypes.number,
    userType: PropTypes.string,
    participantAudience: PropTypes.string,
    // Redux
    announcements: PropTypes.arrayOf(announcementShape),
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    isSignedIn: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    const showRedirectDialog =
      props.redirectToCourseUrl && props.redirectToCourseUrl.length > 0;
    this.state = {showRedirectDialog};

    if (props.userType === 'teacher') {
      analyticsReporter.sendEvent(
        EVENTS.COURSE_OVERVIEW_PAGE_VISITED_BY_TEACHER_EVENT,
        {
          'unit group name': props.name,
        },
        PLATFORMS.BOTH
      );
    }
  }

  onChangeVersion = versionId => {
    const version = this.props.versions[versionId];
    if (versionId !== this.props.id && version) {
      const sectionId = queryParams('section_id');
      const queryString = sectionId ? `?section_id=${sectionId}` : '';
      utils.navigateToHref(`${version.path}${queryString}`);
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
      data: JSON.stringify({version_warning_dismissed: true}),
    });
  };

  onCloseRedirectDialog = () => {
    onDismissRedirectDialog(this.props.name);
    this.setState({
      showRedirectDialog: false,
    });
  };

  render() {
    const {
      name,
      title,
      assignmentFamilyTitle,
      id,
      courseOfferingId,
      courseVersionId,
      descriptionStudent,
      descriptionTeacher,
      sectionsInfo,
      sectionsForDropdown,
      teacherResources,
      studentResources,
      viewAs,
      scripts,
      isVerifiedInstructor,
      hasVerifiedResources,
      versions,
      showVersionWarning,
      showRedirectWarning,
      redirectToCourseUrl,
      showAssignButton,
      userId,
      isSignedIn,
      participantAudience,
    } = this.props;

    const showNotification =
      viewAs === ViewType.Instructor &&
      !isVerifiedInstructor &&
      hasVerifiedResources;

    return (
      <div style={styles.main}>
        {redirectToCourseUrl && !dismissedRedirectDialog(name) && (
          <RedirectDialog
            isOpen={this.state.showRedirectDialog}
            details={i18n.assignedToNewerVersion()}
            handleClose={this.onCloseRedirectDialog}
            redirectUrl={redirectToCourseUrl}
            redirectButtonText={i18n.goToAssignedVersion()}
          />
        )}
        {userId && <ParticipantFeedbackNotification studentId={userId} />}
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
        {isSignedIn && (
          <Announcements
            announcements={this.props.announcements}
            width={styleConstants['content-width']}
            viewAs={viewAs}
            firehoseAnalyticsId={{
              user_id: userId,
              unit_group_id: id,
            }}
          />
        )}
        {showNotification && <VerifiedResourcesNotification />}
        <div style={styles.titleWrapper}>
          <h1 style={styles.title}>{assignmentFamilyTitle}</h1>
          {Object.values(versions).length > 1 && (
            <AssignmentVersionSelector
              onChangeVersion={this.onChangeVersion}
              courseVersions={versions}
              rightJustifiedPopupMenu={true}
              selectedCourseVersionId={this.props.courseVersionId}
            />
          )}
        </div>
        <SafeMarkdown
          style={styles.description}
          openExternalLinksInNewTab={true}
          markdown={
            viewAs === ViewType.Participant
              ? descriptionStudent
              : descriptionTeacher
          }
        />
        <div>
          <CourseOverviewTopRow
            sectionsInfo={sectionsInfo}
            sectionsForDropdown={sectionsForDropdown}
            courseOfferingId={courseOfferingId}
            courseVersionId={courseVersionId}
            id={id}
            courseName={title}
            teacherResources={teacherResources}
            studentResources={studentResources}
            showAssignButton={showAssignButton}
            isInstructor={viewAs === ViewType.Instructor}
            participantAudience={participantAudience}
          />
        </div>
        {scripts.map((script, index) => (
          <CourseScript
            key={index}
            title={script.title}
            name={script.name}
            id={script.id}
            description={script.description}
            assignedSectionId={script.assigned_section_id}
            courseId={id}
            courseOfferingId={courseOfferingId}
            courseVersionId={courseVersionId}
            showAssignButton={showAssignButton}
          />
        ))}
      </div>
    );
  }
}

const styles = {
  main: {
    width: '100%',
  },
  description: {
    marginBottom: 20,
  },
  titleWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    display: 'inline-block',
  },
  versionWrapper: {
    display: 'flex',
    alignItems: 'baseline',
  },
  versionLabel: {
    ...fontConstants['main-font-semi-bold'],
    fontSize: 15,
    color: color.charcoal,
  },
  versionDropdown: {
    marginBottom: 13,
  },
};

export const UnconnectedCourseOverview = CourseOverview;
export default connect((state, ownProps) => ({
  sectionsForDropdown: sectionsForDropdown(
    state.teacherSections,
    ownProps.courseOfferingId,
    ownProps.courseVersionId,
    null
  ),
  isSignedIn: state.currentUser.signInState === SignInState.SignedIn,
  viewAs: state.viewAs,
  isVerifiedInstructor: state.verifiedInstructor.isVerified,
  hasVerifiedResources: state.verifiedInstructor.hasVerifiedResources,
  announcements: state.announcements || [],
}))(CourseOverview);
