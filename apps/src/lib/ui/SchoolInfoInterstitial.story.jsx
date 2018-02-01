import React from 'react';
import SchoolInfoInterstitial from './SchoolInfoInterstitial';

export default storybook => storybook
  .storiesOf('SchoolInfoInterstitial')
  .addWithInfo('overview', '', () => (
    <SchoolInfoInterstitial/>
  ));
