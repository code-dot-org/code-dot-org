import React from 'react';
import { ProgressDot } from './ProgressDot';
import { LevelStatus, LevelKind } from '@cdo/apps/util/sharedConstants';

export default storybook => {
  storybook
    .storiesOf('ProgressDot', module)
    .addStoryTable([
      {
        name: 'small named level in header',
        story: () => (
          <ProgressDot
            courseOverviewPage={false}
            currentLevelId="1379"
            saveAnswersBeforeNavigation={false}
            status={LevelStatus.not_tried}
            level={{
              icon: 'fa-file-text',
              ids: [5442],
              kind: LevelKind.assessment,
              name: 'CSP Pre-survey',
              position: 1,
              previous: [1,1],
              title: 1,
              url: 'http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/1'
            }}
          />
        )
      },
      {
        name: 'completed small named video level in header',
        story: () => (
          <ProgressDot
            courseOverviewPage={false}
            currentLevelId="1379"
            saveAnswersBeforeNavigation={false}
            status={LevelStatus.perfect}
            level={{
              icon: 'fa-video-camera',
              ids: [5078],
              kind: LevelKind.puzzle,
              name: 'Computer Science is Changing Everything',
              position: 3,
              previous: [1,1],
              title: 3,
              url: 'http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/3'
            }}
          />
        )
      },
      {
        name: 'small puzzle in header',
        story: () => (
          <ProgressDot
            courseOverviewPage={false}
            currentLevelId="1379"
            saveAnswersBeforeNavigation={false}
            status={LevelStatus.not_tried}
            level={{
              icon: null,
              ids: [2049],
              kind: LevelKind.puzzle,
              position: 4,
              next: [3,1],
              title: 4,
              url: 'http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/4'
            }}
          />
        )
      },
      {
        name: 'current level puzzle in header',
        story: () => (
          <ProgressDot
            courseOverviewPage={false}
            currentLevelId="2049"
            saveAnswersBeforeNavigation={false}
            status={LevelStatus.not_tried}
            level={{
              icon: null,
              ids: [2049],
              kind: LevelKind.puzzle,
              position: 4,
              next: [3,1],
              title: 4,
              url: 'http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/4'
            }}
          />
        )
      },
      {
        name: 'stage extras in header',
        story: () => (
          <ProgressDot
            courseOverviewPage={false}
            currentLevelId="2049"
            status={LevelStatus.not_tried}
            level={{
              icon: 'fa-flag',
              kind: LevelKind.stage_extras,
              title: 'Stage Extras',
              url: 'http://localhost-studio.code.org:3000/s/coursea/stage/1/extras'
            }}
          />
        )
      },
      {
        name: 'current stage extras in header',
        story: () => (
          <ProgressDot
            courseOverviewPage={false}
            currentLevelId="stage_extras"
            status={LevelStatus.not_tried}
            level={{
              icon: 'fa-flag',
              kind: LevelKind.stage_extras,
              title: 'Stage Extras',
              url: 'http://localhost-studio.code.org:3000/s/coursea/stage/1/extras'
            }}
          />
        )
      },
    ]);
};
