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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              icon: null,
              ids: [5275],
              kind: 'assessment',
              next: [2, 1],
              position: 1,
              previous: false,
              status: 'not_tried',
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              icon: null,
              ids: [5275],
              kind: 'assessment',
              next: [2, 1],
              position: 1,
              previous: false,
              status: 'locked',
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
            showProgress={true}
            grayProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              icon: null,
              ids: [5275],
              kind: 'assessment',
              next: [2, 1],
              position: 1,
              previous: false,
              status: 'locked',
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              icon: null,
              ids: [5275],
              kind: 'assessment',
              next: [2, 1],
              position: 1,
              previous: false,
              status: 'submitted',
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              icon: null,
              ids: [5275],
              kind: 'puzzle',
              next: [2, 1],
              position: 1,
              previous: [7,15],
              status: 'attempted',
              title: 1,
              url: 'http://localhost-studio.code.org:3000/s/course1/stage/8/puzzle/1'
            }}
          />
        )
      },
      {
        name: 'attempted puzzle in course overview with showProgress false',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            showProgress={false}
            saveAnswersBeforeNavigation={false}
            level={{
              icon: null,
              ids: [5275],
              kind: 'puzzle',
              next: [2, 1],
              position: 1,
              previous: [7,15],
              status: 'attempted',
              title: 1,
              url: 'http://localhost-studio.code.org:3000/s/course1/stage/8/puzzle/1'
            }}
          />
        )
      },
      {
        name: 'attempted puzzle in course overview with bubble colors disabled',
        story: () => (
          <ProgressDot
            courseOverviewPage={true}
            showProgress={true}
            grayProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              icon: null,
              ids: [5275],
              kind: 'puzzle',
              next: [2, 1],
              position: 1,
              previous: [7,15],
              status: 'attempted',
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              icon: null,
              ids: [2288],
              kind: 'puzzle',
              next: [2, 1],
              position: 6,
              status: 'passed',
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              icon: null,
              ids: [2288],
              kind: 'puzzle',
              next: [2, 1],
              position: 6,
              status: 'perfect',
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            currentLevelId="2288"
            level={{
              icon: null,
              ids: [2288],
              kind: 'puzzle',
              position: 6,
              status: 'not_tried',
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              icon: null,
              ids: [2094],
              kind: 'unplugged',
              previous: [1, 2],
              position: 1,
              status: 'not_tried',
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              icon: 'fa-file-text',
              ids: [1379],
              kind: 'puzzle',
              name: 'CSP Pre-survey',
              position: 2,
              status: 'not_tried',
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              icon: 'fa-file-text',
              ids: [5442],
              kind: 'named_level',
              name: 'CSP Pre-survey',
              position: 1,
              previous: [1,1],
              status: 'not_tried',
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              icon: 'fa-video-camera',
              ids: [5078],
              kind: 'named_level',
              name: 'Computer Science is Changing Everything',
              position: 3,
              previous: [1,1],
              status: 'perfect',
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              ids: [1073563865],
              position: 7,
              kind: "named_level",
              icon: null,
              title: 7,
              url: "http://localhost-studio.code.org:3000/s/alltheplcthings/stage/10/puzzle/7",
              name: "Peer Review Level 1 - Tuesday Report",
              status: "review_rejected"
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              ids: [1073563865],
              position: 7,
              kind: "named_level",
              icon: null,
              title: 7,
              url: "http://localhost-studio.code.org:3000/s/alltheplcthings/stage/10/puzzle/7",
              name: "Peer Review Level 1 - Tuesday Report",
              status: "review_accepted"
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              ids: [1073563865],
              position: 7,
              kind: "named_level",
              icon: null,
              title: 7,
              url: "http://localhost-studio.code.org:3000/s/alltheplcthings/stage/10/puzzle/7",
              name: "Peer Review Level 1 - Tuesday Report",
              status: "submitted"
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
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
            showProgress={true}
            saveAnswersBeforeNavigation={false}
            level={{
              icon: null,
              ids: [5096],
              kind: 'named_level',
              name: 'Internet Simulator: sending binary messages',
              position: 2,
              status: 'not_tried',
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
            showProgress={true}
            currentLevelId="1379"
            saveAnswersBeforeNavigation={false}
            level={{
              icon: 'fa-file-text',
              ids: [5442],
              kind: 'named_level',
              name: 'CSP Pre-survey',
              position: 1,
              previous: [1,1],
              status: 'not_tried',
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
            showProgress={true}
            currentLevelId="1379"
            saveAnswersBeforeNavigation={false}
            level={{
              icon: 'fa-video-camera',
              ids: [5078],
              kind: 'named_level',
              name: 'Computer Science is Changing Everything',
              position: 3,
              previous: [1,1],
              status: 'perfect',
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
            showProgress={true}
            currentLevelId="1379"
            saveAnswersBeforeNavigation={false}
            level={{
              icon: null,
              ids: [2049],
              kind: 'puzzle',
              position: 4,
              next: [3,1],
              status: 'not_tried',
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
            showProgress={true}
            currentLevelId="2049"
            saveAnswersBeforeNavigation={false}
            level={{
              icon: null,
              ids: [2049],
              kind: 'puzzle',
              position: 4,
              next: [3,1],
              status: 'not_tried',
              title: 4,
              url: 'http://localhost-studio.code.org:3000/s/csp1/stage/1/puzzle/4'
            }}
          />
        )
      },
    ]);
};
