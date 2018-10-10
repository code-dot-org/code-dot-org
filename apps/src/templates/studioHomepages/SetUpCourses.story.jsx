import React from 'react';
import SetUpCourses from './SetUpCourses';

export default storybook => storybook
  .storiesOf('Homepages/SetUpCourses', module)
  .withReduxStore()
  .addStoryTable([
    {
      name: 'Set Up Message for Courses for Teachers, No Courses',
      description: `Information box if the teacher doesn't have any courses yet`,
      story: () => (
        <SetUpCourses
          isTeacher={true}
        />
      )
    },
    {
      name: 'Set Up Message for Courses for Students, No Courses',
      description: `Information box if the student doesn't have any courses yet`,
      story: () => (
        <SetUpCourses
          isTeacher={false}
        />
      )
    },
    {
      name: 'Set Up Message for Courses for Teachers, Course',
      description: `Information box if the teacher already has course progress or assignment`,
      story: () => (
        <SetUpCourses
          isTeacher={true}
          hasCourse={true}
        />
      )
    },
    {
      name: 'Set Up Message for Courses for Students, Course',
      description: `Information box if the student already has course progress or assignment`,
      story: () => (
        <SetUpCourses
          isTeacher={false}
          hasCourse={true}
        />
      )
    },
  ]);
