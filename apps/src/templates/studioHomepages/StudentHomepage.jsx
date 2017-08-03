import React from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import RecentCourses from './RecentCourses';
import Sections from './Sections';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from "@cdo/locale";

const StudentHomepage = React.createClass({
  propTypes: {
    courses: shapes.courses,
    sections: shapes.sections,
    studentTopCourse: shapes.studentTopCourse,
    codeOrgUrlPrefix: React.PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired,
    canLeave: React.PropTypes.bool.isRequired,
  },

  componentDidMount() {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#flashes').appendTo(ReactDOM.findDOMNode(this.refs.flashes)).show();
  },

  render() {
    const { courses, sections, isRtl, canLeave, studentTopCourse, codeOrgUrlPrefix } = this.props;

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
          heading={i18n.myCourses()}
          isRtl={false}
          isTeacher={false}
          studentTopCourse={studentTopCourse}
        />
        <ProjectWidgetWithData/>
        <Sections
          sections={sections}
          isRtl={isRtl}
          isTeacher={false}
          canLeave={canLeave}
          codeOrgUrlPrefix={codeOrgUrlPrefix}
        />
      </div>
    );
  }
});

export default StudentHomepage;
