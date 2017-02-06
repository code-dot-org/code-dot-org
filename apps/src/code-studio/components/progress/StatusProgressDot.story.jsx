import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { StatusProgressDot } from './StatusProgressDot';
import { LevelStatus } from '../../activityUtils';
import { ViewType } from '../../stageLockRedux';

export default storybook => {
  // progress_dot grabs a couple items from redux. Create a bogus store with
  // these items hardcoded so we don't get warnings.
  const store = createStore(state => state, {
    progress: {
      currentLevelId: "555",
      saveAnswersBeforeNavigation: false
    }
  });

  storybook
    .storiesOf('StatusProgressDot', module)
    .addStoryTable([
      {
        name: 'showProgress is true',
        description: "should be green",
        story: () => (
          <Provider store={store}>
            <StatusProgressDot
              viewAs={ViewType.Student}
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
                title: 1,
                url: 'http://localhost-studio.code.org:3000/s/course1/stage/8/puzzle/1',
                status: LevelStatus.perfect
              }}
            />
          </Provider>
        )
      },

      {
        name: 'showProgress is false',
        description: "should not be green",
        story: () => (
          <Provider store={store}>
            <StatusProgressDot
              viewAs={ViewType.Student}
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
                title: 1,
                url: 'http://localhost-studio.code.org:3000/s/course1/stage/8/puzzle/1',
                status: LevelStatus.perfect
              }}
            />
          </Provider>
        )
      },

      {
        name: 'perfect puzzle in course overview with bubble colors disabled',
        description: "should be gray",
        story: () => (
          <Provider store={store}>
            <StatusProgressDot
              viewAs={ViewType.Student}
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
                title: 1,
                url: 'http://localhost-studio.code.org:3000/s/course1/stage/8/puzzle/1',
                status: LevelStatus.perfect
              }}
            />
          </Provider>
        )
      },
    ]);
};
