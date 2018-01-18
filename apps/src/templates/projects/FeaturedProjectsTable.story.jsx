import React from 'react';
import FeaturedProjectsTable from './FeaturedProjectsTable';

// TODO [ErinB] update to use projectList data that highlights the differences of the tables. Currently a work in progress.
export default storybook => {
  storybook
    .storiesOf('FeaturedProjectsTable', module)
    .addStoryTable([
      {
        name: 'Featured Project Table - current',
        description: 'Table of currently featured projects projects',
        story: () => (
          <FeaturedProjectsTable
            projectList={[]}
          />
        )
      },
      {
        name: 'Featured Project Table - archive',
        description: 'Table of projects that have previously been featured',
        story: () => (
          <FeaturedProjectsTable
            projectList={[]}
          />
        )
      },
    ]);
};
