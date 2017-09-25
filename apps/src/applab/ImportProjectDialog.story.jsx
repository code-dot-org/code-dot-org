import React from 'react';
import {ImportProjectDialog} from './ImportProjectDialog';

export default storybook => {
    storybook
      .storiesOf('ImportProjectDialog', module)
      .addStoryTable([
        {
          name: 'On open',
          story: () => (
            <ImportProjectDialog
              hideBackdrop
              onImport={storybook.action("onImport")}
            />
          )
        }, {
          name: 'While fetching',
          story: () => (
            <ImportProjectDialog
              hideBackdrop
              isFetching
              onImport={storybook.action("onImport")}
            />
          )
        }, {
          name: 'Error Fetching',
          story: () => (
            <ImportProjectDialog
              hideBackdrop
              error
              onImport={storybook.action("onImport")}
            />
          )
        },
      ]);
  };
