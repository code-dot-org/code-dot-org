import React from 'react';
import CourseCard from './CourseCard';

const exampleCard = {
  name: "CSP Unit 2 - Digital Information",
  description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
  link: "https://curriculum.code.org/csp/unit2/",
};

export default storybook => {
  return storybook
    .storiesOf('CourseCard', module)
    .addStoryTable([
      {
        name: 'Course Card',
        description: `This is an example course card that can show information about a course or script.`,
        story: () => (
          <CourseCard
            name={exampleCard.name}
            description={exampleCard.description}
            link={exampleCard.link}
            isRtl={false}
          />
        )
      }
    ]);
};
