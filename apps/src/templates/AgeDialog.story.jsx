import React from 'react';
import {UnconnectedAgeDialog as AgeDialog} from './AgeDialog';

const Template = args => <AgeDialog {...args} />;

export const BasicExample = Template.bind({});
BasicExample.args = {
  signedIn: false,
  turnOffFilter: () => {}
};

export default {
  title: 'AgeDialog',
  component: AgeDialog
};
