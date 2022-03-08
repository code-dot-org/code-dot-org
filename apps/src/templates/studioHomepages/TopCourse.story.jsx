import React from 'react';
import TopCourse from './TopCourse';

export default storybook => {
  return storybook
    .storiesOf('Cards/TopCourse', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'TopCourse',
        description:
          'Students and teachers will see their main course, the one in which they have the most recent progress as a larger version of a CourseCard with links to course overview and the specific lesson they most recently worked on.',
        story: () => (
          <TopCourse
            assignableName="CSP 1"
            lessonName="Lesson 1: Intro to CSP"
            linkToOverview="studio.code.org/s/csp1-2021"
            linkToLesson="studio.code.org/s/csp1-2021/lessons/1"
          />
        )
      },
      {
        name: 'TopCourse - Professional Learning Course',
        description:
          'Adults will see their main PL course, the one in which they have the most recent progress as a larger version of a CourseCard with links to course overview and the specific lesson they most recently worked on.',
        story: () => (
          <TopCourse
            assignableName="Self Paced CSD 1"
            lessonName="What to teach when in CSD"
            linkToOverview="studio.code.org/s/self-paced-pl-csd1-2021"
            linkToLesson={'studio.code.org/s/self-paced-pl-csd1-2021/lessons/1'}
            isProfessionalLearningCourse={true}
          />
        )
      }
    ]);
};
