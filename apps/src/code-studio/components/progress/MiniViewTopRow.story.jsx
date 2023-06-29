import React from 'react';
import MiniViewTopRow from './MiniViewTopRow';
import progress from '@cdo/apps/code-studio/progressRedux';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

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
  title: 'MiniViewTopRow',
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
