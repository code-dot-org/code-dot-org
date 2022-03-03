import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import SpecialAnnouncement from './SpecialAnnouncement';
import RecentCourses from './RecentCourses';
import StudentSections from './StudentSections';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import StudentFeedbackNotification from '@cdo/apps/templates/feedback/StudentFeedbackNotification';
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';
import $ from 'jquery';

export default class StudentHomepage extends Component {
  static propTypes = {
    courses: shapes.courses,
    topCourse: shapes.topCourse,
    hasFeedback: PropTypes.bool,
    sections: shapes.sections,
    canViewAdvancedTools: PropTypes.bool,
    studentId: PropTypes.number.isRequired,
    isEnglish: PropTypes.bool.isRequired,
    showVerifiedTeacherWarning: PropTypes.bool
  };

  componentDidMount() {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#flashes')
      .appendTo(ReactDOM.findDOMNode(this.refs.flashes))
      .show();
  }

  render() {
    const {
      courses,
      sections,
      topCourse,
      hasFeedback,
      isEnglish,
      showVerifiedTeacherWarning
    } = this.props;
    const {canViewAdvancedTools, studentId} = this.props;
    // Verify background image works for both LTR and RTL languages.
    const backgroundUrl = '/shared/images/banners/teacher-homepage-hero.jpg';

    return (
      <div>
        <HeaderBanner
          headingText={i18n.homepageHeading()}
          short={true}
          backgroundUrl={backgroundUrl}
        />
        <div className={'container main'}>
          <ProtectedStatefulDiv ref="flashes" />
          {isEnglish && <SpecialAnnouncement isTeacher={false} />}
          {showVerifiedTeacherWarning && (
            <Notification
              type={NotificationType.failure}
              notice={i18n.studentAsVerifiedTeacherWarning()}
              details={i18n.studentAsVerifiedTeacherDetails()}
              buttonText={i18n.learnMore()}
              buttonLink="https://support.code.org/hc/en-us/articles/360023222371-How-can-I-change-my-account-type-from-student-to-teacher-or-vice-versa-"
              dismissible={false}
            />
          )}
          {hasFeedback && <StudentFeedbackNotification studentId={studentId} />}
          <RecentCourses
            courses={courses}
            topCourse={topCourse}
            isTeacher={false}
            hasFeedback={hasFeedback}
          />
          <ProjectWidgetWithData
            canViewFullList={true}
            canViewAdvancedTools={canViewAdvancedTools}
          />
          <StudentSections initialSections={sections} />
        </div>
      </div>
    );
  }
}
