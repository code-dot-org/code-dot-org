import React from 'react';
import {UnconnectedLevelTokenDetails as LevelTokenDetails} from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelTokenDetails';
import {action} from '@storybook/addon-actions';

const defaultLevel = {
  id: '10',
  position: 1,
  levels: [
    {
      name: 'Level 1',
      id: '2',
      url: '/fake/url/'
    }
  ],
  activeId: '2',
  expand: true
};

export default {
  title: 'LevelTokenDetails',
  component: LevelTokenDetails
};

const Template = args => (
  <div style={{width: 800}}>
    <LevelTokenDetails
      setScriptLevelField={action('setScriptLevelField')}
      activitySectionPosition={1}
      activityPosition={1}
      allowMajorCurriculumChanges={true}
      {...args}
    />
  </div>
);

export const LevelTokenLessonExtras = Template.bind({});
LevelTokenLessonExtras.args = {
  scriptLevel: defaultLevel,
  lessonExtrasAvailableForUnit: true
};

export const LevelTokenNoExtras = Template.bind({});
LevelTokenNoExtras.args = {
  scriptLevel: defaultLevel,
  lessonExtrasAvailableForUnit: false
};

export const LevelTokenPL = Template.bind({});
LevelTokenPL.args = {
  scriptLevel: defaultLevel,
  lessonExtrasAvailableForUnit: true,
  isProfessionalLearningCourse: true
};

export const LevelTokenInactive = Template.bind({});
LevelTokenInactive.args = {
  scriptLevel: defaultLevel,
  lessonExtrasAvailableForUnit: true,
  inactiveLevelNames: ['Inactive Level']
};
