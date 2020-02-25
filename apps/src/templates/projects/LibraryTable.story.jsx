import React from 'react';
import {UnconnectedLibraryTable as LibraryTable} from './LibraryTable';

const libraries = [
  {
    libraryName: 'My First Library',
    name: 'Library Project',
    libraryDescription:
      'A really, really long description that should be truncated!',
    libraryPublishedAt: 1575586799000 // Random epoch timestamp in the past
  },
  {
    libraryName: 'New Library',
    name: 'Library Project V2',
    libraryDescription: 'A second try',
    libraryPublishedAt: Date.now()
  }
];

export default storybook => {
  storybook
    .storiesOf('Projects/LibraryTable', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Libraries',
        description: 'Table of currently published project libraries',
        story: () => <LibraryTable libraries={libraries} />
      },
      {
        name: 'No libraries',
        description: 'Display when the user has no published project libraries',
        story: () => <LibraryTable libraries={[]} />
      }
    ]);
};
