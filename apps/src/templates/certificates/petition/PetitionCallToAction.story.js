import React from 'react';
import PetitionCallToAction from '@cdo/apps/templates/certificates/petition/PetitionCallToAction';

export default {
  title: 'PetitionCallToAction',
  component: PetitionCallToAction,
};

const Template = args => <PetitionCallToAction {...args} />;

export const Default = Template.bind({});
Default.args = {
  gaPagePath: 'congrats/coursetest-2050',
};
