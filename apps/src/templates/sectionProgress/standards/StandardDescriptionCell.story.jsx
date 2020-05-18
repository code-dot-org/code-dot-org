import React from 'react';
import StandardDescriptionCell from './StandardDescriptionCell';
import {standardsData, lessonCompletedByStandard} from './standardsTestHelpers';

export default storybook => {
  return storybook
    .storiesOf('Standards/StandardDescriptionCell', module)
    .addStoryTable([
      {
        name: 'Cell for Standards Description',
        description: 'See lesson completed for standard',
        story: () => (
          <StandardDescriptionCell
            description={standardsData[1].description}
            lessonsForStandardStatus={lessonCompletedByStandard[1].lessons}
          />
        )
      }
    ]);
};
