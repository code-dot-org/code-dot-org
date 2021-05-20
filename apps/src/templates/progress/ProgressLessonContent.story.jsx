import React from 'react';
import ProgressLessonContent from './ProgressLessonContent';
import {fakeLevels, fakeLevel} from './progressTestHelpers';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

export default storybook => {
  storybook
    .storiesOf('Progress/ProgressLessonContent', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'progress lesson content',
        story: () => (
          <ProgressLessonContent
            disabled={false}
            levels={fakeLevels(5).map((level, index) => ({
              ...level,
              status: index === 1 ? LevelStatus.perfect : LevelStatus.not_tried,
              name: 'Progression'
            }))}
          />
        )
      },
      {
        name: 'with unplugged lesson',
        description: 'pill should say unplugged, because of first level',
        story: () => (
          <ProgressLessonContent
            disabled={false}
            levels={[fakeLevel({isUnplugged: true}), ...fakeLevels(5)].map(
              level => ({...level, name: 'Progression'})
            )}
          />
        )
      },
      {
        name: 'with named unplugged lesson',
        description:
          'First pill should say unplugged. second should say level 1-5',
        story: () => (
          <ProgressLessonContent
            disabled={false}
            levels={[
              {
                ...fakeLevel({isUnplugged: true}),
                name: 'Fun unplugged/named level'
              },
              ...fakeLevels(5, {named: false})
            ]}
          />
        )
      },
      {
        name: 'with no named levels',
        description: 'no pills',
        story: () => (
          <ProgressLessonContent
            disabled={false}
            levels={[
              {
                ...fakeLevel({isUnplugged: true, name: undefined})
              },
              ...fakeLevels(5, {named: false})
            ]}
          />
        )
      }
    ]);
};
