import React from 'react';
import SectionProgressNameCell from './SectionProgressNameCell';

export default storybook => {
  return storybook
    .storiesOf('Progress/SectionProgressNameCell', module)
    .addStoryTable([
      {
        name: 'Name cell',
        description: `Displays a students name and links to their progress in the section progress table`,
        story: () => (
          <SectionProgressNameCell
            name={"StudentName"}
            studentId={123}
            sectionId={546}
            scriptId={789}
          />
        )
      },
    ]);
};
