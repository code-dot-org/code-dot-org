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

export function generateFakePersonalProjectsForTable(n) {
  return _.range(n).map(i => (
    {
      name: "Personal " + i,
      updatedAt: '2016-12-31T23:59:59.999-08:00',
      projectType: 'gamelab',
      id: 'abcd' + i.toString(),
      isPublished: Math.random() >= 0.5
    }
  ));
}

export const stubFakePersonalProjectData = [
  {
    name: "Personal Project 1",
    updatedAt: '2016-12-31T23:59:59.999-08:00',
    projectType: 'gamelab',
    id: 'abcd1',
    publishedAt: "2017-05-16T15:22:30.000-07:00"
  },
  {
    name: "Personal Project 2",
    updatedAt: '2016-11-30T23:59:59.999-08:00',
    projectType: 'applab',
    id: 'abcd2',
    publishedAt: null
  },
  {
    name: "Personal Project 3",
    updatedAt: '2016-10-31T23:59:59.999-08:00',
    projectType: 'artist',
    id: 'abcd3',
    publishedAt: "2017-05-16T15:22:30.000-07:00"
  },
  {
    name: "Personal Project 4",
    updatedAt: '2016-09-14T23:59:59.999-08:00',
    projectType: 'playlab',
    id: 'abcd4',
    publishedAt: null
  },
];
