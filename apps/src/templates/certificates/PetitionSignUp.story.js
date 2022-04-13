import React from 'react';
import PetitionSignUp from '@cdo/apps/templates/certificates/PetitionSignUp';

export default storybook => {
  return storybook
    .storiesOf('Congrats/PetitionSignUp', module)
    .add('Default', () => <PetitionSignUp />);
};
