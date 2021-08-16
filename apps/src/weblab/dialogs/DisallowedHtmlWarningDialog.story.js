import React from 'react';
import {action} from '@storybook/addon-actions';
import DisallowedHtmlWarningDialog from './DisallowedHtmlWarningDialog';

const DEFAULT_PROPS = {
  isOpen: true,
  filename: 'index.html',
  handleClose: action('close'),
  hideBackdrop: true
};

export default storybook => {
  storybook
    .storiesOf('Weblab/dialogs/DisallowedHtmlWarningDialog', module)
    .addStoryTable([
      {
        name: 'single disallowed HTML tags',
        story: () => (
          <DisallowedHtmlWarningDialog
            {...DEFAULT_PROPS}
            disallowedTags={['script']}
          />
        )
      },
      {
        name: 'multiple disallowed HTML tags',
        story: () => (
          <DisallowedHtmlWarningDialog
            {...DEFAULT_PROPS}
            disallowedTags={['script', 'meta[http-equiv]']}
          />
        )
      }
    ]);
};
