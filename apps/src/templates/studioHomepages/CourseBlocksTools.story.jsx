import React from 'react';
import CourseBlocksTools from './CourseBlocksTools';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import isRtlReducer from '@cdo/apps/code-studio/isRtlRedux';

registerReducers({isRtl: isRtlReducer});
const store = getStore();

export default storybook => storybook
  .storiesOf('CourseBlocksTools', module)
  .addStoryTable([
    {
      name: 'course blocks - tools',
      description: `This is a set of course blocks listing tools`,
      story: () => (
        <Provider store={store}>
          <CourseBlocksTools
            isEnglish={true}
          />
        </Provider>
      )
    },
  ]);
