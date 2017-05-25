import React, { PropTypes } from 'react';
import CollapsibleSection from './CollapsibleSection';
import CourseCard from './CourseCard';
import SetUpMessage from './SetUpMessage';
import i18n from "@cdo/locale";

const RecentCoursesCollapsible = React.createClass({
  propTypes: {
    courses: PropTypes.arrayOf(
      PropTypes.shape({
        courseName: React.PropTypes.string.isRequired,
        description: React.PropTypes.string.isRequired,
        image: React.PropTypes.string.isRequired,
        assignedSections: React.PropTypes.array.isRequired
      })
    ),
    showAllCoursesLink: React.PropTypes.bool.isRequired,
    isTeacher: React.PropTypes.bool.isRequired
  },

  render() {
    const { courses, showAllCoursesLink, isTeacher } = this.props;

    return (
      <div>
        {courses.length > 0 && (
          <CollapsibleSection
            header={i18n.courses()}
            linkText={i18n.viewAllCourses()}
            link="/courses"
            showLink={showAllCoursesLink}
          >
            {courses.map((course, index) =>
              <CourseCard
                key={index}
                courseName={course.courseName}
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
            header={i18n.courses()}
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
