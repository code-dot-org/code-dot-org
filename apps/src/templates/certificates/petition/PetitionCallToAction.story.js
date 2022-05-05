import React from 'react';
import PetitionCallToAction from '@cdo/apps/templates/certificates/petition/PetitionCallToAction';

export default storybook => {
  return storybook
    .storiesOf('Congrats/PetitionCallToAction', module)
    .add('Default', () => <PetitionCallToAction />);
};
