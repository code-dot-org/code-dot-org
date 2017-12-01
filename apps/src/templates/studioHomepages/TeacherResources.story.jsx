import React from 'react';
import TeacherResources from './TeacherResources';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';

export default storybook => {
  const store = getStore();
  return storybook
    .storiesOf('TeacherResources', module)
    .addStoryTable([
      {
        name: 'Resources for teachers',
        description: `This is the TeacherResources section that will be used on the teacher homepage.`,
        story: () => (
          <Provider store={store}>
            <TeacherResources
              isRtl={false}
            />
          </Provider>
        )
      },
      {
        name: 'Resources for teachers - RTL',
        description: `This is the TeacherResources section that will be used on the teacher homepage with RTL styles.`,
        story: () => (
          <Provider store={store}>
            <TeacherResources
              isRtl={true}
            />
          </Provider>
        )
      },
    ]);
};
