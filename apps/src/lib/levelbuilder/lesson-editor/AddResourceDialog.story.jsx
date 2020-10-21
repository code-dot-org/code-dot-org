import React from 'react';
import AddResourceDialog from './AddResourceDialog';

const defaultProps = {
  handleConfirm: () => {
    console.log('submitted');
  },
  isOpen: true,
  handleClose: () => {
    console.log('closed');
  }
};

export default storybook => {
  storybook.storiesOf('AddResourceDialog', module).addStoryTable([
    {
      name: 'AddResourceDialog',
      story: () => <AddResourceDialog {...defaultProps} />
    }
  ]);
};
