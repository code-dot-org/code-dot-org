import React from 'react';
import {UnconnectedPersonalProjectsTable as PersonalProjectsTable} from './PersonalProjectsTable';
import {stubFakePersonalProjectData} from './generateFakeProjects';
import {publishMethods} from './projectConstants';

export default storybook => {
  storybook
    .storiesOf('Projects/PersonalProjectsTable', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Personal Project Table - (un)publish via buttons',
        description: 'Table of personal projects',
        story: () => (
          <PersonalProjectsTable
            personalProjectsList={stubFakePersonalProjectData}
            canShare={true}
            publishMethod={publishMethods.BUTTON}
          />
        )
      },
      {
        name: 'Personal Project Table - (un)publish via dropdown action',
        description: 'Table of personal projects',
        story: () => (
          <PersonalProjectsTable
            personalProjectsList={stubFakePersonalProjectData}
            canShare={true}
            publishMethod={publishMethods.CHEVRON}
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
            publishMethod={publishMethods.CHEVRON}
          />
        )
      },
    ]);
};
