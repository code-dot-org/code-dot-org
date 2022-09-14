import React from 'react';
import AddAssetButtonRow from './AddAssetButtonRow';

const mockApi = {
  getUploadUrl: () => {
    return '/some-url';
  },
  wrapUploadDoneCallback: f => {
    return f;
  },
  wrapUploadStartCallback: f => {
    return f;
  }
};

export default {
  title: 'AddAssetButtonRow',
  component: AddAssetButtonRow
};

// Template
const Template = args => (
  <AddAssetButtonRow
    uploadsEnabled={true}
    allowedExtensions=""
    api={mockApi}
    onUploadStart={() => console.log('onUploadStart')}
    onUploadDone={() => console.log('onUploadDone')}
    onUploadError={() => console.log('onUploadError')}
    onSelectRecord={() => console.log('onSelectRecord')}
    {...args}
  />
);

// Stories
export const JustButtons = Template.bind({});
JustButtons.args = {
  statusMessage: ''
};

export const ButtonsWithStatus = Template.bind({});
ButtonsWithStatus.args = {
  statusMessage: 'This is a status message'
};
