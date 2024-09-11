import React from 'react';

import ResourcesDropdown from './ResourcesDropdown';

const migratedSampleResources = [
  {
    key: 'key1',
    name: 'Curriculum',
    url: 'https://example.com/a',
  },
  {
    key: 'key2',
    name: 'Vocabulary',
    url: 'https://example.com/b',
  },
];

export default {
  component: ResourcesDropdown,
};

// Template
const Template = args => (
  <ResourcesDropdown resources={migratedSampleResources} {...args} />
);

export const MigratedTeacherResources = Template.bind({});

export const MigratedStudentResources = Template.bind({});
MigratedStudentResources.args = {
  studentFacing: true,
};
