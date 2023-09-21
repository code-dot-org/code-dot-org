import React from 'react';
import ChatWarningModal, {ChatWarningModalProps} from './ChatWarningModal';
import {Meta, Story} from '@storybook/react';

export default {
  title: 'Edubot/ChatWarningModal',
  component: ChatWarningModal,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate:Story<ChatWarningModalProps> = (args) => <ChatWarningModal {...args} />;

export const ChatWarningModalExample = SingleTemplate.bind({});
ChatWarningModalExample.args = {
  onClose: () => null,
};
