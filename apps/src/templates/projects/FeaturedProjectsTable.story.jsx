import React from 'react';
import FeaturedProjectsTable from './FeaturedProjectsTable';
import {
  stubFakeActiveFeaturedProjectData,
  stubFakeArchivedFeaturedProjectData,
  stubFakeBookmarkedFeaturedProjectData,
} from './generateFakeProjects';
import {featuredProjectTableTypes} from './projectConstants';

const Template = args => <FeaturedProjectsTable {...args} />;

export const FeaturedProjectTableActive = Template.bind({});
FeaturedProjectTableActive.args = {
  projectList: stubFakeActiveFeaturedProjectData,
  tableVersion: featuredProjectTableTypes.active,
};

export const FeaturedProjectTableArchived = Template.bind({});
FeaturedProjectTableArchived.args = {
  projectList: stubFakeArchivedFeaturedProjectData,
  tableVersion: featuredProjectTableTypes.archived,
};

export const FeaturedProjectTableBookmarked = Template.bind({});
FeaturedProjectTableBookmarked.args = {
  projectList: stubFakeBookmarkedFeaturedProjectData,
  tableVersion: featuredProjectTableTypes.bookmarked,
};

export default {
  component: FeaturedProjectsTable,
};
