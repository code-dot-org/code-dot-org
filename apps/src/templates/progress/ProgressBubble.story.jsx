import React from 'react';
import ProgressBubble from './ProgressBubble';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';

const statuses = Object.values(LevelStatus);

export default storybook => {
  storybook
    .storiesOf('Progress/ProgressBubble', module)
    .addStoryTable(
      statuses.map(status => ({
        name: `bubble status: ${status}`,
        story: () => (
          <ProgressBubble
            level={{
              levelNumber: 3,
              status: status,
              url: "/foo/bar",
              icon: status === LevelStatus.locked ? "fa-lock": "fa-document"
            }}
            disabled={status === LevelStatus.locked}
          />
        )
      })).concat([{
        name:'bubble with no url',
        story: () => (
          <ProgressBubble
            level={{
              levelNumber: 3,
              status: LevelStatus.perfect,
              url: "/foo/bar",
              icon: "fa-document"
            }}
            disabled={false}

          />
        )
      }, {
        name:'disabled bubble',
        description: 'Should not be clickable or show progress',
        story: () => (
          <ProgressBubble
            level={{
              levelNumber: 3,
              status: LevelStatus.perfect,
              url: "/foo/bar",
              icon: "fa-document"
            }}
            disabled={true}
          />
        )
      }, {
        name:'hidden tooltips bubble',
        description: 'should not have tooltips',
        story: () => (
          <ProgressBubble
            level={{
              levelNumber: 3,
              status: LevelStatus.perfect,
              url: "/foo/bar",
              icon: "fa-document"
            }}
            hideToolTips={true}
            disabled={false}
          />
        )
      }])
    );
};
