import React from 'react';
import {UnconnectedProgressLevelSet as ProgressLevelSet} from './ProgressLevelSet';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {fakeLevels, fakeLevel} from './progressTestHelpers';
import {reduxStore} from '@cdo/storybook/decorators';
import {Provider} from 'react-redux';

export default {
  title: 'ProgressLevelSet',
  component: ProgressLevelSet,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <ProgressLevelSet {...args} />
  </Provider>
);

const levels = fakeLevels(5).map((level, index) => ({
  ...level,
  status: index === 0 ? LevelStatus.perfect : level.status,
}));

export const SinglePuzzleStep = Template.bind({});
SinglePuzzleStep.args = {
  name: 'Images, Pixels, and RGB',
  levels: levels.slice(0, 1),
  disabled: false,
};

export const MultiplePuzzleStep = Template.bind({});
MultiplePuzzleStep.args = {
  name: 'multiple puzzle step',
  levels: levels,
  disabled: false,
};

export const NonFirstStep = Template.bind({});
NonFirstStep.args = {
  name: 'Writing Exercises',
  levels: fakeLevels(5, 4),
  disabled: false,
};

export const Disabled = Template.bind({});
Disabled.args = {
  name: 'Assessment',
  levels: levels,
  disabled: true,
};

export const UnnamedProgression = Template.bind({});
UnnamedProgression.args = {
  levels: levels,
  disabled: false,
};

export const WithUnpluggedLevel = Template.bind({});
WithUnpluggedLevel.args = {
  levels: [fakeLevel({isUnplugged: true}), ...fakeLevels(5)].map(level => ({
    ...level,
    name: undefined,
  })),
  disabled: false,
};
