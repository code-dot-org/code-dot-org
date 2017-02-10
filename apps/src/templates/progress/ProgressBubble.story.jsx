import React from 'react';
import ProgressBubble from './ProgressBubble';
import { BUBBLE_COLORS } from '@cdo/apps/code-studio/components/progress/ProgressDot';

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
          />
        )
      })).concat([{
        name:'bubble with no url',
        story: () => (
          <ProgressBubble
            number={3}
            status="perfect"
          />
        )
      }])
    );
};
