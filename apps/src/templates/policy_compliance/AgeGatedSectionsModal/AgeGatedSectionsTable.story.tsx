import {StoryFn} from '@storybook/react';
import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import {AgeGatedSectionsTable} from './AgeGatedSectionsTable';
import {MockAgeGatedSections} from './MockData';

export default {
  name: 'At Risk Age Gated Students Table (teacher dashboard)',
  component: AgeGatedSectionsTable,
};

const Template: StoryFn = args => (
  <Provider store={reduxStore()}>
    <AgeGatedSectionsTable ageGatedSections={MockAgeGatedSections} {...args} />
  </Provider>
);
export const TableForAgeGatedStudents = Template.bind({});
TableForAgeGatedStudents.args = {};
