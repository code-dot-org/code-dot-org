import React, { PropTypes } from 'react';
import CollapsibleSection from './CollapsibleSection';
import CourseCard from './CourseCard';
import SetUpMessage from './SetUpMessage';
import i18n from "@cdo/locale";
import shapes from './shapes';

/**
 * Though named RecentCoursesCollapsible, this component represents a collection
 * of courses and/or scripts. These come from sections the user is in, or from
 * courses/scripts they have recently made progress in.
 */
const RecentCoursesCollapsible = React.createClass({
  propTypes: {
    courses: shapes.courses,
    showAllCoursesLink: PropTypes.bool.isRequired,
    header: PropTypes.string.isRequired
  },

  render() {
    const { courses, showAllCoursesLink, header } = this.props;

    return (
      <CollapsibleSection
        header={header}
        linkText={i18n.viewAllCourses()}
        link="/courses"
        showLink={showAllCoursesLink}
      >
        {courses.length > 0 ? (
          courses.map((course, index) =>
            <CourseCard
              key={index}
              name={course.name}
              description={course.description}
              image={course.image}
              link={course.link}
              assignedSections={course.assignedSections}
            />
          )
        ) : (
          <SetUpMessage
            type="courses"
          />
        )}
      </CollapsibleSection>
    );
  }
});

export default RecentCoursesCollapsible;
