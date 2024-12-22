import {action} from '@storybook/addon-actions';
import React, {useState} from 'react';

import RedirectDialog from './RedirectDialog';

export default {
  component: RedirectDialog,
  argTypes: {
    handleClose: {action: 'closed'},
    redirectUrl: {control: 'text'},
    redirectButtonText: {control: 'text'},
  },
};

const Template = args => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    action('closed')();
  };

  return (
    <span>
      <button type="button" onClick={handleOpen}>
        Open Redirect Dialog
      </button>
      <RedirectDialog {...args} isOpen={isOpen} handleClose={handleClose} />
    </span>
  );
};

export const Default = Template.bind({});
Default.args = {
  details:
    'You are trying to access a restricted area. Please use the button below to navigate to the correct page.',
  redirectUrl: 'https://example.com',
  redirectButtonText: 'Redirect',
};

export const CustomDetails = Template.bind({});
CustomDetails.args = {
  details: 'This is a custom details message.',
  redirectUrl: 'https://example.com',
  redirectButtonText: 'Go to Custom URL',
};
