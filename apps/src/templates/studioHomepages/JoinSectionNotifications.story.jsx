import React from 'react';
import {
  JoinSectionSuccessNotification,
  LeaveSectionSuccessNotification,
  JoinSectionNotFoundNotification,
  JoinSectionFailNotification,
  JoinSectionExistsNotification,
} from './JoinSectionNotifications';

export default storybook => storybook
  .storiesOf('JoinSectionNotifications', module)
  .addStoryTable([
    {
      name: 'JoinSectionSuccessNotification',
      story: () => (
        <JoinSectionSuccessNotification sectionName="Ada Lovelace Homeroom"/>
      )
    },
    {
      name: 'LeaveSectionSuccessNotification',
      story: () => (
        <LeaveSectionSuccessNotification sectionName="Ada Lovelace Homeroom"/>
      )
    },
    {
      name: 'JoinSectionNotFoundNotification',
      story: () => (
        <JoinSectionNotFoundNotification sectionId="BCDFGH"/>
      )
    },
    {
      name: 'JoinSectionFailNotification',
      story: () => (
        <JoinSectionFailNotification sectionId="BCDFGH"/>
      )
    },
    {
      name: 'JoinSectionExistsNotification',
      story: () => (
        <JoinSectionExistsNotification sectionName="Ada Lovelace Homeroom"/>
      )
    },
  ]);
