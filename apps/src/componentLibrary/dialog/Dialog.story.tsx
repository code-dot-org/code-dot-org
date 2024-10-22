import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import Dialog, {DialogProps} from './Dialog';

export default {
  title: 'DesignSystem/[WIP]Dialog', // eslint-disable-line storybook/no-title-property-in-meta
  component: Dialog,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<DialogProps> = args => <Dialog {...args} />;

const MultipleTemplate: StoryFn<{
  components: DialogProps[];
}> = args => (
  <>
    <p>
      * Margins on this screen do not represent the component's margins, and are
      only added to improve Storybook view *
    </p>
    <p>Multiple Dialogs:</p>
    <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
      {args.components?.map((componentArg, index) => (
        <Dialog key={index} {...componentArg} />
      ))}
    </div>
  </>
);

export const DefaultDialog = SingleTemplate.bind({});
DefaultDialog.args = {
  title: 'Default Dialog',
  content: 'This is the content of the default dialog.',
  type: 'noIcon',
  onClose: () => console.log('Dialog closed'),
};

export const DialogWithIcon = SingleTemplate.bind({});
DialogWithIcon.args = {
  title: 'Dialog with Icon',
  content: 'This dialog has an icon.',
  type: 'withIconFA',
  icon: {iconName: 'circle-info'}, // Example icon
  onClose: () => console.log('Dialog with icon closed'),
};

export const DialogWithSecondaryButton = SingleTemplate.bind({});
DialogWithSecondaryButton.args = {
  title: 'Dialog with Secondary Button',
  content: 'This dialog includes a secondary button.',
  showSecondaryButton: true,
  type: 'noIcon',
  onClose: () => console.log('Dialog with secondary button closed'),
};

export const MultipleDialogs = MultipleTemplate.bind({});
MultipleDialogs.args = {
  components: [
    {
      title: 'Dialog 1',
      content: 'Content for dialog 1',
      type: 'noIcon',
      onClose: () => console.log('Dialog 1 closed'),
    },
    {
      title: 'Dialog 2 with Icon',
      content: 'Content for dialog 2',
      type: 'withIconFA',
      icon: {iconName: 'circle-check'},
      onClose: () => console.log('Dialog 2 closed'),
    },
    {
      title: 'Dialog 3 with Secondary Button',
      content: 'Content for dialog 3',
      showSecondaryButton: true,
      type: 'noIcon',
      onClose: () => console.log('Dialog 3 closed'),
    },
  ],
};
