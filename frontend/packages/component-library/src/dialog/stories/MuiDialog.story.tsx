import {Button} from '@mui/material';
import {Meta, StoryFn} from '@storybook/react-vite';
import {useState} from 'react';

import MuiDialog, {MuiDialogProps} from '../MuiDialog';

/**
 * Twin of Dialog.story.tsx on the MUI-backed wrapper: one story per legacy
 * story, same export name, same visual state, for side-by-side screenshots.
 */
export default {
  title: 'DesignSystem/Dialog/MuiDialog',
  component: MuiDialog,
  parameters: {
    componentSubtitle: 'Dialog on MUI Dialog, styled by CdoTheme.',
  },
} as Meta;

const SingleTemplate: StoryFn<MuiDialogProps> = args => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button variant="contained" onClick={() => setIsOpen(true)}>
        Open Dialog
      </Button>
      {isOpen && (
        <MuiDialog
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
  components: MuiDialogProps[];
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
              variant="contained"
              onClick={() =>
                setValues({...values, [`${index}${componentArg.title}`]: true})
              }
            >
              {`Open ${componentArg.title}`}
            </Button>
            {values[`${index}${componentArg.title}`] && (
              <MuiDialog
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
    children: 'Primary Action',
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
    children: 'Primary Action',
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
    children: 'Primary Action',
    onClick: () => alert('Primary button clicked!'),
  },
  onClose: () => console.log('Dialog with icon closed'),
};

export const DialogWithoutCloseButton = SingleTemplate.bind({});
DialogWithoutCloseButton.args = {
  title: 'Dialog without Close Button',
  description: 'This dialog does not have a close button.',
  primaryButtonProps: {
    children: 'Primary Action',
    onClick: () => alert('Primary button clicked!'),
  },
};

export const DialogWithSecondaryButton = SingleTemplate.bind({});
DialogWithSecondaryButton.args = {
  title: 'Dialog with Secondary Button',
  description: 'This dialog includes a secondary button.',
  primaryButtonProps: {
    children: 'Primary Action',
    onClick: () => alert('Primary button clicked!'),
  },
  secondaryButtonProps: {
    children: 'Secondary Action',
    onClick: () => alert('Secondary button clicked!'),
  },
  onClose: () => console.log('Dialog with secondary button closed'),
};

export const DialogWithLongText = SingleTemplate.bind({});
DialogWithLongText.args = {
  title: 'A title long enough to wrap onto a second line in the dialog',
  description:
    'Both the heading and this description stay centered when they wrap. ' +
    'You cannot edit your survey after submitting it. To preserve anonymity, ' +
    'your responses will also be cleared from this page. Are you sure you ' +
    'want to submit?',
  primaryButtonProps: {
    children: 'Okay',
    onClick: () => alert('Primary button clicked!'),
  },
  secondaryButtonProps: {
    children: 'Cancel',
    onClick: () => alert('Secondary button clicked!'),
  },
  onClose: () => console.log('Dialog with long text closed'),
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
    children: 'Primary Action',
    onClick: () => alert('Primary button clicked!'),
  },
  onClose: () => console.log('Dialog with custom content closed'),
};

export const DialogWithCustomBottomContent = SingleTemplate.bind({});
DialogWithCustomBottomContent.args = {
  title: 'Dialog with Custom Bottom Content',
  description: 'This dialog has custom content at the bottom.',
  primaryButtonProps: {
    children: 'Primary Action',
    onClick: () => alert('Primary button clicked!'),
  },
  customBottomContent: (
    <div>
      <Button
        variant="contained"
        onClick={() => alert('Extra action clicked!')}
      >
        Extra Action
      </Button>
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
        children: 'Primary Action 1',
        onClick: () => alert('Primary button 1 clicked!'),
      },
      onClose: () => console.log('Dialog 1 closed'),
    },
    {
      title: 'Dialog 2 with Icon',
      description: 'Content for dialog 2',
      icon: {iconName: 'circle-check'},
      primaryButtonProps: {
        children: 'Primary Action 2',
        onClick: () => alert('Primary button 2 clicked!'),
      },
      onClose: () => console.log('Dialog 2 closed'),
    },
    {
      title: 'Dialog 3 with Secondary Button',
      description: 'Content for dialog 3',
      primaryButtonProps: {
        children: 'Primary Action 3',
        onClick: () => alert('Primary button 3 clicked!'),
      },
      secondaryButtonProps: {
        children: 'Secondary Action',
        onClick: () => alert('Secondary button clicked!'),
      },
      onClose: () => console.log('Dialog 3 closed'),
    },
  ],
};
