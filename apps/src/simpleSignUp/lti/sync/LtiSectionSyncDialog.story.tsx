import {StoryFn} from '@storybook/react';
import React from 'react';

import LtiSectionSyncDialog from '@cdo/apps/simpleSignUp/lti/sync/LtiSectionSyncDialog';

export default {
  component: LtiSectionSyncDialog,
};

//
// TEMPLATE
//

const Template: StoryFn<typeof LtiSectionSyncDialog> = args => (
  <LtiSectionSyncDialog {...args} />
);

//
// STORIES
//

export const SuccessfulSync = Template.bind({});
SuccessfulSync.args = {
  isOpen: true,
  disableRosterSyncButtonEnabled: true,
  syncResult: {
    all: {
      1: {
        name: 'CSD - Period 1',
        short_name: 'Period 1',
        size: 34,
        lti_section_id: 1,
        instructors: [
          {
            name: 'Teacher 1',
            id: 0,
            isOwner: true,
          },
        ],
      },
      2: {
        name: 'CSD - Period 2',
        short_name: 'Period 2',
        size: 27,
        lti_section_id: 2,
        instructors: [
          {
            name: 'Teacher 1',
            id: 0,
            isOwner: true,
          },
        ],
      },
      3: {
        name: 'CSD - Period 3',
        short_name: 'Period 3',
        size: 32,
        lti_section_id: 3,
        instructors: [
          {
            name: 'Teacher 1',
            id: 0,
            isOwner: true,
          },
        ],
      },
    },
    changed: {
      2: {
        name: 'CSD - Period 2',
        short_name: 'Period 2',
        size: 27,
        lti_section_id: 2,
        instructors: [
          {
            name: 'Teacher 1',
            id: 0,
            isOwner: true,
          },
        ],
      },
      3: {
        name: 'CSD - Period 3',
        short_name: 'Period 3',
        size: 32,
        lti_section_id: 3,
        instructors: [
          {
            name: 'Teacher 1',
            id: 0,
            isOwner: true,
          },
        ],
      },
    },
  },
};
export const Error = Template.bind({});
Error.args = {
  isOpen: true,
  syncResult: {
    error: 'no_integration',
  },
};
