import React from 'react';
import ProgressBubble from './ProgressBubble';
import { BUBBLE_COLORS } from '@cdo/apps/code-studio/components/progress/ProgressDot';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

const statuses = Object.keys(BUBBLE_COLORS);

export default storybook => {
  storybook
    .storiesOf('ProgressBubble', module)
    .addStoryTable(
      statuses.map(status => ({
        name: `bubble status: ${status}`,
        story: () => (
          <ProgressBubble
            number={3}
            status={status}
            url="/foo/bar"
            disabled={false}
            levelIcon="document"
          />
        )
      })).concat([{
        name:'bubble with no url',
        story: () => (
          <ProgressBubble
            number={3}
            status={LevelStatus.perfect}
            disabled={false}
            levelIcon="document"
          />
        )
      }, {
        name:'disabled bubble',
        description: 'Should not be clickable or show progress',
        story: () => (
          <ProgressBubble
            number={3}
            status={LevelStatus.perfect}
            url="/foo/bar"
            disabled={true}
            levelIcon="document"
          />
        )
      }])
    );
};
