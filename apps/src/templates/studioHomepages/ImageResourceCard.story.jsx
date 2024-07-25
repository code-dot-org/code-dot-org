import React from 'react';
import {Provider} from 'react-redux';

import {reduxStore} from '@cdo/storybook/decorators';

import ImageResourceCard from './ImageResourceCard';

export default {
  component: ImageResourceCard,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <ImageResourceCard {...args} />
  </Provider>
);

export const Default = Template.bind({});
Default.args = {
  title: 'Teacher Community',
  description:
    'Ask questions about curriculum, share ideas from your lessons, and get help from other teachers',
  image: 'teachercommunity.png',
  buttonText: 'Connect Today',
  link: 'link to teacher community',
};
