import {action} from '@storybook/addon-actions';
import React from 'react';

import SchoolInfoInterstitial from './SchoolInfoInterstitial';

export default {
  component: SchoolInfoInterstitial,
};

//
// TEMPLATE
//

const Template = args => <SchoolInfoInterstitial {...args} />;

//
// STORIES
//

export const Overview = Template.bind({});
Overview.args = {
  scriptData: {
    formUrl: '',
    authTokenName: 'auth_token',
    authTokenValue: 'fake_auth_token',
    usIp: false,
    existingSchoolInfo: {
      country: '',
      school_id: '',
      school_name: '',
      school_zip: '',
    },
  },
  onClose: action('onClose callback'),
};
