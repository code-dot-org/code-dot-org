import {StoryFn} from '@storybook/react';
import React from 'react';

import LockOverlay from '.';

export default {
  component: LockOverlay,
};

const Template: StoryFn<typeof LockOverlay> = args => <LockOverlay {...args} />;

export const Locked = Template.bind({});
Locked.args = {
  isLocked: true,
  children: <div>Locked Content</div>,
};

export const Unlocked = Template.bind({});
Unlocked.args = {
  isLocked: false,
  children: <div>Unlocked Content</div>,
};
