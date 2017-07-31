import React from 'react';
import {
  CoursesSetUpMessage,
  UnconnectedSectionsSetUpMessage as SectionsSetUpMessage,
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
    {
      name: 'Set Up Message for Sections for Teachers',
      description: `Information box if the teacher doesn't have any sections yet`,
      story: () => (
        <SectionsSetUpMessage
          isRtl={false}
          codeOrgUrlPrefix="http://code.org/"
          beginEditingNewSection={storybook.action('beginEditingNewSection')}
        />
      )
    },
  ]);
