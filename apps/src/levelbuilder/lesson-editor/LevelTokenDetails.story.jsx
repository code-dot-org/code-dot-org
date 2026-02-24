import {action} from '@storybook/addon-actions';
import React from 'react';

import {UnconnectedLevelTokenDetails as LevelTokenDetails} from '@cdo/apps/levelbuilder/lesson-editor/LevelTokenDetails';

const defaultLevel = {
  id: '10',
  position: 1,
  levels: [
    {
      name: 'Level 1',
      id: '2',
      url: '/fake/url/',
    },
  ],
  activeId: '2',
  expand: true,
};

export default {
  component: LevelTokenDetails,
};

const Template = args => (
  <div style={{width: 800}}>
    <LevelTokenDetails
      setScriptLevelField={action('setScriptLevelField')}
      activitySectionPosition={1}
      activityPosition={1}
      allowMajorCurriculumChanges={true}
      scriptLevel={defaultLevel}
      {...args}
    />
  </div>
);

export const LevelTokenLessonExtras = Template.bind({});
LevelTokenLessonExtras.args = {
  lessonExtrasAvailableForUnit: true,
};

export const LevelTokenNoExtras = Template.bind({});
LevelTokenNoExtras.args = {
  lessonExtrasAvailableForUnit: false,
};

export const LevelTokenPL = Template.bind({});
LevelTokenPL.args = {
  lessonExtrasAvailableForUnit: true,
  isProfessionalLearningCourse: true,
};

export const LevelTokenInactive = Template.bind({});
LevelTokenInactive.args = {
  lessonExtrasAvailableForUnit: true,
  inactiveLevelNames: ['Inactive Level'],
};
