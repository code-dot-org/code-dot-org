import React from 'react';

import FeaturedProjectsTable from './FeaturedProjectsTable';
import {
  stubFakeActiveFeaturedProjectData,
  stubFakeArchivedFeaturedProjectData,
  stubFakeBookmarkedFeaturedProjectData,
} from './generateFakeProjects';

const Template = args => <FeaturedProjectsTable {...args} />;

export const FeaturedProjectTable = Template.bind({});
FeaturedProjectTable.args = {
  activeList: stubFakeActiveFeaturedProjectData,
  bookmarkedList: stubFakeBookmarkedFeaturedProjectData,
  archivedList: stubFakeArchivedFeaturedProjectData,
};

export default {
  component: FeaturedProjectsTable,
};
