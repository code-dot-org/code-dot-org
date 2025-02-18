import {StoryFn} from '@storybook/react';
import React, {useState} from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import currentUser from '../../currentUserRedux';

import {AgeGatedSectionsBanner} from './AgeGatedSectionsBanner';
import {MockAgeGatedSections} from './MockData';

export default {
  name: 'At Risk Age Gated Sections Banner (teacher dashboard)',
  component: AgeGatedSectionsBanner,
};

const Template: StoryFn = args => {
  const [modalOpen, setModalOpen] = useState(false);
  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  return (
    <Provider store={reduxStore({currentUser})}>
      <AgeGatedSectionsBanner
        toggleModal={toggleModal}
        modalOpen={modalOpen}
        ageGatedSections={MockAgeGatedSections}
        {...args}
      />
    </Provider>
  );
};
export const HasAgeGatedSections = Template.bind({});
