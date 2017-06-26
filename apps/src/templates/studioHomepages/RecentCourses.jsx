import React, { PropTypes } from 'react';
import ContentContainer from './ContentContainer';
import CourseCard from './CourseCard';
import SetUpMessage from './SetUpMessage';
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

    return (
      <div>
        {courses.length > 0 && (
          <ContentContainer
            heading={heading}
            linkText={i18n.findCourse()}
            link="/courses"
            showLink={showAllCoursesLink}
            isRtl={isRtl}
          >
            {courses.map((course, index) =>
              <CourseCard
                key={index}
                name={course.name}
                description={course.description}
                link={course.link}
                isRtl={isRtl}
              />
            )}
          </ContentContainer>
        )}
        {courses.length === 0 && (
          <ContentContainer
            heading={heading}
            linkText={i18n.findCourse()}
            link="/courses"
            showLink={showAllCoursesLink}
            isRtl={isRtl}
          >
            <SetUpMessage type="courses" isRtl={isRtl} isTeacher={isTeacher}/>
          </ContentContainer>
        )}
      </div>
    );
  }
});

export default RecentCourses;
