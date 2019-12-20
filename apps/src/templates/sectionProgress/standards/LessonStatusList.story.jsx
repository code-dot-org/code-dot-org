import React from 'react';
import {UnconnectedLessonStatusList as LessonStatusList} from './LessonStatusList';
import {unpluggedLessonList} from './standardsTestHelpers';

export default storybook => {
  return storybook
    .storiesOf('Standards/LessonStatusList', module)
    .add('overview', () => {
      return <LessonStatusList unpluggedLessonList={unpluggedLessonList} />;
    });
};
