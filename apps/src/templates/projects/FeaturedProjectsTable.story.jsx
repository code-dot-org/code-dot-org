import React from 'react';
import FeaturedProjectsTable from './FeaturedProjectsTable';
import {
  stubFakeFeaturedProjectData,
  stubFakeUnfeaturedProjectData,
} from './generateFakeProjects';
import {featuredProjectTableTypes} from './projectConstants';

const Template = args => <FeaturedProjectsTable {...args} />;

export const FeaturedProjectTableCurrent = Template.bind({});
FeaturedProjectTableCurrent.args = {
  projectList: stubFakeFeaturedProjectData,
  tableVersion: featuredProjectTableTypes.current,
};

export const FeaturedProjectTableArchive = Template.bind({});
FeaturedProjectTableArchive.args = {
  projectList: stubFakeUnfeaturedProjectData,
  tableVersion: featuredProjectTableTypes.archived,
};

export default {
  title: 'FeaturedProjectsTable',
  component: FeaturedProjectsTable,
};
