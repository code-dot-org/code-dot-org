import React from 'react';
import ProgressLessonContent from './ProgressLessonContent';
import { fakeLevels } from './progressTestHelpers';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

export default storybook => {
  storybook
    .storiesOf('ProgressLessonContent', module)
    .addStoryTable([
      {
        name:'progress lesson content',
        story: () => (
          <ProgressLessonContent
            disabled={false}
            levels={fakeLevels(5).map((level, index) => ({
              ...level,
              status: index === 1 ? LevelStatus.perfect : LevelStatus.not_tried,
              name: undefined
            }))}
          />
        )
      },
      {
        name:'with unplugged lesson',
        story: () => (
          <ProgressLessonContent
            disabled={false}
            levels={fakeLevels(5).map((level, index) => ({
              ...level,
              status: index === 1 ? LevelStatus.perfect : LevelStatus.not_tried,
              name: undefined,
              isUnplugged: index === 0
            }))}
          />
        )
      }
    ]);
};
