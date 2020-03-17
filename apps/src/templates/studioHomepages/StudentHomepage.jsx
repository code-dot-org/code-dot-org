import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import {TwoColumnActionBlock} from './TwoColumnActionBlock';
import RecentCourses from './RecentCourses';
import StudentSections from './StudentSections';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import StudentFeedbackNotification from '@cdo/apps/templates/feedback/StudentFeedbackNotification';
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from '@cdo/locale';
import $ from 'jquery';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

export default class StudentHomepage extends Component {
  static propTypes = {
    courses: shapes.courses,
    topCourse: shapes.topCourse,
    hasFeedback: PropTypes.bool,
    sections: shapes.sections,
    canViewAdvancedTools: PropTypes.bool,
    studentId: PropTypes.number.isRequired
  };

  componentDidMount() {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#flashes')
      .appendTo(ReactDOM.findDOMNode(this.refs.flashes))
      .show();
  }

  render() {
    const {courses, sections, topCourse, hasFeedback} = this.props;
    const {canViewAdvancedTools, studentId} = this.props;

    return (
      <div>
        <HeaderBanner headingText={i18n.homepageHeading()} short={true} />
        <ProtectedStatefulDiv ref="flashes" />

        <TwoColumnActionBlock
          imageUrl={pegasus(
            '/shared/images/fill-540x300/announcement/announcement_special2020.jpg'
          )}
          subHeading={i18n.studentAnnouncementSpecial2020Heading()}
          description={i18n.studentAnnouncementSpecial2020Description()}
          buttons={[
            {
              id: 'student_homepage_announcement_special2020',
              url: pegasus('/athome'),
              text: i18n.studentAnnouncementSpecial2020Button()
            }
          ]}
        />

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
    );
  }
}
