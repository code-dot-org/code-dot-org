import {action} from '@storybook/addon-actions';
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';

import BulkUpdateModal from './index';

export default {
  title: 'ManageStudents/ManageStudentsTable/UsStateColumn/BulkUpdateModal', // eslint-disable-line storybook/no-title-property-in-meta
  component: BulkUpdateModal,
  decorators: [
    (Story: StoryFn) => (
      <Provider store={getStore()}>
        <Story />
      </Provider>
    ),
  ],
} as Meta;

const Template: StoryFn<typeof BulkUpdateModal> = args => (
  <BulkUpdateModal isOpen={true} {...args} onClose={action('onClose')} />
);

export const Default = Template.bind({});

export const WithInitialUSState = Template.bind({});
WithInitialUSState.args = {
  initVal: 'CO',
};
