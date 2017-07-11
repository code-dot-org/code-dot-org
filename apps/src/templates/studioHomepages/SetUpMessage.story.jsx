import React from 'react';
import SetUpMessage from './SetUpMessage';

export default storybook => {
  return storybook
    .storiesOf('SetUpMessage', module)
    .addStoryTable([
      {
        name: 'Set Up Message for Courses for Teachers',
        description: `Information box if the teacher doesn't have any courses yet`,
        story: () => (
          <SetUpMessage
            type="courses"
            codeOrgUrlPrefix="http://code.org/"
            isRtl={false}
            isTeacher={true}
          />
        )
      },
      {
        name: 'Set Up Message for Sections for Teachers',
        description: `Information box if the teacher doesn't have any sections yet`,
        story: () => (
          <SetUpMessage
            type="sections"
            codeOrgUrlPrefix="http://code.org/"
            isRtl={false}
            isTeacher={true}
          />
        )
      },
      {
        name: 'Set Up Message for Courses for Students',
        description: `Information box if the teacher doesn't have any courses yet`,
        story: () => (
          <SetUpMessage
            type="courses"
            codeOrgUrlPrefix="http://code.org/"
            isRtl={false}
            isTeacher={false}
          />
        )
      },
    ]);
};
