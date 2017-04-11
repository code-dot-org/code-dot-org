import React from 'react';
import CourseCard from './CourseCard';

const EXAMPLE_CARD_DATA = {
  courseName: "CSP Unit 2 - Digital Information",
  description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
  image: "this is where there will be the source for the photo",
  link: "link to wherever you want the button to go...",
  assignedSections: [] //<-- this info will be used in the tooltip
};

const ENROLLED_ONE = {
   ...EXAMPLE_CARD_DATA,
   assignedSections: ["Section 1"]
 };

 const ENROLLED_MANY = {
    ...EXAMPLE_CARD_DATA,
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
            cardData={EXAMPLE_CARD_DATA}
          />
        )
      },
      {
        name: 'Course Card - enrolled',
        description: `This is an example course card where the teacher does have a section enrolled in the course.`,
        story: () => (
          <CourseCard
            cardData={ENROLLED_ONE}
          />
        )
      },
      {
        name: 'Course Card - enrolled mulitple',
        description: `This is an example course card where the teacher has multiple sections enrolled in the course.`,
        story: () => (
          <CourseCard
            cardData={ENROLLED_MANY}
          />
        )
      },
    ]);
};
