import React from 'react';
import TeacherResources from './TeacherResources';

export default storybook => {
  return storybook
    .storiesOf('TeacherResources', module)
    .addStoryTable([
      {
        name: 'Resources for teachers',
        description: `This is the TeacherResources section that will be used on the teacher homepage.`,
        story: () => (
          <TeacherResources
            codeOrgUrlPrefix="http://localhost:3000/"
            isRtl={false}
          />
        )
      },
    ]);
};
