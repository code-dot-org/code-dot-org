import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import Notification, {
  NotificationType,
} from '@cdo/apps/sharedComponents/Notification';
import ParticipantFeedbackNotification from '@cdo/apps/templates/feedback/ParticipantFeedbackNotification';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import JoinSectionArea from '@cdo/apps/templates/studioHomepages/JoinSectionArea';
import i18n from '@cdo/locale';

import HeaderBanner from '../HeaderBanner';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';

import MarketingAnnouncementBanner from './MarketingAnnouncementBanner';
import RecentCourses from './RecentCourses';
import shapes from './shapes';

export default class StudentHomepage extends Component {
  static propTypes = {
    courses: shapes.courses,
    topCourse: shapes.topCourse,
    hasFeedback: PropTypes.bool,
    sections: shapes.sections,
    canViewAdvancedTools: PropTypes.bool,
    studentId: PropTypes.number.isRequired,
    showVerifiedTeacherWarning: PropTypes.bool,
    specialAnnouncement: shapes.specialAnnouncement,
    topComponents: PropTypes.arrayOf(PropTypes.node),
  };

  componentDidMount() {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#flashes').appendTo(ReactDOM.findDOMNode(this.refs.flashes)).show();
  }

  render() {
    const {
      courses,
      sections,
      topCourse,
      hasFeedback,
      showVerifiedTeacherWarning,
      specialAnnouncement,
      topComponents,
    } = this.props;
    const {canViewAdvancedTools, studentId} = this.props;
    // Verify background image works for both LTR and RTL languages.
    const backgroundUrl = '/shared/images/banners/teacher-homepage-hero.jpg';

    return (
      <div>
        <HeaderBanner
          headingText={i18n.homepageHeading()}
          backgroundUrl={backgroundUrl}
          backgroundImageStyling={{backgroundPosition: '90% 30%'}}
        />
        <div className={'container main'}>
          {topComponents && topComponents.map(component => component)}

          <ProtectedStatefulDiv ref="flashes" />
          {specialAnnouncement && (
            <MarketingAnnouncementBanner
              announcement={specialAnnouncement}
              marginBottom="30px"
            />
          )}
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
          {hasFeedback && (
            <ParticipantFeedbackNotification studentId={studentId} />
          )}
          <RecentCourses
            courses={courses}
            topCourse={topCourse}
            isTeacher={false}
            hasFeedback={hasFeedback}
          />
          <JoinSectionArea initialJoinedStudentSections={sections} />
          <ProjectWidgetWithData
            canViewFullList={true}
            canViewAdvancedTools={canViewAdvancedTools}
          />
        </div>
      </div>
    );
  }
}
