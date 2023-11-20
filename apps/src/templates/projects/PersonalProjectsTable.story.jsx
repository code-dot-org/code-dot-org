import React from 'react';
import {UnconnectedPersonalProjectsTable as PersonalProjectsTable} from './PersonalProjectsTable';
import publishDialog from '@cdo/apps/templates/projects/publishDialog/publishDialogRedux';
import deleteDialog from '@cdo/apps/templates/projects/deleteDialog/deleteProjectDialogRedux';
import {stubFakePersonalProjectData} from './generateFakeProjects';

const initialState = {
  publishDialog: {
    isOpen: false,
    isPublishPending: false,
  },
  deleteDialog: {
    isOpen: false,
  },
};

export default storybook => {
  storybook
    .storiesOf('Projects/PersonalProjectsTable', module)
    .withReduxStore({publishDialog, deleteDialog}, initialState)
    .addStoryTable([
      {
        name: 'Personal Project Table',
        description: 'Table of personal projects',
        story: () => (
          <PersonalProjectsTable
            personalProjectsList={stubFakePersonalProjectData}
            isLoadingPersonalProjectsList={false}
            isUserSignedIn={true}
            canShare={true}
          />
        ),
      },
      {
        name: 'Empty Personal Project Table',
        description: 'Table when there are 0 personal projects',
        story: () => (
          <PersonalProjectsTable
            personalProjectsList={[]}
            isLoadingPersonalProjectsList={false}
            isUserSignedIn={true}
            canShare={true}
          />
        ),
      },
    ]);
};
