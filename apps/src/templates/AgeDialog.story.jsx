import React from 'react';

import {UnconnectedAgeDialog as AgeDialog} from './AgeDialog';

export default {
  component: AgeDialog,
};

const Template = args => (
  <AgeDialog signedIn={false} setOver21={() => {}} turnOffFilter={() => {}} />
);

export const BasicExample = Template.bind({});
