import React from 'react';
import JoinSectionNotifications from './JoinSectionNotifications';

export default storybook => storybook
  .storiesOf('JoinSectionNotifications', module)
  .withReduxStore()
  .addStoryTable([
    {
      name: 'Join succeeded',
      story: () => (
        <JoinSectionNotifications
          action="join"
          result="success"
          name="Ada Lovelace Homeroom"
        />
      )
    },
    {
      name: 'Leave succeeded',
      story: () => (
        <JoinSectionNotifications
          action="leave"
          result="success"
          name="Ada Lovelace Homeroom"
          id="BCDFGH"
        />
      )
    },
    {
      name: 'Section not found',
      story: () => (
        <JoinSectionNotifications
          action="join"
          result="section_notfound"
          id="BCDFGH"
        />
      )
    },
    {
      name: 'Join failed',
      story: () => (
        <JoinSectionNotifications
          action="join"
          result="fail"
          id="BCDFGH"
        />
      )
    },
    {
      name: 'Already a member',
      story: () => (
        <JoinSectionNotifications
          action="join"
          result="exists"
          name="Ada Lovelace Homeroom"
        />
      )
    },
    {
      name: 'No notification',
      story: () => (
        <JoinSectionNotifications
          action={null}
          result={null}
          id="Ada Lovelace Homeroom"
        />
      )
    },
  ]);
