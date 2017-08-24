import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import HeaderBanner from '../HeaderBanner';
import Notification from '../Notification';
import RecentCourses from './RecentCourses';
import TeacherSections from './TeacherSections';
import StudentSections from './StudentSections';
import TeacherResources from './TeacherResources';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from "@cdo/locale";

const styles = {
  clear: {
    clear: 'both',
    height: 30
  }
};

export default class TeacherHomepage extends React.Component {
  static propTypes = {
    joinedSections: shapes.sections,
    courses: shapes.courses,
    topCourse: shapes.topCourse,
    announcements: PropTypes.array.isRequired,
    isRtl: PropTypes.bool.isRequired,
    queryStringOpen: PropTypes.string,
  };

  componentDidMount() {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#terms_reminder').appendTo(ReactDOM.findDOMNode(this.refs.termsReminder)).show();
    $('#flashes').appendTo(ReactDOM.findDOMNode(this.refs.flashes)).show();
  }

  render() {
    const { courses, topCourse, announcements, isRtl, queryStringOpen, joinedSections } = this.props;

    return (
      <div>
        <HeaderBanner
          headingText={i18n.homepageHeading()}
          short={true}
        />
        <ProtectedStatefulDiv
          ref="flashes"
        />
        <ProtectedStatefulDiv
          ref="termsReminder"
        />
        {announcements.length > 0 && (
          <div>
            <Notification
              type="bullhorn"
              notice={announcements[0].heading}
              details={announcements[0].description}
              dismissible={false}
              buttonText={announcements[0].buttonText}
              buttonLink={announcements[0].link}
              newWindow={true}
              analyticId={announcements[0].id}
              isRtl={isRtl}
            />
            <div style={styles.clear}/>
          </div>
        )}
        <TeacherSections
          isRtl={isRtl}
          queryStringOpen={queryStringOpen}
        />
        <StudentSections
          initialSections={joinedSections}
          canLeave={true}
          isRtl={isRtl}
          isTeacher={true}
        />
        <RecentCourses
          courses={courses}
          topCourse={topCourse}
          showAllCoursesLink={true}
          isTeacher={true}
          isRtl={isRtl}
        />
        <TeacherResources isRtl={isRtl}/>
        <ProjectWidgetWithData isRtl={isRtl}/>
      </div>
    );
  }
}
