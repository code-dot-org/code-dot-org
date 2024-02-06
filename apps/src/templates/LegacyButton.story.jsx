import React from 'react';
import LegacyButton, {BUTTON_TYPES} from './LegacyButton';

const defaultExport = {
  component: LegacyButton,
};

const buttonTypes = Object.keys(BUTTON_TYPES);

const Template = args => <LegacyButton {...args}> Button </LegacyButton>;

const stories = {};
buttonTypes.map(buttonType => {
  const story = Template.bind({});
  story.args = {
    type: buttonType,
  };
  stories[`Default-${buttonType}`] = story;
  const largeStory = Template.bind({});
  largeStory.args = {
    type: buttonType,
    size: 'large',
  };
  stories[`Large-${buttonType}`] = largeStory;
  const rightStory = Template.bind({});
  rightStory.args = {
    type: buttonType,
    size: 'large',
    arrow: 'right',
  };
  stories[`Right-${buttonType}`] = rightStory;
  const leftStory = Template.bind({});
  leftStory.args = {
    type: buttonType,
    size: 'large',
    arrow: 'left',
  };
  stories[`Left-${buttonType}`] = leftStory;
});

module.exports = {
  ...stories,
  default: defaultExport,
};
