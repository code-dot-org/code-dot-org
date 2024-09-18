import {StoryFn} from '@storybook/react';
import React, {useState} from 'react';

import CopyrightDialog from '@cdo/apps/sharedComponents/footer/CopyrightDialog';

export default {
  component: CopyrightDialog,
};

const Template: StoryFn<typeof CopyrightDialog> = args => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <span>
      <button type="button" onClick={handleOpen}>
        Open Copyright Dialog
      </button>
      <CopyrightDialog {...args} isOpen={isOpen} closeModal={handleClose} />
    </span>
  );
};

export const DefaultStory = Template.bind({
  onClose: () => {},
});

DefaultStory.storyName = 'ChildSectionsWarningDialog';
