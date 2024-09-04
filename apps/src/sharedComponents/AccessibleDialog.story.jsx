import {action} from '@storybook/addon-actions';
import React from 'react';

import AccessibleDialog from './AccessibleDialog';

import defaultStyle from './accessible-dialogue.module.scss';

export default {
  component: AccessibleDialog,
  argTypes: {
    onClose: {action: 'closed'},
    onDismiss: {action: 'dismissed'},
  },
};

// Add custom CSS
const customStyle = document.createElement('style');
customStyle.innerHTML = `
  .custom-modal-style {
    color: #fff;
    font-size: 26px;
    background-color: rgb(86 96 101);
    border: solid 1px rgb(121 124 128);
    p {
      font-size: 30px;
      font-family: "Barlow Semi Condensed Medium", sans-serif;
    }
  }

  .custom-backdrop-style {
    background-color: #000;
    opacity: 0.3;
    z-index: 1250;
  }

  .custom-close-button-style {
    background: #fff;
    i {
      color: #121212;
    }
  }
`;
document.head.appendChild(customStyle);

const Template = args => <AccessibleDialog {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: <div>Default Accessible Dialog</div>,
  fallbackFocus: 'div',
  onClose: action('closed'),
  onDismiss: undefined,
};

export const CustomStyles = Template.bind({});
CustomStyles.args = {
  children: (
    <div>
      <p>Custom Styled Accessible Dialog</p>
    </div>
  ),
  fallbackFocus: 'div',
  onClose: action('closed'),
  onDismiss: undefined,
  styles: {
    modal: defaultStyle.modal + ' custom-modal-style',
    modalBackdrop: defaultStyle.modalBackdrop + ' custom-backdrop-style',
    xCloseButton: defaultStyle.xCloseButton + ' custom-close-button-style',
  },
};

export const WithOnDismiss = Template.bind({});
WithOnDismiss.args = {
  children: <div>Accessible Dialog with onDismiss</div>,
  fallbackFocus: 'div',
  onClose: action('closed'),
  onDismiss: action('dismissed'),
};

export const WithoutInitialFocus = Template.bind({});
WithoutInitialFocus.args = {
  children: <div>Accessible Dialog without initial focus</div>,
  fallbackFocus: 'div',
  initialFocus: false,
  onClose: action('closed'),
  onDismiss: undefined,
};

export const ClickBackdropToClose = Template.bind({});
ClickBackdropToClose.args = {
  children: <div>Accessible Dialog with backdrop click to close</div>,
  closeOnClickBackdrop: true,
  fallbackFocus: 'div',
  onClose: action('closed'),
  onDismiss: undefined,
};
