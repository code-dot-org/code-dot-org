import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import Modal, {ModalProps} from './Modal';

export default {
  title: 'DesignSystem/[WIP]Modal', // eslint-disable-line storybook/no-title-property-in-meta
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
DefaultModal.parameters = {
  a11y: {
    // TODO: https://codedotorg.atlassian.net/browse/ACQ-2779
    disable: true
  }
}

DefaultModal.args = {
  title: 'Default Modal',
  content: 'This is the content of the default dialog.',
  onClose: () => console.log('Modal closed'),
};

export const ModalWithSecondaryButton = SingleTemplate.bind({});
ModalWithSecondaryButton.parameters = {
  a11y: {
    // TODO: https://codedotorg.atlassian.net/browse/ACQ-2779
    disable: true
  }
}

ModalWithSecondaryButton.args = {
  title: 'Modal with Secondary Button',
  content: 'This dialog includes a secondary button.',
  showSecondaryButton: true,
  onClose: () => console.log('Modal with secondary button closed'),
};

export const ModalWithImage = SingleTemplate.bind({});
ModalWithImage.parameters = {
  a11y: {
    // TODO: https://codedotorg.atlassian.net/browse/ACQ-2779
    disable: true
  }
}

ModalWithImage.args = {
  title: 'Modal with Image',
  content: 'This dialog includes an image at the top.',
  modalImageUrl: 'https://via.placeholder.com/150', // Example image URL
  onClose: () => console.log('Modal with image closed'),
};

export const InlineImageModal = SingleTemplate.bind({});
InlineImageModal.parameters = {
  a11y: {
    // TODO: https://codedotorg.atlassian.net/browse/ACQ-2779
    disable: true
  }
}

InlineImageModal.args = {
  title: 'Inline Image Modal',
  content: 'This dialog shows an inline image.',
  modalImageUrl: 'https://via.placeholder.com/150', // Example image URL
  isImageInline: true,
  onClose: () => console.log('Inline image modal closed'),
};

export const DarkModal = SingleTemplate.bind({});
DarkModal.parameters = {
  a11y: {
    // TODO: https://codedotorg.atlassian.net/browse/ACQ-2779
    disable: true
  }
}

DarkModal.args = {
  title: 'Dark Mode Modal',
  content: 'This dialog uses the dark color theme.',
  color: 'dark',
  onClose: () => console.log('Dark mode modal closed'),
};

export const MultipleModals = MultipleTemplate.bind({});
MultipleModals.parameters = {
  a11y: {
    // TODO: https://codedotorg.atlassian.net/browse/ACQ-2779
    disable: true
  }
}

MultipleModals.args = {
  components: [
    {
      title: 'Modal 1',
      content: 'Content for dialog 1',
      onClose: () => console.log('Modal 1 closed'),
    },
    {
      title: 'Modal 2 with Secondary Button',
      content: 'Content for dialog 2',
      showSecondaryButton: true,
      onClose: () => console.log('Modal 2 closed'),
    },
    {
      title: 'Modal 3 with Image',
      content: 'Content for dialog 3 with an image.',
      modalImageUrl: 'https://via.placeholder.com/150',
      onClose: () => console.log('Modal 3 closed'),
    },
    {
      title: 'Modal 4 with Dark Theme',
      content: 'Content for dialog 4 with dark theme.',
      color: 'dark',
      onClose: () => console.log('Modal 4 closed'),
    },
  ],
};
