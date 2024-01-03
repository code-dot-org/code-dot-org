import React from 'react';
import SetUpSections from './SetUpSections';
import {action} from '@storybook/addon-actions';
import {reduxStore} from '@cdo/storybook/decorators';
import {Provider} from 'react-redux';

export default {
  title: 'SetUpSections',
  component: SetUpSections,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <SetUpSections
      beginEditingSection={action('beginEditingSection')}
      {...args}
    />
  </Provider>
);

// Information box if the teacher doesn't have any sections yet.
export const NoSectionsYet = Template.bind({});
NoSectionsYet.args = {
  hasSections: false,
};

// Information box if the teacher does have sections already.
export const AlreadyHasSection = Template.bind({});
AlreadyHasSection.args = {
  hasSections: true,
};
