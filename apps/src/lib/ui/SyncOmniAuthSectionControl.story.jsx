import React from 'react';
import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import {
  SyncOmniAuthSectionButton,
  READY,
  IN_PROGRESS,
  SUCCESS,
  FAILURE
} from './SyncOmniAuthSectionControl';
import {action} from '@storybook/addon-actions';

export default storybook => {
  const stories = [];
  [OAuthSectionTypes.clever, OAuthSectionTypes.google_classroom].forEach(
    provider => {
      [READY, IN_PROGRESS, SUCCESS, FAILURE].forEach(buttonState => {
        stories.push({
          name: `Sync ${provider} - ${buttonState}`,
          story: () => (
            <SyncOmniAuthSectionButton
              provider={provider}
              buttonState={buttonState}
              onClick={action('click')}
            />
          )
        });
      });
    }
  );

  return storybook
    .storiesOf('SyncOmniAuthSectionButton', module)
    .addStoryTable(stories);
};
