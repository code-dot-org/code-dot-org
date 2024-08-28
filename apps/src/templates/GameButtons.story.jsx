import React from 'react';

import {UnconnectedGameButtons} from './GameButtons';

export default {
  component: UnconnectedGameButtons,
};

const Template = args => <UnconnectedGameButtons {...args} />;

export const Default = Template.bind({});

export const WithSkipButton = Template.bind({});
WithSkipButton.args = {showSkipButton: true, nextLevelUrl: '#'};

export const WithFinishButton = Template.bind({});
WithFinishButton.args = {showFinishButton: true};

export const WithChildren = Template.bind({});
WithChildren.args = {
  children: <button type="button">A provided child button</button>,
};
