import React from 'react';
import {
  LocalClassActionBlock,
  AdministratorResourcesActionBlock,
  TwoColumnActionBlock
} from './TwoColumnActionBlock';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

export default {
  title: 'TwoColumnActionBlock',
  component: TwoColumnActionBlock
};

const LocalClassActionBlockTemplate = args => {
  return (
    <Provider store={reduxStore()}>
      <LocalClassActionBlock showHeading={true} />
    </Provider>
  );
};

const AdministratorResourcesActionBlockTemplate = args => {
  return (
    <Provider store={reduxStore()}>
      <AdministratorResourcesActionBlock showHeading={true} />
    </Provider>
  );
};

export const LocalClassActionBlockExamples = LocalClassActionBlockTemplate.bind(
  {}
);

export const AdministratorResourcesActionBlockExamples = AdministratorResourcesActionBlockTemplate.bind(
  {}
);
