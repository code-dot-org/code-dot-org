import React from 'react';
import TeacherResources from './TeacherResources';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

export default {
  title: 'TeacherResources',
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
