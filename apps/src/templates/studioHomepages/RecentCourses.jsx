import React, { PropTypes } from 'react';
import ContentContainer from './ContentContainer';
import CourseCard from './CourseCard';
import SetUpMessage from './SetUpMessage';
import SeeMoreCourses from './SeeMoreCourses';
import Notification from '@cdo/apps/templates/Notification';
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
    const topFourCourses = courses.length > 4 ? courses.slice(0,4) : courses;
    const moreCourses = courses.length > 4 ? courses.slice(4) : [];

    return (
      <ContentContainer
        heading={heading}
        linkText={i18n.findCourse()}
        link="/courses"
        showLink={showAllCoursesLink}
        isRtl={isRtl}
      >
        {topFourCourses.length > 0 && (
          topFourCourses.map((course, index) =>
            <CourseCard
              key={index}
              name={course.name}
              description={course.description}
              link={course.link}
              isRtl={isRtl}
            />
          )
        )}
        {moreCourses.length > 0 && (
          <SeeMoreCourses
            courses={moreCourses}
            isRtl={isRtl}
          />
        )}
        {!isTeacher && (
          <Notification
            type="course"
            notice={i18n.findCourse()}
            details={i18n.findCourseDescription()}
            buttonText={i18n.findCourse()}
            buttonLink="/course"
            dismissible={false}
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
