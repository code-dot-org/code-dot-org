import React from 'react';
import ProgressBubble from './ProgressBubble';
import {levelProgressWithStatus} from '@cdo/apps/templates/progress/progressHelpers';
import {LevelKind, LevelStatus} from '@cdo/apps/util/sharedConstants';

const statuses = Object.values(LevelStatus);
const perfectProgress = levelProgressWithStatus(LevelStatus.perfect);

export default storybook => {
  storybook.storiesOf('Progress/ProgressBubble', module).addStoryTable(
    statuses
      .map(status => ({
        name: `bubble status: ${status}`,
        story: () => (
          <ProgressBubble
            level={{
              kind:
                status === LevelStatus.completed_assessment
                  ? LevelKind.assessment
                  : LevelKind.level,
              icon: status === LevelStatus.locked ? 'fa-lock' : 'fa-document',
              id: 1,
              levelNumber: 3,
              url: '/foo/bar'
            }}
            studentLevelProgress={levelProgressWithStatus(status)}
            disabled={status === LevelStatus.locked}
          />
        )
      }))
      .concat([
        {
          name: 'bubble with no url',
          story: () => (
            <ProgressBubble
              level={{
                id: 1,
                levelNumber: 3,
                icon: 'fa-document',
                kind: LevelKind.level
              }}
              studentLevelProgress={perfectProgress}
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
                id: 1,
                levelNumber: 3,
                icon: 'fa-document',
                kind: LevelKind.level,
                url: '/foo/bar'
              }}
              studentLevelProgress={perfectProgress}
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
                id: 1,
                levelNumber: 3,
                kind: LevelKind.level,
                url: '/foo/bar',
                icon: 'fa-document'
              }}
              studentLevelProgress={perfectProgress}
              hideToolTips={true}
              disabled={false}
            />
          )
        },
        {
          name: 'pairing icon bubble - perfect',
          description: 'should show the paring icon, completed perfectly',
          story: () => (
            <ProgressBubble
              level={{
                id: 1,
                levelNumber: 3,
                kind: LevelKind.level,
                url: '/foo/bar',
                icon: 'fa-document'
              }}
              studentLevelProgress={{...perfectProgress, paired: true}}
              hideToolTips={true}
              disabled={false}
              pairingIconEnabled={true}
            />
          )
        },
        {
          name: 'pairing icon bubble - attempted',
          description: 'should show the paring icon, attempted',
          story: () => (
            <ProgressBubble
              level={{
                id: 1,
                levelNumber: 3,
                kind: LevelKind.level,
                url: '/foo/bar',
                icon: 'fa-document'
              }}
              studentLevelProgress={{
                ...levelProgressWithStatus(LevelStatus.attempted),
                paired: true
              }}
              hideToolTips={true}
              disabled={false}
              pairingIconEnabled={true}
            />
          )
        }
      ])
  );
};
