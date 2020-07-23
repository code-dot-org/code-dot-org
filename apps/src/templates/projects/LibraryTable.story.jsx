import React from 'react';
import {action} from '@storybook/addon-actions';
import {UnconnectedLibraryTable as LibraryTable} from './LibraryTable';

const personalProjectsList = [
  {
    id: '1',
    channel: 'abc123',
    type: 'applab',
    libraryName: 'My First Library',
    name: 'Library Project',
    libraryDescription:
      'A really, really long description that should be truncated!',
    libraryPublishedAt: 1575586799000 // Random epoch timestamp in the past
  },
  {
    id: '2',
    channel: 'def456',
    type: 'applab',
    libraryName: 'New Library',
    name: 'Library Project V2',
    libraryDescription: 'A second try',
    libraryPublishedAt: Date.now()
  },
  // This project does not have a library so it *should not* be displayed in the table.
  {
    id: '3',
    channel: 'ghi789',
    type: 'applab',
    name: 'Library Project V2'
  }
];

const DEFAULT_PROPS = {
  personalProjectsList,
  unpublishProjectLibrary: action('unpublishing')
};

export default storybook => {
  storybook
    .storiesOf('Projects/LibraryTable', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Libraries',
        description: 'Table of currently published project libraries',
        story: () => <LibraryTable {...DEFAULT_PROPS} />
      },
      {
        name: 'No libraries',
        description: 'Display when the user has no published project libraries',
        story: () => (
          <LibraryTable {...DEFAULT_PROPS} personalProjectsList={[]} />
        )
      }
    ]);
};
