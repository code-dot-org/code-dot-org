import React from 'react';

import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

import RegionalPartnerContactForm from './RegionalPartnerContactForm';

export default {
  component: RegionalPartnerContactForm,
  decorators: [reactBootstrapStoryDecorator],
};

const FormTemplate = args => {
  return <RegionalPartnerContactForm {...args} />;
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
