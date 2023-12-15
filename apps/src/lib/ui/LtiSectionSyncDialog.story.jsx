import React from 'react';
import LtiSectionSyncDialog from '@cdo/apps/lib/ui/LtiSectionSyncDialog';

export default {
  title: 'LtiSectionSyncDialog',
  component: LtiSectionSyncDialog,
};

//
// TEMPLATE
//

const Template = args => <LtiSectionSyncDialog {...args} />;

//
// STORIES
//

export const SuccessfulSync = Template.bind({});
SuccessfulSync.args = {
  isOpen: true,
  syncResult: {
    all: {
      1: {
        name: 'CSD - Period 1',
        size: 34,
      },
      2: {
        name: 'CSD - Period 2',
        size: 27,
      },
      3: {
        name: 'CSD - Period 3',
        size: 32,
      },
    },
    updated: {
      2: {
        name: 'CSD - Period 2',
        size: 27,
      },
      3: {
        name: 'CSD - Period 3',
        size: 32,
      },
    },
  },
};
export const Error = Template.bind({});
Error.args = {
  isOpen: true,
  syncResult: {
    error: 'LTI Integration not found',
  },
};
