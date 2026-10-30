import {action} from '@storybook/addon-actions';
import React from 'react';

import SchoolInfoConfirmationDialog from './SchoolInfoConfirmationDialog';

export default {
  component: SchoolInfoConfirmationDialog,
};

//
// TEMPLATE
//

const Template = args => <SchoolInfoConfirmationDialog {...args} />;

//
// STORIES
//

export const DisplaySchoolInfoConfirmationDialog = Template.bind({});
DisplaySchoolInfoConfirmationDialog.args = {
  scriptData: {
    usIp: false,
    existingSchoolInfo: {},
  },
  onClose: action('onClose callback'),
  isOpen: true,
};
