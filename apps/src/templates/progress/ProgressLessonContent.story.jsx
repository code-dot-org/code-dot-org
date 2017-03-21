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
            description={"At some point we reach a physical limit of how fast " +
              "we can send bits and if we want to send a large amount of " +
              "information faster, we have to finds ways to represent the same " +
              "information with fewer bits - we must compress the data."}
            levels={fakeLevels(5).map((level, index) => ({
              ...level,
              status: index === 1 ? LevelStatus.perfect : LevelStatus.not_tried,
              name: undefined
            }))}
          />
        )
      }
    ]);
};
