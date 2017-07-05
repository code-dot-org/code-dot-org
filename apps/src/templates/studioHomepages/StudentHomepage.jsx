import React from 'react';
import HeaderBanner from '../HeaderBanner';
import RecentCourses from './RecentCourses';
import shapes from './shapes';
import i18n from "@cdo/locale";

const StudentHomepage = React.createClass({
  propTypes: {
    courses: shapes.courses,
    studentTopCourse: shapes.studentTopCourse
  },

  render() {
    const { courses, studentTopCourse } = this.props;

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

      </div>
    );
  }
});

export default StudentHomepage;
