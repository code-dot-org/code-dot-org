import React from 'react';
import {ProgressDot} from './progress_dot';

export default storybook => {
  storybook
    .storiesOf('ProgressDot', module)
    .addStoryTable([
      {
        name: 'assessment in course overview',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status="not_tried"
            level={{
              icon: null,
              ids: [5275],
              kind: 'assessment',
              next: [2, 1],
              position: 1,
              previous: false,
              title: 1,
              uid: '5275_0',
              url: 'http://localhost-studio.code.org:3000/s/csp1/lockable/1/puzzle/1/page/1'
            }}
          />
        )
      },
      {
        name: 'locked assessment in course overview',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status="locked"
            level={{
              icon: null,
              ids: [5275],
              kind: 'assessment',
              next: [2, 1],
              position: 1,
              previous: false,
              title: 1,
              uid: '5275_0',
              url: 'http://localhost-studio.code.org:3000/s/csp1/lockable/1/puzzle/1/page/1'
            }}
          />
        )
      },
      {
        name: 'locked assessment in course overview with bubble colors disabled',
        description: "Should still show lock icon",
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            grayProgress={true}
            saveAnswersBeforeNavigation={false}
            status="locked"
            level={{
              icon: null,
              ids: [5275],
              kind: 'assessment',
              next: [2, 1],
              position: 1,
              previous: false,
              title: 1,
              uid: '5275_0',
              url: 'http://localhost-studio.code.org:3000/s/csp1/lockable/1/puzzle/1/page/1'
            }}
          />
        )
      },
      {
        name: 'submitted assessment in course overview',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status="submitted"
            level={{
              icon: null,
              ids: [5275],
              kind: 'assessment',
              next: [2, 1],
              position: 1,
              previous: false,
              title: 1,
              uid: '5275_0',
              url: 'http://localhost-studio.code.org:3000/s/csp1/lockable/1/puzzle/1/page/1'
            }}
          />
        )
      },
      {
        name: 'attempted puzzle in course overview',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status="attempted"
            level={{
              icon: null,
              ids: [5275],
              kind: 'puzzle',
              next: [2, 1],
              position: 1,
              previous: [7,15],
              title: 1,
              url: 'http://localhost-studio.code.org:3000/s/course1/stage/8/puzzle/1'
            }}
          />
        )
      },


      {
        name: 'imperfect completed puzzle in course overview',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status="passed"
            level={{
              icon: null,
              ids: [2288],
              kind: 'puzzle',
              next: [2, 1],
              position: 6,
              title: 6,
              url: 'http://localhost-studio.code.org:3000/s/course1/stage/11/puzzle/6'
            }}
          />
        )
      },
      {
        name: 'completed puzzle in course overview',
        description: 'Note: Center of the circle should be a number rather than an checkmark',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status="perfect"
            level={{
              icon: null,
              ids: [2288],
              kind: 'puzzle',
              next: [2, 1],
              position: 6,
              title: 6,
              url: 'http://localhost-studio.code.org:3000/s/course1/stage/11/puzzle/6'
            }}
          />
        )
      },
      {
        name: 'current puzzle in course overview',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            currentLevelId="2288"
            status="not_tried"
            level={{
              icon: null,
              ids: [2288],
              kind: 'puzzle',
              position: 6,
              title: 6,
              url: 'http://localhost-studio.code.org:3000/s/course1/stage/11/puzzle/6'
            }}
          />
        )
      },
      {
        name: 'unlplugged puzzle in course overview',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status="not_tried"
            level={{
              icon: null,
              ids: [2094],
              kind: 'unplugged',
              previous: [1, 2],
              position: 1,
              title: 'Unplugged Activity',
              url: 'http://localhost-studio.code.org:3000/s/course1/stage/2/puzzle/1'
            }}
          />
        )
      },
      {
        name: 'puzzle with icon in course overview',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status="not_tried"
            level={{
              icon: 'fa-file-text',
              ids: [1379],
              kind: 'puzzle',
              name: 'CSP Pre-survey',
              position: 2,
              title: 2,
              url: 'http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/2'
            }}
          />
        )
      },
      {
        name: 'named level in course overview',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status="not_tried"
            level={{
              icon: 'fa-file-text',
              ids: [5442],
              kind: 'named_level',
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
        name: 'completed named video level in course overview',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status="perfect"
            level={{
              icon: 'fa-video-camera',
              ids: [5078],
              kind: 'named_level',
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
        name: 'rejected peer review in course overview',
        description: 'Note: Center of circle should have an exclamation point',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status="review_rejected"
            level={{
              ids: [1073563865],
              position: 7,
              kind: "named_level",
              icon: null,
              title: 7,
              url: "http://localhost-studio.code.org:3000/s/alltheplcthings/stage/10/puzzle/7",
              name: "Peer Review Level 1 - Tuesday Report",
            }}
          />
        )
      },
      {
        name: 'accepted peer review in course overview',
        description: 'Note: Center of circle should have a checkmark',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status="review_accepted"
            level={{
              ids: [1073563865],
              position: 7,
              kind: "named_level",
              icon: null,
              title: 7,
              url: "http://localhost-studio.code.org:3000/s/alltheplcthings/stage/10/puzzle/7",
              name: "Peer Review Level 1 - Tuesday Report",
            }}
          />
        )
      },
      {
        name: 'submitted but unreviewed peer review in course overview',
        description: 'Note: Center of circle should have no icon',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status="submitted"
            level={{
              ids: [1073563865],
              position: 7,
              kind: "named_level",
              icon: null,
              title: 7,
              url: "http://localhost-studio.code.org:3000/s/alltheplcthings/stage/10/puzzle/7",
              name: "Peer Review Level 1 - Tuesday Report",
            }}
          />
        )
      },
      {
        name: 'locked peer review in course overview',
        description: 'Note: Center of circle should have a locked icon',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status={undefined}
            level={{
              ids: [0],
              kind: "peer_review",
              title: "",
              url: "",
              name: "Reviews unavailable at this time",
              icon: "fa-lock",
              locked: true
            }}
          />
        )
      },
      {
        name: 'named video level in course overview with no icon',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            saveAnswersBeforeNavigation={false}
            status="not_tried"
            level={{
              icon: null,
              ids: [5096],
              kind: 'named_level',
              name: 'Internet Simulator: sending binary messages',
              position: 2,
              title: 2,
              url: 'http://localhost-studio.code.org:3000/s/csp1/stage/3/puzzle/2'
            }}
          />
        )
      },
      {
        name: 'small named level in header',
        story: () => (
          <ProgressDot
            courseOverviewPage={false}
            currentLevelId="1379"
            saveAnswersBeforeNavigation={false}
            status="not_tried"
            level={{
              icon: 'fa-file-text',
              ids: [5442],
              kind: 'named_level',
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
            status="perfect"
            level={{
              icon: 'fa-video-camera',
              ids: [5078],
              kind: 'named_level',
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
            status="not_tried"
            level={{
              icon: null,
              ids: [2049],
              kind: 'puzzle',
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
            status="not_tried"
            level={{
              icon: null,
              ids: [2049],
              kind: 'puzzle',
              position: 4,
              next: [3,1],
              title: 4,
              url: 'http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/4'
            }}
          />
        )
      },
    ]);
};
