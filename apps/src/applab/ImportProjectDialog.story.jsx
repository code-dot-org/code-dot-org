import React from 'react';
import {ImportProjectDialog} from './ImportProjectDialog';
import {action} from '@storybook/addon-actions';

export default storybook => {
    storybook
      .storiesOf('ImportProjectDialog', module)
      .addStoryTable([
        {
          name: 'On open',
          story: () => (
            <ImportProjectDialog
              hideBackdrop
              onImport={action("onImport")}
            />
          )
        }, {
          name: 'While fetching',
          story: () => (
            <ImportProjectDialog
              hideBackdrop
              isFetching
              onImport={action("onImport")}
            />
          )
        }, {
          name: 'Error Fetching',
          story: () => (
            <ImportProjectDialog
              hideBackdrop
              error
              onImport={action("onImport")}
            />
          )
        },
      ]);
  };
