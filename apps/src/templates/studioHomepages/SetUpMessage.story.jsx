import React from 'react';
import {
  CoursesSetUpMessage,
} from './SetUpMessage';

export default storybook => storybook
  .storiesOf('SetUpMessage', module)
  .addStoryTable([
    {
      name: 'Set Up Message for Courses for Teachers',
      description: `Information box if the teacher doesn't have any courses yet`,
      story: () => (
        <CoursesSetUpMessage
          isRtl={false}
          isTeacher={true}
        />
      )
    },
    {
      name: 'Set Up Message for Courses for Students',
      description: `Information box if the student doesn't have any courses yet`,
      story: () => (
        <CoursesSetUpMessage
          isRtl={false}
          isTeacher={false}
        />
      )
    },
  ]);
