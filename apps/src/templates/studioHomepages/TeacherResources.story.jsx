import React from 'react';
import TeacherResources from './TeacherResources';

export default storybook => {
  return storybook
    .storiesOf('TeacherResources', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Resources for teachers',
        description: `This is the TeacherResources section that will be used on the teacher homepage.`,
        story: () => (
          <TeacherResources
            isRtl={false}
          />
        )
      },
    ]);
};
