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
            assignableName="Course 1"
            lessonName="Lesson 3: Learn to drag and drop"
            linkToOverview="http://localhost-studio.code.org:3000/s/course1"
            linkToLesson="http://localhost-studio.code.org:3000/s/course1/lessons/3/levels/1"
          />
        )
      }
    ]);
};
