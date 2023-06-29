import React from 'react';
import LoginTypeCard from './LoginTypeCard';
import {action} from '@storybook/addon-actions';

export default {
  name: 'LoginTypeCard',
  component: LoginTypeCard,
};

export const WithSubtitle = () => (
  <LoginTypeCard
    title="Picture logins"
    subtitle="Recommended for ages 5 - 8"
    description="You will create accounts for your students. Students will log in with a secret picture."
    onClick={action('onClick')}
  />
);

export const WithoutSubtitle = () => (
  <LoginTypeCard
    title="Google Classroom"
    description="Sync your Code.org section with an existing Google Classroom."
    onClick={action('onClick')}
  />
);
