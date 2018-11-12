import React from 'react';
import { UnconnectedSignInOrAgeDialog as SignInOrAgeDialog } from './SignInOrAgeDialog';

export default storybook => {
  return storybook
    .storiesOf('SignInOrAgeDialog', module)
    .addStoryTable([
      {
        name:'SignInOrAgeDialog',
        story: () => (
          <SignInOrAgeDialog
            signedIn={false}
            age13Required={true}
          />
        )
      }
    ]);
};
