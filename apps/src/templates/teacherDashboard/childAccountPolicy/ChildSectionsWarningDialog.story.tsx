import {StoryFn} from '@storybook/react';
import React from 'react';

import ChildSectionsWarningDialog from './ChildSectionsWarningDialog';

export default {
  component: ChildSectionsWarningDialog,
};

//
// TEMPLATE
//

const Template: StoryFn<typeof ChildSectionsWarningDialog> = args => (
  <ChildSectionsWarningDialog {...args} />
);

//
// STORIES
//

export const DefaultStory = Template.bind({
  isOpen: true,
  onClose: () => {},
});

DefaultStory.storyName = 'ChildSectionsWarningDialog';
