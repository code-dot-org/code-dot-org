import React from 'react';
import TeacherAssignablesCatalog from './TeacherAssignablesCatalog';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import isRtlReducer from '@cdo/apps/code-studio/isRtlRedux';

registerReducers({isRtl: isRtlReducer});
const store = getStore();

export default storybook => {
  return storybook
    .storiesOf('TeacherAssignablesCatalog', module)
    .addStoryTable([
      {
        name: 'Catalog of courses and scripts (assignables) for teachers',
        description: `Collection of ResourceCards displaying information about courses and scripts for different grade levels that will be on /courses for teachers`,
        story: () => (
          <Provider store={store}>
            <TeacherAssignablesCatalog
              codeOrgUrlPrefix="http://localhost:3000/"
              isRtl={false}
            />
          </Provider>
        )
      },
    ]);
};
