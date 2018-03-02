import React from 'react';
import SchoolInfoInterstitial from './SchoolInfoInterstitial';
import {action} from '@storybook/addon-actions';

export default storybook => storybook
  .storiesOf('SchoolInfoInterstitial', module)
  .add('overview', () => (
    <SchoolInfoInterstitial
      scriptData={{
        formUrl: '',
        authTokenName: 'auth_token',
        authTokenValue: 'fake_auth_token',
        existingSchoolInfo: {},
      }}
      onClose={action('onClose callback')}
    />
  ));
