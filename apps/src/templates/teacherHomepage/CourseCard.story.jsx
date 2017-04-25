import React from 'react';
import CourseCard from './CourseCard';

const ExampleCard = {
  courseName: "CSP Unit 2 - Digital Information",
  description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
  image: "this is where there will be the source for the photo",
  link: "link to the course",
  assignedSections: []
};

const EnrolledOne = {
   ...ExampleCard,
   assignedSections: ["Section 1"]
 };

 const EnrolledMany = {
    ...ExampleCard,
    assignedSections: ["Section 1", "Section 2", "Section 3"]
  };

export default storybook => {
  return storybook
    .storiesOf('CourseCard', module)
    .addStoryTable([
      {
        name: 'Course Card - NOT enrolled',
        description: `This is an example course card where the teacher does not have sections enrolled in the course.`,
        story: () => (
          <CourseCard
            courseName={ExampleCard.courseName}
            description={ExampleCard.description}
            image={ExampleCard.image}
            link={ExampleCard.link}
            assignedSections={ExampleCard.assignedSections}
          />
        )
      },
      {
        name: 'Course Card - enrolled',
        description: `This is an example course card where the teacher does have a section enrolled in the course.`,
        story: () => (
          <CourseCard
            courseName={EnrolledOne.courseName}
            description={EnrolledOne.description}
            image={EnrolledOne.image}
            link={EnrolledOne.link}
            assignedSections={EnrolledOne.assignedSections}
          />
        )
      },
      {
        name: 'Course Card - enrolled mulitple',
        description: `This is an example course card where the teacher has multiple sections enrolled in the course.`,
        story: () => (
          <CourseCard
            courseName={EnrolledMany.courseName}
            description={EnrolledMany.description}
            image={EnrolledMany.image}
            link={EnrolledMany.link}
            assignedSections={EnrolledMany.assignedSections}
          />
        )
      },
    ]);
};
