import React from 'react';

import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

import {
  RegionalPartnerMiniContact,
  RegionalPartnerMiniContactPopupLink,
} from './RegionalPartnerMiniContact';

export default {
  component: RegionalPartnerMiniContact,
  decorators: [reactBootstrapStoryDecorator],
};

const FormTemplate = args => {
  return <RegionalPartnerMiniContact {...args} />;
};

export const FormDefault = FormTemplate.bind({});
FormDefault.args = {
  options: {
    user_name: 'John Doe',
    email: 'john.doe@example.com',
    zip: '12345',
    notes: 'Looking for more information.',
    grade_levels: ['6-8'],
    role: 'Teacher',
  },
  apiEndpoint: '/dashboardapi/v1/pd/regional_partner_mini_contacts/',
  sourcePageId: 'homepage',
};

const DialogTemplate = args => {
  return (
    <RegionalPartnerMiniContactPopupLink {...args}>
      <span>Some Children Element</span>
    </RegionalPartnerMiniContactPopupLink>
  );
};

export const DialogDefault = DialogTemplate.bind({});
DialogDefault.args = {
  zip: '00000',
  notes: 'test notes',
  sourcePageId: 'homepage',
};
