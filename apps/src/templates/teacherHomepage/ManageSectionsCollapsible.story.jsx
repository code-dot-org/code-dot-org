import React from 'react';
import ManageSectionsCollapsible from './ManageSectionsCollapsible';

export default storybook => {
  return storybook
    .storiesOf('ManageSectionsCollapsible', module)
    .addStoryTable([
      {
        name: 'Manage Sections - at least one section',
        description: 'Manage Sections collapsible section for the teacher homepage that shows a table of sections',
        story: () => (
          <ManageSectionsCollapsible
            sections={[]}
          />
        )
      },
      {
        name: 'Manage Sections - no sections yet',
        description: 'Manage Sections collapsible section for the teacher homepage that shows a set up message if the teacher does not have any sections yet',
        story: () => (
          <ManageSectionsCollapsible/>
        )
      },
    ]);
};
