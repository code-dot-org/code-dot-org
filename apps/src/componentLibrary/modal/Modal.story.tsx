import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import Modal, {ModalProps} from './Modal';

export default {
  title: 'DesignSystem/Modal', // eslint-disable-line storybook/no-title-property-in-meta
  component: Modal,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<ModalProps> = args => <Modal {...args} />;

const MultipleTemplate: StoryFn<{
  components: ModalProps[];
}> = args => (
  <>
    <p>
      * Margins on this screen do not represent the component's margins, and are
      only added to improve Storybook view *
    </p>
    <p>Multiple Modals:</p>
    <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
      {args.components?.map((componentArg, index) => (
        <Modal key={index} {...componentArg} />
      ))}
    </div>
  </>
);

export const DefaultModal = SingleTemplate.bind({});
DefaultModal.args = {
  title: 'Default Modal',
  description: 'This is the content of the default modal.',
  primaryButtonProps: {
    text: 'Close',
    onClick: () => console.log('Modal closed'),
  },
};

export const ModalWithSecondaryButton = SingleTemplate.bind({});
ModalWithSecondaryButton.args = {
  title: 'Modal with Secondary Button',
  description: 'This modal includes a secondary button.',
  primaryButtonProps: {
    text: 'Primary Action',
    onClick: () => console.log('Primary action clicked'),
  },
  secondaryButtonProps: {
    text: 'Secondary Action',
    onClick: () => console.log('Secondary action clicked'),
  },
  onClose: () => console.log('Modal with secondary button closed'),
};

export const ModalWithImageTopPlacement = SingleTemplate.bind({});
ModalWithImageTopPlacement.args = {
  title: 'Modal with Top Image Placement',
  description: 'This modal includes an image placed at the top.',
  imageUrl: 'https://via.placeholder.com/150', // Example image URL
  imagePlacement: 'top',
  primaryButtonProps: {
    text: 'Close',
    onClick: () => console.log('Modal with image (top placement) closed'),
  },
};

export const ModalWithImageInlinePlacement = SingleTemplate.bind({});
ModalWithImageInlinePlacement.args = {
  title: 'Modal with Inline Image Placement',
  description: 'This modal includes an image placed inline with the content.',
  imageUrl: 'https://via.placeholder.com/150', // Example image URL
  imagePlacement: 'inline',
  primaryButtonProps: {
    text: 'Close',
    onClick: () => console.log('Modal with image (inline placement) closed'),
  },
};

export const DarkModal = SingleTemplate.bind({});
DarkModal.args = {
  title: 'Dark Mode Modal',
  description: 'This modal uses the dark color theme.',
  mode: 'dark',
  primaryButtonProps: {
    text: 'Close',
    onClick: () => console.log('Dark mode modal closed'),
  },
};

export const ModalWithCustomBottomContent = SingleTemplate.bind({});
ModalWithCustomBottomContent.args = {
  title: 'Modal with Custom Bottom Content',
  description: 'This modal includes custom content at the bottom.',
  customBottomContent: (
    <div style={{marginTop: '20px', textAlign: 'center'}}>
      <button
        type="button"
        onClick={() => console.log('Custom action triggered')}
      >
        Custom Action
      </button>
    </div>
  ),
  primaryButtonProps: {
    text: 'Close',
    onClick: () => console.log('Modal with custom bottom content closed'),
  },
};

export const MultipleModals = MultipleTemplate.bind({});
MultipleModals.args = {
  components: [
    {
      title: 'Modal 1',
      description: 'Description for modal 1.',
      primaryButtonProps: {
        text: 'Close',
        onClick: () => console.log('Modal 1 closed'),
      },
    },
    {
      title: 'Modal 2 with Secondary Button',
      description: 'Description for modal 2.',
      primaryButtonProps: {
        text: 'Primary Action',
        onClick: () => console.log('Primary action for modal 2'),
      },
      secondaryButtonProps: {
        text: 'Secondary Action',
        onClick: () => console.log('Secondary action for modal 2'),
      },
    },
    {
      title: 'Modal 3 with Image (Top Placement)',
      description: 'Description for modal 3 with an image at the top.',
      imageUrl: 'https://via.placeholder.com/150',
      imagePlacement: 'top',
      primaryButtonProps: {
        text: 'Close',
        onClick: () => console.log('Modal 3 closed'),
      },
    },
    {
      title: 'Modal 4 with Dark Theme',
      description: 'Content for modal 4 with dark theme.',
      mode: 'dark',
      primaryButtonProps: {
        text: 'Close',
        onClick: () => console.log('Modal 4 closed'),
      },
    },
  ],
};
