import {action} from '@storybook/addon-actions';
import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import SetUpSections from './SetUpSections';

export default {
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
