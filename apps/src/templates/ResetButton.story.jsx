import React from 'react';

import {ResetButton} from './GameButtons';

export default {
  component: ResetButton,
};

const Template = args => <ResetButton style={{display: 'block'}} {...args} />;

export const Default = Template.bind({});

export const WithNoText = Template.bind({});
WithNoText.args = {hideText: true};
