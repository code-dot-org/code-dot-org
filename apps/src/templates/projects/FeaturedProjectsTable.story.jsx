import React from 'react';
import FeaturedProjectsTable from './FeaturedProjectsTable';
import {stubFakeFeaturedProjectData, stubFakeUnfeaturedProjectData} from './generateFakeProjects';

export default storybook => {
  return storybook
    .storiesOf('FeaturedProjectsTable', module)
    .addStoryTable([
      {
        name: 'Featured Project Table - current',
        description: 'Table of currently featured projects projects',
        story: () => (
          <FeaturedProjectsTable
            projectList={stubFakeFeaturedProjectData}
            tableVersion="currentFeatured"
          />
        )
      },
      {
        name: 'Featured Project Table - archive',
        description: 'Table of projects that have previously been featured',
        story: () => (
          <FeaturedProjectsTable
            projectList={stubFakeUnfeaturedProjectData}
            tableVersion="archivedUnfeatured"
          />
        )
      },
    ]);
};
