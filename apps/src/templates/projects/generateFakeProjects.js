import _ from 'lodash';

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
    status: 'active',
    channel: 'abcd5',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: 'null',
  },
  {
    projectName: 'Active Featured Project 2',
    type: 'applab',
    status: 'active',
    channel: 'abcd6',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: 'null',
  },
  {
    projectName:
      "Active Featured Project 3 has a super extra long name let's see how it looks in the table",
    type: 'artist',
    status: 'active',
    channel: 'abcd7',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: 'null',
  },
  {
    projectName: 'Active Featured Project 4',
    type: 'playlab',
    status: 'active',
    channel: 'abcd8',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: 'null',
  },
];

export const stubFakeArchivedFeaturedProjectData = [
  {
    projectName: 'Archived Featured Project 1',
    type: 'gamelab',
    status: 'archived',
    channel: 'abcd1',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: '2017-12-31T23:59:59.999-08:00',
  },
  {
    projectName: 'Archived Featured Project 2',
    type: 'applab',
    status: 'archived',
    channel: 'abcd2',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: '2017-12-31T23:59:59.999-08:00',
  },
  {
    projectName:
      "Archived Featured Project 3 has a super extra long name let's see how it looks in the table",
    type: 'artist',
    status: 'archived',
    channel: 'abcd3',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: '2017-12-31T23:59:59.999-08:00',
  },
  {
    projectName: 'Archived Featured Project 4',
    type: 'playlab',
    status: 'archived',
    channel: 'abcd4',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: '2017-12-31T23:59:59.999-08:00',
  },
];

export const stubFakeBookmarkedFeaturedProjectData = [
  {
    projectName: 'Bookmarked Featured Project 1',
    type: 'gamelab',
    status: 'bookmarked',
    channel: 'abcd9',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: 'null',
    unfeaturedAt: 'null',
  },
  {
    projectName: 'Bookmarked Featured Project 2',
    type: 'applab',
    status: 'bookmarked',
    channel: 'abcd10',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: 'null',
    unfeaturedAt: 'null',
  },
  {
    projectName:
      "Saved Bookmarked Project 3 has a super extra long name let's see how it looks in the table",
    type: 'artist',
    status: 'bookmarked',
    channel: 'abcd11',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: 'null',
    unfeaturedAt: 'null',
  },
  {
    projectName: 'Saved Bookmarked Project 4',
    type: 'playlab',
    status: 'bookmarked',
    channel: 'abcd12',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: 'null',
    unfeaturedAt: 'null',
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
