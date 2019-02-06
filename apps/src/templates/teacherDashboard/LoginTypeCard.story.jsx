import React from 'react';
import LoginTypeCard from './LoginTypeCard';
import {action} from '@storybook/addon-actions';

export default storybook => storybook
    .storiesOf('Cards/LoginTypeCard', module)
    .addStoryTable([
      {
        name: 'With age recommendation',
        description: 'Used for picture/word/email logins',
        story: () => (
          <LoginTypeCard
            title="Picture logins"
            subtitle="Recommended for ages 5 - 8"
            description="You will create accounts for your students. Students will log in with a secret picture."
            onClick={action('onClick')}
          />
        )
      },
      {
        name: 'Without age recommendation',
        description: 'Used for third party sync options',
        story: () => (
          <LoginTypeCard
            title="Google Classroom"
            description="Sync your Code.org section with an existing Google Classroom."
            onClick={action('onClick')}
          />
        )
      },
    ]);
