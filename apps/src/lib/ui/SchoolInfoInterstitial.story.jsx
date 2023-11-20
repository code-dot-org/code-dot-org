import React from 'react';
import SchoolInfoInterstitial from './SchoolInfoInterstitial';
import {action} from '@storybook/addon-actions';

export default {
  title: 'SchoolInfoInterstitial',
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
    existingSchoolInfo: {},
  },
  onClose: action('onClose callback'),
};
