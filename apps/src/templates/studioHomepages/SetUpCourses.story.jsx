import React from 'react';
import SetUpCourses from './SetUpCourses';

export default storybook => storybook
  .storiesOf('SetUpCourses', module)
  .addStoryTable([
    {
      name: 'Set Up Message for Courses for Teachers',
      description: `Information box if the teacher doesn't have any courses yet`,
      story: () => (
        <SetUpCourses
          isRtl={false}
          isTeacher={true}
        />
      )
    },
    {
      name: 'Set Up Message for Courses for Students',
      description: `Information box if the student doesn't have any courses yet`,
      story: () => (
        <SetUpCourses
          isRtl={false}
          isTeacher={false}
        />
      )
    },
  ]);
