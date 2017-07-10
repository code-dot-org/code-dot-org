import React from 'react';
import StudentTopCourse from './StudentTopCourse';

export default storybook => {
  return storybook
    .storiesOf('StudentTopCourse', module)
    .addStoryTable([
      {
        name: 'StudentTopCourse',
        description: 'Students will see their main course, the one in which they have the most recent progress as a larger version of a CourseCard with links to course overview and the specific lesson they most recently worked on.',
        story: () => (
          <StudentTopCourse
            isRtl={false}
            assignableName="Course 1"
            lessonName="Lesson 3: Learn to drag and drop"
            linkToOverview="http://localhost-studio.code.org:3000/s/course1"
            linkToLesson="http://localhost-studio.code.org:3000/s/course1/stage/3/puzzle/1"
          />
        )
      }
    ]);
};
