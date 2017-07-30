import React from 'react';
import JoinSectionNotifications from './JoinSectionNotifications';

export default storybook => storybook
  .storiesOf('JoinSectionNotifications', module)
  .addStoryTable([
    {
      name: 'Join succeeded',
      story: () => (
        <JoinSectionNotifications
          action="join"
          result="success"
          nameOrId="Ada Lovelace Homeroom"
        />
      )
    },
    {
      name: 'Leave succeeded',
      story: () => (
        <JoinSectionNotifications
          action="leave"
          result="success"
          nameOrId="Ada Lovelace Homeroom"
        />
      )
    },
    {
      name: 'Section not found',
      story: () => (
        <JoinSectionNotifications
          action="join"
          result="section_notfound"
          nameOrId="BCDFGH"
        />
      )
    },
    {
      name: 'Join failed',
      story: () => (
        <JoinSectionNotifications
          action="join"
          result="fail"
          nameOrId="BCDFGH"
        />
      )
    },
    {
      name: 'Already a member',
      story: () => (
        <JoinSectionNotifications
          action="join"
          result="exists"
          nameOrId="Ada Lovelace Homeroom"
        />
      )
    },
    {
      name: 'No notification',
      story: () => (
        <JoinSectionNotifications
          action={null}
          result={null}
          nameOrId="Ada Lovelace Homeroom"
        />
      )
    },
  ]);
