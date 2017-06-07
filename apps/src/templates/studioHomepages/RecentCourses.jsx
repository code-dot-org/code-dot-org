import React, { PropTypes } from 'react';
import ContentBox from './ContentBox';
import CourseCard from './CourseCard';
import SetUpMessage from './SetUpMessage';
import i18n from "@cdo/locale";
import shapes from './shapes';

const RecentCourses = React.createClass({
  propTypes: {
    courses: shapes.courses,
    showAllCoursesLink: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool.isRequired,
    heading: PropTypes.string.isRequired
  },

  render() {
    const { courses, showAllCoursesLink, isTeacher, heading } = this.props;

    return (
      <div>
        {courses.length > 0 && (
          <ContentBox
            heading={heading}
            linkText={i18n.viewAllCourses()}
            link="/courses"
            showLink={showAllCoursesLink}
          >
            {courses.map((course, index) =>
              <CourseCard
                key={index}
                name={course.name}
                description={course.description}
                link={course.link}
                assignedSections={course.assignedSections}
              />
            )}
          </ContentBox>
        )}
        {courses.length === 0 && isTeacher && (
          <ContentBox
            heading={heading}
            linkText={i18n.viewAllCourses()}
            link="/courses"
            showLink={showAllCoursesLink}
          >
            <SetUpMessage type="courses"/>
          </ContentBox>
        )}
      </div>
    );
  }
});

export default RecentCourses;
