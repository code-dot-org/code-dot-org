import React from 'react';
import TeacherResources from './TeacherResources';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

export default storybook => {
  return storybook
    .storiesOf('TeacherResources', module)
    .withReduxStore({responsive, isRtl})
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
      {
        name: 'Resources for teachers - RTL',
        description: `This is the TeacherResources section that will be used on the teacher homepage with RTL styles.`,
        story: () => (
          <TeacherResources
            isRtl={true}
          />
        )
      },
    ]);
};
