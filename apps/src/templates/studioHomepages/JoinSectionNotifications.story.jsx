import React from 'react';
import JoinSectionNotifications from './JoinSectionNotifications';

export default storybook =>
  storybook
    .storiesOf('Homepages/JoinSectionNotifications', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Join succeeded',
        story: () => (
          <JoinSectionNotifications
            action="join"
            result="success"
            sectionName="Ada Lovelace Homeroom"
          />
        )
      },
      {
        name: 'Leave succeeded',
        story: () => (
          <JoinSectionNotifications
            action="leave"
            result="success"
            sectionName="Ada Lovelace Homeroom"
            sectionCode="BCDFGH"
          />
        )
      },
      {
        name: 'Section not found',
        story: () => (
          <JoinSectionNotifications
            action="join"
            result="section_notfound"
            sectionCode="BCDFGH"
          />
        )
      },
      {
        name: 'Join failed',
        story: () => (
          <JoinSectionNotifications
            action="join"
            result="fail"
            sectionCode="BCDFGH"
          />
        )
      },
      {
        name: 'Already a member',
        story: () => (
          <JoinSectionNotifications
            action="join"
            result="exists"
            sectionName="Ada Lovelace Homeroom"
          />
        )
      },
      {
        name: 'No notification',
        story: () => (
          <JoinSectionNotifications
            action={null}
            result={null}
            sectionName="Ada Lovelace Homeroom"
          />
        )
      }
    ]);
