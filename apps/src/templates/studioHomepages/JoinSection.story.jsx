import React from 'react';
import {UnconnectedJoinSection as JoinSection} from './JoinSection';
import {action} from '@storybook/addon-actions';

export default storybook => {
  return storybook.storiesOf('Homepages/JoinSection', module).addStoryTable([
    {
      name: 'Join Section - no sections yet',
      description:
        'Input field for students to enter a section code to join a section. Has a dashed border to draw attention if the student is not yet a member of a section',
      story: () => (
        <JoinSection
          enrolledInASection={false}
          updateSections={action('updateSections')}
          updateSectionsResult={action('updateSectionsResult')}
        />
      )
    },
    {
      name: 'Join Section - student already enrolled in at least one section',
      description:
        'Input field for students to enter a section code to join a section. Has a plain border',
      story: () => (
        <JoinSection
          enrolledInASection={true}
          updateSections={action('updateSections')}
          updateSectionsResult={action('updateSectionsResult')}
        />
      )
    }
  ]);
};
