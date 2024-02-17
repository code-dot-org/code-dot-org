import React from 'react';
import FeaturedProjectsTable from './FeaturedProjectsTable';
import {
  stubFakeActiveFeaturedProjectData,
  stubFakeArchivedFeaturedProjectData,
  stubFakeSavedFeaturedProjectData,
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

export const FeaturedProjectTableSaved = Template.bind({});
FeaturedProjectTableSaved.args = {
  projectList: stubFakeSavedFeaturedProjectData,
  tableVersion: featuredProjectTableTypes.saved,
};

export default {
  component: FeaturedProjectsTable,
};
