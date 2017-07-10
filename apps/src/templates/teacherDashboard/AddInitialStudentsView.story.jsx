import React from 'react';
import AddInitialStudentsView from './AddInitialStudentsView';

export default storybook => storybook
    .storiesOf('AddInitialStudentsView', module)
    .add('All options', () => (
      <AddInitialStudentsView/>
    ));
