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

export const stubFakePersonalProjectData = [
  {
    name: "Personal Project 1",
    updatedAt: '2015-12-31T23:59:59.999-08:00',
    type: 'gamelab',
    channel: 'abcd1',
    isPublished: true
  },
  {
    name: "Personal Project 2",
    updatedAt: '2016-11-30T23:59:59.999-08:00',
    type: 'applab',
    channel: 'abcd2',
    isPublished: false
  },
  {
    name: "Personal Project 3 has a super extra long name let's see how it looks in the table",
    updatedAt: '2016-10-31T23:59:59.999-08:00',
    type: 'artist',
    channel: 'abcd3',
    isPublished: true
  },
  {
    name: "Personal Project 4",
    updatedAt: '2016-09-14T23:59:59.999-08:00',
    type: 'playlab',
    channel: 'abcd4',
    isPublished: false
  },
];
