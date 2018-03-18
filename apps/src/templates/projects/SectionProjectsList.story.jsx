import React from 'react';
import SectionProjectsList from './SectionProjectsList';

const STUB_PROJECTS_DATA = [
  {
    channel: 'ABCDEFGHIJKLM01234',
    name: 'Antelope Freeway',
    studentName: 'Alice',
    type: 'applab',
    updatedAt: '2016-12-31T23:59:59.999-08:00'
  },
  {
    channel: 'AAAABBBBCCCCDDDDEE',
    name: 'Cats and Kittens',
    studentName: 'Charlie',
    thumbnailUrl: '/media/common_images/stickers/cat.png',
    type: 'weblab',
    updatedAt: '2016-11-30T00:00:00.001-08:00'
  },
  {
    channel: 'NOPQRSTUVWXYZ567879',
    name: 'Batyote',
    studentName: 'Bob',
    thumbnailUrl: '/media/common_images/stickers/bat.png',
    type: 'gamelab',
    updatedAt: '2017-01-01T00:00:00.001-08:00'
  },
];

export default storybook => {
  return storybook
    .storiesOf('Projects/SectionProjectsList', module)
    .withExperiments('showProjectThumbnails')
    .addStoryTable([
      {
        name: 'basic section projects list without thumbnail column',
        description: `This is a simple section projects list with stub data.`,
        story: () => {
          return (
            <SectionProjectsList
              projectsData={STUB_PROJECTS_DATA}
              studioUrlPrefix={'https://studio.code.org'}
              showProjectThumbnails={false}
            />
          );
        }
      },
      {
        name: 'basic section projects list with thumbnail column',
        description: `This is a simple section projects list with stub data.`,
        story: () => {
          return (
            <SectionProjectsList
              projectsData={STUB_PROJECTS_DATA}
              studioUrlPrefix={'https://studio.code.org'}
              showProjectThumbnails={true}
            />
          );
        }
      },
    ]);
};
