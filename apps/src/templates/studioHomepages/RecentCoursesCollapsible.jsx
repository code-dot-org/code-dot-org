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
    isTeacher: PropTypes.bool.isRequired
  },

  render() {
    const { courses, showAllCoursesLink, isTeacher } = this.props;

    return (
      <div>
        {courses.length > 0 && (
          <CollapsibleSection
            heading={i18n.courses()}
            linkText={i18n.viewAllCourses()}
            link="/courses"
            showLink={showAllCoursesLink}
          >
            {courses.map((course, index) =>
              <CourseCard
                key={index}
                name={course.name}
                description={course.description}
                image={course.image}
                link={course.link}
                assignedSections={course.assignedSections}
              />
            )}
          </CollapsibleSection>
        )}
        {courses.length === 0 && isTeacher && (
          <CollapsibleSection
            heading={i18n.courses()}
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
