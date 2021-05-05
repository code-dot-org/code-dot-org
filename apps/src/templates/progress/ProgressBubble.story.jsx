import React from 'react';
import ProgressBubble from './ProgressBubble';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

const statuses = Object.values(LevelStatus);

export default storybook => {
  storybook.storiesOf('Progress/ProgressBubble', module).addStoryTable(
    statuses
      .map(status => ({
        name: `bubble status: ${status}`,
        story: () => (
          <ProgressBubble
            level={{
              id: '1',
              levelNumber: 3,
              bubbleText: '3',
              status: status,
              isLocked: false,
              url: '/foo/bar',
              icon: 'fa-document'
            }}
            disabled={false}
          />
        )
      }))
      .concat([
        {
          name: 'bubble with no url',
          story: () => (
            <ProgressBubble
              level={{
                id: '1',
                levelNumber: 1,
                bubbleText: '1',
                status: LevelStatus.perfect,
                isLocked: false,
                icon: 'fa-document'
              }}
              disabled={false}
            />
          )
        },
        {
          name: 'disabled bubble',
          description: 'Should not be clickable or show progress',
          story: () => (
            <ProgressBubble
              level={{
                id: '1',
                levelNumber: 3,
                bubbleText: '1',
                status: LevelStatus.perfect,
                isLocked: false,
                url: '/foo/bar',
                icon: 'fa-document'
              }}
              disabled={true}
            />
          )
        },
        {
          name: 'hidden tooltips bubble',
          description: 'should not have tooltips',
          story: () => (
            <ProgressBubble
              level={{
                id: '1',
                levelNumber: 3,
                bubbleText: '3',
                status: LevelStatus.perfect,
                isLocked: false,
                url: '/foo/bar',
                icon: 'fa-document'
              }}
              hideToolTips={true}
              disabled={false}
            />
          )
        }
      ])
  );
};
