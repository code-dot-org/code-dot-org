import React from 'react';
import ResourceCard from './ResourceCard';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

export default {
  title: 'ResourceCard',
  component: ResourceCard,
};

const Template = args => (
  <Provider store={reduxStore()}>
    <ResourceCard
      title="Teacher Community"
      description="Ask questions about curriculum, share ideas from your lessons, and get help from other teachers"
      buttonText="Connect Today"
      link="link to teacher community"
      {...args}
    />
  </Provider>
);

export const ToolCard = Template.bind({});

export const ToolCardWithWrap = Template.bind({});
ToolCardWithWrap.args = {
  allowWrap: true,
};
