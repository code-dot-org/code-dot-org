import React from 'react';
import CourseCard from './CourseCard';

const exampleCard = {
  name: "CSP Unit 2 - Digital Information",
  description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
  image: "this is where there will be the source for the photo",
  link: "link to the course",
  assignedSections: []
};

const enrolledOne = {
   ...exampleCard,
   assignedSections: ["Section 1"]
 };

 const enrolledMany = {
    ...exampleCard,
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
            name={exampleCard.name}
            description={exampleCard.description}
            image={exampleCard.image}
            link={exampleCard.link}
            assignedSections={exampleCard.assignedSections}
          />
        )
      },
      {
        name: 'Course Card - enrolled',
        description: `This is an example course card where the teacher does have a section enrolled in the course.`,
        story: () => (
          <CourseCard
            name={enrolledOne.name}
            description={enrolledOne.description}
            image={enrolledOne.image}
            link={enrolledOne.link}
            assignedSections={enrolledOne.assignedSections}
          />
        )
      },
      {
        name: 'Course Card - enrolled mulitple',
        description: `This is an example course card where the teacher has multiple sections enrolled in the course.`,
        story: () => (
          <CourseCard
            name={enrolledMany.name}
            description={enrolledMany.description}
            image={enrolledMany.image}
            link={enrolledMany.link}
            assignedSections={enrolledMany.assignedSections}
          />
        )
      },
    ]);
};
