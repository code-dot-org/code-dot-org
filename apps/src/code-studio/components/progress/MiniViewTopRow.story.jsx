import React from 'react';
import {Provider} from 'react-redux';

import progress from '@cdo/apps/code-studio/progressRedux';
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
