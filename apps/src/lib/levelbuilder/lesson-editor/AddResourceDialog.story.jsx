import React from 'react';
import AddResourceDialog from './AddResourceDialog';

const defaultProps = {
  handleConfirm: () => {
    console.log('submitted');
  },
  isOpen: true,
  onClose: () => {
    console.log('closed');
  },
  typeOptions: ['activity guide', 'video', 'resource', 'hand-out'],
  audienceOptions: ['Student', 'Teacher', 'Verified Teacher']
};

export default storybook => {
  storybook.storiesOf('AddResourceDialog', module).addStoryTable([
    {
      name: 'AddResourceDialog',
      story: () => <AddResourceDialog {...defaultProps} />
    }
  ]);
};
