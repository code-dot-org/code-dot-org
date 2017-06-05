import React, { PropTypes } from 'react';
import CollapsibleSection from './CollapsibleSection';
import CourseCard from './CourseCard';
import SetUpMessage from './SetUpMessage';
import i18n from "@cdo/locale";
import shapes from './shapes';

const RecentCoursesCollapsible = React.createClass({
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
          <CollapsibleSection
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
          </CollapsibleSection>
        )}
        {courses.length === 0 && isTeacher && (
          <CollapsibleSection
            heading={heading}
            linkText={i18n.viewAllCourses()}
            link="/courses"
            showLink={showAllCoursesLink}
          >
            <SetUpMessage type="courses"/>
          </CollapsibleSection>
        )}
      </div>
    );
  }
});

export default RecentCoursesCollapsible;
