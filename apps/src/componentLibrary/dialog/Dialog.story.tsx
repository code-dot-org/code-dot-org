import {Meta, StoryFn} from '@storybook/react';
import React, {useState} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';

import Dialog, {DialogProps} from './Dialog';

export default {
  title: 'DesignSystem/[WIP]Dialog', // eslint-disable-line storybook/no-title-property-in-meta
  component: Dialog,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<DialogProps> = args => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} text="Open Dialog" />
      {isOpen && (
        <Dialog
          {...args}
          onClose={() => {
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
};

const MultipleTemplate: StoryFn<{
  components: DialogProps[];
}> = args => {
  const [values, setValues] = useState({} as Record<string, boolean>);

  return (
    <>
      <p>
        * Margins on this screen do not represent the component's margins, and
        are only added to improve Storybook view *
      </p>
      <p>Multiple Dialogs:</p>
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {args.components?.map((componentArg, index) => (
          <div key={index}>
            <Button
              key={`button-${index}`}
              onClick={() =>
                setValues({...values, [`${index}${componentArg.title}`]: true})
              }
              text={`Open ${componentArg.title}`}
            />
            {values[`${index}${componentArg.title}`] && (
              <Dialog
                {...componentArg}
                onClose={() =>
                  setValues({
                    ...values,
                    [`${index}${componentArg.title}`]: false,
                  })
                }
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export const DefaultDialog = SingleTemplate.bind({});
DefaultDialog.args = {
  title: 'Default Dialog',
  content: 'This is the content of the default dialog.',
  onClose: () => console.log('Dialog closed'),
};

export const DialogWithIcon = SingleTemplate.bind({});
DialogWithIcon.args = {
  title: 'Dialog with Icon',
  content: 'This dialog has an icon.',
  icon: {iconName: 'smile'}, // Example icon
  onClose: () => console.log('Dialog with icon closed'),
};

export const DialogWithImage = SingleTemplate.bind({});
DialogWithImage.args = {
  title: 'Dialog with Icon',
  content: 'Dialog with image',
  imageUrl: 'https://code.org/images/courses-6-12.png', // Example image
  onClose: () => console.log('Dialog with icon closed'),
};

export const DialogWithSecondaryButton = SingleTemplate.bind({});
DialogWithSecondaryButton.args = {
  title: 'Dialog with Secondary Button',
  content: 'This dialog includes a secondary button.',
  showSecondaryButton: true,
  onClose: () => console.log('Dialog with secondary button closed'),
};

export const MultipleDialogs = MultipleTemplate.bind({});
MultipleDialogs.args = {
  components: [
    {
      title: 'Dialog 1',
      content: 'Content for dialog 1',
      onClose: () => console.log('Dialog 1 closed'),
    },
    {
      title: 'Dialog 2 with Icon',
      content: 'Content for dialog 2',
      icon: {iconName: 'circle-check'},
      onClose: () => console.log('Dialog 2 closed'),
    },
    {
      title: 'Dialog 3 with Secondary Button',
      content: 'Content for dialog 3',
      showSecondaryButton: true,
      onClose: () => console.log('Dialog 3 closed'),
    },
  ],
};

export const GroupOfDialogColors = MultipleDialogs.bind({});
GroupOfDialogColors.args = {
  components: [
    {
      title: 'Light Dialog',
      content: 'Content for dialog 1',
      mode: 'light',
      showSecondaryButton: true,
      onClose: () => console.log('Dialog 1 closed'),
    },
    {
      title: 'Dark Dialog',
      content: 'Content for dialog 2',
      mode: 'dark',
      showSecondaryButton: true,
      onClose: () => console.log('Dialog 2 closed'),
    },
  ],
};
