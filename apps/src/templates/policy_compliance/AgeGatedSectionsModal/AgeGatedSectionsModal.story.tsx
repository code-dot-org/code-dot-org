import {StoryFn} from '@storybook/react';
import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import currentUser from '../../currentUserRedux';

import {AgeGatedSectionsModal} from './AgeGatedSectionsModal';
import {MockAgeGatedSections} from './MockData';

export default {
  name: 'At Risk Age Gated Sections Modal (teacher dashboard)',
  component: AgeGatedSectionsModal,
};

const Template: StoryFn = args => (
  <Provider store={reduxStore({currentUser}, {})}>
    <AgeGatedSectionsModal
      isOpen={true}
      onClose={() => {}}
      ageGatedSections={MockAgeGatedSections}
      {...args}
    />
  </Provider>
);
export const ModalForAgeGatedSections = Template.bind({});
ModalForAgeGatedSections.args = {};
