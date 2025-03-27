import {Meta, StoryFn} from '@storybook/react';
import {useState} from 'react';

import {Button} from '@/button';

import Dialog, {DialogProps} from '../Dialog';

export default {
  title: 'DesignSystem/Dialog/Dialog',
  component: Dialog,
} as Meta;

const SingleTemplate: StoryFn<DialogProps> = args => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} text="Open Dialog" />
      {isOpen && (
        <Dialog
          {...args}
          onClose={
            args.onClose
              ? () => {
                  setIsOpen(false);
                }
              : undefined
          }
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
  description: 'This is the content of the default dialog.',
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => alert('Primary button clicked!'),
  },
  onClose: () => console.log('Dialog closed'),
};

export const DialogWithIcon = SingleTemplate.bind({});
DialogWithIcon.args = {
  title: 'Dialog with Icon',
  description: 'This dialog has an icon.',
  icon: {iconName: 'smile'},
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => alert('Primary button clicked!'),
  },
  onClose: () => console.log('Dialog with icon closed'),
};

export const DialogWithImage = SingleTemplate.bind({});
DialogWithImage.args = {
  title: 'Dialog with Image',
  description: 'This dialog displays an image.',
  imageUrl: 'https://code.org/images/courses-6-12.png',
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => alert('Primary button clicked!'),
  },
  onClose: () => console.log('Dialog with icon closed'),
};

export const DialogWithoutCloseButton = SingleTemplate.bind({});
DialogWithoutCloseButton.args = {
  title: 'Dialog without Close Button',
  description: 'This dialog does not have a close button.',
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => alert('Primary button clicked!'),
  },
};

export const DialogWithSecondaryButton = SingleTemplate.bind({});
DialogWithSecondaryButton.args = {
  title: 'Dialog with Secondary Button',
  description: 'This dialog includes a secondary button.',
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => alert('Primary button clicked!'),
  },
  secondaryButtonProps: {
    text: 'Secondary Action',
    onClick: () => alert('Secondary button clicked!'),
  },
  onClose: () => console.log('Dialog with secondary button closed'),
};

export const DialogWithCustomContent = SingleTemplate.bind({});
DialogWithCustomContent.args = {
  title: 'Dialog with Custom Content',
  customContent: (
    <div>
      <p id="dsco-dialog-description">
        This is some custom content rendered within the dialog.
      </p>
      <ul>
        <li>Custom item 1</li>
        <li>Custom item 2</li>
      </ul>
    </div>
  ),
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => alert('Primary button clicked!'),
  },
  onClose: () => console.log('Dialog with custom content closed'),
};

export const DialogWithCustomBottomContent = SingleTemplate.bind({});
DialogWithCustomBottomContent.args = {
  title: 'Dialog with Custom Bottom Content',
  description: 'This dialog has custom content at the bottom.',
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => alert('Primary button clicked!'),
  },
  customBottomContent: (
    <div>
      <Button
        text="Extra Action"
        onClick={() => alert('Extra action clicked!')}
      />
    </div>
  ),
  onClose: () => console.log('Dialog with custom bottom content closed'),
};

export const MultipleDialogs = MultipleTemplate.bind({});
MultipleDialogs.args = {
  components: [
    {
      title: 'Dialog 1',
      description: 'Content for dialog 1',
      primaryButtonProps: {
        text: 'Primary Action 1',
        onClick: () => alert('Primary button 1 clicked!'),
      },
      onClose: () => console.log('Dialog 1 closed'),
    },
    {
      title: 'Dialog 2 with Icon',
      description: 'Content for dialog 2',
      icon: {iconName: 'circle-check'},
      primaryButtonProps: {
        text: 'Primary Action 2',
        onClick: () => alert('Primary button 2 clicked!'),
      },
      onClose: () => console.log('Dialog 2 closed'),
    },
    {
      title: 'Dialog 3 with Secondary Button',
      description: 'Content for dialog 3',
      primaryButtonProps: {
        text: 'Primary Action 3',
        onClick: () => alert('Primary button 3 clicked!'),
      },
      secondaryButtonProps: {
        text: 'Secondary Action',
        onClick: () => alert('Secondary button clicked!'),
      },
      onClose: () => console.log('Dialog 3 closed'),
    },
  ],
};
