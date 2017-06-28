import React, { PropTypes } from 'react';
import ContentContainer from './ContentContainer';
import CourseCard from './CourseCard';
import SetUpMessage from './SetUpMessage';
import SeeMoreCourses from './SeeMoreCourses';
import i18n from "@cdo/locale";
import shapes from './shapes';

const RecentCourses = React.createClass({
  propTypes: {
    courses: shapes.courses,
    showAllCoursesLink: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool.isRequired,
    heading: PropTypes.string.isRequired,
    isRtl: React.PropTypes.bool.isRequired
  },

  render() {
    const { courses, showAllCoursesLink, isTeacher, heading, isRtl } = this.props;
    const teacherCourses = courses.length > 4 ? courses.slice(0,4) : courses;
    const teacherMoreCourses = courses.length > 4 ? courses.slice(4) : [];
    //const studentTopCourse = courses[0];
    const studentCourses = courses.length >= 5 ? courses.slice(1,5) : courses;
    const studentMoreCourses = courses.length > 5 ? courses.slice(5) : [];

    return (
      <ContentContainer
        heading={heading}
        linkText={i18n.findCourse()}
        link="/courses"
        showLink={showAllCoursesLink}
        isRtl={isRtl}
      >
        {isTeacher && teacherCourses.length > 0 && (
          teacherCourses.map((course, index) =>
            <CourseCard
              key={index}
              name={course.name}
              description={course.description}
              link={course.link}
              isRtl={isRtl}
            />
          )
        )}

        {isTeacher && teacherMoreCourses.length > 0 && (
          <SeeMoreCourses
            courses={teacherMoreCourses}
            isRtl={isRtl}
          />
        )}

        {!isTeacher && studentCourses.length > 0 && (
          studentCourses.map((course, index) =>
            <CourseCard
              key={index}
              name={course.name}
              description={course.description}
              link={course.link}
              isRtl={isRtl}
            />
          )
        )}

        {!isTeacher && studentMoreCourses.length > 0 && (
          <SeeMoreCourses
            courses={studentMoreCourses}
            isRtl={isRtl}
          />
        )}

        {courses.length === 0 && (
          <SetUpMessage
            type="courses"
            isRtl={isRtl}
            isTeacher={isTeacher}
          />
        )}
      </ContentContainer>
    );
  }
});

export default RecentCourses;
