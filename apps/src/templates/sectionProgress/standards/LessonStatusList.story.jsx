import React from 'react';
import {UnconnectedLessonStatusList as LessonStatusList} from './LessonStatusList';

export default storybook => {
  return storybook
    .storiesOf('Standards/LessonStatusList', module)
    .add('overview', () => {
      return <LessonStatusList />;
    });
};
