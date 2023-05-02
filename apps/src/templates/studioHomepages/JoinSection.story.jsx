import React from 'react';
import {UnconnectedJoinSection as JoinSection} from './JoinSection';
import {action} from '@storybook/addon-actions';

export default {
  title: 'JoinSection',
  component: JoinSection,
};

const Template = args => (
  <JoinSection
    updateSections={action('updateSections')}
    updateSectionsResult={action('updateSectionsResult')}
    {...args}
  />
);

/*
Input field for students to enter a section code to join a section.
Has a dashed border to draw attention if the student is not yet a member of a section.
*/
export const NoSectionsYet = Template.bind({});
NoSectionsYet.args = {
  enrolledInASection: false,
};

export const StudentInSectionAlready = Template.bind({});
StudentInSectionAlready.args = {
  enrolledInASection: true,
};
