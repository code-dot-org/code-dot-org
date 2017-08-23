import React from 'react';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import isRtlReducer from '@cdo/apps/code-studio/isRtlRedux';
import JoinSectionNotifications from './JoinSectionNotifications';

registerReducers({isRtl: isRtlReducer});
const store = getStore();

export default storybook => storybook
  .storiesOf('JoinSectionNotifications', module)
  .addStoryTable([
    {
      name: 'Join succeeded',
      story: () => (
        <Provider store={store}>
          <JoinSectionNotifications
            action="join"
            result="success"
            nameOrId="Ada Lovelace Homeroom"
          />
        </Provider>
      )
    },
    {
      name: 'Leave succeeded',
      story: () => (
        <Provider store={store}>
          <JoinSectionNotifications
            action="leave"
            result="success"
            nameOrId="Ada Lovelace Homeroom"
          />
        </Provider>
      )
    },
    {
      name: 'Section not found',
      story: () => (
        <Provider store={store}>
          <JoinSectionNotifications
            action="join"
            result="section_notfound"
            nameOrId="BCDFGH"
          />
        </Provider>
      )
    },
    {
      name: 'Join failed',
      story: () => (
        <Provider store={store}>
          <JoinSectionNotifications
            action="join"
            result="fail"
            nameOrId="BCDFGH"
          />
        </Provider>
      )
    },
    {
      name: 'Already a member',
      story: () => (
        <Provider store={store}>
          <JoinSectionNotifications
            action="join"
            result="exists"
            nameOrId="Ada Lovelace Homeroom"
          />
        </Provider>
      )
    },
    {
      name: 'No notification',
      story: () => (
        <Provider store={store}>
          <JoinSectionNotifications
            action={null}
            result={null}
            nameOrId="Ada Lovelace Homeroom"
          />
        </Provider>
      )
    },
  ]);
