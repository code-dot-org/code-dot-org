import React from 'react';
import ProjectActionBox from './ProjectActionBox';
import {stubFakePersonalProjectData} from './generateFakePersonalProjects';

export default storybook => {
  storybook
    .storiesOf('ProjectActionBox', module)
    .addStoryTable([
        {
          name: 'Already published project',
          description: 'Personal gallery',
          story: () => (
            <ProjectActionBox projectData={stubFakePersonalProjectData[0]}/>
          )
        },
        {
          name: 'Not yet published project',
          description: 'Personal gallery',
          story: () => (
            <ProjectActionBox projectData={stubFakePersonalProjectData[1]}/>
          )
        },
      ]);
  };
