import React from 'react';
import {
  AdministratorResourcesActionBlock,
  TwoColumnActionBlock,
} from './TwoColumnActionBlock';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

export default {
  title: 'TwoColumnActionBlock',
  component: TwoColumnActionBlock,
};

const AdministratorResourcesActionBlockTemplate = args => {
  return (
    <Provider store={reduxStore()}>
      <AdministratorResourcesActionBlock showHeading={true} />
    </Provider>
  );
};

export const AdministratorResourcesActionBlockExamples =
  AdministratorResourcesActionBlockTemplate.bind({});
