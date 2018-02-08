import _ from 'lodash';

// Generate n fake personal projects for the project widget.
// updatedAt data is normally a timestamp, but for storybook
// display purposes, use a descriptive string
export function generateFakePersonalProjects(n) {
  return _.range(n).map(i => (
    {
      name: "Personal " + i,
      updatedAt: 'a day ago',
      projectType: 'gamelab',
      id: 'abcd'
    }
  ));
}

export const stubFakeFeaturedProjectData = [
  {
    projectName: "Featured Project 1",
    type: 'gamelab',
    channel: 'abcd5',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: 'null',
    featured: true
  },
  {
    projectName: "Featured Project 2",
    type: 'applab',
    channel: 'abcd6',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: 'null',
    featured: true
  },
  {
    projectName: "Featured Project 3 has a super extra long name let's see how it looks in the table",
    type: 'artist',
    channel: 'abcd7',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: 'null',
    featured: true
  },
  {
    projectName: "Featured Project 4",
    type: 'playlab',
    channel: 'abcd8',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: 'null',
    featured: true
  },
];

export const stubFakeUnfeaturedProjectData = [
  {
    projectName: "Unfeatured Project 1",
    type: 'gamelab',
    channel: 'abcd1',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: '2017-12-31T23:59:59.999-08:00',
    featured: false
  },
  {
    projectName: "Unfeatured Project 2",
    type: 'applab',
    channel: 'abcd2',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: '2017-12-31T23:59:59.999-08:00',
    featured: false
  },
  {
    projectName: "Unfeatured Project 3 has a super extra long name let's see how it looks in the table",
    type: 'artist',
    channel: 'abcd3',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: '2017-12-31T23:59:59.999-08:00',
    featured: false
  },
  {
    projectName: "Unfeatured Project 4",
    type: 'playlab',
    channel: 'abcd4',
    publishedAt: '2015-02-04T23:59:59.999-08:00',
    featuredAt: '2016-12-31T23:59:59.999-08:00',
    unfeaturedAt: '2017-12-31T23:59:59.999-08:00',
    featured: false
  },
];
