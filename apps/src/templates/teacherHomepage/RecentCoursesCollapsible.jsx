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
        link: React.PropTypes.string.isRequired,
        assignedSections: React.PropTypes.array.isRequired
      })
<<<<<<< HEAD
    ),
    showAllCoursesLink: React.PropTypes.bool.isRequired
  },

  render() {
    const { courses, showAllCoursesLink } = this.props;

    let linkText, link;
    if (showAllCoursesLink) {
      linkText = i18n.viewAllCourses();
      link = "/courses";
    }
  },

  render() {
    const { courses } = this.props;

    return (
      <CollapsibleSection
        header={i18n.courses()}
        linkText={linkText}
        link={link}
      >
        {courses.length > 0 ? (
          courses.map((course, index) =>
            <CourseCard
              key={index}
              courseName={course.courseName}
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
