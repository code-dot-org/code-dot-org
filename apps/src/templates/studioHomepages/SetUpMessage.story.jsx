import React from 'react';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import teacherSections from '../teacherDashboard/teacherSectionsRedux';
import SetUpMessage from './SetUpMessage';

export default storybook => {
  return storybook
    .storiesOf('SetUpMessage', module)
    .addStoryTable([
      {
        name: 'Set Up Message for Courses for Teachers',
        description: `Information box if the teacher doesn't have any courses yet`,
        story: () => {
          registerReducers({teacherSections});
          return (
            <Provider store={getStore()}>
              <SetUpMessage
                type="courses"
                codeOrgUrlPrefix="http://code.org/"
                isRtl={false}
                isTeacher={true}
              />
            </Provider>
          );
        }
      },
      {
        name: 'Set Up Message for Sections for Teachers',
        description: `Information box if the teacher doesn't have any sections yet`,
        story: () => {
          registerReducers({teacherSections});
          return (
            <Provider store={getStore()}>
              <SetUpMessage
                type="sections"
                codeOrgUrlPrefix="http://code.org/"
                isRtl={false}
                isTeacher={true}
              />
            </Provider>
          );
        }
      },
      {
        name: 'Set Up Message for Courses for Students',
        description: `Information box if the teacher doesn't have any courses yet`,
        story: () => {
          registerReducers({teacherSections});
          return (
            <Provider store={getStore()}>
              <SetUpMessage
                type="courses"
                codeOrgUrlPrefix="http://code.org/"
                isRtl={false}
                isTeacher={false}
              />
            </Provider>
          );
        }
      },
    ]);
};
