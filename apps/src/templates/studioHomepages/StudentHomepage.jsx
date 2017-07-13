import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import RecentCourses from './RecentCourses';
import Sections from './Sections';
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
    // The components used here are implemented in legacy HAML/CSS rather than React.
    $('#section-management').appendTo(ReactDOM.findDOMNode(this.refs.sectionManagement)).show();
  },

  render() {
    const { courses, sections, isRtl, canLeave, studentTopCourse, codeOrgUrlPrefix } = this.props;

    return (
      <div>
        <HeaderBanner
          headingText={i18n.homepageHeading()}
          short={true}
        />

        <RecentCourses
          courses={courses}
          showAllCoursesLink={true}
          heading={i18n.myCourses()}
          isRtl={false}
          isTeacher={false}
          studentTopCourse={studentTopCourse}
        />

        <Sections
          sections={sections}
          isRtl={isRtl}
          isTeacher={false}
          canLeave={canLeave}
          codeOrgUrlPrefix={codeOrgUrlPrefix}
        />

        <ProtectedStatefulDiv ref="sectionManagement"/>

      </div>
    );
  }
});

export default StudentHomepage;
