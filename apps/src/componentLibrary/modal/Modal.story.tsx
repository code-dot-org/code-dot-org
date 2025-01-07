import {Meta, StoryFn} from '@storybook/react';
import React, {useState} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';

import Modal, {ModalProps} from './Modal';

export default {
  title: 'DesignSystem/Modal', // eslint-disable-line storybook/no-title-property-in-meta
  component: Modal,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<ModalProps> = args => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} text="Open Modal" />
      {isOpen && (
        <Modal
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
  components: ModalProps[];
}> = args => {
  const [values, setValues] = useState({} as Record<string, boolean>);

  const handleClose = (index: number, title: string) => {
    setValues({...values, [`${index}${title}`]: false});
  };

  return (
    <>
      <p>
        * Margins on this screen do not represent the component's margins, and
        are only added to improve Storybook view *
      </p>
      <p>Multiple Modals:</p>
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {args.components?.map((componentArg, index) => (
          <div key={index}>
            <Button
              onClick={() =>
                setValues({...values, [`${index}${componentArg.title}`]: true})
              }
              text={`Open ${componentArg.title}`}
            />
            {values[`${index}${componentArg.title}`] && (
              <Modal
                {...componentArg}
                onClose={() => handleClose(index, componentArg.title || '')}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

//
// STORIES
//
export const DefaultModal = SingleTemplate.bind({});
DefaultModal.args = {
  title: 'Default Modal',
  description:
    'This is a longer description for the default modal. It is designed to test how the modal handles large' +
    ' amounts of text and ensures proper display and scrolling behaviors.',
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => console.log('Primary action clicked'),
  },
  secondaryButtonProps: {
    text: 'Secondary Action',
    onClick: () => console.log('Secondary action clicked'),
  },
  onClose: () => null,
};

export const ModalWithoutSecondaryButton = SingleTemplate.bind({});
ModalWithoutSecondaryButton.args = {
  title: 'Modal without Secondary Button',
  description:
    'This modal provides only a primary button for user interaction. It is useful for scenarios where only one' +
    ' action is required or desired.',
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => console.log('Primary action clicked'),
  },
  onClose: () => null,
};

export const ModalWithoutCloseButton = SingleTemplate.bind({});
ModalWithoutCloseButton.args = {
  title: 'Modal without Close Button',
  description:
    'This modal provides both a primary and a secondary button for user interaction, enabling multiple actions without' +
    ' a dedicated close button. Users can still dismiss the modal through other contextual actions.',
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => console.log('Primary action clicked'),
  },
  secondaryButtonProps: {
    text: 'Secondary Action',
    onClick: () => console.log('Secondary action clicked'),
  },
};

export const ModalWithImageTopPlacement = SingleTemplate.bind({});
ModalWithImageTopPlacement.args = {
  title: 'Modal with Top Image Placement',
  description:
    'This modal includes an image placed at the top. This placement ensures that the visual content is prominent' +
    ' and aligns with the modal content effectively.',
  imageUrl: 'https://studio.code.org/shared/images/banners/project-banner.jpg', // Example image URL
  imageAlt: 'Example image placed on top of the modal',
  imagePlacement: 'top',
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => console.log('Primary action clicked'),
  },
  secondaryButtonProps: {
    text: 'Secondary Action',
    onClick: () => console.log('Secondary action clicked'),
  },
  onClose: () => null,
};

export const ModalWithImageInlinePlacement = SingleTemplate.bind({});
ModalWithImageInlinePlacement.args = {
  title: 'Modal with Inline Image Placement',
  description:
    'This modal includes an image placed inline with the content. It demonstrates how visual content can be' +
    ' integrated directly into the text for a cohesive layout.',
  imageUrl: 'https://studio.code.org/blockly/media/dance/placeholder.png', // Example image URL
  imageAlt: 'Example image placed alongside modal description',
  imagePlacement: 'inline',
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => console.log('Primary action clicked'),
  },
  secondaryButtonProps: {
    text: 'Secondary Action',
    onClick: () => console.log('Secondary action clicked'),
  },
  onClose: () => null,
};

export const DarkModal = SingleTemplate.bind({});
DarkModal.args = {
  title: 'Dark Mode Modal',
  description:
    'This modal uses the dark color theme to create a visually distinct and focused experience for the user.',
  mode: 'dark',
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => console.log('Primary action clicked'),
  },
  secondaryButtonProps: {
    text: 'Secondary Action',
    onClick: () => console.log('Secondary action clicked'),
  },
  onClose: () => null,
};

export const ModalWithCustomContent = SingleTemplate.bind({});
ModalWithCustomContent.args = {
  title: 'Modal with Custom Content',
  customContent: (
    <div>
      <p id="dsco-dialog-description">
        This is some custom content rendered within the modal.
      </p>
      <ul>
        <li>Custom item 1</li>
        <li>Custom item 2</li>
      </ul>
    </div>
  ),
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => console.log('Primary button clicked!'),
  },
  onClose: () => null,
};

export const ModalWithCustomBottomContent = SingleTemplate.bind({});
ModalWithCustomBottomContent.args = {
  title: 'Modal with Custom Bottom Content',
  description:
    'This modal includes custom content at the bottom to demonstrate the flexibility of adding additional' +
    ' actions or information.',
  customBottomContent: (
    <div style={{textAlign: 'center'}}>
      <Button text="Custom button" onClick={() => null} />
    </div>
  ),
  primaryButtonProps: {
    text: 'Close',
    onClick: () => console.log('Modal with custom bottom content closed'),
  },
  secondaryButtonProps: {
    text: 'Secondary Action',
    onClick: () => console.log('Secondary action clicked'),
  },
  onClose: () => null,
};

export const MultipleModals = MultipleTemplate.bind({});
MultipleModals.args = {
  components: [
    {
      title: 'Modal 1',
      description:
        'Description for modal 1. It includes text content to showcase the structure and behavior of a modal.',
      primaryButtonProps: {
        text: 'Primary Action',
        onClick: () => console.log('Primary action for modal 1'),
      },
      secondaryButtonProps: {
        text: 'Secondary Action',
        onClick: () => console.log('Secondary action for modal 1'),
      },
      onClose: () => null,
    },
    {
      title: 'Modal 2 with Image (Top Placement)',
      description:
        'Description for modal 2 with an image at the top. This demonstrates the visual integration of imagery' +
        ' within a modal.',
      imageUrl:
        'https://studio.code.org/shared/images/banners/project-banner.jpg',
      imageAlt: 'Example image placed on top of the modal',
      imagePlacement: 'top',
      primaryButtonProps: {
        text: 'Primary Action',
        onClick: () => console.log('Primary action for modal 2'),
      },
      secondaryButtonProps: {
        text: 'Secondary Action',
        onClick: () => console.log('Secondary action for modal 2'),
      },
      onClose: () => null,
    },
    {
      title: 'Modal 3 with Dark Theme',
      description:
        'Content for modal 3 with dark theme. This modal uses the dark color mode to enhance readability and focus.',
      mode: 'dark',
      primaryButtonProps: {
        text: 'Primary Action',
        onClick: () => console.log('Primary action for modal 3'),
      },
      secondaryButtonProps: {
        text: 'Secondary Action',
        onClick: () => console.log('Secondary action for modal 3'),
      },
      onClose: () => null,
    },
  ],
};
