import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import LargeChevronLink from './LargeChevronLink';

export default {
  component: LargeChevronLink,
};

export const Default = () => {
  return (
    <Provider store={reduxStore()}>
      <LargeChevronLink link="/foo" linkText="View course" isRtl={false} />
    </Provider>
  );
};
