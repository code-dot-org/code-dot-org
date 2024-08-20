import {StoryFn} from '@storybook/react';
import React from 'react';

import CopyrightDialog from '@cdo/apps/sharedComponents/footer/CopyrightDialog';

export default {
  component: CopyrightDialog,
};

//
// TEMPLATE
//

const Template: StoryFn<typeof CopyrightDialog> = args => (
  <CopyrightDialog {...args} />
);

//
// STORIES
//

export const DefaultStory = Template.bind({
  onClose: () => {},
});

DefaultStory.storyName = 'ChildSectionsWarningDialog';
