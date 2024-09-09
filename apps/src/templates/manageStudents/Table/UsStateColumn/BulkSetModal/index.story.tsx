import {action} from '@storybook/addon-actions';
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import currentUser from '@cdo/apps/templates/currentUserRedux';
import {reduxStoreDecorator} from '@cdo/storybook/decorators';

import BulkUpdateModal from './index';

export default {
  title: 'ManageStudents/ManageStudentsTable/UsStateColumn/BulkUpdateModal', // eslint-disable-line storybook/no-title-property-in-meta
  component: BulkUpdateModal,
  decorators: [reduxStoreDecorator.bind({currentUser})],
} as Meta;

const Template: StoryFn<object> = args => (
  <BulkUpdateModal isOpen={true} {...args} onClose={action('onClose')} />
);

export const Default = Template.bind({});

export const WithTeacherUSState = Template.bind({});
WithTeacherUSState.parameters = {
  store: {
    currentUser: {
      usStateCode: 'CO',
    },
  },
};
