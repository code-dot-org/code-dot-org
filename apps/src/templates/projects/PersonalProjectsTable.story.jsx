import React from 'react';
import {UnconnectedPersonalProjectsTable as PersonalProjectsTable} from './PersonalProjectsTable';
import {stubFakePersonalProjectData} from './generateFakeProjects';

export default storybook => {
  storybook
    .storiesOf('Projects/PersonalProjectsTable', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Personal Project Table',
        description: 'Table of personal projects',
        story: () => (
          <PersonalProjectsTable
            personalProjectsList={stubFakePersonalProjectData}
            canShare={true}
          />
        )
      },
      {
        name: 'Empty Personal Project Table',
        description: 'Table when there are 0 personal projects',
        story: () => (
          <PersonalProjectsTable
            personalProjectsList={[]}
            canShare={true}
          />
        )
      },
    ]);
};
