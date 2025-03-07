import React from 'react';

import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

import RegionalPartnerContactDialog from './RegionalPartnerContactDialog';

export default {
  component: RegionalPartnerContactDialog,
  decorators: [reactBootstrapStoryDecorator],
};

const DialogTemplate = args => {
  return <RegionalPartnerContactDialog {...args} />;
};

export const DialogDefault = DialogTemplate.bind({});
DialogDefault.args = {
  notes: 'test notes',
  onClose: () => {},
  sourcePageId: 'homepage',
  zip: '00000',
};
