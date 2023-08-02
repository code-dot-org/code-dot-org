import React from 'react';
import SchoolInfoConfirmationDialog from './SchoolInfoConfirmationDialog';
import {action} from '@storybook/addon-actions';

export default {
  title: 'SchoolInfoConfirmationDialog',
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
    formUrl: '',
    authTokenName: 'auth_token',
    authTokenValue: 'fake_auth_token',
    existingSchoolInfo: {},
  },
  onClose: action('onClose callback'),
  isOpen: true,
};
