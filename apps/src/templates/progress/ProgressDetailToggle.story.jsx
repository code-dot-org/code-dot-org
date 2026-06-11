import {action} from '@storybook/addon-actions';
import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import {UnconnectedProgressDetailToggle as ProgressDetailToggle} from './ProgressDetailToggle';

export default {
  component: ProgressDetailToggle,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <ProgressDetailToggle
      setIsSummaryView={action('setIsSummaryView')}
      {...args}
    />
  </Provider>
);

export const SummarySelected = Template.bind({});
SummarySelected.args = {
  isSummaryView: true,
};

export const DetailSelected = Template.bind({});
DetailSelected.args = {
  isSummaryView: false,
};
