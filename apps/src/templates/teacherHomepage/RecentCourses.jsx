import React from 'react';
import CollapsibleSection from './CollapsibleSection';
import CourseCard from './CourseCard';
import SetUpMessage from './SetUpMessage';
import i18n from "@cdo/locale";

const RecentCourses = React.createClass({
  propTypes: {
    courseName1: React.PropTypes.string,
    description1: React.PropTypes.string,
    image1: React.PropTypes.string,
    link1: React.PropTypes.string,
    assignedSections1: React.PropTypes.array,
    courseName2: React.PropTypes.string,
    description2: React.PropTypes.string,
    image2: React.PropTypes.string,
    link2: React.PropTypes.string,
    assignedSections2: React.PropTypes.array,
  },

// Props for CourseCards should be all or nothing. For example, if there is a courseName1 passed in, there should also be a description, image, link and assignedSections for course 1.
  checkForCompleteData() {
    const { courseName1, description1, link1, image1, assignedSections1, courseName2, description2, link2, image2, assignedSections2 } = this.props;

    if ((courseName1 && description1 && image1 && link1 && assignedSections1) ||
       (!courseName1 && !description1 && !image1 && !link1 && !assignedSections1)) {
    } else {
      throw new Error('There are incomplete props for Course 1 - you need a name, description, link, image and assignedSections');
    }

    if ((courseName2 && description2 && image2 && link2 && assignedSections2) ||
       (!courseName2 && !description2 && !image2 && !link2 && !assignedSections2)) {
    } else {
      throw new Error('There are incomplete props for Course 2 - you need a name, description, link, image and assignedSections');
    }
  },

  render() {
    const { courseName1, description1, link1, image1, assignedSections1, courseName2, description2, link2, image2, assignedSections2 } = this.props;

    {this.checkForCompleteData();}

    return (
      <CollapsibleSection
        header={i18n.recentCourses()}
        linkText={i18n.viewAllCourses()}
        link="https://studio.code.org/"
      >
        {courseName1 ? (
          <CourseCard
            courseName={courseName1}
            description={description1}
            image={image1}
            link={link1}
            assignedSections={assignedSections1}
          />
        ) : (
          <SetUpMessage type="courses"/>
        )}
        {courseName2 && (
          <CourseCard
            courseName={courseName2}
            description={description2}
            image={image2}
            link={link2}
            assignedSections={assignedSections2}
          />
        )}
      </CollapsibleSection>
    );
  }
});

export default RecentCourses;
