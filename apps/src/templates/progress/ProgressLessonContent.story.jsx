import React from 'react';
import {Provider} from 'react-redux';

import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';
import {reduxStore} from '@cdo/storybook/decorators';

import ProgressLessonContent from './ProgressLessonContent';
import {fakeLevels, fakeLevel} from './progressTestHelpers';

export default {
  component: ProgressLessonContent,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <ProgressLessonContent disabled={false} {...args} />
  </Provider>
);

export const ProgressLessonExample = Template.bind({});
ProgressLessonExample.args = {
  levels: fakeLevels(5).map((level, index) => ({
    ...level,
    status: index === 1 ? LevelStatus.perfect : LevelStatus.not_tried,
    name: 'Progression',
  })),
};

export const WithUnpluggedLesson = Template.bind({});
WithUnpluggedLesson.args = {
  levels: [fakeLevel({isUnplugged: true}), ...fakeLevels(5)].map(level => ({
    ...level,
    name: 'Progression',
  })),
};

export const WithNamedUnpluggedLesson = Template.bind({});
WithNamedUnpluggedLesson.args = {
  levels: [
    {
      ...fakeLevel({isUnplugged: true}),
      name: 'Fun unplugged/named level',
    },
    ...fakeLevels(5, {named: false}),
  ],
};

export const WithNoNamedLevels = Template.bind({});
WithNoNamedLevels.args = {
  levels: [
    {
      ...fakeLevel({isUnplugged: true, name: undefined}),
    },
    ...fakeLevels(5, {named: false}),
  ],
};
