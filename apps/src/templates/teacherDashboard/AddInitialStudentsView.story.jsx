import React from 'react';
import experiments from '../../util/experiments';
import AddInitialStudentsView from './AddInitialStudentsView';

export default storybook => storybook
  .storiesOf('AddInitialStudentsView', module)
  .add('Basic options', () => {
    experiments.setEnabled('googleClassroom', false);
    experiments.setEnabled('microsoftClassroom', false);
    experiments.setEnabled('clever', false);
    return (
      <AddInitialStudentsView
        sectionName="Section Alpha"
        handleLoginChoice={storybook.action('handleLoginChoice')}
        handleCancel={storybook.action('handleCancel')}
      />
    );
  })
  .add('All options', () => {
    experiments.setEnabled('googleClassroom', true);
    experiments.setEnabled('microsoftClassroom', true);
    experiments.setEnabled('clever', true);
    return (
      <AddInitialStudentsView
        sectionName="Section Beta"
        handleLoginChoice={storybook.action('handleLoginChoice')}
        handleCancel={storybook.action('handleCancel')}
      />
    );
  });
