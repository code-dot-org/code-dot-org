import _ from 'lodash';

import {FeaturedProjectStatus} from '@cdo/generated-scripts/sharedConstants';

// Generate n fake personal projects for the project widget.
// updatedAt data is normally a timestamp, but for storybook
// display purposes, use a descriptive string
export function generateFakePersonalProjects(n) {
  return _.range(n).map(i => ({
    name: 'Personal ' + i,
    updatedAt: new Date().toISOString(),
    projectType: 'gamelab',
    id: 'abcd',
  }));
}

export const stubFakePersonalProjectData = [
  {
    name: 'Personal Project 1',
    updatedAt: '2018-12-31T23:59:59.999-08:00',
    type: 'gamelab',
    channel: 'abcd1',
    publishedAt: '2015-12-31T23:59:59.999-08:00',
    frozen: true,
  },
  {
    name: 'Personal Project 2',
    updatedAt: '2017-11-30T23:59:59.999-08:00',
    type: 'applab',
    channel: 'abcd2',
  },
  {
    name: "Personal Project 3 has a super extra long name let's see how it looks in the table",
    updatedAt: '2016-10-31T23:59:59.999-08:00',
    type: 'artist',
    channel: 'abcd3',
    publishedAt: '2015-12-31T23:59:59.999-08:00',
  },
  {
    name: 'Personal Project 4',
    updatedAt: '2015-09-14T23:59:59.999-08:00',
    type: 'playlab',
    channel: 'abcd4',
  },
];

export const stubFakeActiveFeaturedProjectData = [
  {
    projectName: 'Active Featured Project 1',
    type: 'gamelab',
    status: FeaturedProjectStatus.active,
    channel: 'abcd5',
    publishedAt: '2023-02-16T02:14:51.000+00:00',
    featuredAt: '2024-02-16T02:14:51.000+00:00',
    unfeaturedAt: null,
  },
  {
    projectName: 'Active Featured Project 2',
    type: 'applab',
    status: FeaturedProjectStatus.active,
    channel: 'abcd6',
    publishedAt: '2023-02-15T02:14:51.000+00:00',
    featuredAt: '2024-02-15T02:14:51.000+00:00',
    unfeaturedAt: null,
  },
  {
    projectName:
      "Active Featured Project 3 has a super extra long name let's see how it looks in the table",
    type: 'artist',
    status: FeaturedProjectStatus.active,
    channel: 'abcd7',
    publishedAt: '2023-02-14T02:14:51.000+00:00',
    featuredAt: '2024-02-14T02:14:51.000+00:00',
    unfeaturedAt: null,
  },
  {
    projectName: 'Active Featured Project 4',
    type: 'playlab',
    status: FeaturedProjectStatus.active,
    channel: 'abcd8',
    publishedAt: '2022-12-16T02:14:51.000+00:00',
    featuredAt: '2023-12-16T02:14:51.000+00:00',
    unfeaturedAt: null,
  },
];

export const stubFakeArchivedFeaturedProjectData = [
  {
    projectName: 'Archived Featured Project 1',
    type: 'gamelab',
    status: FeaturedProjectStatus.archived,
    channel: 'abcd1',
    publishedAt: '2020-02-16T02:14:51.000+00:00',
    featuredAt: '2023-02-16T02:14:51.000+00:00',
    unfeaturedAt: '2024-02-16T02:14:51.000+00:00',
  },
  {
    projectName: 'Archived Featured Project 2',
    type: 'applab',
    status: FeaturedProjectStatus.archived,
    channel: 'abcd2',
    publishedAt: '2020-02-16T02:14:51.000+00:00',
    featuredAt: '2023-01-16T02:14:51.000+00:00',
    unfeaturedAt: '2024-02-16T02:14:51.000+00:00',
  },
  {
    projectName:
      "Archived Featured Project 3 has a super extra long name let's see how it looks in the table",
    type: 'artist',
    status: FeaturedProjectStatus.archived,
    channel: 'abcd3',
    publishedAt: '2020-02-16T02:14:51.000+00:00',
    featuredAt: '2022-02-16T02:14:51.000+00:00',
    unfeaturedAt: '2024-02-16T02:14:51.000+00:00',
  },
  {
    projectName: 'Archived Featured Project 4',
    type: 'playlab',
    status: FeaturedProjectStatus.archived,
    channel: 'abcd4',
    publishedAt: '2019-02-16T02:14:51.000+00:00',
    featuredAt: '2022-02-12T02:14:51.000+00:00',
    unfeaturedAt: '2024-02-16T02:14:51.000+00:00',
  },
];

export const stubFakeBookmarkedFeaturedProjectData = [
  {
    projectName: 'Bookmarked Featured Project 1',
    type: 'gamelab',
    status: FeaturedProjectStatus.bookmarked,
    channel: 'abcd9',
    publishedAt: '2020-02-16T02:14:51.000+00:00',
    featuredAt: null,
    unfeaturedAt: null,
  },
  {
    projectName: 'Bookmarked Featured Project 2',
    type: 'applab',
    status: FeaturedProjectStatus.bookmarked,
    channel: 'abcd10',
    publishedAt: '2020-02-16T02:14:51.000+00:00',
    featuredAt: null,
    unfeaturedAt: null,
  },
  {
    projectName:
      "Bookmarked Project 3 has a super extra long name let's see how it looks in the table",
    type: 'artist',
    status: FeaturedProjectStatus.bookmarked,
    channel: 'abcd11',
    publishedAt: '2020-02-16T02:14:51.000+00:00',
    featuredAt: null,
    unfeaturedAt: null,
  },
  {
    projectName: 'Bookmarked Project 4',
    type: 'playlab',
    status: FeaturedProjectStatus.bookmarked,
    channel: 'abcd12',
    publishedAt: '2020-02-16T02:14:51.000+00:00',
    featuredAt: null,
    unfeaturedAt: null,
  },
];

export const stubFakeProjectLibraryData = [
  {
    name: 'Project w/ a Library',
    type: 'applab',
    channel: 'abc123',
    publishedAt: '2015-12-31T23:59:59.999-08:00',
    libraryName: 'My Cool Library',
  },
  {
    name: 'Another Project Library',
    type: 'applab',
    channel: 'def456',
    publishedAt: '2016-10-31T23:59:59.999-08:00',
    libraryName: 'My Other Library',
  },
];
