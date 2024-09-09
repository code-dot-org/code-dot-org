import {action} from '@storybook/addon-actions';
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import currentUser from '@cdo/apps/templates/currentUserRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import {reduxStoreDecorator} from '@cdo/storybook/decorators';

import BulkUpdateModal from './index';

// Store setup
const reducers = {currentUser, teacherSections};
const initialState = {
  currentUser: {
    usStateCode: null,
  },
  teacherSections: {
    selectedSectionId: 99,
    sections: {
      99: {
        id: 99,
        loginType: SectionLoginType.email,
      },
    },
  },
};

export default {
  title: 'ManageStudents/ManageStudentsTable/UsStateColumn/BulkUpdateModal', // eslint-disable-line storybook/no-title-property-in-meta
  component: BulkUpdateModal,
  decorators: [reduxStoreDecorator.bind({reducers, initialState})],
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
