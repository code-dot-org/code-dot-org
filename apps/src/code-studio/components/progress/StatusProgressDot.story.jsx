import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { StatusProgressDot } from './StatusProgressDot';
import { TestResults } from '@cdo/apps/constants';
import { SignInState } from '../../progressRedux';
import { ViewType } from '../../stageLockRedux';

export default storybook => {
  // ProgressDot grabs a couple items from redux. Create a bogus store with
  // these items hardcoded so we don't get warnings.
  const store = createStore(state => state, {
    progress: {
      currentLevelId: "555",
      saveAnswersBeforeNavigation: false
    }
  });

  const defaultProps = {
    viewAs: ViewType.Student,
    courseOverviewPage: true,
    postMilestoneDisabled: false,
    signInState: SignInState.SignedIn,
    saveAnswersBeforeNavigation: false,
    level: {
      icon: null,
      ids: [5275],
      kind: 'puzzle',
      next: [2, 1],
      position: 1,
      previous: [7,15],
      title: 1,
      url: 'http://localhost-studio.code.org:3000/s/course1/stage/8/puzzle/1',
    },
    levelProgress: { 5275: TestResults.ALL_PASS },
    lessonIsLockedForAllStudents: () => false
  };


  storybook
    .storiesOf('StatusProgressDot', module)
    .addStoryTable([
      {
        name: 'show progress when milestone posts are enabled',
        description: "should be green",
        story: () => (
          <Provider store={store}>
            <StatusProgressDot
              {...defaultProps}
            />
          </Provider>
        )
      },

      {
        name: 'milestone posts disabled, signed in',
        description: "background should be gray",
        story: () => (
          <Provider store={store}>
            <StatusProgressDot
              {...defaultProps}
              postMilestoneDisabled={true}
            />
          </Provider>
        )
      },

      {
        name: 'milestone posts disabled, signed out',
        description: "background should be green",
        story: () => (
          <Provider store={store}>
            <StatusProgressDot
              {...defaultProps}
              postMilestoneDisabled={true}
              signInState={SignInState.SignedOut}
            />
          </Provider>
        )
      },

      {
        name: 'milestone posts disabled, unknown signed in',
        description: "background should be white",
        story: () => (
          <Provider store={store}>
            <StatusProgressDot
              {...defaultProps}
              postMilestoneDisabled={true}
              signInState={SignInState.Unknown}
            />
          </Provider>
        )
      },
    ]);
};
