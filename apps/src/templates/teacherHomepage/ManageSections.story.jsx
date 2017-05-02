import React from 'react';
import ManageSections from './ManageSections';

export default storybook => {
  return storybook
    .storiesOf('ManageSections', module)
    .addStoryTable([
      {
        name: 'Manage Sections - at least one section',
        description: 'Manage Sections collapsible section for the teacher homepage that shows a table of sections',
        story: () => (
          <ManageSections
            sections={[]}
          />
        )
      },
      {
        name: 'Manage Sections - no sections yet',
        description: 'Manage Sections collapsible section for the teacher homepage that shows a set up message if the teacher does not have any sections yet',
        story: () => (
          <ManageSections/>
        )
      },
    ]);
};
