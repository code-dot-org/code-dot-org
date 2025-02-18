import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import TeacherResources from './TeacherResources';

export default {
  component: TeacherResources,
};

//
// TEMPLATE
//

const Template = args => (
  <Provider store={reduxStore()}>
    <TeacherResources {...args} />
  </Provider>
);

//
// STORIES
//

export const Default = Template.bind({});
Default.args = {};
