import React from 'react';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import progress from '@cdo/apps/code-studio/progressRedux';
import {registerReducers} from '@cdo/apps/redux';
import * as commonReducers from '@cdo/apps/redux/commonReducers';
import {reduxStore} from '@cdo/storybook/decorators';

import MiniViewTopRow from './MiniViewTopRow';

const initialState = {
  progress: {
    lessonGroups: [],
    lessons: [
      {
        levels: [],
      },
    ],
    focusAreaLessonIds: [],
    isSummaryView: false,
    deeperLearningCourse: false,
  },
};

export default {
  component: MiniViewTopRow,
};

registerReducers({...commonReducers, isRtl});

// Template
const Template = args => (
  <Provider store={reduxStore({progress}, initialState)}>
    <div style={{width: 635, position: 'relative'}}>
      <MiniViewTopRow {...args} />
    </div>
  </Provider>
);

export const Default = Template.bind({});
Default.args = {
  scriptName: 'course1',
};
