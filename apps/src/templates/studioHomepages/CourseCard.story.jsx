import React from 'react';
import CourseCard from './CourseCard';

const exampleCard = {
  title: 'CSP Unit 2 - Digital Information',
  description:
    'Explore how more complex digital information is represented and manipulated through computation and visualization',
  link: 'studio.code.org/s/csp2-2021'
};

const examplePLCard = {
  title: 'Self Paced CSD Professional Learning - Unit 1',
  description: 'Learn how to teach CSD to your students',
  link: 'studio.code.org/s/self-paced-pl-csd1-2021'
};

export default storybook => {
  return storybook
    .storiesOf('Cards/CourseCard', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Course Card - Student Course',
        description: `This is an example course card that can show information about a course or unit.`,
        story: () => (
          <CourseCard
            title={exampleCard.title}
            description={exampleCard.description}
            link={exampleCard.link}
          />
        )
      },
      {
        name: 'Course Card - Professional Learning Course',
        description: `This is an example course card for a professional learning course that can show information about a course or unit.`,
        story: () => (
          <CourseCard
            title={examplePLCard.title}
            description={examplePLCard.description}
            link={examplePLCard.link}
            isProfessionalLearningCourse={true}
          />
        )
      }
    ]);
};
