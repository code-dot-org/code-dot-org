import React from 'react';
import VerticalImageResourceCard from './VerticalImageResourceCard';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

const exampleCard = {
  title: 'CS Fundamentals Express',
  description:
    'All the core concepts from the elementary school curriculum, but at an accelerated pace designed for older students.',
  buttonText: 'Start the course',
  link: '/s/express',
};

const minecraftCard = {
  title: 'Minecraft Education',
  description: 'Copy the link below to continue programming with Minecraft.',
  buttonText: 'Go to Minecraft',
  link: 'https://minecraft.net/en-us/',
  MCShareLink: 'code.org/sharelink',
  image: 'old-minecraft',
};

export default {
  title: 'VerticalImageResourceCard',
  component: VerticalImageResourceCard,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <VerticalImageResourceCard {...args} />
  </Provider>
);

export const Default = Template.bind({});
Default.args = {
  ...exampleCard,
  image: 'csf-express',
};

export const Jumbo = Template.bind({});
Jumbo.args = {
  ...exampleCard,
  jumbo: true,
  image: 'codeorg-teacher',
};

export const Minecraft = Template.bind({});
Minecraft.args = {
  ...minecraftCard,
};
