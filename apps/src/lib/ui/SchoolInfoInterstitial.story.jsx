import React from 'react';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';
import SchoolInfoInterstitial from './SchoolInfoInterstitial';

export default {
  title: 'SchoolInfoInterstitial',
  component: SchoolInfoInterstitial
};

const Template = args => (
  <Provider store={reduxStore()}>
    <SchoolInfoInterstitial {...args} />
  </Provider>
);

export const Overview = Template.bind({});
Overview.args = {
  scriptData: {
    formUrl: '',
    authTokenName: 'auth_token',
    authTokenValue: 'fake_auth_token',
    existingSchoolInfo: {}
  },
  onClose: () => console.log('onClose callback')
};
