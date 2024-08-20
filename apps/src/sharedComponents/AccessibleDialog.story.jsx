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

const Template = args => <AccessibleDialog {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: <div>Default Accessible Dialog</div>,
  onClose: () => {},
};

export const CustomStyles = Template.bind({});
CustomStyles.args = {
  styles: {
    modal: defaultStyle.modal + ' custom-modal-style',
    modalBackdrop: defaultStyle.modalBackdrop + ' custom-backdrop-style',
    xCloseButton: defaultStyle.xCloseButton + ' custom-close-icon-style',
  },
  children: <div>Custom Styled Accessible Dialog</div>,
  onClose: () => {},
};

export const WithOnDismiss = Template.bind({});
WithOnDismiss.args = {
  children: <div>Accessible Dialog with onDismiss</div>,
  onDismiss: () => {},
};

export const WithoutInitialFocus = Template.bind({});
WithoutInitialFocus.args = {
  children: <div>Accessible Dialog without initial focus</div>,
  onClose: () => {},
  initialFocus: false,
};

export const ClickBackdropToClose = Template.bind({});
ClickBackdropToClose.args = {
  children: <div>Accessible Dialog with backdrop click to close</div>,
  onClose: () => {},
  closeOnClickBackdrop: true,
};
