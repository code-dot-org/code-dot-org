import React from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import RecentCourses from './RecentCourses';
import StudentSections from './StudentSections';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from "@cdo/locale";

const StudentHomepage = React.createClass({
  propTypes: {
    courses: shapes.courses,
    sections: shapes.sections,
    studentTopCourse: shapes.studentTopCourse,
    isRtl: React.PropTypes.bool.isRequired,
    canLeave: React.PropTypes.bool.isRequired,
  },

  componentDidMount() {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#flashes').appendTo(ReactDOM.findDOMNode(this.refs.flashes)).show();
  },

  render() {
    const { courses, sections, isRtl, canLeave, studentTopCourse } = this.props;

    return (
      <div>
        <HeaderBanner
          headingText={i18n.homepageHeading()}
          short={true}
        />
        <ProtectedStatefulDiv
          ref="flashes"
        />
        <RecentCourses
          courses={courses}
          showAllCoursesLink={true}
          isRtl={false}
          isTeacher={false}
          studentTopCourse={studentTopCourse}
        />
        <ProjectWidgetWithData/>
        <StudentSections
          initialSections={sections}
          isRtl={isRtl}
          canLeave={canLeave}
        />
      </div>
    );
  }
});

export default StudentHomepage;
